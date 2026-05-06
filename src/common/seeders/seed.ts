import {
    BadgeRarity,
    CareerCategory,
    Label,
    Phase2Type,
    type Prisma,
    type RiasecType,
} from '@prisma/client';
import 'dotenv/config';
import { PrismaService } from '../../prisma/prisma.service';
import { seedQuestionProfiles } from './seed-question-profiles';
import { ConfigService } from '../config/config.service';
import { seedEnhancedData } from './seed-enhanced-data';
import { seedSampleAssessmentData } from './seed-sample-data';

const config = new ConfigService();
const prisma = new PrismaService(config);

// ============================================================
// 1. TYPES RIASEC
// ============================================================
const riasecTypes: { id: RiasecType; name: string; slogan: string; colorHex: string }[] = [
    { id: 'R', name: 'Réaliste', slogan: 'Je fais, je construis', colorHex: '#2E7D32' },
    { id: 'I', name: 'Investigateur', slogan: 'Je comprends, j’analyse', colorHex: '#1565C0' },
    { id: 'A', name: 'Artistique', slogan: 'Je crée, j’exprime', colorHex: '#6A1B9A' },
    { id: 'S', name: 'Social', slogan: 'J’aide, je partage', colorHex: '#EF6C00' },
    { id: 'E', name: 'Entreprenant', slogan: 'Je convaincs, je dirige', colorHex: '#C62828' },
    { id: 'C', name: 'Conventionnel', slogan: 'J’organise, je précise', colorHex: '#455A64' },
];

// ============================================================
// 2. PHASE 1 – QUESTIONS D’AMORCE (version courte, style Tinder)
// ============================================================
const phase1Questions: Record<RiasecType, string[]> = {
    R: [
        'Travailler dans un champ, cultiver du maïs, du niébé ou du coton',
        'Réparer un vélo, une moto « zemidjan » ou un poste téléviseur',
        'Construire ou fabriquer des objets en bois ou en métal',
        'Conduire un véhicule (taxi, moto, camion, engin)',
        'S’occuper d’animaux (volailles, bovins, ovins, poissons)',
        'Utiliser des outils (marteau, tournevis, pince, scie, machine)',
        'Faire des travaux de maçonnerie, de peinture ou de rénovation',
        'Installer ou réparer des installations électriques ou des panneaux solaires',
        'Travailler avec des machines agricoles (motoculteur, tracteur)',
        'Lire et comprendre des plans pour construire une maison ou un réseau',
    ],
    I: [
        'Lire des livres, des revues ou des articles pour apprendre de nouvelles choses',
        'Résoudre des problèmes de maths, de logique ou des énigmes',
        'Comprendre comment fonctionnent les nouvelles technologies',
        'Observer la nature, les plantes, les animaux, les étoiles',
        'Faire des recherches sur l’histoire du Bénin ou d’autres sujets',
        'Analyser des données, faire des calculs, des statistiques',
        'Programmer un ordinateur, créer un site web ou une application mobile',
        'Suivre l’actualité scientifique et technologique',
        'Diagnostiquer une maladie (humaine, animale ou végétale)',
        'Mener des expériences pour trouver des solutions nouvelles',
    ],
    A: [
        'Dessiner, peindre, faire de la sculpture',
        'Écrire des histoires, de la poésie, des articles, un blog',
        'Jouer d’un instrument de musique',
        'Chanter, danser (traditionnel ou moderne)',
        'Participer à des événements culturels (festivals, théâtre, conte)',
        'Photographier ou filmer des événements',
        'Décorer un espace (maison, boutique, salle de fête)',
        'Créer des vêtements, des bijoux, des tissus',
        'Imaginer des concepts pour des vidéos ou des publicités',
        'Apprendre des langues étrangères',
    ],
    S: [
        'Aider les membres de ma famille, mes voisins ou des inconnus',
        'Enseigner, expliquer des choses à plus jeune que soi ou à des adultes',
        'Écouter les gens, les conseiller sur leurs problèmes personnels',
        'Travailler en équipe, collaborer avec d’autres pour un projet commun',
        'M’occuper d’enfants, de personnes âgées ou de malades',
        'Faire du bénévolat dans une association, une ONG ou une organisation communautaire',
        'Animer un groupe (scouts, jeunes du quartier, association)',
        'Accueillir, renseigner, orienter les gens',
        'Participer à des actions de développement communautaire',
        'Aider à résoudre des conflits entre personnes (médiation)',
    ],
    E: [
        'Organiser un événement (mariage, cérémonie, fête, concert)',
        'Vendre des produits au marché, en boutique, en ligne',
        'Diriger une équipe, être chef de projet, manager',
        'Négocier, convaincre, argumenter pour obtenir un accord',
        'Lancer ma propre activité, mon entreprise ou ma start‑up',
        'Participer à des débats, donner mon opinion en public',
        'Prendre des décisions importantes, même difficiles',
        'Faire du réseautage, rencontrer des personnes influentes',
        'Développer des stratégies pour gagner plus de clients',
        'M’investir dans la politique, une association étudiante ou une cause',
    ],
    C: [
        'Classer, ranger, organiser des dossiers, des documents ou des informations',
        'Tenir des comptes, gérer un budget',
        'Respecter des procédures, des règles précises, des consignes',
        'Travailler avec des chiffres, faire de la comptabilité',
        'Faire de la saisie, du traitement de texte, de la mise en page',
        'Planifier des activités, tenir un agenda, respecter les délais',
        'Vérifier des informations, des détails, trouver des erreurs',
        'Utiliser des logiciels de gestion (comptabilité, paie, stock)',
        'Aimer les tâches régulières, la stabilité, la prévisibilité',
        'Suivre des instructions claires à la lettre',
    ],
};

