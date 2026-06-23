const { createPrismaMock } = require("../utils/prismaMock");
const { mockStudent, mockPlacement, mockAttendance } = require("../utils/testFactory");

jest.mock("../../config/prisma", () => {
  const { createPrismaMock } = require("../utils/prismaMock");
  const mock = createPrismaMock();
  return {
    getPrismaClient: jest.fn(() => mock),
  };
});

jest.mock("../../utils/helpers", () => ({
  catchAsync: jest.fn((fn) => fn),
}));

jest.mock("../../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

jest.mock("../../services/attendance/helpers", () => ({
  getLagosDayBounds: jest.fn(() => ({
    startOfDay: new Date("2025-06-01T00:00:00.000Z"),
    endOfDay: new Date("2025-06-01T23:59:59.999Z"),
    zonedTime: new Date("2025-06-01T08:30:00.000Z"),
  })),
  getDayBounds: jest.fn(() => ({
    startOfDay: new Date("2025-06-01T00:00:00.000Z"),
    endOfDay: new Date("2025-06-01T23:59:59.999Z"),
    zonedTime: new Date("2025-06-01T08:30:00.000Z"),
  })),
  isDateWithinPlacementWindow: jest.fn(() => true),
}));

jest.mock("../../services/notificationService", () => ({
  createBulkNotifications: jest.fn(),
}));

describe("TC004 - Attendance Module", () => {
  let mockPrisma;

  beforeAll(() => {
    const { getPrismaClient } = require("../../config/prisma");
    mockPrisma = getPrismaClient();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkIn", () => {
    const { checkIn } = require("../../services/attendance/checkIn");

    it("checks in successfully", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({
          placements: [mockPlacement({ status: "approved" })],
          supervisorAssignments: [],
          user: { firstName: "Test", lastName: "User", email: "test@test.com" },
        }),
      );
      mockPrisma.attendance.findFirst.mockResolvedValue(null);
      mockPrisma.attendance.create.mockResolvedValue(
        mockAttendance({ checkInTime: new Date(), dayStatus: "INCOMPLETE" }),
      );

      const result = await checkIn("student-123", {});

      expect(result).toHaveProperty("id", "att-123");
      expect(mockPrisma.attendance.create).toHaveBeenCalled();
    });

    it("rejects non-existent student", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(null);

      await expect(checkIn("invalid-id", {})).rejects.toMatchObject({ statusCode: 404, message: expect.stringContaining("Student not found") });
    });

    it("rejects student without approved placement", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({ placements: [] }),
      );

      await expect(checkIn("student-123", {})).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("approved placement") });
    });

    it("rejects duplicate check-in", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({
          placements: [mockPlacement({ status: "approved" })],
          supervisorAssignments: [],
          user: { firstName: "Test", lastName: "User", email: "test@test.com" },
        }),
      );
      mockPrisma.attendance.findFirst.mockResolvedValue(
        mockAttendance({ checkInTime: new Date() }),
      );

      await expect(checkIn("student-123", {})).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("already checked in today") });
    });
  });

  describe("getTodayCheckIn", () => {
    const { getTodayCheckIn } = require("../../services/attendance/getTodayCheckIn");

    it("returns today's check-in record", async () => {
      mockPrisma.attendance.findFirst.mockResolvedValue(mockAttendance());

      const result = await getTodayCheckIn("student-123");
      expect(result).toHaveProperty("id", "att-123");
    });

    it("returns null when no check-in exists", async () => {
      mockPrisma.attendance.findFirst.mockResolvedValue(null);

      const result = await getTodayCheckIn("student-123");
      expect(result).toBeNull();
    });
  });

  describe("getAttendanceHistory", () => {
    const { getAttendanceHistory } = require("../../services/attendance/getAttendanceHistory");

    it("returns attendance history for own student", async () => {
      mockPrisma.student.findFirst.mockResolvedValue(
        mockStudent({ id: "student-123", user: { id: "user-1" } }),
      );
      mockPrisma.attendance.findMany.mockResolvedValue([
        mockAttendance(),
        mockAttendance({ id: "att-456", date: new Date("2025-06-02") }),
      ]);

      const user = { id: "user-1", role: "student" };
      const result = await getAttendanceHistory("student-123", {}, user);
      expect(result).toHaveLength(2);
    });

    it("rejects viewing another student's history", async () => {
      mockPrisma.student.findFirst.mockResolvedValue(
        mockStudent({ id: "other-student", user: { id: "user-1" } }),
      );

      const user = { id: "user-1", role: "student" };
      await expect(
        getAttendanceHistory("student-123", {}, user),
      ).rejects.toMatchObject({ statusCode: 403, message: expect.stringContaining("only view your own attendance") });
    });
  });

  describe("getAttendanceStats", () => {
    const { getAttendanceStats } = require("../../services/attendance/getAttendanceStats");

    it("returns attendance statistics for own student", async () => {
      mockPrisma.student.findFirst.mockResolvedValue(
        mockStudent({ id: "student-123", user: { id: "user-1" } }),
      );
      mockPrisma.attendance.count.mockResolvedValue(10);
      mockPrisma.attendance.groupBy.mockResolvedValue([]);
      mockPrisma.attendance.findMany.mockResolvedValue([]);

      const user = { id: "user-1", role: "student" };
      const result = await getAttendanceStats("student-123", user);
      expect(result).toHaveProperty("total", 10);
    });
  });

  // --- Edge cases ---

  describe("checkIn edge cases", () => {
    const { checkIn } = require("../../services/attendance/checkIn");

    it("handles check-in when already late (after grace period)", async () => {
      const { getDayBounds } = require("../../services/attendance/helpers");
      getDayBounds.mockReturnValue({
        startOfDay: new Date("2025-06-01T00:00:00.000Z"),
        endOfDay: new Date("2025-06-01T23:59:59.999Z"),
        zonedTime: new Date("2025-06-01T09:00:00.000Z"), // 9 AM, after 15min grace on 8AM start
      });

      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({
          placements: [mockPlacement({ status: "approved", workStartTime: "08:00", gracePeriodMinutes: 15 })],
          supervisorAssignments: [],
          user: { firstName: "Test", lastName: "User", email: "test@test.com" },
        }),
      );
      mockPrisma.attendance.findFirst.mockResolvedValue(null);
      mockPrisma.attendance.create.mockResolvedValue(
        mockAttendance({ punctuality: "LATE", checkInTime: new Date() }),
      );

      const result = await checkIn("student-123", {});
      expect(result).toHaveProperty("id", "att-123");
    });

    it("handles null data parameter", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({
          placements: [mockPlacement({ status: "approved" })],
          supervisorAssignments: [],
          user: { firstName: "Test", lastName: "User", email: "test@test.com" },
        }),
      );
      mockPrisma.attendance.findFirst.mockResolvedValue(null);
      mockPrisma.attendance.create.mockResolvedValue(mockAttendance());

      const result = await checkIn("student-123", null);
      expect(result).toHaveProperty("id", "att-123");
    });

    it("handles check-in at midnight boundary", async () => {
      const { getDayBounds } = require("../../services/attendance/helpers");
      getDayBounds.mockReturnValue({
        startOfDay: new Date("2025-06-01T00:00:00.000Z"),
        endOfDay: new Date("2025-06-01T23:59:59.999Z"),
        zonedTime: new Date("2025-06-01T00:01:00.000Z"), // 12:01 AM
      });

      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({
          placements: [mockPlacement({ status: "approved", workStartTime: "08:00", gracePeriodMinutes: 15 })],
          supervisorAssignments: [],
          user: { firstName: "Test", lastName: "User", email: "test@test.com" },
        }),
      );
      mockPrisma.attendance.findFirst.mockResolvedValue(null);
      mockPrisma.attendance.create.mockResolvedValue(mockAttendance({ punctuality: "LATE" }));

      const result = await checkIn("student-123", {});
      expect(result).toBeDefined();
    });

    it("handles student with no active supervisor assignments", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({
          placements: [mockPlacement({ status: "approved" })],
          supervisorAssignments: [],
          user: { firstName: "Test", lastName: "User", email: "test@test.com" },
        }),
      );
      mockPrisma.attendance.findFirst.mockResolvedValue(null);
      mockPrisma.attendance.create.mockResolvedValue(mockAttendance());

      const result = await checkIn("student-123", {});
      expect(result).toBeDefined();
      // Should succeed without notification since no industrial supervisors
    });
  });

  describe("getAttendanceStats edge cases", () => {
    const { getAttendanceStats } = require("../../services/attendance/getAttendanceStats");

    it("returns zero stats for student with no records", async () => {
      mockPrisma.student.findFirst.mockResolvedValue(
        mockStudent({ id: "student-123", user: { id: "user-1" } }),
      );
      mockPrisma.attendance.count.mockResolvedValue(0);
      mockPrisma.attendance.groupBy.mockResolvedValue([]);
      mockPrisma.attendance.findMany.mockResolvedValue([]);

      const user = { id: "user-1", role: "student" };
      const result = await getAttendanceStats("student-123", user);

      expect(result.total).toBe(0);
      expect(result.presentOnTime).toBe(0);
      expect(result.currentStreak).toBe(0);
    });

    it("handles mixed dayStatus values in stats", async () => {
      mockPrisma.student.findFirst.mockResolvedValue(
        mockStudent({ id: "student-123", user: { id: "user-1" } }),
      );
      mockPrisma.attendance.count.mockResolvedValue(20);
      mockPrisma.attendance.groupBy.mockResolvedValue([
        { dayStatus: "PRESENT_ON_TIME", _count: { _all: 8 } },
        { dayStatus: "PRESENT_LATE", _count: { _all: 4 } },
        { dayStatus: "ABSENT", _count: { _all: 5 } },
        { dayStatus: "EXCUSED_ABSENCE", _count: { _all: 3 } },
      ]);
      mockPrisma.attendance.findMany.mockResolvedValue([
        { dayStatus: "PRESENT_ON_TIME", date: new Date("2025-06-01") },
        { dayStatus: "PRESENT_ON_TIME", date: new Date("2025-05-31") },
      ]);

      const user = { id: "user-1", role: "student" };
      const result = await getAttendanceStats("student-123", user);

      expect(result.presentOnTime).toBe(8);
      expect(result.presentLate).toBe(4);
      expect(result.absent).toBe(5);
      expect(result.currentStreak).toBe(2);
    });

    it("handles coordinator viewing student in their department", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(
        mockStudent({ id: "student-123", departmentId: "dept-123" }),
      );
      mockPrisma.attendance.count.mockResolvedValue(5);
      mockPrisma.attendance.groupBy.mockResolvedValue([]);
      mockPrisma.attendance.findMany.mockResolvedValue([]);

      const user = { id: "coord-1", role: "coordinator", departmentId: "dept-123" };
      const result = await getAttendanceStats("student-123", user);
      expect(result.total).toBe(5);
    });
  });

  describe("getAttendanceHistory edge cases", () => {
    const { getAttendanceHistory } = require("../../services/attendance/getAttendanceHistory");

    it("filters by date range", async () => {
      mockPrisma.student.findFirst.mockResolvedValue(
        mockStudent({ id: "student-123", user: { id: "user-1" } }),
      );
      mockPrisma.attendance.findMany.mockResolvedValue([mockAttendance()]);

      const user = { id: "user-1", role: "student" };
      const result = await getAttendanceHistory(
        "student-123",
        { startDate: "2025-06-01", endDate: "2025-06-30" },
        user,
      );
      expect(result).toHaveLength(1);
    });

    it("filters by dayStatus", async () => {
      mockPrisma.student.findFirst.mockResolvedValue(
        mockStudent({ id: "student-123", user: { id: "user-1" } }),
      );
      mockPrisma.attendance.findMany.mockResolvedValue([mockAttendance()]);

      const user = { id: "user-1", role: "student" };
      const result = await getAttendanceHistory(
        "student-123",
        { dayStatus: "PRESENT_ON_TIME" },
        user,
      );
      expect(result).toHaveLength(1);
    });

    it("returns empty array for student with no history", async () => {
      mockPrisma.student.findFirst.mockResolvedValue(
        mockStudent({ id: "student-123", user: { id: "user-1" } }),
      );
      mockPrisma.attendance.findMany.mockResolvedValue([]);

      const user = { id: "user-1", role: "student" };
      const result = await getAttendanceHistory("student-123", {}, user);
      expect(result).toEqual([]);
    });
  });
});
