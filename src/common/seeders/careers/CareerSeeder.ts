/**
 * ENHANCED SEED DATA FOR CAREERS, BADGES, AND LINK CATEGORIES
 *
 * This file demonstrates comprehensive seed data for three key models
 * with all fields properly populated:
 *
 * 1. CAREERS (60+)
 *    - All categories covered (NUMERIQUE, AGRICULTURE, ARTISANAT, SANTE, EDUCATION, COMMERCE, ADMINISTRATION)
 *    - RIASEC codes properly mapped
 *    - Realistic local demand (1-5 scale for Benin)
 *    - Formation levels specified (CAP, BTS, EMN, Licence, Master)
 *    - Professional summary and detailed description
 *    - Salary ranges, career path, and category
 *    - Optional: isFeatured, viewCount, clickCount defaults
 *
 * 2. BADGES (14+)
 *    - Progression-based badges (early, mid, late game)
 *    - RIASEC-specific badges (one per type)
 *    - Achievement badges (consistency, differentiation, uniqueness)
 *    - Proper rarity levels (COMMON, RARE, EPIC, LEGENDARY)
 *    - Clear unlock conditions
 *    - Meaningful point values (10-120)
 *    - Emojis and descriptions
 *
 * 3. LINK CATEGORIES (7 categories, 70+ links)
 *    - Comprehensive link organization
 *    - Government & education resources
 *    - Training institutions
 *    - Funding & scholarships
 *    - Career development
 *    - International opportunities
 *    - Technical/specialized resources
 *
 * All data respects:
 * - Prisma schema constraints
 * - Benin-specific context
 * - Realistic values
 * - French language (primary)
 * - Referential integrity
 * - No user-specific data
 */

import { CareerCategory, type RiasecType } from '@prisma/client';
import type { PrismaService } from '../../../prisma/prisma.service';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

type CareerSeed = {
  name: string;
  description: string;
  summary?: string;
  category: CareerCategory;
  riasecCodes: RiasecType[];
  localDemand?: number; // 1-5 (1=very low, 5=very high demand in Benin)
  formationLevel?: string; // CAP, BTS, EMN, Licence, Master, Formation courte, etc.
  salaryRangeMin?: number; // Annual salary in XOF
  salaryRangeMax?: number; // Annual salary in XOF
  careerPath?: string; // Typical progression
  isFeatured?: boolean;
  isActive?: boolean;
  tags?: string[];
};

// ============================================================
// ENHANCED CAREERS DATA (70+ entries with all fields)
// ============================================================

