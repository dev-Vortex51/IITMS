export interface Student {
  _id: string;
  user: { _id: string; email: string; firstName?: string; lastName?: string };
  matricNumber?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  level?: string;
  session?: string;
  faculty?: { _id: string; name: string };
  department?: { _id: string; name: string };
  phoneNumber?: string;
  placement?: string;
  currentPlacement?: Placement;
  departmental_supervisor?: string; // Backward compatibility
  industrial_supervisor?: string;
  academicSupervisor?: string | Supervisor;
  departmentalSupervisor?: string | Supervisor; // Backward compatibility
  industrialSupervisor?: string | Supervisor;
  logbooks?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Placement {
  _id: string;
  student: string | Student;
  companyName: string;
  companyAddress?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyWebsite?: string;
  companySector?: string;
  position?: string;
  department?: string;
  startDate: string;
  endDate: string;
  acceptanceLetter?: string;
  status: "pending" | "approved" | "rejected";
  coordinator_remarks?: string;
  academicSupervisor?: string | Supervisor;
  departmentalSupervisor?: string | Supervisor; // Backward compatibility
  industrialSupervisor?: string | Supervisor;
  createdAt?: string;
  updatedAt?: string;
  supervisorEmail?: string;
  supervisorName?: string;
  supervisorPhone?: string;
  supervisorPosition?: string;
  reviewComment?: string;
}

export interface LogbookEntry {
  _id: string;
  student: string | Student;
  placement: string | Placement;
  weekNumber: number;
  date: string;
  activity: string;
  skillsLearned?: string;
  challenges?: string;
  evidence?: string;
  supervisor_comment?: string;
  supervisor_approval?: "pending" | "approved" | "rejected";
  createdAt?: string;
  updatedAt?: string;
}

export interface Assessment {
  _id: string;
  student: string | Student;
  placement: string | Placement;
  supervisor: string;
  supervisorType: "departmental" | "industrial";
  scores: {
    punctuality?: number;
    initiative?: number;
    technicalSkills?: number;
    communication?: number;
    teamwork?: number;
    overallPerformance?: number;
  };
  // Flatten properties for easier access
  totalScore?: number;
  technicalSkills?: number;
  workAttitude?: number;
  comments?: string;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Supervisor {
  _id: string;
  user:
    | string
    | { _id: string; email: string; firstName?: string; lastName?: string };
  name?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  type: "departmental" | "industrial";
  department?: string | { _id: string; name: string };
  company?: string;
  companyName?: string;
  companyAddress?: string;
  companySector?: string;
  position?: string;
  designation?: string;
  staffId?: string;
  specialization?: string;
  isActive?: boolean;
  students?: string[];
  assignedStudents?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  name?: string;
  phone?: string;
  address?: string;
  department?: string | Department;
  faculty?: string | Faculty;
  createdAt?: string;
  updatedAt?: string;
  profileData?: {
    _id: string;
    user?: string;
    department?: any;
    currentPlacement?: any;
    departmentalSupervisor?: any;
    industrialSupervisor?: any;
    assignedStudents?: any[];
  };
  studentProfile?: any;
}

export interface Faculty {
  _id: string;
  name: string;
  code: string;
  dean?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  faculty: string | Faculty;
  hod?: string;
  coordinators?: string[] | User[];
  students?: Student[];
  createdAt?: string;
  updatedAt?: string;
}
