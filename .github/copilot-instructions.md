# SIWES/IT Management System - AI Agent Instructions

## Project Overview

Monorepo managing Industrial Training (SIWES/IT) with Node.js/Express backend + Next.js 14 frontend. 7-role RBAC system (Admin, Faculty, Coordinator, Academic/Industrial Supervisors, Student) orchestrating placement workflows, dual-supervisor logbook reviews, and assessments.

**Key Change**: Academic Supervisors (formerly Departmental Supervisors) are now created by Admins, can supervise up to 10 students across different departments, and are not tied to a specific department.

## Architecture Patterns

### Backend (Node.js/Express/MongoDB)

**Layered Architecture**: Routes → Controllers → Services → Models

- **Controllers** (`src/controllers/`): Handle HTTP only - validate inputs, call services, format responses
- **Services** (`src/services/`): Business logic layer - reusable across controllers, handles authorization checks
- **Models** (`src/models/`): Mongoose schemas with static methods acting as repositories

**Response Format**: All responses use `formatResponse(success, message, data, meta)` from `utils/helpers.js`

```javascript
res.json(formatResponse(true, "Success", result, { pagination }));
```

**Error Handling**: Throw `ApiError(statusCode, message)` in services - centralized handler in `middleware/errorHandler.js` catches and formats

```javascript
throw new ApiError(404, "Student not found");
```

**Authentication Flow**:

1. JWT in `Authorization: Bearer <token>` header
2. `middleware/auth.js` authenticates, attaches `req.user`
3. First login forces password reset (`isFirstLogin` flag)
4. Role-based access via `middleware/authorization.js` - `requireRoles(['admin', 'coordinator'])`

### Frontend (Next.js 14 App Router + TypeScript)

**State Management**: TanStack Query for server state, React hooks for client state

```typescript
const { data } = useQuery({
  queryKey: ["students"],
  queryFn: studentService.getAll,
});
const mutation = useMutation({ mutationFn: studentService.create });
```

**API Client**: Axios instance (`lib/api-client.ts`) with automatic JWT injection from cookies

- Sets `Authorization` header from `accessToken` cookie
- 401 responses auto-redirect to `/login`

**Component Architecture**:

- shadcn/ui components (`components/ui/`)
- Role-based route groups: `app/(dashboard)/[role]/`
- Shared layouts in `components/layouts/`

## Critical RBAC Implementation

**Department-Scoped Access for Coordinators**:

- Coordinators can ONLY access their department's data (students, placements, logbooks)
- Backend services check `user.role === 'coordinator' && user.department` and filter queries
- Example from `studentService.js`:

```javascript
if (user.role === USER_ROLES.COORDINATOR && user.department) {
  query.department = user.department; // Restrict to coordinator's dept
}
```

**Admin has full cross-department access** - no filters applied

**Role Constants**: Use `USER_ROLES` from `backend/src/utils/constants.js` (also exported as `ROLES` for compatibility)

```javascript
const { USER_ROLES } = require("../utils/constants");
// Roles: ADMIN, FACULTY, COORDINATOR, STUDENT, ACADEMIC_SUPERVISOR, INDUSTRIAL_SUPERVISOR
// Note: DEPT_SUPERVISOR is an alias for ACADEMIC_SUPERVISOR for backward compatibility
```

## Key Workflows

### User Creation Hierarchy

1. Admin creates Faculty/Department/Coordinator/Academic Supervisor accounts
2. Coordinators create Student/Industrial Supervisor accounts (auto-scoped to their department)
3. Industrial Supervisors created automatically during placement approval OR manually by coordinators
4. Academic supervisors are NOT tied to departments and can supervise up to 10 students cross-department

### Magic Link Onboarding (Modern Flow)

**New Preferred Method**: Magic Link + First-Time Setup

1. **Invitation Phase**:

