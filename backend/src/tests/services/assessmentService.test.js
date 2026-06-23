const { createPrismaMock } = require("../utils/prismaMock");
const { mockStudent, mockAssessment, mockSupervisor } = require("../utils/testFactory");

jest.mock("../../config/prisma", () => {
  const { createPrismaMock } = require("../utils/prismaMock");
  const mock = createPrismaMock();
  return {
    getPrismaClient: jest.fn(() => mock),
  };
});

jest.mock("../../utils/helpers", () => ({
  catchAsync: jest.fn((fn) => fn),
  parsePagination: jest.fn(() => ({ page: 1, limit: 10, skip: 0 })),
  buildPaginationMeta: jest.fn(() => ({ page: 1, limit: 10, total: 1, pages: 1 })),
}));

jest.mock("../../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

jest.mock("../../services/notificationService", () => ({
  createNotification: jest.fn(),
}));

describe("TC006 - Supervisor Assessment", () => {
  let mockPrisma;

  beforeAll(() => {
    const { getPrismaClient } = require("../../config/prisma");
    mockPrisma = getPrismaClient();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createAssessment", () => {
    const { createAssessment } = require("../../services/assessment/createAssessment");
    const assessmentData = {
      student: "student-123",
      type: "industrial",
      scores: {
        technical: 80,
        communication: 75,
        punctuality: 90,
        initiative: 70,
        teamwork: 85,
      },
    };

    it("creates an assessment successfully", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({ user: { firstName: "Test", lastName: "User", email: "test@test.com" } }),
      );
      mockPrisma.supervisor.findUnique.mockResolvedValue(
        mockSupervisor({
          assignedStudents: [{ studentId: "student-123" }],
        }),
      );
      mockPrisma.assessment.findFirst.mockResolvedValue(null);
      mockPrisma.assessment.create.mockResolvedValue(
        mockAssessment({ status: "pending" }),
      );

      const result = await createAssessment(assessmentData, "supervisor-123");

      expect(result).toHaveProperty("id", "assessment-123");
      expect(mockPrisma.assessment.create).toHaveBeenCalled();
    });

    it("rejects non-existent student", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(null);

      await expect(
        createAssessment(assessmentData, "supervisor-123"),
      ).rejects.toMatchObject({ statusCode: 404, message: expect.stringContaining("Student not found") });
    });

    it("rejects non-existent supervisor", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({ user: { firstName: "Test", lastName: "User" } }),
      );
      mockPrisma.supervisor.findUnique.mockResolvedValue(null);

      await expect(
        createAssessment(assessmentData, "supervisor-123"),
      ).rejects.toMatchObject({ statusCode: 404, message: expect.stringContaining("Supervisor not found") });
    });

    it("rejects if supervisor not assigned to student", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({ user: { firstName: "Test", lastName: "User" } }),
      );
      mockPrisma.supervisor.findUnique.mockResolvedValue(
        mockSupervisor({ assignedStudents: [{ studentId: "other-student" }] }),
      );

      await expect(
        createAssessment(assessmentData, "supervisor-123"),
      ).rejects.toMatchObject({ statusCode: 403, message: expect.stringContaining("not assigned") });
    });

    it("rejects duplicate assessment type", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({ user: { firstName: "Test", lastName: "User" } }),
      );
      mockPrisma.supervisor.findUnique.mockResolvedValue(
        mockSupervisor({
          assignedStudents: [{ studentId: "student-123" }],
        }),
      );
      mockPrisma.assessment.findFirst.mockResolvedValue(mockAssessment());

      await expect(
        createAssessment(assessmentData, "supervisor-123"),
      ).rejects.toMatchObject({ statusCode: 409, message: expect.stringContaining("already exists") });
    });
  });

  describe("getAssessments", () => {
    const { getAssessments } = require("../../services/assessment/getAssessments");

    it("returns paginated assessments", async () => {
      mockPrisma.assessment.findMany.mockResolvedValue([mockAssessment()]);
      mockPrisma.assessment.count.mockResolvedValue(1);

      const result = await getAssessments({}, { page: 1, limit: 10 });

      expect(result.assessments).toHaveLength(1);
      expect(result.pagination).toHaveProperty("total", 1);
    });
  });

  describe("getAssessmentById", () => {
    const { getAssessmentById } = require("../../services/assessment/getAssessmentById");

    it("returns assessment by id", async () => {
      mockPrisma.assessment.findUnique.mockResolvedValue(mockAssessment());

      const result = await getAssessmentById("assessment-123");
      expect(result).toHaveProperty("id", "assessment-123");
    });

    it("rejects non-existent assessment", async () => {
      mockPrisma.assessment.findUnique.mockResolvedValue(null);

      await expect(getAssessmentById("invalid-id")).rejects.toMatchObject({ statusCode: 404, message: expect.stringContaining("not found") });
    });
  });

  // --- Edge cases ---

  describe("createAssessment edge cases", () => {
    const { createAssessment } = require("../../services/assessment/createAssessment");

    it("accepts score boundary values (0 and 100)", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({ user: { firstName: "Test", lastName: "User", email: "test@test.com" } }),
      );
      mockPrisma.supervisor.findUnique.mockResolvedValue(
        mockSupervisor({ assignedStudents: [{ studentId: "student-123" }] }),
      );
      mockPrisma.assessment.findFirst.mockResolvedValue(null);
      mockPrisma.assessment.create.mockResolvedValue(mockAssessment({ status: "pending" }));

      const result = await createAssessment(
        {
          student: "student-123",
          type: "departmental",
          scores: { technical: 0, communication: 100, punctuality: 50, initiative: 50, teamwork: 50 },
        },
        "supervisor-123",
      );
      expect(result).toBeDefined();
    });

    it("handles missing optional scores", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({ user: { firstName: "Test", lastName: "User", email: "test@test.com" } }),
      );
      mockPrisma.supervisor.findUnique.mockResolvedValue(
        mockSupervisor({ assignedStudents: [{ studentId: "student-123" }] }),
      );
      mockPrisma.assessment.findFirst.mockResolvedValue(null);
      mockPrisma.assessment.create.mockResolvedValue(mockAssessment({ status: "pending" }));

      const result = await createAssessment(
        { student: "student-123", type: "industrial" },
        "supervisor-123",
      );
      expect(result).toBeDefined();
    });

    it("handles visitId when visit exists for the student", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({ user: { firstName: "Test", lastName: "User", email: "test@test.com" } }),
      );
      mockPrisma.supervisor.findUnique.mockResolvedValue(
        mockSupervisor({ assignedStudents: [{ studentId: "student-123" }] }),
      );
      mockPrisma.assessment.findFirst.mockResolvedValue(null);
      mockPrisma.visit.findUnique.mockResolvedValue({ id: "visit-123", studentId: "student-123" });
      mockPrisma.assessment.create.mockResolvedValue(mockAssessment({ status: "pending" }));

      const result = await createAssessment(
        { student: "student-123", type: "industrial", visitId: "visit-123", scores: {} },
        "supervisor-123",
      );
      expect(result).toBeDefined();
    });

    it("rejects visitId that belongs to different student", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({ user: { firstName: "Test", lastName: "User", email: "test@test.com" } }),
      );
      mockPrisma.supervisor.findUnique.mockResolvedValue(
        mockSupervisor({ assignedStudents: [{ studentId: "student-123" }] }),
      );
      mockPrisma.visit.findUnique.mockResolvedValue({ id: "visit-123", studentId: "other-student" });

      await expect(
        createAssessment(
          { student: "student-123", type: "industrial", visitId: "visit-123", scores: {} },
          "supervisor-123",
        ),
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("Visit does not belong") });
    });

    it("rejects non-existent visitId", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({ user: { firstName: "Test", lastName: "User", email: "test@test.com" } }),
      );
      mockPrisma.supervisor.findUnique.mockResolvedValue(
        mockSupervisor({ assignedStudents: [{ studentId: "student-123" }] }),
      );
      mockPrisma.visit.findUnique.mockResolvedValue(null);

      await expect(
        createAssessment(
          { student: "student-123", type: "industrial", visitId: "invalid-visit", scores: {} },
          "supervisor-123",
        ),
      ).rejects.toMatchObject({ statusCode: 404, message: expect.stringContaining("Visit not found") });
    });

    it("handles notification failure gracefully", async () => {
      const { createNotification } = require("../../services/notificationService");
      createNotification.mockRejectedValue(new Error("Notification failed"));

      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({ user: { firstName: "Test", lastName: "User", email: "test@test.com" } }),
      );
      mockPrisma.supervisor.findUnique.mockResolvedValue(
        mockSupervisor({ assignedStudents: [{ studentId: "student-123" }] }),
      );
      mockPrisma.assessment.findFirst.mockResolvedValue(null);
      mockPrisma.assessment.create.mockResolvedValue(mockAssessment({ status: "pending" }));

      const result = await createAssessment(
        { student: "student-123", type: "industrial", scores: { technical: 80 } },
        "supervisor-123",
      );
      expect(result).toBeDefined(); // Should succeed despite notification failure
    });
  });

  describe("getAssessments edge cases", () => {
    const { getAssessments } = require("../../services/assessment/getAssessments");

    it("returns empty list when no assessments exist", async () => {
      mockPrisma.assessment.findMany.mockResolvedValue([]);
      mockPrisma.assessment.count.mockResolvedValue(0);
      const { buildPaginationMeta } = require("../../utils/helpers");
      buildPaginationMeta.mockReturnValue({ page: 1, limit: 10, total: 0, pages: 0 });

      const result = await getAssessments({}, { page: 1, limit: 10 });
      expect(result.assessments).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it("filters by student id", async () => {
      mockPrisma.assessment.findMany.mockResolvedValue([mockAssessment()]);
      mockPrisma.assessment.count.mockResolvedValue(1);

      const result = await getAssessments({ studentId: "student-123" }, { page: 1, limit: 10 });
      expect(result.assessments).toHaveLength(1);
    });

    it("filters by status", async () => {
      mockPrisma.assessment.findMany.mockResolvedValue([mockAssessment({ status: "completed" })]);
      mockPrisma.assessment.count.mockResolvedValue(1);

      const result = await getAssessments({ status: "completed" }, { page: 1, limit: 10 });
      expect(result.assessments).toHaveLength(1);
    });
  });
});
