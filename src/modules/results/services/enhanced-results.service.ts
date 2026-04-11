import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BehavioralAnalysisService } from '../../responses/services/behavioral-analysis.service';
import { AdaptiveSelectionService } from '../../questions/services/adaptive-selection.service';
import { AIAdaptiveService } from '../../ai/services/ai-adaptive.service';
import { MultiProfileUtil, RiasecScores } from '../../../common/utils/multi-profile.util';

export interface EnhancedReportSection {
    title: string;
    content: string;
    insights: string[];
}

export interface EnhancedReport {
    assessmentId: string;
    generatedAt: Date;
    riasecProfile: {
        code: string;
        scores: RiasecScores;
        dominant: Array<{ type: string; score: number; percentage: number }>;
    };
    behavioralAnalysis: {
        dominantPattern: string;
        confidence: number;
        observations: string[];
        metrics: any;
    };
    psychologicalProfile: {
        summary: string;
        keyTraits: string[];
        recommendations: string[];
    };
    careerRecommendations: string[];
    actionPlan: string[];
    sections: EnhancedReportSection[];
}

@Injectable()
export class EnhancedResultsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly behavioralService: BehavioralAnalysisService,
        private readonly adaptiveService: AdaptiveSelectionService,
        private readonly aiService: AIAdaptiveService,
    ) {}

    async generateEnhancedReport(assessmentId: string): Promise<EnhancedReport> {
        const assessment = await this.prisma.assessment.findUnique({
            where: { id: assessmentId },
            include: {
                result: true,
                batches: {
                    orderBy: { batch_index: 'asc' },
                },
                intermediate_profiles: {
                    orderBy: { batch_index: 'desc' },
                    take: 1,
                },
            },
        });

        if (!assessment) {
            throw new NotFoundException(`Assessment ${assessmentId} not found`);
        }

        const [behavioralInsights, latestProfile] = await Promise.all([
            this.behavioralService.generateBehavioralInsights(assessmentId),
            this.adaptiveService.getLatestIntermediateProfile(assessmentId),
        ]);

        const profileScores = latestProfile
            ? latestProfile.profileData
            : MultiProfileUtil.emptyScores();

        const profileSnapshot = MultiProfileUtil.createProfileSnapshot(profileScores);

        const aiBehavioralInsights = await this.aiService.generateBehavioralInsights(
            await this.behavioralService.getAssessmentBehaviors(assessmentId),
            profileScores,
        );

        const aiProfileAnalysis = await this.aiService.analyzeIntermediateProfile(
            profileScores,
            assessment.batches.reduce((sum, b) => sum + b.question_ids.length, 0),
            assessment.batches.length,
        );

        const sections: EnhancedReportSection[] = [
            {
                title: 'Profil RIASEC',
                content: this.formatRiasecSection(profileSnapshot),
                insights: aiProfileAnalysis.strengths,
            },
            {
                title: 'Analyse Comportementale',
                content: this.formatBehavioralSection(behavioralInsights),
                insights: behavioralInsights.observations,
            },
            {
                title: 'Profil Psychologique',
                content: aiBehavioralInsights.psychologicalProfile,
                insights: aiBehavioralInsights.keyObservations,
            },
            {
                title: 'Recommandations de Carrière',
                content: this.formatCareerSection(aiProfileAnalysis.careerSuggestions),
                insights: aiProfileAnalysis.careerSuggestions,
            },
        ];

        const actionPlan = await this.generateActionPlan(
            profileSnapshot,
            behavioralInsights,
            aiBehavioralInsights,
        );

        return {
            assessmentId,
            generatedAt: new Date(),
            riasecProfile: {
                code: profileSnapshot.dominant,
                scores: profileSnapshot.normalized,
                dominant: profileSnapshot.topThree,
            },
            behavioralAnalysis: {
                dominantPattern: behavioralInsights.dominantPattern,
                confidence: behavioralInsights.confidence,
                observations: behavioralInsights.observations,
                metrics: behavioralInsights.metrics,
            },
            psychologicalProfile: {
                summary: aiBehavioralInsights.summary,
                keyTraits: aiBehavioralInsights.keyObservations,
                recommendations: aiBehavioralInsights.recommendations,
            },
            careerRecommendations: aiProfileAnalysis.careerSuggestions,
            actionPlan,
            sections,
        };
    }

    async formatBehavioralObservations(assessmentId: string): Promise<string[]> {
        const insights = await this.behavioralService.generateBehavioralInsights(assessmentId);

        const formatted: string[] = [];

        formatted.push(
            `Comportement dominant: ${this.translatePattern(insights.dominantPattern)} (confiance: ${(insights.confidence * 100).toFixed(0)}%)`,
        );

        const { metrics } = insights;

        if (metrics.averageResponseTime > 0) {
            formatted.push(
                `Temps moyen de réponse: ${(metrics.averageResponseTime / 1000).toFixed(1)}s`,
            );
        }

        if (metrics.hesitationCount > 0) {
            formatted.push(`${metrics.hesitationCount} réponses avec hésitation détectée`);
        }

        if (metrics.doubtCount > 0) {
            formatted.push(`${metrics.doubtCount} réponses modifiées plusieurs fois (doute)`);
        }

        if (metrics.excitementCount > 0) {
            formatted.push(`${metrics.excitementCount} réponses spontanées et enthousiastes`);
        }

        if (metrics.consistentCount > 0) {
            formatted.push(`${metrics.consistentCount} réponses cohérentes et réfléchies`);
        }

        formatted.push(...insights.observations);

        return formatted;
    }

    async generateRecommendations(
        profile: RiasecScores,
        behavioralPattern: string,
    ): Promise<string[]> {
        return await this.aiService.generatePersonalizedRecommendations(profile, behavioralPattern);
    }

    private formatRiasecSection(snapshot: any): string {
        return (
            `Votre profil RIASEC est ${snapshot.dominant}, avec les scores suivants:\n` +
            snapshot.topThree
                .map(
                    (t: any) =>
                        `- ${t.type}: ${t.percentage.toFixed(1)}% (${t.score.toFixed(2)} points)`,
                )
                .join('\n')
        );
    }

    private formatBehavioralSection(insights: any): string {
        return (
            `Votre comportement durant le test révèle un profil ${this.translatePattern(insights.dominantPattern)}.\n\n` +
            `Métriques:\n` +
            `- Temps moyen de réponse: ${(insights.metrics.averageResponseTime / 1000).toFixed(1)}s\n` +
            `- Changements de réponses: ${insights.metrics.totalChanges}\n` +
            `- Hésitations: ${insights.metrics.hesitationCount}\n` +
            `- Réponses cohérentes: ${insights.metrics.consistentCount}`
        );
    }

    private formatCareerSection(suggestions: string[]): string {
        if (suggestions.length === 0) {
            return 'Les recommandations de carrière seront disponibles après analyse complète.';
        }

        return (
            'Carrières suggérées basées sur votre profil:\n' +
            suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')
        );
    }

    private async generateActionPlan(
        profileSnapshot: any,
        behavioralInsights: any,
        aiInsights: any,
    ): Promise<string[]> {
        const plan: string[] = [];

        plan.push(
            `Explorez les carrières liées à votre profil dominant: ${profileSnapshot.dominant}`,
        );

        if (behavioralInsights.metrics.hesitationCount > 5) {
            plan.push('Prenez le temps de réfléchir à vos choix sans pression');
        }

        if (behavioralInsights.dominantPattern === 'confident') {
            plan.push('Votre confiance est un atout: foncez vers vos objectifs');
        }

        plan.push(...aiInsights.recommendations.slice(0, 3));

        plan.push("Consultez un conseiller d'orientation pour un accompagnement personnalisé");

        return plan;
    }

    private translatePattern(pattern: string): string {
        const translations: Record<string, string> = {
            confident: 'confiant et décisif',
            uncertain: 'hésitant et réfléchi',
            impulsive: 'spontané et énergique',
            deliberate: 'méthodique et posé',
            mixed: 'varié et équilibré',
            insufficient_data: "en cours d'analyse",
        };

        return translations[pattern] || pattern;
    }
}
