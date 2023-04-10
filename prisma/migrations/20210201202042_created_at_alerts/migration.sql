/*
  Warnings:

  - You are about to drop the column `date` on the `EmaIncompleteAlert` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `TimelineAlert` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EmaIncompleteAlert" DROP COLUMN "date",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "TimelineAlert" DROP COLUMN "date",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
