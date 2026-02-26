/**
 * Phase 5: MongoDB → PostgreSQL Data Migration
 *
 * This script migrates all data from MongoDB to PostgreSQL using Prisma.
 * Migration order follows foreign key dependencies to prevent constraint violations.
 *
 * Usage: npm run migrate:data
 *
 * Order of migration:
 * 1. Users (base entity)
 * 2. Faculties (no dependencies)
 * 3. Departments (depends on Faculty)
 * 4. Supervisors (depends on User, Department)
 * 5. Students (depends on User, Department)
 * 6. SupervisorAssignments (depends on Supervisor, Student)
 * 7. Placements (depends on Student)
 * 8. Logbooks (depends on Student, Placement)
 * 9. LogbookEvidence (depends on Logbook)
 * 10. LogbookReview (depends on Logbook, Supervisor)
 * 11. Assessments (depends on Student, Supervisor)
 * 12. Attendance (depends on Student, Placement)
 * 13. Notifications (depends on User, related entities)
 * 14. NotificationPreferences (depends on User)
 * 15. Invitations (depends on User, Department)
 * 16. SystemSettings
 */

const mongoose = require("mongoose");
const { getPrismaClient } = require("../src/config/prisma");
const logger = require("../src/utils/logger");
const crypto = require("crypto");
require("dotenv").config();

// Import all Mongoose models
const {
  User,
  Faculty,
  Department,
  Student,
  Supervisor,
  Placement,
  Logbook,
  Assessment,
  Notification,
  Invitation,
  Attendance,
  SupervisorAssignment,
  NotificationPreference,
  SystemSettings,
} = require("../src/models");

const prisma = getPrismaClient();
const idMap = {}; // Map MongoDB ObjectIds to PostgreSQL UUIDs

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a UUID v4 using Node.js crypto module (no external dependency)
 */
const generateUUID = () => {
  return crypto.randomUUID();
};

/**
 * Get or create UUID for MongoDB ObjectId
 * Ensures consistent ID mapping across all tables
 */
const getPostgresId = (mongoId) => {
  if (!mongoId) return null;
  const idStr = mongoId.toString();
  if (!idMap[idStr]) {
    idMap[idStr] = generateUUID();
  }
  return idMap[idStr];
};

/**
 * Map MongoDB role to Prisma UserRole enum
 */
const mapRole = (mongoRole) => {
  if (!mongoRole) return "student";
  const roleMap = {
    ADMIN: "admin",
    FACULTY: "faculty",
    DEPARTMENT: "department",
    COORDINATOR: "coordinator",
    STUDENT: "student",
    ACADEMIC_SUPERVISOR: "academic_supervisor",
    DEPT_SUPERVISOR: "academic_supervisor",
    DEPARTMENTAL_SUPERVISOR: "academic_supervisor",
    INDUSTRIAL_SUPERVISOR: "industrial_supervisor",
  };
  return roleMap[mongoRole.toUpperCase()] || "student";
};

/**
 * Connect to MongoDB
 */
const connectMongoDB = async () => {
  try {
    logger.info("Connecting to MongoDB...");
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/siwes_management",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    );
    logger.info("✓ Connected to MongoDB");
  } catch (error) {
    logger.error(`Failed to connect to MongoDB: ${error.message}`);
    throw error;
  }
};

/**
 * Disconnect from MongoDB
 */
const disconnectMongoDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info("✓ Disconnected from MongoDB");
  } catch (error) {
    logger.error(`Failed to disconnect from MongoDB: ${error.message}`);
  }
};

/**
 * Log migration progress
 */
const logMigrationProgress = (entity, count, action = "Migrated") => {
  logger.info(`${action} ${count} ${entity} record(s)`);
};

// ============================================================================
// MIGRATION FUNCTIONS (in dependency order)
// ============================================================================

/**
 * Migrate Users
 */
const migrateUsers = async () => {
  logger.info("\n--- Migrating Users ---");
  try {
    const mongoUsers = await User.find().lean();

    let createdCount = 0;

    for (const mongoUser of mongoUsers) {
      const postgresId = getPostgresId(mongoUser._id);

      try {
        await prisma.user.create({
          data: {
            id: postgresId,
            email: mongoUser.email,
            password:
              mongoUser.password ||
              process.env.DEFAULT_PASSWORD ||
              "Change@123",
            firstName: mongoUser.firstName || "",
            lastName: mongoUser.lastName || "",
            phone: mongoUser.phone || "",
            role: mapRole(mongoUser.role),
            passwordResetRequired: mongoUser.isFirstLogin !== false,
            isActive: mongoUser.isActive !== false,
            address: mongoUser.address || null,
            bio: mongoUser.bio || null,
            profilePhoto: mongoUser.profilePhoto || null,
            createdAt: mongoUser.createdAt || new Date(),
            updatedAt: mongoUser.updatedAt || new Date(),
          },
        });
        createdCount++;
      } catch (err) {
        if (err.code === "P2002") {
          // Unique constraint - user already exists
          logger.warn(
            `User ${mongoUser.email} already exists in PostgreSQL, skipping`,
          );
        } else {
          logger.warn(`User ${mongoUser.email} skipped: ${err.message}`);
        }
      }
    }

    logMigrationProgress("Users", createdCount);
    return { total: mongoUsers.length, migrated: createdCount };
  } catch (error) {
    logger.error(`Error migrating Users: ${error.message}`);
    throw error;
  }
};