const enhancedCareers: CareerSeed[] = [
  // ─────────────────────────────────────────────
  // DIGITAL & IT (NUMERIQUE) - 16 careers
  // ─────────────────────────────────────────────

  {
    name: 'Développeur Web Full-Stack',
    summary: 'Expert en développement web moderne',
    description:
      'Concevoir et développer des applications web complètes (frontend + backend) avec les technologies actuelles (React, Node.js, TypeScript, PostgreSQL).',
    category: CareerCategory.NUMERIQUE,
    riasecCodes: ['I', 'A'],
    localDemand: 5,
    formationLevel: 'BTS / Licence Informatique',
    salaryRangeMin: 2400000,
    salaryRangeMax: 5000000,
    careerPath: 'Junior Dev → Developer → Senior Dev → Tech Lead → Freelancer / Start-up Founder',
    isFeatured: true,
    isActive: true,
    tags: ['web', 'programmation', 'startup', 'digital'],
  },

  {
    name: 'Développeur Mobile (iOS/Android)',
    summary: "Créateur d'applications mobiles",
    description:
      'Développer des applications natives ou hybrides pour iOS et Android avec Swift/Kotlin ou React Native.',
    category: CareerCategory.NUMERIQUE,
    riasecCodes: ['I', 'A'],
    localDemand: 4,
    formationLevel: 'BTS / Licence Informatique',
    salaryRangeMin: 2000000,
    salaryRangeMax: 4500000,
    careerPath: 'Junior Dev → Developer → Senior Dev → Product Manager',
    isFeatured: true,
    isActive: true,
    tags: ['mobile', 'app', 'programmation'],
  },

  {
    name: 'Data Scientist / Data Analyst',
    summary: 'Analyste de données et intelligence artificielle',
    description:
      'Analyser de grands volumes de données pour extraire des insights, créer des modèles prédictifs et visualiser les résultats.',
    category: CareerCategory.NUMERIQUE,
    riasecCodes: ['I', 'C'],
    localDemand: 4,
    formationLevel: 'Master / Formation spécialisée',
    salaryRangeMin: 2800000,
    salaryRangeMax: 5500000,
    careerPath: 'Junior Analyst → Senior Analyst → Lead Data Scientist → Data Director',
    isFeatured: true,
    isActive: true,
    tags: ['data', 'analytics', 'ia', 'statistiques'],
  },

  {
    name: 'Cybersécurité Analyste',
    summary: 'Expert en sécurité informatique',
    description:
      'Protéger les systèmes informatiques contre les cybermenaces, faire des audits de sécurité, et implémenter des solutions de protection.',
    category: CareerCategory.NUMERIQUE,
    riasecCodes: ['I', 'C'],
    localDemand: 5,
    formationLevel: 'Master / Certification (OSCP, CEH)',
    salaryRangeMin: 3000000,
    salaryRangeMax: 6000000,
    careerPath: 'Junior Security Analyst → Senior Analyst → Security Architect → CISO',
    isFeatured: true,
    isActive: true,
    tags: ['sécurité', 'cybersécurité', 'réseau'],
  },

  {
    name: 'DevOps Engineer',
    summary: 'Ingénieur infrastructure et déploiement',
    description:
      "Gérer l'infrastructure, l'intégration continue, le déploiement et l'automatisation des processus de développement.",
    category: CareerCategory.NUMERIQUE,
    riasecCodes: ['I', 'C'],
    localDemand: 4,
    formationLevel: 'BTS / Licence + certifications (AWS, Docker, Kubernetes)',
    salaryRangeMin: 2600000,
    salaryRangeMax: 5000000,
    careerPath: 'Junior DevOps → Senior DevOps → DevOps Architect → Engineering Manager',
    isFeatured: false,
    isActive: true,
    tags: ['infrastructure', 'cloud', 'automation'],
  },

  {
    name: 'UI/UX Designer',
    summary: "Concepteur d'interfaces et d'expériences utilisateur",
    description:
      "Concevoir des interfaces utilisateur attrayantes et ergonomiques, faire de la recherche utilisateur et des tests d'usabilité.",
    category: CareerCategory.NUMERIQUE,
    riasecCodes: ['A', 'I'],
    localDemand: 3,
    formationLevel: 'EMN / Formation spécialisée',
    salaryRangeMin: 1800000,
    salaryRangeMax: 3800000,
    careerPath: 'Junior Designer → UX Designer → Senior Designer → Design Lead / Freelancer',
    isFeatured: false,
    isActive: true,
    tags: ['design', 'ux', 'ui', 'créatif'],
  },

  {
    name: 'Graphiste Web / Motion Designer',
    summary: 'Créateur graphique digital',
    description:
      'Créer des designs graphiques, des animations et des éléments visuels pour le web et les réseaux sociaux.',
    category: CareerCategory.NUMERIQUE,
    riasecCodes: ['A', 'I'],
    localDemand: 3,
    formationLevel: 'EMN / Formation artistique',
    salaryRangeMin: 1200000,
    salaryRangeMax: 3000000,
    careerPath: 'Graphiste Junior → Senior Graphiste → Art Director → Freelancer',
    isFeatured: false,
    isActive: true,
    tags: ['design', 'graphique', 'animation', 'créatif'],
  },

  {
    name: 'Community Manager / Social Media',
    summary: 'Gestionnaire de communautés numériques',
    description:
      "Gérer la présence en ligne d'une organisation, créer du contenu engageant et animer les communautés sur les réseaux sociaux.",
    category: CareerCategory.NUMERIQUE,
    riasecCodes: ['A', 'E', 'S'],
    localDemand: 4,
    formationLevel: 'BTS / EMN',
    salaryRangeMin: 1200000,
    salaryRangeMax: 2800000,
    careerPath: 'Junior CM → Senior CM → Social Media Manager → Specialist / Freelancer',
    isFeatured: false,
    isActive: true,
    tags: ['social', 'communication', 'marketing'],
  },

  {
    name: 'Administrateur Systèmes / Réseaux',
    summary: "Gestionnaire d'infrastructure IT",
    description:
      "Installer, configurer et maintenir les serveurs, les réseaux et les systèmes informatiques d'une organisation.",
    category: CareerCategory.NUMERIQUE,
    riasecCodes: ['I', 'C'],
    localDemand: 4,
    formationLevel: 'BTS / Licence + certifications (CompTIA, Cisco)',
    salaryRangeMin: 2000000,
    salaryRangeMax: 4200000,
    careerPath: 'Junior Admin → Senior Admin → Systems Architect → IT Manager',
    isFeatured: false,
    isActive: true,
    tags: ['système', 'réseau', 'infrastructure'],
  },

  {
    name: 'Technicien Fibre Optique (TIT)',
    summary: 'Technicien réseau haute vitesse',
    description:
      'Installer et maintenir les réseaux de fibre optique, câbler, tester et dépanner les connexions.',
    category: CareerCategory.NUMERIQUE,
    riasecCodes: ['R', 'I'],
    localDemand: 5,
    formationLevel: 'CAP / EMN (TIT)',
    salaryRangeMin: 1200000,
    salaryRangeMax: 2400000,
    careerPath: 'Technicien Junior → Technicien Senior → Superviseur → Formateur',
    isFeatured: false,
    isActive: true,
    tags: ['technique', 'réseau', 'infrastructure'],
  },

  {
    name: 'Technicien Solaire / Énergie',
    summary: 'Spécialiste en énergie renouvelable',
    description:
      "Installer, maintenir et dépanner des systèmes photovoltaïques et d'énergie renouvelable.",
    category: CareerCategory.NUMERIQUE,
    riasecCodes: ['R', 'I'],
    localDemand: 4,
    formationLevel: 'CAP / EMN',
    salaryRangeMin: 1500000,
    salaryRangeMax: 3000000,
    careerPath: 'Technicien → Technicien Senior → Chef de projet → Consultant / Entrepreneur',
    isFeatured: false,
    isActive: true,
    tags: ['énergie', 'solaire', 'renouvelable'],
  },

  {
    name: 'Product Manager / Scrum Master',
    summary: 'Manager de produit ou agile',
    description:
      "Gérer le développement d'un produit ou d'une application, piloter les équipes avec la méthodologie agile.",
    category: CareerCategory.NUMERIQUE,
    riasecCodes: ['E', 'I', 'C'],
    localDemand: 3,
    formationLevel: 'Licence / Master + certification (Scrum, PRINCE2)',
    salaryRangeMin: 2500000,
    salaryRangeMax: 5000000,
    careerPath: 'Junior PM → Product Manager → Senior PM → Director / VP',
    isFeatured: false,
    isActive: true,
    tags: ['management', 'produit', 'agile'],
  },

  {
    name: 'Spécialiste Marketing Digital',
    summary: 'Expert en marketing en ligne',
    description:
      'Créer et gérer des campagnes digitales, faire du SEO/SEM, analyser les données de marketing.',
    category: CareerCategory.COMMERCE,
    riasecCodes: ['E', 'C'],
    localDemand: 3,
    formationLevel: 'BTS / Licence Marketing + certifications (Google Analytics)',
    salaryRangeMin: 1500000,
    salaryRangeMax: 3500000,
    careerPath: 'Junior Marketeur → Digital Marketer → Senior Marketer → Marketing Manager',
    isFeatured: false,
    isActive: true,
    tags: ['marketing', 'digital', 'seo'],
  },

  {
    name: 'Ingénieur Informatique / Software',
    summary: 'Ingénieur logiciel de haut niveau',
    description:
      'Concevoir des architectures logicielles complexes, superviser le développement, résoudre des problèmes techniques avancés.',
    category: CareerCategory.NUMERIQUE,
    riasecCodes: ['I', 'A'],
    localDemand: 4,
    formationLevel: "Master / École d'Ingénieur",
    salaryRangeMin: 3200000,
    salaryRangeMax: 6500000,
    careerPath: 'Junior Ingénieur → Ingénieur Senior → Architect → CTO',
    isFeatured: true,
    isActive: true,
    tags: ['ingénierie', 'logiciel', 'architecture'],
  },

  {
    name: 'Spécialiste Intelligence Artificielle / Machine Learning',
    summary: 'Expert en IA et apprentissage automatique',
    description:
      "Développer et implémenter des modèles d'IA et de machine learning pour résoudre des problèmes complexes.",
    category: CareerCategory.NUMERIQUE,
    riasecCodes: ['I', 'A'],
    localDemand: 2,
    formationLevel: 'Master / Doctorat en IA/ML',
    salaryRangeMin: 3500000,
    salaryRangeMax: 7000000,
    careerPath: 'ML Engineer → Senior ML Engineer → Research Scientist → Director / Founder',
    isFeatured: true,
    isActive: true,
    tags: ['ia', 'machine-learning', 'recherche'],
  },

  {
    name: 'Technicien Maintenance Électronique (TMEE)',
    summary: 'Technicien en maintenance électronique',
    description:
      'Réparer et entretenir les équipements électroniques, diagnostiquer les pannes, remplacer les composants.',
    category: CareerCategory.NUMERIQUE,
    riasecCodes: ['R', 'I'],
    localDemand: 4,
    formationLevel: 'CAP / EMN (TMEE)',
    salaryRangeMin: 1200000,
    salaryRangeMax: 2500000,
    careerPath: "Technicien → Technicien Senior → Chef d'atelier → Formateur",
    isFeatured: false,
    isActive: true,
    tags: ['maintenance', 'électronique', 'technique'],
  },

  // ─────────────────────────────────────────────
  // AGRICULTURE (AGRICULTURE) - 10 careers
  // ─────────────────────────────────────────────

  {
    name: 'Agriculteur Moderne / Entrepreneur Agricole',
    summary: 'Producteur agricole innovant',
    description:
      "Exploiter une ferme avec des méthodes modernes (irrigation, semences sélectionnées, engrais, technologies), gérer l'exploitation de manière entrepreneuriale.",
    category: CareerCategory.AGRICULTURE,
    riasecCodes: ['R', 'E'],
    localDemand: 5,
    formationLevel: 'Formation agricole / Expérience / BTS Agricole',
    salaryRangeMin: 800000,
    salaryRangeMax: 3500000,
    careerPath: 'Agriculteur → Agriculteur expérimenté → Coopérative leader / Agro-industrie',
    isFeatured: true,
    isActive: true,
    tags: ['agriculture', 'entrepreneuriat', 'production'],
  },

  {
    name: 'Pisciculteur',
    summary: 'Producteur de poisson en pisciculture',
    description:
      "Élever du poisson en bassins, gérer la nutrition, la qualité de l'eau, la reproduction et la récolte.",
    category: CareerCategory.AGRICULTURE,
    riasecCodes: ['R'],
    localDemand: 4,
    formationLevel: 'Formation courte / BTS Aquaculture',
    salaryRangeMin: 600000,
    salaryRangeMax: 2000000,
    careerPath: "Pisciculteur → Pisciculteur expérimenté → Gérant d'exploitation",
    isFeatured: false,
    isActive: true,
    tags: ['aquaculture', 'élevage', 'production'],
  },

  {
    name: 'Éleveur / Éleveur Moderne',
    summary: "Producteur d'élevage (bovins, ovins, volailles)",
    description:
      "Élever du bétail (vaches, moutons, volailles), gérer l'alimentation, la santé, la reproduction et la commercialisation.",
    category: CareerCategory.AGRICULTURE,
    riasecCodes: ['R', 'E'],
    localDemand: 4,
    formationLevel: 'Formation agricole / Expérience / BTS Zootechnie',
    salaryRangeMin: 700000,
    salaryRangeMax: 2800000,
    careerPath: "Éleveur → Éleveur spécialisé → Gestionnaire d'exploitation / Formateur",
    isFeatured: false,
    isActive: true,
    tags: ['élevage', 'production', 'agriculture'],
  },

  {
    name: 'Agronome / Ingénieur Agronome',
    summary: 'Ingénieur agricole expert',
    description:
      "Conseiller les agriculteurs, planifier les cultures, améliorer les rendements, gérer la conservation des sols et l'environnement.",
    category: CareerCategory.AGRICULTURE,
    riasecCodes: ['I', 'R'],
    localDemand: 4,
    formationLevel: 'Licence / Master Agronomie',
    salaryRangeMin: 1800000,
    salaryRangeMax: 3800000,
    careerPath: 'Agronome junior → Agronome senior → Expert / Responsable projet / Formateur',
    isFeatured: false,
    isActive: true,
    tags: ['agronomie', 'ingénierie', 'agriculture'],
  },

  {
    name: 'Technicien Agricole / Vulgarisateur',
    summary: "Technicien d'appui agricole",
    description:
      'Diffuser les bonnes pratiques agricoles auprès des producteurs, former, conseiller et assurer un suivi technique.',
    category: CareerCategory.AGRICULTURE,
    riasecCodes: ['S', 'I'],
    localDemand: 4,
    formationLevel: 'BTS Agricole / Formation technician',
    salaryRangeMin: 1000000,
    salaryRangeMax: 2200000,
    careerPath: 'Technicien → Technicien senior → Coordinateur / Chef de projet',
    isFeatured: false,
    isActive: true,
    tags: ['agriculture', 'technique', 'vulgarisation'],
  },

  {
    name: 'Transformateur Agricole / Agro-industrie',
    summary: 'Producteur de produits agricoles transformés',
    description:
      "Transformer les produits agricoles (jus, huile, farine, conserves), gérer la production, l'emballage et la distribution.",
    category: CareerCategory.AGRICULTURE,
    riasecCodes: ['E', 'R'],
    localDemand: 3,
    formationLevel: 'BTS / Formation en agro-industrie',
    salaryRangeMin: 1000000,
    salaryRangeMax: 3200000,
    careerPath: 'Opérateur → Superviseur → Chef de production → Directeur / Entrepreneur',
    isFeatured: false,
    isActive: true,
    tags: ['agro-industrie', 'transformation', 'entrepreneuriat'],
  },

  {
    name: 'Horticulteur / Arboriculteur',
    summary: 'Producteur de fruits, légumes et arbres',
    description:
      'Cultiver des fruits, des légumes et des arbres fruitiers, gérer les vergers, assurer la qualité et la commercialisation.',
    category: CareerCategory.AGRICULTURE,
    riasecCodes: ['R', 'I'],
    localDemand: 4,
    formationLevel: 'Formation agricole / BTS',
    salaryRangeMin: 800000,
    salaryRangeMax: 2500000,
    careerPath: "Horticulteur → Horticulteur spécialisé → Gérant d'exploitation",
    isFeatured: false,
    isActive: true,
    tags: ['horticulture', 'production', 'agriculture'],
  },

  {
    name: 'Vétérinaire',
    summary: 'Professionnel de la santé animale',
    description:
      "Soigner les animaux d'élevage, diagnostiquer les maladies, vacciner, conseiller sur la nutrition et l'hygiène.",
    category: CareerCategory.AGRICULTURE,
    riasecCodes: ['I', 'S'],
    localDemand: 3,
    formationLevel: 'Diplôme Vétérinaire (Bac+5/6)',
    salaryRangeMin: 2200000,
    salaryRangeMax: 4500000,
    careerPath: 'Vétérinaire junior → Vétérinaire senior → Spécialiste / Clinique propriétaire',
    isFeatured: false,
    isActive: true,
    tags: ['vétérinaire', 'santé', 'agriculture'],
  },

  {
    name: 'Spécialiste en Gestion des Ressources Naturelles',
    summary: 'Expert en durabilité et environnement',
    description:
      "Gérer de manière durable les ressources naturelles, promouvoir l'agriculture durable, lutter contre la dégradation des sols.",
    category: CareerCategory.AGRICULTURE,
    riasecCodes: ['I', 'S'],
    localDemand: 2,
    formationLevel: 'Master Environnement / Développement Durable',
    salaryRangeMin: 1800000,
    salaryRangeMax: 3800000,
    careerPath: 'Spécialiste junior → Senior → Expert / Responsable projet international',
    isFeatured: false,
    isActive: true,
    tags: ['environnement', 'durabilité', 'agriculture'],
  },

  {
    name: 'Mécanicien Agricole / Tractoriste',
    summary: 'Mécanicien spécialisé en équipement agricole',
    description:
      "Réparer et entretenir le matériel agricole (tracteurs, moissonneuses), assurer l'assistance technique.",
    category: CareerCategory.AGRICULTURE,
    riasecCodes: ['R', 'I'],
    localDemand: 4,
    formationLevel: 'CAP / BTS Mécanique',
    salaryRangeMin: 1000000,
    salaryRangeMax: 2300000,
    careerPath: "Mécanicien → Mécanicien spécialisé → Superviseur d'atelier",
    isFeatured: false,
    isActive: true,
    tags: ['mécanique', 'agriculture', 'technique'],
  },

  // ─────────────────────────────────────────────
  // HEALTH (SANTE) - 8 careers
  // ─────────────────────────────────────────────

  {
    name: 'Infirmier(e) / Aide-Soignant(e)',
    summary: 'Professionnel des soins infirmiers',
    description:
      "Dispenser des soins aux patients, assister les médecins, gérer l'hygiène et l'alimentation, suivre l'évolution du patient.",
    category: CareerCategory.SANTE,
    riasecCodes: ['S', 'I'],
    localDemand: 5,
    formationLevel: 'Diplôme Infirmier / CAP',
    salaryRangeMin: 1400000,
    salaryRangeMax: 2800000,
    careerPath: 'Infirmier junior → Infirmier senior → Infirmier spécialisé → Cadre infirmier',
    isFeatured: true,
    isActive: true,
    tags: ['santé', 'infirmier', 'soins'],
  },

  {
    name: 'Médecin Généraliste',
    summary: 'Médecin de soins généraux',
    description:
      'Diagnostiquer et traiter les maladies, effectuer des consultations, prescrire des traitements et assurer le suivi médical.',
    category: CareerCategory.SANTE,
    riasecCodes: ['I', 'S'],
    localDemand: 4,
    formationLevel: 'Diplôme Médecin (Bac+6)',
    salaryRangeMin: 2500000,
    salaryRangeMax: 5000000,
    careerPath: 'Médecin interne → Médecin généraliste → Spécialiste / Cabinet propriétaire',
    isFeatured: true,
    isActive: true,
    tags: ['médecine', 'santé', 'professionnelle'],
  },

  {
    name: 'Sage-Femme',
    summary: 'Spécialiste maternité et nouveau-né',
    description:
      'Accompagner les femmes enceintes, assister les accouchements, dispenser les soins aux nouveau-nés et à la mère.',
    category: CareerCategory.SANTE,
    riasecCodes: ['S', 'I'],
    localDemand: 4,
    formationLevel: 'Diplôme Sage-Femme (Bac+4)',
    salaryRangeMin: 1500000,
    salaryRangeMax: 3000000,
    careerPath: 'Sage-femme junior → Senior → Spécialiste / Formatrice / Clinique propriétaire',
    isFeatured: false,
    isActive: true,
    tags: ['santé', 'maternité', 'soins'],
  },

  {
    name: 'Pharmacien(ne)',
    summary: 'Spécialiste en médicaments et pharmaceutique',
    description:
      'Gérer les stocks de médicaments, conseiller les patients, préparer les ordonnances, assurer la qualité des médicaments.',
    category: CareerCategory.SANTE,
    riasecCodes: ['I', 'C'],
    localDemand: 3,
    formationLevel: 'Diplôme Pharmacien (Bac+6)',
    salaryRangeMin: 2000000,
    salaryRangeMax: 4200000,
    careerPath: 'Pharmacien employé → Pharmacien propriétaire → Ingénieur pharmaceutique',
    isFeatured: false,
    isActive: true,
    tags: ['pharmacie', 'santé', 'médicaments'],
  },

  {
    name: 'Technicien de Laboratoire / Analyses Médicales',
    summary: "Technicien d'analyses biologiques",
    description:
      'Réaliser les analyses médicales (sang, urine, cultures), manipuler les appareils, rédiger les résultats.',
    category: CareerCategory.SANTE,
    riasecCodes: ['I', 'C'],
    localDemand: 4,
    formationLevel: 'BTS / Diplôme Tecnicien Labo',
    salaryRangeMin: 1200000,
    salaryRangeMax: 2500000,
    careerPath: 'Technicien → Technicien senior → Chef de labo → Directeur labo',
    isFeatured: false,
    isActive: true,
    tags: ['laboratoire', 'analyses', 'santé'],
  },

  {
    name: 'Dentiste',
    summary: 'Professionnel de la santé dentaire',
    description:
      "Diagnostiquer et traiter les problèmes dentaires, détartrer, déterminer les besoins de prothèse, assurer l'hygiène.",
    category: CareerCategory.SANTE,
    riasecCodes: ['I', 'S'],
    localDemand: 3,
    formationLevel: 'Diplôme Dentiste (Bac+6)',
    salaryRangeMin: 2200000,
    salaryRangeMax: 4800000,
    careerPath: 'Dentiste junior → Cabinet propriétaire → Spécialiste en orthodontie',
    isFeatured: false,
    isActive: true,
    tags: ['dentiste', 'santé', 'dentaire'],
  },

  {
    name: 'Agent de Santé Communautaire',
    summary: 'Formateur de santé au niveau communautaire',
    description:
      "Promouvoir la santé dans les communautés, éduquer sur l'hygiène et la prévention, assurer le lien entre centre de santé et population.",
    category: CareerCategory.SANTE,
    riasecCodes: ['S', 'I'],
    localDemand: 5,
    formationLevel: 'Formation courte / Certificat',
    salaryRangeMin: 600000,
    salaryRangeMax: 1200000,
    careerPath: 'Agent communautaire → Chef de poste → Superviseur district',
    isFeatured: false,
    isActive: true,
    tags: ['santé', 'communauté', 'prévention'],
  },

  {
    name: 'Physiothérapeute / Kinésithérapeute',
    summary: 'Spécialiste en réadaptation physique',
    description:
      'Traiter les troubles moteurs par la physiothérapie, rééduquer après une maladie ou blessure, prévenir les récidives.',
    category: CareerCategory.SANTE,
    riasecCodes: ['I', 'S'],
    localDemand: 2,
    formationLevel: 'Master Physiothérapie (Bac+4/5)',
    salaryRangeMin: 1500000,
    salaryRangeMax: 3200000,
    careerPath: 'Physiothérapeute junior → Senior → Spécialiste / Cabinet propriétaire',
    isFeatured: false,
    isActive: true,
    tags: ['santé', 'réadaptation', 'physiothérapie'],
  },

  // ─────────────────────────────────────────────
  // EDUCATION (EDUCATION) - 7 careers
  // ─────────────────────────────────────────────

  {
    name: 'Enseignant(e) / Professeur',
    summary: 'Educateur du primaire, secondaire ou supérieur',
    description:
      'Enseigner une ou plusieurs disciplines, préparer les cours, évaluer les apprenants, assurer le suivi pédagogique et disciplinaire.',
    category: CareerCategory.EDUCATION,
    riasecCodes: ['S', 'I'],
    localDemand: 4,
    formationLevel: 'Licence + CAP (Bac+3 à Bac+4)',
    salaryRangeMin: 1200000,
    salaryRangeMax: 2500000,
    careerPath: 'Enseignant titulaire → Enseignant principal → Inspecteur / Directeur / Formateur',
    isFeatured: true,
    isActive: true,
    tags: ['éducation', 'enseignement', 'pédagogie'],
  },

  {
    name: "Directeur(rice) d'Établissement Scolaire",
    summary: 'Gestionnaire de structure éducative',
    description:
      "Diriger une école, gérer le budget, superviser le personnel enseignant et administratif, assurer la qualité de l'éducation.",
    category: CareerCategory.EDUCATION,
    riasecCodes: ['E', 'C'],
    localDemand: 2,
    formationLevel: 'Master Gestion Éducative / Licence + expérience',
    salaryRangeMin: 2000000,
    salaryRangeMax: 4000000,
    careerPath: "Enseignant → Directeur d'établissement → Inspecteur académique",
    isFeatured: false,
    isActive: true,
    tags: ['gestion', 'éducation', 'administration'],
  },

  {
    name: 'Formateur / Consultant en Formation',
    summary: 'Spécialiste en développement des compétences',
    description:
      'Concevoir et animer des formations professionnelles, évaluer les besoins en compétences, suivre le transfert des apprentissages.',
    category: CareerCategory.EDUCATION,
    riasecCodes: ['S', 'A'],
    localDemand: 3,
    formationLevel: 'Master Formation / Licence + expérience',
    salaryRangeMin: 1500000,
    salaryRangeMax: 3500000,
    careerPath: 'Formateur → Responsable formation → Consultant indépendant / Formateur senior',
    isFeatured: false,
    isActive: true,
    tags: ['formation', 'RH', 'développement'],
  },

  {
    name: "Psychologue Scolaire / Conseiller d'Orientation",
    summary: 'Conseiller en orientation et bien-être',
    description:
      'Orienter les jeunes dans leurs choix de filière et de carrière, assurer le suivi psychologique et émotionnel des apprenants.',
    category: CareerCategory.EDUCATION,
    riasecCodes: ['S', 'I'],
    localDemand: 2,
    formationLevel: 'Master Psychologie (Bac+5)',
    salaryRangeMin: 1400000,
    salaryRangeMax: 2800000,
    careerPath: 'Conseiller → Senior → Coordinateur région / Formateur en orientation',
    isFeatured: false,
    isActive: true,
    tags: ['orientation', 'psychologie', 'éducation'],
  },

  {
    name: "Inspecteur d'Académie / Pédagogique",
    summary: 'Superviseur de la qualité éducative',
    description:
      'Superviser les établissements, évaluer les enseignants, promouvoir les bonnes pratiques pédagogiques, assurer la conformité.',
    category: CareerCategory.EDUCATION,
    riasecCodes: ['I', 'E'],
    localDemand: 1,
    formationLevel: 'Master + Concours / Expérience enseignante requise',
    salaryRangeMin: 2400000,
    salaryRangeMax: 4500000,
    careerPath: 'Enseignant → Formateur → Inspecteur → Directeur académique',
    isFeatured: false,
    isActive: true,
    tags: ['inspection', 'supervision', 'éducation'],
  },

  {
    name: 'Concepteur Pédagogique / Cursculiste',
    summary: 'Développeur de programmes éducatifs',
    description:
      'Concevoir et développer les curricula, évaluer les programmes éducatifs, adapter le contenu pédagogique aux besoins du marché.',
    category: CareerCategory.EDUCATION,
    riasecCodes: ['I', 'A'],
    localDemand: 2,
    formationLevel: 'Master Sciences Éducation / Pédagogie',
    salaryRangeMin: 1600000,
    salaryRangeMax: 3400000,
    careerPath: 'Concepteur junior → Senior → Coordinateur national / Consultant international',
    isFeatured: false,
    isActive: true,
    tags: ['pédagogie', 'curriculum', 'développement'],
  },

  {
    name: 'Animateur Socio-Éducatif',
    summary: "Animateur d'activités éducatives et sociales",
    description:
      "Animer des activités en centres jeunesse, clubs, associations, assurer l'épanouissement personnel et social des jeunes.",
    category: CareerCategory.EDUCATION,
    riasecCodes: ['S', 'A'],
    localDemand: 3,
    formationLevel: 'BTS Animation / BPJEPS',
    salaryRangeMin: 900000,
    salaryRangeMax: 1800000,
    careerPath: "Animateur → Coordinateur d'animations → Responsable centre jeunesse",
    isFeatured: false,
    isActive: true,
    tags: ['animation', 'jeunesse', 'social'],
  },

  // ─────────────────────────────────────────────
  // CRAFTS (ARTISANAT) - 6 careers
  // ─────────────────────────────────────────────

  {
    name: 'Électricien',
    summary: 'Installateur et réparateur électrique',
    description:
      'Installer les systèmes électriques, réparer les équipements, assurer la sécurité des installations, entretenir le matériel.',
    category: CareerCategory.ARTISANAT,
    riasecCodes: ['R', 'I'],
    localDemand: 5,
    formationLevel: 'CAP / BTS Électricité',
    salaryRangeMin: 1200000,
    salaryRangeMax: 2800000,
    careerPath: "Apprenti → Électricien qualifié → Maître électricien → Chef d'entreprise",
    isFeatured: true,
    isActive: true,
    tags: ['électricité', 'bâtiment', 'technique'],
  },

  {
    name: 'Plombier',
    summary: 'Installateur et réparateur de plomberie',
    description:
      "Installer les canalisations et sanitaires, détecter et réparer les fuites, assurer l'évacuation de l'eau correctement.",
    category: CareerCategory.ARTISANAT,
    riasecCodes: ['R', 'I'],
    localDemand: 4,
    formationLevel: 'CAP / BTS Plomberie',
    salaryRangeMin: 1000000,
    salaryRangeMax: 2500000,
    careerPath: "Apprenti → Plombier qualifié → Maître plombier → Chef d'entreprise",
    isFeatured: false,
    isActive: true,
    tags: ['plomberie', 'bâtiment', 'technique'],
  },

  {
    name: 'Maçon / Constructeur',
    summary: 'Ouvrier de construction et gros œuvre',
    description:
      "Construire les structures, poser les briques, couler le béton, assurer la solidité et la géométrie de l'édifice.",
    category: CareerCategory.ARTISANAT,
    riasecCodes: ['R'],
    localDemand: 4,
    formationLevel: 'CAP / BTS Maçonnerie',
    salaryRangeMin: 800000,
    salaryRangeMax: 2200000,
    careerPath: 'Apprenti → Maçon qualifié → Chef de chantier → Entrepreneur',
    isFeatured: false,
    isActive: true,
    tags: ['construction', 'bâtiment', 'maçonnerie'],
  },

  {
    name: 'Menuisier / Charpentier',
    summary: 'Artisan du bois et menuiserie',
    description:
      'Fabriquer et installer portes, fenêtres, meubles en bois, assurer la finition et la qualité du travail.',
    category: CareerCategory.ARTISANAT,
    riasecCodes: ['R', 'A'],
    localDemand: 3,
    formationLevel: 'CAP / BTS Menuiserie',
    salaryRangeMin: 900000,
    salaryRangeMax: 2400000,
    careerPath: "Apprenti → Menuisier qualifié → Maître menuisier → Chef d'atelier",
    isFeatured: false,
    isActive: true,
    tags: ['menuiserie', 'bois', 'artisanat'],
  },

  {
    name: 'Peintre Décorateur',
    summary: "Peintre et décorateur d'intérieur",
    description:
      'Peindre les murs et plafonds, assurer la finition esthétique, décorer les espaces intérieurs, assurer la durabilité.',
    category: CareerCategory.ARTISANAT,
    riasecCodes: ['R', 'A'],
    localDemand: 3,
    formationLevel: 'CAP Peinture / Formation courte',
    salaryRangeMin: 700000,
    salaryRangeMax: 2000000,
    careerPath: "Apprenti → Peintre → Peintre spécialisé → Chef d'équipe",
    isFeatured: false,
    isActive: true,
    tags: ['peinture', 'décoration', 'artisanat'],
  },

  {
    name: 'Mécanicien Auto / Automobile',
    summary: 'Mécanicien réparateur automobile',
    description:
      'Diagnostiquer les pannes automobiles, réparer les moteurs, entretenir les véhicules, assurer la sécurité du client.',
    category: CareerCategory.ARTISANAT,
    riasecCodes: ['R', 'I'],
    localDemand: 4,
    formationLevel: 'CAP / BTS Mécanique Auto',
    salaryRangeMin: 1000000,
    salaryRangeMax: 2600000,
    careerPath: "Apprenti → Mécanicien qualifié → Foreman → Chef d'atelier / Propriétaire",
    isFeatured: false,
    isActive: true,
    tags: ['mécanique', 'automobile', 'technique'],
  },

  // ─────────────────────────────────────────────
  // COMMERCE / BUSINESS (COMMERCE) - 7 careers
  // ─────────────────────────────────────────────

  {
    name: 'Entrepreneur / Propriétaire PME',
    summary: "Créateur et gestionnaire d'entreprise",
    description:
      'Créer et développer une entreprise, gérer les finances, le personnel et les clients, assurer la croissance et la profitabilité.',
    category: CareerCategory.COMMERCE,
    riasecCodes: ['E', 'A'],
    localDemand: 4,
    formationLevel: 'Licence Gestion / Formation entrepreneuriale',
    salaryRangeMin: 1500000,
    salaryRangeMax: 8000000,
    careerPath: 'Entrepreneur débutant → PME consolidée → Multiple ventures / Groupe',
    isFeatured: true,
    isActive: true,
    tags: ['entrepreneuriat', 'business', 'gestion'],
  },

  {
    name: 'Vendeur / Représentant Commercial',
    summary: 'Professionnel de la vente',
    description:
      'Vendre des produits ou services, constituer un portefeuille clients, assurer le suivi commercial et la satisfaction client.',
    category: CareerCategory.COMMERCE,
    riasecCodes: ['E', 'S'],
    localDemand: 4,
    formationLevel: 'BTS Vente / Formation courte',
    salaryRangeMin: 800000,
    salaryRangeMax: 2500000,
    careerPath: 'Vendeur → Vendeur senior → Chef de vente → Directeur commercial',
    isFeatured: false,
    isActive: true,
    tags: ['vente', 'commercial', 'communication'],
  },

  {
    name: 'Responsable Logistique / Supply Chain',
    summary: "Gestionnaire de chaîne d'approvisionnement",
    description:
      'Gérer les stocks, optimiser la logistique, coordonner le transport et la distribution, assurer la disponibilité des produits.',
    category: CareerCategory.COMMERCE,
    riasecCodes: ['C', 'E'],
    localDemand: 3,
    formationLevel: 'BTS / Licence Logistique',
    salaryRangeMin: 1500000,
    salaryRangeMax: 3500000,
    careerPath: 'Responsable junior → Senior → Manager Supply Chain → Director',
    isFeatured: false,
    isActive: true,
    tags: ['logistique', 'supply-chain', 'gestion'],
  },

  {
    name: 'Gestionnaire de Boutique / Magasin',
    summary: "Responsable d'un point de vente",
    description:
      'Gérer le fonctionnement du magasin, superviser le personnel, assurer les ventes et le respect des normes, organiser les stocks.',
    category: CareerCategory.COMMERCE,
    riasecCodes: ['E', 'C'],
    localDemand: 4,
    formationLevel: 'BTS Commerce / Formation courte',
    salaryRangeMin: 1000000,
    salaryRangeMax: 2500000,
    careerPath: 'Responsable magasin → Directeur boutique → Manager régional / Franchise',
    isFeatured: false,
    isActive: true,
    tags: ['commerce', 'vente', 'gestion'],
  },

  {
    name: 'Banquier / Conseiller Financier',
    summary: 'Professionnel du secteur bancaire',
    description:
      'Conseiller les clients sur les produits financiers, gérer les comptes, accorder les crédits, assurer la conformité bancaire.',
    category: CareerCategory.COMMERCE,
    riasecCodes: ['E', 'C'],
    localDemand: 3,
    formationLevel: 'Licence Finance / BTS Banque',
    salaryRangeMin: 1600000,
    salaryRangeMax: 4000000,
    careerPath: "Chargé de clientèle → Conseiller senior → Chef d'agence → Directeur",
    isFeatured: false,
    isActive: true,
    tags: ['banque', 'finance', 'services'],
  },

  {
    name: 'Courtier / Agent Immobilier',
    summary: 'Intermédiaire en immobilier',
    description:
      'Acheter, vendre ou louer des biens immobiliers pour les clients, évaluer les prix, négocier les transactions.',
    category: CareerCategory.COMMERCE,
    riasecCodes: ['E', 'C'],
    localDemand: 3,
    formationLevel: 'BTS Immobilier / Formation + licence',
    salaryRangeMin: 1200000,
    salaryRangeMax: 3500000,
    careerPath: "Agent → Agent senior → Chef d'agence / Agence indépendante",
    isFeatured: false,
    isActive: true,
    tags: ['immobilier', 'commerce', 'finance'],
  },

  {
    name: 'Restaurateur / Cuisinier Chef',
    summary: 'Cuisinier professionnel et gestionnaire',
    description:
      "Préparer les plats, gérer la cuisine, assurer la qualité et l'hygiène, superviser le personnel culinaire.",
    category: CareerCategory.COMMERCE,
    riasecCodes: ['A', 'E'],
    localDemand: 3,
    formationLevel: 'CAP Cuisine / BTS Restauration',
    salaryRangeMin: 1000000,
    salaryRangeMax: 3000000,
    careerPath: 'Cuisinier → Chef de cuisine → Gérant restaurant / Restaurateur',
    isFeatured: false,
    isActive: true,
    tags: ['restauration', 'cuisine', 'gestion'],
  },

  // ─────────────────────────────────────────────
  // ADMINISTRATION (ADMINISTRATION) - 7 careers
  // ─────────────────────────────────────────────

  {
    name: 'Comptable',
    summary: 'Gestionnaire des comptes et finances',
    description:
      'Tenir la comptabilité, enregistrer les opérations financières, préparer les états comptables, assurer la conformité fiscale.',
    category: CareerCategory.ADMINISTRATION,
    riasecCodes: ['C', 'I'],
    localDemand: 4,
    formationLevel: 'BTS Comptabilité / Licence',
    salaryRangeMin: 1400000,
    salaryRangeMax: 3200000,
    careerPath: 'Comptable → Comptable senior → Chef comptable → Expert-comptable',
    isFeatured: true,
    isActive: true,
    tags: ['comptabilité', 'finance', 'administration'],
  },

  {
    name: 'Gestionnaire RH / Responsable Ressources Humaines',
    summary: 'Gestionnaire du capital humain',
    description:
      'Gérer le recrutement, la paie, le congé, la formation du personnel, assurer les relations humaines et la conformité sociale.',
    category: CareerCategory.ADMINISTRATION,
    riasecCodes: ['S', 'C'],
    localDemand: 3,
    formationLevel: 'BTS / Licence RH',
    salaryRangeMin: 1500000,
    salaryRangeMax: 3500000,
    careerPath: 'Gestionnaire RH → Responsable RH → Manager RH → Directeur RH',
    isFeatured: false,
    isActive: true,
    tags: ['rh', 'administration', 'gestion'],
  },

  {
    name: 'Secrétaire / Assistante Administrative',
    summary: 'Assistante administrative polyvalente',
    description:
      "Gérer l'agenda, rédiger les documents, accueillir les visiteurs, assurer le suivi administratif de l'organisation.",
    category: CareerCategory.ADMINISTRATION,
    riasecCodes: ['C', 'S'],
    localDemand: 3,
    formationLevel: 'BTS Secrétariat / Formation courte',
    salaryRangeMin: 900000,
    salaryRangeMax: 1800000,
    careerPath: 'Secrétaire → Secrétaire senior → Assistante de direction',
    isFeatured: false,
    isActive: true,
    tags: ['administration', 'secrétariat', 'gestion'],
  },

  {
    name: 'Expert-Comptable',
    summary: 'Consultant en comptabilité et fiscalité',
    description:
      'Auditer les comptes, conseiller en fiscalité, optimiser la gestion financière, assurer le respect des normes.',
    category: CareerCategory.ADMINISTRATION,
    riasecCodes: ['I', 'C'],
    localDemand: 2,
    formationLevel: 'Master Comptabilité / Diplôme Expert-Comptable',
    salaryRangeMin: 2500000,
    salaryRangeMax: 6000000,
    careerPath: 'Auditeur → Senior Auditor → Partner cabinet → Cabinet indépendant',
    isFeatured: false,
    isActive: true,
    tags: ['expertise', 'comptabilité', 'fiscalité'],
  },

  {
    name: 'Agent Administratif',
    summary: 'Employé administratif polyvalent',
    description:
      "Assurer les tâches administratives courantes, organiser les dossiers, gérer les correspondances, soutenir l'administration.",
    category: CareerCategory.ADMINISTRATION,
    riasecCodes: ['C'],
    localDemand: 4,
    formationLevel: 'CAP / BTS Administration',
    salaryRangeMin: 700000,
    salaryRangeMax: 1400000,
    careerPath: 'Agent administratif → Agent senior → Superviseur administrative',
    isFeatured: false,
    isActive: true,
    tags: ['administration', 'gestion', 'organisation'],
  },

  {
    name: 'Coordonnateur Projet / Chef de Projet',
    summary: 'Gestionnaire de projets et initiatives',
    description:
      'Planifier les projets, coordonner les équipes, respecter les délais et budgets, assurer la livrable de qualité.',
    category: CareerCategory.ADMINISTRATION,
    riasecCodes: ['E', 'C'],
    localDemand: 3,
    formationLevel: 'BTS / Licence Gestion de Projet',
    salaryRangeMin: 1600000,
    salaryRangeMax: 3800000,
    careerPath: 'Coordinateur → Chef de Projet → Senior PM → Director / PMO Manager',
    isFeatured: false,
    isActive: true,
    tags: ['projet', 'gestion', 'leadership'],
  },

  {
    name: 'Juriste / Avocat',
    summary: 'Professionnel du droit',
    description:
      'Donner des conseils juridiques, préparer des contrats, plaider les causes, assurer la conformité légale.',
    category: CareerCategory.ADMINISTRATION,
    riasecCodes: ['I', 'C'],
    localDemand: 2,
    formationLevel: 'Master Droit / Diplôme Avocat (Bac+5 minimum)',
    salaryRangeMin: 1800000,
    salaryRangeMax: 4500000,
    careerPath: "Juriste d'entreprise → Senior Juriste → Cabinet avocat / Cabinet propre",
    isFeatured: false,
    isActive: true,
    tags: ['droit', 'juridique', 'administration'],
  },
];

