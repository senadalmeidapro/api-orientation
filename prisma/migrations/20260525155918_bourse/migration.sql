-- CreateEnum
CREATE TYPE "ScholarshipRecordStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ScholarshipRecordFundingType" AS ENUM ('FULL', 'PARTIAL', 'TUITION_ONLY', 'LIVING_ONLY', 'TRANSPORT_ONLY', 'OTHER');

-- CreateEnum
CREATE TYPE "ScholarshipRecordApplicationMode" AS ENUM ('ONLINE', 'EMAIL', 'PHYSICAL', 'MIXED');

-- CreateTable
CREATE TABLE "scholarship_records" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "code" TEXT,
    "reference_code" TEXT,
    "level" TEXT,
    "field" TEXT,
    "country" TEXT,
    "city" TEXT,
    "status" "ScholarshipRecordStatus" NOT NULL DEFAULT 'PUBLISHED',
    "funding_type" "ScholarshipRecordFundingType",
    "application_mode" "ScholarshipRecordApplicationMode" NOT NULL DEFAULT 'ONLINE',
    "currency" VARCHAR(10),
    "amount_label" TEXT,
    "amount_min" INTEGER,
    "amount_max" INTEGER,
    "coverage_percent" DOUBLE PRECISION,
    "application_fee" INTEGER,
    "seats" INTEGER,
    "is_renewable" BOOLEAN,
    "renewable_duration_months" INTEGER,
    "interview_required" BOOLEAN DEFAULT false,
    "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "conditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "eligibility_criteria" JSONB,
    "required_documents" JSONB,
    "modalities" JSONB,
    "selection_process" JSONB,
    "contact_info" JSONB,
    "application_url" TEXT,
    "application_email" TEXT,
    "application_phone" TEXT,
    "application_instructions" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "application_open_at" TIMESTAMP(3),
    "application_close_at" TIMESTAMP(3),
    "result_date" TIMESTAMP(3),
    "university_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scholarship_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scholarship_records_code_key" ON "scholarship_records"("code");

-- CreateIndex
CREATE INDEX "scholarship_records_status_idx" ON "scholarship_records"("status");

-- CreateIndex
CREATE INDEX "scholarship_records_is_active_idx" ON "scholarship_records"("is_active");

-- CreateIndex
CREATE INDEX "scholarship_records_country_idx" ON "scholarship_records"("country");

-- CreateIndex
CREATE INDEX "scholarship_records_field_idx" ON "scholarship_records"("field");

-- CreateIndex
CREATE INDEX "scholarship_records_application_close_at_idx" ON "scholarship_records"("application_close_at");

-- CreateIndex
CREATE INDEX "scholarship_records_university_id_idx" ON "scholarship_records"("university_id");

-- AddForeignKey
ALTER TABLE "scholarship_records" ADD CONSTRAINT "scholarship_records_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
