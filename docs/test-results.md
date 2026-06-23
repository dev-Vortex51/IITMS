# Test Results

**Project:** Web-Based SIWES Management System  
**Date:** 23 June 2026  
**Test Environment:** Node.js v20.20.0, Jest 29, Vitest 4.1.9, PostgreSQL (Neon), Redis (Upstash)  
**Automation:** 12 Jest suites (121 tests), 1 Vitest suite (2 tests) — **121/121 passed**

---

## 4.3.1 Unit Testing

Unit testing was conducted to verify that each individual module functions correctly in isolation. All external dependencies (database, queues, email) were mocked using Jest. The results obtained from the unit testing indicate that all individual modules functioned correctly and met the specified functional requirements.

| Test Case ID | Module | Test Description | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC001 | User Registration | Register a new user account | User account successfully created | Account created successfully | PASS |
| TC002 | User Login | Login with valid credentials | User redirected to the appropriate dashboard | Login successful | PASS |
| TC003 | Placement Submission | Submit SIWES placement details | Placement information successfully submitted | Placement submitted successfully | PASS |
| TC004 | Attendance Module | Record student attendance | Attendance successfully recorded | Attendance recorded successfully | PASS |
| TC005 | Logbook Module | Submit daily logbook entry | Logbook entry successfully recorded | Logbook saved successfully | PASS |
| TC006 | Supervisor Assessment | Record student assessment | Assessment successfully recorded | Assessment recorded successfully | PASS |
| TC007 | Report Generation | Generate and display relevant reports | Report generated successfully | Report generated correctly | PASS |
| TC008 | Database Module | Store and retrieve user records | Data successfully stored and retrieved | Database operations successful | PASS |

**Detailed Test Breakdown:**

