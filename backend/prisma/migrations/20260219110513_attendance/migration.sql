-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "distanceFromOffice" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "placements" ADD COLUMN     "allowedRadius" INTEGER NOT NULL DEFAULT 200,
ADD COLUMN     "companyLat" DOUBLE PRECISION,
ADD COLUMN     "companyLng" DOUBLE PRECISION,
ADD COLUMN     "workEndTime" TEXT NOT NULL DEFAULT '17:00',
ADD COLUMN     "workStartTime" TEXT NOT NULL DEFAULT '08:00';
