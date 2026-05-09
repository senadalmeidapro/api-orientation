/*
  Warnings:

  - You are about to drop the `career_f` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "career_f" DROP CONSTRAINT "career_f_career_id_fkey";

-- DropForeignKey
ALTER TABLE "career_f" DROP CONSTRAINT "career_f_formation_id_fkey";

-- DropTable
DROP TABLE "career_f";

-- CreateTable
CREATE TABLE "career_formation" (
    "career_id" INTEGER NOT NULL,
    "formation_id" INTEGER NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_formation_pkey" PRIMARY KEY ("career_id","formation_id")
);

-- CreateIndex
CREATE INDEX "career_formation_formation_id_idx" ON "career_formation"("formation_id");

-- AddForeignKey
ALTER TABLE "career_formation" ADD CONSTRAINT "career_formation_career_id_fkey" FOREIGN KEY ("career_id") REFERENCES "careers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_formation" ADD CONSTRAINT "career_formation_formation_id_fkey" FOREIGN KEY ("formation_id") REFERENCES "formations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
