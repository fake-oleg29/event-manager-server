/*
  Warnings:

  - Made the column `endDate` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `organizerId` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `venueId` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_organizerId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_venueId_fkey";

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "endDate" SET NOT NULL,
ALTER COLUMN "organizerId" SET NOT NULL,
ALTER COLUMN "venueId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