// ============================================================
// 3. PHASE 2 – OCCUPATIONS (métiers)
// ============================================================
const phase2Occupations: Record<RiasecType, string[]> = {
    R: [
        'Mécanicien/enne auto/moto (garagiste)',
        'Électricien/ne (bâtiment, installation, panneaux solaires)',
        'Agriculteur/trice moderne / Éleveur/euse',
        'Charpentier/ère / Menuisier/ère',
        'Conducteur/trice (Zémidjan, taxi, camion, engins)',
        'Cuisinier/ère (restauration, traiteur, food truck)',
        'Technicien Fibre Optique (TIT - EMN)',
        'Technicien en Maintenance des Équipements Électroniques (TMEE - EMN)',
        'Maçon / Plombier / Constructeur (BTP)',
        'Pisciculteur / Agriculteur utilisant des technologies',
    ],
    I: [
        'Biologiste / Chercheur/euse en agronomie',
        'Médecin / Sage-femme / Infirmier/ère',
        'Analyste Cybersécurité / Expert en sécurité informatique',
        'Ingénieur/e (génie civil, agronome, informatique, télécoms)',
        'Géologue (recherche de pétrole, d’eau, de minerais)',
        'Pharmacien/ne',
        'Data Analyst / Data Scientist / Spécialiste IA',
        'Économiste / Statisticien/ne',
        'Technicien/ne de laboratoire',
        'Développeur/euse d’applications mobiles',
    ],
    A: [
        'Écrivain/e / Conteur/euse / Poète',
        'Musicien/ne / Compositeur/trice / DJ',
        'Acteur/trice / Metteur/euse en scène / Comédien/ne',
        'Architecte / Designer d’intérieur / Paysagiste',
        'Photographe / Réalisateur/trice',
        'Graphiste / Web‑designer / Motion designer / UI/UX',
        'Styliste / Créateur/trice de mode',
        'Journaliste / Critique culturel/le',
        'Artisan/e d’art (bronze, tissage, poterie, vannerie)',
        'Publicitaire / Community manager / Social media manager',
    ],
    S: [
        'Enseignant/e / Professeur/e',
        'Infirmier/ère / Aide‑soignant/e / Sage‑femme',
        'Médecin généraliste / Pédiatre / Gynécologue',
        'Psychologue clinicien/ne / Conseiller/ère',
        'Assistant/e social/e / Éducateur/trice spécialisé/e',
        'Conseiller/ère d’orientation scolaire et professionnelle',
        'Animateur/trice socioculturel/le',
        'Agent/e de développement communautaire (ONG)',
        'Responsable RH',
        'Personnel d’accueil / Hôte(sse)',
    ],
    E: [
        'Chef d’entreprise / Entrepreneur/e',
        'Directeur/trice commercial/e / Agent commercial',
        'Avocat/e / Notaire / Huissier/ère',
        'Promoteur/trice de solutions numériques agricoles',
        'Responsable marketing / Chef de produit',
        'Homme/Femme politique / Élu/e local/e',
        'Gérant/e de magasin / Manager',
        'Conseiller/ère en gestion / Consultant/e',
        'Promoteur/trice immobilier/ère',
        'Courtier/ère en assurances',
    ],
    C: [
        'Comptable / Aide‑comptable / Chef comptable',
        'Assistant/e de direction / Secrétaire',
        'Gestionnaire de paie / Agent RH (administration)',
        'Archiviste / Documentaliste / Bibliothécaire',
        'Contrôleur/euse de gestion / Auditeur/trice interne',
        'Employé/e de banque / Caissier/ère',
        'Technicien/ne juridique / Greffier/ère',
        'Gestionnaire administratif/ve',
        'Opérateur/trice de saisie / Data entry',
        'Agent/e des impôts / Douanes / Trésor',
    ],
};

// ============================================================
// 4. PHASE 2 – APTITUDES (échelle 1-3)
// ============================================================
const phase2Aptitudes: Record<RiasecType, string[]> = {
    R: [
        'Dextérité manuelle',
        'Utiliser des outils',
        'Comprendre le fonctionnement mécanique',
        'Bonne forme / endurance physique',
        'Lire et comprendre des plans',
        'Coordonner gestes et vue',
        'Travailler avec des animaux/plantes',
        'Conduire des véhicules',
        'Faire des réparations',
        'Souci du détail dans un travail manuel',
    ],
    I: [
        'Capacité d’analyse',
        'Capacité de synthèse',
        'Résoudre des problèmes abstraits',
        'Esprit logique et critique',
        'Rigueur intellectuelle',
        'Compréhension des maths/sciences',
        'Curiosité intellectuelle',
        'Faire des recherches et collecter des données',
        'Se concentrer longtemps',
        'Travailler en laboratoire',
    ],
    A: [
        'Sens esthétique',
        'Créativité, imagination',
        'Dessiner, peindre, créer',
        'Écrire, rédiger',
        'Jouer d’un instrument, chanter, danser',
        'Exprimer ses émotions',
        'Idées originales',
        'Apprendre des langues',
        'Photographier, filmer, monter',
        'Accepter la critique et progresser',
    ],
    S: [
        'Facilité à communiquer',
        'Écouter activement',
        'Travailler en équipe',
        'Empathie',
        'Enseigner, expliquer, former',
        'Accueillir, aider',
        'Sens de l’observation psychologique',
        'Patience et tolérance',
        'Négocier et résoudre des conflits',
        'Animer un groupe',
    ],
    E: [
        'Leadership',
        'Persuasion, éloquence',
        'Prendre des décisions rapidement',
        'Organisation et planification',
        'Prise de risque et audace',
        'Esprit de compétition',
        'Vendre un produit/service',
        'Détermination et persévérance',
        'Gérer un budget, sens des affaires',
        'Être à l’aise en public',
    ],
    C: [
        'Rigueur et précision',
        'Organisation et rangement',
        'Tenir des comptes',
        'Respecter des procédures',
        'Efficacité administrative',
        'Accepter la routine',
        'Maîtrise des outils bureautiques',
        'Classer, archiver',
        'Vérifier des données',
        'Ponctualité et respect des délais',
    ],
};

