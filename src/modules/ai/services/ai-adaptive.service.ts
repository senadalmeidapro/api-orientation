import { Injectable, Logger } from '@nestjs/common';
import { RiasecScores, MultiProfileQuestion } from '@common/utils/multi-profile.util';
import { BehavioralIndicatorData } from '@common/utils/behavioral.util';
import { AiClient } from '../ai.client';

export interface AIProfileAnalysis {
    interpretation: string;
    strengths: string[];
    areasForDevelopment: string[];
    careerSuggestions: string[];
}

export interface AIQuestionSuggestion {
    questionIds: number[];
    reasoning: string;
    focusAreas: string[];
}

export interface AIBehavioralInsights {
    summary: string;
    keyObservations: string[];
    psychologicalProfile: string;
    recommendations: string[];
}

type JsonObject = Record<string, unknown>;

const fallbackProfileAnalysis: AIProfileAnalysis = {
    interpretation:
        'Profil en cours de construction. Continuez à répondre pour affiner les résultats.',
    strengths: [],
    areasForDevelopment: [],
    careerSuggestions: [],
};

const fallbackQuestionSuggestion: AIQuestionSuggestion = {
    questionIds: [],
    reasoning: 'Selection automatique basee sur les algorithmes.',
    focusAreas: [],
};

const fallbackBehavioralInsights: AIBehavioralInsights = {
    summary: 'Analyse comportementale en cours.',
    keyObservations: [],
    psychologicalProfile: 'Profil en construction.',
    recommendations: [],
};

@Injectable()
export class AIAdaptiveService {
    private readonly logger = new Logger(AIAdaptiveService.name);

    constructor(private readonly aiClient: AiClient) {}

    private parseJsonObject(raw: string): JsonObject | null {
        try {
            const parsed: unknown = JSON.parse(raw);
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
                ? (parsed as JsonObject)
                : null;
        } catch {
            return null;
        }
    }

    async analyzeIntermediateProfile(
        profile: RiasecScores,
        responsesCount: number,
        batchIndex: number,
    ): Promise<AIProfileAnalysis> {
        const prompt = `Tu es un expert en orientation professionnelle utilisant le modèle RIASEC.

Analyse le profil intermédiaire suivant après ${responsesCount} réponses (lot #${batchIndex}):
${JSON.stringify(profile, null, 2)}

Fournis:
1. Une interprétation du profil actuel
2. Les forces identifiées (2-3 points)
3. Les domaines à explorer davantage (2-3 points)
4. Des suggestions de carrières préliminaires (3-5 options)

Réponds en JSON avec: { interpretation, strengths[], areasForDevelopment[], careerSuggestions[] }`;

        try {
            const response = await this.aiClient.chat(prompt, {
                temperature: 0.7,
                max_tokens: 800,
            });

            const parsed = this.parseJsonObject(response);
            if (!parsed) return fallbackProfileAnalysis;

            return {
                interpretation:
                    typeof parsed.interpretation === 'string'
                        ? parsed.interpretation
                        : fallbackProfileAnalysis.interpretation,
                strengths: Array.isArray(parsed.strengths)
                    ? parsed.strengths.filter((item): item is string => typeof item === 'string')
                    : [],
                areasForDevelopment: Array.isArray(parsed.areasForDevelopment)
                    ? parsed.areasForDevelopment.filter(
                          (item): item is string => typeof item === 'string',
                      )
                    : [],
                careerSuggestions: Array.isArray(parsed.careerSuggestions)
                    ? parsed.careerSuggestions.filter(
                          (item): item is string => typeof item === 'string',
                      )
                    : [],
            };
        } catch {
            return fallbackProfileAnalysis;
        }
    }

    async suggestNextQuestions(
        profile: RiasecScores,
        availableQuestions: MultiProfileQuestion[],
        batchSize: number,
    ): Promise<AIQuestionSuggestion> {
        const questionsContext = availableQuestions.slice(0, 20).map((q) => ({
            id: q.id,
            profiles: q.profiles,
        }));

        const prompt = `Tu es un expert en tests psychométriques adaptatifs.

Profil actuel:
${JSON.stringify(profile, null, 2)}

Questions disponibles (échantillon):
${JSON.stringify(questionsContext, null, 2)}

Suggère ${batchSize} questions qui:
1. Aident à clarifier les profils sous-représentés
2. Équilibrent la couverture des 6 dimensions RIASEC
3. Confirment ou affinent les tendances détectées

Réponds en JSON: { questionIds[], reasoning, focusAreas[] }`;

        try {
            const response = await this.aiClient.chat(prompt, {
                temperature: 0.6,
                max_tokens: 500,
            });

            const parsed = this.parseJsonObject(response);
            if (!parsed) return fallbackQuestionSuggestion;

            const rawQuestionIds = Array.isArray(parsed.questionIds) ? parsed.questionIds : [];
            const validIds = rawQuestionIds
                .filter((id): id is number => typeof id === 'number')
                .filter((id) => availableQuestions.some((q) => q.id === id));

            return {
                questionIds: validIds,
                reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : '',
                focusAreas: Array.isArray(parsed.focusAreas)
                    ? parsed.focusAreas.filter((item): item is string => typeof item === 'string')
                    : [],
            };
        } catch {
            return fallbackQuestionSuggestion;
        }
    }

