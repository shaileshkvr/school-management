/*
  Warnings:

  - Added the required column `group` to the `TeacherProfile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TeacherGroup" AS ENUM ('PRIMARY', 'SECONDARY', 'SENIOR_SECONDARY');

-- AlterEnum
ALTER TYPE "FeeStatus" ADD VALUE 'PARTIAL';

-- AlterTable
ALTER TABLE "TeacherProfile" ADD COLUMN     "group" "TeacherGroup" NOT NULL,
ALTER COLUMN "specialization" SET DEFAULT 'None';