/**
 * Migrate Faculties
 */
const migrateFaculties = async () => {
  logger.info("\n--- Migrating Faculties ---");
  try {
    const mongoFaculties = await Faculty.find().lean();

    let createdCount = 0;

    for (const mongoFaculty of mongoFaculties) {
      const postgresId = getPostgresId(mongoFaculty._id);

      try {
        await prisma.faculty.create({
          data: {
            id: postgresId,
            name: mongoFaculty.name || "",
            code: mongoFaculty.code || "",
            description: mongoFaculty.description || "",
            isActive: mongoFaculty.isActive !== false,
            createdAt: mongoFaculty.createdAt || new Date(),
            updatedAt: mongoFaculty.updatedAt || new Date(),
          },
        });
        createdCount++;
      } catch (err) {
        logger.warn(`Faculty ${mongoFaculty.code} skipped: ${err.message}`);
      }
    }

    logMigrationProgress("Faculties", createdCount);
    return { total: mongoFaculties.length, migrated: createdCount };
  } catch (error) {
    logger.error(`Error migrating Faculties: ${error.message}`);
    throw error;
  }
};

/**
 * Migrate Departments
 */
const migrateDepartments = async () => {
  logger.info("\n--- Migrating Departments ---");
  try {
    const mongoDepartments = await Department.find().populate("faculty").lean();

    let createdCount = 0;

    for (const mongoDept of mongoDepartments) {
      const postgresId = getPostgresId(mongoDept._id);
      const facultyId = getPostgresId(
        mongoDept.faculty?._id || mongoDept.faculty,
      );

      if (!facultyId) {
        logger.warn(`Department ${mongoDept.code} skipped: Faculty not found`);
        continue;
      }

      try {
        await prisma.department.create({
          data: {
            id: postgresId,
            name: mongoDept.name || "",
            code: mongoDept.code || "",
            description: mongoDept.description || "",
            facultyId,
            // NOTE: coordinators relationship handled separately after users created
            isActive: mongoDept.isActive !== false,
            createdAt: mongoDept.createdAt || new Date(),
            updatedAt: mongoDept.updatedAt || new Date(),
          },
        });
        createdCount++;
      } catch (err) {
        logger.warn(`Department ${mongoDept.code} skipped: ${err.message}`);
      }
    }

    logMigrationProgress("Departments", createdCount);
    return { total: mongoDepartments.length, migrated: createdCount };
  } catch (error) {
    logger.error(`Error migrating Departments: ${error.message}`);
    throw error;
  }
};

/**
 * Migrate Supervisors
 */
const migrateSupervisors = async () => {
  logger.info("\n--- Migrating Supervisors ---");
  try {
    const mongoSupervisors = await Supervisor.find()
      .populate("user")
      .populate("department")
      .lean();

    let createdCount = 0;

    for (const mongoSupervisor of mongoSupervisors) {
      const postgresId = getPostgresId(mongoSupervisor._id);
      const userId = getPostgresId(
        mongoSupervisor.user?._id || mongoSupervisor.user,
      );
      const departmentId = mongoSupervisor.department
        ? getPostgresId(mongoSupervisor.department._id)
        : null;

      if (!userId) {
        logger.warn(`Supervisor skipped: User not found`);
        continue;
      }

      try {
        await prisma.supervisor.create({
          data: {
            id: postgresId,
            userId,
            type: mongoSupervisor.type || "industrial",
            departmentId,
            staffId: mongoSupervisor.staffId || "",
            officeLocation: mongoSupervisor.officeLocation || "",
            specialization: mongoSupervisor.specialization || "",
            companyName: mongoSupervisor.companyName || "",
            position: mongoSupervisor.position || "",
            yearsOfExperience: mongoSupervisor.yearsOfExperience || 0,
            maxStudents: mongoSupervisor.maxStudents || 10,
            isActive: mongoSupervisor.isActive !== false,
            createdAt: mongoSupervisor.createdAt || new Date(),
            updatedAt: mongoSupervisor.updatedAt || new Date(),
          },
        });
        createdCount++;
      } catch (err) {
        logger.warn(`Supervisor for user ${userId} skipped: ${err.message}`);
      }
    }

    logMigrationProgress("Supervisors", createdCount);
    return { total: mongoSupervisors.length, migrated: createdCount };
  } catch (error) {
    logger.error(`Error migrating Supervisors: ${error.message}`);
    throw error;
  }
};

