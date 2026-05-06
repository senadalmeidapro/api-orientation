/*
  Warnings:

  - You are about to drop the `link_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `links` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "links" DROP CONSTRAINT "links_category_id_fkey";

-- DropTable
DROP TABLE "link_categories";

-- DropTable
DROP TABLE "links";

-- CreateTable
CREATE TABLE "universities" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "location" TEXT,
    "cover_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "university_media" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER NOT NULL,
    "media_url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "university_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "university_translations" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "university_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formations" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" TEXT,
    "degree" TEXT,
    "field" TEXT,
    "university_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formation_translations" (
    "id" SERIAL NOT NULL,
    "formation_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formation_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholarships" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "amount" TEXT,
    "benefits" TEXT[],
    "conditions" TEXT[],
    "level" TEXT NOT NULL,
    "field" TEXT,
    "country" TEXT,
    "application_url" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scholarships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "university_scholarships" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER NOT NULL,
    "scholarship_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "university_scholarships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholarship_translations" (
    "id" SERIAL NOT NULL,
    "scholarship_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scholarship_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "universities_title_key" ON "universities"("title");

-- CreateIndex
CREATE INDEX "universities_is_active_idx" ON "universities"("is_active");

-- CreateIndex
CREATE INDEX "university_media_university_id_idx" ON "university_media"("university_id");

-- CreateIndex
CREATE INDEX "university_translations_language_id_idx" ON "university_translations"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "university_translations_university_id_language_id_key" ON "university_translations"("university_id", "language_id");

-- CreateIndex
CREATE INDEX "formations_university_id_idx" ON "formations"("university_id");

-- CreateIndex
CREATE INDEX "formations_is_active_idx" ON "formations"("is_active");

-- CreateIndex
CREATE INDEX "formation_translations_language_id_idx" ON "formation_translations"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "formation_translations_formation_id_language_id_key" ON "formation_translations"("formation_id", "language_id");

-- CreateIndex
CREATE INDEX "scholarships_level_idx" ON "scholarships"("level");

-- CreateIndex
CREATE INDEX "scholarships_field_idx" ON "scholarships"("field");

-- CreateIndex
CREATE INDEX "scholarships_country_idx" ON "scholarships"("country");

-- CreateIndex
CREATE INDEX "scholarships_is_active_idx" ON "scholarships"("is_active");

-- CreateIndex
CREATE INDEX "university_scholarships_scholarship_id_idx" ON "university_scholarships"("scholarship_id");

-- CreateIndex
CREATE UNIQUE INDEX "university_scholarships_university_id_scholarship_id_key" ON "university_scholarships"("university_id", "scholarship_id");

-- CreateIndex
CREATE INDEX "scholarship_translations_language_id_idx" ON "scholarship_translations"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "scholarship_translations_scholarship_id_language_id_key" ON "scholarship_translations"("scholarship_id", "language_id");

-- AddForeignKey
ALTER TABLE "university_media" ADD CONSTRAINT "university_media_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "university_translations" ADD CONSTRAINT "university_translations_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "university_translations" ADD CONSTRAINT "university_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formations" ADD CONSTRAINT "formations_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formation_translations" ADD CONSTRAINT "formation_translations_formation_id_fkey" FOREIGN KEY ("formation_id") REFERENCES "formations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formation_translations" ADD CONSTRAINT "formation_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "university_scholarships" ADD CONSTRAINT "university_scholarships_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "university_scholarships" ADD CONSTRAINT "university_scholarships_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "scholarships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scholarship_translations" ADD CONSTRAINT "scholarship_translations_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "scholarships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scholarship_translations" ADD CONSTRAINT "scholarship_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
