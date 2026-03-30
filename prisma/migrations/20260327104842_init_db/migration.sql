-- CreateEnum
CREATE TYPE "RiasecType" AS ENUM ('R', 'I', 'A', 'S', 'E', 'C');

-- CreateEnum
CREATE TYPE "PhaseType" AS ENUM ('PHASE_1', 'PHASE_2', 'PHASE_3');

-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('OCCUPATIONS', 'APTITUDES', 'PERSONALITY');

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

-- CreateTable
CREATE TABLE "test_versions" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nativeName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_sessions" (
    "id" TEXT NOT NULL,
    "testVersionId" INTEGER NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "shareToken" TEXT,
    "currentPhase" "PhaseType" NOT NULL DEFAULT 'PHASE_1',
    "currentStepIndex" INTEGER NOT NULL DEFAULT 0,
    "currentSection" "SectionType",
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "phase1CompletedAt" TIMESTAMP(3),
    "phase2CompletedAt" TIMESTAMP(3),
    "phase3CompletedAt" TIMESTAMP(3),
    "isAbandoned" BOOLEAN NOT NULL DEFAULT false,
    "completionPercentage" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "test_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "riasec_types" (
    "id" "RiasecType" NOT NULL,
    "name" TEXT NOT NULL,
    "slogan" TEXT,
    "description" TEXT,
    "colorHex" TEXT,
    "iconUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "riasec_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase1_questions" (
    "id" SERIAL NOT NULL,
    "riasecTypeId" "RiasecType" NOT NULL,
    "testVersionId" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionShort" TEXT,
    "illustrationUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "pointsValue" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase1_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase2_questions" (
    "id" SERIAL NOT NULL,
    "riasecTypeId" "RiasecType" NOT NULL,
    "testVersionId" INTEGER NOT NULL,
    "sectionType" "SectionType" NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionSubtext" TEXT,
    "mediaUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "minValue" INTEGER DEFAULT 1,
    "maxValue" INTEGER DEFAULT 3,
    "valueLabels" JSONB,
    "pointsValue" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase2_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase1_question_translations" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "languageId" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionShort" TEXT,
    "audioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase1_question_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase2_question_translations" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "languageId" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionSubtext" TEXT,
    "audioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase2_question_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aptitude_response_options" (
    "id" SERIAL NOT NULL,
    "value" INTEGER NOT NULL,
    "label" "Label" NOT NULL,
    "emoji" TEXT,
    "colorCode" TEXT,

    CONSTRAINT "aptitude_response_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase1_responses" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,
    "responseValue" INTEGER NOT NULL,
    "responseTimeMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phase1_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase2_responses" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,
    "responseValue" INTEGER NOT NULL,
    "responseTimeMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phase2_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_results" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "phase1Code" CHAR(3) NOT NULL,
    "phase2Code" CHAR(3) NOT NULL,
    "subjectiveRanking" JSONB,
    "phase1Scores" JSONB NOT NULL,
    "phase2Scores" JSONB NOT NULL,
    "sectionScores" JSONB NOT NULL,
    "consistencyScore" DOUBLE PRECISION NOT NULL,
    "consistencyLevel" "ConsistencyLevel" NOT NULL,
    "differentiationScore" DOUBLE PRECISION NOT NULL,
    "profileStrength" "ProfileStrength" NOT NULL,
    "insights" JSONB,
    "strengths" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastViewedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "session_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "careers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "summary" TEXT,
    "riasecCodes" "RiasecType"[],
    "localDemand" INTEGER,
    "formationLevel" TEXT,
    "salaryRangeMin" INTEGER,
    "salaryRangeMax" INTEGER,
    "careerPath" TEXT,
    "iconUrl" TEXT,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "category" "CareerCategory",
    "tags" TEXT[],
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "careers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_institutions" (
    "careerId" INTEGER NOT NULL,
    "institutionId" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_institutions_pkey" PRIMARY KEY ("careerId","institutionId")
);

-- CreateTable
CREATE TABLE "career_resources" (
    "careerId" INTEGER NOT NULL,
    "resourceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_resources_pkey" PRIMARY KEY ("careerId","resourceId")
);

-- CreateTable
CREATE TABLE "career_translations" (
    "id" SERIAL NOT NULL,
    "careerId" INTEGER NOT NULL,
    "languageId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT NOT NULL,
    "audioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_career_recommendations" (
    "id" SERIAL NOT NULL,
    "resultId" INTEGER NOT NULL,
    "careerId" INTEGER NOT NULL,
    "matchScore" INTEGER NOT NULL,
    "rankPosition" INTEGER NOT NULL,
    "viewedAt" TIMESTAMP(3),
    "savedForLater" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_career_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT,
    "emoji" TEXT,
    "rarity" "BadgeRarity" NOT NULL DEFAULT 'COMMON',
    "pointsValue" INTEGER NOT NULL DEFAULT 50,
    "unlockCondition" JSONB,
    "unlockCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_badges" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "badgeId" INTEGER NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sharedOnSocial" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "session_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_xp" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_xp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_levels" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "currentXp" INTEGER NOT NULL DEFAULT 0,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasure_maps" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "mapData" JSONB NOT NULL,
    "pdfUrl" TEXT,
    "shareToken" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastViewedAt" TIMESTAMP(3),

    CONSTRAINT "treasure_maps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_feedbacks" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "recommendationId" INTEGER,
    "type" "FeedbackType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_outcomes" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "careerId" INTEGER NOT NULL,
    "status" "OutcomeStatus" NOT NULL,
    "sector" TEXT NOT NULL,
    "salaryRange" TEXT,
    "delayToOutcome" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_interactions" (
    "id" BIGSERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" "InteractionEventType" NOT NULL,
    "entityType" "InteractionEntityType" NOT NULL,
    "entityId" INTEGER NOT NULL,
    "value" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "mediaUrl" TEXT,
    "category" TEXT,
    "tags" TEXT[],
    "author" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_translations" (
    "id" SERIAL NOT NULL,
    "resourceId" INTEGER NOT NULL,
    "languageId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "audioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_translations_pkey" PRIMARY KEY ("id")
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
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "programs" JSONB,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_institution_translations" (
    "id" SERIAL NOT NULL,
    "institutionId" INTEGER NOT NULL,
    "languageId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_institution_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "test_versions_code_key" ON "test_versions"("code");

-- CreateIndex
CREATE INDEX "test_versions_isActive_idx" ON "test_versions"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "languages_code_key" ON "languages"("code");

-- CreateIndex
CREATE INDEX "languages_isActive_idx" ON "languages"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "test_sessions_sessionToken_key" ON "test_sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "test_sessions_shareToken_key" ON "test_sessions"("shareToken");

-- CreateIndex
CREATE INDEX "test_sessions_testVersionId_idx" ON "test_sessions"("testVersionId");

-- CreateIndex
CREATE INDEX "test_sessions_sessionToken_idx" ON "test_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "test_sessions_shareToken_idx" ON "test_sessions"("shareToken");

-- CreateIndex
CREATE INDEX "test_sessions_startedAt_idx" ON "test_sessions"("startedAt");

-- CreateIndex
CREATE INDEX "test_sessions_isAbandoned_idx" ON "test_sessions"("isAbandoned");

-- CreateIndex
CREATE INDEX "test_sessions_completionPercentage_idx" ON "test_sessions"("completionPercentage");

-- CreateIndex
CREATE INDEX "phase1_questions_riasecTypeId_idx" ON "phase1_questions"("riasecTypeId");

-- CreateIndex
CREATE INDEX "phase1_questions_testVersionId_idx" ON "phase1_questions"("testVersionId");

-- CreateIndex
CREATE INDEX "phase1_questions_displayOrder_idx" ON "phase1_questions"("displayOrder");

-- CreateIndex
CREATE INDEX "phase1_questions_isActive_idx" ON "phase1_questions"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "phase1_questions_testVersionId_displayOrder_key" ON "phase1_questions"("testVersionId", "displayOrder");

-- CreateIndex
CREATE INDEX "phase2_questions_riasecTypeId_idx" ON "phase2_questions"("riasecTypeId");

-- CreateIndex
CREATE INDEX "phase2_questions_testVersionId_idx" ON "phase2_questions"("testVersionId");

-- CreateIndex
CREATE INDEX "phase2_questions_sectionType_idx" ON "phase2_questions"("sectionType");

-- CreateIndex
CREATE INDEX "phase2_questions_isActive_idx" ON "phase2_questions"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "phase2_questions_testVersionId_sectionType_displayOrder_key" ON "phase2_questions"("testVersionId", "sectionType", "displayOrder");

-- CreateIndex
CREATE INDEX "phase1_question_translations_languageId_idx" ON "phase1_question_translations"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "phase1_question_translations_questionId_languageId_key" ON "phase1_question_translations"("questionId", "languageId");

-- CreateIndex
CREATE INDEX "phase2_question_translations_languageId_idx" ON "phase2_question_translations"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "phase2_question_translations_questionId_languageId_key" ON "phase2_question_translations"("questionId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "aptitude_response_options_value_key" ON "aptitude_response_options"("value");

-- CreateIndex
CREATE INDEX "phase1_responses_sessionId_idx" ON "phase1_responses"("sessionId");

-- CreateIndex
CREATE INDEX "phase1_responses_questionId_idx" ON "phase1_responses"("questionId");

-- CreateIndex
CREATE INDEX "phase1_responses_createdAt_idx" ON "phase1_responses"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "phase1_responses_sessionId_questionId_key" ON "phase1_responses"("sessionId", "questionId");

-- CreateIndex
CREATE INDEX "phase2_responses_sessionId_idx" ON "phase2_responses"("sessionId");

-- CreateIndex
CREATE INDEX "phase2_responses_questionId_idx" ON "phase2_responses"("questionId");

-- CreateIndex
CREATE INDEX "phase2_responses_createdAt_idx" ON "phase2_responses"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "phase2_responses_sessionId_questionId_key" ON "phase2_responses"("sessionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "session_results_sessionId_key" ON "session_results"("sessionId");

-- CreateIndex
CREATE INDEX "session_results_sessionId_idx" ON "session_results"("sessionId");

-- CreateIndex
CREATE INDEX "session_results_phase2Code_idx" ON "session_results"("phase2Code");

-- CreateIndex
CREATE INDEX "session_results_consistencyLevel_idx" ON "session_results"("consistencyLevel");

-- CreateIndex
CREATE INDEX "session_results_profileStrength_idx" ON "session_results"("profileStrength");

-- CreateIndex
CREATE INDEX "session_results_createdAt_idx" ON "session_results"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "careers_name_key" ON "careers"("name");

-- CreateIndex
CREATE INDEX "careers_category_idx" ON "careers"("category");

-- CreateIndex
CREATE INDEX "careers_isFeatured_idx" ON "careers"("isFeatured");

-- CreateIndex
CREATE INDEX "careers_localDemand_idx" ON "careers"("localDemand");

-- CreateIndex
CREATE INDEX "careers_riasecCodes_idx" ON "careers"("riasecCodes");

-- CreateIndex
CREATE INDEX "career_institutions_institutionId_idx" ON "career_institutions"("institutionId");

-- CreateIndex
CREATE INDEX "career_resources_resourceId_idx" ON "career_resources"("resourceId");

-- CreateIndex
CREATE INDEX "career_translations_languageId_idx" ON "career_translations"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "career_translations_careerId_languageId_key" ON "career_translations"("careerId", "languageId");

-- CreateIndex
CREATE INDEX "session_career_recommendations_resultId_idx" ON "session_career_recommendations"("resultId");

-- CreateIndex
CREATE INDEX "session_career_recommendations_careerId_idx" ON "session_career_recommendations"("careerId");

-- CreateIndex
CREATE INDEX "session_career_recommendations_matchScore_idx" ON "session_career_recommendations"("matchScore");

-- CreateIndex
CREATE INDEX "session_career_recommendations_rankPosition_idx" ON "session_career_recommendations"("rankPosition");

-- CreateIndex
CREATE UNIQUE INDEX "session_career_recommendations_resultId_careerId_key" ON "session_career_recommendations"("resultId", "careerId");

-- CreateIndex
CREATE UNIQUE INDEX "badges_code_key" ON "badges"("code");

-- CreateIndex
CREATE INDEX "badges_rarity_idx" ON "badges"("rarity");

-- CreateIndex
CREATE INDEX "badges_unlockCount_idx" ON "badges"("unlockCount");

-- CreateIndex
CREATE INDEX "session_badges_sessionId_idx" ON "session_badges"("sessionId");

-- CreateIndex
CREATE INDEX "session_badges_badgeId_idx" ON "session_badges"("badgeId");

-- CreateIndex
CREATE INDEX "session_badges_unlockedAt_idx" ON "session_badges"("unlockedAt");

-- CreateIndex
CREATE UNIQUE INDEX "session_badges_sessionId_badgeId_key" ON "session_badges"("sessionId", "badgeId");

-- CreateIndex
CREATE INDEX "session_xp_sessionId_idx" ON "session_xp"("sessionId");

-- CreateIndex
CREATE INDEX "session_xp_createdAt_idx" ON "session_xp"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "session_levels_sessionId_key" ON "session_levels"("sessionId");

-- CreateIndex
CREATE INDEX "session_levels_level_idx" ON "session_levels"("level");

-- CreateIndex
CREATE UNIQUE INDEX "treasure_maps_sessionId_key" ON "treasure_maps"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "treasure_maps_shareToken_key" ON "treasure_maps"("shareToken");

-- CreateIndex
CREATE INDEX "treasure_maps_shareToken_idx" ON "treasure_maps"("shareToken");

-- CreateIndex
CREATE INDEX "treasure_maps_createdAt_idx" ON "treasure_maps"("createdAt");

-- CreateIndex
CREATE INDEX "session_feedbacks_sessionId_idx" ON "session_feedbacks"("sessionId");

-- CreateIndex
CREATE INDEX "session_feedbacks_recommendationId_idx" ON "session_feedbacks"("recommendationId");

-- CreateIndex
CREATE INDEX "session_feedbacks_type_idx" ON "session_feedbacks"("type");

-- CreateIndex
CREATE INDEX "session_feedbacks_createdAt_idx" ON "session_feedbacks"("createdAt");

-- CreateIndex
CREATE INDEX "session_outcomes_sessionId_idx" ON "session_outcomes"("sessionId");

-- CreateIndex
CREATE INDEX "session_outcomes_careerId_idx" ON "session_outcomes"("careerId");

-- CreateIndex
CREATE INDEX "session_outcomes_status_idx" ON "session_outcomes"("status");

-- CreateIndex
CREATE INDEX "session_outcomes_createdAt_idx" ON "session_outcomes"("createdAt");

-- CreateIndex
CREATE INDEX "session_interactions_sessionId_idx" ON "session_interactions"("sessionId");

-- CreateIndex
CREATE INDEX "session_interactions_type_idx" ON "session_interactions"("type");

-- CreateIndex
CREATE INDEX "session_interactions_entityType_idx" ON "session_interactions"("entityType");

-- CreateIndex
CREATE INDEX "session_interactions_entityId_idx" ON "session_interactions"("entityId");

-- CreateIndex
CREATE INDEX "session_interactions_createdAt_idx" ON "session_interactions"("createdAt");

-- CreateIndex
CREATE INDEX "resources_category_idx" ON "resources"("category");

-- CreateIndex
CREATE INDEX "resources_isPublished_idx" ON "resources"("isPublished");

-- CreateIndex
CREATE INDEX "resources_publishedAt_idx" ON "resources"("publishedAt");

-- CreateIndex
CREATE INDEX "resource_translations_languageId_idx" ON "resource_translations"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "resource_translations_resourceId_languageId_key" ON "resource_translations"("resourceId", "languageId");

-- CreateIndex
CREATE INDEX "training_institutions_department_idx" ON "training_institutions"("department");

-- CreateIndex
CREATE INDEX "training_institutions_city_idx" ON "training_institutions"("city");

-- CreateIndex
CREATE INDEX "training_institutions_type_idx" ON "training_institutions"("type");

-- CreateIndex
CREATE INDEX "training_institution_translations_languageId_idx" ON "training_institution_translations"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "training_institution_translations_institutionId_languageId_key" ON "training_institution_translations"("institutionId", "languageId");

-- AddForeignKey
ALTER TABLE "test_sessions" ADD CONSTRAINT "test_sessions_testVersionId_fkey" FOREIGN KEY ("testVersionId") REFERENCES "test_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase1_questions" ADD CONSTRAINT "phase1_questions_riasecTypeId_fkey" FOREIGN KEY ("riasecTypeId") REFERENCES "riasec_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase1_questions" ADD CONSTRAINT "phase1_questions_testVersionId_fkey" FOREIGN KEY ("testVersionId") REFERENCES "test_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase2_questions" ADD CONSTRAINT "phase2_questions_riasecTypeId_fkey" FOREIGN KEY ("riasecTypeId") REFERENCES "riasec_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase2_questions" ADD CONSTRAINT "phase2_questions_testVersionId_fkey" FOREIGN KEY ("testVersionId") REFERENCES "test_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase1_question_translations" ADD CONSTRAINT "phase1_question_translations_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "phase1_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase1_question_translations" ADD CONSTRAINT "phase1_question_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase2_question_translations" ADD CONSTRAINT "phase2_question_translations_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "phase2_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase2_question_translations" ADD CONSTRAINT "phase2_question_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase1_responses" ADD CONSTRAINT "phase1_responses_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "test_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase1_responses" ADD CONSTRAINT "phase1_responses_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "phase1_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase2_responses" ADD CONSTRAINT "phase2_responses_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "test_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase2_responses" ADD CONSTRAINT "phase2_responses_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "phase2_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_results" ADD CONSTRAINT "session_results_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "test_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_institutions" ADD CONSTRAINT "career_institutions_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "careers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_institutions" ADD CONSTRAINT "career_institutions_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "training_institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_resources" ADD CONSTRAINT "career_resources_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "careers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_resources" ADD CONSTRAINT "career_resources_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_translations" ADD CONSTRAINT "career_translations_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "careers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_translations" ADD CONSTRAINT "career_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_career_recommendations" ADD CONSTRAINT "session_career_recommendations_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "session_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_career_recommendations" ADD CONSTRAINT "session_career_recommendations_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "careers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_badges" ADD CONSTRAINT "session_badges_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "test_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_badges" ADD CONSTRAINT "session_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_xp" ADD CONSTRAINT "session_xp_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "test_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_levels" ADD CONSTRAINT "session_levels_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "test_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasure_maps" ADD CONSTRAINT "treasure_maps_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "test_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_feedbacks" ADD CONSTRAINT "session_feedbacks_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "test_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_feedbacks" ADD CONSTRAINT "session_feedbacks_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "session_career_recommendations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_outcomes" ADD CONSTRAINT "session_outcomes_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "test_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_outcomes" ADD CONSTRAINT "session_outcomes_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "careers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_interactions" ADD CONSTRAINT "session_interactions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "test_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_translations" ADD CONSTRAINT "resource_translations_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_translations" ADD CONSTRAINT "resource_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_institution_translations" ADD CONSTRAINT "training_institution_translations_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "training_institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_institution_translations" ADD CONSTRAINT "training_institution_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
