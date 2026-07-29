/*
  Warnings:

  - You are about to drop the column `saved_forLater` on the `assessment_career_recommendations` table. All the data in the column will be lost.
  - You are about to drop the column `saved_forLater` on the `assessment_formation_recommendations` table. All the data in the column will be lost.
  - You are about to drop the column `lastViewed_at` on the `assessment_results` table. All the data in the column will be lost.
  - You are about to drop the column `phase1_code` on the `assessment_results` table. All the data in the column will be lost.
  - You are about to drop the column `phase1_scores` on the `assessment_results` table. All the data in the column will be lost.
  - You are about to drop the column `phase2_code` on the `assessment_results` table. All the data in the column will be lost.
  - You are about to drop the column `phase2_scores` on the `assessment_results` table. All the data in the column will be lost.
  - You are about to drop the column `section_scores` on the `assessment_results` table. All the data in the column will be lost.
  - You are about to drop the column `view_sount` on the `assessment_results` table. All the data in the column will be lost.
  - You are about to drop the column `saved_forLater` on the `assessment_university_recommendations` table. All the data in the column will be lost.
  - You are about to drop the column `current_phase` on the `assessments` table. All the data in the column will be lost.
  - You are about to drop the column `current_section` on the `assessments` table. All the data in the column will be lost.
  - You are about to drop the column `current_stepIndex` on the `assessments` table. All the data in the column will be lost.
  - You are about to drop the column `lastActivity_at` on the `assessments` table. All the data in the column will be lost.
  - The `status` column on the `assessments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `phase_type` on the `batch_history` table. All the data in the column will be lost.
  - You are about to drop the column `phase_type` on the `intermediate_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `phase` on the `question_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `phase1_question_id` on the `question_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `phase2_question_id` on the `question_profiles` table. All the data in the column will be lost.
  - The primary key for the `tokens` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `aptitude_response_options` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `behavioral_indicators` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `career_translations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `formation_translations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `languages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `phase1_question_translations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `phase1_questions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `phase1_responses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `phase2_question_translations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `phase2_questions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `phase2_responses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `refresh_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `resource_translations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `university_translations` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[question_id,riasec_type]` on the table `question_profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,token_type]` on the table `tokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `last_activity_at` to the `assessments` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `assessments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `category` to the `question_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question_id` to the `question_profiles` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `token_type` on the `tokens` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TestType" AS ENUM ('GENERALE', 'OCCUPATIONS', 'APTITUDES', 'PERSONALITY', 'FULL');

-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('REFRESH', 'EMAIL_VERIFY', 'PASSWORD_RESET', 'MFA');

-- DropForeignKey
ALTER TABLE "behavioral_indicators" DROP CONSTRAINT "behavioral_indicators_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "career_translations" DROP CONSTRAINT "career_translations_career_id_fkey";

-- DropForeignKey
ALTER TABLE "career_translations" DROP CONSTRAINT "career_translations_language_id_fkey";

-- DropForeignKey
ALTER TABLE "formation_translations" DROP CONSTRAINT "formation_translations_formation_id_fkey";

-- DropForeignKey
ALTER TABLE "formation_translations" DROP CONSTRAINT "formation_translations_language_id_fkey";

-- DropForeignKey
ALTER TABLE "phase1_question_translations" DROP CONSTRAINT "phase1_question_translations_language_id_fkey";

-- DropForeignKey
ALTER TABLE "phase1_question_translations" DROP CONSTRAINT "phase1_question_translations_question_id_fkey";

-- DropForeignKey
ALTER TABLE "phase1_questions" DROP CONSTRAINT "phase1_questions_riasec_type_id_fkey";

-- DropForeignKey
ALTER TABLE "phase1_questions" DROP CONSTRAINT "phase1_questions_test_version_id_fkey";

-- DropForeignKey
ALTER TABLE "phase1_responses" DROP CONSTRAINT "phase1_responses_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "phase1_responses" DROP CONSTRAINT "phase1_responses_question_id_fkey";

-- DropForeignKey
ALTER TABLE "phase2_question_translations" DROP CONSTRAINT "phase2_question_translations_language_id_fkey";

-- DropForeignKey
ALTER TABLE "phase2_question_translations" DROP CONSTRAINT "phase2_question_translations_question_id_fkey";

-- DropForeignKey
ALTER TABLE "phase2_questions" DROP CONSTRAINT "phase2_questions_riasec_type_id_fkey";

-- DropForeignKey
ALTER TABLE "phase2_questions" DROP CONSTRAINT "phase2_questions_test_version_id_fkey";

-- DropForeignKey
ALTER TABLE "phase2_responses" DROP CONSTRAINT "phase2_responses_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "phase2_responses" DROP CONSTRAINT "phase2_responses_question_id_fkey";

-- DropForeignKey
ALTER TABLE "question_profiles" DROP CONSTRAINT "question_profiles_phase1_question_id_fkey";

-- DropForeignKey
ALTER TABLE "question_profiles" DROP CONSTRAINT "question_profiles_phase2_question_id_fkey";

-- DropForeignKey
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_user_id_fkey";

-- DropForeignKey
ALTER TABLE "resource_translations" DROP CONSTRAINT "resource_translations_language_id_fkey";

-- DropForeignKey
ALTER TABLE "resource_translations" DROP CONSTRAINT "resource_translations_resource_id_fkey";

-- DropForeignKey
ALTER TABLE "university_translations" DROP CONSTRAINT "university_translations_language_id_fkey";

-- DropForeignKey
ALTER TABLE "university_translations" DROP CONSTRAINT "university_translations_university_id_fkey";

-- DropIndex
DROP INDEX "assessment_results_phase2_code_idx";

-- DropIndex
DROP INDEX "question_profiles_phase1_question_id_idx";

-- DropIndex
DROP INDEX "question_profiles_phase1_question_id_phase_riasec_type_key";

-- DropIndex
DROP INDEX "question_profiles_phase2_question_id_idx";

-- DropIndex
DROP INDEX "question_profiles_phase2_question_id_phase_riasec_type_key";

-- DropIndex
DROP INDEX "question_profiles_phase_idx";

-- AlterTable
ALTER TABLE "assessment_career_recommendations" DROP COLUMN "saved_forLater",
ADD COLUMN     "saved_for_later" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "assessment_formation_recommendations" DROP COLUMN "saved_forLater",
ADD COLUMN     "saved_for_later" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "assessment_results" DROP COLUMN "lastViewed_at",
DROP COLUMN "phase1_code",
DROP COLUMN "phase1_scores",
DROP COLUMN "phase2_code",
DROP COLUMN "phase2_scores",
DROP COLUMN "section_scores",
DROP COLUMN "view_sount",
ADD COLUMN     "last_viewed_at" TIMESTAMP(3),
ADD COLUMN     "riasec_code" CHAR(3),
ADD COLUMN     "scores_by_category" JSONB,
ADD COLUMN     "view_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "assessment_university_recommendations" DROP COLUMN "saved_forLater",
ADD COLUMN     "saved_for_later" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "assessments" DROP COLUMN "current_phase",
DROP COLUMN "current_section",
DROP COLUMN "current_stepIndex",
DROP COLUMN "lastActivity_at",
ADD COLUMN     "current_category" "TestType",
ADD COLUMN     "current_step_index" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_activity_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "TestType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "TestStatus" NOT NULL DEFAULT 'IN_PROGRESS';

-- AlterTable
ALTER TABLE "batch_history" DROP COLUMN "phase_type";

-- AlterTable
ALTER TABLE "intermediate_profiles" DROP COLUMN "phase_type";

-- AlterTable
ALTER TABLE "question_profiles" DROP COLUMN "phase",
DROP COLUMN "phase1_question_id",
DROP COLUMN "phase2_question_id",
ADD COLUMN     "category" "TestType" NOT NULL,
ADD COLUMN     "question_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "tokens" DROP CONSTRAINT "tokens_pkey",
ADD COLUMN     "invalidated_at" TIMESTAMP(3),
ADD COLUMN     "ip_address" VARCHAR(45),
ADD COLUMN     "used_at" TIMESTAMP(3),
ADD COLUMN     "user_agent" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "token_type",
ADD COLUMN     "token_type" "TokenType" NOT NULL,
ADD CONSTRAINT "tokens_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "tokens_id_seq";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "total_xp" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "aptitude_response_options";

-- DropTable
DROP TABLE "behavioral_indicators";

-- DropTable
DROP TABLE "career_translations";

-- DropTable
DROP TABLE "formation_translations";

-- DropTable
DROP TABLE "languages";

-- DropTable
DROP TABLE "phase1_question_translations";

-- DropTable
DROP TABLE "phase1_questions";

-- DropTable
DROP TABLE "phase1_responses";

-- DropTable
DROP TABLE "phase2_question_translations";

-- DropTable
DROP TABLE "phase2_questions";

-- DropTable
DROP TABLE "phase2_responses";

-- DropTable
DROP TABLE "refresh_tokens";

-- DropTable
DROP TABLE "resource_translations";

-- DropTable
DROP TABLE "university_translations";

-- DropEnum
DROP TYPE "AssessmentStatus";

-- DropEnum
DROP TYPE "AssessmentType";

-- DropEnum
DROP TYPE "Label";

-- DropEnum
DROP TYPE "Phase2Type";

-- DropEnum
DROP TYPE "PhaseType";

-- CreateTable
CREATE TABLE "questions" (
    "id" SERIAL NOT NULL,
    "riasec_type_id" "RiasecType" NOT NULL,
    "test_version_id" INTEGER NOT NULL,
    "category" "TestType" NOT NULL,
    "question_text" TEXT NOT NULL,
    "subtitle" TEXT,
    "media_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "min_value" INTEGER DEFAULT 1,
    "max_value" INTEGER DEFAULT 3,
    "value_labels" JSONB,
    "points_value" INTEGER NOT NULL DEFAULT 15,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "responses" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "question_id" INTEGER NOT NULL,
    "response_value" INTEGER NOT NULL,
    "response_time_ms" INTEGER,
    "time_taken_ms" INTEGER,
    "change_count" INTEGER NOT NULL DEFAULT 0,
    "behavioral_flags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "questions_riasec_type_id_idx" ON "questions"("riasec_type_id");

-- CreateIndex
CREATE INDEX "questions_test_version_id_idx" ON "questions"("test_version_id");

-- CreateIndex
CREATE INDEX "questions_category_idx" ON "questions"("category");

-- CreateIndex
CREATE UNIQUE INDEX "questions_test_version_id_category_display_order_key" ON "questions"("test_version_id", "category", "display_order");

-- CreateIndex
CREATE INDEX "responses_assessment_id_idx" ON "responses"("assessment_id");

-- CreateIndex
CREATE INDEX "responses_question_id_idx" ON "responses"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "responses_assessment_id_question_id_key" ON "responses"("assessment_id", "question_id");

-- CreateIndex
CREATE INDEX "assessment_results_riasec_code_idx" ON "assessment_results"("riasec_code");

-- CreateIndex
CREATE INDEX "assessments_type_idx" ON "assessments"("type");

-- CreateIndex
CREATE INDEX "assessments_status_idx" ON "assessments"("status");

-- CreateIndex
CREATE INDEX "question_profiles_question_id_idx" ON "question_profiles"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "question_profiles_question_id_riasec_type_key" ON "question_profiles"("question_id", "riasec_type");

-- CreateIndex
CREATE INDEX "tokens_token_hash_token_type_idx" ON "tokens"("token_hash", "token_type");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_user_id_token_type_key" ON "tokens"("user_id", "token_type");

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_riasec_type_id_fkey" FOREIGN KEY ("riasec_type_id") REFERENCES "riasec_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_test_version_id_fkey" FOREIGN KEY ("test_version_id") REFERENCES "test_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responses" ADD CONSTRAINT "responses_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responses" ADD CONSTRAINT "responses_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_profiles" ADD CONSTRAINT "question_profiles_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
