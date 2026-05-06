import type { PrismaService } from '../../prisma/prisma.service';
import { Phase2Type } from '@prisma/client';

/**
 * SAMPLE DATA SEEDER
 *
 * Populates the database with:
 * - Training Institutions (schools, universities, training centers)
 * - Training Paths (linking careers to institutions)
 * - Educational Resources (articles, videos, PDFs)
 * - Sample Assessment Flow (User → Session → Assessment → Responses → Results)
 *
 * Respects all relations and referential integrity.
 * Uses realistic generic data suitable for testing.
 */

// ============================================================
// TRAINING INSTITUTIONS
// ============================================================
const trainingInstitutions = [
    {
        name: "Université d'Abomey-Calavi",
        acronym: 'UAC',
        type: 'UNIVERSITE',
        department: 'Littoral',
        city: 'Cotonou',
        address: '01 BP 526, Cotonou',
        phone: '+229 21 30 00 70',
        email: 'contact@uac.bj',
        website: 'https://www.uac.bj',
        coverUrl: '',
    },
    {
        name: 'Institut de Formation Agricole',
        acronym: 'IFA',
        type: 'ECOLE',
        department: 'Zou',
        city: 'Abomey',
        address: 'Abomey-Calavi',
        phone: '+229 21 30 15 50',
        email: 'info@ifa-benin.bj',
        website: null,
        coverUrl: '',
    },
    {
        name: 'Lycée Technique National',
        acronym: 'LTN',
        type: 'LYCEE_TECHNIQUE',
        department: 'Littoral',
        city: 'Cotonou',
        address: 'Cotonou',
        phone: '+229 21 31 25 64',
        email: null,
        website: null,
        coverUrl: '',
    },
    {
        name: "Centre d'Excellence Numérique",
        acronym: 'CEN',
        type: 'CENTRE',
        department: 'Littoral',
        city: 'Cotonou',
        address: 'Quartier des Affaires',
        phone: '+229 21 32 10 01',
        email: 'formation@cen-benin.com',
        website: 'https://www.cen-benin.com',
        coverUrl: '',
    },
    {
        name: 'École Nationale de Santé',
        acronym: 'ENS',
        type: 'ECOLE',
        department: 'Littoral',
        city: 'Cotonou',
        address: 'Cotonou',
        phone: '+229 21 33 45 67',
        email: 'contact@ens-benin.bj',
        website: null,
        coverUrl: '',
    },
    {
        name: 'Institut de Commerce et de Gestion',
        acronym: 'ICG',
        type: 'CENTRE',
        department: 'Littoral',
        city: 'Cotonou',
        address: 'Quartier Administratif',
        phone: '+229 21 34 56 78',
        email: 'info@icg-benin.bj',
        website: 'https://www.icg-benin.bj',
        coverUrl: '',
    },
];

