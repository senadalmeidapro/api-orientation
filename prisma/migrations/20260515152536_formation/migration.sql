/*
  Warnings:

  - The `programs` column on the `formations` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "formations" ADD COLUMN     "link" TEXT,
DROP COLUMN "programs",
ADD COLUMN     "programs" TEXT[];