- Admin/Coordinator sends invitation via email (only email + role required)
- System generates secure one-time token (32-byte hex)
- Magic link sent to user's email with 7-day expiration
- Invitation tracked in `Invitation` collection

2. **Verification Phase**:

- User clicks magic link → token verified
- Public route: `GET /api/v1/invitations/verify/:token`
- Validates: token exists, not expired, not already used
- Redirects to first-time setup page

3. **Setup Phase**:

- User completes profile: name, password, phone, role-specific fields
- Public route: `POST /api/v1/invitations/complete-setup`
- Creates User + role-specific profile (Student, Supervisor)
- Marks invitation as "accepted"
- No default password - user sets their own

**RBAC for Invitations**:

- Admin invites: Coordinators, Academic Supervisors, Faculty
- Coordinator invites: Students, Industrial Supervisors
- Permissions enforced in `invitationService.validateInvitationPermissions()`

**Key Features**:

- One-time use tokens
- Automatic expiration (7 days)
- Resend capability (5-minute cooldown)
- Email notifications with professional HTML templates
- Status tracking: pending → accepted/expired/cancelled
- Department auto-assignment for coordinator-created users

**Frontend Pages**:

- Admin: `/admin/invitations` - Manage all invitations
- Coordinator: `/coordinator/invitations` - Student invitations
- Public: `/invite/verify?token=XXX` - Token verification
- Public: `/invite/setup?token=XXX` - First-time setup form

**Email Service** (`utils/emailService.js`):

- Development: Uses Ethereal Email (test mode, preview URLs in logs)
- Production: Configurable SMTP (Gmail, SendGrid, AWS SES, etc.)
- Templates: Invitation email, Welcome email
- Environment vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FRONTEND_URL`

**Legacy Flow Still Available**: Manual user creation with default password exists as fallback

### Placement Workflow

1. Student submits placement with company details
2. Coordinator reviews → Approve/Reject
3. On approval: Industrial supervisor user + profile created, assigned to placement
4. Student status → `approved`, supervisor relationships established

### Logbook Dual-Review System

Status progression: `draft` → `submitted` → `reviewed` → `approved`

- Student submits weekly entry
- **Both** academic AND industrial supervisors must review
- Separate `departmentalReview` (academic) and `industrialReview` objects with ratings (1-5)
- Approved only when both reviews exist

### Assessment Grading

- Final grade = 40% academic + 60% industrial assessments
- Criteria: punctuality, technical_skills, teamwork, initiative, report_writing
- Status: `pending` → `submitted` → `completed` (after coordinator verification)

## Development Commands

```bash
# Backend
cd backend
npm run dev          # Nodemon dev server (port 5000)
npm test             # Jest with coverage
npm run seed         # Populate DB with sample data

# Frontend
cd client
npm run dev          # Next.js dev server (port 3000)
npm run build        # Production build
```

## File Upload Handling

Uses Multer middleware for file uploads (acceptance letters, logbook evidence):

- Storage: `backend/uploads/logbooks/`
- Access in controllers via `req.file` or `req.files`
- Validation in routes before controller

## Validation Patterns

**Backend**: Joi schemas in `utils/validators.js` + express-validator middleware

```javascript
router.post("/", validateBody(createStudentSchema), studentController.create);
```

**Frontend**: Zod schemas + React Hook Form

```typescript
const schema = z.object({ email: z.string().email() });
const form = useForm({ resolver: zodResolver(schema) });
```

## Common Gotchas

1. **Population Required**: Always populate `department`, `faculty`, supervisor relationships when querying students/placements
2. **Status Transitions**: Check current status before updates (can't approve already-approved placement)
3. **Dual Supervisor**: When filtering logbooks by supervisor, check BOTH `departmentalSupervisor` (academic) and `industrialSupervisor` fields
4. **Session Storage**: First-login password reset uses `sessionStorage.getItem('resetUserId')` on frontend
5. **Department Not Required**: Coordinators MUST have `department` field, but Academic Supervisors can supervise cross-department (department is optional)

## Testing

Backend uses Jest with MongoDB Memory Server (see `src/tests/setup.js`):

- Unit tests for services in `src/tests/services/`
- Integration tests mock Mongoose models
- Run with `npm test` for coverage report

## Logging

Winston logger (`utils/logger.js`) writes to:

- Console (development)
- `logs/error.log` (errors only)
- `logs/combined.log` (all logs)

Use appropriate levels: `logger.error()`, `logger.warn()`, `logger.info()`, `logger.debug()`

## Environment Variables

**Backend** (`.env`):

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/siwes_management
JWT_SECRET=<secret>
DEFAULT_PASSWORD=Change@123
```

