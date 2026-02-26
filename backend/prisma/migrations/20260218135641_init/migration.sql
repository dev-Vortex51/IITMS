-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'faculty', 'department', 'coordinator', 'student', 'academic_supervisor', 'industrial_supervisor');

-- CreateEnum
CREATE TYPE "PlacementStatus" AS ENUM ('pending', 'approved', 'rejected', 'withdrawn');

-- CreateEnum
CREATE TYPE "LogbookStatus" AS ENUM ('draft', 'submitted', 'reviewed', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('pending', 'submitted', 'completed');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('departmental', 'industrial', 'final');

-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F');

-- CreateEnum
CREATE TYPE "Recommendation" AS ENUM ('excellent', 'very_good', 'good', 'fair', 'poor');

-- CreateEnum
CREATE TYPE "SupervisorType" AS ENUM ('academic', 'departmental', 'industrial');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('placement_approved', 'placement_rejected', 'supervisor_assigned', 'supervisor_unassigned', 'logbook_comment', 'logbook_approved', 'logbook_rejected', 'assessment_submitted', 'deadline_reminder', 'password_reset', 'account_created', 'general');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('pending', 'accepted', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "InvitedByRole" AS ENUM ('admin', 'coordinator');

-- CreateEnum
CREATE TYPE "DayStatus" AS ENUM ('PRESENT_ON_TIME', 'PRESENT_LATE', 'HALF_DAY', 'ABSENT', 'EXCUSED_ABSENCE', 'INCOMPLETE');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "Punctuality" AS ENUM ('ON_TIME', 'LATE');

-- CreateEnum
CREATE TYPE "SupervisorAssignmentStatus" AS ENUM ('active', 'inactive', 'revoked');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "departmentId" TEXT,
    "facultyId" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "passwordResetRequired" BOOLEAN NOT NULL DEFAULT true,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "bio" TEXT,
    "profilePhoto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faculties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "facultyId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matricNumber" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "session" TEXT NOT NULL,
    "cgpa" DOUBLE PRECISION,
    "hasPlacement" BOOLEAN NOT NULL DEFAULT false,
    "placementApproved" BOOLEAN NOT NULL DEFAULT false,
    "trainingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "currentPlacementId" TEXT,
    "departmentalSupervisorId" TEXT,
    "industrialSupervisorId" TEXT,
    "trainingStartDate" TIMESTAMP(3),
    "trainingEndDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supervisors" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "SupervisorType" NOT NULL,
    "departmentId" TEXT,
    "companyName" TEXT,
    "companyAddress" TEXT,
    "position" TEXT,
    "qualification" TEXT,
    "yearsOfExperience" INTEGER,
    "specialization" TEXT,
    "staffId" TEXT,
    "officeLocation" TEXT,
    "maxStudents" INTEGER NOT NULL DEFAULT 10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supervisors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placements" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyAddress" TEXT NOT NULL,
    "companyEmail" TEXT NOT NULL,
    "companyPhone" TEXT NOT NULL,
    "companyWebsite" TEXT,
    "companySector" TEXT,
    "position" TEXT NOT NULL,
    "department" TEXT,
    "supervisorName" TEXT,
    "supervisorEmail" TEXT,
    "supervisorPhone" TEXT,
    "supervisorPosition" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "acceptanceLetter" TEXT,
    "acceptanceLetterPath" TEXT,
    "industrialSupervisorId" TEXT,
    "status" "PlacementStatus" NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logbooks" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "tasksPerformed" TEXT NOT NULL,
    "skillsAcquired" TEXT,
    "challenges" TEXT,
    "lessonsLearned" TEXT,
    "status" "LogbookStatus" NOT NULL DEFAULT 'draft',
    "submittedAt" TIMESTAMP(3),
    "departmentalReviewStatus" "LogbookStatus" NOT NULL DEFAULT 'submitted',
    "departmentalReviewedAt" TIMESTAMP(3),
    "industrialReviewStatus" "LogbookStatus" NOT NULL DEFAULT 'submitted',
    "industrialReviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logbooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logbook_evidence" (
    "id" TEXT NOT NULL,
    "logbookId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logbook_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logbook_reviews" (
    "id" TEXT NOT NULL,
    "logbookId" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "supervisorType" "SupervisorType" NOT NULL,
    "comment" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "status" "LogbookStatus" NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logbook_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "placementId" TEXT,
    "type" "AssessmentType" NOT NULL,
    "technical" INTEGER NOT NULL,
    "communication" INTEGER NOT NULL,
    "punctuality" INTEGER NOT NULL,
    "initiative" INTEGER NOT NULL,
    "teamwork" INTEGER NOT NULL,
    "professionalism" INTEGER,
    "problemSolving" INTEGER,
    "adaptability" INTEGER,
    "strengths" TEXT,
    "areasForImprovement" TEXT,
    "comment" TEXT,
    "recommendation" "Recommendation" NOT NULL,
    "grade" TEXT,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'pending',
    "submittedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verificationNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "placementId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),
    "hoursWorked" DOUBLE PRECISION,
    "punctuality" "Punctuality",
    "dayStatus" "DayStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "absenceReason" TEXT,
    "locationLatitude" DOUBLE PRECISION,
    "locationLongitude" DOUBLE PRECISION,
    "locationAddress" TEXT,
    "notes" TEXT,
    "supervisorId" TEXT,
    "supervisorComment" TEXT,
    "supervisorApprovedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'present',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'medium',
    "relatedModel" TEXT,
    "relatedId" TEXT,
    "actionLink" TEXT,
    "actionText" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT false,
    "placementAlerts" BOOLEAN NOT NULL DEFAULT false,
    "systemUpdates" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "invitedById" TEXT NOT NULL,
    "invitedByRole" "InvitedByRole" NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'pending',
    "departmentId" TEXT,
    "facultyId" TEXT,
    "matricNumber" TEXT,
    "level" INTEGER,
    "session" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "resendCount" INTEGER NOT NULL DEFAULT 0,
    "lastResentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supervisor_assignments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "placementId" TEXT,
    "status" "SupervisorAssignmentStatus" NOT NULL DEFAULT 'active',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supervisor_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "isSingleton" BOOLEAN NOT NULL DEFAULT true,
    "currentSession" TEXT NOT NULL DEFAULT '2024/2025',
    "semester" TEXT NOT NULL DEFAULT 'First Semester',
    "siweDuration" INTEGER NOT NULL DEFAULT 6,
    "minWeeks" INTEGER NOT NULL DEFAULT 24,
    "autoAssignSupervisors" BOOLEAN NOT NULL DEFAULT false,
    "requireLogbookApproval" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CoordinatorDepartments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CoordinatorDepartments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "users_departmentId_idx" ON "users"("departmentId");

-- CreateIndex
CREATE INDEX "users_facultyId_idx" ON "users"("facultyId");

-- CreateIndex
CREATE UNIQUE INDEX "faculties_name_key" ON "faculties"("name");

-- CreateIndex
CREATE UNIQUE INDEX "faculties_code_key" ON "faculties"("code");

-- CreateIndex
CREATE INDEX "faculties_name_idx" ON "faculties"("name");

-- CreateIndex
CREATE INDEX "faculties_code_idx" ON "faculties"("code");

-- CreateIndex
CREATE INDEX "faculties_isActive_idx" ON "faculties"("isActive");

-- CreateIndex
CREATE INDEX "faculties_isActive_createdAt_idx" ON "faculties"("isActive", "createdAt");

-- CreateIndex
CREATE INDEX "departments_name_idx" ON "departments"("name");

-- CreateIndex
CREATE INDEX "departments_code_idx" ON "departments"("code");

-- CreateIndex
CREATE INDEX "departments_facultyId_idx" ON "departments"("facultyId");

-- CreateIndex
CREATE INDEX "departments_isActive_idx" ON "departments"("isActive");

-- CreateIndex
CREATE INDEX "departments_isActive_facultyId_idx" ON "departments"("isActive", "facultyId");

-- CreateIndex
CREATE INDEX "departments_facultyId_createdAt_idx" ON "departments"("facultyId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_facultyId_key" ON "departments"("code", "facultyId");

-- CreateIndex
CREATE UNIQUE INDEX "students_userId_key" ON "students"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "students_matricNumber_key" ON "students"("matricNumber");

-- CreateIndex
CREATE UNIQUE INDEX "students_currentPlacementId_key" ON "students"("currentPlacementId");

-- CreateIndex
CREATE INDEX "students_userId_idx" ON "students"("userId");

-- CreateIndex
CREATE INDEX "students_matricNumber_idx" ON "students"("matricNumber");

-- CreateIndex
CREATE INDEX "students_departmentId_idx" ON "students"("departmentId");

-- CreateIndex
CREATE INDEX "students_level_idx" ON "students"("level");

-- CreateIndex
CREATE INDEX "students_session_idx" ON "students"("session");

-- CreateIndex
CREATE INDEX "students_hasPlacement_idx" ON "students"("hasPlacement");

-- CreateIndex
CREATE INDEX "students_placementApproved_idx" ON "students"("placementApproved");

-- CreateIndex
CREATE INDEX "students_isActive_idx" ON "students"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "supervisors_userId_key" ON "supervisors"("userId");

-- CreateIndex
CREATE INDEX "supervisors_userId_idx" ON "supervisors"("userId");

-- CreateIndex
CREATE INDEX "supervisors_type_idx" ON "supervisors"("type");

-- CreateIndex
CREATE INDEX "supervisors_departmentId_idx" ON "supervisors"("departmentId");

-- CreateIndex
CREATE INDEX "supervisors_isActive_idx" ON "supervisors"("isActive");

-- CreateIndex
CREATE INDEX "supervisors_isAvailable_idx" ON "supervisors"("isAvailable");

-- CreateIndex
CREATE INDEX "placements_studentId_idx" ON "placements"("studentId");

-- CreateIndex
CREATE INDEX "placements_status_idx" ON "placements"("status");

-- CreateIndex
CREATE INDEX "placements_startDate_idx" ON "placements"("startDate");

-- CreateIndex
CREATE INDEX "placements_industrialSupervisorId_idx" ON "placements"("industrialSupervisorId");

-- CreateIndex
CREATE INDEX "placements_studentId_status_idx" ON "placements"("studentId", "status");

-- CreateIndex
CREATE INDEX "logbooks_studentId_idx" ON "logbooks"("studentId");

-- CreateIndex
CREATE INDEX "logbooks_weekNumber_idx" ON "logbooks"("weekNumber");

-- CreateIndex
CREATE INDEX "logbooks_status_idx" ON "logbooks"("status");

-- CreateIndex
CREATE INDEX "logbooks_studentId_weekNumber_idx" ON "logbooks"("studentId", "weekNumber");

-- CreateIndex
CREATE INDEX "logbooks_studentId_status_idx" ON "logbooks"("studentId", "status");

-- CreateIndex
CREATE INDEX "logbook_evidence_logbookId_idx" ON "logbook_evidence"("logbookId");

-- CreateIndex
CREATE INDEX "logbook_reviews_logbookId_idx" ON "logbook_reviews"("logbookId");

-- CreateIndex
CREATE INDEX "logbook_reviews_supervisorId_idx" ON "logbook_reviews"("supervisorId");

-- CreateIndex
CREATE INDEX "assessments_studentId_idx" ON "assessments"("studentId");

-- CreateIndex
CREATE INDEX "assessments_supervisorId_idx" ON "assessments"("supervisorId");

-- CreateIndex
CREATE INDEX "assessments_type_idx" ON "assessments"("type");

-- CreateIndex
CREATE INDEX "assessments_status_idx" ON "assessments"("status");

-- CreateIndex
CREATE INDEX "assessments_studentId_type_idx" ON "assessments"("studentId", "type");

-- CreateIndex
CREATE INDEX "attendances_studentId_idx" ON "attendances"("studentId");

-- CreateIndex
CREATE INDEX "attendances_placementId_idx" ON "attendances"("placementId");

-- CreateIndex
CREATE INDEX "attendances_date_idx" ON "attendances"("date");

-- CreateIndex
CREATE INDEX "attendances_dayStatus_idx" ON "attendances"("dayStatus");

-- CreateIndex
CREATE INDEX "attendances_approvalStatus_idx" ON "attendances"("approvalStatus");

-- CreateIndex
CREATE INDEX "attendances_punctuality_idx" ON "attendances"("punctuality");

-- CreateIndex
CREATE INDEX "notifications_recipientId_idx" ON "notifications"("recipientId");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_priority_idx" ON "notifications"("priority");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_recipientId_isRead_idx" ON "notifications"("recipientId", "isRead");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "notification_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "invitations"("token");

-- CreateIndex
CREATE INDEX "invitations_email_idx" ON "invitations"("email");

-- CreateIndex
CREATE INDEX "invitations_token_idx" ON "invitations"("token");

-- CreateIndex
CREATE INDEX "invitations_status_idx" ON "invitations"("status");

-- CreateIndex
CREATE INDEX "invitations_email_status_idx" ON "invitations"("email", "status");

-- CreateIndex
CREATE INDEX "invitations_expiresAt_idx" ON "invitations"("expiresAt");

-- CreateIndex
CREATE INDEX "supervisor_assignments_studentId_idx" ON "supervisor_assignments"("studentId");

-- CreateIndex
CREATE INDEX "supervisor_assignments_supervisorId_idx" ON "supervisor_assignments"("supervisorId");

-- CreateIndex
CREATE INDEX "supervisor_assignments_placementId_idx" ON "supervisor_assignments"("placementId");

-- CreateIndex
CREATE INDEX "supervisor_assignments_status_idx" ON "supervisor_assignments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "supervisor_assignments_studentId_supervisorId_placementId_key" ON "supervisor_assignments"("studentId", "supervisorId", "placementId");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_isSingleton_key" ON "system_settings"("isSingleton");

-- CreateIndex
CREATE INDEX "_CoordinatorDepartments_B_index" ON "_CoordinatorDepartments"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisors" ADD CONSTRAINT "supervisors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisors" ADD CONSTRAINT "supervisors_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placements" ADD CONSTRAINT "placements_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placements" ADD CONSTRAINT "placements_industrialSupervisorId_fkey" FOREIGN KEY ("industrialSupervisorId") REFERENCES "supervisors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logbooks" ADD CONSTRAINT "logbooks_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logbook_evidence" ADD CONSTRAINT "logbook_evidence_logbookId_fkey" FOREIGN KEY ("logbookId") REFERENCES "logbooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logbook_reviews" ADD CONSTRAINT "logbook_reviews_logbookId_fkey" FOREIGN KEY ("logbookId") REFERENCES "logbooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logbook_reviews" ADD CONSTRAINT "logbook_reviews_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "supervisors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "supervisors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "placements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "placements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "supervisors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisor_assignments" ADD CONSTRAINT "supervisor_assignments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisor_assignments" ADD CONSTRAINT "supervisor_assignments_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "supervisors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisor_assignments" ADD CONSTRAINT "supervisor_assignments_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "placements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoordinatorDepartments" ADD CONSTRAINT "_CoordinatorDepartments_A_fkey" FOREIGN KEY ("A") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoordinatorDepartments" ADD CONSTRAINT "_CoordinatorDepartments_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