// ============================================================
// EDUCATIONAL RESOURCES
// ============================================================
const resources = [
    {
        title: 'Guide Complet du Développeur Web',
        description: "Tout ce qu'il faut savoir pour démarrer une carrière en développement web",
        content:
            'Couverture complète de HTML, CSS, JavaScript, React, Node.js et frameworks modernes...',
        contentType: 'ARTICLE',
        category: 'NUMERIQUE',
        tags: ['développement', 'web', 'tutoriel', 'débutant'],
        author: 'Tech Academy',
        isPublished: true,
    },
    {
        title: 'Carrières dans le Secteur de la Santé',
        description: 'Découvrez les opportunités et défis dans les métiers de santé',
        content: 'Interviews détaillées avec infirmiers, médecins et professionnels de santé...',
        contentType: 'VIDEO',
        category: 'SANTE',
        tags: ['santé', 'carrière', 'interview', 'vidéo'],
        author: 'Health Ministry',
        isPublished: true,
    },
    {
        title: "L'Entrepreneuriat au Bénin: Guide Complet",
        description: 'Étapes, financement, statuts juridiques et marketing pour entrepreneurs',
        content:
            'Guide pratique couvrant la création, le financement, les obligations légales et stratégies de croissance...',
        contentType: 'ARTICLE',
        category: 'COMMERCE',
        tags: ['entrepreneuriat', 'business', 'création', 'guide'],
        author: 'Business Academy',
        isPublished: true,
    },
    {
        title: 'Formation en Agriculture Moderne',
        description: 'Techniques modernes et durables pour une agriculture productive',
        content:
            'Utilisation de technologies, gestion des cultures, irrigation, sélection des semences...',
        contentType: 'ARTICLE',
        category: 'AGRICULTURE',
        tags: ['agriculture', 'technique', 'durabilité', 'formation'],
        author: 'Agricultural Extension',
        isPublished: true,
    },
    {
        title: 'Devenir Infirmier(e): Parcours et Opportunités',
        description: 'Tout sur la formation et la carrière en soins infirmiers',
        content:
            "Conditions d'accès, durée de formation, perspectives de carrière et évolution professionnelle...",
        contentType: 'ARTICLE',
        category: 'SANTE',
        tags: ['infirmier', 'santé', 'formation', 'carrière'],
        author: 'Nursing Academy',
        isPublished: true,
    },
    {
        title: 'Design Graphique: Commencer Votre Portfolio',
        description: 'Guide pour les jeunes designers créant leur premier portfolio',
        content: 'Portfolio, logiciels, domaines spécialisés, réseau professionnel, freelancing...',
        contentType: 'ARTICLE',
        category: 'NUMERIQUE',
        tags: ['design', 'portfolio', 'créativité', 'freelance'],
        author: 'Design Institute',
        isPublished: true,
    },
    {
        title: 'Sécurité Informatique: Les Bases',
        description: 'Introduction aux concepts fondamentaux de la cybersécurité',
        content:
            'Cryptographie, authentification, pare-feu, tests de pénétration et gestion des risques...',
        contentType: 'ARTICLE',
        category: 'NUMERIQUE',
        tags: ['cybersécurité', 'informatique', 'sécurité', 'technique'],
        author: 'Cyber Institute',
        isPublished: true,
    },
];

// ============================================================
// SAMPLE ASSESSMENT DATA (for testing)
// ============================================================

/**
 * Creates sample assessment flow for testing
 * Includes: User → Session → Assessment → Responses → Results → Recommendations
 */
