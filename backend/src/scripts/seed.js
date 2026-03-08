const { getPrismaClient } = require("../config/prisma");
const logger = require("../utils/logger");
const bcrypt = require("bcryptjs");
const { USER_ROLES } = require("../utils/constants");

const prisma = getPrismaClient();

/**
 * Sample data
 */
const sampleData = {
  admin: {
    email: "admin@siwes.edu",
    password: "Admin@123",
    firstName: "Malick",
    lastName: "Diof",
    role: USER_ROLES.ADMIN,
    passwordResetRequired: false,
    phone: "+2348012345678",
  },
  faculty: {
    name: "Faculty of Communication and Information Sciences",
    code: "CIS",
    description: "Faculty of Communication and Information Sciences",
  },
  department: {
    name: "Information Technology",
    code: "IFT",
    description: "Department of Information Technology",
  },
  student: {
    email: "student.it@siwes.edu",
    password: "Student@123",
    firstName: "Amina",
    lastName: "Bello",
    phone: "+2348091112233",
    matricNumber: "IT/23/0001",
    level: 400,
    session: "2025/2026",
  },
  academicSupervisor: {
    email: "acad.supervisor.it@siwes.edu",
    password: "Supervisor@123",
    firstName: "Ibrahim",
    lastName: "Musa",
    phone: "+2348092223344",
    qualification: "MSc Information Technology",
    yearsOfExperience: 8,
    specialization: "Software Engineering",
    staffId: "FCIS-IT-AS-001",
    officeLocation: "IT Building, Office 12",
  },
  industrialSupervisor: {
    email: "ind.supervisor@techcorp.ng",
    password: "Supervisor@123",
    firstName: "Chinonso",
    lastName: "Okafor",
    phone: "+2348093334455",
    companyName: "TechCorp Nigeria Ltd",
    companyAddress: "15 Adeola Odeku, Victoria Island, Lagos",
    position: "Lead Systems Engineer",
    qualification: "BEng Computer Engineering",
    yearsOfExperience: 10,
    specialization: "Infrastructure and Cloud Systems",
  },
  placement: {
    companyName: "TechCorp Nigeria Ltd",
    companyAddress: "15 Adeola Odeku, Victoria Island, Lagos",
    companyEmail: "hr@techcorp.ng",
    companyPhone: "+2348094445566",
    companyWebsite: "https://techcorp.ng",
    companySector: "Information Technology",
    position: "Software Engineering Intern",
    department: "Engineering",
    supervisorName: "Chinonso Okafor",
    supervisorEmail: "ind.supervisor@techcorp.ng",
    supervisorPhone: "+2348093334455",
    supervisorPosition: "Lead Systems Engineer",
    startDate: "2026-01-05",
    endDate: "2026-06-30",
    status: "approved",
  },
};

/**
 * Seed database
 */