    async generateBehavioralInsights(
        indicators: BehavioralIndicatorData[],
        profile: RiasecScores,
    ): Promise<AIBehavioralInsights> {
        const indicatorSummary = indicators.reduce(
            (acc, ind) => {
                acc[ind.type] = (acc[ind.type] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>,
        );

        const prompt = `Tu es un psychologue spécialisé en orientation professionnelle.

Profil RIASEC détecté:
${JSON.stringify(profile, null, 2)}

Indicateurs comportementaux observés:
${JSON.stringify(indicatorSummary, null, 2)}

Détails: ${indicators.length} comportements analysés

Génère une analyse psychologique incluant:
1. Un résumé du comportement global durant le test
2. 3-5 observations clés sur la personnalité
3. Un profil psychologique synthétique
4. 3-4 recommandations personnalisées

Réponds en JSON: { summary, keyObservations[], psychologicalProfile, recommendations[] }`;

        try {
            const response = await this.aiClient.chat(prompt, {
                temperature: 0.7,
                max_tokens: 1000,
            });

            const parsed = this.parseJsonObject(response);
            if (!parsed) return fallbackBehavioralInsights;

            return {
                summary:
                    typeof parsed.summary === 'string'
                        ? parsed.summary
                        : fallbackBehavioralInsights.summary,
                keyObservations: Array.isArray(parsed.keyObservations)
                    ? parsed.keyObservations.filter(
                          (item): item is string => typeof item === 'string',
                      )
                    : [],
                psychologicalProfile:
                    typeof parsed.psychologicalProfile === 'string'
                        ? parsed.psychologicalProfile
                        : fallbackBehavioralInsights.psychologicalProfile,
                recommendations: Array.isArray(parsed.recommendations)
                    ? parsed.recommendations.filter(
                          (item): item is string => typeof item === 'string',
                      )
                    : [],
            };
        } catch {
            return fallbackBehavioralInsights;
        }
    }

    async enrichFinalReport(
        baseReport: any,
        behavioralInsights: AIBehavioralInsights,
        profileAnalysis: AIProfileAnalysis,
    ): Promise<any> {
        const prompt = `Tu es un conseiller d'orientation professionnel.

Rapport de base:
${JSON.stringify(baseReport, null, 2)}

Insights comportementaux:
${JSON.stringify(behavioralInsights, null, 2)}

Analyse de profil:
${JSON.stringify(profileAnalysis, null, 2)}

Enrichis ce rapport en:
1. Intégrant les observations comportementales
2. Ajoutant des conseils d'orientation personnalisés
3. Proposant un plan d'action concret
4. Fournissant des ressources adaptées

Réponds en JSON avec la structure enrichie complète.`;

        try {
            const response = await this.aiClient.chat(prompt, {
                temperature: 0.7,
                max_tokens: 1500,
            });

            return JSON.parse(response);
        } catch {
            return {
                ...baseReport,
                behavioralSection: behavioralInsights,
                profileAnalysis,
                enhancedAt: new Date().toISOString(),
            };
        }
    }

    async generatePersonalizedRecommendations(
        profile: RiasecScores,
        behavioralPattern: string,
        userContext?: any,
    ): Promise<string[]> {
        const prompt = `Tu es un conseiller d'orientation.

Profil RIASEC: ${JSON.stringify(profile)}
Comportement dominant: ${behavioralPattern}
Contexte utilisateur: ${JSON.stringify(userContext || {})}

Génère 5-7 recommandations personnalisées d'orientation incluant:
- Formations adaptées
- Domaines professionnels
- Compétences à développer
- Premières étapes concrètes

Réponds avec un array JSON de strings.`;

        try {
            const response = await this.aiClient.chat(prompt, {
                temperature: 0.8,
                max_tokens: 600,
            });

            const parsed: unknown = JSON.parse(response);
            return Array.isArray(parsed)
                ? parsed.filter((item): item is string => typeof item === 'string')
                : [];
        } catch {
            return [
                'Explorez les domaines liés à vos profils dominants.',
                'Recherchez des formations alignées avec vos intérêts.',
                "Consultez un conseiller d'orientation pour un accompagnement personnalisé.",
            ];
        }
    }
}
