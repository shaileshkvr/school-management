/*
  Warnings:

  - Added the required column `examName` to the `ExamScore` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExamScore" ADD COLUMN     "examName" TEXT NOT NULL;