/**
 * Migrate Students
 */
const migrateStudents = async () => {
  logger.info("\n--- Migrating Students ---");
  try {
    const mongoStudents = await Student.find()
      .populate("user")
      .populate("department")
      .populate("departmentalSupervisor")
      .populate("industrialSupervisor")
      .lean();

    let createdCount = 0;

    for (const mongoStudent of mongoStudents) {
      const postgresId = getPostgresId(mongoStudent._id);
      const userId = getPostgresId(mongoStudent.user?._id || mongoStudent.user);
      const departmentId = getPostgresId(
        mongoStudent.department?._id || mongoStudent.department,
      );
      const deptSupervisorId = mongoStudent.departmentalSupervisor
        ? getPostgresId(mongoStudent.departmentalSupervisor._id)
        : null;
      const indSupervisorId = mongoStudent.industrialSupervisor
        ? getPostgresId(mongoStudent.industrialSupervisor._id)
        : null;

      if (!userId || !departmentId) {
        logger.warn(
          `Student ${mongoStudent.matricNumber} skipped: Missing required fields`,
        );
        continue;
      }

      try {
        await prisma.student.create({
          data: {
            id: postgresId,
            userId,
            departmentId,
            matricNumber: mongoStudent.matricNumber || "",
            level: mongoStudent.level || 100,
            session: mongoStudent.session || "",
            cgpa: mongoStudent.cgpa || 0,
            departmentalSupervisorId: deptSupervisorId,
            industrialSupervisorId: indSupervisorId,
            hasPlacement: mongoStudent.hasPlacement || false,
            placementApproved: mongoStudent.placementApproved || false,
            trainingCompleted: mongoStudent.trainingCompleted || false,
            trainingStartDate: mongoStudent.trainingStartDate || null,
            trainingEndDate: mongoStudent.trainingEndDate || null,
            isActive: mongoStudent.isActive !== false,
            createdAt: mongoStudent.createdAt || new Date(),
            updatedAt: mongoStudent.updatedAt || new Date(),
          },
        });
        createdCount++;
      } catch (err) {
        logger.warn(
          `Student ${mongoStudent.matricNumber} skipped: ${err.message}`,
        );
      }
    }

    logMigrationProgress("Students", createdCount);
    return { total: mongoStudents.length, migrated: createdCount };
  } catch (error) {
    logger.error(`Error migrating Students: ${error.message}`);
    throw error;
  }
};

/**
 * Migrate SupervisorAssignments
 */
const migrateSupervisorAssignments = async () => {
  logger.info("\n--- Migrating SupervisorAssignments ---");
  try {
    const mongoAssignments = await SupervisorAssignment.find()
      .populate("supervisor")
      .populate("student")
      .lean();

    let createdCount = 0;

    for (const mongoAssignment of mongoAssignments) {
      const postgresId = getPostgresId(mongoAssignment._id);
      const supervisorId = getPostgresId(
        mongoAssignment.supervisor?._id || mongoAssignment.supervisor,
      );
      const studentId = getPostgresId(
        mongoAssignment.student?._id || mongoAssignment.student,
      );

      if (!supervisorId || !studentId) {
        logger.warn(
          `SupervisorAssignment skipped: Missing supervisor or student`,
        );
        continue;
      }

      try {
        await prisma.supervisorAssignment.create({
          data: {
            id: postgresId,
            supervisorId,
            studentId,
            assignedAt: mongoAssignment.assignedAt || new Date(),
            createdAt: mongoAssignment.createdAt || new Date(),
            updatedAt: mongoAssignment.updatedAt || new Date(),
          },
        });
        createdCount++;
      } catch (err) {
        logger.warn(`SupervisorAssignment skipped: ${err.message}`);
      }
    }

    logMigrationProgress("SupervisorAssignments", createdCount);
    return { total: mongoAssignments.length, migrated: createdCount };
  } catch (error) {
    logger.error(`Error migrating SupervisorAssignments: ${error.message}`);
    throw error;
  }
};

/**
 * Migrate Placements
 */
