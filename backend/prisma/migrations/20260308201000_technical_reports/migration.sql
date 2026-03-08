-- CreateEnum
CREATE TYPE "TechnicalReportStatus" AS ENUM ('draft', 'submitted', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "technical_reports" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "placementId" TEXT,
  "title" TEXT,
  "abstract" TEXT,
  "status" "TechnicalReportStatus" NOT NULL DEFAULT 'draft',
  "documentName" TEXT,
  "documentPath" TEXT,
  "note" TEXT,
  "submittedAt" TIMESTAMP(3),
  "reviewedById" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "reviewComment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "technical_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "technical_reports_studentId_idx" ON "technical_reports"("studentId");

-- CreateIndex
CREATE INDEX "technical_reports_placementId_idx" ON "technical_reports"("placementId");

-- CreateIndex
CREATE INDEX "technical_reports_status_idx" ON "technical_reports"("status");

-- CreateIndex
CREATE INDEX "technical_reports_reviewedById_idx" ON "technical_reports"("reviewedById");

-- CreateIndex
CREATE UNIQUE INDEX "technical_reports_studentId_key" ON "technical_reports"("studentId");

-- AddForeignKey
ALTER TABLE "technical_reports" ADD CONSTRAINT "technical_reports_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technical_reports" ADD CONSTRAINT "technical_reports_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "placements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technical_reports" ADD CONSTRAINT "technical_reports_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
