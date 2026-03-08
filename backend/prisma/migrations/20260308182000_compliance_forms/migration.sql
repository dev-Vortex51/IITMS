-- CreateEnum
CREATE TYPE "ComplianceFormType" AS ENUM (
  'acceptance_letter',
  'introduction_letter',
  'monthly_clearance',
  'indemnity_form',
  'itf_form_8',
  'school_form',
  'final_clearance'
);

-- CreateEnum
CREATE TYPE "ComplianceFormStatus" AS ENUM ('draft', 'submitted', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "compliance_forms" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "placementId" TEXT,
  "formType" "ComplianceFormType" NOT NULL,
  "title" TEXT,
  "status" "ComplianceFormStatus" NOT NULL DEFAULT 'draft',
  "documentName" TEXT,
  "documentPath" TEXT,
  "note" TEXT,
  "submittedAt" TIMESTAMP(3),
  "reviewedById" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "reviewComment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "compliance_forms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "compliance_forms_studentId_idx" ON "compliance_forms"("studentId");

-- CreateIndex
CREATE INDEX "compliance_forms_placementId_idx" ON "compliance_forms"("placementId");

-- CreateIndex
CREATE INDEX "compliance_forms_formType_idx" ON "compliance_forms"("formType");

-- CreateIndex
CREATE INDEX "compliance_forms_status_idx" ON "compliance_forms"("status");

-- CreateIndex
CREATE INDEX "compliance_forms_reviewedById_idx" ON "compliance_forms"("reviewedById");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_forms_studentId_formType_key" ON "compliance_forms"("studentId", "formType");

-- AddForeignKey
ALTER TABLE "compliance_forms" ADD CONSTRAINT "compliance_forms_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_forms" ADD CONSTRAINT "compliance_forms_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "placements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_forms" ADD CONSTRAINT "compliance_forms_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
