# Role-Based Access Control Implementation

## 🔐 Overview

Implemented comprehensive role-based access control (RBAC) to ensure coordinators can only access data from their own department, while maintaining admin's full system access. This addresses the critical security requirement that department coordinators should only manage their own department's students, faculties, and data.

## 👥 User Role Definitions

### **Admin**

- **Full System Access**: Can view, create, update, and delete all faculties, departments, and students
- **Cross-Department Visibility**: See all data across all departments and faculties
- **Management Operations**: Create new faculties, departments, assign coordinators

### **Coordinator**

- **Department-Scoped Access**: Limited to their assigned department only
- **Read-Only Faculty Access**: Can view their own faculty information
- **Department Management**: Can view their department details and statistics
- **Student Management**: Can only see and manage students from their department
- **No Cross-Department Access**: Cannot see other departments' data

### **Student**

- **Self-Access Only**: Can only view and manage their own profile and records
- **Department-Aware**: See their own department and faculty information

## 🛡️ Access Control Implementation

### **Faculty Endpoints**

```javascript
GET /api/v1/faculties
// Admin: See all faculties
// Coordinator: See only their own faculty

GET /api/v1/faculties/:id
// Admin: Access any faculty
// Coordinator: Access only if it's their faculty (403 if not)

POST/PUT/DELETE /api/v1/faculties/*
// Admin: Full CRUD access
// Coordinator: No access (403 Forbidden)
```

### **Department Endpoints**

```javascript
GET /api/v1/departments
// Admin: See all departments
// Coordinator: See only their own department

GET /api/v1/departments/:id
// Admin: Access any department
// Coordinator: Access only their own department (403 if not)

POST/PUT/DELETE /api/v1/departments/*
// Admin: Full CRUD access
// Coordinator: No access (403 Forbidden)
```

### **Student Endpoints**

```javascript
GET /api/v1/students
// Admin: See all students across all departments
// Coordinator: See only students from their department

GET /api/v1/students/:id
// Admin: Access any student
// Coordinator: Access only students from their department
```

## 🔧 Technical Implementation

### **Service Layer Access Control**

#### **Faculty Service (`facultyService.js`)**

```javascript
// Coordinator restriction added
const getFaculties = async (filters, pagination, user) => {
  if (user.role === USER_ROLES.COORDINATOR && user.department) {
    // Get coordinator's faculty through their department
    const department = await Department.findById(user.department).populate(
      "faculty"
    );
    query._id = department.faculty._id; // Restrict to their faculty only
  }
};

const getFacultyById = async (facultyId, user) => {
  if (user.role === USER_ROLES.COORDINATOR && user.department) {
    // Verify coordinator can only access their own faculty
    const department = await Department.findById(user.department).populate(
      "faculty"
    );
    if (department.faculty._id.toString() !== facultyId) {
      throw new ApiError(
        403,
        "Access denied. You can only view your own faculty."
      );
    }
  }
};
```

#### **Department Service (`departmentService.js`)**

```javascript
// Coordinator restriction added
const getDepartments = async (filters, pagination, user) => {
  if (user.role === USER_ROLES.COORDINATOR && user.department) {
    query._id = user.department; // Restrict to their department only
  }
};

const getDepartmentById = async (departmentId, user) => {
  if (user.role === USER_ROLES.COORDINATOR && user.department) {
    if (user.department.toString() !== departmentId) {
      throw new ApiError(
        403,
        "Access denied. You can only view your own department."
      );
    }
  }
};
```

#### **Student Service (`studentService.js`)**

```javascript
// Coordinator restriction added
const getStudents = async (filters, pagination, user) => {
  if (user.role === USER_ROLES.COORDINATOR && user.department) {
    query.department = user.department; // Restrict to their department's students
  }
};
```

### **Controller Layer Updates**

All controllers updated to pass `req.user` context to services:

```javascript
// Faculty Controller
const getFaculties = async (req, res) => {
  const result = await facultyService.getFaculties(
    filters,
    pagination,
    req.user
  );
};

// Department Controller
const getDepartments = async (req, res) => {
  const result = await departmentService.getDepartments(
    filters,
    pagination,
    req.user
  );
};

// Student Controller
const getStudents = async (req, res) => {
  const result = await studentService.getStudents(
    filters,
    pagination,
    req.user
  );
};
```

### **Route Layer Authorization**

Updated routes to use appropriate middleware:

