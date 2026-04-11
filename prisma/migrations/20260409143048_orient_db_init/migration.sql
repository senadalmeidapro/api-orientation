-- CreateEnum
CREATE TYPE "RiasecType" AS ENUM ('R', 'I', 'A', 'S', 'E', 'C');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('PHASE1', 'PHASE2_OCCUPATIONS', 'PHASE2_APTITUDES', 'PHASE2_PERSONALITY', 'FULL');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "PhaseType" AS ENUM ('PHASE1', 'PHASE2');

-- CreateEnum
CREATE TYPE "Phase2Type" AS ENUM ('OCCUPATIONS', 'APTITUDES', 'PERSONALITY');

-- CreateEnum
CREATE TYPE "BadgeRarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "ProfileStrength" AS ENUM ('TRES_FAIBLE', 'FAIBLE', 'MOYEN', 'FORT', 'TRES_FORT', 'EXCEPTIONNEL');

-- CreateEnum
CREATE TYPE "ConsistencyLevel" AS ENUM ('FAIBLE', 'MOYENNE', 'FORTE');

-- CreateEnum
CREATE TYPE "Label" AS ENUM ('Faible', 'Moyen', 'Fort');

-- CreateEnum
CREATE TYPE "CareerCategory" AS ENUM ('NUMERIQUE', 'AGRICULTURE', 'ARTISANAT', 'SANTE', 'EDUCATION', 'COMMERCE', 'ADMINISTRATION');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('LIKE', 'DISLIKE', 'CLICK', 'VIEW', 'SKIP');

-- CreateEnum
CREATE TYPE "InteractionEventType" AS ENUM ('ANSWER', 'CLICK', 'VIEW', 'SKIP');

-- CreateEnum
CREATE TYPE "InteractionEntityType" AS ENUM ('QUESTION', 'CAREER', 'RECOMMENDATION');

