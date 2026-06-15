-- AlterTable: Add timezone column to placements
ALTER TABLE "placements" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'Africa/Lagos';

-- AlterTable: Add timezone column to visits (if not already present)
ALTER TABLE "visits" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'Africa/Lagos';