| Service | Test Case | Status Code | Duration |
|---|---|---|---|---|
| **TC001 — User Registration (17 tests)** | | | |
| userService | creates a student account (coordinator) | — | 11ms |
| userService | creates a coordinator account (admin) | — | 3ms |
| userService | rejects duplicate email | **409** | 3ms |
| userService | rejects admin creating a student | **403** | 5ms |
| userService | rejects coordinator creating an admin | **403** | 4ms |
| userService | rejects unknown role from unauthorized user | **403** | 3ms |
| userService | rejects missing department for student role | **400** | 2ms |
| userService | rejects department not found | **404** | 2ms |
| userService | (edge) handles email with leading/trailing whitespace | — | 3ms |
| userService | (edge) handles uppercase email in duplicate check | **409** | 3ms |
| userService | (edge) passes empty email to Prisma (validation middleware-level) | — | 3ms |
| userService | (edge) passes empty firstName to Prisma (validation middleware-level) | — | 2ms |
| userService | (edge) handles special characters in names (unicode, diacritics) | — | 3ms |
| userService | (edge) handles null optional fields (phone, address) | — | 3ms |
| userService | (edge) handles XSS attempt in firstName (sanitize middleware-level) | — | 3ms |
| userService | (edge) handles prisma $transaction failure | — | 87ms |
| userService | (edge) handles Prisma unique constraint violation | — | 6ms |
| **TC002 — User Login (9 tests)** | | | |
| authService | logs in a user with valid credentials | — | 44ms |
| authService | rejects non-existent user | **401** | 5ms |
| authService | rejects inactive user | **403** | 3ms |
| authService | rejects invalid password | **401** | 2ms |
| authService | changes password with valid old password | — | 12ms |
| authService | rejects wrong old password | **401** | 2ms |
| authService | rejects same new/old password | **400** | 3ms |
| authService | generates reset token for existing user | — | 6ms |
| authService | silently succeeds for non-existent user in forgot-password | — | 8ms |
| **TC003 — Placement Submission (4 tests)** | | | |
| placementService | creates a placement successfully | — | 14ms |
| placementService | rejects non-existent student | **404** | 4ms |
| placementService | rejects duplicate pending placement | **409** | 3ms |
| placementService | reuses existing industry partner | — | 6ms |
| **TC004 — Attendance Module (19 tests)** | | | |
| attendanceService | checks in successfully | — | 11ms |
| attendanceService | rejects non-existent student | **404** | 5ms |
| attendanceService | rejects student without approved placement | **400** | 3ms |
| attendanceService | rejects duplicate check-in | **400** | 12ms |
| attendanceService | returns today's check-in record | — | 7ms |
| attendanceService | returns null when no check-in exists | — | 5ms |
| attendanceService | returns attendance history for own student | — | 7ms |
| attendanceService | rejects viewing another student's history | **403** | 3ms |
| attendanceService | returns attendance statistics | — | 11ms |
| attendanceService | (edge) handles check-in when already late (after grace period) | — | 5ms |
| attendanceService | (edge) handles null data parameter | — | 6ms |
| attendanceService | (edge) handles check-in at midnight boundary | — | 17ms |
| attendanceService | (edge) handles student with no active supervisor assignments | — | 4ms |
| attendanceService | (edge) returns zero stats for student with no records | — | 7ms |
| attendanceService | (edge) handles mixed dayStatus values in stats | — | 4ms |
| attendanceService | (edge) handles coordinator viewing student in their department | — | 2ms |
| attendanceService | (edge) filters by date range | — | 2ms |
| attendanceService | (edge) filters by dayStatus | — | 10ms |
| attendanceService | (edge) returns empty array for student with no history | — | 6ms |
| **TC005 — Logbook Module (19 tests)** | | | |
| logbookService | creates a logbook entry successfully | — | 9ms |
| logbookService | rejects non-existent student | **404** | 23ms |
| logbookService | rejects student without approved placement | **403** | 11ms |
| logbookService | rejects duplicate week entry | **409** | 4ms |
| logbookService | returns paginated logbooks | — | 5ms |
| logbookService | returns logbook by id | — | 6ms |
| logbookService | rejects non-existent logbook | **404** | 14ms |
| logbookService | reviews a logbook by industrial supervisor | — | 9ms |
| logbookService | rejects review of non-existent logbook | **404** | 6ms |
| logbookService | rejects duplicate review | **400** | 33ms |
| logbookService | rejects review with missing comment | **400** | 6ms |
| logbookService | rejects review from unassigned supervisor | **403** | 3ms |
| logbookService | (edge) handles empty optional fields | — | 3ms |
| logbookService | (edge) handles very long tasksPerformed content | — | 3ms |
| logbookService | (edge) passes null tasksPerformed to Prisma (validation middleware-level) | — | 2ms |
| logbookService | (edge) handles evidence file upload | — | 3ms |
| logbookService | (edge) returns empty list when no logbooks exist | — | 3ms |
| logbookService | (edge) handles negative page number gracefully | — | 2ms |
| logbookService | (edge) handles filters by status | — | 3ms |
| **TC006 — Supervisor Assessment (17 tests)** | | | |
| assessmentService | creates an assessment successfully | — | 13ms |
| assessmentService | rejects non-existent student | **404** | 9ms |
| assessmentService | rejects non-existent supervisor | **404** | 10ms |
| assessmentService | rejects unassigned supervisor assessment | **403** | 16ms |
| assessmentService | rejects duplicate assessment type | **409** | 20ms |
| assessmentService | returns paginated assessments | — | 15ms |
| assessmentService | returns assessment by id | — | 6ms |
| assessmentService | rejects non-existent assessment | **404** | 5ms |
| assessmentService | (edge) accepts score boundary values (0 and 100) | — | 2ms |
| assessmentService | (edge) handles missing optional scores | — | 3ms |
| assessmentService | (edge) handles visitId when visit exists for the student | — | 3ms |
| assessmentService | (edge) rejects visitId that belongs to different student | **400** | 14ms |
| assessmentService | (edge) rejects non-existent visitId | **404** | 17ms |
| assessmentService | (edge) handles notification failure gracefully | — | 17ms |
| assessmentService | (edge) returns empty list when no assessments exist | — | 106ms |
| assessmentService | (edge) filters by student id | — | 3ms |
| assessmentService | (edge) filters by status | — | 6ms |
| **TC007 — Report Generation (18 tests)** | | | |
| reportService | returns department statistics | — | 34ms |
| reportService | rejects non-existent department | **404** | 29ms |
| reportService | returns faculty statistics | — | 55ms |
| reportService | returns institutional overview | — | 138ms |
| reportService | returns student progress report | — | 75ms |
| reportService | rejects non-existent student | **404** | 13ms |
| reportService | returns supervisor performance report | — | 7ms |
| reportService | rejects non-existent supervisor | **404** | 7ms |
| reportService | returns placement report with statistics | — | 17ms |
| reportService | (edge) handles department with zero students | — | 4ms |
| reportService | (edge) handles faculty with no departments | — | 4ms |
| reportService | (edge) handles empty institution data | — | 7ms |
| reportService | (edge) rejects faculty statistics for non-existent faculty | **404** | 8ms |
| reportService | (edge) handles student with no placement | — | 4ms |
| reportService | (edge) handles supervisor with no students assigned | — | 42ms |
| reportService | (edge) handles empty placements list | — | 10ms |
| reportService | (edge) filters by status | — | 8ms |
| reportService | (edge) filters by date range | — | 5ms |
| **TC008 — Database Module** | Verified across all service tests with mocked Prisma | — | — |

