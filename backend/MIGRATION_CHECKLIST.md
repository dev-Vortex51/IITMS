# MongoDB → PostgreSQL Migration Checklist

## ✅ Phase 0-1: Docker Setup (COMPLETED)

- [x] Created `docker-compose.yml` with PostgreSQL 15 and pgAdmin
- [x] Created `.dockerignore` for Docker builds
- [x] Created PostgreSQL initialization script (`init-db.sql`)
- [x] Created MongoDB backup script (`backup-mongodb.js`)
- [x] Created Docker helper scripts (PowerShell & Bash)
- [x] Updated `.env` with `DATABASE_URL` for PostgreSQL
- [x] Updated `.env.example` as template
- [x] Added npm scripts for Docker and migration
- [x] Created comprehensive `DOCKER_SETUP.md` documentation

## ✅ Phase 2: Prisma Setup (COMPLETED)

### Installation ✅

- [x] Installed Prisma dependencies (`prisma@6`, `@prisma/client@6`)
- [x] Initialized Prisma with `npx prisma init`
- [x] Verified `prisma/schema.prisma` created

### Schema Design ✅

- [x] Converted User model to Prisma
- [x] Converted Faculty model to Prisma
- [x] Converted Department model to Prisma
- [x] Converted Student model to Prisma
- [x] Converted Supervisor model to Prisma
- [x] Converted Placement model to Prisma
- [x] Converted Logbook model to Prisma
- [x] Converted LogbookEvidence model to Prisma
- [x] Converted LogbookReview model to Prisma
- [x] Converted Assessment model to Prisma
- [x] Converted Attendance model to Prisma
- [x] Converted Notification model to Prisma
- [x] Converted NotificationPreference model to Prisma
- [x] Converted Invitation model to Prisma
- [x] Converted SupervisorAssignment model to Prisma
- [x] Converted SystemSettings model to Prisma
- [x] Defined all enums (UserRole, PlacementStatus, etc.)
- [x] Set up indexes and constraints
- [x] Configured relationships (1:1, 1:N, M:N)

### Generate & Migrate ✅

- [x] Generated Prisma Client: `npx prisma generate`
- [x] Created initial migration: `npx prisma migrate dev --name init`
- [x] Verified tables created in PostgreSQL (18 tables + \_prisma_migrations)
- [x] Confirmed Prisma Studio ready: `npx prisma studio`

## 🔄 Next: Phase 3 - Database Config Layer

### Installation (30 mins)

- [ ] Install Prisma dependencies
  ```bash
  npm install prisma @prisma/client
  npm install -D prisma
  ```
- [ ] Initialize Prisma
  ```bash
  npx prisma init
  ```
- [ ] Verify `prisma/schema.prisma` created
- [ ] Configure database connection in schema

### Schema Design (2-3 hours)

- [ ] Convert User model to Prisma
- [ ] Convert Faculty model to Prisma
- [ ] Convert Department model to Prisma
- [ ] Convert Student model to Prisma
- [ ] Convert Supervisor model to Prisma
- [ ] Convert Placement model to Prisma
- [ ] Convert Logbook model to Prisma
- [ ] Convert Assessment model to Prisma
- [ ] Convert Attendance model to Prisma
- [ ] Convert Notification model to Prisma
- [ ] Convert NotificationPreference model to Prisma
- [ ] Convert Invitation model to Prisma
- [ ] Convert SupervisorAssignment model to Prisma
- [ ] Convert SystemSettings model to Prisma
- [ ] Define all enums (UserRole, PlacementStatus, etc.)
- [ ] Set up indexes and constraints
- [ ] Configure relationships (1:1, 1:N, M:N)

### Generate & Migrate

- [ ] Generate Prisma Client: `npx prisma generate`
- [ ] Create initial migration: `npx prisma migrate dev --name init`
- [ ] Verify tables created in PostgreSQL
- [ ] Test Prisma Studio: `npx prisma studio`

## ✅ Phase 3: Database Config Layer (COMPLETED)

- [x] Created `src/config/prisma.js` singleton with connection retry logic
- [x] Updated `src/config/database.js` for PostgreSQL via Prisma
- [x] Added comprehensive Prisma error handling utilities (`src/utils/prismaErrors.js`)
- [x] Implemented connection retry logic (5 attempts with 5s delays)
- [x] Updated graceful shutdown for Prisma Client
- [x] Verified Prisma Client connectivity (18 tables accessible)
- [x] Fixed DATABASE_URL port mapping (5433 for Docker)

