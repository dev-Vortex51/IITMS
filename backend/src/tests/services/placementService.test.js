const { createPrismaMock } = require("../utils/prismaMock");
const { mockStudent, mockPlacement, mockDepartment } = require("../utils/testFactory");

jest.mock("../../config/prisma", () => {
  const { createPrismaMock } = require("../utils/prismaMock");
  const mock = createPrismaMock();
  return {
    getPrismaClient: jest.fn(() => mock),
  };
});

jest.mock("../../utils/helpers", () => ({
  sanitizeInput: jest.fn((x) => x),
  catchAsync: jest.fn((fn) => fn),
}));

jest.mock("../../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

jest.mock("../../services/notificationService", () => ({
  createBulkNotifications: jest.fn(),
}));

jest.mock("../../services/placement/acceptanceLetter", () => ({
  uploadAcceptanceLetter: jest.fn(() => ({
    acceptanceLetter: "letter.pdf",
    acceptanceLetterPath: "/uploads/letter.pdf",
  })),
}));

describe("placementService", () => {
  let mockPrisma;
  const { createPlacement } = require("../../services/placement/createPlacement");

  beforeEach(() => {
    jest.clearAllMocks();
    const { getPrismaClient } = require("../../config/prisma");
    mockPrisma = getPrismaClient();
  });

  describe("createPlacement", () => {
    const placementData = {
      companyName: "Tech Corp Ltd",
      companyAddress: "123 Innovation Drive",
      companyEmail: "hr@techcorp.com",
      companyPhone: "+234-800-0001",
      position: "Software Engineering Intern",
      startDate: "2025-06-01",
      endDate: "2025-12-31",
      supervisorName: "John Doe",
      supervisorEmail: "john@techcorp.com",
    };

    it("creates a placement successfully", async () => {
      const student = mockStudent({
        user: { firstName: "Test", lastName: "User", email: "test@example.com" },
      });
      mockPrisma.student.findUnique.mockResolvedValue(student);
      mockPrisma.placement.findFirst.mockResolvedValue(null);
      mockPrisma.industryPartner.findFirst.mockResolvedValue(null);
      mockPrisma.industryPartner.create.mockResolvedValue({ id: "partner-123" });
      mockPrisma.placement.create.mockResolvedValue(mockPlacement());
      mockPrisma.department.findUnique.mockResolvedValue(
        mockDepartment({ coordinators: [{ id: "coord-1" }] }),
      );

      const result = await createPlacement("student-123", placementData, null);

      expect(result).toHaveProperty("id", "placement-123");
      expect(mockPrisma.placement.create).toHaveBeenCalled();
    });

    it("rejects non-existent student", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(null);

      await expect(
        createPlacement("invalid-id", placementData, null),
      ).rejects.toMatchObject({ statusCode: 404, message: expect.stringContaining("Student not found") });
    });

    it("rejects duplicate pending placement", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(mockStudent({
        user: { firstName: "Test", lastName: "User", email: "test@example.com" },
      }));
      mockPrisma.placement.findFirst.mockResolvedValue(mockPlacement());

      await expect(
        createPlacement("student-123", placementData, null),
      ).rejects.toMatchObject({ statusCode: 409, message: expect.stringContaining("already have a pending") });
    });

    it("reuses existing industry partner", async () => {
      const student = mockStudent({
        user: { firstName: "Test", lastName: "User", email: "test@example.com" },
      });
      mockPrisma.student.findUnique.mockResolvedValue(student);
      mockPrisma.placement.findFirst.mockResolvedValue(null);
      mockPrisma.industryPartner.findFirst.mockResolvedValue({ id: "existing-partner" });
      mockPrisma.placement.create.mockResolvedValue(mockPlacement());
      mockPrisma.department.findUnique.mockResolvedValue(
        mockDepartment({ coordinators: [] }),
      );

      await createPlacement("student-123", placementData, null);

      expect(mockPrisma.industryPartner.create).not.toHaveBeenCalled();
      expect(mockPrisma.placement.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            industryPartner: { connect: { id: "existing-partner" } },
          }),
        }),
      );
    });
  });
});
