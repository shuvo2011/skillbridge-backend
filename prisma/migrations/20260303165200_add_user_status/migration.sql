/*
  Warnings:

  - You are about to drop the column `status` on the `tutor_profiles` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'DEACTIVATE');

-- AlterTable
ALTER TABLE "tutor_profiles" DROP COLUMN "status";

-- DropEnum
DROP TYPE "TutorStatus";
