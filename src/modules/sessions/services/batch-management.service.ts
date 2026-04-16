import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PhaseType } from '@prisma/client';

export interface BatchInfo {
    id: string;
    assessmentId: string;
    batchIndex: number;
    phaseType: PhaseType;
    questionIds: number[];
    presentedAt: Date;
    completedAt: Date | null;
    isComplete: boolean;
    questionCount: number;
}

export interface BatchProgress {
    currentBatch: number;
    totalBatches: number;
    questionsAnswered: number;
    questionsInCurrentBatch: number;
    batchCompletionPercentage: number;
    overallCompletionPercentage: number;
}

@Injectable()
export class BatchManagementService {
    private readonly logger = new Logger(BatchManagementService.name);

    constructor(private readonly prisma: PrismaService) {}

    async startNewBatch(
        assessmentId: string,
        questionIds: number[],
        phaseType: PhaseType,
    ): Promise<BatchInfo> {
        const assessment = await this.prisma.assessment.findUnique({
            where: { id: assessmentId },
            select: { current_batch: true },
        });

        if (!assessment) {
            throw new NotFoundException(`Assessment ${assessmentId} not found`);
        }

        const batchIndex = assessment.current_batch;

        const batch = await this.prisma.batchHistory.create({
            data: {
                assessment_id: assessmentId,
                batch_index: batchIndex,
                phase_type: phaseType,
                question_ids: questionIds,
                presented_at: new Date(),
            },
        });

        return this.mapBatchToInfo(batch);
    }

    async completeBatch(assessmentId: string, batchIndex: number): Promise<BatchInfo> {
        const batch = await this.prisma.batchHistory.findUnique({
            where: {
                assessment_id_batch_index: {
                    assessment_id: assessmentId,
                    batch_index: batchIndex,
                },
            },
        });

        if (!batch) {
            throw new NotFoundException(
                `Batch ${batchIndex} for assessment ${assessmentId} not found`,
            );
        }

        const updatedBatch = await this.prisma.batchHistory.update({
            where: {
                assessment_id_batch_index: {
                    assessment_id: assessmentId,
                    batch_index: batchIndex,
                },
            },
            data: {
                completed_at: new Date(),
            },
        });

        await this.prisma.assessment.update({
            where: { id: assessmentId },
            data: { current_batch: batchIndex + 1 },
        });

        return this.mapBatchToInfo(updatedBatch);
    }

    async getCurrentBatch(assessmentId: string): Promise<BatchInfo | null> {
        const assessment = await this.prisma.assessment.findUnique({
            where: { id: assessmentId },
            select: { current_batch: true },
        });

        if (!assessment) {
            throw new NotFoundException(`Assessment ${assessmentId} not found`);
        }

        const batch = await this.prisma.batchHistory.findUnique({
            where: {
                assessment_id_batch_index: {
                    assessment_id: assessmentId,
                    batch_index: assessment.current_batch,
                },
            },
        });

        return batch ? this.mapBatchToInfo(batch) : null;
    }

    async getBatchHistory(assessmentId: string): Promise<BatchInfo[]> {
        const batches = await this.prisma.batchHistory.findMany({
            where: { assessment_id: assessmentId },
            orderBy: { batch_index: 'asc' },
        });

        return batches.map((b) => this.mapBatchToInfo(b));
    }

    async getBatchProgress(assessmentId: string): Promise<BatchProgress> {
        const assessment = await this.prisma.assessment.findUnique({
            where: { id: assessmentId },
            select: {
                current_batch: true,
                depth: true,
                current_phase: true,
                phase1_responses: { select: { id: true } },
                phase2_responses: { select: { id: true } },
                batches: {
                    select: { question_ids: true, completed_at: true },
                    orderBy: { batch_index: 'asc' },
                },
            },
        });

        if (!assessment) {
            throw new NotFoundException(`Assessment ${assessmentId} not found`);
        }

        const totalExpectedQuestions = assessment.depth * 6;
        const questionsAnswered =
            assessment.phase1_responses.length + assessment.phase2_responses.length;

        const currentBatchData = assessment.batches.find((b) => !b.completed_at);
        const questionsInCurrentBatch = currentBatchData?.question_ids.length || 0;

        const completedBatches = assessment.batches.filter((b) => b.completed_at !== null).length;

        const estimatedTotalBatches = Math.ceil(totalExpectedQuestions / 5);

        const batchCompletionPercentage =
            questionsInCurrentBatch > 0
                ? ((questionsAnswered % questionsInCurrentBatch) / questionsInCurrentBatch) * 100
                : 0;

        const overallCompletionPercentage = (questionsAnswered / totalExpectedQuestions) * 100;

        return {
            currentBatch: assessment.current_batch,
            totalBatches: estimatedTotalBatches,
            questionsAnswered,
            questionsInCurrentBatch,
            batchCompletionPercentage: Math.min(100, batchCompletionPercentage),
            overallCompletionPercentage: Math.min(100, overallCompletionPercentage),
        };
    }

    async getAllAskedQuestions(assessmentId: string): Promise<number[]> {
        const batches = await this.prisma.batchHistory.findMany({
            where: { assessment_id: assessmentId },
            select: { question_ids: true },
        });

        const allQuestionIds = batches.flatMap((b) => b.question_ids);
        return [...new Set(allQuestionIds)];
    }

    async isQuestionAsked(assessmentId: string, questionId: number): Promise<boolean> {
        const askedQuestions = await this.getAllAskedQuestions(assessmentId);
        return askedQuestions.includes(questionId);
    }

    private mapBatchToInfo(batch: any): BatchInfo {
        return {
            id: batch.id,
            assessmentId: batch.assessment_id,
            batchIndex: batch.batch_index,
            phaseType: batch.phase_type,
            questionIds: batch.question_ids,
            presentedAt: batch.presented_at,
            completedAt: batch.completed_at,
            isComplete: batch.completed_at !== null,
            questionCount: batch.question_ids.length,
        };
    }
}
