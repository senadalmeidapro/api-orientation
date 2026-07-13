/* eslint-disable no-console */
import { TestType, type RiasecType } from '@prisma/client';
import type { PrismaService } from '../../../prisma/prisma.service';

/**
 * Configuration manuelle des profils multi‑RIASEC.
 * Pour chaque question (General + Specific), on définit la liste des dimensions avec leurs poids.
 *
 * Si une question n'apparaît pas dans cette configuration, elle recevra
 * automatiquement son profil principal (riasec_type_id) avec weight = 1.0.
 */
const manualProfiles: {
  category: TestType;
  questionId: number;
  profiles: { riasecType: RiasecType; weight: number }[];
}[] = [
  // ============================================================
  // GENERALE (IDs 1 à 60)
  // ============================================================

  // R – Réaliste (IDs 1-10)
  {
    category: TestType.GENERALE,
    questionId: 1,
    profiles: [
      { riasecType: 'R', weight: 0.8 },
      { riasecType: 'I', weight: 0.2 },
    ],
  }, // Travailler dans un champ
  {
    category: TestType.GENERALE,
    questionId: 2,
    profiles: [
      { riasecType: 'R', weight: 0.9 },
      { riasecType: 'I', weight: 0.1 },
    ],
  }, // Réparer vélo/moto
  { category: TestType.GENERALE, questionId: 3, profiles: [{ riasecType: 'R', weight: 1.0 }] }, // Construire objets bois/métal – pur R
  { category: TestType.GENERALE, questionId: 4, profiles: [{ riasecType: 'R', weight: 1.0 }] }, // Conduire véhicule – pur R
  {
    category: TestType.GENERALE,
    questionId: 5,
    profiles: [
      { riasecType: 'R', weight: 0.9 },
      { riasecType: 'S', weight: 0.1 },
    ],
  }, // S'occuper d'animaux
  { category: TestType.GENERALE, questionId: 6, profiles: [{ riasecType: 'R', weight: 1.0 }] }, // Utiliser des outils – pur R
  { category: TestType.GENERALE, questionId: 7, profiles: [{ riasecType: 'R', weight: 1.0 }] }, // Maçonnerie/peinture – pur R
  {
    category: TestType.GENERALE,
    questionId: 8,
    profiles: [
      { riasecType: 'R', weight: 0.8 },
      { riasecType: 'I', weight: 0.2 },
    ],
  }, // Installer panneaux solaires
  {
    category: TestType.GENERALE,
    questionId: 9,
    profiles: [
      { riasecType: 'R', weight: 0.7 },
      { riasecType: 'I', weight: 0.3 },
    ],
  }, // Machines agricoles
  {
    category: TestType.GENERALE,
    questionId: 10,
    profiles: [
      { riasecType: 'R', weight: 0.6 },
      { riasecType: 'I', weight: 0.4 },
    ],
  }, // Lire plans

  // I – Investigateur (IDs 11-20)
  { category: TestType.GENERALE, questionId: 11, profiles: [{ riasecType: 'I', weight: 1.0 }] }, // Lire pour apprendre – pur I
  { category: TestType.GENERALE, questionId: 12, profiles: [{ riasecType: 'I', weight: 1.0 }] }, // Résoudre problèmes maths/logique – pur I
  { category: TestType.GENERALE, questionId: 13, profiles: [{ riasecType: 'I', weight: 1.0 }] }, // Comprendre technologies – pur I
  {
    category: TestType.GENERALE,
    questionId: 14,
    profiles: [
      { riasecType: 'I', weight: 0.9 },
      { riasecType: 'R', weight: 0.1 },
    ],
  }, // Observer nature
  { category: TestType.GENERALE, questionId: 15, profiles: [{ riasecType: 'I', weight: 1.0 }] }, // Recherches histoire – pur I
  { category: TestType.GENERALE, questionId: 16, profiles: [{ riasecType: 'I', weight: 1.0 }] }, // Analyser données – pur I
  {
    category: TestType.GENERALE,
    questionId: 17,
    profiles: [
      { riasecType: 'I', weight: 0.8 },
      { riasecType: 'A', weight: 0.2 },
    ],
  }, // Programmer/créer site web
  { category: TestType.GENERALE, questionId: 18, profiles: [{ riasecType: 'I', weight: 1.0 }] }, // Actualité scientifique – pur I
  {
    category: TestType.GENERALE,
    questionId: 19,
    profiles: [
      { riasecType: 'I', weight: 0.7 },
      { riasecType: 'S', weight: 0.3 },
    ],
  }, // Diagnostiquer maladie
  {
    category: TestType.GENERALE,
    questionId: 20,
    profiles: [
      { riasecType: 'I', weight: 0.7 },
      { riasecType: 'A', weight: 0.3 },
    ],
  }, // Mener expériences

  // A – Artistique (IDs 21-30)
  { category: TestType.GENERALE, questionId: 21, profiles: [{ riasecType: 'A', weight: 1.0 }] }, // Dessiner/peindre/sculpter – pur A
  { category: TestType.GENERALE, questionId: 22, profiles: [{ riasecType: 'A', weight: 1.0 }] }, // Écrire histoires – pur A
  { category: TestType.GENERALE, questionId: 23, profiles: [{ riasecType: 'A', weight: 1.0 }] }, // Jouer instrument – pur A
  { category: TestType.GENERALE, questionId: 24, profiles: [{ riasecType: 'A', weight: 1.0 }] }, // Chanter/danser – pur A
  {
    category: TestType.GENERALE,
    questionId: 25,
    profiles: [
      { riasecType: 'A', weight: 0.9 },
      { riasecType: 'S', weight: 0.1 },
    ],
  }, // Événements culturels
  { category: TestType.GENERALE, questionId: 26, profiles: [{ riasecType: 'A', weight: 1.0 }] }, // Photographier/filmer – pur A
  { category: TestType.GENERALE, questionId: 27, profiles: [{ riasecType: 'A', weight: 1.0 }] }, // Décorer espace – pur A
  {
    category: TestType.GENERALE,
    questionId: 28,
    profiles: [
      { riasecType: 'A', weight: 0.8 },
      { riasecType: 'E', weight: 0.2 },
    ],
  }, // Créer vêtements/bijoux
  {
    category: TestType.GENERALE,
    questionId: 29,
    profiles: [
      { riasecType: 'A', weight: 0.9 },
      { riasecType: 'E', weight: 0.1 },
    ],
  }, // Concepts vidéos/pub
  {
    category: TestType.GENERALE,
    questionId: 30,
    profiles: [
      { riasecType: 'A', weight: 0.7 },
      { riasecType: 'S', weight: 0.3 },
    ],
  }, // Apprendre langues

  // S – Social (IDs 31-40)
  { category: TestType.GENERALE, questionId: 31, profiles: [{ riasecType: 'S', weight: 1.0 }] }, // Aider famille/voisins – pur S
  { category: TestType.GENERALE, questionId: 32, profiles: [{ riasecType: 'S', weight: 1.0 }] }, // Enseigner/expliquer – pur S
  { category: TestType.GENERALE, questionId: 33, profiles: [{ riasecType: 'S', weight: 1.0 }] }, // Écouter/conseiller – pur S
  {
    category: TestType.GENERALE,
    questionId: 34,
    profiles: [
      { riasecType: 'S', weight: 0.9 },
      { riasecType: 'E', weight: 0.1 },
    ],
  }, // Travailler en équipe
  { category: TestType.GENERALE, questionId: 35, profiles: [{ riasecType: 'S', weight: 1.0 }] }, // S'occuper enfants/personnes âgées – pur S
  { category: TestType.GENERALE, questionId: 36, profiles: [{ riasecType: 'S', weight: 1.0 }] }, // Bénévolat – pur S
  {
    category: TestType.GENERALE,
    questionId: 37,
    profiles: [
      { riasecType: 'S', weight: 0.7 },
      { riasecType: 'E', weight: 0.3 },
    ],
  }, // Animer groupe
  { category: TestType.GENERALE, questionId: 38, profiles: [{ riasecType: 'S', weight: 1.0 }] }, // Accueillir/orienter – pur S
  { category: TestType.GENERALE, questionId: 39, profiles: [{ riasecType: 'S', weight: 1.0 }] }, // Développement communautaire – pur S
  {
    category: TestType.GENERALE,
    questionId: 40,
    profiles: [
      { riasecType: 'S', weight: 0.8 },
      { riasecType: 'E', weight: 0.2 },
    ],
  }, // Résoudre conflits

  // E – Entreprenant (IDs 41-50)
  { category: TestType.GENERALE, questionId: 41, profiles: [{ riasecType: 'E', weight: 1.0 }] }, // Organiser événement – pur E
  {
    category: TestType.GENERALE,
    questionId: 42,
    profiles: [
      { riasecType: 'E', weight: 0.8 },
      { riasecType: 'C', weight: 0.2 },
    ],
  }, // Vendre produits
  { category: TestType.GENERALE, questionId: 43, profiles: [{ riasecType: 'E', weight: 1.0 }] }, // Diriger équipe – pur E
  { category: TestType.GENERALE, questionId: 44, profiles: [{ riasecType: 'E', weight: 1.0 }] }, // Négocier/convaincre – pur E
  { category: TestType.GENERALE, questionId: 45, profiles: [{ riasecType: 'E', weight: 1.0 }] }, // Lancer sa propre activité – pur E
  { category: TestType.GENERALE, questionId: 46, profiles: [{ riasecType: 'E', weight: 1.0 }] }, // Débats/opinion publique – pur E
  { category: TestType.GENERALE, questionId: 47, profiles: [{ riasecType: 'E', weight: 1.0 }] }, // Prendre décisions – pur E
  { category: TestType.GENERALE, questionId: 48, profiles: [{ riasecType: 'E', weight: 1.0 }] }, // Réseautage – pur E
  {
    category: TestType.GENERALE,
    questionId: 49,
    profiles: [
      { riasecType: 'E', weight: 0.7 },
      { riasecType: 'C', weight: 0.3 },
    ],
  }, // Stratégies clients
  {
    category: TestType.GENERALE,
    questionId: 50,
    profiles: [
      { riasecType: 'E', weight: 0.9 },
      { riasecType: 'S', weight: 0.1 },
    ],
  }, // Politique/association

  // C – Conventionnel (IDs 51-60)
  { category: TestType.GENERALE, questionId: 51, profiles: [{ riasecType: 'C', weight: 1.0 }] }, // Classer/ranger – pur C
  { category: TestType.GENERALE, questionId: 52, profiles: [{ riasecType: 'C', weight: 1.0 }] }, // Tenir comptes – pur C
  { category: TestType.GENERALE, questionId: 53, profiles: [{ riasecType: 'C', weight: 1.0 }] }, // Respecter procédures – pur C
  { category: TestType.GENERALE, questionId: 54, profiles: [{ riasecType: 'C', weight: 1.0 }] }, // Travailler avec chiffres – pur C
  { category: TestType.GENERALE, questionId: 55, profiles: [{ riasecType: 'C', weight: 1.0 }] }, // Saisie/traitement texte – pur C
  { category: TestType.GENERALE, questionId: 56, profiles: [{ riasecType: 'C', weight: 1.0 }] }, // Planifier/respect délais – pur C
  {
    category: TestType.GENERALE,
    questionId: 57,
    profiles: [
      { riasecType: 'C', weight: 0.8 },
      { riasecType: 'I', weight: 0.2 },
    ],
  }, // Vérifier informations
  { category: TestType.GENERALE, questionId: 58, profiles: [{ riasecType: 'C', weight: 1.0 }] }, // Logiciels gestion – pur C
  { category: TestType.GENERALE, questionId: 59, profiles: [{ riasecType: 'C', weight: 1.0 }] }, // Aimer tâches régulières – pur C
  { category: TestType.GENERALE, questionId: 60, profiles: [{ riasecType: 'C', weight: 1.0 }] }, // Suivre instructions – pur C

  // ============================================================
  // SPECIFIQUE – OCCUPATIONS (IDs 1-60 dans le CSV Specific, type OCCUPATIONS)
  // ============================================================

  {
    questionId: 1,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Mécanicien
  {
    questionId: 2,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Électricien
  {
    questionId: 3,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'R', weight: 0.8 },
      { riasecType: 'I', weight: 0.2 },
    ],
  }, // Agriculteur moderne / Éleveur
  {
    questionId: 4,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Charpentier/Menuisier
  {
    questionId: 5,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Conducteur
  {
    questionId: 6,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'R', weight: 0.9 },
      { riasecType: 'S', weight: 0.1 },
    ],
  }, // Cuisinier
  {
    questionId: 7,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'R', weight: 0.6 },
      { riasecType: 'I', weight: 0.4 },
    ],
  }, // Technicien Fibre Optique
  {
    questionId: 8,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'R', weight: 0.7 },
      { riasecType: 'I', weight: 0.3 },
    ],
  }, // TMEE
  {
    questionId: 9,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Maçon/Plombier
  {
    questionId: 10,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'R', weight: 0.7 },
      { riasecType: 'I', weight: 0.3 },
    ],
  }, // Pisciculteur/Agriculteur tech

  {
    questionId: 11,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Biologiste/Chercheur
  {
    questionId: 12,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'I', weight: 0.7 },
      { riasecType: 'S', weight: 0.3 },
    ],
  }, // Médecin/Sage-femme/Infirmier
  {
    questionId: 13,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'I', weight: 0.8 },
      { riasecType: 'C', weight: 0.2 },
    ],
  }, // Analyste Cybersécurité
  {
    questionId: 14,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Ingénieur
  {
    questionId: 15,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'I', weight: 0.9 },
      { riasecType: 'R', weight: 0.1 },
    ],
  }, // Géologue
  {
    questionId: 16,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Pharmacien
  {
    questionId: 17,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'I', weight: 0.8 },
      { riasecType: 'A', weight: 0.2 },
    ],
  }, // Data Analyst/IA
  {
    questionId: 18,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Économiste/Statisticien
  {
    questionId: 19,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Technicien labo
  {
    questionId: 20,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'I', weight: 0.7 },
      { riasecType: 'A', weight: 0.3 },
    ],
  }, // Développeur mobile

  {
    questionId: 21,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Écrivain/Conteur
  {
    questionId: 22,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Musicien/DJ
  {
    questionId: 23,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'A', weight: 0.9 },
      { riasecType: 'S', weight: 0.1 },
    ],
  }, // Acteur/Metteur en scène
  {
    questionId: 24,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'A', weight: 0.8 },
      { riasecType: 'I', weight: 0.2 },
    ],
  }, // Architecte/Designer
  {
    questionId: 25,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Photographe/Réalisateur
  {
    questionId: 26,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'A', weight: 0.7 },
      { riasecType: 'I', weight: 0.3 },
    ],
  }, // Graphiste/UIUX
  {
    questionId: 27,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Styliste
  {
    questionId: 28,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'A', weight: 0.8 },
      { riasecType: 'S', weight: 0.2 },
    ],
  }, // Journaliste/Critique
  {
    questionId: 29,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'A', weight: 0.9 },
      { riasecType: 'R', weight: 0.1 },
    ],
  }, // Artisan d'art
  {
    questionId: 30,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'A', weight: 0.6 },
      { riasecType: 'E', weight: 0.4 },
    ],
  }, // Publicitaire/Community manager

  {
    questionId: 31,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Enseignant
  {
    questionId: 32,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'S', weight: 0.8 },
      { riasecType: 'I', weight: 0.2 },
    ],
  }, // Infirmier/Aide-soignant
  {
    questionId: 33,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'S', weight: 0.7 },
      { riasecType: 'I', weight: 0.3 },
    ],
  }, // Médecin généraliste
  {
    questionId: 34,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Psychologue
  {
    questionId: 35,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Assistant social
  {
    questionId: 36,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'S', weight: 0.9 },
      { riasecType: 'C', weight: 0.1 },
    ],
  }, // Conseiller d'orientation
  {
    questionId: 37,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'S', weight: 0.7 },
      { riasecType: 'E', weight: 0.3 },
    ],
  }, // Animateur socioculturel
  {
    questionId: 38,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Agent développement ONG
  {
    questionId: 39,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'S', weight: 0.6 },
      { riasecType: 'E', weight: 0.4 },
    ],
  }, // Responsable RH
  {
    questionId: 40,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Personnel d'accueil

  {
    questionId: 41,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Chef entreprise
  {
    questionId: 42,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'E', weight: 0.9 },
      { riasecType: 'S', weight: 0.1 },
    ],
  }, // Directeur commercial
  {
    questionId: 43,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'E', weight: 0.8 },
      { riasecType: 'C', weight: 0.2 },
    ],
  }, // Avocat/Notaire
  {
    questionId: 44,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'E', weight: 0.7 },
      { riasecType: 'I', weight: 0.3 },
    ],
  }, // Promoteur solutions agricoles
  {
    questionId: 45,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'E', weight: 0.8 },
      { riasecType: 'A', weight: 0.2 },
    ],
  }, // Responsable marketing
  {
    questionId: 46,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'E', weight: 0.9 },
      { riasecType: 'S', weight: 0.1 },
    ],
  }, // Homme/Femme politique
  {
    questionId: 47,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'E', weight: 0.8 },
      { riasecType: 'C', weight: 0.2 },
    ],
  }, // Gérant magasin
  {
    questionId: 48,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Consultant
  {
    questionId: 49,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Promoteur immobilier
  {
    questionId: 50,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'E', weight: 0.9 },
      { riasecType: 'C', weight: 0.1 },
    ],
  }, // Courtier assurances

  {
    questionId: 51,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Comptable
  {
    questionId: 52,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'C', weight: 0.8 },
      { riasecType: 'S', weight: 0.2 },
    ],
  }, // Assistant direction
  {
    questionId: 53,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Gestionnaire paie
  {
    questionId: 54,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Archiviste
  {
    questionId: 55,
    category: TestType.OCCUPATIONS,
    profiles: [
      { riasecType: 'C', weight: 0.7 },
      { riasecType: 'I', weight: 0.3 },
    ],
  }, // Contrôleur gestion
  {
    questionId: 56,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Employé banque
  {
    questionId: 57,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Technicien juridique
  {
    questionId: 58,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Gestionnaire admin
  {
    questionId: 59,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Opérateur saisie
  {
    questionId: 60,
    category: TestType.OCCUPATIONS,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Agent impôts/douanes

  // ============================================================
  // SPECIFIQUE – APTITUDES (IDs 61-120 dans le CSV Specific, type APTITUDES)
  // ============================================================

  {
    questionId: 61,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Dextérité manuelle
  {
    questionId: 62,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Utiliser outils
  {
    questionId: 63,
    category: TestType.APTITUDES,
    profiles: [
      { riasecType: 'R', weight: 0.9 },
      { riasecType: 'I', weight: 0.1 },
    ],
  }, // Comprendre mécanique
  {
    questionId: 64,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Endurance physique
  {
    questionId: 65,
    category: TestType.APTITUDES,
    profiles: [
      { riasecType: 'R', weight: 0.7 },
      { riasecType: 'I', weight: 0.3 },
    ],
  }, // Lire plans
  {
    questionId: 66,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Coordonner gestes/vue
  {
    questionId: 67,
    category: TestType.APTITUDES,
    profiles: [
      { riasecType: 'R', weight: 0.9 },
      { riasecType: 'S', weight: 0.1 },
    ],
  }, // Travailler animaux/plantes
  {
    questionId: 68,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Conduire véhicules
  {
    questionId: 69,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Faire réparations
  {
    questionId: 70,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Souci détail manuel

  {
    questionId: 71,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Capacité analyse
  {
    questionId: 72,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Capacité synthèse
  {
    questionId: 73,
    category: TestType.APTITUDES,
    profiles: [
      { riasecType: 'I', weight: 0.8 },
      { riasecType: 'R', weight: 0.2 },
    ],
  }, // Résoudre problèmes abstraits
  {
    questionId: 74,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Esprit logique/critique
  {
    questionId: 75,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Rigueur intellectuelle
  {
    questionId: 76,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Compréhension maths/sciences
  {
    questionId: 77,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Curiosité intellectuelle
  {
    questionId: 78,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Recherche/collecte données
  {
    questionId: 79,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Concentration longue
  {
    questionId: 80,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Travailler labo

  {
    questionId: 81,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Sens esthétique
  {
    questionId: 82,
    category: TestType.APTITUDES,
    profiles: [
      { riasecType: 'A', weight: 0.9 },
      { riasecType: 'I', weight: 0.1 },
    ],
  }, // Créativité/imagination
  {
    questionId: 83,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Dessiner/peindre/créer
  {
    questionId: 84,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Écrire/rédiger
  {
    questionId: 85,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Jouer instrument/chanter/danser
  {
    questionId: 86,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Exprimer émotions
  {
    questionId: 87,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Idées originales
  {
    questionId: 88,
    category: TestType.APTITUDES,
    profiles: [
      { riasecType: 'A', weight: 0.8 },
      { riasecType: 'S', weight: 0.2 },
    ],
  }, // Apprendre langues
  {
    questionId: 89,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Photo/film/montage
  {
    questionId: 90,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Accepter critique

  {
    questionId: 91,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Facilité communication
  {
    questionId: 92,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Écouter activement
  {
    questionId: 93,
    category: TestType.APTITUDES,
    profiles: [
      { riasecType: 'S', weight: 0.9 },
      { riasecType: 'E', weight: 0.1 },
    ],
  }, // Travailler équipe
  {
    questionId: 94,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Empathie
  {
    questionId: 95,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Enseigner/expliquer
  {
    questionId: 96,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Accueillir/aider
  {
    questionId: 97,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Observation psychologique
  {
    questionId: 98,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Patience/tolérance
  {
    questionId: 99,
    category: TestType.APTITUDES,
    profiles: [
      { riasecType: 'S', weight: 0.8 },
      { riasecType: 'E', weight: 0.2 },
    ],
  }, // Négocier/résoudre conflits
  {
    questionId: 100,
    category: TestType.APTITUDES,
    profiles: [
      { riasecType: 'S', weight: 0.7 },
      { riasecType: 'E', weight: 0.3 },
    ],
  }, // Animer groupe

  {
    questionId: 101,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Leadership
  {
    questionId: 102,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Persuasion/éloquence
  {
    questionId: 103,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Décisions rapides
  {
    questionId: 104,
    category: TestType.APTITUDES,
    profiles: [
      { riasecType: 'E', weight: 0.7 },
      { riasecType: 'C', weight: 0.3 },
    ],
  }, // Organisation/planification
  {
    questionId: 105,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Prise risque/audace
  {
    questionId: 106,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Esprit compétition
  {
    questionId: 107,
    category: TestType.APTITUDES,
    profiles: [
      { riasecType: 'E', weight: 0.9 },
      { riasecType: 'S', weight: 0.1 },
    ],
  }, // Vendre produit/service
  {
    questionId: 108,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Détermination/persévérance
  {
    questionId: 109,
    category: TestType.APTITUDES,
    profiles: [
      { riasecType: 'E', weight: 0.8 },
      { riasecType: 'C', weight: 0.2 },
    ],
  }, // Gérer budget/sens affaires
  {
    questionId: 110,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // À l'aise en public

  {
    questionId: 111,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Rigueur/précision
  {
    questionId: 112,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Organisation/rangement
  {
    questionId: 113,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Tenir comptes
  {
    questionId: 114,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Respecter procédures
  {
    questionId: 115,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Efficacité administrative
  {
    questionId: 116,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Accepter routine
  {
    questionId: 117,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Maîtrise bureautique
  {
    questionId: 118,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Classer/archiver
  {
    questionId: 119,
    category: TestType.APTITUDES,
    profiles: [
      { riasecType: 'C', weight: 0.8 },
      { riasecType: 'I', weight: 0.2 },
    ],
  }, // Vérifier données
  {
    questionId: 120,
    category: TestType.APTITUDES,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Ponctualité/délais

  // ============================================================
  // SPECIFIQUE – PERSONALITY (IDs 121-180 dans le CSV Specific, type PERSONALITY)
  // ============================================================

  {
    questionId: 121,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Choses concrètes
  {
    questionId: 122,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Réservé
  {
    questionId: 123,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Persévérant/stable
  {
    questionId: 124,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Direct/franc
  {
    questionId: 125,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Soin outils
  {
    questionId: 126,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Agir plutôt que discuter
  {
    questionId: 127,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Endurant physiquement
  {
    questionId: 128,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Patient/minutieux
  {
    questionId: 129,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Attaché méthodes tradi
  {
    questionId: 130,
    category: TestType.PERSONALITY,
    profiles: [
      { riasecType: 'R', weight: 0.8 },
      { riasecType: 'I', weight: 0.2 },
    ],
  }, // Indépendant/aime travailler seul

  {
    questionId: 131,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Curieux/aime apprendre
  {
    questionId: 132,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Analyse profonde
  {
    questionId: 133,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Calme/réfléchi
  {
    questionId: 134,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Méthodique/rigoureux
  {
    questionId: 135,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Esprit critique
  {
    questionId: 136,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Aime problèmes complexes
  {
    questionId: 137,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Liberté de penser
  {
    questionId: 138,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Logique/rationnel
  {
    questionId: 139,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Concentration longue
  {
    questionId: 140,
    category: TestType.PERSONALITY,
    profiles: [
      { riasecType: 'I', weight: 0.8 },
      { riasecType: 'A', weight: 0.2 },
    ],
  }, // Ouvert d'esprit

  {
    questionId: 141,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Créatif/imaginatif
  {
    questionId: 142,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Sensible/émotif
  {
    questionId: 143,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Besoin liberté/indépendance
  {
    questionId: 144,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Spontané/expressif
  {
    questionId: 145,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Original/se démarquer
  {
    questionId: 146,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // N'aime pas routine
  {
    questionId: 147,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Intuitif
  {
    questionId: 148,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Passionné
  {
    questionId: 149,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Peut être désordonné
  {
    questionId: 150,
    category: TestType.PERSONALITY,
    profiles: [
      { riasecType: 'A', weight: 0.8 },
      { riasecType: 'S', weight: 0.2 },
    ],
  }, // Tendance à idéaliser

  {
    questionId: 151,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Empathique
  {
    questionId: 152,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Coopératif
  {
    questionId: 153,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Amical/chaleureux
  {
    questionId: 154,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Serviable/généreux
  {
    questionId: 155,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Compréhensif
  {
    questionId: 156,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Communique clairement
  {
    questionId: 157,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Fiable
  {
    questionId: 158,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Comprend vite les gens
  {
    questionId: 159,
    category: TestType.PERSONALITY,
    profiles: [
      { riasecType: 'S', weight: 0.8 },
      { riasecType: 'E', weight: 0.2 },
    ],
  }, // Préfère discussion au conflit
  {
    questionId: 160,
    category: TestType.PERSONALITY,
    profiles: [
      { riasecType: 'S', weight: 0.7 },
      { riasecType: 'C', weight: 0.3 },
    ],
  }, // Souple/conciliant

  {
    questionId: 161,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Ambitieux
  {
    questionId: 162,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Énergique/dynamique
  {
    questionId: 163,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Optimiste/confiant
  {
    questionId: 164,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Persuasif
  {
    questionId: 165,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Sociable
  {
    questionId: 166,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Aime défis
  {
    questionId: 167,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Déterminé
  {
    questionId: 168,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Aime initiatives
  {
    questionId: 169,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Débrouillard
  {
    questionId: 170,
    category: TestType.PERSONALITY,
    profiles: [
      { riasecType: 'E', weight: 0.9 },
      { riasecType: 'S', weight: 0.1 },
    ],
  }, // Aime diriger

  {
    questionId: 171,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Organisé/méthodique
  {
    questionId: 172,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Digne de confiance
  {
    questionId: 173,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Aime clair et rangé
  {
    questionId: 174,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Précis/minutieux
  {
    questionId: 175,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Ponctuel
  {
    questionId: 176,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Respecte règles
  {
    questionId: 177,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Efficace/ordonné
  {
    questionId: 178,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Consciencieux
  {
    questionId: 179,
    category: TestType.PERSONALITY,
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Discret
  {
    questionId: 180,
    category: TestType.PERSONALITY,
    profiles: [
      { riasecType: 'C', weight: 0.8 },
      { riasecType: 'R', weight: 0.2 },
    ],
  }, // Aime instructions précises
];

/**
 * Seed principal : pour chaque configuration, on supprime les anciens profils
 * de la question et on insère les nouveaux.
 * Les questions non listées ne recevront aucun profil (vous pouvez modifier
 * pour ajouter un profil par défaut si nécessaire).
 */
export async function seedQuestionProfiles(prisma: PrismaService) {
  console.log('Seeding QuestionProfile (multi-RIASEC)...');

  let created = 0;
  let skipped = 0;

  for (const item of manualProfiles) {
    const question = await prisma.question.findFirst({
      where: { id: item.questionId, category: item.category },
      select: { id: true },
    });

    if (!question) {
      console.warn(`Question introuvable : catégorie ${item.category}, ID ${item.questionId}`);
      skipped++;
      continue;
    }

    // Supprimer les anciens profils de cette question
    await prisma.questionProfile.deleteMany({
      where: {
        questionId: item.questionId,
      },
    });

    // Insérer les nouveaux profils
    for (const profile of item.profiles) {
      await prisma.questionProfile.create({
        data: {
          questionId: item.questionId,
          category: item.category,
          riasecType: profile.riasecType,
          weight: profile.weight,
        },
      });
      created++;
    }
  }

  console.log(
    `QuestionProfile terminé : ${created} entrées créées, ${skipped} questions ignorées.`,
  );
}
