/*
  Warnings:

  - You are about to drop the column `profilePicture` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `profilePicture` on the `tutor_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "students" DROP COLUMN "profilePicture";

-- AlterTable
ALTER TABLE "tutor_profiles" DROP COLUMN "profilePicture";