## ✅ Phase 4: Service Migration (COMPLETED)

Order of migration (dependency-based):

- [x] authService.js - Login & authentication
- [x] userService.js - User CRUD
- [x] facultyService.js - Faculty management
- [x] departmentService.js - Department management
- [x] studentService.js - Student management
- [x] supervisorService.js - Supervisor management
- [x] placementService.js - Placement workflows
- [x] logbookService.js - Logbook management
- [x] assessmentService.js - Assessment & grading
- [x] attendanceService.js - Attendance tracking
- [x] notificationService.js - Notifications
- [x] invitationService.js - Invitation system
- [x] reportService.js - Reports & analytics

Conversions applied:

- [x] Replaced Mongoose imports with Prisma client
- [x] Converted `.find()` to `findMany()`
- [x] Converted `.findOne()` to `findUnique()`
- [x] Converted `.create()` to Prisma `create()`
- [x] Converted `.populate()` to `include`
- [x] Moved virtual fields to service layer
- [x] Migrated static methods to service functions
- [x] Migrated pre/post hooks to service logic
- [x] Updated transactions to use Prisma `$transaction`
- [x] Added comprehensive Prisma error handling
- [x] Verified all services use getPrismaClient() singleton

## 🔄 Phase 5: Data Migration (1-2 hours)

### Script Creation ✅

- [x] Create `scripts/migrate-data.js` with complete migration logic
- [x] Implement dependency-ordered migration pipeline
- [x] Add id mapping for MongoDB ObjectId → PostgreSQL UUID conversion
- [x] Error handling with skip-on-error pattern
- [x] Verification functions with record count reports

### Data Migration (Ready to Execute)

- [ ] Backup MongoDB: `npm run backup:mongo`
- [ ] Execute migration: `npm run migrate:data`
- [ ] Migrate Users table
- [ ] Migrate Faculties table
- [ ] Migrate Departments table
- [ ] Migrate Supervisors table
- [ ] Migrate Students table
- [ ] Migrate SupervisorAssignments
- [ ] Migrate Placements table
- [ ] Migrate Logbooks table
- [ ] Migrate LogbookEvidence & Reviews
- [ ] Migrate Assessments table
- [ ] Migrate Attendance records
- [ ] Migrate Notifications
- [ ] Migrate NotificationPreferences
- [ ] Migrate Invitations
- [ ] Migrate SystemSettings
- [ ] Verify data integrity (record counts)
- [ ] Check foreign key relationships

## 🔄 Phase 6: Controller Updates (✅ IN PROGRESS)

- [x] Updated auth middleware to use Prisma instead of Mongoose
  - [x] Replaced User.findById() with prisma.user.findUnique()
  - [x] Updated all ID references from req.user.\_id to req.user.id
  - [x] Fixed student/supervisor profile lookups with Prisma
- [x] Created settingsService.js with Prisma operations
  - [x] getSystemSettings (find or create with defaults)
  - [x] updateSystemSettings
  - [x] getNotificationPreferences (find or create with defaults)
  - [x] updateNotificationPreferences
- [x] Updated settingsController to use service instead of direct Mongoose
- [x] Added getStudentPlacement method to placementService
- [x] Updated studentController to remove Mongoose Placement import
- [x] Updated all controller ID references
  - [x] placementController.js - replaced all req.user.\_id
  - [x] userController.js - replaced req.user.\_id
  - [x] authController.js - replaced req.user.\_id (+ fixed missing param extraction)
  - [x] notificationController.js - replaced req.user.\_id
  - [x] logbookController.js - replaced req.user.\_id
  - [x] assessmentController.js - replaced req.user.\_id
  - [x] attendanceController.js - fixed profile references
- [x] Verified no remaining Mongoose model imports in controllers
- [x] Updated services/index.js to export settingsService

## ✅ Phase 7: Middleware & Utils (COMPLETED)

- [x] Updated `middleware/auth.js` for Prisma
  - [x] Replaced User.findById() with prisma.user.findUnique()
  - [x] Updated token generation to use user.id
  - [x] Fixed profile lookups with Prisma
