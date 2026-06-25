/*
  Warnings:

  - You are about to drop the column `specialization` on the `TeacherProfile` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Specialization" AS ENUM ('ART', 'MUSIC', 'SPORTS', 'COMPUTER_SCIENCE');

-- AlterEnum
ALTER TYPE "TeacherGroup" ADD VALUE 'SPECIAL';

-- AlterTable
ALTER TABLE "TeacherProfile" DROP COLUMN "specialization";