const migratePlacements = async () => {
  logger.info("\n--- Migrating Placements ---");
  try {
    const mongoPlacements = await Placement.find()
      .populate("student")
      .populate("industrialSupervisor")
      .lean();

    let createdCount = 0;

    for (const mongoPlacement of mongoPlacements) {
      const postgresId = getPostgresId(mongoPlacement._id);
      const studentId = getPostgresId(
        mongoPlacement.student?._id || mongoPlacement.student,
      );
      const supervisorId = mongoPlacement.industrialSupervisor
        ? getPostgresId(mongoPlacement.industrialSupervisor._id)
        : null;

      if (!studentId) {
        logger.warn(`Placement skipped: Student not found`);
        continue;
      }

      try {
        await prisma.placement.create({
          data: {
            id: postgresId,
            studentId,
            industrialSupervisorId: supervisorId,
            companyName: mongoPlacement.companyName || "",
            companyAddress: mongoPlacement.companyAddress || "",
            companyEmail: mongoPlacement.companyEmail || "",
            companyPhone: mongoPlacement.companyPhone || "",
            companyWebsite: mongoPlacement.companyWebsite || "",
            sector: mongoPlacement.sector || "",
            position: mongoPlacement.position || "",
            department: mongoPlacement.department || "",
            startDate: mongoPlacement.startDate || null,
            endDate: mongoPlacement.endDate || null,
            acceptanceLetterPath: mongoPlacement.acceptanceLetterPath || "",
            status: mongoPlacement.status || "pending",
            rejectionReason: mongoPlacement.rejectionReason || "",
            approvedAt: mongoPlacement.approvedAt || null,
            createdAt: mongoPlacement.createdAt || new Date(),
            updatedAt: mongoPlacement.updatedAt || new Date(),
          },
        });
        createdCount++;
      } catch (err) {
        logger.warn(
          `Placement for student ${studentId} skipped: ${err.message}`,
        );
      }
    }

    logMigrationProgress("Placements", createdCount);
    return { total: mongoPlacements.length, migrated: createdCount };
  } catch (error) {
    logger.error(`Error migrating Placements: ${error.message}`);
    throw error;
  }
};

/**
 * Migrate Logbooks
 */
const migrateLogbooks = async () => {
  logger.info("\n--- Migrating Logbooks ---");
  try {
    const mongoLogbooks = await Logbook.find()
      .populate("student")
      .populate("placement")
      .lean();

    let createdCount = 0;

    for (const mongoLogbook of mongoLogbooks) {
      const postgresId = getPostgresId(mongoLogbook._id);
      const studentId = getPostgresId(
        mongoLogbook.student?._id || mongoLogbook.student,
      );
      const placementId = mongoLogbook.placement
        ? getPostgresId(mongoLogbook.placement._id)
        : null;

      if (!studentId) {
        logger.warn(`Logbook skipped: Student not found`);
        continue;
      }

      try {
        await prisma.logbook.create({
          data: {
            id: postgresId,
            studentId,
            placementId,
            weekNumber: mongoLogbook.weekNumber || 1,
            startDate: mongoLogbook.startDate || null,
            endDate: mongoLogbook.endDate || null,
            tasksPerformed: mongoLogbook.tasksPerformed || "",
            skillsAcquired: mongoLogbook.skillsAcquired || "",
            challenges: mongoLogbook.challenges || "",
            lessonsLearned: mongoLogbook.lessonsLearned || "",
            status: mongoLogbook.status || "draft",
            submittedAt: mongoLogbook.submittedAt || null,
            approvedAt: mongoLogbook.approvedAt || null,
            createdAt: mongoLogbook.createdAt || new Date(),
            updatedAt: mongoLogbook.updatedAt || new Date(),
          },
        });
        createdCount++;
      } catch (err) {
        logger.warn(
          `Logbook for student ${studentId} week ${mongoLogbook.weekNumber} skipped: ${err.message}`,
        );
      }
    }

    logMigrationProgress("Logbooks", createdCount);
    return { total: mongoLogbooks.length, migrated: createdCount };
  } catch (error) {
    logger.error(`Error migrating Logbooks: ${error.message}`);
    throw error;
  }
};

/**
 * Migrate LogbookEvidence
 */
const migrateLogbookEvidence = async () => {
  logger.info("\n--- Migrating LogbookEvidence ---");
  try {
    const mongoLogbooks = await Logbook.find().lean();

    let createdCount = 0;

    for (const mongoLogbook of mongoLogbooks) {
      const logbookId = getPostgresId(mongoLogbook._id);
      const evidence = mongoLogbook.evidence || [];

      for (const file of evidence) {
        const postgresId = getPostgresId(file._id || generateUUID());

        try {
          await prisma.logbookEvidence.create({
            data: {
              id: postgresId,
              logbookId,
              fileName: file.fileName || file.name || "",
              filePath: file.filePath || file.path || "",
              fileType: file.fileType || file.type || "",
              uploadedAt: file.uploadedAt || new Date(),
            },
          });
          createdCount++;
        } catch (err) {
          logger.warn(`LogbookEvidence skipped: ${err.message}`);
        }
      }
    }

    logMigrationProgress("LogbookEvidence", createdCount);
    return { total: createdCount, migrated: createdCount };
  } catch (error) {
    logger.error(`Error migrating LogbookEvidence: ${error.message}`);
    throw error;
  }
};