export async function seedSampleAssessmentData(prisma: PrismaService) {
    console.log('\n📚 Seeding Training Institutions...');

    // --- Create Training Institutions ---
    for (const inst of trainingInstitutions) {
        const existing = await prisma.trainingInstitution.findFirst({
            where: { name: inst.name },
        });

        if (existing) {
            await prisma.trainingInstitution.update({
                where: { id: existing.id },
                data: {
                    acronym: inst.acronym,
                    type: inst.type,
                    department: inst.department,
                    city: inst.city,
                    phone: inst.phone,
                    email: inst.email,
                    website: inst.website,
                    isActive: true,
                },
            });
        } else {
            await prisma.trainingInstitution.create({
                data: {
                    ...inst,
                    isActive: true,
                },
            });
        }
    }
    console.log(`✓ Created ${trainingInstitutions.length} training institutions`);

    // --- Create Institution Translations (French) ---
    const institutions = await prisma.trainingInstitution.findMany();
    const frenchLang = await prisma.language.findUnique({ where: { code: 'fr' } });

    if (frenchLang) {
        for (const inst of institutions.slice(0, 3)) {
            await prisma.trainingInstitutionTranslation.upsert({
                where: {
                    institutionId_languageId: {
                        institutionId: inst.id,
                        languageId: frenchLang.id,
                    },
                },
                update: {
                    name: inst.name,
                    description: `${inst.name} - Institution de formation`,
                },
                create: {
                    institutionId: inst.id,
                    languageId: frenchLang.id,
                    name: inst.name,
                    description: `${inst.name} - Institution de formation`,
                },
            });
        }
    }
    console.log('✓ Institution translations created');

    // --- Create Educational Resources ---
    console.log('📖 Seeding Educational Resources...');

    for (const res of resources) {
        const existingRes = await prisma.resource.findFirst({
            where: { title: res.title },
        });

        if (existingRes) {
            await prisma.resource.update({
                where: { id: existingRes.id },
                data: {
                    description: res.description,
                    contentType: res.contentType,
                    category: res.category,
                    tags: res.tags,
                    author: res.author,
                    isPublished: res.isPublished,
                    publishedAt: res.isPublished ? new Date() : null,
                },
            });
        } else {
            await prisma.resource.create({
                data: {
                    ...res,
                    publishedAt: res.isPublished ? new Date() : null,
                },
            });
        }
    }
    console.log(`✓ Created ${resources.length} educational resources`);

    // --- Create Training Paths (linking careers to institutions) ---
    console.log('📚 Seeding Training Paths...');

    const careers = await prisma.career.findMany({ take: 4 });
    const firstInstitution = institutions[0];
    const secondInstitution = institutions[1];

    for (let i = 0; i < careers.length; i++) {
        const career = careers[i];
        const institution = i % 2 === 0 ? firstInstitution : secondInstitution;

        if (career && institution) {
            await prisma.trainingPath.create({
                data: {
                    name: `Formation ${career.name}`,
                    description: `Programme de formation spécialisé en ${career.name}`,
                    level: 'Bac+2/3',
                    durationMonths: 24,
                    costMin: 100000,
                    costMax: 300000,
                    careerId: career.id,
                    institutionId: institution.id,
                    isActive: true,
                },
            });
        }
    }
    console.log(`✓ Created training paths for ${Math.min(careers.length, 4)} careers`);

    // --- Create Sample Assessment Flow ---
    console.log('👤 Seeding Sample Assessment Flow...');

    // Create sample user
    const user = await prisma.user.upsert({
        where: { email: 'sample.user@example.com' },
        update: { status: 'ACTIVE' },
        create: {
            email: 'sample.user@example.com',
            firstName: 'Marie',
            lastName: 'Akoèdo',
            displayName: 'Marie A.',
            role: 'USER',
            status: 'ACTIVE',
            emailVerifiedAt: new Date(),
        },
    });
    console.log(`✓ Sample user created: ${user.email}`);

    // Create session
    const session = await prisma.session.upsert({
        where: { id: 'session_sample_v1' },
        update: { isActive: true },
        create: {
            id: 'session_sample_v1',
            userId: user.id,
            sessionToken: `token_sample_${Date.now()}`,
            sessionHash: `hash_sample_${Date.now()}`,
            isActive: true,
            isCurrent: true,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            totalXp: 150,
            level: 2,
        },
    });
    console.log(`✓ Session created: ${session.id}`);

    // Get test version
    const testVersion = await prisma.testVersion.findUnique({
        where: { code: 'v1' },
    });

    if (!testVersion) {
        console.log('⚠️  Test version not found. Skipping assessment creation.');
        return;
    }

    // Create assessment
    const assessment = await prisma.assessment.upsert({
        where: { id: 'assessment_sample_v1' },
        update: { status: 'COMPLETED' },
        create: {
            id: 'assessment_sample_v1',
            sessionId: session.id,
            testVersionId: testVersion.id,
            type: 'FULL',
            depth: 10,
            status: 'COMPLETED',
            currentPhase: 'PHASE2',
            currentSection: null,
            currentStepIndex: 0,
            batchSize: 5,
            currentBatch: 2,
            completionPercentage: 100,
            startedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
            completedAt: new Date(),
            adaptiveState: {
                probabilities: {
                    R: 0.15,
                    I: 0.25,
                    A: 0.2,
                    S: 0.15,
                    E: 0.1,
                    C: 0.15,
                },
                askedQuestions: [],
            },
        },
    });
    console.log(`✓ Assessment created: ${assessment.id}`);

    // Get some Phase 1 questions and create responses
    const phase1Questions = await prisma.phase1Question.findMany({
        where: { testVersionId: testVersion.id },
        take: 12,
    });

    for (let i = 0; i < phase1Questions.length; i++) {
        const question = phase1Questions[i];
        if (question) {
            await prisma.phase1Response.upsert({
                where: {
                    assessmentId_questionId: {
                        assessmentId: assessment.id,
                        questionId: question.id,
                    },
                },
                update: {
                    responseValue: i % 2,
                },
                create: {
                    id: `phase1_resp_sample_${i}`,
                    assessmentId: assessment.id,
                    questionId: question.id,
                    responseValue: i % 2,
                    responseTimeMs: 3000 + i * 500,
                    timeTakenMs: 3000 + i * 500,
                    changeCount: i % 3,
                    metadata: {
                        hesitation: i % 4 === 0,
                    },
                },
            });
        }
    }
    console.log(`✓ Created ${phase1Questions.length} Phase 1 responses`);

    // Create behavioral indicators from Phase 1 responses
    const phase1Responses = await prisma.phase1Response.findMany({
        where: { assessmentId: assessment.id },
        take: 4,
    });

    for (let i = 0; i < phase1Responses.length; i++) {
        const response = phase1Responses[i];
        if (response) {
            await prisma.behavioralIndicator.upsert({
                where: {
                    id: `behavior_sample_${i}`,
                },
                update: {},
                create: {
                    id: `behavior_sample_${i}`,
                    assessmentId: assessment.id,
                    responseId: response.id,
                    indicatorType:
                        i % 3 === 0 ? 'hesitation' : i % 3 === 1 ? 'change' : 'consistent',
                    timeTakenMs: 3000 + i * 500,
                    changeCount: i % 2,
                    metadata: {
                        pattern: 'normal',
                    },
                },
            });
        }
    }
    console.log(`✓ Created behavioral indicators`);

    // Get Phase 2 Occupations questions
    const phase2Occupations = await prisma.phase2Question.findMany({
        where: {
            testVersionId: testVersion.id,
            phase2Type: Phase2Type.OCCUPATIONS,
        },
        take: 6,
    });

    for (let i = 0; i < phase2Occupations.length; i++) {
        const question = phase2Occupations[i];
        if (question) {
            await prisma.phase2Response.upsert({
                where: {
                    assessmentId_questionId: {
                        assessmentId: assessment.id,
                        questionId: question.id,
                    },
                },
                update: {
                    responseValue: i % 2,
                },
                create: {
                    id: `phase2_occ_resp_sample_${i}`,
                    assessmentId: assessment.id,
                    questionId: question.id,
                    phase2Type: Phase2Type.OCCUPATIONS,
                    responseValue: i % 2,
                    responseTimeMs: 4000 + i * 600,
                    timeTakenMs: 4000 + i * 600,
                    changeCount: 0,
                },
            });
        }
    }
    console.log(`✓ Created Phase 2 Occupations responses`);

    // Get Phase 2 Aptitudes questions
    const phase2Aptitudes = await prisma.phase2Question.findMany({
        where: {
            testVersionId: testVersion.id,
            phase2Type: Phase2Type.APTITUDES,
        },
        take: 6,
    });

    for (let i = 0; i < phase2Aptitudes.length; i++) {
        const question = phase2Aptitudes[i];
        if (question) {
            await prisma.phase2Response.upsert({
                where: {
                    assessmentId_questionId: {
                        assessmentId: assessment.id,
                        questionId: question.id,
                    },
                },
                update: {
                    responseValue: (i % 3) + 1, // 1-3 scale for aptitudes
                },
                create: {
                    id: `phase2_apt_resp_sample_${i}`,
                    assessmentId: assessment.id,
                    questionId: question.id,
                    phase2Type: Phase2Type.APTITUDES,
                    responseValue: (i % 3) + 1,
                    responseTimeMs: 3000 + i * 700,
                    timeTakenMs: 3000 + i * 700,
                    changeCount: i % 2,
                },
            });
        }
    }
    console.log(`✓ Created Phase 2 Aptitudes responses`);

    // Create assessment result
    const result = await prisma.assessmentResult.upsert({
        where: { assessmentId: assessment.id },
        update: {
            profileStrength: 'FORT',
        },
        create: {
            id: `result_sample_v1`,
            assessmentId: assessment.id,
            phase1Code: 'IAS',
            phase2Code: 'IAE',
            phase1Scores: {
                R: 12,
                I: 18,
                A: 15,
                S: 10,
                E: 8,
                C: 10,
            },
            phase2Scores: {
                R: 25,
                I: 35,
                A: 30,
                S: 20,
                E: 15,
                C: 20,
            },
            consistencyScore: 0.82,
            consistencyLevel: 'FORTE',
            differentiationScore: 0.72,
            profileStrength: 'FORT',
            insights: [
                "Vous montrez une forte affinité pour l'analyse et l'investigation",
                "La créativité et l'expression sont des atouts importants",
                "Moins d'intérêt pour les rôles purement conventionnels",
            ],
            strengths: ['Pensée analytique', 'Créativité', 'Curiosité intellectuelle'],
            weaknesses: ['Préférence modérée pour le travail manuel', 'Leadership moins développé'],
        },
    });
    console.log(`✓ Assessment result created`);

    // Create career recommendations
    const topCareers = await prisma.career.findMany({
        where: { isActive: true },
        take: 3,
    });

    for (let i = 0; i < topCareers.length; i++) {
        const career = topCareers[i];
        if (career) {
            await prisma.assessmentCareerRecommendation.upsert({
                where: {
                    resultId_careerId: {
                        resultId: result.id,
                        careerId: career.id,
                    },
                },
                update: {
                    matchScore: 85 - i * 15,
                    rankPosition: i + 1,
                },
                create: {
                    id: `rec_sample_${i}`,
                    resultId: result.id,
                    careerId: career.id,
                    matchScore: 85 - i * 15,
                    rankPosition: i + 1,
                    savedForLater: false,
                },
            });
        }
    }
    console.log(`✓ Created ${topCareers.length} career recommendations`);

    // Create treasure map
    await prisma.treasureMap.upsert({
        where: { assessmentId: assessment.id },
        update: {},
        create: {
            id: `treasure_map_sample_v1`,
            assessmentId: assessment.id,
            shareToken: `share_${Date.now()}`,
            mapData: {
                riasecProfile: 'IAS',
                phase1Code: 'IAS',
                phase2Code: 'IAE',
                scores: {
                    R: 12,
                    I: 18,
                    A: 15,
                    S: 10,
                    E: 8,
                    C: 10,
                },
                topCareers: topCareers.slice(0, 3).map((c) => c.name),
                strengths: ['Pensée analytique', 'Créativité', 'Curiosité intellectuelle'],
                nextSteps: [
                    'Explorez les carrières recommandées en détail',
                    'Consultez les instituts de formation proposés',
                    'Planifiez votre parcours de formation',
                    'Connectez-vous avec des professionnels du domaine',
                ],
            },
            viewCount: 0,
            downloadCount: 0,
        },
    });
    console.log('✓ Treasure map created');

    // Create XP history
    await prisma.xPHistory.createMany({
        data: [
            {
                id: `xp_sample_${1}`,
                sessionId: session.id,
                amount: 100,
                reason: 'phase1_completion',
                assessmentId: assessment.id,
            },
            {
                id: `xp_sample_${2}`,
                sessionId: session.id,
                amount: 50,
                reason: 'phase2_completion',
                assessmentId: assessment.id,
            },
        ],
        skipDuplicates: true,
    });
    console.log('✓ XP history created');

    // Unlock badge
    const badge = await prisma.badge.findFirst();
    if (badge) {
        await prisma.sessionBadge.upsert({
            where: {
                sessionId_badgeId: {
                    sessionId: session.id,
                    badgeId: badge.id,
                },
            },
            update: {},
            create: {
                id: `session_badge_sample_${1}`,
                sessionId: session.id,
                badgeId: badge.id,
                unlockedAt: new Date(),
            },
        });
        console.log('✓ Badge unlocked');
    }

    console.log('\n✅ Sample assessment data seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`  - Training Institutions: ${institutions.length}`);
    console.log(`  - Resources: ${resources.length}`);
    console.log('  - Sample User: 1');
    console.log('  - Sample Session: 1');
    console.log('  - Sample Assessment: 1');
    console.log(`  - Phase 1 Responses: ${phase1Questions.length}`);
    console.log(`  - Phase 2 Occupations Responses: ${phase2Occupations.length}`);
    console.log(`  - Phase 2 Aptitudes Responses: ${phase2Aptitudes.length}`);
    console.log('  - Career Recommendations: 3');
    console.log('\n💡 Test Data:');
    console.log(`  - User Email: ${user.email}`);
    console.log(`  - Session ID: ${session.id}`);
    console.log(`  - Assessment ID: ${assessment.id}`);
    console.log(`  - Treasure Map Share Token: Available in results`);
}
