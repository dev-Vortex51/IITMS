const { createPrismaMock } = require("../utils/prismaMock");
const { mockUser, mockDepartment } = require("../utils/testFactory");

jest.mock("../../config/prisma", () => {
  const { createPrismaMock } = require("../utils/prismaMock");
  const mock = createPrismaMock();
  return {
    getPrismaClient: jest.fn(() => mock),
  };
});

jest.mock("../../utils/helpers", () => ({
  hashPassword: jest.fn(() => "hashed-pwd"),
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
  createNotification: jest.fn(),
}));

jest.mock("../../services/user/createStudentProfile", () => ({
  createStudentProfile: jest.fn(() => ({ id: "student-profile-123" })),
}));

jest.mock("../../services/user/createSupervisorProfile", () => ({
  createSupervisorProfile: jest.fn(() => ({ id: "supervisor-profile-123" })),
}));

jest.mock("../../services/user/autoLinkSupervisorToPlacements", () => ({
  autoLinkSupervisorToPlacements: jest.fn(),
}));

describe("TC001 - User Registration (createUser)", () => {
  let mockPrisma;
  const { createUser } = require("../../services/user/createUser");

  const adminUser = mockUser({ role: "admin", id: "admin-1" });
  const coordinatorUser = mockUser({ role: "coordinator", id: "coord-1" });
  const studentData = {
    email: "student@test.com",
    firstName: "Jane",
    lastName: "Doe",
    role: "student",
    department: "dept-123",
    matricNumber: "IT/23/0001",
    level: 400,
    session: "2025/2026",
  };
  const coordData = {
    email: "coord@test.com",
    firstName: "Coord",
    lastName: "User",
    role: "coordinator",
    department: "dept-123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { getPrismaClient } = require("../../config/prisma");
    mockPrisma = getPrismaClient();

    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.department.findUnique.mockResolvedValue(mockDepartment());
    mockPrisma.$transaction.mockImplementation(async (cb) => {
      const tx = {
        user: {
          create: jest.fn(() => ({
            id: "new-user-id",
            email: studentData.email,
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            role: studentData.role,
            phone: null,
            isActive: true,
          })),
        },
        department: {
          update: jest.fn(),
        },
      };
      return cb(tx);
    });
  });

  it("creates a student account (coordinator)", async () => {
    const result = await createUser(studentData, coordinatorUser);

    expect(result).toHaveProperty("user");
    expect(result.user.email).toBe(studentData.email);
    expect(result).toHaveProperty("defaultPassword");
  });

  it("creates a coordinator account (admin)", async () => {
    mockPrisma.$transaction.mockImplementation(async (cb) => {
      const tx = {
        user: {
          create: jest.fn(() => ({
            id: "new-coord-id",
            email: coordData.email,
            firstName: coordData.firstName,
            lastName: coordData.lastName,
            role: coordData.role,
            phone: null,
            isActive: true,
          })),
        },
        department: {
          update: jest.fn(),
        },
      };
      return cb(tx);
    });

    const result = await createUser(coordData, adminUser);
    expect(result.user.email).toBe(coordData.email);
  });

  it("rejects duplicate email", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(mockUser({ email: studentData.email }));

    await expect(
      createUser(studentData, coordinatorUser),
    ).rejects.toMatchObject({ statusCode: 409, message: expect.stringContaining("already exists") });
  });

  it("rejects admin creating a student", async () => {
    await expect(
      createUser(studentData, adminUser),
    ).rejects.toMatchObject({ statusCode: 403, message: expect.stringContaining("Only coordinators can create student accounts") });
  });

  it("rejects coordinator creating an admin", async () => {
    await expect(
      createUser(
        { ...studentData, role: "admin" },
        coordinatorUser,
      ),
    ).rejects.toMatchObject({ statusCode: 403, message: expect.stringContaining("Coordinator cannot create users with role") });
  });

  it("rejects unknown role from unauthorized user", async () => {
    await expect(
      createUser(studentData, mockUser({ role: "student" })),
    ).rejects.toMatchObject({ statusCode: 403, message: expect.stringContaining("do not have permission") });
  });

  it("rejects if department is missing for student role", async () => {
    await expect(
      createUser({ ...studentData, department: undefined }, coordinatorUser),
    ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("Department is required") });
  });

  it("rejects if department not found", async () => {
    mockPrisma.department.findUnique.mockResolvedValue(null);

    await expect(
      createUser(studentData, coordinatorUser),
    ).rejects.toMatchObject({ statusCode: 404, message: expect.stringContaining("Department not found") });
  });

  // --- Edge cases ---

  it("handles email with leading/trailing whitespace", async () => {
    // Validation is middleware-level (Joi), service accepts any string
    const result = await createUser(
      { ...studentData, email: "  spaced@test.com  " },
      coordinatorUser,
    );
    expect(result).toBeDefined();
  });

  it("handles uppercase email in duplicate check", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(mockUser({ email: "UPPER@TEST.COM" }));

    await expect(
      createUser({ ...studentData, email: "UPPER@TEST.COM" }, coordinatorUser),
    ).rejects.toMatchObject({ statusCode: 409, message: expect.stringContaining("already exists") });
  });

  it("passes empty email to Prisma (validation is middleware-level)", async () => {
    // Service layer does not validate — Joi middleware handles this
    const result = await createUser({ ...studentData, email: "" }, coordinatorUser);
    expect(result).toBeDefined();
  });

  it("passes empty firstName to Prisma (validation is middleware-level)", async () => {
    const result = await createUser({ ...studentData, firstName: "" }, coordinatorUser);
    expect(result).toBeDefined();
  });

  it("handles special characters in names (unicode, diacritics)", async () => {
    mockPrisma.$transaction.mockImplementation(async (cb) => {
      const tx = {
        user: {
          create: jest.fn(({ data }) => ({
            id: "new-user-id",
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role,
            phone: null,
            isActive: true,
          })),
        },
        department: { update: jest.fn() },
      };
      return cb(tx);
    });

    const result = await createUser(
      { ...studentData, firstName: "José María", lastName: "O'Connor" },
      coordinatorUser,
    );
    expect(result.user.firstName).toBe("José María");
  });

  it("handles null optional fields (phone, address)", async () => {
    const result = await createUser(
      { ...studentData, phone: null, address: undefined },
      coordinatorUser,
    );
    expect(result.user).toBeDefined();
  });

  it("handles XSS attempt in firstName (sanitize is middleware-level)", async () => {
    mockPrisma.$transaction.mockImplementation(async (cb) => {
      const tx = {
        user: {
          create: jest.fn(({ data }) => ({
            id: "new-user-id",
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role,
            phone: null,
            isActive: true,
          })),
        },
        department: { update: jest.fn() },
      };
      return cb(tx);
    });

    const result = await createUser(
      { ...studentData, firstName: "<script>alert('xss')</script>" },
      coordinatorUser,
    );
    expect(result.user.firstName).toBe("<script>alert('xss')</script>");
  });

  it("handles prisma $transaction failure", async () => {
    mockPrisma.$transaction.mockRejectedValue(new Error("Transaction failed"));

    await expect(
      createUser(studentData, coordinatorUser),
    ).rejects.toThrow();
  });

  it("handles Prisma unique constraint violation", async () => {
    mockPrisma.$transaction.mockImplementation(async () => {
      const error = new Error("Unique constraint failed on email");
      error.code = "P2002";
      throw error;
    });

    await expect(
      createUser(studentData, coordinatorUser),
    ).rejects.toThrow();
  });
});