const seedDatabase = async () => {
  try {
    logger.info("Starting database seeding...");

    // Create Admin
    logger.info("Ensuring admin user...");
    const existingAdmin = await prisma.user.findUnique({
      where: { email: sampleData.admin.email },
    });
    let admin = existingAdmin;

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(sampleData.admin.password, 12);
      admin = await prisma.user.create({
        data: {
          email: sampleData.admin.email,
          password: hashedPassword,
          firstName: sampleData.admin.firstName,
          lastName: sampleData.admin.lastName,
          role: sampleData.admin.role,
          passwordResetRequired: sampleData.admin.passwordResetRequired,
          phone: sampleData.admin.phone,
          isActive: true,
        },
      });
      logger.info(`Admin created: ${admin.email}`);
    } else {
      logger.info(`Admin already exists: ${admin.email}`);
    }

    logger.info("Creating faculty and department...");
    let faculty = await prisma.faculty.findUnique({
      where: { code: sampleData.faculty.code },
    });
    if (!faculty) {
      faculty = await prisma.faculty.create({
        data: {
          name: sampleData.faculty.name,
          code: sampleData.faculty.code,
          description: sampleData.faculty.description,
          createdById: admin.id,
          isActive: true,
        },
      });
      logger.info(`Faculty created: ${faculty.name}`);
    } else {
      logger.info(`Faculty already exists: ${faculty.name}`);
    }

    let department = await prisma.department.findFirst({
      where: {
        code: sampleData.department.code,
        facultyId: faculty.id,
      },
    });
    if (!department) {
      department = await prisma.department.create({
        data: {
          name: sampleData.department.name,
          code: sampleData.department.code,
          description: sampleData.department.description,
          facultyId: faculty.id,
          createdById: admin.id,
          isActive: true,
        },
      });
      logger.info(`Department created: ${department.name}`);
    } else {
      logger.info(`Department already exists: ${department.name}`);
    }

    logger.info("Creating student user and profile...");
    let studentUser = await prisma.user.findUnique({
      where: { email: sampleData.student.email },
    });
    if (!studentUser) {
      const studentPassword = await bcrypt.hash(sampleData.student.password, 12);
      studentUser = await prisma.user.create({
        data: {
          email: sampleData.student.email,
          password: studentPassword,
          firstName: sampleData.student.firstName,
          lastName: sampleData.student.lastName,
          role: USER_ROLES.STUDENT,
          passwordResetRequired: false,
          phone: sampleData.student.phone,
          departmentId: department.id,
          facultyId: faculty.id,
          isActive: true,
        },
      });
      logger.info(`Student user created: ${studentUser.email}`);
    } else {
      logger.info(`Student user already exists: ${studentUser.email}`);
    }

    let student = await prisma.student.findUnique({
      where: { userId: studentUser.id },
    });
    if (!student) {
      const existingMatric = await prisma.student.findUnique({
        where: { matricNumber: sampleData.student.matricNumber },
      });
      if (existingMatric) {
        student = existingMatric;
        logger.info(`Student profile already exists with matric: ${student.matricNumber}`);
      } else {
        student = await prisma.student.create({
          data: {
            userId: studentUser.id,
            matricNumber: sampleData.student.matricNumber,
            departmentId: department.id,
            level: sampleData.student.level,
            session: sampleData.student.session,
            isActive: true,
          },
        });
        logger.info(`Student profile created: ${student.matricNumber}`);
      }
    } else {
      logger.info(`Student profile already exists for user: ${studentUser.email}`);
    }

    logger.info("Creating academic supervisor user and profile...");
    let academicSupervisorUser = await prisma.user.findUnique({
      where: { email: sampleData.academicSupervisor.email },
    });
    if (!academicSupervisorUser) {
      const academicSupervisorPassword = await bcrypt.hash(
        sampleData.academicSupervisor.password,
        12,
      );
      academicSupervisorUser = await prisma.user.create({
        data: {
          email: sampleData.academicSupervisor.email,
          password: academicSupervisorPassword,
          firstName: sampleData.academicSupervisor.firstName,
          lastName: sampleData.academicSupervisor.lastName,
          role: USER_ROLES.ACADEMIC_SUPERVISOR,
          passwordResetRequired: false,
          phone: sampleData.academicSupervisor.phone,
          departmentId: department.id,
          facultyId: faculty.id,
          isActive: true,
        },
      });
      logger.info(`Academic supervisor user created: ${academicSupervisorUser.email}`);
    } else {
      logger.info(`Academic supervisor user already exists: ${academicSupervisorUser.email}`);
    }

    let academicSupervisor = await prisma.supervisor.findUnique({
      where: { userId: academicSupervisorUser.id },
    });
    if (!academicSupervisor) {
      academicSupervisor = await prisma.supervisor.create({
        data: {
          userId: academicSupervisorUser.id,
          type: "academic",
          departmentId: department.id,
          qualification: sampleData.academicSupervisor.qualification,
          yearsOfExperience: sampleData.academicSupervisor.yearsOfExperience,
          specialization: sampleData.academicSupervisor.specialization,
          staffId: sampleData.academicSupervisor.staffId,
          officeLocation: sampleData.academicSupervisor.officeLocation,
          maxStudents: 10,
          isActive: true,
          isAvailable: true,
        },
      });
      logger.info(`Academic supervisor profile created: ${academicSupervisorUser.email}`);
    } else {
      logger.info(`Academic supervisor profile already exists: ${academicSupervisorUser.email}`);
    }

    logger.info("Creating industrial supervisor user and profile...");
    let industrialSupervisorUser = await prisma.user.findUnique({
      where: { email: sampleData.industrialSupervisor.email },
    });
    if (!industrialSupervisorUser) {
      const industrialSupervisorPassword = await bcrypt.hash(
        sampleData.industrialSupervisor.password,
        12,
      );
      industrialSupervisorUser = await prisma.user.create({
        data: {
          email: sampleData.industrialSupervisor.email,
          password: industrialSupervisorPassword,
          firstName: sampleData.industrialSupervisor.firstName,
          lastName: sampleData.industrialSupervisor.lastName,
          role: USER_ROLES.INDUSTRIAL_SUPERVISOR,
          passwordResetRequired: false,
          phone: sampleData.industrialSupervisor.phone,
          isActive: true,
        },
      });
      logger.info(`Industrial supervisor user created: ${industrialSupervisorUser.email}`);
    } else {
      logger.info(
        `Industrial supervisor user already exists: ${industrialSupervisorUser.email}`,
      );
    }

    let industrialSupervisor = await prisma.supervisor.findUnique({
      where: { userId: industrialSupervisorUser.id },
    });
    if (!industrialSupervisor) {
      industrialSupervisor = await prisma.supervisor.create({
        data: {
          userId: industrialSupervisorUser.id,
          type: "industrial",
          companyName: sampleData.industrialSupervisor.companyName,
          companyAddress: sampleData.industrialSupervisor.companyAddress,
          position: sampleData.industrialSupervisor.position,
          qualification: sampleData.industrialSupervisor.qualification,
          yearsOfExperience: sampleData.industrialSupervisor.yearsOfExperience,
          specialization: sampleData.industrialSupervisor.specialization,
          maxStudents: 10,
          isActive: true,
          isAvailable: true,
        },
      });
      logger.info(`Industrial supervisor profile created: ${industrialSupervisorUser.email}`);
    } else {
      logger.info(
        `Industrial supervisor profile already exists: ${industrialSupervisorUser.email}`,
      );
    }

    logger.info("Creating initial supervisor assignment...");
    const existingAssignment = await prisma.supervisorAssignment.findFirst({
      where: {
        studentId: student.id,
        supervisorId: academicSupervisor.id,
        status: "active",
      },
    });
    if (!existingAssignment) {
      await prisma.supervisorAssignment.create({
        data: {
          studentId: student.id,
          supervisorId: academicSupervisor.id,
          status: "active",
        },
      });
      logger.info("Supervisor assignment created successfully");
    } else {
      logger.info("Supervisor assignment already exists");
    }

    logger.info("Ensuring student placement...");
    let placement = await prisma.placement.findFirst({
      where: {
        studentId: student.id,
        companyName: sampleData.placement.companyName,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!placement) {
      placement = await prisma.placement.create({
        data: {
          studentId: student.id,
          companyName: sampleData.placement.companyName,
          companyAddress: sampleData.placement.companyAddress,
          companyEmail: sampleData.placement.companyEmail,
          companyPhone: sampleData.placement.companyPhone,
          companyWebsite: sampleData.placement.companyWebsite,
          companySector: sampleData.placement.companySector,
          position: sampleData.placement.position,
          department: sampleData.placement.department,
          supervisorName: sampleData.placement.supervisorName,
          supervisorEmail: sampleData.placement.supervisorEmail,
          supervisorPhone: sampleData.placement.supervisorPhone,
          supervisorPosition: sampleData.placement.supervisorPosition,
          startDate: new Date(sampleData.placement.startDate),
          endDate: new Date(sampleData.placement.endDate),
          status: sampleData.placement.status,
          approvedAt:
            sampleData.placement.status === "approved" ? new Date() : null,
          industrialSupervisorId: industrialSupervisor.id,
          reviewedById: admin.id,
          reviewedAt: new Date(),
        },
      });
      logger.info("Placement created successfully");
    } else {
      logger.info("Placement already exists");
    }

    await prisma.student.update({
      where: { id: student.id },
      data: {
        hasPlacement: true,
        placementApproved: placement.status === "approved",
        currentPlacementId: placement.id,
        industrialSupervisorId: industrialSupervisor.id,
        trainingStartDate: placement.startDate,
        trainingEndDate: placement.endDate,
      },
    });
    logger.info("Student placement flags synchronized");

    logger.info("╔════════════════════════════════════════════════╗");
    logger.info("║  Database seeding completed successfully!      ║");
    logger.info("╠════════════════════════════════════════════════╣");
    logger.info("║  Login credentials:                             ║");
    logger.info("║  Admin: admin@siwes.edu / Admin@123            ║");
    logger.info("║  Student: student.it@siwes.edu / Student@123   ║");
    logger.info("║  Academic Sup: acad.supervisor.it@siwes.edu    ║");
    logger.info("║               / Supervisor@123                 ║");
    logger.info("║  Industrial Sup: ind.supervisor@techcorp.ng    ║");
    logger.info("║                  / Supervisor@123              ║");
    logger.info("╚════════════════════════════════════════════════╝");

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
    logger.error(error.stack);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