/**
 * Migrate LogbookReviews
 */
const migrateLogbookReviews = async () => {
  logger.info("\n--- Migrating LogbookReviews ---");
  try {
    const mongoLogbooks = await Logbook.find()
      .populate("reviews.supervisor")
      .lean();

    let createdCount = 0;

    for (const mongoLogbook of mongoLogbooks) {
      const logbookId = getPostgresId(mongoLogbook._id);
      const reviews = mongoLogbook.reviews || [];
      const departmentalReview = mongoLogbook.departmentalReview;
      const industrialReview = mongoLogbook.industrialReview;

      // Migrate departmental review
      if (departmentalReview && departmentalReview.supervisor) {
        try {
          const supervisorId = getPostgresId(
            departmentalReview.supervisor._id || departmentalReview.supervisor,
          );
          await prisma.logbookReview.create({
            data: {
              id: generateUUID(),
              logbookId,
              supervisorId,
              supervisorType: "academic",
              comment: departmentalReview.comment || "",
              rating: departmentalReview.rating || 0,
              status: departmentalReview.status || "pending",
              reviewedAt: departmentalReview.reviewedAt || new Date(),
            },
          });
          createdCount++;
        } catch (err) {
          logger.warn(
            `Departmental review for logbook skipped: ${err.message}`,
          );
        }
      }

      // Migrate industrial review
      if (industrialReview && industrialReview.supervisor) {
        try {
          const supervisorId = getPostgresId(
            industrialReview.supervisor._id || industrialReview.supervisor,
          );
          await prisma.logbookReview.create({
            data: {
              id: generateUUID(),
              logbookId,
              supervisorId,
              supervisorType: "industrial",
              comment: industrialReview.comment || "",
              rating: industrialReview.rating || 0,
              status: industrialReview.status || "pending",
              reviewedAt: industrialReview.reviewedAt || new Date(),
            },
          });
          createdCount++;
        } catch (err) {
          logger.warn(`Industrial review for logbook skipped: ${err.message}`);
        }
      }
    }

    logMigrationProgress("LogbookReviews", createdCount);
    return { total: createdCount, migrated: createdCount };
  } catch (error) {
    logger.error(`Error migrating LogbookReviews: ${error.message}`);
    throw error;
  }
};

/**
 * Migrate Assessments
 */
const migrateAssessments = async () => {
  logger.info("\n--- Migrating Assessments ---");
  try {
    const mongoAssessments = await Assessment.find()
      .populate("student")
      .populate("supervisor")
      .populate("verifiedBy")
      .lean();

    let createdCount = 0;

    for (const mongoAssessment of mongoAssessments) {
      const postgresId = getPostgresId(mongoAssessment._id);
      const studentId = getPostgresId(
        mongoAssessment.student?._id || mongoAssessment.student,
      );
      const supervisorId = getPostgresId(
        mongoAssessment.supervisor?._id || mongoAssessment.supervisor,
      );
      const verifiedById = mongoAssessment.verifiedBy
        ? getPostgresId(mongoAssessment.verifiedBy._id)
        : null;

      if (!studentId || !supervisorId) {
        logger.warn(`Assessment skipped: Missing student or supervisor`);
        continue;
      }

      try {
        await prisma.assessment.create({
          data: {
            id: postgresId,
            studentId,
            supervisorId,
            type: mongoAssessment.type || "industrial",
            technical: mongoAssessment.technical || 0,
            communication: mongoAssessment.communication || 0,
            punctuality: mongoAssessment.punctuality || 0,
            initiative: mongoAssessment.initiative || 0,
            teamwork: mongoAssessment.teamwork || 0,
            professionalism: mongoAssessment.professionalism || 0,
            problemSolving: mongoAssessment.problemSolving || 0,
            adaptability: mongoAssessment.adaptability || 0,
            strengths: mongoAssessment.strengths || "",
            areasForImprovement: mongoAssessment.areasForImprovement || "",
            generalComment: mongoAssessment.generalComment || "",
            recommendation: mongoAssessment.recommendation || "good",
            grade: mongoAssessment.grade || "F",
            status: mongoAssessment.status || "pending",
            submittedAt: mongoAssessment.submittedAt || null,
            verifiedById,
            verificationNote: mongoAssessment.verificationNote || "",
            verifiedAt: mongoAssessment.verifiedAt || null,
            createdAt: mongoAssessment.createdAt || new Date(),
            updatedAt: mongoAssessment.updatedAt || new Date(),
          },
        });
        createdCount++;
      } catch (err) {
        logger.warn(`Assessment skipped: ${err.message}`);
      }
    }

    logMigrationProgress("Assessments", createdCount);
    return { total: mongoAssessments.length, migrated: createdCount };
  } catch (error) {
    logger.error(`Error migrating Assessments: ${error.message}`);
    throw error;
  }
};