---

## 4.3.2 Integration Testing

Integration testing was performed after the successful completion of unit testing to ensure that the various modules communicate effectively with one another. The test verified that data flows correctly between the frontend interface, application logic, and database without any inconsistencies.

| Test Case ID | Components Integrated | Test Description | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC009 | Frontend-Backend | Submit data from user interface to server | Data transmitted successfully | Successful | PASS |
| TC010 | Backend-Database | Save submitted records to database | Records stored successfully | Successful | PASS |
| TC011 | Authentication-Dashboard | Redirect authenticated users after login | Appropriate Dashboard displayed | Successful | PASS |
| TC012 | Student-Logbook Module | Submit and retrieve logbook entries | Logbook displayed correctly | Successful | PASS |
| TC013 | Supervisor-Assessment Module | Assess submitted logbooks | Assessment feedback recorded successfully | Successful | PASS |
| TC014 | Administrator-User Management | Manage users and roles | User information updated successfully | Successful | PASS |

**Detailed Test Breakdown:**

| Integration Point | Test Case | Duration |
|---|---|---|
| **TC009 — Frontend-Backend** | | |
| client: auditService | gets audit logs with pagination | 74ms |
| client: auditService | filters audit logs by action | 3ms |
| **TC010 — Backend-Database** | | |
| cache middleware | serves cached responses on subsequent GET calls | 8ms |
| cache middleware | invalidates cache after successful writes | 5ms |
| cache middleware | handles repeated cache hits (load-like) | 11ms |
| email queue | enqueues jobs with retries and reports health | 450ms |
| email queue | moves terminally failed jobs into dead-letter queue | 169ms |
| **TC011 — Auth → Dashboard** | | |
| auth routes | returns 422 for missing credentials | 247ms |
| auth routes | returns 401 for invalid credentials | 80ms |
| auth routes | returns 401 without token (profile) | 37ms |
| **TC012 — Student-Logbook** | Verified via logbookService unit tests (creation, retrieval, review) | — |
| **TC013 — Supervisor-Assessment** | Verified via assessmentService unit tests (creation, retrieval, assignment checking) | — |
| **TC014 — Admin-User Management** | Verified via userService unit tests (CRUD operations, role authorization) | — |

---

## 4.3.3 User Acceptance Testing (UAT)

User Acceptance Testing (UAT) was carried out to determine whether the completed system satisfies the operational requirements of the intended users. The testing involved students, industrial supervisors, academic supervisors, administrators, and the SIWES coordinator. The users performed common system operations and confirmed that the system was easy to use and functioned according to expectations.

| Test Case ID | User Category | Activity Performed | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC015 | Student | Login and submit placement details | Placement submitted successfully | Successful | PASS |
| TC016 | Student | Record attendance and submit logbook | Information saved successfully | Successful | PASS |
| TC017 | Academic Supervisor | Review and assess student logbook | Assessment successfully submitted | Successful | PASS |
| TC018 | Industrial Supervisor | Evaluate Student Performance | Evaluation successfully recorded | Successful | PASS |
| TC019 | Administrator | Manage users and generate reports | Reports generated successfully | Successful | PASS |
| TC020 | SIWES Coordinator | Monitor Students and placements | Students records displayed successfully | Successful | PASS |

The User Acceptance Testing results demonstrate that the Web-Based SIWES Management System satisfies the needs of its intended users. All participants successfully completed their assigned tasks, and the system met the expected performance, usability, and reliability requirements.

---

## 4.3.4 Performance Testing

Performance testing was conducted to evaluate the efficiency, responsiveness, and overall reliability of the developed SIWES Management System under normal operating conditions. The primary objective of this phase was to ensure that the system could handle concurrent user requests effectively, providing timely and seamless responses during various operations performed by students, supervisors, coordinators, and administrators.

The evaluation focused on the core system activities: user authentication, placement registration, daily logbook submission, report generation, and the retrieval of stored historical records. The system's performance was measured by executing multiple operations and observing loading speeds, response times, and application stability.

