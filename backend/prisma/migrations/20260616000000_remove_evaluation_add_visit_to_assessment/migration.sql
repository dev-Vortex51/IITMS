-- Drop evaluations table and its enums
DROP TABLE IF EXISTS "evaluations" CASCADE;
DROP TYPE IF EXISTS "EvaluationType" CASCADE;
DROP TYPE IF EXISTS "EvaluationStatus" CASCADE;

-- Add visitId to assessments
ALTER TABLE "assessments" ADD COLUMN "visitId" TEXT;
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "assessments_visitId_idx" ON "assessments"("visitId");

-- Remove old scoring columns from system_settings
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "evaluationWeight";
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "visitationWeight";
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "maxVisitations";

-- Update default weights
ALTER TABLE "system_settings" ALTER COLUMN "logbookWeight" SET DEFAULT 50;
UPDATE "system_settings" SET "logbookWeight" = 50;
ALTER TABLE "system_settings" ALTER COLUMN "assessmentWeight" SET DEFAULT 30;
