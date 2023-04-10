-- AlterTable
ALTER TABLE "EmaIncompleteAlert" ADD COLUMN     "seen" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TimelineAlert" ADD COLUMN     "seen" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "WatchBatteryAlert" ADD COLUMN     "seen" BOOLEAN NOT NULL DEFAULT false;
