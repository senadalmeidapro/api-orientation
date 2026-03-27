import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetPhase1QuestionsDto } from './dto/get-phase1-questions.dto';
import { GetPhase2QuestionsDto } from './dto/get-phase2-questions.dto';
import { CreatePhase1QuestionDto } from './dto/create-phase1-question.dto';
import { UpdatePhase1QuestionDto } from './dto/update-phase1-question.dto';
import { CreatePhase2QuestionDto } from './dto/create-phase2-question.dto';
import { UpdatePhase2QuestionDto } from './dto/update-phase2-question.dto';

@Injectable()
export class QuestionsService {
    constructor(private readonly prisma: PrismaService) {
    }

    private async resolveTestVersionId(sessionToken?: string, testVersionId?: number) {
        if (sessionToken) {
            const session = await this.prisma.userTestSession.findUnique({
                where: { sessionToken },
                select: { testVersionId: true },
            });
            if (!session) throw new NotFoundException('Session introuvable');
            return session.testVersionId;
        }
        if (testVersionId) return testVersionId;
        throw new BadRequestException('sessionToken ou testVersionId requis');
    }

    private async resolveLanguageId(code?: string) {
        if (!code) return null;
        const lang = await this.prisma.language.findUnique({ where: { code } });
        return lang?.id ?? null;
    }

    async getPhase1Questions(dto: GetPhase1QuestionsDto) {
        const testVersionId = await this.resolveTestVersionId(dto.sessionToken, dto.testVersionId);
        const languageId = await this.resolveLanguageId(dto.lang);

        const questions = await this.prisma.phase1Question.findMany({
            where: { isActive: true, testVersionId },
            orderBy: { displayOrder: 'asc' },
            include: {
                translations: languageId
                    ? {
                        where: {languageId},
                        take: 1,
                    }
                    : false,
            },
        });

        return questions.map((q) => {
            const t = q.translations?.[0];
            return {
                id: q.id,
                riasecType: q.riasecTypeId,
                text: t?.questionText ?? q.questionText,
                short: t?.questionShort ?? q.questionShort,
                illustrationUrl: q.illustrationUrl,
                pointsValue: q.pointsValue,
                displayOrder: q.displayOrder,
            };
        });
    }

    async getPhase2Questions(dto: GetPhase2QuestionsDto) {
        const testVersionId = await this.resolveTestVersionId(dto.sessionToken, dto.testVersionId);
        const languageId = await this.resolveLanguageId(dto.lang);

        const questions = await this.prisma.phase2Question.findMany({
            where: { isActive: true, testVersionId, sectionType: dto.section },
            orderBy: { displayOrder: 'asc' },
            include: {
                translations: languageId
                    ? {
                        where: {languageId},
                        take: 1,
                    }
                    : false,
            },
        });

        return questions.map((q) => {
            const t = q.translations?.[0];
            return {
                id: q.id,
                riasecType: q.riasecTypeId,
                sectionType: q.sectionType,
                text: t?.questionText ?? q.questionText,
                subtext: t?.questionSubtext ?? q.questionSubtext,
                mediaUrl: q.mediaUrl,
                minValue: q.minValue,
                maxValue: q.maxValue,
                valueLabels: q.valueLabels,
                pointsValue: q.pointsValue,
                displayOrder: q.displayOrder,
            };
        });
    }

    async createPhase1Question(dto: CreatePhase1QuestionDto) {
        return this.prisma.phase1Question.create({ data: dto });
    }

    async updatePhase1Question(id: number, dto: UpdatePhase1QuestionDto) {
        return this.prisma.phase1Question.update({ where: { id }, data: dto });
    }

    async createPhase2Question(dto: CreatePhase2QuestionDto) {
        return this.prisma.phase2Question.create({ data: dto });
    }

    async updatePhase2Question(id: number, dto: UpdatePhase2QuestionDto) {
        return this.prisma.phase2Question.update({ where: { id }, data: dto });
    }
}
