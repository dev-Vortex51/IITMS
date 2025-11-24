/**
 * Database Seeding Script
 * Populates database with comprehensive sample data for development/testing
 * Includes: Users, Faculties, Departments, Students, Supervisors, Placement,
 * Logbooks, Assessments, Notifications.
 */

const mongoose = require("mongoose");
const { connectDB, disconnectDB } = require("../config/database");
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
} = require("../models");
const logger = require("../utils/logger");
const {
  USER_ROLES,
  PLACEMENT_STATUS,
  LOGBOOK_STATUS,
  ASSESSMENT_STATUS,
  ASSESSMENT_TYPES,
  NOTIFICATION_TYPES,
} = require("../utils/constants");

/**
 * Sample data
 */
const sampleData = {
  admin: {
    email: "admin@siwes.edu",
    password: "Admin@123",
    firstName: "System",
    lastName: "Administrator",
    role: USER_ROLES.ADMIN,
    isFirstLogin: false,
    passwordResetRequired: false,
    phone: "+2348012345678",
  },

  faculties: [
    {
      name: "Faculty of Science",
      code: "SCI",
      description: "Faculty of Science and Technology",
    },
    {
      name: "Faculty of Engineering",
      code: "ENG",
      description: "Faculty of Engineering",
    },
    {
      name: "Faculty of Communication Science",
      code: "COMM",
      description: "Faculty of Communication Science",
    },
    {
      name: "Faculty of Management Sciences",
      code: "MGT",
      description: "Faculty of Management Sciences",
    },
    {
      name: "Faculty of Environmental Sciences",
      code: "ENV",
      description: "Faculty of Environmental Sciences",
    },
    {
      name: "Faculty of Arts",
      code: "ARTS",
      description: "Faculty of Arts and Humanities",
    },
    {
      name: "Faculty of Social Sciences",
      code: "SOC",
      description: "Faculty of Social Sciences",
    },
    {
      name: "Faculty of Medicine",
      code: "MED",
      description: "Faculty of Medicine and Health Sciences",
    },
  ],

  departments: [
    // Faculty of Science
    {
      name: "Computer Science",
      code: "CSC",
      description: "Department of Computer Science",
      facultyCode: "SCI",
    },
    {
      name: "Software Engineering",
      code: "SWE",
      description: "Department of Software Engineering",
      facultyCode: "SCI",
    },
    {
      name: "Mathematics",
      code: "MTH",
      description: "Department of Mathematics",
      facultyCode: "SCI",
    },
    {
      name: "Physics",
      code: "PHY",
      description: "Department of Physics",
      facultyCode: "SCI",
    },
    {
      name: "Chemistry",
      code: "CHM",
      description: "Department of Chemistry",
      facultyCode: "SCI",
    },
    // Faculty of Engineering
    {
      name: "Civil Engineering",
      code: "CVE",
      description: "Department of Civil Engineering",
      facultyCode: "ENG",
    },
    {
      name: "Mechanical Engineering",
      code: "MEE",
      description: "Department of Mechanical Engineering",
      facultyCode: "ENG",
    },
    {
      name: "Electrical Engineering",
      code: "EEE",
      description: "Department of Electrical Engineering",
      facultyCode: "ENG",
    },
    {
      name: "Chemical Engineering",
      code: "CHE",
      description: "Department of Chemical Engineering",
      facultyCode: "ENG",
    },
    // Faculty of Communication Science
    {
      name: "Telecommunications Science",
      code: "TEL",
      description: "Department of Telecommunications Science",
      facultyCode: "COMM",
    },
    {
      name: "Mass Communication",
      code: "MAC",
      description: "Department of Mass Communication",
      facultyCode: "COMM",
    },
    {
      name: "Information Technology",
      code: "IFT",
      description: "Department of Information Technology",
      facultyCode: "COMM",
    },
    // Faculty of Management Sciences
    {
      name: "Business Administration",
      code: "BUA",
      description: "Department of Business Administration",
      facultyCode: "MGT",
    },
    {
      name: "Accounting",
      code: "ACC",
      description: "Department of Accounting",
      facultyCode: "MGT",
    },
    {
      name: "Marketing",
      code: "MKT",
      description: "Department of Marketing",
      facultyCode: "MGT",
    },
    // Faculty of Environmental Sciences
    {
      name: "Environmental Science",
      code: "EVS",
      description: "Department of Environmental Science",
      facultyCode: "ENV",
    },
    {
      name: "Geography",
      code: "GEO",
      description: "Department of Geography",
      facultyCode: "ENV",
    },
    // Faculty of Arts
    {
      name: "English Language",
      code: "ENG",
      description: "Department of English Language",
      facultyCode: "ARTS",
    },
    {
      name: "History",
      code: "HIS",
      description: "Department of History",
      facultyCode: "ARTS",
    },
    // Faculty of Social Sciences
    {
      name: "Economics",
      code: "ECO",
      description: "Department of Economics",
      facultyCode: "SOC",
    },
    {
      name: "Political Science",
      code: "POL",
      description: "Department of Political Science",
      facultyCode: "SOC",
    },
    // Faculty of Medicine
    {
      name: "Medicine and Surgery",
      code: "MED",
      description: "Department of Medicine and Surgery",
      facultyCode: "MED",
    },
    {
      name: "Nursing",
      code: "NUR",
      description: "Department of Nursing",
      facultyCode: "MED",
    },
  ],

  coordinators: [
    // Faculty of Science Coordinators
    {
      email: "coordinator.csc@siwes.edu",
      password: "Coord@2024",
      firstName: "John",
      lastName: "Adebayo",
      role: USER_ROLES.COORDINATOR,
      phone: "+2348012345679",
      departmentCode: "CSC",
    },
    {
      email: "coordinator.swe@siwes.edu",
      password: "Coord@2024",
      firstName: "Sarah",
      lastName: "Okafor",
      role: USER_ROLES.COORDINATOR,
      phone: "+2348012345680",
      departmentCode: "SWE",
    },
    {
      email: "coordinator.mth@siwes.edu",
      password: "Coord@2024",
      firstName: "Michael",
      lastName: "Ibrahim",
      role: USER_ROLES.COORDINATOR,
      phone: "+2348012345681",
      departmentCode: "MTH",
    },
    {
      email: "coordinator.phy@siwes.edu",
      password: "Coord@2024",
      firstName: "Grace",
      lastName: "Eze",
      role: USER_ROLES.COORDINATOR,
      phone: "+2348012345682",
      departmentCode: "PHY",
    },
    {
      email: "coordinator.chm@siwes.edu",
      password: "Coord@2024",
      firstName: "David",
      lastName: "Bello",
      role: USER_ROLES.COORDINATOR,
      phone: "+2348012345683",
      departmentCode: "CHM",
    },
    // Faculty of Engineering Coordinators
    {
      email: "coordinator.cve@siwes.edu",
      password: "Coord@2024",
      firstName: "Ahmed",
      lastName: "Hassan",
      role: USER_ROLES.COORDINATOR,
      phone: "+2348012345684",
      departmentCode: "CVE",
    },
    {
      email: "coordinator.mee@siwes.edu",
      password: "Coord@2024",
      firstName: "Jennifer",
      lastName: "Nwosu",
      role: USER_ROLES.COORDINATOR,
      phone: "+2348012345685",
      departmentCode: "MEE",
    },
    {
      email: "coordinator.eee@siwes.edu",
      password: "Coord@2024",
      firstName: "Babatunde",
      lastName: "Olawale",
      role: USER_ROLES.COORDINATOR,
      phone: "+2348012345686",
      departmentCode: "EEE",
    },
    {
      email: "coordinator.che@siwes.edu",
      password: "Coord@2024",
      firstName: "Fatima",
      lastName: "Sani",
      role: USER_ROLES.COORDINATOR,
      phone: "+2348012345687",
      departmentCode: "CHE",
    },
    // Faculty of Communication Science Coordinators
    {
      email: "coordinator.tel@siwes.edu",
      password: "Coord@2024",
      firstName: "Emmanuel",
      lastName: "Ukwu",
      role: USER_ROLES.COORDINATOR,
      phone: "+2348012345688",
      departmentCode: "TEL",
    },
    {
      email: "coordinator.mac@siwes.edu",
      password: "Coord@2024",
      firstName: "Blessing",
      lastName: "Adamu",
      role: USER_ROLES.COORDINATOR,
      phone: "+2348012345689",
      departmentCode: "MAC",
    },
    {
      email: "coordinator.ift@siwes.edu",
      password: "Coord@2024",
      firstName: "Chidi",
      lastName: "Okonkwo",
      role: USER_ROLES.COORDINATOR,
      phone: "+2348012345690",
      departmentCode: "IFT",
    },
    // Faculty of Management Sciences Coordinators
    {
      email: "coordinator.bua@siwes.edu",
      password: "Coord@2024",
      firstName: "Kemi",
      lastName: "Adesanya",
      role: USER_ROLES.COORDINATOR,
      phone: "+2348012345691",
      departmentCode: "BUA",
    },
    {
      email: "coordinator.acc@siwes.edu",
      password: "Coord@2024",
      firstName: "Musa",
      lastName: "Garba",
      role: USER_ROLES.COORDINATOR,
      phone: "+2348012345692",
      departmentCode: "ACC",
    },
    {
      email: "coordinator.mkt@siwes.edu",
      password: "Coord@2024",
      firstName: "Chioma",
      lastName: "Okoro",
      role: USER_ROLES.COORDINATOR,
      phone: "+2348012345693",
      departmentCode: "MKT",
    },
  ],

  students: [
    // Computer Science Students
    {
      email: "alice.johnson@student.siwes.edu",
      password: "Student@2024",
      firstName: "Alice",
      lastName: "Johnson",
      role: USER_ROLES.STUDENT,
      matricNumber: "CSC/2021/001",
      level: 300,
      session: "2024/2025",
      phone: "+2348023456701",
      departmentCode: "CSC",
    },
    {
      email: "bob.smith@student.siwes.edu",
      password: "Student@2024",
      firstName: "Bob",
      lastName: "Smith",
      role: USER_ROLES.STUDENT,
      matricNumber: "CSC/2021/002",
      level: 300,
      session: "2024/2025",
      phone: "+2348023456702",
      departmentCode: "CSC",
    },
    {
      email: "charlie.brown@student.siwes.edu",
      password: "Student@2024",
      firstName: "Charlie",
      lastName: "Brown",
      role: USER_ROLES.STUDENT,
      matricNumber: "CSC/2021/003",
      level: 300,
      session: "2024/2025",
      phone: "+2348023456703",
      departmentCode: "CSC",
    },
    // Software Engineering Students
    {
      email: "diana.prince@student.siwes.edu",
      password: "Student@2024",
      firstName: "Diana",
      lastName: "Prince",
      role: USER_ROLES.STUDENT,
      matricNumber: "SWE/2021/001",
      level: 300,
      session: "2024/2025",
      phone: "+2348023456704",
      departmentCode: "SWE",
    },
    {
      email: "elvis.presley@student.siwes.edu",
      password: "Student@2024",
      firstName: "Elvis",
      lastName: "Presley",
      role: USER_ROLES.STUDENT,
      matricNumber: "SWE/2021/002",
      level: 300,
      session: "2024/2025",
      phone: "+2348023456705",
      departmentCode: "SWE",
    },
    // Civil Engineering Students
    {
      email: "fiona.gallagher@student.siwes.edu",
      password: "Student@2024",
      firstName: "Fiona",
      lastName: "Gallagher",
      role: USER_ROLES.STUDENT,
      matricNumber: "CVE/2021/001",
      level: 300,
      session: "2024/2025",
      phone: "+2348023456706",
      departmentCode: "CVE",
    },
    {
      email: "george.washington@student.siwes.edu",
      password: "Student@2024",
      firstName: "George",
      lastName: "Washington",
      role: USER_ROLES.STUDENT,
      matricNumber: "CVE/2021/002",
      level: 300,
      session: "2024/2025",
      phone: "+2348023456707",
      departmentCode: "CVE",
    },
    // Mechanical Engineering Students
    {
      email: "helen.keller@student.siwes.edu",
      password: "Student@2024",
      firstName: "Helen",
      lastName: "Keller",
      role: USER_ROLES.STUDENT,
      matricNumber: "MEE/2021/001",
      level: 300,
      session: "2024/2025",
      phone: "+2348023456708",
      departmentCode: "MEE",
    },
    {
      email: "isaac.newton@student.siwes.edu",
      password: "Student@2024",
      firstName: "Isaac",
      lastName: "Newton",
      role: USER_ROLES.STUDENT,
      matricNumber: "MEE/2021/002",
      level: 300,
      session: "2024/2025",
      phone: "+2348023456709",
      departmentCode: "MEE",
    },
    // Telecommunications Science Students
    {
      email: "jane.doe@student.siwes.edu",
      password: "Student@2024",
      firstName: "Jane",
      lastName: "Doe",
      role: USER_ROLES.STUDENT,
      matricNumber: "TEL/2021/001",
      level: 300,
      session: "2024/2025",
      phone: "+2348023456710",
      departmentCode: "TEL",
    },
    {
      email: "kevin.hart@student.siwes.edu",
      password: "Student@2024",
      firstName: "Kevin",
      lastName: "Hart",
      role: USER_ROLES.STUDENT,
      matricNumber: "TEL/2021/002",
      level: 300,
      session: "2024/2025",
      phone: "+2348023456711",
      departmentCode: "TEL",
    },
    // Business Administration Students
    {
      email: "lucy.liu@student.siwes.edu",
      password: "Student@2024",
      firstName: "Lucy",
      lastName: "Liu",
      role: USER_ROLES.STUDENT,
      matricNumber: "BUA/2021/001",
      level: 300,
      session: "2024/2025",
      phone: "+2348023456712",
      departmentCode: "BUA",
    },
    {
      email: "mike.tyson@student.siwes.edu",
      password: "Student@2024",
      firstName: "Mike",
      lastName: "Tyson",
      role: USER_ROLES.STUDENT,
      matricNumber: "BUA/2021/002",
      level: 300,
      session: "2024/2025",
      phone: "+2348023456713",
      departmentCode: "BUA",
    },
    // Mathematics Students
    {
      email: "nancy.drew@student.siwes.edu",
      password: "Student@2024",
      firstName: "Nancy",
      lastName: "Drew",
      role: USER_ROLES.STUDENT,
      matricNumber: "MTH/2021/001",
      level: 300,
      session: "2024/2025",
      phone: "+2348023456714",
      departmentCode: "MTH",
    },
    {
      email: "oscar.wilde@student.siwes.edu",
      password: "Student@2024",
      firstName: "Oscar",
      lastName: "Wilde",
      role: USER_ROLES.STUDENT,
      matricNumber: "MTH/2021/002",
      level: 300,
      session: "2024/2025",
      phone: "+2348023456715",
      departmentCode: "MTH",
    },
    // Physics Students
    {
      email: "peter.parker@student.siwes.edu",
      password: "Student@2024",
      firstName: "Peter",
      lastName: "Parker",
      role: USER_ROLES.STUDENT,
      matricNumber: "PHY/2021/001",
      level: 300,
      session: "2024/2025",
      phone: "+2348023456716",
      departmentCode: "PHY",
    },
    {
      email: "queen.elizabeth@student.siwes.edu",
      password: "Student@2024",
      firstName: "Queen",
      lastName: "Elizabeth",
      role: USER_ROLES.STUDENT,
      matricNumber: "PHY/2021/002",
      level: 300,
      session: "2024/2025",
      phone: "+2348023456717",
      departmentCode: "PHY",
    },
  ],

  supervisors: [
    // Departmental Supervisors
    {
      email: "david.supervisor@siwes.edu",
      password: "Super@2024",
      firstName: "David",
      lastName: "Oluwaseun",
      role: USER_ROLES.DEPT_SUPERVISOR,
      type: "departmental",
      phone: "+2348034567801",
      qualification: "PhD Computer Science",
      yearsOfExperience: 12,
      departmentCode: "CSC",
    },
    {
      email: "mary.supervisor@siwes.edu",
      password: "Super@2024",
      firstName: "Mary",
      lastName: "Adebisi",
      role: USER_ROLES.DEPT_SUPERVISOR,
      type: "departmental",
      phone: "+2348034567802",
      qualification: "PhD Software Engineering",
      yearsOfExperience: 8,
      departmentCode: "SWE",
    },
    {
      email: "james.supervisor@siwes.edu",
      password: "Super@2024",
      firstName: "James",
      lastName: "Okafor",
      role: USER_ROLES.DEPT_SUPERVISOR,
      type: "departmental",
      phone: "+2348034567803",
      qualification: "PhD Civil Engineering",
      yearsOfExperience: 15,
      departmentCode: "CVE",
    },
    {
      email: "ruth.supervisor@siwes.edu",
      password: "Super@2024",
      firstName: "Ruth",
      lastName: "Hassan",
      role: USER_ROLES.DEPT_SUPERVISOR,
      type: "departmental",
      phone: "+2348034567804",
      qualification: "PhD Mechanical Engineering",
      yearsOfExperience: 10,
      departmentCode: "MEE",
    },
    {
      email: "paul.supervisor@siwes.edu",
      password: "Super@2024",
      firstName: "Paul",
      lastName: "Emeka",
      role: USER_ROLES.DEPT_SUPERVISOR,
      type: "departmental",
      phone: "+2348034567805",
      qualification: "PhD Mathematics",
      yearsOfExperience: 18,
      departmentCode: "MTH",
    },
    // Industrial Supervisors
    {
      email: "irene.industry@techcorp.com",
      password: "Super@2024",
      firstName: "Irene",
      lastName: "Akinola",
      role: USER_ROLES.INDUSTRIAL_SUPERVISOR,
      type: "industrial",
      phone: "+2348034567806",
      qualification: "MSc Software Engineering",
      yearsOfExperience: 7,
      companyName: "TechCorp Ltd",
      companyAddress: "42 Innovation Way, Victoria Island, Lagos",
      position: "Senior Software Engineer",
    },
    {
      email: "samuel.manager@globaltech.com",
      password: "Super@2024",
      firstName: "Samuel",
      lastName: "Adeyemi",
      role: USER_ROLES.INDUSTRIAL_SUPERVISOR,
      type: "industrial",
      phone: "+2348034567807",
      qualification: "BSc Computer Science",
      yearsOfExperience: 12,
      companyName: "GlobalTech Solutions",
      companyAddress: "15 Broad Street, Marina, Lagos",
      position: "Project Manager",
    },
    {
      email: "funmi.lead@datatech.ng",
      password: "Super@2024",
      firstName: "Funmi",
      lastName: "Babatunde",
      role: USER_ROLES.INDUSTRIAL_SUPERVISOR,
      type: "industrial",
      phone: "+2348034567808",
      qualification: "MSc Data Science",
      yearsOfExperience: 6,
      companyName: "DataTech Nigeria",
      companyAddress: "8 Adeola Odeku Street, Victoria Island, Lagos",
      position: "Team Lead",
    },
    {
      email: "chinedu.engineer@buildcorp.com",
      password: "Super@2024",
      firstName: "Chinedu",
      lastName: "Okwu",
      role: USER_ROLES.INDUSTRIAL_SUPERVISOR,
      type: "industrial",
      phone: "+2348034567809",
      qualification: "MSc Structural Engineering",
      yearsOfExperience: 9,
      companyName: "BuildCorp Engineering",
      companyAddress: "25 Ahmadu Bello Way, Abuja",
      position: "Senior Engineer",
    },
    {
      email: "aisha.director@fintech.ng",
      password: "Super@2024",
      firstName: "Aisha",
      lastName: "Yusuf",
      role: USER_ROLES.INDUSTRIAL_SUPERVISOR,
      type: "industrial",
      phone: "+2348034567810",
      qualification: "MBA Finance",
      yearsOfExperience: 11,
      companyName: "FinTech Nigeria Ltd",
      companyAddress: "12 Kofo Abayomi Street, Victoria Island, Lagos",
      position: "Operations Director",
    },
    {
      email: "benjamin.cto@innovate.com",
      password: "Super@2024",
      firstName: "Benjamin",
      lastName: "Eze",
      role: USER_ROLES.INDUSTRIAL_SUPERVISOR,
      type: "industrial",
      phone: "+2348034567811",
      qualification: "PhD Computer Engineering",
      yearsOfExperience: 14,
      companyName: "InnovateTech Hub",
      companyAddress: "7 Ademola Adetokunbo Crescent, Wuse 2, Abuja",
      position: "Chief Technology Officer",
    },
  ],
};

