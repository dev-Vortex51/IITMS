/**
 * Attendance Evaluation System - API Test File
 * Test all new attendance endpoints
 */

const baseURL = "http://localhost:5000/api/v1";

// Test credentials (update with actual credentials)
const studentToken = "YOUR_STUDENT_TOKEN";
const supervisorToken = "YOUR_SUPERVISOR_TOKEN";
const coordinatorToken = "YOUR_COORDINATOR_TOKEN";

// Helper function to make requests
async function testEndpoint(method, endpoint, token, body = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${baseURL}${endpoint}`, options);
    const data = await response.json();
    console.log(`\n✓ ${method} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log("Response:", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error(`✗ ${method} ${endpoint}`);
    console.error("Error:", error.message);
    return null;
  }
}

// Test scenarios
async function runTests() {
  console.log("=".repeat(60));
  console.log("ATTENDANCE EVALUATION SYSTEM - API TESTS");
  console.log("=".repeat(60));

  // 1. Student checks in
  console.log("\n--- Test 1: Student Check-In ---");
  await testEndpoint("POST", "/attendance/check-in", studentToken, {
    location: {
      latitude: 6.5244,
      longitude: 3.3792,
    },
    notes: "Arrived on time today",
  });

  // 2. Get today's check-in status
  console.log("\n--- Test 2: Get Today's Check-In Status ---");
  await testEndpoint("GET", "/attendance/today", studentToken);

  // 3. Student checks out
  console.log("\n--- Test 3: Student Check-Out ---");
  await testEndpoint("PUT", "/attendance/check-out", studentToken, {
    location: {
      latitude: 6.5244,
      longitude: 3.3792,
    },
    notes: "Completed tasks for the day",
  });

  // 4. Submit absence request
  console.log("\n--- Test 4: Submit Absence Request ---");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  await testEndpoint("POST", "/attendance/absence-request", studentToken, {
    date: tomorrow.toISOString(),
    reason: "Medical appointment",
  });

  // 5. Get student attendance history
  console.log("\n--- Test 5: Get Attendance History ---");
  await testEndpoint("GET", "/attendance/my-attendance", studentToken);

  // 6. Get attendance statistics
  console.log("\n--- Test 6: Get Attendance Statistics ---");
  await testEndpoint("GET", "/attendance/my-stats", studentToken);

  // 7. Get attendance summary
  console.log("\n--- Test 7: Get Attendance Summary ---");
  const studentId = "YOUR_STUDENT_ID"; // Replace with actual student ID
  await testEndpoint("GET", `/attendance/summary/${studentId}`, studentToken);

  // 8. Supervisor approves attendance (requires supervisor token and attendance ID)
  console.log("\n--- Test 8: Supervisor Approve Attendance ---");
  const attendanceId = "YOUR_ATTENDANCE_ID"; // Replace with actual attendance ID
  await testEndpoint(
    "POST",
    `/attendance/${attendanceId}/approve`,
    supervisorToken,
    {
      comment: "Attendance verified and approved",
    }
  );

  // 9. Supervisor reclassifies attendance
  console.log("\n--- Test 9: Supervisor Reclassify Attendance ---");
  await testEndpoint(
    "PATCH",
    `/attendance/${attendanceId}/reclassify`,
    supervisorToken,
    {
      dayStatus: "HALF_DAY",
      comment: "Student left early for valid reason",
    }
  );

  // 10. Coordinator marks students absent
  console.log("\n--- Test 10: Coordinator Mark Absent ---");
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  await testEndpoint("POST", "/attendance/mark-absent", coordinatorToken, {
    date: yesterday.toISOString(),
  });

  console.log("\n" + "=".repeat(60));
  console.log("TEST SUITE COMPLETED");
  console.log("=".repeat(60));
}

// Run tests
runTests();