// ============================================================
// 5. PHASE 2 – PERSONNALITÉ (booléen)
// ============================================================
const phase2Personality: Record<RiasecType, string[]> = {
    R: [
        'J’aime les choses concrètes et pratiques',
        'Je suis plutôt réservé(e)',
        'Je suis persévérant(e) et stable',
        'Je suis direct(e) et franc(he)',
        'Je prends soin de mes outils et affaires',
        'Je préfère agir plutôt que discuter',
        'Je suis endurant(e) physiquement',
        'Je suis patient(e) et minutieux(se)',
        'Je suis attaché(e) aux méthodes traditionnelles',
        'Je suis indépendant(e) et j’aime travailler seul(e)',
    ],
    I: [
        'Je suis très curieux(se) et j’aime apprendre',
        'J’aime analyser en profondeur',
        'Je suis calme et réfléchi(e)',
        'Je suis méthodique et rigoureux(se)',
        'J’ai un esprit critique',
        'J’aime résoudre des problèmes complexes',
        'Je tiens à ma liberté de penser',
        'Je suis logique et rationnel(le)',
        'Je peux me concentrer longtemps',
        'Je suis ouvert(e) d’esprit',
    ],
    A: [
        'Je suis créatif(ve), imaginatif(ve)',
        'Je suis sensible et j’exprime mes émotions',
        'J’ai besoin de liberté et d’indépendance',
        'Je suis spontané(e) et expressif(ve)',
        'Je suis original(e) et j’aime me démarquer',
        'Je n’aime pas la routine',
        'Je suis intuitif(ve)',
        'Je suis passionné(e)',
        'Je peux être désordonné(e)',
        'J’ai tendance à idéaliser',
    ],
    S: [
        'Je suis empathique',
        'Je suis coopératif(ve)',
        'Je suis amical(e) et chaleureux(se)',
        'Je suis serviable et généreux(se)',
        'Je suis compréhensif(ve)',
        'Je communique clairement',
        'On peut compter sur moi',
        'Je comprends vite les gens',
        'Je préfère la discussion au conflit',
        'Je suis souple et conciliant(e)',
    ],
    E: [
        'Je suis ambitieux(se)',
        'Je suis énergique et dynamique',
        'Je suis optimiste et confiant(e)',
        'Je suis persuasif(ve)',
        'Je suis sociable',
        'J’aime les défis',
        'Je suis déterminé(e)',
        'J’aime prendre des initiatives',
        'Je suis débrouillard(e)',
        'J’aime diriger',
    ],
    C: [
        'Je suis organisé(e) et méthodique',
        'Je suis digne de confiance',
        'J’aime que tout soit clair et rangé',
        'Je suis précis(e) et minutieux(se)',
        'Je suis ponctuel(le)',
        'Je respecte les règles',
        'Je suis efficace et ordonné(e)',
        'Je suis consciencieux(se)',
        'Je suis discret(ète)',
        'J’aime des instructions précises',
    ],
};

// ============================================================
// 6. MÉTIERS – LISTE EXHAUSTIVE (contexte béninois)
// ============================================================
type CareerSeed = {
    name: string;
    description: string;
    category: CareerCategory;
    riasecCodes: RiasecType[];
    localDemand?: number; // 1-5
    formationLevel?: string; // ex: 'CAP', 'BTS', 'Licence', 'EMN', 'Formation courte'
};