**Frontend** (`.env.local`):

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## API Route Structure

All backend routes under `/api/v1/`:

- `/auth` - Login, password reset, profile
- `/students`, `/placements`, `/logbooks`, `/assessments` - CRUD + workflow actions
- `/faculties`, `/departments` - Hierarchy management
- `/supervisors` - Supervisor profiles
- `/notifications` - In-app notifications

Frontend services mirror backend routes - e.g., `studentService.getAll()` → `GET /api/v1/students`

## Complete Feature List

### 1. Authentication & User Management

**Authentication Features:**

- JWT-based login with role-based dashboard routing
- Forced password reset on first login (stores `resetUserId` in sessionStorage)
- Password change for authenticated users
- User profile retrieval with role-specific data population
- Auto-logout on 401 responses with redirect to login

**User Creation Hierarchy:**

- **Admin creates**: Faculty, Department, Coordinator, Academic Supervisor accounts
- **Coordinator creates**: Student, Industrial Supervisor accounts
- Default password: `Change@123` (configurable via `DEFAULT_PASSWORD` env var)
- Email uniqueness validation across all user types
- Role-based permission checks prevent unauthorized user creation

### 2. Faculty & Department Management

**Faculty Module:**

- Create/update/delete faculties with name, code, description, dean info
- Active/inactive status toggle
- Department count and student statistics
- Department-scoped access for coordinators (read-only for own faculty)

**Department Module:**

- Create departments under faculties with name, code, HOD details
- Assign coordinators to departments (one coordinator per department)
- Track student count, placement rates, supervisor counts
- Department statistics: total students, placed/unplaced, completion rates
- Coordinators auto-scoped to their assigned department

### 3. Student Management

**Student Profile:**

