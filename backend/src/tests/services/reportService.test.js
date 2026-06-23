const { createPrismaMock } = require("../utils/prismaMock");
const { mockDepartment, mockFaculty, mockStudent, mockPlacement, mockLogbook, mockAssessment, mockSupervisor } = require("../utils/testFactory");

jest.mock("../../config/prisma", () => {
  const { createPrismaMock } = require("../utils/prismaMock");
  const mock = createPrismaMock();
  return {
    getPrismaClient: jest.fn(() => mock),
  };
});

jest.mock("../../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

jest.mock("../../utils/reportExport", () => ({
  createCsvBuffer: jest.fn(() => Buffer.from("csv data")),
  createPdfBuffer: jest.fn(() => Buffer.from("pdf data")),
}));

jest.mock("../../services/assessment/systemScore", () => ({
  calculateSystemContinuousScore: jest.fn(() => 75),
}));

describe("TC007 - Report Generation", () => {
  let mockPrisma;

  beforeAll(() => {
    const { getPrismaClient } = require("../../config/prisma");
    mockPrisma = getPrismaClient();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getDepartmentStatistics", () => {
    const { getDepartmentStatistics } = require("../../services/reportService");

    it("returns department statistics", async () => {
      mockPrisma.department.findUnique.mockResolvedValue(mockDepartment());
      mockPrisma.student.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(75);
      mockPrisma.placement.count.mockResolvedValue(10);
      mockPrisma.supervisor.count.mockResolvedValue(15);
      mockPrisma.assessment.count.mockResolvedValue(60);

      const result = await getDepartmentStatistics("dept-123");

      expect(result.department).toHaveProperty("id", "dept-123");
      expect(result.statistics).toHaveProperty("totalStudents", 100);
      expect(result.statistics).toHaveProperty("placedStudents", 75);
      expect(result.statistics).toHaveProperty("unplacedStudents", 25);
      expect(result.statistics).toHaveProperty("placementRate", "75.00");
    });

    it("rejects non-existent department", async () => {
      mockPrisma.department.findUnique.mockResolvedValue(null);

      await expect(
        getDepartmentStatistics("invalid-id"),
      ).rejects.toMatchObject({ statusCode: 404, message: expect.stringContaining("Department not found") });
    });
  });

  describe("getFacultyStatistics", () => {
    const { getFacultyStatistics } = require("../../services/reportService");

    it("returns faculty statistics", async () => {
      mockPrisma.faculty.findUnique.mockResolvedValue(
        mockFaculty({ departments: [mockDepartment()] }),
      );
      mockPrisma.student.count
        .mockResolvedValueOnce(200)
        .mockResolvedValueOnce(150);
      mockPrisma.supervisor.count.mockResolvedValue(25);

      const result = await getFacultyStatistics("fac-123");

      expect(result.faculty).toHaveProperty("id", "fac-123");
      expect(result.statistics).toHaveProperty("totalDepartments", 1);
      expect(result.statistics).toHaveProperty("totalStudents", 200);
      expect(result.statistics).toHaveProperty("placedStudents", 150);
      expect(result.statistics).toHaveProperty("placementRate", "75.00");
    });
  });

  describe("getInstitutionalOverview", () => {
    const { getInstitutionalOverview } = require("../../services/reportService");

    it("returns institutional overview", async () => {
      mockPrisma.faculty.count.mockResolvedValue(5);
      mockPrisma.department.count.mockResolvedValue(12);
      mockPrisma.student.count
        .mockResolvedValueOnce(1000)
        .mockResolvedValueOnce(700);
      mockPrisma.supervisor.count.mockResolvedValue(50);
      mockPrisma.placement.count
        .mockResolvedValueOnce(80)
        .mockResolvedValueOnce(700);
      mockPrisma.assessment.count.mockResolvedValue(500);
      mockPrisma.placement.findMany.mockResolvedValue([
        { approvedAt: new Date("2026-01-15") },
        { approvedAt: new Date("2026-02-10") },
        { approvedAt: new Date("2026-02-20") },
      ]);

      const result = await getInstitutionalOverview();

      expect(result.overview).toHaveProperty("totalFaculties", 5);
      expect(result.overview).toHaveProperty("totalStudents", 1000);
      expect(result.overview).toHaveProperty("placementRate", "70.00");
      expect(result.trends).toHaveProperty("placementsByMonth");
    });
  });

  describe("getStudentProgressReport", () => {
    const { getStudentProgressReport } = require("../../services/reportService");

    it("returns student progress report", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({
          user: { id: "user-123", firstName: "Test", lastName: "User", email: "test@test.com" },
          trainingStartDate: new Date("2025-01-01"),
          trainingEndDate: new Date("2025-12-31"),
        }),
      );
      mockPrisma.placement.findFirst.mockResolvedValue(mockPlacement());
      mockPrisma.logbook.findMany.mockResolvedValue([mockLogbook()]);
      mockPrisma.assessment.findMany.mockResolvedValue([mockAssessment()]);
      mockPrisma.systemSettings.findFirst.mockResolvedValue(null);

      const result = await getStudentProgressReport("student-123");

      expect(result).toHaveProperty("student");
      expect(result).toHaveProperty("logbookStats");
    });

    it("rejects non-existent student", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(null);

      await expect(
        getStudentProgressReport("invalid-id"),
      ).rejects.toMatchObject({ statusCode: 404, message: expect.stringContaining("not found") });
    });
  });

  describe("getSupervisorPerformanceReport", () => {
    const { getSupervisorPerformanceReport } = require("../../services/reportService");

    it("returns supervisor performance report", async () => {
      mockPrisma.supervisor.findUnique.mockResolvedValue(
        mockSupervisor({
          assignedStudents: [{ studentId: "student-123" }],
        }),
      );
      mockPrisma.logbook.count.mockResolvedValueOnce(20);
      mockPrisma.logbookReview.count.mockResolvedValueOnce(15);
      mockPrisma.assessment.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(8);

      const result = await getSupervisorPerformanceReport("supervisor-123");

      expect(result).toHaveProperty("supervisor");
      expect(result.statistics).toHaveProperty("logbookReviewRate", "75.00");
      expect(result.statistics).toHaveProperty("assessmentCompletionRate", "80.00");
    });

    it("rejects non-existent supervisor", async () => {
      mockPrisma.supervisor.findUnique.mockResolvedValue(null);

      await expect(
        getSupervisorPerformanceReport("invalid-id"),
      ).rejects.toMatchObject({ statusCode: 404, message: expect.stringContaining("not found") });
    });
  });

  describe("getPlacementReport", () => {
    const { getPlacementReport } = require("../../services/reportService");

    it("returns placement report with statistics", async () => {
      mockPrisma.placement.findMany.mockResolvedValue([
        mockPlacement({ status: "approved", industryPartner: { name: "Tech Corp" } }),
        mockPlacement({ status: "pending", industryPartner: null }),
      ]);

      const result = await getPlacementReport({});

      expect(result).toHaveProperty("placements");
      expect(result.placements).toHaveLength(2);
      expect(result.statistics).toHaveProperty("total", 2);
      expect(result.statistics).toHaveProperty("approved", 1);
      expect(result.statistics).toHaveProperty("pending", 1);
      expect(result).toHaveProperty("companyDistribution");
    });
  });

  // --- Edge cases ---

  describe("getDepartmentStatistics edge cases", () => {
    const { getDepartmentStatistics } = require("../../services/reportService");

    it("handles department with zero students", async () => {
      mockPrisma.department.findUnique.mockResolvedValue(mockDepartment());
      mockPrisma.student.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      mockPrisma.placement.count.mockResolvedValue(0);
      mockPrisma.supervisor.count.mockResolvedValue(0);
      mockPrisma.assessment.count.mockResolvedValue(0);

      const result = await getDepartmentStatistics("dept-123");

      expect(result.statistics.totalStudents).toBe(0);
      expect(result.statistics.placementRate).toBe(0);
    });
  });

  describe("getFacultyStatistics edge cases", () => {
    const { getFacultyStatistics } = require("../../services/reportService");

    it("handles faculty with no departments", async () => {
      mockPrisma.faculty.findUnique.mockResolvedValue(
        mockFaculty({ departments: [] }),
      );
      mockPrisma.student.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      mockPrisma.supervisor.count.mockResolvedValue(0);

      const result = await getFacultyStatistics("fac-123");
      expect(result.statistics.totalDepartments).toBe(0);
      expect(result.statistics.totalStudents).toBe(0);
    });
  });

  describe("getInstitutionalOverview edge cases", () => {
    const { getInstitutionalOverview } = require("../../services/reportService");

    it("handles empty institution data", async () => {
      mockPrisma.faculty.count.mockResolvedValue(0);
      mockPrisma.department.count.mockResolvedValue(0);
      mockPrisma.student.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      mockPrisma.supervisor.count.mockResolvedValue(0);
      mockPrisma.placement.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      mockPrisma.assessment.count.mockResolvedValue(0);
      mockPrisma.placement.findMany.mockResolvedValue([]);

      const result = await getInstitutionalOverview();

      expect(result.overview.totalStudents).toBe(0);
      expect(result.overview.placementRate).toBe(0);
      expect(result.trends.placementsByMonth).toEqual([]);
    });

    it("rejects faculty statistics for non-existent faculty", async () => {
      const { getFacultyStatistics } = require("../../services/reportService");
      mockPrisma.faculty.findUnique.mockResolvedValue(null);

      await expect(
        getFacultyStatistics("invalid-id"),
      ).rejects.toMatchObject({ statusCode: 404, message: expect.stringContaining("Faculty not found") });
    });
  });

  describe("getStudentProgressReport edge cases", () => {
    const { getStudentProgressReport } = require("../../services/reportService");

    it("handles student with no placement", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({
          user: { id: "user-123", firstName: "Test", lastName: "User", email: "test@test.com" },
          trainingStartDate: null,
          trainingEndDate: null,
        }),
      );
      mockPrisma.placement.findFirst.mockResolvedValue(null);
      mockPrisma.logbook.findMany.mockResolvedValue([]);
      mockPrisma.assessment.findMany.mockResolvedValue([]);
      mockPrisma.systemSettings.findFirst.mockResolvedValue(null);

      const result = await getStudentProgressReport("student-123");

      expect(result).toHaveProperty("student");
      expect(result.trainingProgress).toBe(0);
    });
  });

  describe("getSupervisorPerformanceReport edge cases", () => {
    const { getSupervisorPerformanceReport } = require("../../services/reportService");

    it("handles supervisor with no students assigned", async () => {
      mockPrisma.supervisor.findUnique.mockResolvedValue(
        mockSupervisor({
          assignedStudents: [],
          maxStudents: 10,
        }),
      );
      mockPrisma.logbook.count.mockResolvedValueOnce(0);
      mockPrisma.logbookReview.count.mockResolvedValueOnce(0);
      mockPrisma.assessment.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const result = await getSupervisorPerformanceReport("supervisor-123");

      expect(result.statistics.assignedStudents).toBe(0);
      expect(result.statistics.logbookReviewRate).toBe(0);
    });
  });

  describe("getPlacementReport edge cases", () => {
    const { getPlacementReport } = require("../../services/reportService");

    it("handles empty placements list", async () => {
      mockPrisma.placement.findMany.mockResolvedValue([]);

      const result = await getPlacementReport({});

      expect(result.placements).toEqual([]);
      expect(result.statistics.total).toBe(0);
      expect(result.companyDistribution).toEqual({});
    });

    it("filters by status", async () => {
      mockPrisma.placement.findMany.mockResolvedValue([mockPlacement({ status: "approved" })]);

      const result = await getPlacementReport({ status: "approved" });

      expect(result.placements).toHaveLength(1);
      expect(result.statistics.approved).toBe(1);
    });

    it("filters by date range", async () => {
      mockPrisma.placement.findMany.mockResolvedValue([mockPlacement()]);

      const result = await getPlacementReport({
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      });

      expect(result.placements).toHaveLength(1);
    });
  });
});