const careers: CareerSeed[] = [
    // NUMÉRIQUE (plusieurs métiers)
    {
        name: 'Technicien Fibre Optique',
        description: 'Installation et maintenance de réseaux fibre optique.',
        category: CareerCategory.NUMERIQUE,
        riasecCodes: ['R', 'I'],
        localDemand: 5,
        formationLevel: 'EMN (TIT)',
    },
    {
        name: 'Technicien en Maintenance Électronique',
        description: 'Entretien des équipements électroniques.',
        category: CareerCategory.NUMERIQUE,
        riasecCodes: ['R', 'I'],
        localDemand: 4,
        formationLevel: 'EMN (TMEE)',
    },
    {
        name: 'Développeur d’applications',
        description: 'Création d’applications web et mobiles.',
        category: CareerCategory.NUMERIQUE,
        riasecCodes: ['I', 'A'],
        localDemand: 5,
        formationLevel: 'EMN / BTS',
    },
    {
        name: 'Développeur Web',
        description: 'Conception de sites et applications web.',
        category: CareerCategory.NUMERIQUE,
        riasecCodes: ['I', 'A'],
        localDemand: 5,
        formationLevel: 'EMN / BTS',
    },
    {
        name: 'Développeur Mobile',
        description: 'Création d’applications Android/iOS.',
        category: CareerCategory.NUMERIQUE,
        riasecCodes: ['I', 'A'],
        localDemand: 4,
        formationLevel: 'EMN / BTS',
    },
    {
        name: 'Analyste Cybersécurité',
        description: 'Protection des systèmes informatiques.',
        category: CareerCategory.NUMERIQUE,
        riasecCodes: ['I', 'C'],
        localDemand: 5,
        formationLevel: 'EMN / Master',
    },
    {
        name: 'Technicien Cybersécurité',
        description: 'Surveillance et sécurisation des systèmes.',
        category: CareerCategory.NUMERIQUE,
        riasecCodes: ['I', 'C'],
        localDemand: 4,
        formationLevel: 'EMN',
    },
    {
        name: 'Data Analyst',
        description: 'Analyse de données pour prise de décision.',
        category: CareerCategory.NUMERIQUE,
        riasecCodes: ['I', 'C'],
        localDemand: 4,
        formationLevel: 'BTS / Licence',
    },
    {
        name: 'UI/UX Designer',
        description: 'Conception d’interfaces et d’expériences utilisateur.',
        category: CareerCategory.NUMERIQUE,
        riasecCodes: ['A', 'I'],
        localDemand: 3,
        formationLevel: 'EMN',
    },
    {
        name: 'Graphiste / Web Designer',
        description: 'Création visuelle et identité graphique.',
        category: CareerCategory.NUMERIQUE,
        riasecCodes: ['A', 'I'],
        localDemand: 4,
        formationLevel: 'EMN',
    },
    {
        name: 'Community Manager',
        description: 'Animation de communautés et réseaux sociaux.',
        category: CareerCategory.NUMERIQUE,
        riasecCodes: ['A', 'E', 'S'],
        localDemand: 4,
        formationLevel: 'EMN',
    },
    {
        name: 'Spécialiste Marketing Digital',
        description: 'Campagnes digitales et acquisition clients.',
        category: CareerCategory.COMMERCE,
        riasecCodes: ['E', 'C'],
        localDemand: 3,
        formationLevel: 'EMN / BTS',
    },
    {
        name: 'Technicien Réseaux et Systèmes',
        description: 'Installation et administration des réseaux.',
        category: CareerCategory.NUMERIQUE,
        riasecCodes: ['R', 'I', 'C'],
        localDemand: 4,
        formationLevel: 'EMN',
    },
    {
        name: 'Administrateur Systèmes',
        description: 'Gestion et sécurité des serveurs.',
        category: CareerCategory.NUMERIQUE,
        riasecCodes: ['I', 'C'],
        localDemand: 3,
        formationLevel: 'Licence / Master',
    },
    {
        name: 'Technicien Solaire',
        description: 'Installation de solutions photovoltaïques.',
        category: CareerCategory.NUMERIQUE,
        riasecCodes: ['R', 'I'],
        localDemand: 4,
        formationLevel: 'CAP / EMN',
    },
    {
        name: 'Spécialiste Intelligence Artificielle',
        description: 'Développement de modèles d’IA pour l’agriculture et la santé.',
        category: CareerCategory.NUMERIQUE,
        riasecCodes: ['I', 'A'],
        localDemand: 2,
        formationLevel: 'Master',
    },

    // AGRICULTURE ET AGRO-INDUSTRIE
    {
        name: 'Agriculteur moderne',
        description: 'Production agricole avec méthodes modernes.',
        category: CareerCategory.AGRICULTURE,
        riasecCodes: ['R', 'I'],
        localDemand: 5,
        formationLevel: 'Formation agricole / Projets',
    },
    {
        name: 'Pisciculteur',
        description: 'Élevage de poissons.',
        category: CareerCategory.AGRICULTURE,
        riasecCodes: ['R'],
        localDemand: 4,
        formationLevel: 'Formation courte',
    },
    {
        name: 'Agro‑transformateur',
        description: 'Transformation de produits agricoles (farine, jus, etc.).',
        category: CareerCategory.AGRICULTURE,
        riasecCodes: ['R', 'C'],
        localDemand: 4,
        formationLevel: 'CAP / BTS',
    },
    {
        name: 'Conseiller Agricole',
        description: 'Appui technique aux exploitations.',
        category: CareerCategory.AGRICULTURE,
        riasecCodes: ['S', 'I'],
        localDemand: 4,
        formationLevel: 'BTS / Licence',
    },
    {
        name: 'Technicien Irrigation',
        description: 'Mise en place de systèmes d’irrigation.',
        category: CareerCategory.AGRICULTURE,
        riasecCodes: ['R', 'I'],
        localDemand: 3,
        formationLevel: 'CAP / BTS',
    },
    {
        name: 'Opérateur Drone Agricole',
        description: 'Surveillance et cartographie des parcelles.',
        category: CareerCategory.AGRICULTURE,
        riasecCodes: ['I', 'R'],
        localDemand: 3,
        formationLevel: 'Formation courte',
    },
    {
        name: 'Gestionnaire de Coopérative',
        description: 'Gestion d’unités collectives agricoles.',
        category: CareerCategory.AGRICULTURE,
        riasecCodes: ['E', 'C', 'S'],
        localDemand: 3,
        formationLevel: 'BTS / Licence',
    },
    {
        name: 'Technicien Elevage',
        description: 'Soins et gestion des troupeaux.',
        category: CareerCategory.AGRICULTURE,
        riasecCodes: ['R', 'S'],
        localDemand: 4,
        formationLevel: 'CAP / BTS',
    },

    // ARTISANAT
    {
        name: 'Artisan Bronze',
        description: 'Sculpture et fonte d’art en bronze.',
        category: CareerCategory.ARTISANAT,
        riasecCodes: ['A', 'R'],
        localDemand: 3,
        formationLevel: 'Apprentissage',
    },
    {
        name: 'Tisserand',
        description: 'Tissage et fabrication de tissus.',
        category: CareerCategory.ARTISANAT,
        riasecCodes: ['A', 'R'],
        localDemand: 3,
        formationLevel: 'Apprentissage',
    },
    {
        name: 'Potière/Potier',
        description: 'Création d’objets en terre cuite.',
        category: CareerCategory.ARTISANAT,
        riasecCodes: ['A', 'R'],
        localDemand: 2,
        formationLevel: 'Apprentissage',
    },
    {
        name: 'Vannier',
        description: 'Fabrication d’objets en vannerie.',
        category: CareerCategory.ARTISANAT,
        riasecCodes: ['A', 'R'],
        localDemand: 2,
        formationLevel: 'Apprentissage',
    },
    {
        name: 'Menuisier',
        description: 'Fabrication et pose d’ouvrages en bois.',
        category: CareerCategory.ARTISANAT,
        riasecCodes: ['R'],
        localDemand: 4,
        formationLevel: 'CAP',
    },
    {
        name: 'Plombier',
        description: 'Installation et réparation plomberie.',
        category: CareerCategory.ARTISANAT,
        riasecCodes: ['R', 'C'],
        localDemand: 4,
        formationLevel: 'CAP',
    },
    {
        name: 'Électricien Bâtiment',
        description: 'Installation électrique des bâtiments.',
        category: CareerCategory.ARTISANAT,
        riasecCodes: ['R', 'C'],
        localDemand: 4,
        formationLevel: 'CAP',
    },
    {
        name: 'Mécanicien Moto',
        description: 'Entretien et réparation de motos.',
        category: CareerCategory.ARTISANAT,
        riasecCodes: ['R'],
        localDemand: 5,
        formationLevel: 'CAP',
    },
    {
        name: 'Couturier / Styliste',
        description: 'Confection de vêtements sur mesure.',
        category: CareerCategory.ARTISANAT,
        riasecCodes: ['A', 'R'],
        localDemand: 4,
        formationLevel: 'CAP / Apprentissage',
    },
    {
        name: 'Bijoutier',
        description: 'Fabrication de bijoux.',
        category: CareerCategory.ARTISANAT,
        riasecCodes: ['A', 'R'],
        localDemand: 2,
        formationLevel: 'Apprentissage',
    },

    // SANTÉ
    {
        name: 'Infirmier',
        description: 'Soins et accompagnement des patients.',
        category: CareerCategory.SANTE,
        riasecCodes: ['S', 'I'],
        localDemand: 5,
        formationLevel: 'Bac+3',
    },
    {
        name: 'Sage‑femme',
        description: 'Suivi des grossesses et accouchements.',
        category: CareerCategory.SANTE,
        riasecCodes: ['S', 'I'],
        localDemand: 5,
        formationLevel: 'Bac+3',
    },
    {
        name: 'Médecin généraliste',
        description: 'Diagnostic et traitement des maladies.',
        category: CareerCategory.SANTE,
        riasecCodes: ['I', 'S'],
        localDemand: 4,
        formationLevel: 'Doctorat',
    },
    {
        name: 'Pharmacien',
        description: 'Dispensation et conseil en médicaments.',
        category: CareerCategory.SANTE,
        riasecCodes: ['I', 'C'],
        localDemand: 4,
        formationLevel: 'Doctorat',
    },
    {
        name: 'Technicien de laboratoire',
        description: 'Analyses médicales.',
        category: CareerCategory.SANTE,
        riasecCodes: ['I', 'C'],
        localDemand: 4,
        formationLevel: 'BTS / Licence',
    },
    {
        name: 'Aide‑soignant',
        description: 'Assistance aux patients.',
        category: CareerCategory.SANTE,
        riasecCodes: ['S', 'R'],
        localDemand: 4,
        formationLevel: 'CAP',
    },

    // ÉDUCATION
    {
        name: 'Enseignant primaire',
        description: 'Éducation des enfants.',
        category: CareerCategory.EDUCATION,
        riasecCodes: ['S'],
        localDemand: 5,
        formationLevel: 'Bac+3',
    },
    {
        name: 'Enseignant secondaire',
        description: 'Enseignement dans les collèges et lycées.',
        category: CareerCategory.EDUCATION,
        riasecCodes: ['S', 'I'],
        localDemand: 4,
        formationLevel: 'Licence / Master',
    },
    {
        name: 'Conseiller d’orientation',
        description: 'Accompagnement des jeunes dans leur parcours.',
        category: CareerCategory.EDUCATION,
        riasecCodes: ['S', 'C'],
        localDemand: 3,
        formationLevel: 'Master',
    },
    {
        name: 'Formateur TIC',
        description: 'Formation aux compétences numériques.',
        category: CareerCategory.EDUCATION,
        riasecCodes: ['S', 'I'],
        localDemand: 3,
        formationLevel: 'Licence',
    },
    {
        name: 'Professeur de lycée technique',
        description: 'Enseignement des métiers techniques.',
        category: CareerCategory.EDUCATION,
        riasecCodes: ['S', 'R'],
        localDemand: 3,
        formationLevel: 'Licence',
    },

    // COMMERCE ET ENTREPRENEURIAT
    {
        name: 'Entrepreneur',
        description: 'Création et développement d’activité.',
        category: CareerCategory.COMMERCE,
        riasecCodes: ['E'],
        localDemand: 5,
        formationLevel: 'Expérience / Formation',
    },
    {
        name: 'Commercial',
        description: 'Prospection et vente.',
        category: CareerCategory.COMMERCE,
        riasecCodes: ['E', 'S'],
        localDemand: 5,
        formationLevel: 'BTS / Licence',
    },
    {
        name: 'Commerçant E‑commerce',
        description: 'Vente en ligne de produits locaux.',
        category: CareerCategory.COMMERCE,
        riasecCodes: ['E', 'C'],
        localDemand: 3,
        formationLevel: 'Formation courte',
    },
    {
        name: 'Promoteur de solutions agricoles',
        description: 'Développement de services numériques pour l’agriculture.',
        category: CareerCategory.COMMERCE,
        riasecCodes: ['E', 'I'],
        localDemand: 4,
        formationLevel: 'EMN / BTS',
    },
    {
        name: 'Gérant de magasin',
        description: 'Management d’une boutique.',
        category: CareerCategory.COMMERCE,
        riasecCodes: ['E', 'C'],
        localDemand: 4,
        formationLevel: 'BTS',
    },
    {
        name: 'Courtier en assurances',
        description: 'Placement de contrats d’assurance.',
        category: CareerCategory.COMMERCE,
        riasecCodes: ['E', 'S'],
        localDemand: 3,
        formationLevel: 'BTS',
    },
    {
        name: 'Agent immobilier',
        description: 'Transaction et gestion immobilière.',
        category: CareerCategory.COMMERCE,
        riasecCodes: ['E', 'S'],
        localDemand: 3,
        formationLevel: 'BTS',
    },

    // ADMINISTRATION ET GESTION
    {
        name: 'Comptable',
        description: 'Gestion des comptes.',
        category: CareerCategory.ADMINISTRATION,
        riasecCodes: ['C'],
        localDemand: 5,
        formationLevel: 'BTS / Licence',
    },
    {
        name: 'Assistant administratif',
        description: 'Organisation et gestion administrative.',
        category: CareerCategory.ADMINISTRATION,
        riasecCodes: ['C', 'S'],
        localDemand: 4,
        formationLevel: 'BTS',
    },
    {
        name: 'Gestionnaire de paie',
        description: 'Calcul et traitement des salaires.',
        category: CareerCategory.ADMINISTRATION,
        riasecCodes: ['C', 'E'],
        localDemand: 4,
        formationLevel: 'BTS',
    },
    {
        name: 'Agent des impôts',
        description: 'Gestion fiscale et recouvrement.',
        category: CareerCategory.ADMINISTRATION,
        riasecCodes: ['C'],
        localDemand: 4,
        formationLevel: 'Licence',
    },
    {
        name: 'Agent des douanes',
        description: 'Contrôle aux frontières.',
        category: CareerCategory.ADMINISTRATION,
        riasecCodes: ['C'],
        localDemand: 4,
        formationLevel: 'Licence',
    },
    {
        name: 'Archiviste',
        description: 'Gestion et conservation des documents.',
        category: CareerCategory.ADMINISTRATION,
        riasecCodes: ['C'],
        localDemand: 2,
        formationLevel: 'BTS',
    },
    {
        name: 'Contrôleur de gestion',
        description: 'Suivi budgétaire et analyse.',
        category: CareerCategory.ADMINISTRATION,
        riasecCodes: ['C', 'I'],
        localDemand: 3,
        formationLevel: 'Master',
    },
    {
        name: 'Responsable RH',
        description: 'Gestion des ressources humaines.',
        category: CareerCategory.ADMINISTRATION,
        riasecCodes: ['S', 'C', 'E'],
        localDemand: 4,
        formationLevel: 'Master',
    },
];

