import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BatchHistory, PhaseType } from '@prisma/client';

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
      select: { currentBatch: true },
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment ${assessmentId} not found`);
    }

    const batchIndex = assessment.currentBatch;

    const batch = await this.prisma.batchHistory.create({
      data: {
        assessmentId,
        batchIndex,
        phaseType,
        questionIds,
        presentedAt: new Date(),
      },
    });

    return this.mapBatchToInfo(batch);
  }

  async completeBatch(assessmentId: string, batchIndex: number): Promise<BatchInfo> {
    const batch = await this.prisma.batchHistory.findUnique({
      where: {
        assessmentId_batchIndex: {
          assessmentId,
          batchIndex,
        },
      },
    });

    if (!batch) {
      throw new NotFoundException(`Batch ${batchIndex} for assessment ${assessmentId} not found`);
    }

    const updatedBatch = await this.prisma.batchHistory.update({
      where: {
        assessmentId_batchIndex: {
          assessmentId,
          batchIndex,
        },
      },
      data: {
        completedAt: new Date(),
      },
    });

    await this.prisma.assessment.update({
      where: { id: assessmentId },
      data: { currentBatch: batchIndex + 1 },
    });

    return this.mapBatchToInfo(updatedBatch);
  }

  async getCurrentBatch(assessmentId: string): Promise<BatchInfo | null> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: { currentBatch: true },
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment ${assessmentId} not found`);
    }

    const batch = await this.prisma.batchHistory.findUnique({
      where: {
        assessmentId_batchIndex: {
          assessmentId,
          batchIndex: assessment.currentBatch,
        },
      },
    });

    return batch ? this.mapBatchToInfo(batch) : null;
  }

  async getBatchHistory(assessmentId: string): Promise<BatchInfo[]> {
    const batches = await this.prisma.batchHistory.findMany({
      where: { assessmentId },
      orderBy: { batchIndex: 'asc' },
    });

    return batches.map((b) => this.mapBatchToInfo(b));
  }

  async getBatchProgress(assessmentId: string): Promise<BatchProgress> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: {
        currentBatch: true,
        depth: true,
        currentPhase: true,
        phase1Responses: { select: { id: true } },
        phase2Responses: { select: { id: true } },
        batches: {
          select: { questionIds: true, completedAt: true },
          orderBy: { batchIndex: 'asc' },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment ${assessmentId} not found`);
    }

    const totalExpectedQuestions = assessment.depth * 6;
    const questionsAnswered = assessment.phase1Responses.length + assessment.phase2Responses.length;

    const currentBatchData = assessment.batches.find((b) => !b.completedAt);
    const questionsInCurrentBatch = currentBatchData?.questionIds.length || 0;

    const estimatedTotalBatches = Math.ceil(totalExpectedQuestions / 5);

    const batchCompletionPercentage =
      questionsInCurrentBatch > 0
        ? ((questionsAnswered % questionsInCurrentBatch) / questionsInCurrentBatch) * 100
        : 0;

    const overallCompletionPercentage = (questionsAnswered / totalExpectedQuestions) * 100;

    return {
      currentBatch: assessment.currentBatch,
      totalBatches: estimatedTotalBatches,
      questionsAnswered,
      questionsInCurrentBatch,
      batchCompletionPercentage: Math.min(100, batchCompletionPercentage),
      overallCompletionPercentage: Math.min(100, overallCompletionPercentage),
    };
  }

  async getAllAskedQuestions(assessmentId: string): Promise<number[]> {
    const batches = await this.prisma.batchHistory.findMany({
      where: { assessmentId },
      select: { questionIds: true },
    });

    const allQuestionIds = batches.flatMap((b) => b.questionIds);
    return [...new Set(allQuestionIds)];
  }

  async isQuestionAsked(assessmentId: string, questionId: number): Promise<boolean> {
    const askedQuestions = await this.getAllAskedQuestions(assessmentId);
    return askedQuestions.includes(questionId);
  }

  private mapBatchToInfo(batch: BatchHistory): BatchInfo {
    return {
      id: batch.id,
      assessmentId: batch.assessmentId,
      batchIndex: batch.batchIndex,
      phaseType: batch.phaseType,
      questionIds: batch.questionIds,
      presentedAt: batch.presentedAt,
      completedAt: batch.completedAt,
      isComplete: batch.completedAt !== null,
      questionCount: batch.questionIds.length,
    };
  }
}
