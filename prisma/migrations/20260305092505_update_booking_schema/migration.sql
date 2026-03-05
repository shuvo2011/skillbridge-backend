/*
  Warnings:

  - The values [PENDING] on the enum `BookingStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `categoryId` on the `bookings` table. All the data in the column will be lost.
  - Added the required column `availabilityId` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slotFrom` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slotTo` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BookingStatus_new" AS ENUM ('CONFIRMED', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."bookings" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "bookings" ALTER COLUMN "status" TYPE "BookingStatus_new" USING ("status"::text::"BookingStatus_new");
ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "public"."BookingStatus_old";
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'CONFIRMED';
COMMIT;

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "categoryId",
ADD COLUMN     "availabilityId" TEXT NOT NULL,
ADD COLUMN     "slotFrom" TEXT NOT NULL,
ADD COLUMN     "slotTo" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'CONFIRMED';

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "tutor_availability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
