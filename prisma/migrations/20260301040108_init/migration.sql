-- CreateEnum
CREATE TYPE "CategoriesStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "Categories" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "CategoriesStatus" NOT NULL DEFAULT 'PUBLISHED',

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);
