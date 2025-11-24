/**
 * Faculty & Department API Test Script
 * Quick verification of the new endpoints
 */

const axios = require("axios");

const BASE_URL = "http://localhost:5000/api/v1";

// Test with different user roles
const adminCredentials = {
  email: "admin@siwes.edu",
  password: "Admin@123",
};

const coordinatorCredentials = {
  email: "coordinator.csc@siwes.edu",
  password: "Coord@123",
};

async function getAuthToken(credentials) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    return response.data.data.token;
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    return null;
  }
}

async function testFacultyEndpoints() {
  console.log("🧪 Testing Faculty Endpoints...\n");

  try {
    // Test 1: Create Faculty
    console.log("1. Testing Create Faculty...");
    const createFacultyResponse = await axios.post(
      `${BASE_URL}/faculties`,
      {
        name: "Faculty of Engineering",
        code: "ENG",
        description: "Engineering and Technology programs",
      },
      { headers }
    );
    console.log("✅ Create Faculty successful:", createFacultyResponse.data);

    const facultyId = createFacultyResponse.data.data.faculty._id;

    // Test 2: Get All Faculties
    console.log("\n2. Testing Get All Faculties...");
    const getFacultiesResponse = await axios.get(`${BASE_URL}/faculties`, {
      headers,
    });
    console.log("✅ Get Faculties successful:", getFacultiesResponse.data);

    // Test 3: Get Faculty by ID
    console.log("\n3. Testing Get Faculty by ID...");
    const getFacultyResponse = await axios.get(
      `${BASE_URL}/faculties/${facultyId}`,
      { headers }
    );
    console.log("✅ Get Faculty by ID successful:", getFacultyResponse.data);

    // Test 4: Update Faculty
    console.log("\n4. Testing Update Faculty...");
    const updateFacultyResponse = await axios.put(
      `${BASE_URL}/faculties/${facultyId}`,
      {
        description:
          "Updated: Engineering and Technology programs with research focus",
      },
      { headers }
    );
    console.log("✅ Update Faculty successful:", updateFacultyResponse.data);

    return facultyId;
  } catch (error) {
    console.error(
      "❌ Faculty endpoint error:",
      error.response?.data || error.message
    );
    return null;
  }
}

async function testDepartmentEndpoints(facultyId) {
  console.log("\n\n🧪 Testing Department Endpoints...\n");

  if (!facultyId) {
    console.log("❌ Cannot test departments without valid faculty ID");
    return;
  }

  try {
    // Test 1: Create Department
    console.log("1. Testing Create Department...");
    const createDeptResponse = await axios.post(
      `${BASE_URL}/departments`,
      {
        name: "Computer Science",
        code: "CS",
        faculty: facultyId,
        description: "Computer Science and Software Engineering",
      },
      { headers }
    );
    console.log("✅ Create Department successful:", createDeptResponse.data);

    const departmentId = createDeptResponse.data.data.department._id;

    // Test 2: Get All Departments
    console.log("\n2. Testing Get All Departments...");
    const getDeptsResponse = await axios.get(`${BASE_URL}/departments`, {
      headers,
    });
    console.log("✅ Get Departments successful:", getDeptsResponse.data);

    // Test 3: Get Department by ID
    console.log("\n3. Testing Get Department by ID...");
    const getDeptResponse = await axios.get(
      `${BASE_URL}/departments/${departmentId}`,
      { headers }
    );
    console.log("✅ Get Department by ID successful:", getDeptResponse.data);

    // Test 4: Get Departments by Faculty
    console.log("\n4. Testing Get Departments by Faculty...");
    const getDeptsByFacultyResponse = await axios.get(
      `${BASE_URL}/departments?faculty=${facultyId}`,
      { headers }
    );
    console.log(
      "✅ Get Departments by Faculty successful:",
      getDeptsByFacultyResponse.data
    );

    // Test 5: Update Department
    console.log("\n5. Testing Update Department...");
    const updateDeptResponse = await axios.put(
      `${BASE_URL}/departments/${departmentId}`,
      {
        description:
          "Updated: Computer Science with AI and Data Science specializations",
      },
      { headers }
    );
    console.log("✅ Update Department successful:", updateDeptResponse.data);

    return departmentId;
  } catch (error) {
    console.error(
      "❌ Department endpoint error:",
      error.response?.data || error.message
    );
    return null;
  }
}

async function runTests() {
  console.log("🚀 Starting Faculty & Department API Tests\n");
  console.log("⚠️  Make sure to:");
  console.log("   - Start the backend server (npm run dev)");
  console.log("   - Replace AUTH_TOKEN with a valid admin JWT token");
  console.log("   - Ensure MongoDB is running\n");

  const facultyId = await testFacultyEndpoints();
  const departmentId = await testDepartmentEndpoints(facultyId);

  console.log("\n\n📊 Test Summary:");
  console.log(`Faculty Created: ${facultyId ? "✅" : "❌"}`);
  console.log(`Department Created: ${departmentId ? "✅" : "❌"}`);

  console.log("\n🔍 API Endpoints Available:");
  console.log("Faculty Management:");
  console.log("  POST   /api/v1/faculties");
  console.log("  GET    /api/v1/faculties");
  console.log("  GET    /api/v1/faculties/:id");
  console.log("  PUT    /api/v1/faculties/:id");
  console.log("  DELETE /api/v1/faculties/:id");
  console.log("  GET    /api/v1/faculties/:id/departments");

  console.log("\nDepartment Management:");
  console.log("  POST   /api/v1/departments");
  console.log("  GET    /api/v1/departments");
  console.log("  GET    /api/v1/departments/:id");
  console.log("  PUT    /api/v1/departments/:id");
  console.log("  DELETE /api/v1/departments/:id");
  console.log("  GET    /api/v1/departments/stats/:id");
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testFacultyEndpoints, testDepartmentEndpoints };