/**
 * Migrate Attendance
 */
const migrateAttendance = async () => {
  logger.info("\n--- Migrating Attendance ---");
  try {
    const mongoAttendance = await Attendance.find()
      .populate("student")
      .populate("placement")
      .lean();

    let createdCount = 0;

    for (const record of mongoAttendance) {
      const postgresId = getPostgresId(record._id);
      const studentId = getPostgresId(record.student?._id || record.student);
      const placementId = record.placement
        ? getPostgresId(record.placement._id)
        : null;

      if (!studentId) {
        logger.warn("Attendance record skipped: Student not found");
        continue;
      }

      try {
        // Map punctuality enum if needed
        const punctualityMap = {
          ON_TIME: "ON_TIME",
          LATE: "LATE",
        };
        
        await prisma.attendance.create({
          data: {
            id: postgresId,
            studentId,
            placementId,
            date: record.date || new Date(),
            checkInTime: record.checkInTime || null,
            checkOutTime: record.checkOutTime || null,
            locationAddress: record.locationAddress || null,
            locationLatitude: record.latitude || record.locationLatitude || null,
            locationLongitude: record.longitude || record.locationLongitude || null,
            hoursWorked: record.hoursWorked || null,
            punctuality: record.punctuality || null,
            dayStatus: record.dayStatus || "INCOMPLETE",
            approvalStatus: record.approvalStatus || "PENDING",
            absenceReason: record.absenceReason || null,
            notes: record.notes || null,
            status: record.status || "present",
            supervisorId: record.supervisor
              ? getPostgresId(record.supervisor)
              : null,
            supervisorApprovedAt: record.supervisorApprovedAt || null,
            supervisorComment: record.supervisorComment || null,
            createdAt: record.createdAt || new Date(),
            updatedAt: record.updatedAt || new Date(),
          },
        });
        createdCount++;
      } catch (err) {
        logger.warn(`Attendance record skipped: ${err.message}`);
      }
    }

    logMigrationProgress("Attendance", createdCount);
    return { total: mongoAttendance.length, migrated: createdCount };
  } catch (error) {
    logger.error(`Error migrating Attendance: ${error.message}`);
    throw error;
  }
};

/**
 * Migrate Notifications
 */
const migrateNotifications = async () => {
  logger.info("\n--- Migrating Notifications ---");
  try {
    const mongoNotifications = await Notification.find()
      .populate("recipient")
      .lean();

    let createdCount = 0;

    for (const mongoNotif of mongoNotifications) {
      const postgresId = getPostgresId(mongoNotif._id);
      const recipientId = getPostgresId(
        mongoNotif.recipient?._id || mongoNotif.recipient,
      );

      if (!recipientId) {
        logger.warn(`Notification skipped: Recipient not found`);
        continue;
      }

      try {
        // Map notification type - convert uppercase to lowercase/underscore format
        const typeMap = {
          PLACEMENT_APPROVED: "placement_approved",
          PLACEMENT_REJECTED: "placement_rejected",
          SUPERVISOR_ASSIGNED: "supervisor_assigned",
          SUPERVISOR_UNASSIGNED: "supervisor_unassigned",
          LOGBOOK_COMMENT: "logbook_comment",
          LOGBOOK_APPROVED: "logbook_approved",
          LOGBOOK_REJECTED: "logbook_rejected",
          ASSESSMENT_SUBMITTED: "assessment_submitted",
          DEADLINE_REMINDER: "deadline_reminder",
          PASSWORD_RESET: "password_reset",
          ACCOUNT_CREATED: "account_created",
          GENERAL: "general",
        };

        const notificationType = typeMap[mongoNotif.type] || "general";

        // Map priority to lowercase
        const priorityMap = {
          LOW: "low",
          MEDIUM: "medium",
          HIGH: "high",
          URGENT: "urgent",
        };

        const notificationPriority =
          priorityMap[mongoNotif.priority] || "medium";

        await prisma.notification.create({
          data: {
            id: postgresId,
            recipientId,
            type: notificationType,
            title: mongoNotif.title || "",
            message: mongoNotif.message || "",
            priority: notificationPriority,
            isRead: mongoNotif.isRead || false,
            readAt: mongoNotif.readAt || null,
            relatedModel: mongoNotif.relatedModel || "",
            relatedId: mongoNotif.relatedId || "",
            actionLink: mongoNotif.actionLink || "",
            actionText: mongoNotif.actionText || "",
            emailSent: mongoNotif.emailSent || false,
            emailSentAt: mongoNotif.emailSentAt || null,
            createdAt: mongoNotif.createdAt || new Date(),
            // NOTE: Notification model does NOT have updatedAt field
          },
        });
        createdCount++;
      } catch (err) {
        logger.warn(`Notification skipped: ${err.message}`);
      }
    }

    logMigrationProgress("Notifications", createdCount);
    return { total: mongoNotifications.length, migrated: createdCount };
  } catch (error) {
    logger.error(`Error migrating Notifications: ${error.message}`);
    throw error;
  }
};

