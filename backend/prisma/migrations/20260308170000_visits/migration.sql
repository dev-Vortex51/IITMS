-- CreateEnum
CREATE TYPE "VisitType" AS ENUM ('physical', 'virtual');

-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('scheduled', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "visits" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "placementId" TEXT,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "type" "VisitType" NOT NULL DEFAULT 'physical',
    "status" "VisitStatus" NOT NULL DEFAULT 'scheduled',
    "objective" TEXT,
    "location" TEXT,
    "feedback" TEXT,
    "score" INTEGER,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "visits_studentId_idx" ON "visits"("studentId");

-- CreateIndex
CREATE INDEX "visits_supervisorId_idx" ON "visits"("supervisorId");

-- CreateIndex
CREATE INDEX "visits_placementId_idx" ON "visits"("placementId");

-- CreateIndex
CREATE INDEX "visits_visitDate_idx" ON "visits"("visitDate");

-- CreateIndex
CREATE INDEX "visits_status_idx" ON "visits"("status");

-- CreateIndex
CREATE INDEX "visits_studentId_supervisorId_visitDate_idx" ON "visits"("studentId", "supervisorId", "visitDate");

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "supervisors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "placements"("id") ON DELETE SET NULL ON UPDATE CASCADE;