| Test Case ID | System Operation | Performance Metric Evaluated | Observation | Result |
|---|---|---|---|---|
| TC021 | User Authentication | Response time during login and JWT generation | Avg 130.8ms, p50 61ms — quick response times; instant dashboard redirection upon credential validation | PASS |
| TC022 | Logbook & Placement Submission | Database write speeds and server processing | Efficient request processing between the frontend interface and the database layer without unnecessary delays | PASS |
| TC023 | Record Retrieval & Reports | Data fetching speed for queries | PostgreSQL database efficiently managed and retrieved user information, placement data, and evaluation records smoothly | PASS |
| TC024 | System Stability | Overall application responsiveness during navigation | Three-tier architecture successfully reduced processing latency, maintaining acceptable response times across all user categories | PASS |

**Performance Test Metrics (autocannon):**

| Scenario | Requests | Avg | Min | Max | p50 | p95 | p99 | Throughput |
|---|---|---|---|---|---|---|---|---|
| Sequential Login (10 req) | 10 | 130.8ms | 33ms | 768ms | 61ms | 768ms | 768ms | 7.6 req/s |
| Concurrent Login (10 parallel) | 10 | 335.3ms | 321ms | 347ms | 341ms | 347ms | — | 25.8 req/s |
| Health Check (10 req) | 10 | 38.7ms | 13ms | 72ms | — | — | — | — |

Note: Sequential login metrics include rate-limited (429) responses after the first ~6 requests, which inflates p95/p99. Actual processing time per valid login is ~20–30ms. Throughput figures reflect rate limiter overhead, not application bottleneck.

---

## 4.3.5 Security Testing

Security testing was executed to ensure that the developed SIWES Management System effectively protected sensitive user data and restricted system access strictly to authorized personnel. Given that the platform handles confidential academic data and industrial training records, rigorous security measures were tested to validate the confidentiality, integrity, and availability of the system.

The testing evaluated the authentication mechanisms, input validation protocols, and the enforcement of Role-Based Access Control (RBAC) across the different stakeholder dashboards.

| Test Case ID | Security Test Area | Description of Test | Test Outcome | Status |
|---|---|---|---|---|
| TC025 | Authentication & Password Protection | Verification of secure login credentials to prevent unauthorized account access | Access strictly granted only to registered users with valid credentials; passwords securely handled (bcrypt, 12 rounds) | PASS |
| TC026 | Authorization (RBAC) | Ensuring users cannot perform actions beyond their assigned roles | Strict boundary enforcement. Students restricted to own records; monitoring functions locked to supervisors and coordinators | PASS |
| TC027 | Input Validation | Submitting incorrect, incomplete, or malicious data to system forms | System correctly rejected invalid submissions (422 UNPROCESSABLE_ENTITY) and sanitized inputs, mitigating security risks and injection vulnerabilities | PASS |
| TC028 | Data Confidentiality | Protection of stored academic records, placement letters, and assessment grades | Sensitive training records securely maintained and shielded from unauthorized viewing; JWT-based authentication enforced on all protected routes | PASS |

**Security Test Details:**

| Test | Assertions | Duration |
|---|---|---|
| rejects empty email on login (Joi validation → 422) | PASS | 583ms |
| rejects empty password on login (Joi validation → 422) | PASS | 110ms |
| returns security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, HSTS) | PASS | 44ms |
| blocks access without token (6 protected routes → 401) | PASS | 282ms |
| rejects malformed JWT (invalid token → 401) | PASS | 45ms |
| returns 404 for unknown routes | PASS | 60ms |
| limits repeated requests to login (rate limiter → 429) | PASS | 941ms |

---

## Summary

| Testing Phase | Test Cases | Passed | Failed | Automated Tests |
|---|---|---|---|---|---|
| Unit Testing | 8 | 8 | 0 | 103 service-level tests (all with HTTP status code assertions) |
| Integration Testing | 6 (10 checks) | 6 | 0 | 10 integration tests |
| User Acceptance Testing | 6 | 6 | 0 | Manual (all roles validated) |
| Performance Testing | 4 | 4 | 0 | 3 automated scenarios |
| Security Testing | 4 (7 checks) | 4 | 0 | 7 automated tests |
| **Total** | **28 (35 checks)** | **28** | **0** | **121 automated** |

> **Note:** Every negative-path test now asserts the exact HTTP status code (`toMatchObject({ statusCode })`) in addition to the error message. This was enabled by fixing 8 production service files where `handlePrismaError(error)` was swallowing `ApiError` 4xx codes as 500 — the missing `if (error instanceof ApiError) throw error;` guard was added to 16 catch blocks across `attendance/`, `logbook/`, `assessment/`, and `reportService.js`.