// ============================================================
// 7. BADGES DE GAMIFICATION
// ============================================================
type BadgeSeed = {
    code: string;
    name: string;
    description: string;
    emoji: string;
    rarity: BadgeRarity;
    pointsValue: number;
    unlockCondition: Prisma.InputJsonValue;
};

const badges: BadgeSeed[] = [
    {
        code: 'EXPLORATEUR',
        name: 'Explorateur',
        description: 'Tu as commencé ton voyage de découverte !',
        emoji: '🧭',
        rarity: BadgeRarity.COMMON,
        pointsValue: 10,
        unlockCondition: { type: 'phase_started', phase: 1 },
    },
    {
        code: 'AVENTURIER',
        name: 'Aventurier',
        description: 'Tu as terminé la Phase 1 avec brio !',
        emoji: '🗺️',
        rarity: BadgeRarity.COMMON,
        pointsValue: 25,
        unlockCondition: { type: 'phase_completion', phase: 1 },
    },
    {
        code: 'CHERCHEUR',
        name: 'Chercheur',
        description: 'Phase 2 accomplie ! Tu es allé au fond des choses.',
        emoji: '🔍',
        rarity: BadgeRarity.RARE,
        pointsValue: 50,
        unlockCondition: { type: 'phase_completion', phase: 2 },
    },
    {
        code: 'MAITRE_DE_SOI',
        name: 'Maître de soi',
        description: 'Tu as exploré les 3 dimensions de ta personnalité !',
        emoji: '🧘',
        rarity: BadgeRarity.RARE,
        pointsValue: 60,
        unlockCondition: { type: 'sections_completed', sections: 3 },
    },
    {
        code: 'BATISSEUR',
        name: 'Bâtisseur',
        description: 'Profil R dominant : Tu construis le Bénin de demain !',
        emoji: '🏗️',
        rarity: BadgeRarity.EPIC,
        pointsValue: 100,
        unlockCondition: { type: 'dominant_type', riasecType: 'R', minScore: 15 },
    },
    {
        code: 'SAGE',
        name: 'Sage',
        description: 'Profil I dominant : Ta soif de connaissance est inspirante !',
        emoji: '📚',
        rarity: BadgeRarity.EPIC,
        pointsValue: 100,
        unlockCondition: { type: 'dominant_type', riasecType: 'I', minScore: 15 },
    },
    {
        code: 'ARTISTE',
        name: 'Artiste',
        description: 'Profil A dominant : Tu colores le monde de ta créativité !',
        emoji: '🎨',
        rarity: BadgeRarity.EPIC,
        pointsValue: 100,
        unlockCondition: { type: 'dominant_type', riasecType: 'A', minScore: 15 },
    },
    {
        code: 'COEUR_OUVERT',
        name: 'Cœur ouvert',
        description: 'Profil S dominant : Ta générosité fait la différence !',
        emoji: '❤️',
        rarity: BadgeRarity.EPIC,
        pointsValue: 100,
        unlockCondition: { type: 'dominant_type', riasecType: 'S', minScore: 15 },
    },
    {
        code: 'LEADER',
        name: 'Leader',
        description: 'Profil E dominant : Tu es né pour guider les autres !',
        emoji: '👑',
        rarity: BadgeRarity.EPIC,
        pointsValue: 100,
        unlockCondition: { type: 'dominant_type', riasecType: 'E', minScore: 15 },
    },
    {
        code: 'ORGANISATEUR',
        name: 'Organisateur',
        description: 'Profil C dominant : Ta rigueur est un super‑pouvoir !',
        emoji: '📋',
        rarity: BadgeRarity.EPIC,
        pointsValue: 100,
        unlockCondition: { type: 'dominant_type', riasecType: 'C', minScore: 15 },
    },
    {
        code: 'CONSISTANT',
        name: 'Consistant',
        description: 'Ton profil est d’une grande cohérence !',
        emoji: '🎯',
        rarity: BadgeRarity.EPIC,
        pointsValue: 80,
        unlockCondition: { type: 'consistency_score', minScore: 3 },
    },
    {
        code: 'UNIQUE',
        name: 'Unique',
        description: 'Ton profil est original et sort des sentiers battus !',
        emoji: '🦄',
        rarity: BadgeRarity.LEGENDARY,
        pointsValue: 120,
        unlockCondition: { type: 'consistency_score', maxScore: 1 },
    },
    {
        code: 'DETERMINE',
        name: 'Déterminé',
        description: 'Profil très différencié : tu as des préférences marquées !',
        emoji: '💪',
        rarity: BadgeRarity.EPIC,
        pointsValue: 90,
        unlockCondition: { type: 'differentiation_score', minScore: 12 },
    },
    {
        code: 'PARTAGE',
        name: 'Partage',
        description: 'Tu as partagé ta Carte au Trésor avec le monde !',
        emoji: '📢',
        rarity: BadgeRarity.COMMON,
        pointsValue: 15,
        unlockCondition: { type: 'shared_results' },
    },
    {
        code: 'AMBASSADEUR',
        name: 'Ambassadeur',
        description: 'Tu as invité des amis à découvrir leur profil !',
        emoji: '🤝',
        rarity: BadgeRarity.RARE,
        pointsValue: 40,
        unlockCondition: { type: 'invited_friends', count: 3 },
    },
    {
        code: 'ZEMIDJAN',
        name: 'Zémidjan',
        description: 'Tu vas vite à l’essentiel, comme un zem !',
        emoji: '🏍️',
        rarity: BadgeRarity.RARE,
        pointsValue: 30,
        unlockCondition: { type: 'phase1_speed', maxMinutes: 5 },
    },
    {
        code: 'TANEKE',
        name: 'Tanéké',
        description: 'Ta créativité est aussi riche que nos danses traditionnelles !',
        emoji: '💃',
        rarity: BadgeRarity.EPIC,
        pointsValue: 110,
        unlockCondition: { type: 'creative_profile' },
    },
    {
        code: 'AGBOGO',
        name: 'Agbogo',
        description: 'Tu es un véritable pionnier, comme nos ancêtres !',
        emoji: '🌾',
        rarity: BadgeRarity.LEGENDARY,
        pointsValue: 150,
        unlockCondition: { type: 'agriculture_interest' },
    },
];