/**
 * Migrate NotificationPreferences
 */
const migrateNotificationPreferences = async () => {
  logger.info("\n--- Migrating NotificationPreferences ---");
  try {
    const mongoPrefs = await NotificationPreference.find()
      .populate("user")
      .lean();

    let createdCount = 0;

    for (const mongoPref of mongoPrefs) {
      const postgresId = getPostgresId(mongoPref._id);
      const userId = getPostgresId(mongoPref.user?._id || mongoPref.user);

      if (!userId) {
        logger.warn(`NotificationPreference skipped: User not found`);
        continue;
      }

      try {
        await prisma.notificationPreference.create({
          data: {
            id: postgresId,
            userId,
            emailNotifications: mongoPref.emailNotifications !== false,
            placementAlerts: mongoPref.placementAlerts !== false,
            systemUpdates: mongoPref.systemUpdates !== false,
            // createdAt and updatedAt handled by @default(now()) and @updatedAt
          },
        });
        createdCount++;
      } catch (err) {
        logger.warn(`NotificationPreference skipped: ${err.message}`);
      }
    }

    logMigrationProgress("NotificationPreferences", createdCount);
    return { total: mongoPrefs.length, migrated: createdCount };
  } catch (error) {
    logger.error(`Error migrating NotificationPreferences: ${error.message}`);
    throw error;
  }
};

/**
 * Migrate Invitations
 */
const migrateInvitations = async () => {
  logger.info("\n--- Migrating Invitations ---");
  try {
    const mongoInvitations = await Invitation.find()
      .populate("invitedBy")
      .populate("department")
      .lean();

    let createdCount = 0;

    for (const mongoInvite of mongoInvitations) {
      const postgresId = getPostgresId(mongoInvite._id);
      const invitedById = getPostgresId(
        mongoInvite.invitedBy?._id || mongoInvite.invitedBy,
      );
      const departmentId = mongoInvite.department
        ? getPostgresId(mongoInvite.department._id)
        : null;

      if (!invitedById) {
        logger.warn(`Invitation skipped: InvitedBy user not found`);
        continue;
      }

      // Determine invitedByRole based on invitedBy user's role
      const invitedByRole = mongoInvite.invitedBy?.role
        ? ["ADMIN", "FACULTY", "DEPARTMENT"].includes(mongoInvite.invitedBy.role.toUpperCase())
          ? "admin"
          : "coordinator"
        : "coordinator"; // Default to coordinator

      try {
        await prisma.invitation.create({
          data: {
            id: postgresId,
            email: mongoInvite.email || "",
            token: mongoInvite.token || "",
            role: mapRole(mongoInvite.role) || "student",
            status: mongoInvite.status || "pending",
            invitedById,
            invitedByRole,
            departmentId,
            matricNumber: mongoInvite.matricNumber || "",
            level: mongoInvite.level || 100,
            session: mongoInvite.session || "",
            expiresAt: mongoInvite.expiresAt || new Date(),
            acceptedAt: mongoInvite.acceptedAt || null,
            cancelledAt: mongoInvite.cancelledAt || null,
            resendCount: mongoInvite.resendCount || 0,
            lastResentAt: mongoInvite.lastResentAt || null,
            createdAt: mongoInvite.createdAt || new Date(),
            updatedAt: mongoInvite.updatedAt || new Date(),
          },
        });
        createdCount++;
      } catch (err) {
        if (err.code === "P2002") {
          logger.warn(
            `Invitation for ${mongoInvite.email} already exists, skipping`,
          );
        } else {
          logger.warn(`Invitation skipped: ${err.message}`);
        }
      }
    }

    logMigrationProgress("Invitations", createdCount);
    return { total: mongoInvitations.length, migrated: createdCount };
  } catch (error) {
    logger.error(`Error migrating Invitations: ${error.message}`);
    throw error;
  }
};

/**
 * Migrate SystemSettings
 */
const migrateSystemSettings = async () => {
  logger.info("\n--- Migrating SystemSettings ---");
  try {
    const mongoSettings = await SystemSettings.find().lean();

    let createdCount = 0;

    for (const mongoSetting of mongoSettings) {
      const postgresId = getPostgresId(mongoSetting._id);

      try {
        await prisma.systemSettings.create({
          data: {
            id: postgresId,
            settingKey: mongoSetting.settingKey || "",
            settingValue: mongoSetting.settingValue || "",
            description: mongoSetting.description || "",
            category: mongoSetting.category || "general",
            isActive: mongoSetting.isActive !== false,
            createdAt: mongoSetting.createdAt || new Date(),
            updatedAt: mongoSetting.updatedAt || new Date(),
          },
        });
        createdCount++;
      } catch (err) {
        logger.warn(`SystemSettings skipped: ${err.message}`);
      }
    }

    logMigrationProgress("SystemSettings", createdCount);
    return { total: mongoSettings.length, migrated: createdCount };
  } catch (error) {
    logger.error(`Error migrating SystemSettings: ${error.message}`);
    throw error;
  }
};

