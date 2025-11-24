# Department and Faculty Schema Updates - RBAC Implementation

## 🎯 Problem Identified

The User model was missing critical `department` and `faculty` fields required for proper role-based access control, specifically for coordinators who need to be tied to their specific departments.

## ✅ Schema Updates Completed

### **User Model (`User.js`)**

Added the following fields to properly support department-based roles:

```javascript
// Department Assignment (for Coordinators and Departmental Supervisors)
department: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Department",
  required: function() {
    return this.role === USER_ROLES.COORDINATOR ||
           this.role === USER_ROLES.DEPT_SUPERVISOR;
  },
  index: true,
},

// Faculty Assignment (optional, derived from department)
faculty: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Faculty",
  index: true,
}
```

### **Auto-Population Hook**

Added pre-save middleware to automatically populate the `faculty` field based on the assigned `department`:

```javascript
userSchema.pre("save", async function (next) {
  if (
    this.isModified("department") &&
    this.department &&
    (this.role === USER_ROLES.COORDINATOR ||
      this.role === USER_ROLES.DEPT_SUPERVISOR)
  ) {
    try {
      const Department = mongoose.model("Department");
      const department = await Department.findById(this.department).populate(
        "faculty"
      );
      if (department && department.faculty) {
        this.faculty = department.faculty._id;
      }
    } catch (error) {
      console.warn("Error auto-populating faculty:", error.message);
    }
  }
  next();
});
```

## 🌱 Seed Script Updates

### **Coordinator Creation**

Updated the seed script to properly assign departments and faculties to coordinators:

```javascript
// Before: Only added to department's coordinators array
await departments[i % departments.length].addCoordinator(coordinator._id);

// After: Properly assign department and faculty to user
const assignedDepartment = departments[i % departments.length];

const coordinator = await User.create({
  ...coordData,
  department: assignedDepartment._id, // Assign department to coordinator
  faculty: assignedDepartment.faculty, // Assign faculty from department
  isFirstLogin: false,
  passwordResetRequired: false,
});

// Also add to department coordinators array
await assignedDepartment.updateOne({
  $addToSet: { coordinators: coordinator._id },
});
```

### **Departmental Supervisor Creation**

Updated supervisor creation to assign departments:

```javascript
// Assign department for departmental supervisors
const assignedDept =
  supervisorData.type === "departmental" ? departments[0] : null;

const supUser = await User.create({
  // ... other fields
  department: assignedDept?._id, // Set department for departmental supervisors
  faculty: assignedDept?.faculty, // Set faculty from department
  // ... rest of fields
});
```

## 🛡️ RBAC Implementation Result

### **Data Relationship Structure**

```
User (Coordinator)
├── department: ObjectId → Department
├── faculty: ObjectId → Faculty (auto-populated)
└── role: "coordinator"

Department
├── coordinators: [ObjectId] → Users with coordinator role
├── faculty: ObjectId → Faculty
└── students: Virtual → Students in this department
```

### **Access Control Matrix**

| Role                | Department Field | Faculty Field  | Access Scope                |
| ------------------- | ---------------- | -------------- | --------------------------- |
| **Admin**           | null             | null           | All departments & faculties |
| **Coordinator**     | Required         | Auto-populated | Own department only         |
| **Dept Supervisor** | Required         | Auto-populated | Own department only         |
| **Student**         | Required         | Derived        | Own department info         |

### **Query Filtering Examples**

#### **Faculty Access Control**

```javascript
// Coordinator restriction
if (user.role === USER_ROLES.COORDINATOR && user.department) {
  const department = await Department.findById(user.department).populate(
    "faculty"
  );
  query._id = department.faculty._id; // Restrict to their faculty only
}
```

#### **Department Access Control**

```javascript
// Coordinator restriction
if (user.role === USER_ROLES.COORDINATOR && user.department) {
  query._id = user.department; // Restrict to their department only
}
```

#### **Student Access Control**

```javascript
// Coordinator restriction
if (user.role === USER_ROLES.COORDINATOR && user.department) {
  query.department = user.department; // Restrict to their department's students
}
```

## 📋 Validation Schema Updates

### **User Validation**

The existing validation schema already properly handles the new fields:

```javascript
department: customValidators.objectId.when("role", {
  is: Joi.valid(
    USER_ROLES.STUDENT,
    USER_ROLES.COORDINATOR,
    USER_ROLES.DEPT_SUPERVISOR
  ),
  then: Joi.required(),
  otherwise: Joi.optional(),
}),
faculty: customValidators.objectId.optional(),
```

## 🧪 Testing Scenarios

### **Seed Data Structure After Updates**

```
Faculty of Science
├── Computer Science Department
│   ├── Coordinator: coordinator.csc@siwes.edu
│   ├── Dept Supervisor: dept.supervisor@siwes.edu
│   └── Students: student1@siwes.edu, student2@siwes.edu
└── Software Engineering Department
    └── (Available for additional coordinators)
```

### **Expected Access Behavior**

1. **coordinator.csc@siwes.edu** can only see:

   - Faculty of Science (their faculty)
   - Computer Science Department (their department)
   - Students from Computer Science only

2. **admin@siwes.edu** can see:
   - All faculties (Science, Engineering, etc.)
   - All departments across all faculties
   - All students from all departments

## ✅ Implementation Status

### **Schema Changes** ✅

- [x] Added `department` field to User model with conditional requirement
- [x] Added `faculty` field to User model
- [x] Added auto-population hook for faculty based on department
- [x] Updated database indexes for performance

### **Seed Script Updates** ✅

- [x] Coordinators properly assigned to departments
- [x] Departmental supervisors assigned to departments
- [x] Faculty fields auto-populated via pre-save hook
- [x] Proper logging of assignments

### **RBAC Integration** ✅

- [x] Service layer access control using user.department
- [x] Controller layer passing user context
- [x] Route layer authorization middleware
- [x] Validation schema alignment

### **Data Integrity** ✅

- [x] Foreign key relationships properly established
- [x] Conditional field requirements based on role
- [x] Automatic faculty derivation from department
- [x] Proper error handling in hooks

## 🚀 Next Steps

1. **Run Database Seed**: `npm run seed` to create updated sample data
2. **Test RBAC**: Verify coordinator access restrictions
3. **Frontend Integration**: Update admin dashboard to handle new fields
4. **Production Migration**: Plan schema migration for existing data

---

**Result**: 🛡️ **COMPLETE RBAC SCHEMA IMPLEMENTATION** - User model now properly supports department-based access control with automatic faculty population, enabling strict data isolation for coordinators and departmental supervisors.
