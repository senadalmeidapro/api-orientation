/*
  Warnings:

  - You are about to drop the column `location` on the `universities` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `universities` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `universities` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `universities` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[acronym]` on the table `universities` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `universities` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `universities` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `universities` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "universities_title_key";

-- AlterTable
ALTER TABLE "universities" DROP COLUMN "location",
DROP COLUMN "title",
DROP COLUMN "url",
ADD COLUMN     "acronym" TEXT,
ADD COLUMN     "address" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "formation_urls" TEXT[],
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "universities_name_key" ON "universities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "universities_acronym_key" ON "universities"("acronym");

-- CreateIndex
CREATE UNIQUE INDEX "universities_phone_key" ON "universities"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "universities_email_key" ON "universities"("email");