// ============================================================================
// VERIFICATION FUNCTIONS
// ============================================================================

/**
 * Verify data migration
 */
const verifyMigration = async () => {
  logger.info("\n=== VERIFYING DATA MIGRATION ===");

  const counts = {
    mongodb: {},
    postgresql: {},
  };

  // Get MongoDB counts
  try {
    counts.mongodb = {
      Users: await User.countDocuments(),
      Faculties: await Faculty.countDocuments(),
      Departments: await Department.countDocuments(),
      Students: await Student.countDocuments(),
      Supervisors: await Supervisor.countDocuments(),
      Placements: await Placement.countDocuments(),
      Logbooks: await Logbook.countDocuments(),
      Assessments: await Assessment.countDocuments(),
      Attendance: await Attendance.countDocuments(),
      Notifications: await Notification.countDocuments(),
    };
  } catch (error) {
    logger.error(`Error counting MongoDB records: ${error.message}`);
  }

  // Get PostgreSQL counts
  try {
    counts.postgresql = {
      Users: await prisma.user.count(),
      Faculties: await prisma.faculty.count(),
      Departments: await prisma.department.count(),
      Students: await prisma.student.count(),
      Supervisors: await prisma.supervisor.count(),
      Placements: await prisma.placement.count(),
      Logbooks: await prisma.logbook.count(),
      Assessments: await prisma.assessment.count(),
      Attendance: await prisma.attendance.count(),
      Notifications: await prisma.notification.count(),
    };
  } catch (error) {
    logger.error(`Error counting PostgreSQL records: ${error.message}`);
  }

  logger.info("\n--- Record Count Comparison ---");
  logger.info("Entity\t\t\tMongoDB\t\tPostgreSQL");
  logger.info("-".repeat(60));

  for (const entity of Object.keys(counts.mongodb)) {
    const mongoCount = counts.mongodb[entity];
    const pgCount = counts.postgresql[entity] || 0;
    const match = mongoCount === pgCount ? "✓" : "✗";
    logger.info(`${entity.padEnd(20)}\t${mongoCount}\t\t${pgCount}\t${match}`);
  }

  return counts;
};

// ============================================================================
// MAIN EXECUTION
// ============================================================================

const runMigration = async () => {
  try {
    logger.info("\n╔════════════════════════════════════════════════════════╗");
    logger.info("║ PHASE 5: MongoDB → PostgreSQL Data Migration          ║");
    logger.info("╚════════════════════════════════════════════════════════╝\n");

    // Connect to databases
    await connectMongoDB();

    logger.info("\nStarting data migration in dependency order...\n");

    // Run migrations in order
    const results = {};

    results.users = await migrateUsers();
    results.faculties = await migrateFaculties();
    results.departments = await migrateDepartments();
    results.supervisors = await migrateSupervisors();
    results.students = await migrateStudents();
    results.supervisorAssignments = await migrateSupervisorAssignments();
    results.placements = await migratePlacements();
    results.logbooks = await migrateLogbooks();
    results.logbookEvidence = await migrateLogbookEvidence();
    results.logbookReviews = await migrateLogbookReviews();
    results.assessments = await migrateAssessments();
    results.attendance = await migrateAttendance();
    results.notifications = await migrateNotifications();
    results.notificationPreferences = await migrateNotificationPreferences();
    results.invitations = await migrateInvitations();
    results.systemSettings = await migrateSystemSettings();

    // Verify migration
    const counts = await verifyMigration();

    logger.info("\n╔════════════════════════════════════════════════════════╗");
    logger.info("║ ✓ DATA MIGRATION COMPLETED                            ║");
    logger.info("╚════════════════════════════════════════════════════════╝");
    logger.info("\nID Mapping Statistics:");
    logger.info(`Total IDs mapped: ${Object.keys(idMap).length}`);
    logger.info("\n✓ Migration completed successfully!");
    logger.info("✓ Verify data integrity by checking PostgreSQL records");
    logger.info("✓ Ready to proceed with Phase 6 (Controller Updates)");

    process.exit(0);
  } catch (error) {
    logger.error(`\n✗ Migration failed: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  } finally {
    await disconnectMongoDB();
    await prisma.$disconnect();
  }
};

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

module.exports = {
  runMigration,
  getPostgresId,
  idMap,
};
