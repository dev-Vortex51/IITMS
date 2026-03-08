-- CreateEnum
CREATE TYPE "EvaluationType" AS ENUM ('midterm', 'final');

-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('draft', 'submitted', 'completed');

-- CreateTable
CREATE TABLE "evaluations" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "placementId" TEXT,
    "type" "EvaluationType" NOT NULL DEFAULT 'midterm',
    "status" "EvaluationStatus" NOT NULL DEFAULT 'draft',
    "technicalSkill" INTEGER NOT NULL,
    "communication" INTEGER NOT NULL,
    "professionalism" INTEGER NOT NULL,
    "punctuality" INTEGER NOT NULL,
    "problemSolving" INTEGER NOT NULL,
    "workAttitude" INTEGER,
    "initiative" INTEGER,
    "totalScore" DOUBLE PRECISION,
    "grade" TEXT,
    "strengths" TEXT,
    "areasForImprovement" TEXT,
    "comment" TEXT,
    "submittedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "evaluations_studentId_supervisorId_type_key" ON "evaluations"("studentId", "supervisorId", "type");

-- CreateIndex
CREATE INDEX "evaluations_studentId_idx" ON "evaluations"("studentId");

-- CreateIndex
CREATE INDEX "evaluations_supervisorId_idx" ON "evaluations"("supervisorId");

-- CreateIndex
CREATE INDEX "evaluations_type_idx" ON "evaluations"("type");

-- CreateIndex
CREATE INDEX "evaluations_status_idx" ON "evaluations"("status");

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "supervisors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "placements"("id") ON DELETE SET NULL ON UPDATE CASCADE;