- Matric number (unique identifier), level (100-600), session (YYYY/YYYY format)
- CGPA tracking (0.0-5.0 scale)
- Department assignment (required, populated from coordinator's department)
- Placement status flags: `hasPlacement`, `placementApproved`, `trainingCompleted`
- Training period dates (copied from approved placement)

**Student Operations:**

- List students with filters: department, level, session, placement status
- Get detailed student info with populated department, supervisors, current placement
- Update student profile: level, CGPA, contact information
- Student dashboard: placement status, logbook summary, assessment progress, supervisor info
- Assign departmental/industrial supervisors to students

### 4. Placement Management

**Placement Submission (Student):**

- Company details: name, address, email, phone, website, sector
- Position/role information and department
- Industrial supervisor details: name, email, phone, position
- Training period: start date, end date (validation: end >= start)
- Acceptance letter upload (via Multer to `uploads/logbooks/`)
- Status: `pending` on submission

**Placement Review (Coordinator):**

- List placements with filters: student, status, department, date range
- Approve placement:
  - Creates industrial supervisor User account (if doesn't exist)
  - Creates Supervisor profile with company details
  - Assigns supervisor to placement and student
  - Updates student: `hasPlacement=true`, `placementApproved=true`, copies training dates
  - Sends notification to student and supervisor
- Reject placement with reason
- Reassign industrial supervisor to existing placement

**Placement Tracking:**

- View placement history per student
- Department-level placement statistics
- Placement status transitions: `pending` → `approved` / `rejected` / `withdrawn`

### 5. Logbook Management (Dual-Review System)

**Logbook Entry (Student):**

- Weekly entries: week number (1-52), start/end dates
- Content fields: tasks performed (required, 10-2000 chars), skills acquired, challenges, lessons learned
- Evidence attachments: multiple files per entry (name, path, type, uploadedAt)
- Status progression: `draft` → `submitted` → `reviewed` → `approved`
- Submit entry for supervisor review

**Supervisor Review:**

- **Academic Supervisor**: Reviews from academic perspective
- **Industrial Supervisor**: Reviews from workplace perspective
- Review components: comment (max 1000 chars), rating (0-10), status
- Separate `departmentalReview` and `industrialReview` objects track each supervisor's feedback
- Entry approved only when **both** supervisors complete review
- Rejection with feedback returns entry to student

**Logbook Operations:**

- List logbooks with filters: student, supervisor, status, week range, date range
- Get pending reviews for supervisor dashboard
- Student logbook summary: total entries, submitted, approved, rejected counts
- Update draft logbook entries
- Export logbook data (PDF-ready format)

### 6. Assessment & Grading

**Assessment Creation (Supervisors):**

- Assessment types: `ACADEMIC` (by academic supervisor), `INDUSTRIAL` (by industrial supervisor)
- Multi-criteria scoring (0-100 each):
  - Technical skills
  - Communication
  - Punctuality
  - Initiative
  - Teamwork
  - Professionalism (optional)
  - Problem solving (optional)
  - Adaptability (optional)
- Qualitative feedback: strengths, areas for improvement, general comment
- Recommendation: excellent, very_good, good, fair, poor
- Auto-calculate overall grade: A (90-100), B (80-89), C (70-79), D (60-69), F (<60)

**Assessment Workflow:**

- Status: `pending` → `submitted` → `completed`
- Supervisor submits assessment
- Coordinator verifies assessment with optional comment
- Calculate final student grade: **40% academic + 60% industrial**
- View student assessment history

**Assessment Reports:**

- Student final grade calculation
- Supervisor performance metrics: assessments completed, average scores
- Department assessment completion rates

### 7. Supervisor Management

**Supervisor Profiles:**

- Types: `academic` (academic), `industrial` (workplace)
- Academic: staff ID, office location, specialization, max 10 students (cross-department)
- Industrial: company name, position, years of experience
- Assigned students tracking with capacity management
- Availability status: auto-calculated from `assignedStudents.length < maxStudents`

**Supervisor Operations:**

- List supervisors with filters: type, department, availability
- Get available supervisors for assignment (capacity check)
- Assign/unassign students to supervisors
- Supervisor dashboard: assigned students, pending logbook reviews, pending assessments
- Update supervisor profile and capacity limits

### 8. Notification System

**Notification Types:**

- `PLACEMENT_APPROVED` - Placement approval confirmation
- `PLACEMENT_REJECTED` - Placement rejection with reason
- `SUPERVISOR_ASSIGNED` - Supervisor assignment notification
- `LOGBOOK_COMMENT` - Logbook review/feedback
- `LOGBOOK_APPROVED` / `LOGBOOK_REJECTED` - Logbook status updates
- `ASSESSMENT_SUBMITTED` - Assessment completion notice
- `DEADLINE_REMINDER` - Upcoming deadline alerts
- `PASSWORD_RESET` - Password reset instructions
- `ACCOUNT_CREATED` - New account welcome
- `GENERAL` - System announcements

**Notification Features:**

- Priority levels: LOW, MEDIUM, HIGH
- In-app notifications with read/unread status
- Optional email notifications via NodeMailer
- Related resource linking: Placement, Logbook, Assessment, Student, User
- Action links and action text for quick navigation
- Bulk notification creation
- Mark as read (single/all), delete notifications
- Unread count for badge display

### 9. Reporting & Analytics

**Department Statistics:**

- Total students, placed vs unplaced counts, placement rate %
- Pending placements, total supervisors
- Completed assessments, logbook submission rates
- Training completion statistics

**Faculty Statistics:**

- Total departments under faculty
- Aggregate student counts across departments
- Faculty-wide placement rates
- Supervisor distribution

**Institutional Overview (Admin):**

- System-wide counts: faculties, departments, students
- Overall placement rate and trends
- Pending vs approved placements
- Completed assessments count
- Monthly placement trends (time-series data)

**Student Progress Report:**

- Training progress percentage (based on dates)
- Logbook statistics: total, submitted, approved, rejected
- Assessment completion status
- Supervisor information
- Final grade calculation

**Supervisor Performance:**

- Total assigned students
- Assessments completed count
- Average scores given across all assessments
- Logbook review completion rate

**Placement Analytics:**

- Placement distribution by department/faculty
- Company sector analysis
- Approval/rejection rates
- Average processing time

### 10. System Settings & Preferences

**System Configuration:**

- Academic session management (current session)
- Training duration defaults (weeks/months)
- Assessment criteria weighting (dept vs industrial %)
- Email notification toggles
- Password policy settings

**User Preferences:**

- Notification preferences per type (in-app, email, both, none)
- Email notification frequency (immediate, daily digest, weekly)
- Display preferences (theme, language)

### 11. Security Features

**Implemented Security:**

- Helmet middleware for security headers
- CORS configuration with allowed origins
- Rate limiting on sensitive endpoints (login, password reset)
- JWT token expiration (configurable, default 7 days)
- Password hashing with bcrypt (12 rounds)
- Input sanitization to prevent XSS
- MongoDB injection prevention via Mongoose
- Request validation with Joi and express-validator

**Authorization Patterns:**

- Role-based route protection (`requireRoles` middleware)
- Department-scoped data access for coordinators
- Resource ownership verification (students access own data)
- Supervisor-student relationship validation before operations

### 12. File Management

**File Upload:**

- Acceptance letters for placement applications
- Logbook evidence/attachments (screenshots, documents, photos)
- Multer middleware configuration
- Storage path: `backend/uploads/logbooks/`
- File metadata tracking: name, path, type, uploadedAt
- Multiple files per logbook entry

### 13. Frontend Features (Next.js 14)

**Role Dashboards:**

- **Admin**: System overview, user management, faculty/department CRUD, reports
- **Coordinator**: Student management, placement approval, supervisor assignment, department analytics
- **Academic Supervisor**: Assigned students (up to 10 cross-department), logbook review, assessment submission
- **Industrial Supervisor**: Workplace students, logbook review, industrial assessment
- **Student**: Placement submission, weekly logbook, supervisor info, progress tracking
- **Faculty**: Department oversight, faculty-level statistics

**UI Components (shadcn/ui):**

- Data tables with sorting, filtering, pagination (TanStack Table)
- Forms with validation (React Hook Form + Zod)
- Modals/Dialogs for create/edit operations
- Toast notifications for feedback
- Loading skeletons and states
- Empty states with illustrations
- Badge components for status display
- Responsive navigation with mobile menu

**State Management:**

- TanStack Query for server state (caching, refetching, optimistic updates)
- React hooks for local UI state
- Auth context provider for global user state
- Query invalidation on mutations for real-time updates

### 14. Developer Tools

**Testing:**

- Jest test framework with MongoDB Memory Server
- Service layer unit tests
- Integration tests with mocked models
- Coverage reporting

**Logging:**

- Winston logger with multiple transports
- Console (development), file logging (production)
- Separate error and combined logs
- Log levels: error, warn, info, debug

**Seeding:**

- Database seed script for demo data
- Sample users for all roles
- Test students, placements, logbooks
- Run via `npm run seed`

**API Documentation:**

- Comprehensive API reference in `API_REFERENCE.md`
- Module guides in `MODULE_GUIDE.md`
- Architecture documentation
- RBAC implementation guide
