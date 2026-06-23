const { createPrismaMock } = require("../utils/prismaMock");
const { mockStudent, mockPlacement, mockLogbook } = require("../utils/testFactory");

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

jest.mock("../../utils/cloudinaryUpload", () => ({
  uploadToCloudinary: jest.fn(() => ({ url: "https://cloudinary.com/test.pdf" })),
}));

jest.mock("../../services/notificationService", () => ({
  createNotification: jest.fn(),
  createBulkNotifications: jest.fn(),
}));

describe("TC005 - Logbook Module", () => {
  let mockPrisma;

  beforeAll(() => {
    const { getPrismaClient } = require("../../config/prisma");
    mockPrisma = getPrismaClient();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createLogbookEntry", () => {
    const { createLogbookEntry } = require("../../services/logbook/createLogbookEntry");
    const logbookData = {
      tasksPerformed: "Completed web development tasks for the week",
      skillsAcquired: "React, Node.js",
      challenges: "Database connection issues",
      lessonsLearned: "Always backup data",
    };

    it("creates a logbook entry successfully", async () => {
      const placement = mockPlacement({
        status: "approved",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-12-31"),
      });

      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({
          placements: [placement],
          user: { id: "user-123", firstName: "Test", lastName: "User", email: "test@test.com" },
        }),
      );
      mockPrisma.logbook.findFirst.mockResolvedValue(null);
      mockPrisma.logbook.create.mockResolvedValue(
        mockLogbook({ status: "draft", evidence: [], reviews: [] }),
      );

      const result = await createLogbookEntry("student-123", logbookData, []);

      expect(result).toHaveProperty("id", "logbook-123");
      expect(mockPrisma.logbook.create).toHaveBeenCalled();
    });

    it("rejects non-existent student", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(null);

      await expect(
        createLogbookEntry("invalid-id", logbookData, []),
      ).rejects.toMatchObject({ statusCode: 404, message: expect.stringContaining("Student not found") });
    });

    it("rejects student without approved placement", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({ placements: [] }),
      );

      await expect(
        createLogbookEntry("student-123", logbookData, []),
      ).rejects.toMatchObject({ statusCode: 403, message: expect.stringContaining("approved") });
    });

    it("rejects duplicate week entry", async () => {
      const placement = mockPlacement({
        status: "approved",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-12-31"),
      });

      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({
          placements: [placement],
          user: { id: "user-123", firstName: "Test", lastName: "User", email: "test@test.com" },
        }),
      );
      mockPrisma.logbook.findFirst.mockResolvedValue(mockLogbook());

      await expect(
        createLogbookEntry("student-123", logbookData, []),
      ).rejects.toMatchObject({ statusCode: 409, message: expect.stringContaining("already exists") });
    });
  });

  describe("getLogbooks", () => {
    const { getLogbooks } = require("../../services/logbook/getLogbooks");

    it("returns paginated logbooks", async () => {
      mockPrisma.logbook.findMany.mockResolvedValue([mockLogbook()]);
      mockPrisma.logbook.count.mockResolvedValue(1);

      const result = await getLogbooks({}, { page: 1, limit: 10 }, null);

      expect(result.logbooks).toHaveLength(1);
      expect(result.pagination).toHaveProperty("total", 1);
    });
  });

  describe("getLogbookById", () => {
    const { getLogbookById } = require("../../services/logbook/getLogbookById");

    it("returns logbook by id", async () => {
      mockPrisma.logbook.findUnique.mockResolvedValue(
        mockLogbook({ evidence: [], reviews: [] }),
      );

      const result = await getLogbookById("logbook-123");

      expect(result).toHaveProperty("id", "logbook-123");
    });

    it("rejects non-existent logbook", async () => {
      mockPrisma.logbook.findUnique.mockResolvedValue(null);

      await expect(getLogbookById("invalid-id")).rejects.toMatchObject({ statusCode: 404, message: expect.stringContaining("not found") });
    });
  });

  describe("reviewLogbook", () => {
    const { reviewLogbook } = require("../../services/logbook/reviewLogbook");
    const reviewData = {
      status: "APPROVED",
      comment: "Good work, keep it up",
      rating: 8,
    };

    it("reviews a logbook by industrial supervisor", async () => {
      mockPrisma.logbook.findUnique.mockResolvedValue(
        mockLogbook({
          status: "submitted",
          studentId: "student-123",
          student: { userId: "user-123" },
        }),
      );
      mockPrisma.supervisor.findUnique.mockResolvedValue(
        require("../utils/testFactory").mockSupervisor({
          assignedStudents: [{ studentId: "student-123" }],
        }),
      );
      mockPrisma.logbookReview.findFirst.mockResolvedValue(null);
      mockPrisma.student.findUnique.mockResolvedValue(
        require("../utils/testFactory").mockStudent({
          supervisorAssignments: [],
        }),
      );
      mockPrisma.logbookReview.create.mockResolvedValue({
        id: "review-123",
        logbookId: "logbook-123",
        reviewerId: "supervisor-123",
        status: "reviewed",
        comment: "Good work",
        rating: 8,
      });
      mockPrisma.logbook.update.mockResolvedValue(mockLogbook({ status: "reviewed" }));

      const result = await reviewLogbook(
        "logbook-123",
        { status: "reviewed", comment: "Good work", rating: 8 },
        "supervisor-123",
        "industrial",
      );
      expect(result).toHaveProperty("id", "review-123");
    });

    it("rejects review of non-existent logbook", async () => {
      mockPrisma.logbook.findUnique.mockResolvedValue(null);

      await expect(
        reviewLogbook("invalid-id", reviewData, "supervisor-123", "industrial"),
      ).rejects.toMatchObject({ statusCode: 404, message: expect.stringContaining("not found") });
    });

    it("rejects duplicate review", async () => {
      mockPrisma.logbook.findUnique.mockResolvedValue(
        mockLogbook({ status: "submitted", studentId: "student-123", student: { userId: "user-123" } }),
      );
      mockPrisma.supervisor.findUnique.mockResolvedValue(
        require("../utils/testFactory").mockSupervisor({
          assignedStudents: [{ studentId: "student-123" }],
        }),
      );
      mockPrisma.logbookReview.findFirst.mockResolvedValue({ id: "existing-review" });

      await expect(
        reviewLogbook("logbook-123", { status: "reviewed", comment: "Again" }, "supervisor-123", "industrial"),
      ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("already reviewed") });
    });

    it("rejects review with missing comment", async () => {
      mockPrisma.logbook.findUnique.mockResolvedValue(
        mockLogbook({ status: "submitted", studentId: "student-123", student: { userId: "user-123" } }),
      );
      mockPrisma.supervisor.findUnique.mockResolvedValue(
        require("../utils/testFactory").mockSupervisor({
          assignedStudents: [{ studentId: "student-123" }],
        }),
      );

      await expect(
        reviewLogbook("logbook-123", { status: "reviewed", comment: "" }, "supervisor-123", "industrial"),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("rejects review from unassigned supervisor", async () => {
      mockPrisma.logbook.findUnique.mockResolvedValue(
        mockLogbook({ status: "submitted", studentId: "student-123" }),
      );
      mockPrisma.supervisor.findUnique.mockResolvedValue(
        require("../utils/testFactory").mockSupervisor({
          assignedStudents: [{ studentId: "other-student" }],
        }),
      );

      await expect(
        reviewLogbook("logbook-123", { status: "reviewed", comment: "Nope" }, "supervisor-123", "industrial"),
      ).rejects.toMatchObject({ statusCode: 403, message: expect.stringContaining("not assigned") });
    });
  });

  // --- Edge cases ---

  describe("createLogbookEntry edge cases", () => {
    const { createLogbookEntry } = require("../../services/logbook/createLogbookEntry");
    const baseData = {
      tasksPerformed: "Completed web development tasks for the week",
    };

    it("handles empty optional fields (skillsAcquired, challenges, lessonsLearned)", async () => {
      const placement = mockPlacement({
        status: "approved",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-12-31"),
      });
      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({
          placements: [placement],
          user: { id: "user-123", firstName: "Test", lastName: "User", email: "test@test.com" },
        }),
      );
      mockPrisma.logbook.findFirst.mockResolvedValue(null);
      mockPrisma.logbook.create.mockResolvedValue(
        mockLogbook({ status: "draft", evidence: [], reviews: [] }),
      );

      const result = await createLogbookEntry("student-123", {
        tasksPerformed: "Just the task description",
      }, []);
      expect(result).toBeDefined();
    });

    it("handles very long tasksPerformed content", async () => {
      const placement = mockPlacement({
        status: "approved",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-12-31"),
      });
      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({
          placements: [placement],
          user: { id: "user-123", firstName: "Test", lastName: "User", email: "test@test.com" },
        }),
      );
      mockPrisma.logbook.findFirst.mockResolvedValue(null);
      mockPrisma.logbook.create.mockResolvedValue(
        mockLogbook({ status: "draft", evidence: [], reviews: [] }),
      );

      const result = await createLogbookEntry("student-123", {
        tasksPerformed: "A".repeat(5000),
      }, []);
      expect(result).toBeDefined();
    });

    it("passes null tasksPerformed to Prisma (validation is middleware-level)", async () => {
      const placement = mockPlacement({
        status: "approved",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-12-31"),
      });
      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({
          placements: [placement],
          user: { id: "user-123", firstName: "Test", lastName: "User", email: "test@test.com" },
        }),
      );
      mockPrisma.logbook.findFirst.mockResolvedValue(null);
      mockPrisma.logbook.create.mockResolvedValue(mockLogbook());

      const result = await createLogbookEntry("student-123", { tasksPerformed: null }, []);
      expect(result).toBeDefined();
    });

    it("handles evidence file upload", async () => {
      const placement = mockPlacement({
        status: "approved",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-12-31"),
      });
      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({
          placements: [placement],
          user: { id: "user-123", firstName: "Test", lastName: "User", email: "test@test.com" },
        }),
      );
      mockPrisma.logbook.findFirst.mockResolvedValue(null);
      mockPrisma.logbook.create.mockResolvedValue(
        mockLogbook({
          status: "draft",
          evidence: [{ id: "ev-1", name: "report.pdf", path: "https://cloudinary.com/report.pdf" }],
          reviews: [],
        }),
      );

      const files = [{ originalname: "report.pdf", mimetype: "application/pdf", buffer: Buffer.from("test") }];
      const result = await createLogbookEntry("student-123", baseData, files);
      expect(result).toBeDefined();
    });
  });

  describe("getLogbooks edge cases", () => {
    const { getLogbooks } = require("../../services/logbook/getLogbooks");

    it("returns empty list when no logbooks exist", async () => {
      mockPrisma.logbook.findMany.mockResolvedValue([]);
      mockPrisma.logbook.count.mockResolvedValue(0);
      const { buildPaginationMeta } = require("../../utils/helpers");
      buildPaginationMeta.mockReturnValue({ page: 1, limit: 10, total: 0, pages: 0 });

      const result = await getLogbooks({}, { page: 1, limit: 10 }, null);
      expect(result.logbooks).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it("handles negative page number gracefully", async () => {
      mockPrisma.logbook.findMany.mockResolvedValue([]);
      mockPrisma.logbook.count.mockResolvedValue(0);

      const result = await getLogbooks({}, { page: -1, limit: 10 }, null);
      expect(result).toBeDefined();
    });

    it("handles filters by status", async () => {
      mockPrisma.logbook.findMany.mockResolvedValue([mockLogbook({ status: "submitted" })]);
      mockPrisma.logbook.count.mockResolvedValue(1);

      const result = await getLogbooks({ status: "submitted" }, { page: 1, limit: 10 }, null);
      expect(result.logbooks).toHaveLength(1);
    });
  });
});
