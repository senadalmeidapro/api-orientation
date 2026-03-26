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
CREATE TYPE "Departement" AS ENUM ('Alibori', 'Atacora', 'Atlantique', 'Borgou', 'Collines', 'Couffo', 'Donga', 'Littoral', 'Mono', 'Oueme', 'Plateau', 'Zou');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('M', 'F', 'Other');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EDITOR', 'ANALYST');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('light', 'dark', 'system');

-- CreateEnum
CREATE TYPE "FontSize" AS ENUM ('small', 'medium', 'large');

-- CreateEnum
CREATE TYPE "Label" AS ENUM ('Faible', 'Moyen', 'Fort');

-- CreateEnum
CREATE TYPE "CareerCategory" AS ENUM ('NUMERIQUE', 'AGRICULTURE', 'ARTISANAT', 'SANTE', 'EDUCATION', 'COMMERCE', 'ADMINISTRATION');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('INFO', 'RENDEZ_VOUS', 'QUESTION', 'AUTRE');

-- CreateEnum
CREATE TYPE "PreferredTime" AS ENUM ('MATIN', 'APRES_MIDI', 'SOIR');

-- CreateEnum
CREATE TYPE "ContactSatus" AS ENUM ('PENDING', 'CONTACTED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "AnnouncementType" AS ENUM ('INFO', 'EVENT', 'ALERTE', 'PROMO');

-- CreateEnum
CREATE TYPE "TargetAudience" AS ENUM ('ALL', 'STUDENTS', 'PARENTS', 'TEACHERS');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('LIKE', 'DISLIKE', 'CLICK', 'VIEW', 'SKIP');

-- CreateEnum
CREATE TYPE "InteractionEventType" AS ENUM ('ANSWER', 'CLICK', 'VIEW', 'SKIP');

-- CreateEnum
CREATE TYPE "InteractionEntityType" AS ENUM ('QUESTION', 'CAREER', 'RECOMMENDATION');

-- CreateEnum
CREATE TYPE "OutcomeStatus" AS ENUM ('STUDENT', 'INTERNSHIP', 'EMPLOYED', 'DROPOUT');

-- CreateTable
CREATE TABLE "test_versions"
(
    "id"          SERIAL       NOT NULL,
    "code"        TEXT         NOT NULL,
    "name"        TEXT         NOT NULL,
    "description" TEXT,
    "isActive"    BOOLEAN      NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages"
(
    "id"         SERIAL       NOT NULL,
    "code"       TEXT         NOT NULL,
    "name"       TEXT         NOT NULL,
    "nativeName" TEXT,
    "isActive"   BOOLEAN      NOT NULL DEFAULT true,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User"
(
    "id"                  TEXT         NOT NULL,
    "email"               TEXT         NOT NULL,
    "phone"               TEXT,
    "password"            TEXT         NOT NULL,
    "firstName"           TEXT,
    "lastName"            TEXT,
    "birthDate"           TIMESTAMP(3),
    "gender"              "Gender",
    "department"          "Departement",
    "city"                TEXT,
    "school"              TEXT,
    "level"               TEXT,
    "preferredLanguage"   TEXT         NOT NULL DEFAULT 'fr',
    "acceptNotifications" BOOLEAN      NOT NULL DEFAULT true,
    "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"           TIMESTAMP(3) NOT NULL,
    "lastLoginAt"         TIMESTAMP(3),
    "isActive"            BOOLEAN      NOT NULL DEFAULT true,
    "isAdmin"             BOOLEAN      NOT NULL DEFAULT false,
    "roles"               "UserRole"[] DEFAULT ARRAY[]::"UserRole"[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings"
(
    "id"           TEXT         NOT NULL,
    "userId"       TEXT         NOT NULL,
    "theme"        "Theme"      NOT NULL DEFAULT 'light',
    "fontSize"     "FontSize"   NOT NULL DEFAULT 'medium',
    "shareResults" BOOLEAN      NOT NULL DEFAULT false,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTestSession"
(
    "id"                   TEXT         NOT NULL,
    "userId"               TEXT,
    "testVersionId"        INTEGER      NOT NULL,
    "sessionToken"         TEXT         NOT NULL,
    "shareToken"           TEXT,
    "currentPhase"         "PhaseType"  NOT NULL DEFAULT 'PHASE_1',
    "currentStepIndex"     INTEGER      NOT NULL DEFAULT 0,
    "currentSection"       "SectionType",
    "department"           "Departement",
    "startedAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt"       TIMESTAMP(3) NOT NULL,
    "completedAt"          TIMESTAMP(3),
    "phase1CompletedAt"    TIMESTAMP(3),
    "phase2CompletedAt"    TIMESTAMP(3),
    "phase3CompletedAt"    TIMESTAMP(3),
    "isAbandoned"          BOOLEAN      NOT NULL DEFAULT false,
    "completionPercentage" INTEGER      NOT NULL DEFAULT 0,
    "deviceInfo"           JSONB,
    "ipAddress"            TEXT,
    "userAgent"            TEXT,

    CONSTRAINT "UserTestSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "riasec_types"
(
    "id"           "RiasecType" NOT NULL,
    "name"         TEXT         NOT NULL,
    "slogan"       TEXT,
    "description"  TEXT,
    "colorHex"     TEXT,
    "iconUrl"      TEXT,
    "displayOrder" INTEGER      NOT NULL DEFAULT 0,

    CONSTRAINT "riasec_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase1_questions"
(
    "id"              SERIAL       NOT NULL,
    "riasecTypeId"    "RiasecType" NOT NULL,
    "testVersionId"   INTEGER      NOT NULL,
    "questionText"    TEXT         NOT NULL,
    "questionShort"   TEXT,
    "illustrationUrl" TEXT,
    "displayOrder"    INTEGER      NOT NULL DEFAULT 0,
    "isActive"        BOOLEAN      NOT NULL DEFAULT true,
    "pointsValue"     INTEGER      NOT NULL DEFAULT 10,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase1_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase2_questions"
(
    "id"              SERIAL        NOT NULL,
    "riasecTypeId"    "RiasecType"  NOT NULL,
    "testVersionId"   INTEGER       NOT NULL,
    "sectionType"     "SectionType" NOT NULL,
    "questionText"    TEXT          NOT NULL,
    "questionSubtext" TEXT,
    "mediaUrl"        TEXT,
    "displayOrder"    INTEGER       NOT NULL DEFAULT 0,
    "isActive"        BOOLEAN       NOT NULL DEFAULT true,
    "minValue"        INTEGER                DEFAULT 1,
    "maxValue"        INTEGER                DEFAULT 3,
    "valueLabels"     JSONB,
    "pointsValue"     INTEGER       NOT NULL DEFAULT 15,
    "createdAt"       TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3)  NOT NULL,

    CONSTRAINT "phase2_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase1_question_translations"
(
    "id"            SERIAL       NOT NULL,
    "questionId"    INTEGER      NOT NULL,
    "languageId"    INTEGER      NOT NULL,
    "questionText"  TEXT         NOT NULL,
    "questionShort" TEXT,
    "audioUrl"      TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase1_question_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase2_question_translations"
(
    "id"              SERIAL       NOT NULL,
    "questionId"      INTEGER      NOT NULL,
    "languageId"      INTEGER      NOT NULL,
    "questionText"    TEXT         NOT NULL,
    "questionSubtext" TEXT,
    "audioUrl"        TEXT,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase2_question_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aptitude_response_options"
(
    "id"        SERIAL  NOT NULL,
    "value"     INTEGER NOT NULL,
    "label"     "Label" NOT NULL,
    "emoji"     TEXT,
    "colorCode" TEXT,

    CONSTRAINT "aptitude_response_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase1_responses"
(
    "id"             SERIAL       NOT NULL,
    "sessionId"      TEXT         NOT NULL,
    "questionId"     INTEGER      NOT NULL,
    "responseValue"  INTEGER      NOT NULL,
    "responseTimeMs" INTEGER,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phase1_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase2_responses"
(
    "id"             SERIAL       NOT NULL,
    "sessionId"      TEXT         NOT NULL,
    "questionId"     INTEGER      NOT NULL,
    "responseValue"  INTEGER      NOT NULL,
    "responseTimeMs" INTEGER,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phase2_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_results"
(
    "id"                   SERIAL             NOT NULL,
    "sessionId"            TEXT               NOT NULL,
    "phase1Code"           CHAR(3)            NOT NULL,
    "phase2Code"           CHAR(3)            NOT NULL,
    "subjectiveRanking"    JSONB,
    "phase1Scores"         JSONB              NOT NULL,
    "phase2Scores"         JSONB              NOT NULL,
    "sectionScores"        JSONB              NOT NULL,
    "consistencyScore"     DOUBLE PRECISION   NOT NULL,
    "consistencyLevel"     "ConsistencyLevel" NOT NULL,
    "differentiationScore" DOUBLE PRECISION   NOT NULL,
    "profileStrength"      "ProfileStrength"  NOT NULL,
    "insights"             JSONB,
    "strengths"            TEXT[],
    "createdAt"            TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastViewedAt"         TIMESTAMP(3),
    "viewCount"            INTEGER            NOT NULL DEFAULT 0,

    CONSTRAINT "user_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "careers"
(
    "id"             SERIAL       NOT NULL,
    "name"           TEXT         NOT NULL,
    "description"    TEXT         NOT NULL,
    "summary"        TEXT,
    "riasecCodes"    "RiasecType"[],
    "localDemand"    INTEGER,
    "formationLevel" TEXT,
    "salaryRangeMin" INTEGER,
    "salaryRangeMax" INTEGER,
    "careerPath"     TEXT,
    "iconUrl"        TEXT,
    "imageUrl"       TEXT,
    "videoUrl"       TEXT,
    "category"       "CareerCategory",
    "tags"           TEXT[],
    "isFeatured"     BOOLEAN      NOT NULL DEFAULT false,
    "isActive"       BOOLEAN      NOT NULL DEFAULT true,
    "viewCount"      INTEGER      NOT NULL DEFAULT 0,
    "clickCount"     INTEGER      NOT NULL DEFAULT 0,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,

    CONSTRAINT "careers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_institutions"
(
    "careerId"      INTEGER      NOT NULL,
    "institutionId" INTEGER      NOT NULL,
    "isPrimary"     BOOLEAN      NOT NULL DEFAULT false,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_institutions_pkey" PRIMARY KEY ("careerId", "institutionId")
);

-- CreateTable
CREATE TABLE "career_resources"
(
    "careerId"   INTEGER      NOT NULL,
    "resourceId" INTEGER      NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_resources_pkey" PRIMARY KEY ("careerId", "resourceId")
);

-- CreateTable
CREATE TABLE "career_translations"
(
    "id"          SERIAL       NOT NULL,
    "careerId"    INTEGER      NOT NULL,
    "languageId"  INTEGER      NOT NULL,
    "name"        TEXT         NOT NULL,
    "summary"     TEXT,
    "description" TEXT         NOT NULL,
    "audioUrl"    TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_career_recommendations"
(
    "id"            SERIAL       NOT NULL,
    "resultId"      INTEGER      NOT NULL,
    "careerId"      INTEGER      NOT NULL,
    "matchScore"    INTEGER      NOT NULL,
    "rankPosition"  INTEGER      NOT NULL,
    "viewedAt"      TIMESTAMP(3),
    "savedForLater" BOOLEAN      NOT NULL DEFAULT false,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_career_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_careers"
(
    "id"       SERIAL       NOT NULL,
    "userId"   TEXT         NOT NULL,
    "careerId" INTEGER      NOT NULL,
    "notes"    TEXT,
    "savedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_careers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges"
(
    "id"              SERIAL        NOT NULL,
    "code"            TEXT          NOT NULL,
    "name"            TEXT          NOT NULL,
    "description"     TEXT          NOT NULL,
    "iconUrl"         TEXT,
    "emoji"           TEXT,
    "rarity"          "BadgeRarity" NOT NULL DEFAULT 'COMMON',
    "pointsValue"     INTEGER       NOT NULL DEFAULT 50,
    "unlockCondition" JSONB,
    "unlockCount"     INTEGER       NOT NULL DEFAULT 0,
    "createdAt"       TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3)  NOT NULL,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_badges"
(
    "id"             SERIAL       NOT NULL,
    "userId"         TEXT,
    "sessionId"      TEXT,
    "badgeId"        INTEGER      NOT NULL,
    "unlockedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sharedOnSocial" BOOLEAN      NOT NULL DEFAULT false,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_xp"
(
    "id"        SERIAL       NOT NULL,
    "userId"    TEXT         NOT NULL,
    "sessionId" TEXT,
    "amount"    INTEGER      NOT NULL,
    "reason"    TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_xp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_levels"
(
    "id"        SERIAL       NOT NULL,
    "userId"    TEXT         NOT NULL,
    "level"     INTEGER      NOT NULL DEFAULT 1,
    "currentXp" INTEGER      NOT NULL DEFAULT 0,
    "totalXp"   INTEGER      NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens"
(
    "id"        SERIAL       NOT NULL,
    "userId"    TEXT         NOT NULL,
    "tokenHash" TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens"
(
    "id"        SERIAL       NOT NULL,
    "userId"    TEXT         NOT NULL,
    "tokenHash" TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt"    TIMESTAMP(3),

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasure_maps"
(
    "id"            SERIAL       NOT NULL,
    "sessionId"     TEXT         NOT NULL,
    "mapData"       JSONB        NOT NULL,
    "pdfUrl"        TEXT,
    "shareToken"    TEXT         NOT NULL,
    "viewCount"     INTEGER      NOT NULL DEFAULT 0,
    "downloadCount" INTEGER      NOT NULL DEFAULT 0,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastViewedAt"  TIMESTAMP(3),

    CONSTRAINT "treasure_maps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_feedbacks"
(
    "id"               SERIAL           NOT NULL,
    "userId"           TEXT             NOT NULL,
    "sessionId"        TEXT,
    "recommendationId" INTEGER,
    "type"             "FeedbackType"   NOT NULL,
    "value"            DOUBLE PRECISION NOT NULL,
    "context"          JSONB,
    "createdAt"        TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_outcomes"
(
    "id"             SERIAL          NOT NULL,
    "userId"         TEXT            NOT NULL,
    "careerId"       INTEGER         NOT NULL,
    "status"         "OutcomeStatus" NOT NULL,
    "sector"         TEXT            NOT NULL,
    "salaryRange"    TEXT,
    "delayToOutcome" INTEGER         NOT NULL,
    "createdAt"      TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_features"
(
    "id"                SERIAL           NOT NULL,
    "userId"            TEXT             NOT NULL,
    "avgResponseTime"   DOUBLE PRECISION NOT NULL DEFAULT 0,
    "responseVariance"  DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completionRate"    DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riasecConsistency" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "explorationScore"  DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastUpdatedAt"     TIMESTAMP(3)     NOT NULL,

    CONSTRAINT "user_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interaction_events"
(
    "id"         BIGSERIAL               NOT NULL,
    "userId"     TEXT                    NOT NULL,
    "type"       "InteractionEventType"  NOT NULL,
    "entityType" "InteractionEntityType" NOT NULL,
    "entityId"   INTEGER                 NOT NULL,
    "value"      DOUBLE PRECISION,
    "metadata"   JSONB,
    "createdAt"  TIMESTAMP(3)            NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interaction_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_scores"
(
    "id"           SERIAL           NOT NULL,
    "userId"       TEXT             NOT NULL,
    "careerId"     INTEGER          NOT NULL,
    "score"        DOUBLE PRECISION NOT NULL,
    "confidence"   DOUBLE PRECISION NOT NULL,
    "modelVersion" TEXT             NOT NULL,
    "createdAt"    TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources"
(
    "id"           SERIAL       NOT NULL,
    "title"        TEXT         NOT NULL,
    "description"  TEXT         NOT NULL,
    "content"      TEXT         NOT NULL,
    "contentType"  TEXT         NOT NULL,
    "thumbnailUrl" TEXT,
    "mediaUrl"     TEXT,
    "category"     TEXT,
    "tags"         TEXT[],
    "author"       TEXT,
    "viewCount"    INTEGER      NOT NULL DEFAULT 0,
    "isPublished"  BOOLEAN      NOT NULL DEFAULT false,
    "publishedAt"  TIMESTAMP(3),
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_translations"
(
    "id"          SERIAL       NOT NULL,
    "resourceId"  INTEGER      NOT NULL,
    "languageId"  INTEGER      NOT NULL,
    "title"       TEXT         NOT NULL,
    "description" TEXT         NOT NULL,
    "content"     TEXT         NOT NULL,
    "audioUrl"    TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_institutions"
(
    "id"          SERIAL       NOT NULL,
    "name"        TEXT         NOT NULL,
    "acronym"     TEXT,
    "description" TEXT,
    "type"        TEXT,
    "department"  TEXT,
    "city"        TEXT,
    "address"     TEXT,
    "phone"       TEXT,
    "email"       TEXT,
    "website"     TEXT,
    "programs"    JSONB,
    "logoUrl"     TEXT,
    "isActive"    BOOLEAN      NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_institution_translations"
(
    "id"            SERIAL       NOT NULL,
    "institutionId" INTEGER      NOT NULL,
    "languageId"    INTEGER      NOT NULL,
    "name"          TEXT         NOT NULL,
    "description"   TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_institution_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_requests"
(
    "id"            SERIAL         NOT NULL,
    "userId"        TEXT,
    "name"          TEXT           NOT NULL,
    "email"         TEXT           NOT NULL,
    "phone"         TEXT,
    "requestType"   "RequestType"  NOT NULL,
    "message"       TEXT           NOT NULL,
    "preferredDate" TIMESTAMP(3),
    "preferredTime" "PreferredTime",
    "status"        "ContactSatus" NOT NULL DEFAULT 'PENDING',
    "assignedTo"    TEXT,
    "response"      TEXT,
    "createdAt"     TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3)   NOT NULL,

    CONSTRAINT "contact_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_logs"
(
    "id"        SERIAL       NOT NULL,
    "userId"    TEXT         NOT NULL,
    "action"    TEXT         NOT NULL,
    "entity"    TEXT         NOT NULL,
    "entityId"  TEXT,
    "data"      JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements"
(
    "id"             SERIAL             NOT NULL,
    "title"          TEXT               NOT NULL,
    "content"        TEXT               NOT NULL,
    "excerpt"        TEXT,
    "type"           "AnnouncementType" NOT NULL,
    "priority"       INTEGER            NOT NULL DEFAULT 0,
    "imageUrl"       TEXT,
    "linkUrl"        TEXT,
    "targetAudience" "TargetAudience",
    "startDate"      TIMESTAMP(3),
    "endDate"        TIMESTAMP(3),
    "isActive"       BOOLEAN            NOT NULL DEFAULT true,
    "createdAt"      TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3)       NOT NULL,
    "publishedAt"    TIMESTAMP(3),

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_translations"
(
    "id"             SERIAL       NOT NULL,
    "announcementId" INTEGER      NOT NULL,
    "languageId"     INTEGER      NOT NULL,
    "title"          TEXT         NOT NULL,
    "content"        TEXT         NOT NULL,
    "excerpt"        TEXT,
    "audioUrl"       TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcement_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "test_versions_code_key" ON "test_versions" ("code");

-- CreateIndex
CREATE INDEX "test_versions_isActive_idx" ON "test_versions" ("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "languages_code_key" ON "languages" ("code");

-- CreateIndex
CREATE INDEX "languages_isActive_idx" ON "languages" ("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User" ("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User" ("phone");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User" ("email");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User" ("phone");

-- CreateIndex
CREATE INDEX "User_department_idx" ON "User" ("department");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User" ("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings" ("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTestSession_sessionToken_key" ON "UserTestSession" ("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "UserTestSession_shareToken_key" ON "UserTestSession" ("shareToken");

-- CreateIndex
CREATE INDEX "UserTestSession_userId_idx" ON "UserTestSession" ("userId");

-- CreateIndex
CREATE INDEX "UserTestSession_testVersionId_idx" ON "UserTestSession" ("testVersionId");

-- CreateIndex
CREATE INDEX "UserTestSession_sessionToken_idx" ON "UserTestSession" ("sessionToken");

-- CreateIndex
CREATE INDEX "UserTestSession_shareToken_idx" ON "UserTestSession" ("shareToken");

-- CreateIndex
CREATE INDEX "UserTestSession_startedAt_idx" ON "UserTestSession" ("startedAt");

-- CreateIndex
CREATE INDEX "UserTestSession_isAbandoned_idx" ON "UserTestSession" ("isAbandoned");

-- CreateIndex
CREATE INDEX "UserTestSession_completionPercentage_idx" ON "UserTestSession" ("completionPercentage");

-- CreateIndex
CREATE INDEX "UserTestSession_department_idx" ON "UserTestSession" ("department");

-- CreateIndex
CREATE INDEX "phase1_questions_riasecTypeId_idx" ON "phase1_questions" ("riasecTypeId");

-- CreateIndex
CREATE INDEX "phase1_questions_testVersionId_idx" ON "phase1_questions" ("testVersionId");

-- CreateIndex
CREATE INDEX "phase1_questions_displayOrder_idx" ON "phase1_questions" ("displayOrder");

-- CreateIndex
CREATE INDEX "phase1_questions_isActive_idx" ON "phase1_questions" ("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "phase1_questions_testVersionId_displayOrder_key" ON "phase1_questions" ("testVersionId", "displayOrder");

-- CreateIndex
CREATE INDEX "phase2_questions_riasecTypeId_idx" ON "phase2_questions" ("riasecTypeId");

-- CreateIndex
CREATE INDEX "phase2_questions_testVersionId_idx" ON "phase2_questions" ("testVersionId");

-- CreateIndex
CREATE INDEX "phase2_questions_sectionType_idx" ON "phase2_questions" ("sectionType");

-- CreateIndex
CREATE INDEX "phase2_questions_isActive_idx" ON "phase2_questions" ("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "phase2_questions_testVersionId_sectionType_displayOrder_key" ON "phase2_questions" ("testVersionId", "sectionType", "displayOrder");

-- CreateIndex
CREATE INDEX "phase1_question_translations_languageId_idx" ON "phase1_question_translations" ("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "phase1_question_translations_questionId_languageId_key" ON "phase1_question_translations" ("questionId", "languageId");

-- CreateIndex
CREATE INDEX "phase2_question_translations_languageId_idx" ON "phase2_question_translations" ("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "phase2_question_translations_questionId_languageId_key" ON "phase2_question_translations" ("questionId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "aptitude_response_options_value_key" ON "aptitude_response_options" ("value");

-- CreateIndex
CREATE INDEX "phase1_responses_sessionId_idx" ON "phase1_responses" ("sessionId");

-- CreateIndex
CREATE INDEX "phase1_responses_questionId_idx" ON "phase1_responses" ("questionId");

-- CreateIndex
CREATE INDEX "phase1_responses_createdAt_idx" ON "phase1_responses" ("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "phase1_responses_sessionId_questionId_key" ON "phase1_responses" ("sessionId", "questionId");

-- CreateIndex
CREATE INDEX "phase2_responses_sessionId_idx" ON "phase2_responses" ("sessionId");

-- CreateIndex
CREATE INDEX "phase2_responses_questionId_idx" ON "phase2_responses" ("questionId");

-- CreateIndex
CREATE INDEX "phase2_responses_createdAt_idx" ON "phase2_responses" ("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "phase2_responses_sessionId_questionId_key" ON "phase2_responses" ("sessionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_results_sessionId_key" ON "user_results" ("sessionId");

-- CreateIndex
CREATE INDEX "user_results_sessionId_idx" ON "user_results" ("sessionId");

-- CreateIndex
CREATE INDEX "user_results_phase2Code_idx" ON "user_results" ("phase2Code");

-- CreateIndex
CREATE INDEX "user_results_consistencyLevel_idx" ON "user_results" ("consistencyLevel");

-- CreateIndex
CREATE INDEX "user_results_profileStrength_idx" ON "user_results" ("profileStrength");

-- CreateIndex
CREATE INDEX "user_results_createdAt_idx" ON "user_results" ("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "careers_name_key" ON "careers" ("name");

-- CreateIndex
CREATE INDEX "careers_category_idx" ON "careers" ("category");

-- CreateIndex
CREATE INDEX "careers_isFeatured_idx" ON "careers" ("isFeatured");

-- CreateIndex
CREATE INDEX "careers_localDemand_idx" ON "careers" ("localDemand");

-- CreateIndex
CREATE INDEX "careers_riasecCodes_idx" ON "careers" ("riasecCodes");

-- CreateIndex
CREATE INDEX "career_institutions_institutionId_idx" ON "career_institutions" ("institutionId");

-- CreateIndex
CREATE INDEX "career_resources_resourceId_idx" ON "career_resources" ("resourceId");

-- CreateIndex
CREATE INDEX "career_translations_languageId_idx" ON "career_translations" ("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "career_translations_careerId_languageId_key" ON "career_translations" ("careerId", "languageId");

-- CreateIndex
CREATE INDEX "user_career_recommendations_resultId_idx" ON "user_career_recommendations" ("resultId");

-- CreateIndex
CREATE INDEX "user_career_recommendations_careerId_idx" ON "user_career_recommendations" ("careerId");

-- CreateIndex
CREATE INDEX "user_career_recommendations_matchScore_idx" ON "user_career_recommendations" ("matchScore");

-- CreateIndex
CREATE INDEX "user_career_recommendations_rankPosition_idx" ON "user_career_recommendations" ("rankPosition");

-- CreateIndex
CREATE UNIQUE INDEX "user_career_recommendations_resultId_careerId_key" ON "user_career_recommendations" ("resultId", "careerId");

-- CreateIndex
CREATE INDEX "saved_careers_userId_idx" ON "saved_careers" ("userId");

-- CreateIndex
CREATE INDEX "saved_careers_careerId_idx" ON "saved_careers" ("careerId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_careers_userId_careerId_key" ON "saved_careers" ("userId", "careerId");

-- CreateIndex
CREATE UNIQUE INDEX "badges_code_key" ON "badges" ("code");

-- CreateIndex
CREATE INDEX "badges_rarity_idx" ON "badges" ("rarity");

-- CreateIndex
CREATE INDEX "badges_unlockCount_idx" ON "badges" ("unlockCount");

-- CreateIndex
CREATE INDEX "user_badges_userId_idx" ON "user_badges" ("userId");

-- CreateIndex
CREATE INDEX "user_badges_sessionId_idx" ON "user_badges" ("sessionId");

-- CreateIndex
CREATE INDEX "user_badges_badgeId_idx" ON "user_badges" ("badgeId");

-- CreateIndex
CREATE INDEX "user_badges_unlockedAt_idx" ON "user_badges" ("unlockedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "user_badges" ("userId", "badgeId");

-- CreateIndex
CREATE INDEX "user_xp_userId_idx" ON "user_xp" ("userId");

-- CreateIndex
CREATE INDEX "user_xp_sessionId_idx" ON "user_xp" ("sessionId");

-- CreateIndex
CREATE INDEX "user_xp_createdAt_idx" ON "user_xp" ("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_levels_userId_key" ON "user_levels" ("userId");

-- CreateIndex
CREATE INDEX "user_levels_level_idx" ON "user_levels" ("level");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens" ("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens" ("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens" ("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "password_reset_tokens" ("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens" ("userId");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expiresAt_idx" ON "password_reset_tokens" ("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "treasure_maps_sessionId_key" ON "treasure_maps" ("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "treasure_maps_shareToken_key" ON "treasure_maps" ("shareToken");

-- CreateIndex
CREATE INDEX "treasure_maps_shareToken_idx" ON "treasure_maps" ("shareToken");

-- CreateIndex
CREATE INDEX "treasure_maps_createdAt_idx" ON "treasure_maps" ("createdAt");

-- CreateIndex
CREATE INDEX "user_feedbacks_userId_idx" ON "user_feedbacks" ("userId");

-- CreateIndex
CREATE INDEX "user_feedbacks_sessionId_idx" ON "user_feedbacks" ("sessionId");

-- CreateIndex
CREATE INDEX "user_feedbacks_recommendationId_idx" ON "user_feedbacks" ("recommendationId");

-- CreateIndex
CREATE INDEX "user_feedbacks_type_idx" ON "user_feedbacks" ("type");

-- CreateIndex
CREATE INDEX "user_feedbacks_createdAt_idx" ON "user_feedbacks" ("createdAt");

-- CreateIndex
CREATE INDEX "user_outcomes_userId_idx" ON "user_outcomes" ("userId");

-- CreateIndex
CREATE INDEX "user_outcomes_careerId_idx" ON "user_outcomes" ("careerId");

-- CreateIndex
CREATE INDEX "user_outcomes_status_idx" ON "user_outcomes" ("status");

-- CreateIndex
CREATE INDEX "user_outcomes_createdAt_idx" ON "user_outcomes" ("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_features_userId_key" ON "user_features" ("userId");

-- CreateIndex
CREATE INDEX "user_features_userId_idx" ON "user_features" ("userId");

-- CreateIndex
CREATE INDEX "interaction_events_userId_idx" ON "interaction_events" ("userId");

-- CreateIndex
CREATE INDEX "interaction_events_type_idx" ON "interaction_events" ("type");

-- CreateIndex
CREATE INDEX "interaction_events_entityType_idx" ON "interaction_events" ("entityType");

-- CreateIndex
CREATE INDEX "interaction_events_entityId_idx" ON "interaction_events" ("entityId");

-- CreateIndex
CREATE INDEX "interaction_events_createdAt_idx" ON "interaction_events" ("createdAt");

-- CreateIndex
CREATE INDEX "recommendation_scores_userId_idx" ON "recommendation_scores" ("userId");

-- CreateIndex
CREATE INDEX "recommendation_scores_careerId_idx" ON "recommendation_scores" ("careerId");

-- CreateIndex
CREATE INDEX "recommendation_scores_modelVersion_idx" ON "recommendation_scores" ("modelVersion");

-- CreateIndex
CREATE INDEX "recommendation_scores_createdAt_idx" ON "recommendation_scores" ("createdAt");

-- CreateIndex
CREATE INDEX "resources_category_idx" ON "resources" ("category");

-- CreateIndex
CREATE INDEX "resources_isPublished_idx" ON "resources" ("isPublished");

-- CreateIndex
CREATE INDEX "resources_publishedAt_idx" ON "resources" ("publishedAt");

-- CreateIndex
CREATE INDEX "resource_translations_languageId_idx" ON "resource_translations" ("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "resource_translations_resourceId_languageId_key" ON "resource_translations" ("resourceId", "languageId");

-- CreateIndex
CREATE INDEX "training_institutions_department_idx" ON "training_institutions" ("department");

-- CreateIndex
CREATE INDEX "training_institutions_city_idx" ON "training_institutions" ("city");

-- CreateIndex
CREATE INDEX "training_institutions_type_idx" ON "training_institutions" ("type");

-- CreateIndex
CREATE INDEX "training_institution_translations_languageId_idx" ON "training_institution_translations" ("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "training_institution_translations_institutionId_languageId_key" ON "training_institution_translations" ("institutionId", "languageId");

-- CreateIndex
CREATE INDEX "contact_requests_email_idx" ON "contact_requests" ("email");

-- CreateIndex
CREATE INDEX "contact_requests_status_idx" ON "contact_requests" ("status");

-- CreateIndex
CREATE INDEX "contact_requests_createdAt_idx" ON "contact_requests" ("createdAt");

-- CreateIndex
CREATE INDEX "admin_audit_logs_userId_idx" ON "admin_audit_logs" ("userId");

-- CreateIndex
CREATE INDEX "admin_audit_logs_entity_idx" ON "admin_audit_logs" ("entity");

-- CreateIndex
CREATE INDEX "admin_audit_logs_createdAt_idx" ON "admin_audit_logs" ("createdAt");

-- CreateIndex
CREATE INDEX "announcements_type_idx" ON "announcements" ("type");

-- CreateIndex
CREATE INDEX "announcements_isActive_idx" ON "announcements" ("isActive");

-- CreateIndex
CREATE INDEX "announcements_startDate_endDate_idx" ON "announcements" ("startDate", "endDate");

-- CreateIndex
CREATE INDEX "announcements_priority_idx" ON "announcements" ("priority");

-- CreateIndex
CREATE INDEX "announcement_translations_languageId_idx" ON "announcement_translations" ("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "announcement_translations_announcementId_languageId_key" ON "announcement_translations" ("announcementId", "languageId");

-- AddForeignKey
ALTER TABLE "UserSettings"
    ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTestSession"
    ADD CONSTRAINT "UserTestSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTestSession"
    ADD CONSTRAINT "UserTestSession_testVersionId_fkey" FOREIGN KEY ("testVersionId") REFERENCES "test_versions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase1_questions"
    ADD CONSTRAINT "phase1_questions_riasecTypeId_fkey" FOREIGN KEY ("riasecTypeId") REFERENCES "riasec_types" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase1_questions"
    ADD CONSTRAINT "phase1_questions_testVersionId_fkey" FOREIGN KEY ("testVersionId") REFERENCES "test_versions" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase2_questions"
    ADD CONSTRAINT "phase2_questions_riasecTypeId_fkey" FOREIGN KEY ("riasecTypeId") REFERENCES "riasec_types" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase2_questions"
    ADD CONSTRAINT "phase2_questions_testVersionId_fkey" FOREIGN KEY ("testVersionId") REFERENCES "test_versions" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase1_question_translations"
    ADD CONSTRAINT "phase1_question_translations_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "phase1_questions" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase1_question_translations"
    ADD CONSTRAINT "phase1_question_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase2_question_translations"
    ADD CONSTRAINT "phase2_question_translations_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "phase2_questions" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase2_question_translations"
    ADD CONSTRAINT "phase2_question_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase1_responses"
    ADD CONSTRAINT "phase1_responses_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "UserTestSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase1_responses"
    ADD CONSTRAINT "phase1_responses_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "phase1_questions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase2_responses"
    ADD CONSTRAINT "phase2_responses_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "UserTestSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase2_responses"
    ADD CONSTRAINT "phase2_responses_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "phase2_questions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_results"
    ADD CONSTRAINT "user_results_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "UserTestSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_institutions"
    ADD CONSTRAINT "career_institutions_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "careers" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_institutions"
    ADD CONSTRAINT "career_institutions_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "training_institutions" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_resources"
    ADD CONSTRAINT "career_resources_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "careers" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_resources"
    ADD CONSTRAINT "career_resources_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_translations"
    ADD CONSTRAINT "career_translations_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "careers" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_translations"
    ADD CONSTRAINT "career_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_career_recommendations"
    ADD CONSTRAINT "user_career_recommendations_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "user_results" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_career_recommendations"
    ADD CONSTRAINT "user_career_recommendations_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "careers" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_careers"
    ADD CONSTRAINT "saved_careers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_careers"
    ADD CONSTRAINT "saved_careers_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "careers" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges"
    ADD CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges"
    ADD CONSTRAINT "user_badges_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "UserTestSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges"
    ADD CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_xp"
    ADD CONSTRAINT "user_xp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_xp"
    ADD CONSTRAINT "user_xp_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "UserTestSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_levels"
    ADD CONSTRAINT "user_levels_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens"
    ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasure_maps"
    ADD CONSTRAINT "treasure_maps_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "UserTestSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_feedbacks"
    ADD CONSTRAINT "user_feedbacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_feedbacks"
    ADD CONSTRAINT "user_feedbacks_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "UserTestSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_feedbacks"
    ADD CONSTRAINT "user_feedbacks_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "user_career_recommendations" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_outcomes"
    ADD CONSTRAINT "user_outcomes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_outcomes"
    ADD CONSTRAINT "user_outcomes_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "careers" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_features"
    ADD CONSTRAINT "user_features_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interaction_events"
    ADD CONSTRAINT "interaction_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_scores"
    ADD CONSTRAINT "recommendation_scores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_scores"
    ADD CONSTRAINT "recommendation_scores_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "careers" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_translations"
    ADD CONSTRAINT "resource_translations_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_translations"
    ADD CONSTRAINT "resource_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_institution_translations"
    ADD CONSTRAINT "training_institution_translations_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "training_institutions" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_institution_translations"
    ADD CONSTRAINT "training_institution_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_requests"
    ADD CONSTRAINT "contact_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_audit_logs"
    ADD CONSTRAINT "admin_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_translations"
    ADD CONSTRAINT "announcement_translations_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "announcements" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_translations"
    ADD CONSTRAINT "announcement_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
