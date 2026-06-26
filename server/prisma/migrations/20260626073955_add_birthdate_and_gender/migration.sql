/*
  Warnings:

  - Added the required column `birthDate` to the `StudentProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `StudentProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birthDate` to the `TeacherProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `TeacherProfile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "birthDate" DATE NOT NULL,
ADD COLUMN     "gender" "Gender" NOT NULL;

-- AlterTable
ALTER TABLE "TeacherProfile" ADD COLUMN     "birthDate" DATE NOT NULL,
ADD COLUMN     "gender" "Gender" NOT NULL;