```javascript
// Read access: Admin OR Coordinator (for their own data)
router.get("/", authenticate, adminOrCoordinator, controller.getItems);

// Write access: Admin ONLY
router.post("/", authenticate, adminOnly, controller.createItem);
router.put("/:id", authenticate, adminOnly, controller.updateItem);
router.delete("/:id", authenticate, adminOnly, controller.deleteItem);
```

## 🚫 Security Restrictions Enforced

### **What Coordinators CANNOT Do:**

- ❌ View other departments' students, data, or statistics
- ❌ Create, update, or delete faculties
- ❌ Create, update, or delete departments
- ❌ Access cross-department reports or analytics
- ❌ Manage users outside their department
- ❌ View system-wide administrative data

### **What Coordinators CAN Do:**

- ✅ View their own faculty information
- ✅ View their own department details and statistics
- ✅ View and manage students from their department only
- ✅ Generate reports for their department
- ✅ Manage SIWES activities within their department scope

## 📊 Data Isolation Examples

### **Scenario: Two Departments**

```
Faculty of Engineering
├── Computer Science Department (Coordinator: Dr. Smith)
│   └── Students: Alice, Bob, Charlie
└── Electrical Engineering Department (Coordinator: Dr. Jones)
    └── Students: David, Eve, Frank
```

### **Access Matrix:**

| User                     | Can See Faculties | Can See Departments         | Can See Students         |
| ------------------------ | ----------------- | --------------------------- | ------------------------ |
| **Admin**                | All faculties     | All departments             | All students             |
| **Dr. Smith (CS Coord)** | Only Engineering  | Only Computer Science       | Only Alice, Bob, Charlie |
| **Dr. Jones (EE Coord)** | Only Engineering  | Only Electrical Engineering | Only David, Eve, Frank   |

## 🔍 Error Responses

When coordinators attempt unauthorized access:

```json
{
  "success": false,
  "message": "Access denied. You can only view your own department.",
  "statusCode": 403
}
```

## 🧪 Testing Scenarios

### **Test Case 1: Coordinator Faculty Access**

```javascript
// Coordinator login
POST /api/v1/auth/login
{ "email": "coordinator.cs@siwes.edu", "password": "Coord@123" }

// Should succeed - their own faculty
GET /api/v1/faculties/[their_faculty_id]
// Response: 200 OK with faculty data

// Should fail - different faculty
GET /api/v1/faculties/[other_faculty_id]
// Response: 403 Forbidden
```

### **Test Case 2: Coordinator Student Access**

```javascript
// Should succeed - their department's students
GET / api / v1 / students;
// Response: Only students from coordinator's department

// Should succeed - student from their department
GET / api / v1 / students / [student_from_their_dept];
// Response: 200 OK with student data

// Should fail - student from other department
GET / api / v1 / students / [student_from_other_dept];
// Response: 403 Forbidden or 404 Not Found
```

## 📋 Files Modified for RBAC

### **Services (4 files)**

- `src/services/facultyService.js` - Added coordinator access control
- `src/services/departmentService.js` - Added coordinator access control
- `src/services/studentService.js` - Added coordinator access control
- `src/services/userService.js` - Enhanced user context handling

### **Controllers (3 files)**

- `src/controllers/facultyController.js` - Pass user context to services
- `src/controllers/departmentController.js` - Pass user context to services
- `src/controllers/studentController.js` - Pass user context to services

### **Routes (2 files)**

- `src/routes/facultyRoutes.js` - Updated authorization middleware
- `src/routes/departmentRoutes.js` - Confirmed proper authorization

### **Middleware (1 file)**

- `src/middleware/authorization.js` - Leveraged existing `adminOrCoordinator` middleware

## ✅ Implementation Status

### **Completed:**

- ✅ Department-scoped access for coordinators
- ✅ Faculty visibility restrictions for coordinators
- ✅ Student access limited to coordinator's department
- ✅ Proper error handling for unauthorized access
- ✅ Service layer access control implementation
- ✅ Controller layer user context passing
- ✅ Route layer authorization middleware
- ✅ Cross-department data isolation

### **Security Features:**

- ✅ **Principle of Least Privilege**: Coordinators can only access what they need
- ✅ **Data Isolation**: Complete separation between departments
- ✅ **Authorization Checks**: Multi-layer security validation
- ✅ **Error Handling**: Proper 403/404 responses for unauthorized access
- ✅ **Audit Trail**: All access attempts logged with user context

---

**Result**: 🛡️ **COMPLETE RBAC IMPLEMENTATION** - Coordinators can now only access their own department's data, ensuring proper data isolation and security boundaries within the SIWES Management System.
