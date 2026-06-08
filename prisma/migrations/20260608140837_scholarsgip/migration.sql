/*
  Warnings:

  - You are about to drop the column `university_id` on the `scholarship_records` table. All the data in the column will be lost.
  - The primary key for the `university_scholarships` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `university_scholarships` table. All the data in the column will be lost.
  - You are about to drop the `scholarship_translations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `scholarships` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "scholarship_records" DROP CONSTRAINT "scholarship_records_university_id_fkey";

-- DropForeignKey
ALTER TABLE "scholarship_translations" DROP CONSTRAINT "scholarship_translations_language_id_fkey";

-- DropForeignKey
ALTER TABLE "scholarship_translations" DROP CONSTRAINT "scholarship_translations_scholarship_id_fkey";

-- DropForeignKey
ALTER TABLE "university_scholarships" DROP CONSTRAINT "university_scholarships_scholarship_id_fkey";

-- DropIndex
DROP INDEX "scholarship_records_university_id_idx";

-- DropIndex
DROP INDEX "university_scholarships_university_id_scholarship_id_key";

-- AlterTable
ALTER TABLE "scholarship_records" DROP COLUMN "university_id";

-- AlterTable
ALTER TABLE "university_scholarships" DROP CONSTRAINT "university_scholarships_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "university_scholarships_pkey" PRIMARY KEY ("university_id", "scholarship_id");

-- DropTable
DROP TABLE "scholarship_translations";

-- DropTable
DROP TABLE "scholarships";

-- AddForeignKey
ALTER TABLE "university_scholarships" ADD CONSTRAINT "university_scholarships_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "scholarship_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
