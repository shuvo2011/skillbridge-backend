-- AlterTable
ALTER TABLE "user" ADD COLUMN     "banExpires" TIMESTAMP(3),
ADD COLUMN     "banReason" TEXT DEFAULT 'Violated terms of service',
ADD COLUMN     "banned" BOOLEAN DEFAULT false;
