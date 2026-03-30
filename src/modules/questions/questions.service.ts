import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetPhase1QuestionsDto } from './dto/get-phase1-questions.dto';
import { GetPhase2QuestionsDto } from './dto/get-phase2-questions.dto';
import { PhaseType } from '@prisma/client';

@Injectable()
export class QuestionsService {
    constructor(private readonly prisma: PrismaService) {}

    private async resolveSession(sessionToken: string, phase: PhaseType) {
        const session = await this.prisma.testSession.findUnique({
            where: { sessionToken },
            select: { id: true, testVersionId: true, currentPhase: true },
        });
        if (!session) throw new NotFoundException('Session introuvable');
        if (session.currentPhase !== phase) {
            throw new BadRequestException('Phase courante invalide pour cette requete');
        }
        return session;
    }

    private async resolveLanguageId(code?: string) {
        if (!code) return null;
        const lang = await this.prisma.language.findUnique({ where: { code } });
        return lang?.id ?? null;
    }

    async getPhase1Questions(dto: GetPhase1QuestionsDto) {
        const session = await this.resolveSession(dto.sessionToken, PhaseType.PHASE_1);
        const languageId = await this.resolveLanguageId(dto.lang);

        const questions = await this.prisma.phase1Question.findMany({
            where: { isActive: true, testVersionId: session.testVersionId },
            orderBy: { displayOrder: 'asc' },
            include: {
                translations: languageId
                    ? {
                          where: { languageId },
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
        const session = await this.resolveSession(dto.sessionToken, PhaseType.PHASE_2);
        const languageId = await this.resolveLanguageId(dto.lang);

        const questions = await this.prisma.phase2Question.findMany({
            where: {
                isActive: true,
                testVersionId: session.testVersionId,
                sectionType: dto.section,
            },
            orderBy: { displayOrder: 'asc' },
            include: {
                translations: languageId
                    ? {
                          where: { languageId },
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

    // async createPhase1Question() {
    //     throw new BadRequestException('Creation de questions desactivee');
    // }

    // async updatePhase1Question() {
    //     throw new BadRequestException('Mise a jour de questions desactivee');
    // }

    // async createPhase2Question() {
    //     throw new BadRequestException('Creation de questions desactivee');
    // }

    // async updatePhase2Question() {
    //     throw new BadRequestException('Mise a jour de questions desactivee');
    // }
}