-- CreateEnum
CREATE TYPE "OutcomeStatus" AS ENUM ('STUDENT', 'INTERNSHIP', 'EMPLOYED', 'DROPOUT');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'AGENT', 'USER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('EMAIL', 'GOOGLE', 'FACEBOOK');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "display_name" VARCHAR(150),
    "bio" TEXT,
    "password" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "email_verified_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "role_assigned_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "provider_account_id" VARCHAR(255) NOT NULL,
    "provider_email" VARCHAR(255) NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "access_token_expires" TIMESTAMP(3),
    "refresh_token_expires" TIMESTAMP(3),
    "scope" VARCHAR(500),
    "id_token" TEXT,
    "session_state" VARCHAR(500),
    "provider_metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_used_at" TIMESTAMP(3),

    CONSTRAINT "auth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "token_type" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "invalidated_at" TIMESTAMP(3),
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "token_type" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_versions" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "native_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "session_token" TEXT NOT NULL,
    "session_hash" TEXT NOT NULL,
    "share_token" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "total_xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "test_version_id" INTEGER NOT NULL,
    "type" "AssessmentType" NOT NULL,
    "depth" INTEGER NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "current_phase" "PhaseType" NOT NULL DEFAULT 'PHASE1',
    "current_section" "Phase2Type",
    "current_stepIndex" INTEGER NOT NULL DEFAULT 0,
    "batch_size" INTEGER NOT NULL DEFAULT 5,
    "current_batch" INTEGER NOT NULL DEFAULT 0,
    "adaptive_state" JSONB,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivity_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "completion_percentage" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "riasec_types" (
    "id" "RiasecType" NOT NULL,
    "name" TEXT NOT NULL,
    "slogan" TEXT,
    "description" TEXT,
    "color_hex" TEXT,
    "icon_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "riasec_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase1_questions" (
    "id" SERIAL NOT NULL,
    "riasec_type_id" "RiasecType" NOT NULL,
    "test_version_id" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_short" TEXT,
    "illustration_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "pointsValue" INTEGER NOT NULL DEFAULT 10,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase1_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase2_questions" (
    "id" SERIAL NOT NULL,
    "riasec_type_id" "RiasecType" NOT NULL,
    "test_version_id" INTEGER NOT NULL,
    "phase2_type" "Phase2Type" NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_subtext" TEXT,
    "media_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "min_value" INTEGER DEFAULT 1,
    "max_value" INTEGER DEFAULT 3,
    "value_labels" JSONB,
    "points_value" INTEGER NOT NULL DEFAULT 15,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase2_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase1_question_translations" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_short" TEXT,
    "audio_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase1_question_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase2_question_translations" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_subtext" TEXT,
    "audio_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase2_question_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aptitude_response_options" (
    "id" SERIAL NOT NULL,
    "value" INTEGER NOT NULL,
    "label" "Label" NOT NULL,
    "emoji" TEXT,
    "color_code" TEXT,

    CONSTRAINT "aptitude_response_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase1_responses" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "question_id" INTEGER NOT NULL,
    "response_value" INTEGER NOT NULL,
    "response_time_ms" INTEGER,
    "time_taken_ms" INTEGER,
    "change_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phase1_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase2_responses" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "question_id" INTEGER NOT NULL,
    "phase2_type" "Phase2Type" NOT NULL,
    "response_value" INTEGER NOT NULL,
    "response_time_ms" INTEGER,
    "time_taken_ms" INTEGER,
    "change_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phase2_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_profiles" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "phase" "PhaseType" NOT NULL,
    "riasec_type" "RiasecType" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_history" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "batch_index" INTEGER NOT NULL,
    "phase_type" "PhaseType" NOT NULL,
    "question_ids" INTEGER[],
    "presented_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "batch_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "behavioral_indicators" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "response_id" TEXT NOT NULL,
    "indicator_type" TEXT NOT NULL,
    "time_taken_ms" INTEGER,
    "change_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "behavioral_indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intermediate_profiles" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "batch_index" INTEGER NOT NULL,
    "phase_type" "PhaseType" NOT NULL,
    "profile_data" JSONB NOT NULL,
    "raw_scores" JSONB,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intermediate_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_results" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "phase1_code" CHAR(3),
    "phase2_code" CHAR(3),
    "subjective_ranking" JSONB,
    "phase1_scores" JSONB,
    "phase2_scores" JSONB,
    "section_scores" JSONB,
    "consistency_score" DOUBLE PRECISION,
    "consistency_level" "ConsistencyLevel",
    "differentiation_score" DOUBLE PRECISION,
    "profile_strength" "ProfileStrength",
    "insights" JSONB,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastViewed_at" TIMESTAMP(3),
    "view_sount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "assessment_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "careers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "summary" TEXT,
    "riasec_codes" "RiasecType"[],
    "local_demand" INTEGER,
    "formation_level" TEXT,
    "salary_range_min" INTEGER,
    "salary_range_max" INTEGER,
    "career_path" TEXT,
    "icon_url" TEXT,
    "image_url" TEXT,
    "video_url" TEXT,
    "category" "CareerCategory",
    "tags" TEXT[],
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "careers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_institutions" (
    "career_id" INTEGER NOT NULL,
    "institution_id" INTEGER NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_institutions_pkey" PRIMARY KEY ("career_id","institution_id")
);

-- CreateTable
CREATE TABLE "career_resources" (
    "career_id" INTEGER NOT NULL,
    "resource_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_resources_pkey" PRIMARY KEY ("career_id","resource_id")
);

-- CreateTable
CREATE TABLE "career_translations" (
    "id" SERIAL NOT NULL,
    "career_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT NOT NULL,
    "audioUrl" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_career_recommendations" (
    "id" TEXT NOT NULL,
    "result_id" TEXT NOT NULL,
    "career_id" INTEGER NOT NULL,
    "match_score" INTEGER NOT NULL,
    "rank_position" INTEGER NOT NULL,
    "viewed_at" TIMESTAMP(3),
    "saved_forLater" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_career_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon_url" TEXT,
    "emoji" TEXT,
    "rarity" "BadgeRarity" NOT NULL DEFAULT 'COMMON',
    "points_value" INTEGER NOT NULL DEFAULT 50,
    "unlock_condition" JSONB,
    "unlock_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_badges" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "badge_id" INTEGER NOT NULL,
    "unlocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shared_on_social" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "session_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_history" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT,
    "assessment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasure_maps" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "map_data" JSONB NOT NULL,
    "pdf_url" TEXT,
    "share_token" TEXT NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_viewed_at" TIMESTAMP(3),

    CONSTRAINT "treasure_maps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_feedbacks" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "recommendationId" TEXT,
    "type" "FeedbackType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "context" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_outcomes" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "career_id" INTEGER NOT NULL,
    "status" "OutcomeStatus" NOT NULL,
    "sector" TEXT NOT NULL,
    "salary_range" TEXT,
    "delay_to_outcome" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_interactions" (
    "id" BIGSERIAL NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "type" "InteractionEventType" NOT NULL,
    "entity_type" "InteractionEntityType" NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "value" DOUBLE PRECISION,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "media_url" TEXT,
    "category" TEXT,
    "tags" TEXT[],
    "author" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_translations" (
    "id" SERIAL NOT NULL,
    "resource_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "audio_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "link_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "links" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "note" TEXT,

    CONSTRAINT "links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_institutions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT,
    "description" TEXT,
    "type" TEXT,
    "department" TEXT,
    "city" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "programs" JSONB,
    "logo_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_paths" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "level" TEXT,
    "duration_months" INTEGER,
    "cost_min" INTEGER,
    "cost_max" INTEGER,
    "career_id" INTEGER,
    "institution_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_institution_translations" (
    "id" SERIAL NOT NULL,
    "institution_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_institution_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "auth_accounts_user_id_idx" ON "auth_accounts"("user_id");

-- CreateIndex
CREATE INDEX "auth_accounts_provider_idx" ON "auth_accounts"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "auth_accounts_provider_provider_account_id_key" ON "auth_accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_accounts_user_id_provider_key" ON "auth_accounts"("user_id", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_user_id_key" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_hash_token_type_idx" ON "refresh_tokens"("token_hash", "token_type");

-- CreateIndex
CREATE INDEX "tokens_token_hash_idx" ON "tokens"("token_hash");

-- CreateIndex
CREATE INDEX "tokens_expires_at_idx" ON "tokens"("expires_at");

-- CreateIndex
CREATE INDEX "tokens_token_hash_token_type_idx" ON "tokens"("token_hash", "token_type");

-- CreateIndex
CREATE UNIQUE INDEX "test_versions_code_key" ON "test_versions"("code");

-- CreateIndex
CREATE INDEX "test_versions_is_active_idx" ON "test_versions"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "languages_code_key" ON "languages"("code");

-- CreateIndex
CREATE INDEX "languages_is_active_idx" ON "languages"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "auth_sessions_session_token_key" ON "auth_sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "auth_sessions_share_token_key" ON "auth_sessions"("share_token");

-- CreateIndex
CREATE INDEX "auth_sessions_session_token_idx" ON "auth_sessions"("session_token");

-- CreateIndex
CREATE INDEX "auth_sessions_share_token_idx" ON "auth_sessions"("share_token");

-- CreateIndex
CREATE INDEX "auth_sessions_user_id_idx" ON "auth_sessions"("user_id");

-- CreateIndex
CREATE INDEX "assessments_session_id_idx" ON "assessments"("session_id");

-- CreateIndex
CREATE INDEX "assessments_test_version_id_idx" ON "assessments"("test_version_id");

-- CreateIndex
CREATE INDEX "assessments_type_idx" ON "assessments"("type");

-- CreateIndex
CREATE INDEX "assessments_status_idx" ON "assessments"("status");

-- CreateIndex
CREATE INDEX "assessments_started_at_idx" ON "assessments"("started_at");

-- CreateIndex
CREATE INDEX "phase1_questions_riasec_type_id_idx" ON "phase1_questions"("riasec_type_id");

-- CreateIndex
CREATE INDEX "phase1_questions_test_version_id_idx" ON "phase1_questions"("test_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "phase1_questions_test_version_id_display_order_key" ON "phase1_questions"("test_version_id", "display_order");

-- CreateIndex
CREATE INDEX "phase2_questions_riasec_type_id_idx" ON "phase2_questions"("riasec_type_id");

-- CreateIndex
CREATE INDEX "phase2_questions_test_version_id_idx" ON "phase2_questions"("test_version_id");

-- CreateIndex
CREATE INDEX "phase2_questions_phase2_type_idx" ON "phase2_questions"("phase2_type");

-- CreateIndex
CREATE UNIQUE INDEX "phase2_questions_test_version_id_phase2_type_display_order_key" ON "phase2_questions"("test_version_id", "phase2_type", "display_order");

-- CreateIndex
CREATE INDEX "phase1_question_translations_language_id_idx" ON "phase1_question_translations"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "phase1_question_translations_question_id_language_id_key" ON "phase1_question_translations"("question_id", "language_id");

-- CreateIndex
CREATE INDEX "phase2_question_translations_language_id_idx" ON "phase2_question_translations"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "phase2_question_translations_question_id_language_id_key" ON "phase2_question_translations"("question_id", "language_id");

-- CreateIndex
CREATE UNIQUE INDEX "aptitude_response_options_value_key" ON "aptitude_response_options"("value");

-- CreateIndex
CREATE INDEX "phase1_responses_assessment_id_idx" ON "phase1_responses"("assessment_id");

-- CreateIndex
CREATE INDEX "phase1_responses_question_id_idx" ON "phase1_responses"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "phase1_responses_assessment_id_question_id_key" ON "phase1_responses"("assessment_id", "question_id");

-- CreateIndex
CREATE INDEX "phase2_responses_assessment_id_idx" ON "phase2_responses"("assessment_id");

-- CreateIndex
CREATE INDEX "phase2_responses_question_id_idx" ON "phase2_responses"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "phase2_responses_assessment_id_question_id_key" ON "phase2_responses"("assessment_id", "question_id");

-- CreateIndex
CREATE INDEX "question_profiles_question_id_idx" ON "question_profiles"("question_id");

-- CreateIndex
CREATE INDEX "question_profiles_phase_idx" ON "question_profiles"("phase");

-- CreateIndex
CREATE INDEX "question_profiles_riasec_type_idx" ON "question_profiles"("riasec_type");

-- CreateIndex
CREATE UNIQUE INDEX "question_profiles_question_id_phase_riasec_type_key" ON "question_profiles"("question_id", "phase", "riasec_type");

-- CreateIndex
CREATE INDEX "batch_history_assessment_id_idx" ON "batch_history"("assessment_id");

-- CreateIndex
CREATE INDEX "batch_history_batch_index_idx" ON "batch_history"("batch_index");

-- CreateIndex
CREATE UNIQUE INDEX "batch_history_assessment_id_batch_index_key" ON "batch_history"("assessment_id", "batch_index");

-- CreateIndex
CREATE INDEX "behavioral_indicators_assessment_id_idx" ON "behavioral_indicators"("assessment_id");

-- CreateIndex
CREATE INDEX "behavioral_indicators_indicator_type_idx" ON "behavioral_indicators"("indicator_type");

-- CreateIndex
CREATE INDEX "behavioral_indicators_detected_at_idx" ON "behavioral_indicators"("detected_at");

-- CreateIndex
CREATE INDEX "intermediate_profiles_assessment_id_idx" ON "intermediate_profiles"("assessment_id");

-- CreateIndex
CREATE INDEX "intermediate_profiles_batch_index_idx" ON "intermediate_profiles"("batch_index");

-- CreateIndex
CREATE UNIQUE INDEX "intermediate_profiles_assessment_id_batch_index_key" ON "intermediate_profiles"("assessment_id", "batch_index");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_results_assessment_id_key" ON "assessment_results"("assessment_id");

-- CreateIndex
CREATE INDEX "assessment_results_assessment_id_idx" ON "assessment_results"("assessment_id");

-- CreateIndex
CREATE INDEX "assessment_results_phase2_code_idx" ON "assessment_results"("phase2_code");

-- CreateIndex
CREATE INDEX "assessment_results_consistency_level_idx" ON "assessment_results"("consistency_level");

-- CreateIndex
CREATE UNIQUE INDEX "careers_name_key" ON "careers"("name");

-- CreateIndex
CREATE INDEX "careers_category_idx" ON "careers"("category");

-- CreateIndex
CREATE INDEX "careers_is_featured_idx" ON "careers"("is_featured");

-- CreateIndex
CREATE INDEX "career_institutions_institution_id_idx" ON "career_institutions"("institution_id");

-- CreateIndex
CREATE INDEX "career_resources_resource_id_idx" ON "career_resources"("resource_id");

-- CreateIndex
CREATE INDEX "career_translations_language_id_idx" ON "career_translations"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "career_translations_career_id_language_id_key" ON "career_translations"("career_id", "language_id");

-- CreateIndex
CREATE INDEX "assessment_career_recommendations_result_id_idx" ON "assessment_career_recommendations"("result_id");

-- CreateIndex
CREATE INDEX "assessment_career_recommendations_career_id_idx" ON "assessment_career_recommendations"("career_id");

-- CreateIndex
CREATE INDEX "assessment_career_recommendations_match_score_idx" ON "assessment_career_recommendations"("match_score");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_career_recommendations_result_id_career_id_key" ON "assessment_career_recommendations"("result_id", "career_id");

-- CreateIndex
CREATE UNIQUE INDEX "badges_code_key" ON "badges"("code");

-- CreateIndex
CREATE INDEX "badges_rarity_idx" ON "badges"("rarity");

-- CreateIndex
CREATE INDEX "session_badges_session_id_idx" ON "session_badges"("session_id");

-- CreateIndex
CREATE INDEX "session_badges_badge_id_idx" ON "session_badges"("badge_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_badges_session_id_badge_id_key" ON "session_badges"("session_id", "badge_id");

-- CreateIndex
CREATE INDEX "xp_history_session_id_idx" ON "xp_history"("session_id");

-- CreateIndex
CREATE INDEX "xp_history_created_at_idx" ON "xp_history"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "treasure_maps_assessment_id_key" ON "treasure_maps"("assessment_id");

-- CreateIndex
CREATE UNIQUE INDEX "treasure_maps_share_token_key" ON "treasure_maps"("share_token");

-- CreateIndex
CREATE INDEX "treasure_maps_share_token_idx" ON "treasure_maps"("share_token");

-- CreateIndex
CREATE INDEX "assessment_feedbacks_assessment_id_idx" ON "assessment_feedbacks"("assessment_id");

-- CreateIndex
CREATE INDEX "assessment_feedbacks_recommendationId_idx" ON "assessment_feedbacks"("recommendationId");

-- CreateIndex
CREATE INDEX "assessment_feedbacks_type_idx" ON "assessment_feedbacks"("type");

-- CreateIndex
CREATE INDEX "assessment_outcomes_assessment_id_idx" ON "assessment_outcomes"("assessment_id");

-- CreateIndex
CREATE INDEX "assessment_outcomes_career_id_idx" ON "assessment_outcomes"("career_id");

-- CreateIndex
CREATE INDEX "assessment_outcomes_status_idx" ON "assessment_outcomes"("status");

-- CreateIndex
CREATE INDEX "assessment_interactions_assessment_id_idx" ON "assessment_interactions"("assessment_id");

-- CreateIndex
CREATE INDEX "assessment_interactions_type_idx" ON "assessment_interactions"("type");

-- CreateIndex
CREATE INDEX "assessment_interactions_entity_type_idx" ON "assessment_interactions"("entity_type");

-- CreateIndex
CREATE INDEX "assessment_interactions_created_at_idx" ON "assessment_interactions"("created_at");

-- CreateIndex
CREATE INDEX "resources_category_idx" ON "resources"("category");

-- CreateIndex
CREATE INDEX "resources_is_published_idx" ON "resources"("is_published");

-- CreateIndex
CREATE INDEX "resource_translations_language_id_idx" ON "resource_translations"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "resource_translations_resource_id_language_id_key" ON "resource_translations"("resource_id", "language_id");

-- CreateIndex
CREATE UNIQUE INDEX "link_categories_name_key" ON "link_categories"("name");

-- CreateIndex
CREATE INDEX "links_category_id_idx" ON "links"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "links_category_id_title_key" ON "links"("category_id", "title");

-- CreateIndex
CREATE INDEX "training_institutions_department_idx" ON "training_institutions"("department");

-- CreateIndex
CREATE INDEX "training_institutions_city_idx" ON "training_institutions"("city");

-- CreateIndex
CREATE INDEX "training_paths_career_id_idx" ON "training_paths"("career_id");

-- CreateIndex
CREATE INDEX "training_paths_institution_id_idx" ON "training_paths"("institution_id");

-- CreateIndex
CREATE INDEX "training_paths_is_active_idx" ON "training_paths"("is_active");

-- CreateIndex
CREATE INDEX "training_institution_translations_language_id_idx" ON "training_institution_translations"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "training_institution_translations_institution_id_language_i_key" ON "training_institution_translations"("institution_id", "language_id");

-- AddForeignKey
ALTER TABLE "auth_accounts" ADD CONSTRAINT "auth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_test_version_id_fkey" FOREIGN KEY ("test_version_id") REFERENCES "test_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase1_questions" ADD CONSTRAINT "phase1_questions_riasec_type_id_fkey" FOREIGN KEY ("riasec_type_id") REFERENCES "riasec_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase1_questions" ADD CONSTRAINT "phase1_questions_test_version_id_fkey" FOREIGN KEY ("test_version_id") REFERENCES "test_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase2_questions" ADD CONSTRAINT "phase2_questions_riasec_type_id_fkey" FOREIGN KEY ("riasec_type_id") REFERENCES "riasec_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase2_questions" ADD CONSTRAINT "phase2_questions_test_version_id_fkey" FOREIGN KEY ("test_version_id") REFERENCES "test_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase1_question_translations" ADD CONSTRAINT "phase1_question_translations_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "phase1_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase1_question_translations" ADD CONSTRAINT "phase1_question_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase2_question_translations" ADD CONSTRAINT "phase2_question_translations_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "phase2_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase2_question_translations" ADD CONSTRAINT "phase2_question_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase1_responses" ADD CONSTRAINT "phase1_responses_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase1_responses" ADD CONSTRAINT "phase1_responses_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "phase1_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase2_responses" ADD CONSTRAINT "phase2_responses_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase2_responses" ADD CONSTRAINT "phase2_responses_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "phase2_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_profiles" ADD CONSTRAINT "fk_question_profile_phase1" FOREIGN KEY ("question_id") REFERENCES "phase1_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_profiles" ADD CONSTRAINT "fk_question_profile_phase2" FOREIGN KEY ("question_id") REFERENCES "phase2_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_history" ADD CONSTRAINT "batch_history_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_indicators" ADD CONSTRAINT "behavioral_indicators_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intermediate_profiles" ADD CONSTRAINT "intermediate_profiles_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_institutions" ADD CONSTRAINT "career_institutions_career_id_fkey" FOREIGN KEY ("career_id") REFERENCES "careers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_institutions" ADD CONSTRAINT "career_institutions_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "training_institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_resources" ADD CONSTRAINT "career_resources_career_id_fkey" FOREIGN KEY ("career_id") REFERENCES "careers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_resources" ADD CONSTRAINT "career_resources_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_translations" ADD CONSTRAINT "career_translations_career_id_fkey" FOREIGN KEY ("career_id") REFERENCES "careers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_translations" ADD CONSTRAINT "career_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_career_recommendations" ADD CONSTRAINT "assessment_career_recommendations_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "assessment_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_career_recommendations" ADD CONSTRAINT "assessment_career_recommendations_career_id_fkey" FOREIGN KEY ("career_id") REFERENCES "careers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_badges" ADD CONSTRAINT "session_badges_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_badges" ADD CONSTRAINT "session_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_history" ADD CONSTRAINT "xp_history_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_history" ADD CONSTRAINT "xp_history_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasure_maps" ADD CONSTRAINT "treasure_maps_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_feedbacks" ADD CONSTRAINT "assessment_feedbacks_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_feedbacks" ADD CONSTRAINT "assessment_feedbacks_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "assessment_career_recommendations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_outcomes" ADD CONSTRAINT "assessment_outcomes_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_outcomes" ADD CONSTRAINT "assessment_outcomes_career_id_fkey" FOREIGN KEY ("career_id") REFERENCES "careers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_interactions" ADD CONSTRAINT "assessment_interactions_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_translations" ADD CONSTRAINT "resource_translations_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_translations" ADD CONSTRAINT "resource_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "links" ADD CONSTRAINT "links_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "link_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_paths" ADD CONSTRAINT "training_paths_career_id_fkey" FOREIGN KEY ("career_id") REFERENCES "careers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_paths" ADD CONSTRAINT "training_paths_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "training_institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_institution_translations" ADD CONSTRAINT "training_institution_translations_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "training_institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_institution_translations" ADD CONSTRAINT "training_institution_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