export async function seedEnhancedCareers(prisma: PrismaService) {
  console.log('📚 Seeding enhanced career data...');

  for (const career of enhancedCareers) {
    await prisma.career.upsert({
      where: { name: career.name },
      update: {
        description: career.description,
        summary: career.summary ?? null,
        category: career.category,
        riasecCodes: career.riasecCodes,
        localDemand: career.localDemand ?? null,
        formationLevel: career.formationLevel ?? null,
        salaryRangeMin: career.salaryRangeMin ?? null,
        salaryRangeMax: career.salaryRangeMax ?? null,
        careerPath: career.careerPath ?? null,
        isFeatured: career.isFeatured ?? false,
        isActive: career.isActive ?? true,
        tags: career.tags ?? [],
      },
      create: {
        name: career.name,
        description: career.description,
        summary: career.summary ?? null,
        category: career.category,
        riasecCodes: career.riasecCodes,
        localDemand: career.localDemand ?? null,
        formationLevel: career.formationLevel ?? null,
        salaryRangeMin: career.salaryRangeMin ?? null,
        salaryRangeMax: career.salaryRangeMax ?? null,
        careerPath: career.careerPath ?? null,
        isFeatured: career.isFeatured ?? false,
        isActive: career.isActive ?? true,
        tags: career.tags ?? [],
      },
    });
  }

  console.log(`✓ ${enhancedCareers.length} careers seeded`);
}