- [x] Updated `middleware/authorization.js` for Prisma
  - [x] Line 83: Changed req.user.\_id.toString() to req.user.id
  - [x] Lines 105-115: Replaced Student.findOne() with prisma.student.findUnique()
  - [x] Lines 125-133: Replaced Supervisor.findOne() with prisma.supervisor.findUnique()
  - [x] Lines 170-171: Replaced Supervisor.findOne() with prisma.supervisor.findUnique()
- [x] Updated `middleware/security.js` for Prisma
  - [x] Line 77: Changed keyGenerator to use req.user.id instead of req.user.\_id.toString()
- [x] Updated `middleware/validation.js` for UUID support
  - [x] validateObjectId now accepts both UUID (v4) and MongoDB ObjectId formats
- [x] Updated `middleware/errorHandler.js` for Prisma
  - [x] Removed unused Mongoose error handlers (CastError, DuplicateKeyError, ValidationError)
  - [x] Updated comments to reference Prisma instead of Mongoose
  - [x] Kept JWT error handling
- [x] Verified all middleware uses correct ID patterns (user.id instead of user.\_id)
- [x] Zero Mongoose imports in active middleware code

## 🔄 Phase 8: Testing (1-2 hours)

- [ ] Update test setup for PostgreSQL
- [ ] Update unit tests for services
- [ ] Run integration tests
- [ ] Test authentication flow
- [ ] Test user creation (all roles)
- [ ] Test student management
- [ ] Test placement workflow
- [ ] Test logbook system
- [ ] Test assessment grading
- [ ] Test notifications
- [ ] Test file uploads
- [ ] Test reports generation
- [ ] Verify data integrity in PostgreSQL
- [ ] Performance benchmarking

## 🔄 Phase 9: Deployment Prep (30 mins)

- [ ] Create production `.env.production`
- [ ] Update deployment documentation
- [ ] Create production migration guide
- [ ] Test rollback procedure
- [ ] Document breaking changes (if any)

## 🔄 Phase 10: Cleanup (30 mins)

- [ ] Remove Mongoose from `package.json`
- [ ] Archive old Mongoose models
- [ ] Remove Mongoose-specific code
- [ ] Update README.md
- [ ] Update API documentation
- [ ] Create migration notes

## 🧪 Testing Your Docker Setup

Run these commands to verify Phase 0-1 is complete:

### 1. Start PostgreSQL

```powershell
cd backend
.\scripts\docker-commands.ps1 start
```

### 2. Check Status

```powershell
.\scripts\docker-commands.ps1 status
```

Expected output:

```
NAME            STATUS    PORTS
siwes_postgres  healthy   5432
siwes_pgadmin   running   5050
```

### 3. Test Connection

```powershell
.\scripts\docker-commands.ps1 shell
```

Then in psql:

```sql
\l                    -- List databases
\dt                   -- List tables (should be empty for now)
\q                    -- Quit
```

### 4. Access pgAdmin

Open browser: http://localhost:5050

- Email: `admin@siwes.local`
- Password: `admin123`

### 5. Backup MongoDB (Before proceeding!)

```bash
npm run backup:mongo
```

## 📊 Progress Tracking

**Completed:** Phase 0-1 (Docker Setup) ✅ → Phase 2 (Prisma Setup) ✅ → Phase 3 (Database Config) ✅ → Phase 4 (Service Migration) ✅ → Phase 5 (Script) ✅ → Phase 6 (Controllers) ✅ → Phase 7 (Middleware & Utils) ✅  
**Current:** Ready for Phase 8 (Testing)  
**Total Progress:** 85% complete  
**Estimated Time Remaining:** 1-2 hours

## ✅ Summary of All Fixes Applied

### Phase 6 & 7 Complete Fixes

1. **Fixed authController.js** - Added missing `req.body` parameter extraction in `resetPasswordFirstLogin`
2. **Fixed all middleware** - Replaced all `req.user._id` with `req.user.id` (UUID format)
3. **Fixed authorization middleware** - Converted all Mongoose Student/Supervisor lookups to Prisma
4. **Fixed security middleware** - Updated rate limit keyGenerator to use req.user.id
5. **Fixed validation middleware** - Updated ID format validation to accept UUIDs
6. **Cleaned errorHandler** - Removed Mongoose-specific error handlers, kept JWT handlers
7. **Verified** - Zero Mongoose imports in active services, controllers, and middleware

### Remaining Work

- Phase 8: Update test setup and run integration tests
- Phase 9: Deployment prep
- Phase 10: Cleanup (remove Mongoose from package.json)
