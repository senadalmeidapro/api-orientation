import { PhaseType, type Phase2Type, type RiasecType } from '@prisma/client';
import type { PrismaService } from '../../../prisma/prisma.service';

/**
 * Configuration manuelle des profils multi‑RIASEC.
 * Pour chaque question (Phase1 + Phase2), on définit la liste des dimensions avec leurs poids.
 *
 * Si une question n'apparaît pas dans cette configuration, elle recevra
 * automatiquement son profil principal (riasec_type_id) avec weight = 1.0.
 */
const manualProfiles: {
  phase: PhaseType;
  questionId: number;
  phase2Type?: Phase2Type; // obligatoire pour Phase2
  profiles: { riasecType: RiasecType; weight: number }[];
}[] = [
  // ============================================================
  // PHASE 1 (IDs 1 à 60)
  // ============================================================

  // R – Réaliste (IDs 1-10)
  {
    phase: PhaseType.PHASE1,
    questionId: 1,
    profiles: [
      { riasecType: 'R', weight: 0.8 },
      { riasecType: 'I', weight: 0.2 },
    ],
  }, // Travailler dans un champ
  {
    phase: PhaseType.PHASE1,
    questionId: 2,
    profiles: [
      { riasecType: 'R', weight: 0.9 },
      { riasecType: 'I', weight: 0.1 },
    ],
  }, // Réparer vélo/moto
  { phase: PhaseType.PHASE1, questionId: 3, profiles: [{ riasecType: 'R', weight: 1.0 }] }, // Construire objets bois/métal – pur R
  { phase: PhaseType.PHASE1, questionId: 4, profiles: [{ riasecType: 'R', weight: 1.0 }] }, // Conduire véhicule – pur R
  {
    phase: PhaseType.PHASE1,
    questionId: 5,
    profiles: [
      { riasecType: 'R', weight: 0.9 },
      { riasecType: 'S', weight: 0.1 },
    ],
  }, // S'occuper d'animaux
  { phase: PhaseType.PHASE1, questionId: 6, profiles: [{ riasecType: 'R', weight: 1.0 }] }, // Utiliser des outils – pur R
  { phase: PhaseType.PHASE1, questionId: 7, profiles: [{ riasecType: 'R', weight: 1.0 }] }, // Maçonnerie/peinture – pur R
  {
    phase: PhaseType.PHASE1,
    questionId: 8,
    profiles: [
      { riasecType: 'R', weight: 0.8 },
      { riasecType: 'I', weight: 0.2 },
    ],
  }, // Installer panneaux solaires
  {
    phase: PhaseType.PHASE1,
    questionId: 9,
    profiles: [
      { riasecType: 'R', weight: 0.7 },
      { riasecType: 'I', weight: 0.3 },
    ],
  }, // Machines agricoles
  {
    phase: PhaseType.PHASE1,
    questionId: 10,
    profiles: [
      { riasecType: 'R', weight: 0.6 },
      { riasecType: 'I', weight: 0.4 },
    ],
  }, // Lire plans

  // I – Investigateur (IDs 11-20)
  { phase: PhaseType.PHASE1, questionId: 11, profiles: [{ riasecType: 'I', weight: 1.0 }] }, // Lire pour apprendre – pur I
  { phase: PhaseType.PHASE1, questionId: 12, profiles: [{ riasecType: 'I', weight: 1.0 }] }, // Résoudre problèmes maths/logique – pur I
  { phase: PhaseType.PHASE1, questionId: 13, profiles: [{ riasecType: 'I', weight: 1.0 }] }, // Comprendre technologies – pur I
  {
    phase: PhaseType.PHASE1,
    questionId: 14,
    profiles: [
      { riasecType: 'I', weight: 0.9 },
      { riasecType: 'R', weight: 0.1 },
    ],
  }, // Observer nature
  { phase: PhaseType.PHASE1, questionId: 15, profiles: [{ riasecType: 'I', weight: 1.0 }] }, // Recherches histoire – pur I
  { phase: PhaseType.PHASE1, questionId: 16, profiles: [{ riasecType: 'I', weight: 1.0 }] }, // Analyser données – pur I
  {
    phase: PhaseType.PHASE1,
    questionId: 17,
    profiles: [
      { riasecType: 'I', weight: 0.8 },
      { riasecType: 'A', weight: 0.2 },
    ],
  }, // Programmer/créer site web
  { phase: PhaseType.PHASE1, questionId: 18, profiles: [{ riasecType: 'I', weight: 1.0 }] }, // Actualité scientifique – pur I
  {
    phase: PhaseType.PHASE1,
    questionId: 19,
    profiles: [
      { riasecType: 'I', weight: 0.7 },
      { riasecType: 'S', weight: 0.3 },
    ],
  }, // Diagnostiquer maladie
  {
    phase: PhaseType.PHASE1,
    questionId: 20,
    profiles: [
      { riasecType: 'I', weight: 0.7 },
      { riasecType: 'A', weight: 0.3 },
    ],
  }, // Mener expériences

  // A – Artistique (IDs 21-30)
  { phase: PhaseType.PHASE1, questionId: 21, profiles: [{ riasecType: 'A', weight: 1.0 }] }, // Dessiner/peindre/sculpter – pur A
  { phase: PhaseType.PHASE1, questionId: 22, profiles: [{ riasecType: 'A', weight: 1.0 }] }, // Écrire histoires – pur A
  { phase: PhaseType.PHASE1, questionId: 23, profiles: [{ riasecType: 'A', weight: 1.0 }] }, // Jouer instrument – pur A
  { phase: PhaseType.PHASE1, questionId: 24, profiles: [{ riasecType: 'A', weight: 1.0 }] }, // Chanter/danser – pur A
  {
    phase: PhaseType.PHASE1,
    questionId: 25,
    profiles: [
      { riasecType: 'A', weight: 0.9 },
      { riasecType: 'S', weight: 0.1 },
    ],
  }, // Événements culturels
  { phase: PhaseType.PHASE1, questionId: 26, profiles: [{ riasecType: 'A', weight: 1.0 }] }, // Photographier/filmer – pur A
  { phase: PhaseType.PHASE1, questionId: 27, profiles: [{ riasecType: 'A', weight: 1.0 }] }, // Décorer espace – pur A
  {
    phase: PhaseType.PHASE1,
    questionId: 28,
    profiles: [
      { riasecType: 'A', weight: 0.8 },
      { riasecType: 'E', weight: 0.2 },
    ],
  }, // Créer vêtements/bijoux
  {
    phase: PhaseType.PHASE1,
    questionId: 29,
    profiles: [
      { riasecType: 'A', weight: 0.9 },
      { riasecType: 'E', weight: 0.1 },
    ],
  }, // Concepts vidéos/pub
  {
    phase: PhaseType.PHASE1,
    questionId: 30,
    profiles: [
      { riasecType: 'A', weight: 0.7 },
      { riasecType: 'S', weight: 0.3 },
    ],
  }, // Apprendre langues

  // S – Social (IDs 31-40)
  { phase: PhaseType.PHASE1, questionId: 31, profiles: [{ riasecType: 'S', weight: 1.0 }] }, // Aider famille/voisins – pur S
  { phase: PhaseType.PHASE1, questionId: 32, profiles: [{ riasecType: 'S', weight: 1.0 }] }, // Enseigner/expliquer – pur S
  { phase: PhaseType.PHASE1, questionId: 33, profiles: [{ riasecType: 'S', weight: 1.0 }] }, // Écouter/conseiller – pur S
  {
    phase: PhaseType.PHASE1,
    questionId: 34,
    profiles: [
      { riasecType: 'S', weight: 0.9 },
      { riasecType: 'E', weight: 0.1 },
    ],
  }, // Travailler en équipe
  { phase: PhaseType.PHASE1, questionId: 35, profiles: [{ riasecType: 'S', weight: 1.0 }] }, // S'occuper enfants/personnes âgées – pur S
  { phase: PhaseType.PHASE1, questionId: 36, profiles: [{ riasecType: 'S', weight: 1.0 }] }, // Bénévolat – pur S
  {
    phase: PhaseType.PHASE1,
    questionId: 37,
    profiles: [
      { riasecType: 'S', weight: 0.7 },
      { riasecType: 'E', weight: 0.3 },
    ],
  }, // Animer groupe
  { phase: PhaseType.PHASE1, questionId: 38, profiles: [{ riasecType: 'S', weight: 1.0 }] }, // Accueillir/orienter – pur S
  { phase: PhaseType.PHASE1, questionId: 39, profiles: [{ riasecType: 'S', weight: 1.0 }] }, // Développement communautaire – pur S
  {
    phase: PhaseType.PHASE1,
    questionId: 40,
    profiles: [
      { riasecType: 'S', weight: 0.8 },
      { riasecType: 'E', weight: 0.2 },
    ],
  }, // Résoudre conflits

  // E – Entreprenant (IDs 41-50)
  { phase: PhaseType.PHASE1, questionId: 41, profiles: [{ riasecType: 'E', weight: 1.0 }] }, // Organiser événement – pur E
  {
    phase: PhaseType.PHASE1,
    questionId: 42,
    profiles: [
      { riasecType: 'E', weight: 0.8 },
      { riasecType: 'C', weight: 0.2 },
    ],
  }, // Vendre produits
  { phase: PhaseType.PHASE1, questionId: 43, profiles: [{ riasecType: 'E', weight: 1.0 }] }, // Diriger équipe – pur E
  { phase: PhaseType.PHASE1, questionId: 44, profiles: [{ riasecType: 'E', weight: 1.0 }] }, // Négocier/convaincre – pur E
  { phase: PhaseType.PHASE1, questionId: 45, profiles: [{ riasecType: 'E', weight: 1.0 }] }, // Lancer sa propre activité – pur E
  { phase: PhaseType.PHASE1, questionId: 46, profiles: [{ riasecType: 'E', weight: 1.0 }] }, // Débats/opinion publique – pur E
  { phase: PhaseType.PHASE1, questionId: 47, profiles: [{ riasecType: 'E', weight: 1.0 }] }, // Prendre décisions – pur E
  { phase: PhaseType.PHASE1, questionId: 48, profiles: [{ riasecType: 'E', weight: 1.0 }] }, // Réseautage – pur E
  {
    phase: PhaseType.PHASE1,
    questionId: 49,
    profiles: [
      { riasecType: 'E', weight: 0.7 },
      { riasecType: 'C', weight: 0.3 },
    ],
  }, // Stratégies clients
  {
    phase: PhaseType.PHASE1,
    questionId: 50,
    profiles: [
      { riasecType: 'E', weight: 0.9 },
      { riasecType: 'S', weight: 0.1 },
    ],
  }, // Politique/association

  // C – Conventionnel (IDs 51-60)
  { phase: PhaseType.PHASE1, questionId: 51, profiles: [{ riasecType: 'C', weight: 1.0 }] }, // Classer/ranger – pur C
  { phase: PhaseType.PHASE1, questionId: 52, profiles: [{ riasecType: 'C', weight: 1.0 }] }, // Tenir comptes – pur C
  { phase: PhaseType.PHASE1, questionId: 53, profiles: [{ riasecType: 'C', weight: 1.0 }] }, // Respecter procédures – pur C
  { phase: PhaseType.PHASE1, questionId: 54, profiles: [{ riasecType: 'C', weight: 1.0 }] }, // Travailler avec chiffres – pur C
  { phase: PhaseType.PHASE1, questionId: 55, profiles: [{ riasecType: 'C', weight: 1.0 }] }, // Saisie/traitement texte – pur C
  { phase: PhaseType.PHASE1, questionId: 56, profiles: [{ riasecType: 'C', weight: 1.0 }] }, // Planifier/respect délais – pur C
  {
    phase: PhaseType.PHASE1,
    questionId: 57,
    profiles: [
      { riasecType: 'C', weight: 0.8 },
      { riasecType: 'I', weight: 0.2 },
    ],
  }, // Vérifier informations
  { phase: PhaseType.PHASE1, questionId: 58, profiles: [{ riasecType: 'C', weight: 1.0 }] }, // Logiciels gestion – pur C
  { phase: PhaseType.PHASE1, questionId: 59, profiles: [{ riasecType: 'C', weight: 1.0 }] }, // Aimer tâches régulières – pur C
  { phase: PhaseType.PHASE1, questionId: 60, profiles: [{ riasecType: 'C', weight: 1.0 }] }, // Suivre instructions – pur C

  // ============================================================
  // PHASE 2 – OCCUPATIONS (IDs 1-60 dans le CSV Phase2, type OCCUPATIONS)
  // ============================================================

  {
    phase: PhaseType.PHASE2,
    questionId: 1,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Mécanicien
  {
    phase: PhaseType.PHASE2,
    questionId: 2,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Électricien
  {
    phase: PhaseType.PHASE2,
    questionId: 3,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'R', weight: 0.8 },
      { riasecType: 'I', weight: 0.2 },
    ],
  }, // Agriculteur moderne / Éleveur
  {
    phase: PhaseType.PHASE2,
    questionId: 4,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Charpentier/Menuisier
  {
    phase: PhaseType.PHASE2,
    questionId: 5,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Conducteur
  {
    phase: PhaseType.PHASE2,
    questionId: 6,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'R', weight: 0.9 },
      { riasecType: 'S', weight: 0.1 },
    ],
  }, // Cuisinier
  {
    phase: PhaseType.PHASE2,
    questionId: 7,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'R', weight: 0.6 },
      { riasecType: 'I', weight: 0.4 },
    ],
  }, // Technicien Fibre Optique
  {
    phase: PhaseType.PHASE2,
    questionId: 8,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'R', weight: 0.7 },
      { riasecType: 'I', weight: 0.3 },
    ],
  }, // TMEE
  {
    phase: PhaseType.PHASE2,
    questionId: 9,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Maçon/Plombier
  {
    phase: PhaseType.PHASE2,
    questionId: 10,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'R', weight: 0.7 },
      { riasecType: 'I', weight: 0.3 },
    ],
  }, // Pisciculteur/Agriculteur tech

  {
    phase: PhaseType.PHASE2,
    questionId: 11,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Biologiste/Chercheur
  {
    phase: PhaseType.PHASE2,
    questionId: 12,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'I', weight: 0.7 },
      { riasecType: 'S', weight: 0.3 },
    ],
  }, // Médecin/Sage-femme/Infirmier
  {
    phase: PhaseType.PHASE2,
    questionId: 13,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'I', weight: 0.8 },
      { riasecType: 'C', weight: 0.2 },
    ],
  }, // Analyste Cybersécurité
  {
    phase: PhaseType.PHASE2,
    questionId: 14,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Ingénieur
  {
    phase: PhaseType.PHASE2,
    questionId: 15,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'I', weight: 0.9 },
      { riasecType: 'R', weight: 0.1 },
    ],
  }, // Géologue
  {
    phase: PhaseType.PHASE2,
    questionId: 16,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Pharmacien
  {
    phase: PhaseType.PHASE2,
    questionId: 17,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'I', weight: 0.8 },
      { riasecType: 'A', weight: 0.2 },
    ],
  }, // Data Analyst/IA
  {
    phase: PhaseType.PHASE2,
    questionId: 18,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Économiste/Statisticien
  {
    phase: PhaseType.PHASE2,
    questionId: 19,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Technicien labo
  {
    phase: PhaseType.PHASE2,
    questionId: 20,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'I', weight: 0.7 },
      { riasecType: 'A', weight: 0.3 },
    ],
  }, // Développeur mobile

  {
    phase: PhaseType.PHASE2,
    questionId: 21,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Écrivain/Conteur
  {
    phase: PhaseType.PHASE2,
    questionId: 22,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Musicien/DJ
  {
    phase: PhaseType.PHASE2,
    questionId: 23,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'A', weight: 0.9 },
      { riasecType: 'S', weight: 0.1 },
    ],
  }, // Acteur/Metteur en scène
  {
    phase: PhaseType.PHASE2,
    questionId: 24,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'A', weight: 0.8 },
      { riasecType: 'I', weight: 0.2 },
    ],
  }, // Architecte/Designer
  {
    phase: PhaseType.PHASE2,
    questionId: 25,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Photographe/Réalisateur
  {
    phase: PhaseType.PHASE2,
    questionId: 26,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'A', weight: 0.7 },
      { riasecType: 'I', weight: 0.3 },
    ],
  }, // Graphiste/UIUX
  {
    phase: PhaseType.PHASE2,
    questionId: 27,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Styliste
  {
    phase: PhaseType.PHASE2,
    questionId: 28,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'A', weight: 0.8 },
      { riasecType: 'S', weight: 0.2 },
    ],
  }, // Journaliste/Critique
  {
    phase: PhaseType.PHASE2,
    questionId: 29,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'A', weight: 0.9 },
      { riasecType: 'R', weight: 0.1 },
    ],
  }, // Artisan d'art
  {
    phase: PhaseType.PHASE2,
    questionId: 30,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'A', weight: 0.6 },
      { riasecType: 'E', weight: 0.4 },
    ],
  }, // Publicitaire/Community manager

  {
    phase: PhaseType.PHASE2,
    questionId: 31,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Enseignant
  {
    phase: PhaseType.PHASE2,
    questionId: 32,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'S', weight: 0.8 },
      { riasecType: 'I', weight: 0.2 },
    ],
  }, // Infirmier/Aide-soignant
  {
    phase: PhaseType.PHASE2,
    questionId: 33,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'S', weight: 0.7 },
      { riasecType: 'I', weight: 0.3 },
    ],
  }, // Médecin généraliste
  {
    phase: PhaseType.PHASE2,
    questionId: 34,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Psychologue
  {
    phase: PhaseType.PHASE2,
    questionId: 35,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Assistant social
  {
    phase: PhaseType.PHASE2,
    questionId: 36,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'S', weight: 0.9 },
      { riasecType: 'C', weight: 0.1 },
    ],
  }, // Conseiller d'orientation
  {
    phase: PhaseType.PHASE2,
    questionId: 37,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'S', weight: 0.7 },
      { riasecType: 'E', weight: 0.3 },
    ],
  }, // Animateur socioculturel
  {
    phase: PhaseType.PHASE2,
    questionId: 38,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Agent développement ONG
  {
    phase: PhaseType.PHASE2,
    questionId: 39,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'S', weight: 0.6 },
      { riasecType: 'E', weight: 0.4 },
    ],
  }, // Responsable RH
  {
    phase: PhaseType.PHASE2,
    questionId: 40,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Personnel d'accueil

  {
    phase: PhaseType.PHASE2,
    questionId: 41,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Chef entreprise
  {
    phase: PhaseType.PHASE2,
    questionId: 42,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'E', weight: 0.9 },
      { riasecType: 'S', weight: 0.1 },
    ],
  }, // Directeur commercial
  {
    phase: PhaseType.PHASE2,
    questionId: 43,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'E', weight: 0.8 },
      { riasecType: 'C', weight: 0.2 },
    ],
  }, // Avocat/Notaire
  {
    phase: PhaseType.PHASE2,
    questionId: 44,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'E', weight: 0.7 },
      { riasecType: 'I', weight: 0.3 },
    ],
  }, // Promoteur solutions agricoles
  {
    phase: PhaseType.PHASE2,
    questionId: 45,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'E', weight: 0.8 },
      { riasecType: 'A', weight: 0.2 },
    ],
  }, // Responsable marketing
  {
    phase: PhaseType.PHASE2,
    questionId: 46,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'E', weight: 0.9 },
      { riasecType: 'S', weight: 0.1 },
    ],
  }, // Homme/Femme politique
  {
    phase: PhaseType.PHASE2,
    questionId: 47,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'E', weight: 0.8 },
      { riasecType: 'C', weight: 0.2 },
    ],
  }, // Gérant magasin
  {
    phase: PhaseType.PHASE2,
    questionId: 48,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Consultant
  {
    phase: PhaseType.PHASE2,
    questionId: 49,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Promoteur immobilier
  {
    phase: PhaseType.PHASE2,
    questionId: 50,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'E', weight: 0.9 },
      { riasecType: 'C', weight: 0.1 },
    ],
  }, // Courtier assurances

  {
    phase: PhaseType.PHASE2,
    questionId: 51,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Comptable
  {
    phase: PhaseType.PHASE2,
    questionId: 52,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'C', weight: 0.8 },
      { riasecType: 'S', weight: 0.2 },
    ],
  }, // Assistant direction
  {
    phase: PhaseType.PHASE2,
    questionId: 53,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Gestionnaire paie
  {
    phase: PhaseType.PHASE2,
    questionId: 54,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Archiviste
  {
    phase: PhaseType.PHASE2,
    questionId: 55,
    phase2Type: 'OCCUPATIONS',
    profiles: [
      { riasecType: 'C', weight: 0.7 },
      { riasecType: 'I', weight: 0.3 },
    ],
  }, // Contrôleur gestion
  {
    phase: PhaseType.PHASE2,
    questionId: 56,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Employé banque
  {
    phase: PhaseType.PHASE2,
    questionId: 57,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Technicien juridique
  {
    phase: PhaseType.PHASE2,
    questionId: 58,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Gestionnaire admin
  {
    phase: PhaseType.PHASE2,
    questionId: 59,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Opérateur saisie
  {
    phase: PhaseType.PHASE2,
    questionId: 60,
    phase2Type: 'OCCUPATIONS',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Agent impôts/douanes

  // ============================================================
  // PHASE 2 – APTITUDES (IDs 61-120 dans le CSV Phase2, type APTITUDES)
  // ============================================================

  {
    phase: PhaseType.PHASE2,
    questionId: 61,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Dextérité manuelle
  {
    phase: PhaseType.PHASE2,
    questionId: 62,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Utiliser outils
  {
    phase: PhaseType.PHASE2,
    questionId: 63,
    phase2Type: 'APTITUDES',
    profiles: [
      { riasecType: 'R', weight: 0.9 },
      { riasecType: 'I', weight: 0.1 },
    ],
  }, // Comprendre mécanique
  {
    phase: PhaseType.PHASE2,
    questionId: 64,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Endurance physique
  {
    phase: PhaseType.PHASE2,
    questionId: 65,
    phase2Type: 'APTITUDES',
    profiles: [
      { riasecType: 'R', weight: 0.7 },
      { riasecType: 'I', weight: 0.3 },
    ],
  }, // Lire plans
  {
    phase: PhaseType.PHASE2,
    questionId: 66,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Coordonner gestes/vue
  {
    phase: PhaseType.PHASE2,
    questionId: 67,
    phase2Type: 'APTITUDES',
    profiles: [
      { riasecType: 'R', weight: 0.9 },
      { riasecType: 'S', weight: 0.1 },
    ],
  }, // Travailler animaux/plantes
  {
    phase: PhaseType.PHASE2,
    questionId: 68,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Conduire véhicules
  {
    phase: PhaseType.PHASE2,
    questionId: 69,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Faire réparations
  {
    phase: PhaseType.PHASE2,
    questionId: 70,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Souci détail manuel

  {
    phase: PhaseType.PHASE2,
    questionId: 71,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Capacité analyse
  {
    phase: PhaseType.PHASE2,
    questionId: 72,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Capacité synthèse
  {
    phase: PhaseType.PHASE2,
    questionId: 73,
    phase2Type: 'APTITUDES',
    profiles: [
      { riasecType: 'I', weight: 0.8 },
      { riasecType: 'R', weight: 0.2 },
    ],
  }, // Résoudre problèmes abstraits
  {
    phase: PhaseType.PHASE2,
    questionId: 74,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Esprit logique/critique
  {
    phase: PhaseType.PHASE2,
    questionId: 75,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Rigueur intellectuelle
  {
    phase: PhaseType.PHASE2,
    questionId: 76,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Compréhension maths/sciences
  {
    phase: PhaseType.PHASE2,
    questionId: 77,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Curiosité intellectuelle
  {
    phase: PhaseType.PHASE2,
    questionId: 78,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Recherche/collecte données
  {
    phase: PhaseType.PHASE2,
    questionId: 79,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Concentration longue
  {
    phase: PhaseType.PHASE2,
    questionId: 80,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Travailler labo

  {
    phase: PhaseType.PHASE2,
    questionId: 81,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Sens esthétique
  {
    phase: PhaseType.PHASE2,
    questionId: 82,
    phase2Type: 'APTITUDES',
    profiles: [
      { riasecType: 'A', weight: 0.9 },
      { riasecType: 'I', weight: 0.1 },
    ],
  }, // Créativité/imagination
  {
    phase: PhaseType.PHASE2,
    questionId: 83,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Dessiner/peindre/créer
  {
    phase: PhaseType.PHASE2,
    questionId: 84,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Écrire/rédiger
  {
    phase: PhaseType.PHASE2,
    questionId: 85,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Jouer instrument/chanter/danser
  {
    phase: PhaseType.PHASE2,
    questionId: 86,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Exprimer émotions
  {
    phase: PhaseType.PHASE2,
    questionId: 87,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Idées originales
  {
    phase: PhaseType.PHASE2,
    questionId: 88,
    phase2Type: 'APTITUDES',
    profiles: [
      { riasecType: 'A', weight: 0.8 },
      { riasecType: 'S', weight: 0.2 },
    ],
  }, // Apprendre langues
  {
    phase: PhaseType.PHASE2,
    questionId: 89,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Photo/film/montage
  {
    phase: PhaseType.PHASE2,
    questionId: 90,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Accepter critique

  {
    phase: PhaseType.PHASE2,
    questionId: 91,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Facilité communication
  {
    phase: PhaseType.PHASE2,
    questionId: 92,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Écouter activement
  {
    phase: PhaseType.PHASE2,
    questionId: 93,
    phase2Type: 'APTITUDES',
    profiles: [
      { riasecType: 'S', weight: 0.9 },
      { riasecType: 'E', weight: 0.1 },
    ],
  }, // Travailler équipe
  {
    phase: PhaseType.PHASE2,
    questionId: 94,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Empathie
  {
    phase: PhaseType.PHASE2,
    questionId: 95,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Enseigner/expliquer
  {
    phase: PhaseType.PHASE2,
    questionId: 96,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Accueillir/aider
  {
    phase: PhaseType.PHASE2,
    questionId: 97,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Observation psychologique
  {
    phase: PhaseType.PHASE2,
    questionId: 98,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Patience/tolérance
  {
    phase: PhaseType.PHASE2,
    questionId: 99,
    phase2Type: 'APTITUDES',
    profiles: [
      { riasecType: 'S', weight: 0.8 },
      { riasecType: 'E', weight: 0.2 },
    ],
  }, // Négocier/résoudre conflits
  {
    phase: PhaseType.PHASE2,
    questionId: 100,
    phase2Type: 'APTITUDES',
    profiles: [
      { riasecType: 'S', weight: 0.7 },
      { riasecType: 'E', weight: 0.3 },
    ],
  }, // Animer groupe

  {
    phase: PhaseType.PHASE2,
    questionId: 101,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Leadership
  {
    phase: PhaseType.PHASE2,
    questionId: 102,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Persuasion/éloquence
  {
    phase: PhaseType.PHASE2,
    questionId: 103,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Décisions rapides
  {
    phase: PhaseType.PHASE2,
    questionId: 104,
    phase2Type: 'APTITUDES',
    profiles: [
      { riasecType: 'E', weight: 0.7 },
      { riasecType: 'C', weight: 0.3 },
    ],
  }, // Organisation/planification
  {
    phase: PhaseType.PHASE2,
    questionId: 105,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Prise risque/audace
  {
    phase: PhaseType.PHASE2,
    questionId: 106,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Esprit compétition
  {
    phase: PhaseType.PHASE2,
    questionId: 107,
    phase2Type: 'APTITUDES',
    profiles: [
      { riasecType: 'E', weight: 0.9 },
      { riasecType: 'S', weight: 0.1 },
    ],
  }, // Vendre produit/service
  {
    phase: PhaseType.PHASE2,
    questionId: 108,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Détermination/persévérance
  {
    phase: PhaseType.PHASE2,
    questionId: 109,
    phase2Type: 'APTITUDES',
    profiles: [
      { riasecType: 'E', weight: 0.8 },
      { riasecType: 'C', weight: 0.2 },
    ],
  }, // Gérer budget/sens affaires
  {
    phase: PhaseType.PHASE2,
    questionId: 110,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // À l'aise en public

  {
    phase: PhaseType.PHASE2,
    questionId: 111,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Rigueur/précision
  {
    phase: PhaseType.PHASE2,
    questionId: 112,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Organisation/rangement
  {
    phase: PhaseType.PHASE2,
    questionId: 113,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Tenir comptes
  {
    phase: PhaseType.PHASE2,
    questionId: 114,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Respecter procédures
  {
    phase: PhaseType.PHASE2,
    questionId: 115,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Efficacité administrative
  {
    phase: PhaseType.PHASE2,
    questionId: 116,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Accepter routine
  {
    phase: PhaseType.PHASE2,
    questionId: 117,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Maîtrise bureautique
  {
    phase: PhaseType.PHASE2,
    questionId: 118,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Classer/archiver
  {
    phase: PhaseType.PHASE2,
    questionId: 119,
    phase2Type: 'APTITUDES',
    profiles: [
      { riasecType: 'C', weight: 0.8 },
      { riasecType: 'I', weight: 0.2 },
    ],
  }, // Vérifier données
  {
    phase: PhaseType.PHASE2,
    questionId: 120,
    phase2Type: 'APTITUDES',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Ponctualité/délais

  // ============================================================
  // PHASE 2 – PERSONALITY (IDs 121-180 dans le CSV Phase2, type PERSONALITY)
  // ============================================================

  {
    phase: PhaseType.PHASE2,
    questionId: 121,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Choses concrètes
  {
    phase: PhaseType.PHASE2,
    questionId: 122,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Réservé
  {
    phase: PhaseType.PHASE2,
    questionId: 123,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Persévérant/stable
  {
    phase: PhaseType.PHASE2,
    questionId: 124,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Direct/franc
  {
    phase: PhaseType.PHASE2,
    questionId: 125,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Soin outils
  {
    phase: PhaseType.PHASE2,
    questionId: 126,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Agir plutôt que discuter
  {
    phase: PhaseType.PHASE2,
    questionId: 127,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Endurant physiquement
  {
    phase: PhaseType.PHASE2,
    questionId: 128,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Patient/minutieux
  {
    phase: PhaseType.PHASE2,
    questionId: 129,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'R', weight: 1.0 }],
  }, // Attaché méthodes tradi
  {
    phase: PhaseType.PHASE2,
    questionId: 130,
    phase2Type: 'PERSONALITY',
    profiles: [
      { riasecType: 'R', weight: 0.8 },
      { riasecType: 'I', weight: 0.2 },
    ],
  }, // Indépendant/aime travailler seul

  {
    phase: PhaseType.PHASE2,
    questionId: 131,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Curieux/aime apprendre
  {
    phase: PhaseType.PHASE2,
    questionId: 132,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Analyse profonde
  {
    phase: PhaseType.PHASE2,
    questionId: 133,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Calme/réfléchi
  {
    phase: PhaseType.PHASE2,
    questionId: 134,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Méthodique/rigoureux
  {
    phase: PhaseType.PHASE2,
    questionId: 135,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Esprit critique
  {
    phase: PhaseType.PHASE2,
    questionId: 136,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Aime problèmes complexes
  {
    phase: PhaseType.PHASE2,
    questionId: 137,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Liberté de penser
  {
    phase: PhaseType.PHASE2,
    questionId: 138,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Logique/rationnel
  {
    phase: PhaseType.PHASE2,
    questionId: 139,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'I', weight: 1.0 }],
  }, // Concentration longue
  {
    phase: PhaseType.PHASE2,
    questionId: 140,
    phase2Type: 'PERSONALITY',
    profiles: [
      { riasecType: 'I', weight: 0.8 },
      { riasecType: 'A', weight: 0.2 },
    ],
  }, // Ouvert d'esprit

  {
    phase: PhaseType.PHASE2,
    questionId: 141,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Créatif/imaginatif
  {
    phase: PhaseType.PHASE2,
    questionId: 142,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Sensible/émotif
  {
    phase: PhaseType.PHASE2,
    questionId: 143,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Besoin liberté/indépendance
  {
    phase: PhaseType.PHASE2,
    questionId: 144,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Spontané/expressif
  {
    phase: PhaseType.PHASE2,
    questionId: 145,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Original/se démarquer
  {
    phase: PhaseType.PHASE2,
    questionId: 146,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // N'aime pas routine
  {
    phase: PhaseType.PHASE2,
    questionId: 147,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Intuitif
  {
    phase: PhaseType.PHASE2,
    questionId: 148,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Passionné
  {
    phase: PhaseType.PHASE2,
    questionId: 149,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'A', weight: 1.0 }],
  }, // Peut être désordonné
  {
    phase: PhaseType.PHASE2,
    questionId: 150,
    phase2Type: 'PERSONALITY',
    profiles: [
      { riasecType: 'A', weight: 0.8 },
      { riasecType: 'S', weight: 0.2 },
    ],
  }, // Tendance à idéaliser

  {
    phase: PhaseType.PHASE2,
    questionId: 151,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Empathique
  {
    phase: PhaseType.PHASE2,
    questionId: 152,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Coopératif
  {
    phase: PhaseType.PHASE2,
    questionId: 153,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Amical/chaleureux
  {
    phase: PhaseType.PHASE2,
    questionId: 154,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Serviable/généreux
  {
    phase: PhaseType.PHASE2,
    questionId: 155,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Compréhensif
  {
    phase: PhaseType.PHASE2,
    questionId: 156,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Communique clairement
  {
    phase: PhaseType.PHASE2,
    questionId: 157,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Fiable
  {
    phase: PhaseType.PHASE2,
    questionId: 158,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'S', weight: 1.0 }],
  }, // Comprend vite les gens
  {
    phase: PhaseType.PHASE2,
    questionId: 159,
    phase2Type: 'PERSONALITY',
    profiles: [
      { riasecType: 'S', weight: 0.8 },
      { riasecType: 'E', weight: 0.2 },
    ],
  }, // Préfère discussion au conflit
  {
    phase: PhaseType.PHASE2,
    questionId: 160,
    phase2Type: 'PERSONALITY',
    profiles: [
      { riasecType: 'S', weight: 0.7 },
      { riasecType: 'C', weight: 0.3 },
    ],
  }, // Souple/conciliant

  {
    phase: PhaseType.PHASE2,
    questionId: 161,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Ambitieux
  {
    phase: PhaseType.PHASE2,
    questionId: 162,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Énergique/dynamique
  {
    phase: PhaseType.PHASE2,
    questionId: 163,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Optimiste/confiant
  {
    phase: PhaseType.PHASE2,
    questionId: 164,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Persuasif
  {
    phase: PhaseType.PHASE2,
    questionId: 165,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Sociable
  {
    phase: PhaseType.PHASE2,
    questionId: 166,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Aime défis
  {
    phase: PhaseType.PHASE2,
    questionId: 167,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Déterminé
  {
    phase: PhaseType.PHASE2,
    questionId: 168,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Aime initiatives
  {
    phase: PhaseType.PHASE2,
    questionId: 169,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'E', weight: 1.0 }],
  }, // Débrouillard
  {
    phase: PhaseType.PHASE2,
    questionId: 170,
    phase2Type: 'PERSONALITY',
    profiles: [
      { riasecType: 'E', weight: 0.9 },
      { riasecType: 'S', weight: 0.1 },
    ],
  }, // Aime diriger

  {
    phase: PhaseType.PHASE2,
    questionId: 171,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Organisé/méthodique
  {
    phase: PhaseType.PHASE2,
    questionId: 172,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Digne de confiance
  {
    phase: PhaseType.PHASE2,
    questionId: 173,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Aime clair et rangé
  {
    phase: PhaseType.PHASE2,
    questionId: 174,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Précis/minutieux
  {
    phase: PhaseType.PHASE2,
    questionId: 175,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Ponctuel
  {
    phase: PhaseType.PHASE2,
    questionId: 176,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Respecte règles
  {
    phase: PhaseType.PHASE2,
    questionId: 177,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Efficace/ordonné
  {
    phase: PhaseType.PHASE2,
    questionId: 178,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Consciencieux
  {
    phase: PhaseType.PHASE2,
    questionId: 179,
    phase2Type: 'PERSONALITY',
    profiles: [{ riasecType: 'C', weight: 1.0 }],
  }, // Discret
  {
    phase: PhaseType.PHASE2,
    questionId: 180,
    phase2Type: 'PERSONALITY',
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
    // Vérifier que la question existe bien (selon phase et éventuellement phase2Type)
    let exists = false;
    if (item.phase === PhaseType.PHASE1) {
      const q = await prisma.phase1Question.findUnique({ where: { id: item.questionId } });
      exists = !!q;
    } else {
      const q = await prisma.phase2Question.findFirst({
        where: {
          id: item.questionId,
          ...(item.phase2Type !== undefined ? { phase2Type: item.phase2Type } : {}),
        },
      });
      exists = !!q;
    }

    if (!exists) {
      console.warn(
        `Question introuvable : Phase ${item.phase}, ID ${item.questionId}, type ${item.phase2Type ?? '-'}`,
      );
      skipped++;
      continue;
    }

    // Supprimer les anciens profils de cette question
    await prisma.questionProfile.deleteMany({
      where: {
        ...(item.phase === PhaseType.PHASE1
          ? { phase1QuestionId: item.questionId }
          : { phase2QuestionId: item.questionId }),
        phase: item.phase,
      },
    });

    // Insérer les nouveaux profils
    for (const profile of item.profiles) {
      await prisma.questionProfile.create({
        data: {
          phase: item.phase,
          riasecType: profile.riasecType,
          weight: profile.weight,
          ...(item.phase === PhaseType.PHASE1
            ? { phase1QuestionId: item.questionId }
            : { phase2QuestionId: item.questionId }),
        },
      });
      created++;
    }
  }

  console.log(
    `QuestionProfile terminé : ${created} entrées créées, ${skipped} questions ignorées.`,
  );
}