/**
 * Seed database
 */
const seedDatabase = async () => {
  try {
    logger.info("Starting database seeding...");

    // Connect to database
    await connectDB();

    // Clear existing data (ordered to respect dependencies)
    logger.info("Clearing existing data...");
    await Notification.deleteMany({});
    await Assessment.deleteMany({});
    await Logbook.deleteMany({});
    await Placement.deleteMany({});
    await Supervisor.deleteMany({});
    await Student.deleteMany({});
    await Department.deleteMany({});
    await Faculty.deleteMany({});
    await User.deleteMany({});

    // Create Admin
    logger.info("Creating admin user...");
    const admin = await User.create(sampleData.admin);
    logger.info(`Admin created: ${admin.email}`);

    // Create Faculties
    logger.info("Creating faculties...");
    const faculties = [];
    for (const facultyData of sampleData.faculties) {
      const faculty = await Faculty.create({
        ...facultyData,
        createdBy: admin._id,
      });
      faculties.push(faculty);
      logger.info(`Faculty created: ${faculty.name}`);
    }

    // Create Departments
    logger.info("Creating departments...");
    const departments = [];
    const departmentMap = {}; // Map department codes to department objects
    for (const deptData of sampleData.departments) {
      // Find the correct faculty by code
      const faculty = faculties.find((f) => f.code === deptData.facultyCode);
      if (!faculty) {
        logger.error(`Faculty not found for code: ${deptData.facultyCode}`);
        continue;
      }

      const department = await Department.create({
        name: deptData.name,
        code: deptData.code,
        description: deptData.description,
        faculty: faculty._id,
        createdBy: admin._id,
      });
      departments.push(department);
      departmentMap[deptData.code] = department;
      logger.info(
        `Department created: ${department.name} (Faculty: ${faculty.name})`
      );
    }

    // Create Coordinators
    logger.info("Creating coordinators...");
    const coordinators = [];
    for (const coordData of sampleData.coordinators) {
      // Find the correct department by code
      const assignedDepartment = departmentMap[coordData.departmentCode];
      if (!assignedDepartment) {
        logger.error(
          `Department not found for code: ${coordData.departmentCode}`
        );
        continue;
      }

      const coordinator = await User.create({
        email: coordData.email,
        password: coordData.password,
        firstName: coordData.firstName,
        lastName: coordData.lastName,
        role: coordData.role,
        phone: coordData.phone,
        department: assignedDepartment._id, // Assign department to coordinator
        faculty: assignedDepartment.faculty, // Assign faculty from department
        isFirstLogin: false,
        passwordResetRequired: false,
      });
      coordinators.push(coordinator);

      // Add to department coordinators array
      await assignedDepartment.updateOne({
        $addToSet: { coordinators: coordinator._id },
      });
      logger.info(
        `Coordinator created: ${coordinator.email} (Dept: ${assignedDepartment.name})`
      );
    }

    // Create Students
    logger.info("Creating students...");
    for (const studentData of sampleData.students) {
      // Find the correct department by code
      const studentDepartment = departmentMap[studentData.departmentCode];
      if (!studentDepartment) {
        logger.error(
          `Department not found for student: ${studentData.departmentCode}`
        );
        continue;
      }

      // Find coordinator for this department
      const departmentCoordinator = coordinators.find(
        (coord) =>
          coord.department.toString() === studentDepartment._id.toString()
      );

      const user = await User.create({
        email: studentData.email,
        password: studentData.password,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        role: studentData.role,
        phone: studentData.phone,
        isFirstLogin: false,
        passwordResetRequired: false,
      });

      const student = await Student.create({
        user: user._id,
        matricNumber: studentData.matricNumber,
        department: studentDepartment._id,
        level: studentData.level,
        session: studentData.session,
        createdBy: departmentCoordinator
          ? departmentCoordinator._id
          : admin._id,
      });

      logger.info(
        `Student created: ${user.email} (${student.matricNumber}) - Dept: ${studentDepartment.name}`
      );
    }

    // Create Supervisors (departmental + industrial)
    logger.info("Creating supervisors...");
    const supervisorsCreated = [];
    for (const supervisorData of sampleData.supervisors) {
      // Assign department for departmental supervisors
      let assignedDept = null;
      if (
        supervisorData.type === "departmental" &&
        supervisorData.departmentCode
      ) {
        assignedDept = departmentMap[supervisorData.departmentCode];
        if (!assignedDept) {
          logger.error(
            `Department not found for supervisor: ${supervisorData.departmentCode}`
          );
          continue;
        }
      }

      const supUser = await User.create({
        email: supervisorData.email,
        password: supervisorData.password,
        firstName: supervisorData.firstName,
        lastName: supervisorData.lastName,
        role: supervisorData.role,
        phone: supervisorData.phone,
        department: assignedDept?._id, // Set department for departmental supervisors
        faculty: assignedDept?.faculty, // Set faculty from department
        isFirstLogin: false,
        passwordResetRequired: false,
      });

      const supervisor = await Supervisor.create({
        user: supUser._id,
        type: supervisorData.type,
        department: assignedDept?._id,
        companyName: supervisorData.companyName,
        companyAddress: supervisorData.companyAddress,
        position: supervisorData.position,
        qualification: supervisorData.qualification,
        yearsOfExperience: supervisorData.yearsOfExperience,
        createdBy: coordinators[0]._id,
      });
      supervisorsCreated.push(supervisor);
      logger.info(`Supervisor created: ${supUser.email}`);
    }

    // Assign departmental supervisor to first student
    const firstStudent = await Student.findOne({
      matricNumber: sampleData.students[0].matricNumber,
    });
    const deptSupervisor = supervisorsCreated.find(
      (s) => s.type === "departmental"
    );
    if (firstStudent && deptSupervisor) {
      deptSupervisor.assignedStudents.push(firstStudent._id);
      await deptSupervisor.save();
      firstStudent.departmentalSupervisor = deptSupervisor._id;
      await firstStudent.save();
      logger.info(
        `Assigned departmental supervisor to ${firstStudent.matricNumber}`
      );
    }

    // Create approved placement for first student
    logger.info("Creating placement for first student...");
    const industrialSupervisor = supervisorsCreated.find(
      (s) => s.type === "industrial"
    );
    const startDate = new Date();
    const endDate = new Date(Date.now() + 84 * 24 * 60 * 60 * 1000); // ~12 weeks
    const placement = await Placement.create({
      student: firstStudent._id,
      companyName: industrialSupervisor?.companyName || "TechCorp Ltd",
      companyAddress:
        industrialSupervisor?.companyAddress || "42 Innovation Way, Lagos",
      companyEmail: "hr@techcorp.com",
      companyPhone: "+2348012345999",
      companyWebsite: "https://techcorp.example.com",
      position: "Software Intern",
      department: "R&D",
      startDate,
      endDate,
      acceptanceLetter: "/uploads/acceptance_letters/sample.pdf",
      status: PLACEMENT_STATUS.APPROVED,
      reviewedBy: coordinators[0]._id,
      reviewedAt: new Date(),
      reviewComment: "Approved during seeding.",
      industrialSupervisor: industrialSupervisor?._id,
      supervisorAssignedAt: new Date(),
      expectedLearningOutcomes:
        "Gain practical software development experience.",
    });
    logger.info(`Placement approved for ${firstStudent.matricNumber}`);

    // Update student with placement details
    firstStudent.hasPlacement = true;
    firstStudent.placementApproved = true;
    firstStudent.currentPlacement = placement._id;
    firstStudent.trainingStartDate = startDate;
    firstStudent.trainingEndDate = endDate;
    if (industrialSupervisor)
      firstStudent.industrialSupervisor = industrialSupervisor._id;
    await firstStudent.save();

    // Assign student to industrial supervisor
    if (industrialSupervisor) {
      industrialSupervisor.assignedStudents.push(firstStudent._id);
      await industrialSupervisor.save();
      logger.info(
        `Assigned industrial supervisor to ${firstStudent.matricNumber}`
      );
    }

    // Create sample logbooks (Weeks 1 & 2)
    logger.info("Creating logbook entries...");
    for (let week = 1; week <= 2; week++) {
      const wStart = new Date(startDate.getTime() + (week - 1) * 7 * 86400000);
      const wEnd = new Date(wStart.getTime() + 6 * 86400000);
      const logbook = await Logbook.create({
        student: firstStudent._id,
        weekNumber: week,
        startDate: wStart,
        endDate: wEnd,
        tasksPerformed: `Week ${week}: Completed onboarding and feature task ${week}.`,
        skillsAcquired: "JavaScript, Git workflows",
        challenges: "Environment setup delays",
        lessonsLearned: "Importance of clear documentation",
        status: LOGBOOK_STATUS.SUBMITTED,
        submittedAt: new Date(),
      });

      const reviews = [];
      if (deptSupervisor) {
        reviews.push({
          supervisor: deptSupervisor._id,
          supervisorType: "departmental",
          comment: `Dept review week ${week}`,
          rating: 8 + week,
          status: LOGBOOK_STATUS.REVIEWED,
        });
      }
      if (week === 2 && industrialSupervisor) {
        reviews.push({
          supervisor: industrialSupervisor._id,
          supervisorType: "industrial",
          comment: "Industry feedback week 2",
          rating: 9,
          status: LOGBOOK_STATUS.REVIEWED,
        });
      }
      logbook.reviews = reviews;
      if (reviews.length === 2) logbook.status = LOGBOOK_STATUS.APPROVED;
      await logbook.save();
      logger.info(`Logbook week ${week} created (status: ${logbook.status})`);
    }

    // Create sample assessments (departmental & industrial)
    logger.info("Creating assessments...");
    if (deptSupervisor) {
      await Assessment.create({
        student: firstStudent._id,
        supervisor: deptSupervisor._id,
        type: ASSESSMENT_TYPES.DEPARTMENTAL,
        placement: placement._id,
        scores: {
          technical: 85,
          communication: 80,
          punctuality: 90,
          initiative: 82,
          teamwork: 88,
          professionalism: 85,
          problemSolving: 83,
          adaptability: 86,
        },
        strengths: "Strong technical foundation",
        areasForImprovement: "Improve documentation detail",
        comment: "Solid performance overall",
        recommendation: "very_good",
        grade: "B",
        status: ASSESSMENT_STATUS.COMPLETED,
        submittedAt: new Date(),
        verifiedBy: coordinators[0]._id,
        verifiedAt: new Date(),
        verificationComment: "Reviewed and accepted",
      });
      logger.info("Departmental assessment created");
    }
    if (industrialSupervisor) {
      await Assessment.create({
        student: firstStudent._id,
        supervisor: industrialSupervisor._id,
        type: ASSESSMENT_TYPES.INDUSTRIAL,
        placement: placement._id,
        scores: {
          technical: 88,
          communication: 85,
          punctuality: 92,
          initiative: 87,
          teamwork: 90,
          professionalism: 89,
          problemSolving: 90,
          adaptability: 88,
        },
        strengths: "Proactive and collaborative",
        areasForImprovement: "Refine code review comments",
        comment: "Great industry performance",
        recommendation: "excellent",
        grade: "A",
        status: ASSESSMENT_STATUS.COMPLETED,
        submittedAt: new Date(),
        verifiedBy: coordinators[0]._id,
        verifiedAt: new Date(),
        verificationComment: "Accepted",
      });
      logger.info("Industrial assessment created");
    }

    // Create sample notifications for the first student
    logger.info("Creating notifications...");
    await Notification.create({
      recipient: firstStudent.user,
      type: NOTIFICATION_TYPES.PLACEMENT_APPROVED,
      title: "Placement Approved",
      message: "Your placement has been approved.",
      priority: "high",
      relatedModel: "Placement",
      relatedId: placement._id,
      createdBy: coordinators[0]._id,
    });
    await Notification.create({
      recipient: firstStudent.user,
      type: NOTIFICATION_TYPES.GENERAL,
      title: "Welcome to SIWES",
      message: "Explore your dashboard to track progress.",
      priority: "medium",
      createdBy: admin._id,
    });
    logger.info("Notifications created for first student");

    logger.info("╔════════════════════════════════════════════════╗");
    logger.info("║  Database seeding completed successfully!     ║");
    logger.info("╠════════════════════════════════════════════════╣");
    logger.info("║  Login credentials:                            ║");
    logger.info("║  Admin: admin@siwes.edu / Admin@123           ║");
    logger.info("║  Coordinator: coordinator.csc@siwes.edu        ║");
    logger.info("║               / Coord@123                      ║");
    logger.info("║  Student: student1@siwes.edu / Student@123    ║");
    logger.info("║  Dept Supervisor: dept.supervisor@siwes.edu    ║");
    logger.info("║  Ind Supervisor: ind.supervisor@company.com    ║");
    logger.info("╠════════════════════════════════════════════════╣");
    logger.info("║  Seeded placement, logbooks, assessments,      ║");
    logger.info("║  notifications for first student.              ║");
    logger.info("╚════════════════════════════════════════════════╝");

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
    logger.error(error.stack);
    await disconnectDB();
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