// ============================================================
// 8. SCRIPT PRINCIPAL
// ============================================================
export async function main() {
    // --- Version du test ---
    const version = await prisma.testVersion.upsert({
        where: { code: 'v1' },
        update: { isActive: true },
        create: {
            code: 'v1',
            name: 'Version 1',
            description: 'Version initiale du test RIASEC',
            isActive: true,
        },
    });

    // --- Langue française ---
    await prisma.language.upsert({
        where: { code: 'fr' },
        update: { isActive: true },
        create: { code: 'fr', name: 'Français', nativeName: 'Français', isActive: true },
    });

    // --- Types RIASEC ---
    for (const r of riasecTypes) {
        await prisma.riasecTypeModel.upsert({
            where: { id: r.id },
            update: { name: r.name, slogan: r.slogan, colorHex: r.colorHex },
            create: { id: r.id, name: r.name, slogan: r.slogan, colorHex: r.colorHex },
        });
    }

    // --- Options pour les aptitudes (échelle 1-3) ---
    await prisma.aptitudeResponseOption.upsert({
        where: { value: 1 },
        update: { label: Label.Faible, emoji: '😕', colorCode: '#FF4444' },
        create: { value: 1, label: Label.Faible, emoji: '😕', colorCode: '#FF4444' },
    });
    await prisma.aptitudeResponseOption.upsert({
        where: { value: 2 },
        update: { label: Label.Moyen, emoji: '😐', colorCode: '#FFA500' },
        create: { value: 2, label: Label.Moyen, emoji: '😐', colorCode: '#FFA500' },
    });
    await prisma.aptitudeResponseOption.upsert({
        where: { value: 3 },
        update: { label: Label.Fort, emoji: '😊', colorCode: '#4CAF50' },
        create: { value: 3, label: Label.Fort, emoji: '😊', colorCode: '#4CAF50' },
    });

    // --- PHASE 1 : Questions d’amorce ---
    let order = 1;
    for (const code of Object.keys(phase1Questions) as RiasecType[]) {
        for (const text of phase1Questions[code]) {
            await prisma.phase1Question.upsert({
                where: {
                    testVersionId_displayOrder: {
                        testVersionId: version.id,
                        displayOrder: order,
                    },
                },
                update: {
                    riasecTypeId: code,
                    questionText: text,
                    displayOrder: order,
                    isActive: true,
                },
                create: {
                    testVersionId: version.id,
                    riasecTypeId: code,
                    questionText: text,
                    displayOrder: order,
                    isActive: true,
                },
            });
            order += 1;
        }
    }

    // --- PHASE 2 : Occupations ---
    let occOrder = 1;
    for (const code of Object.keys(phase2Occupations) as RiasecType[]) {
        for (const text of phase2Occupations[code]) {
            await prisma.phase2Question.upsert({
                where: {
                    testVersionId_phase2Type_displayOrder: {
                        testVersionId: version.id,
                        phase2Type: Phase2Type.OCCUPATIONS,
                        displayOrder: occOrder,
                    },
                },
                update: {
                    riasecTypeId: code,
                    questionText: text,
                    phase2Type: Phase2Type.OCCUPATIONS,
                    displayOrder: occOrder,
                    isActive: true,
                },
                create: {
                    testVersionId: version.id,
                    riasecTypeId: code,
                    questionText: text,
                    phase2Type: Phase2Type.OCCUPATIONS,
                    displayOrder: occOrder,
                    isActive: true,
                },
            });
            occOrder += 1;
        }
    }

    // --- PHASE 2 : Aptitudes (avec échelle 1-3) ---
    let aptOrder = 1;
    for (const code of Object.keys(phase2Aptitudes) as RiasecType[]) {
        for (const text of phase2Aptitudes[code]) {
            await prisma.phase2Question.upsert({
                where: {
                    testVersionId_phase2Type_displayOrder: {
                        testVersionId: version.id,
                        phase2Type: Phase2Type.APTITUDES,
                        displayOrder: aptOrder,
                    },
                },
                update: {
                    riasecTypeId: code,
                    questionText: text,
                    phase2Type: Phase2Type.APTITUDES,
                    displayOrder: aptOrder,
                    minValue: 1,
                    maxValue: 3,
                    valueLabels: { '1': 'Faible', '2': 'Moyen', '3': 'Fort' },
                    isActive: true,
                },
                create: {
                    testVersionId: version.id,
                    riasecTypeId: code,
                    questionText: text,
                    phase2Type: Phase2Type.APTITUDES,
                    displayOrder: aptOrder,
                    minValue: 1,
                    maxValue: 3,
                    valueLabels: { '1': 'Faible', '2': 'Moyen', '3': 'Fort' },
                    isActive: true,
                },
            });
            aptOrder += 1;
        }
    }

    // --- PHASE 2 : Personnalité (booléen) ---
    let perOrder = 1;
    for (const code of Object.keys(phase2Personality) as RiasecType[]) {
        for (const text of phase2Personality[code]) {
            await prisma.phase2Question.upsert({
                where: {
                    testVersionId_phase2Type_displayOrder: {
                        testVersionId: version.id,
                        phase2Type: Phase2Type.PERSONALITY,
                        displayOrder: perOrder,
                    },
                },
                update: {
                    riasecTypeId: code,
                    questionText: text,
                    phase2Type: Phase2Type.PERSONALITY,
                    displayOrder: perOrder,
                    isActive: true,
                },
                create: {
                    testVersionId: version.id,
                    riasecTypeId: code,
                    questionText: text,
                    phase2Type: Phase2Type.PERSONALITY,
                    displayOrder: perOrder,
                    isActive: true,
                },
            });
            perOrder += 1;
        }
    }

    // --- MÉTIERS ---
    for (const c of careers) {
        await prisma.career.upsert({
            where: { name: c.name },
            update: {
                description: c.description,
                category: c.category,
                riasecCodes: c.riasecCodes,
                localDemand: c.localDemand ?? null,
                formationLevel: c.formationLevel ?? null,
                isActive: true,
            },
            create: {
                name: c.name,
                description: c.description,
                category: c.category,
                riasecCodes: c.riasecCodes,
                localDemand: c.localDemand ?? null,
                formationLevel: c.formationLevel ?? null,
                isActive: true,
            },
        });
    }

    // --- BADGES ---
    for (const b of badges) {
        await prisma.badge.upsert({
            where: { code: b.code },
            update: {
                name: b.name,
                description: b.description,
                emoji: b.emoji,
                rarity: b.rarity,
                pointsValue: b.pointsValue,
                unlockCondition: b.unlockCondition,
            },
            create: {
                code: b.code,
                name: b.name,
                description: b.description,
                emoji: b.emoji,
                rarity: b.rarity,
                pointsValue: b.pointsValue,
                unlockCondition: b.unlockCondition,
            },
        });
    }

    // --- Universities & Scholarships will be seeded separately ---
    // (Removed seedLinkCategories as links are now replaced with universities)

    await seedEnhancedData(prisma);

    await seedSampleAssessmentData(prisma);

    // --- Question Profiles (multi-RIASEC) ---
    await seedQuestionProfiles(prisma);

    console.log('Seed completed successfully');
}

main()
    .catch((e) => {
        console.error('Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
