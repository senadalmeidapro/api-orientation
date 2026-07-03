-- CreateTable
CREATE TABLE "assessment_formation_recommendations" (
    "id" TEXT NOT NULL,
    "result_id" TEXT NOT NULL,
    "formation_id" INTEGER NOT NULL,
    "match_score" INTEGER NOT NULL,
    "rank_position" INTEGER NOT NULL,
    "viewed_at" TIMESTAMP(3),
    "saved_forLater" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_formation_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_university_recommendations" (
    "id" TEXT NOT NULL,
    "result_id" TEXT NOT NULL,
    "university_id" INTEGER NOT NULL,
    "match_score" INTEGER NOT NULL,
    "rank_position" INTEGER NOT NULL,
    "viewed_at" TIMESTAMP(3),
    "saved_forLater" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_university_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assessment_formation_recommendations_result_id_idx" ON "assessment_formation_recommendations"("result_id");

-- CreateIndex
CREATE INDEX "assessment_formation_recommendations_formation_id_idx" ON "assessment_formation_recommendations"("formation_id");

-- CreateIndex
CREATE INDEX "assessment_formation_recommendations_match_score_idx" ON "assessment_formation_recommendations"("match_score");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_formation_recommendations_result_id_formation_id_key" ON "assessment_formation_recommendations"("result_id", "formation_id");

-- CreateIndex
CREATE INDEX "assessment_university_recommendations_result_id_idx" ON "assessment_university_recommendations"("result_id");

-- CreateIndex
CREATE INDEX "assessment_university_recommendations_university_id_idx" ON "assessment_university_recommendations"("university_id");

-- CreateIndex
CREATE INDEX "assessment_university_recommendations_match_score_idx" ON "assessment_university_recommendations"("match_score");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_university_recommendations_result_id_university__key" ON "assessment_university_recommendations"("result_id", "university_id");

-- AddForeignKey
ALTER TABLE "assessment_formation_recommendations" ADD CONSTRAINT "assessment_formation_recommendations_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "assessment_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_formation_recommendations" ADD CONSTRAINT "assessment_formation_recommendations_formation_id_fkey" FOREIGN KEY ("formation_id") REFERENCES "formations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_university_recommendations" ADD CONSTRAINT "assessment_university_recommendations_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "assessment_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_university_recommendations" ADD CONSTRAINT "assessment_university_recommendations_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
