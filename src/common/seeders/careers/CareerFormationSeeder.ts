import type { PrismaService } from '../../../prisma/prisma.service';

const careerFormations = [
  {
    formationTitle: 'Licence Comptabilité, Contrôle et Audit (LCCA)',
    career: { name: 'Comptable' },
  },
  {
    formationTitle: 'Diplôme de Comptabilité et de Gestion (DCG)',
    career: { name: 'Comptable' },
  },
  {
    formationTitle: 'Diplôme de Gestion et de Comptabilité (DGC)',
    career: { name: 'Comptable' },
  },
  {
    formationTitle: 'Licence en Science Technique Comptable et Financière (LSTCF)',
    career: { name: 'Banquier / Conseiller Financier' },
  },
  {
    formationTitle: 'Licence Nationale Béninoise (FCA)',
    career: { name: 'Comptable' },
  },
  {
    formationTitle: 'Master Comptabilité, Contrôle et Audit (MCCA)',
    career: { name: 'Expert-Comptable' },
  },
  {
    formationTitle: 'Diplôme Supérieur de Gestion et de Comptabilité (DSGC)',
    career: { name: 'Expert-Comptable' },
  },
  {
    formationTitle: 'Diplôme Supérieur de Comptabilité et de Gestion (DSCG)',
    career: { name: 'Expert-Comptable' },
  },
  {
    formationTitle: 'Licence Professionnelle en Communication Visuelle (Graphique et Numérique)',
    career: { name: 'Graphiste Web / Motion Designer' },
  },
  {
    formationTitle: 'Licence Professionnelle en Réalisation Cinéma et Télévision',
    career: { name: 'Graphiste Web / Motion Designer' },
  },
  {
    formationTitle: 'Licence Professionnelle en Développement Web',
    career: { name: 'Développeur Web Full-Stack' },
  },
  {
    formationTitle: 'Administration Générale et Territoriale (AGT)',
    career: { name: 'Agent Administratif' },
  },
  {
    formationTitle: 'Diplomatie et Relations Internationales (DRI)',
    career: { name: 'Juriste / Avocat' },
  },
  {
    formationTitle: 'Administration du Travail et de Sécurité Sociale (ATSS)',
    career: { name: 'Gestionnaire RH / Responsable Ressources Humaines' },
  },
  {
    formationTitle: 'Administration des Finances et du Trésor (AFT)',
    career: { name: 'Comptable' },
  },
  {
    formationTitle: 'Administration des Impôts',
    career: { name: 'Expert-Comptable' },
  },
  {
    formationTitle: "Administration Hospitalière, Universitaire et d'Intendance (AHUI)",
    career: { name: 'Agent Administratif' },
  },
  {
    formationTitle: 'Gestion des Marchés Publics (GMP)',
    career: { name: 'Coordonnateur Projet / Chef de Projet' },
  },
  {
    formationTitle: 'Gestion Financière des Collectivités Locales (GFCL)',
    career: { name: 'Comptable' },
  },
  {
    formationTitle: 'Planification et Développement Local (PDL)',
    career: { name: 'Coordonnateur Projet / Chef de Projet' },
  },
  {
    formationTitle: 'Archivistique',
    career: { name: 'Agent Administratif' },
  },
  {
    formationTitle: 'Bibliothéconomie',
    career: { name: 'Agent Administratif' },
  },
  {
    formationTitle: 'Secrétariat Comptable',
    career: { name: 'Secrétaire / Assistante Administrative' },
  },
  {
    formationTitle: 'Secrétariat Bilingue',
    career: { name: 'Secrétaire / Assistante Administrative' },
  },
  {
    formationTitle: 'Secrétariat Médical',
    career: { name: 'Secrétaire / Assistante Administrative' },
  },
  {
    formationTitle: 'Secrétariat de Direction',
    career: { name: 'Secrétaire / Assistante Administrative' },
  },
  {
    formationTitle: 'Licence Professionnelle en Gestion Financière et Comptable',
    career: { name: 'Comptable' },
  },
  {
    formationTitle: 'Licence Professionnelle en Gestion des Ressources Humaines',
    career: { name: 'Gestionnaire RH / Responsable Ressources Humaines' },
  },
  {
    formationTitle: 'Licence Professionnelle en Gestion des Banques et Assurances',
    career: { name: 'Banquier / Conseiller Financier' },
  },
  {
    formationTitle: 'Licence Professionnelle en Gestion Commerciale',
    career: { name: 'Vendeur / Représentant Commercial' },
  },
  {
    formationTitle: 'Licence Professionnelle en Gestion des Transports et Logistique',
    career: { name: 'Responsable Logistique / Supply Chain' },
  },
  {
    formationTitle: 'Licence Professionnelle en Statistique',
    career: { name: 'Data Scientist / Data Analyst' },
  },
  {
    formationTitle: 'Licence Professionnelle en Planification',
    career: { name: 'Coordonnateur Projet / Chef de Projet' },
  },
  {
    formationTitle: 'Licence Professionnelle en Informatique de Gestion',
    career: { name: 'Administrateur Systèmes / Réseaux' },
  },
  {
    formationTitle: 'BTS en Comptabilité et Gestion',
    career: { name: 'Comptable' },
  },
  {
    formationTitle: "BTS en Banque et Finance d'Entreprise",
    career: { name: 'Banquier / Conseiller Financier' },
  },
  {
    formationTitle: 'BTS en Marketing et Action Commerciale',
    career: { name: 'Spécialiste Marketing Digital' },
  },
  {
    formationTitle: 'BTS en Informatique de Gestion',
    career: { name: 'Développeur Web Full-Stack' },
  },
  {
    formationTitle: 'BTS en Transport Logistique',
    career: { name: 'Responsable Logistique / Supply Chain' },
  },
  {
    formationTitle: 'Bachelor en Informatique',
    career: { name: 'Ingénieur Informatique / Software' },
  },
  {
    formationTitle: 'MSc Pro Intelligence Artificielle',
    career: { name: 'Spécialiste Intelligence Artificielle / Machine Learning' },
  },
  {
    formationTitle: 'MSc Pro Big Data',
    career: { name: 'Data Scientist / Data Analyst' },
  },
  {
    formationTitle: 'MSc Pro Cybersécurité',
    career: { name: 'Cybersécurité Analyste' },
  },
  {
    formationTitle: 'MSc Pro Cloud',
    career: { name: 'DevOps Engineer' },
  },
  {
    formationTitle: 'MSc Pro Transformation Digitale',
    career: { name: 'Product Manager / Scrum Master' },
  },
  {
    formationTitle: 'Licence en Sciences de Gestion — Marketing Communication',
    career: { name: 'Spécialiste Marketing Digital' },
  },
  {
    formationTitle:
      "Licence en Sciences de Gestion — Finance d'Entreprise, Relations Bancaires et Comptabilité",
    career: { name: 'Banquier / Conseiller Financier' },
  },
  {
    formationTitle: 'Licence en Sciences de Gestion — Comptabilité, Contrôle et Audit',
    career: { name: 'Comptable' },
  },
  {
    formationTitle: 'Licence en Sciences de Gestion — Banque Finance',
    career: { name: 'Banquier / Conseiller Financier' },
  },
  {
    formationTitle: 'Licence en Sciences de Gestion — Gestion des Ressources Humaines',
    career: { name: 'Gestionnaire RH / Responsable Ressources Humaines' },
  },
  {
    formationTitle: 'Licence en Sciences de Gestion — Transport Logistique et Management Portuaire',
    career: { name: 'Responsable Logistique / Supply Chain' },
  },
  {
    formationTitle: 'Licence en Sciences de Gestion — Gestion des Projets',
    career: { name: 'Coordonnateur Projet / Chef de Projet' },
  },
  {
    formationTitle: 'Licence en Informatique, Réseaux et Télécommunication',
    career: { name: 'Administrateur Systèmes / Réseaux' },
  },
  {
    formationTitle: 'Master en Comptabilité Contrôle Audit',
    career: { name: 'Expert-Comptable' },
  },
  {
    formationTitle: 'Master en Intelligence Artificielle et Big Data',
    career: { name: 'Spécialiste Intelligence Artificielle / Machine Learning' },
  },
  {
    formationTitle: 'Licence Professionnelle en Hôtellerie-Restauration',
    career: { name: 'Restaurateur / Cuisinier Chef' },
  },
  {
    formationTitle: 'Licence Professionnelle en Tourisme',
    career: { name: 'Entrepreneur / Propriétaire PME' },
  },
  {
    formationTitle: 'Licence Professionnelle en Génie Electrique et Energies Renouvelables (GEER)',
    career: { name: 'Technicien Solaire / Énergie' },
  },
  {
    formationTitle: 'Licence Professionnelle en Génie Energétique et Développement Durable (GEDu)',
    career: { name: 'Technicien Solaire / Énergie' },
  },
  {
    formationTitle: 'Licence Professionnelle en Génie Frigorifique et Climatisation (GeFriCER)',
    career: { name: 'Technicien Maintenance Électronique (TMEE)' },
  },
  {
    formationTitle: 'Master en Energies Renouvelables et Efficacité Energétique (ENREE)',
    career: { name: 'Technicien Solaire / Énergie' },
  },
  {
    formationTitle:
      'Master en Stratégies de Développement et Conduite des Ressources Energétiques et Energies Renouvelables (SDéCRE)',
    career: { name: 'Spécialiste en Gestion des Ressources Naturelles' },
  },
  {
    formationTitle: 'Master en Réseaux Electriques et Distribution (REDi)',
    career: { name: 'Administrateur Systèmes / Réseaux' },
  },
  {
    formationTitle: 'Licence en Marketing, Communication et Commerce (MCC)',
    career: { name: 'Spécialiste Marketing Digital' },
  },
  {
    formationTitle: 'Licence en Finance Comptabilité et Audit (FCA)',
    career: { name: 'Comptable' },
  },
  {
    formationTitle: 'Licence en Banque Finance et Assurance (BFA)',
    career: { name: 'Banquier / Conseiller Financier' },
  },
  {
    formationTitle: 'Licence en Gestion des Ressources Humaines (GRH)',
    career: { name: 'Gestionnaire RH / Responsable Ressources Humaines' },
  },
  {
    formationTitle: 'Licence en Entrepreneuriat et Gestion des Projets (EGP)',
    career: { name: 'Entrepreneur / Propriétaire PME' },
  },
  {
    formationTitle: 'Licence en Transport et Logistique (TL)',
    career: { name: 'Responsable Logistique / Supply Chain' },
  },
  {
    formationTitle: 'Licence en Gestion des Médias (GM)',
    career: { name: 'Community Manager / Social Media' },
  },
  {
    formationTitle: 'Licence en Hôtellerie et Tourisme (HT)',
    career: { name: 'Restaurateur / Cuisinier Chef' },
  },
  {
    formationTitle: 'Licence en Systèmes Informatiques et Logiciels (SIL)',
    career: { name: 'Développeur Web Full-Stack' },
  },
  {
    formationTitle: 'Licence en Génie Civil, Eau et Assainissement',
    career: { name: 'Maçon / Constructeur' },
  },
  {
    formationTitle: 'DTS en Finance Comptabilité et Audit (FCA)',
    career: { name: 'Comptable' },
  },
  {
    formationTitle: 'DTS en Gestion Commerciale (GC)',
    career: { name: 'Vendeur / Représentant Commercial' },
  },
  {
    formationTitle: "DTS en Communication d'Entreprise (CE)",
    career: { name: 'Community Manager / Social Media' },
  },
  {
    formationTitle: 'DTS en Gestion des Ressources Humaines (GRH)',
    career: { name: 'Gestionnaire RH / Responsable Ressources Humaines' },
  },
  {
    formationTitle: "DTS en Informatique Développeur d'Application (IDA)",
    career: { name: 'Développeur Web Full-Stack' },
  },
  {
    formationTitle: 'DTS en Tourisme et Hôtellerie (TH)',
    career: { name: 'Restaurateur / Cuisinier Chef' },
  },
  {
    formationTitle: 'Licence Professionnelle en Gestion des Ressources Humaines (GRH)',
    career: { name: 'Gestionnaire RH / Responsable Ressources Humaines' },
  },
  {
    formationTitle: 'Licence Professionnelle en Transport et Logistique (TL)',
    career: { name: 'Responsable Logistique / Supply Chain' },
  },
  {
    formationTitle: 'Licence Professionnelle en Banques Finance et Assurance (BFA)',
    career: { name: 'Banquier / Conseiller Financier' },
  },
  {
    formationTitle: 'Licence Professionnelle en Finance Comptabilité et Audit (FCA)',
    career: { name: 'Comptable' },
  },
  {
    formationTitle: 'Licence Professionnelle en Marketing Communication et Commerce (MCC)',
    career: { name: 'Spécialiste Marketing Digital' },
  },
  {
    formationTitle: 'Licence Professionnelle en Système Informatique et Logiciel (SIL)',
    career: { name: 'Développeur Web Full-Stack' },
  },
  {
    formationTitle: 'Master Professionnel en Marketing Communication et Commerce (MCC)',
    career: { name: 'Spécialiste Marketing Digital' },
  },
  {
    formationTitle: 'Master Professionnel en Finance Comptabilité et Audit (FCA)',
    career: { name: 'Expert-Comptable' },
  },
  {
    formationTitle: 'Master Professionnel en Gestion des Ressources Humaines (GRH)',
    career: { name: 'Gestionnaire RH / Responsable Ressources Humaines' },
  },
  {
    formationTitle: 'Master Professionnel en Banque Finance et Assurance (BFA)',
    career: { name: 'Banquier / Conseiller Financier' },
  },
  {
    formationTitle: 'Master Professionnel en Entrepreneuriat et Gestion des Projets (EGP)',
    career: { name: 'Entrepreneur / Propriétaire PME' },
  },
  {
    formationTitle: 'Licence en Droit Public',
    career: { name: 'Juriste / Avocat' },
  },
  {
    formationTitle: 'Licence en Droit Privé',
    career: { name: 'Juriste / Avocat' },
  },
  {
    formationTitle: 'Licence en Science Politique',
    career: { name: 'Agent Administratif' },
  },
  {
    formationTitle: 'Licence Mention Gestion – Comptabilité, Audit et Contrôle de Gestion',
    career: { name: 'Comptable' },
  },
  {
    formationTitle: 'Licence Mention Gestion – Finance, Banque et Assurance',
    career: { name: 'Banquier / Conseiller Financier' },
  },
  {
    formationTitle: 'Licence Mention Gestion – Marketing et Stratégie',
    career: { name: 'Spécialiste Marketing Digital' },
  },
  {
    formationTitle:
      'Licence Mention Gestion – Théorie des organisations et Gestion des Ressources Humaines',
    career: { name: 'Gestionnaire RH / Responsable Ressources Humaines' },
  },
  {
    formationTitle: "Licence Mention Gestion – Gestion de production et Systèmes d'information",
    career: { name: 'Responsable Logistique / Supply Chain' },
  },
  {
    formationTitle: 'Licence Mention Sciences économiques – Analyse et politiques de développement',
    career: { name: 'Coordonnateur Projet / Chef de Projet' },
  },
  {
    formationTitle: 'Licence Mention Sciences économiques – Analyse des projets',
    career: { name: 'Coordonnateur Projet / Chef de Projet' },
  },
  {
    formationTitle:
      'Licence Mention Sciences économiques – Economie et gestion des structures sanitaires',
    career: { name: 'Agent Administratif' },
  },
  {
    formationTitle:
      'Licence Mention Sciences économiques – Economie et gestion des exploitations agricoles',
    career: { name: 'Agronome / Ingénieur Agronome' },
  },
  {
    formationTitle: 'Licence Mention Sciences économiques – Statistiques et économétrie',
    career: { name: 'Data Scientist / Data Analyst' },
  },
  {
    formationTitle:
      'Licence Professionnelle en Économie et Finance des Collectivités Locales (EFCL)',
    career: { name: 'Comptable' },
  },
  {
    formationTitle: 'Licence Professionnelle en Économie Agricole',
    career: { name: 'Agronome / Ingénieur Agronome' },
  },
  {
    formationTitle: 'Licence Professionnelle en Analyse et Politiques Économiques (APE)',
    career: { name: 'Coordonnateur Projet / Chef de Projet' },
  },
  {
    formationTitle: 'Licence Professionnelle en Économie et Finance Internationale (EFI)',
    career: { name: 'Banquier / Conseiller Financier' },
  },
  {
    formationTitle: 'Licence en Sociologie',
    career: { name: 'Animateur Socio-Éducatif' },
  },
  {
    formationTitle: 'Licence en Psychologie',
    career: { name: "Psychologue Scolaire / Conseiller d'Orientation" },
  },
  {
    formationTitle: 'Licence en Histoire',
    career: { name: 'Enseignant(e) / Professeur' },
  },
  {
    formationTitle: 'Licence en Géographie',
    career: { name: 'Spécialiste en Gestion des Ressources Naturelles' },
  },
  {
    formationTitle: 'Licence ès Mathématiques',
    career: { name: 'Enseignant(e) / Professeur' },
  },
  {
    formationTitle: 'Licence de Physique',
    career: { name: 'Enseignant(e) / Professeur' },
  },
  {
    formationTitle: 'Licence de Chimie',
    career: { name: 'Enseignant(e) / Professeur' },
  },
  {
    formationTitle: 'Doctorat en Médecine',
    career: { name: 'Médecin Généraliste' },
  },
  {
    formationTitle: 'Doctorat en Pharmacie',
    career: { name: 'Pharmacien(ne)' },
  },
  {
    formationTitle: 'Licence professionnelle en Journalisme',
    career: { name: 'Community Manager / Social Media' },
  },
  {
    formationTitle: 'Licence professionnelle en Génie Informatique',
    career: { name: 'Ingénieur Informatique / Software' },
  },
  {
    formationTitle: 'Design Graphique',
    career: { name: 'Graphiste Web / Motion Designer' },
  },
  {
    formationTitle: 'Développement Web',
    career: { name: 'Développeur Web Full-Stack' },
  },
  {
    formationTitle: 'Licence en Sciences Infirmières',
    career: { name: 'Infirmier(e) / Aide-Soignant(e)' },
  },
  {
    formationTitle: 'Licence en Maïeutique (Sage-Femme)',
    career: { name: 'Sage-Femme' },
  },
  {
    formationTitle:
      "Licence professionnelle en Génie des Technologies de l'Information et de la Communication",
    career: { name: 'Technicien Fibre Optique (TIT)' },
  },
  {
    formationTitle: 'Licence professionnelle en Administration des Affaires',
    career: { name: 'Entrepreneur / Propriétaire PME' },
  },
  {
    formationTitle: 'Licence professionnelle en Génie des Procédés de Productions Industrielles',
    career: { name: 'Mécanicien Agricole / Tractoriste' },
  },
  {
    formationTitle: 'Licence professionnelle en Réalisation Cinéma et Télévision',
    career: { name: 'Graphiste Web / Motion Designer' },
  },
  {
    formationTitle: 'Licence professionnelle en Journalisme Audiovisuel',
    career: { name: 'Community Manager / Social Media' },
  },
  {
    formationTitle: "Licence professionnelle en Métiers de l'Image",
    career: { name: 'Graphiste Web / Motion Designer' },
  },
  {
    formationTitle: 'Licence professionnelle en Métiers du Son',
    career: { name: 'Graphiste Web / Motion Designer' },
  },
  {
    formationTitle: 'Licence professionnelle en Montage et Postproduction',
    career: { name: 'Graphiste Web / Motion Designer' },
  },
  {
    formationTitle: 'Licence professionnelle en Gestion de la Production Audiovisuelle',
    career: { name: 'Product Manager / Scrum Master' },
  },
  {
    formationTitle: 'Master en Réalisation Cinéma et Télévision',
    career: { name: 'Graphiste Web / Motion Designer' },
  },
  {
    formationTitle: "Licence professionnelle en Communication d'Entreprise",
    career: { name: 'Community Manager / Social Media' },
  },
  {
    formationTitle: 'Licence professionnelle en Comptabilité Gestion',
    career: { name: 'Comptable' },
  },
  {
    formationTitle: 'Licence professionnelle en Gestion des Ressources Humaines',
    career: { name: 'Gestionnaire RH / Responsable Ressources Humaines' },
  },
  {
    formationTitle: "Master en Communication d'Entreprise",
    career: { name: 'Community Manager / Social Media' },
  },
  {
    formationTitle: 'Licence professionnelle en Journalisme',
    career: { name: 'Community Manager / Social Media' },
  },
  {
    formationTitle: 'Licence professionnelle en Communication',
    career: { name: 'Community Manager / Social Media' },
  },
  {
    formationTitle: 'Master en Journalisme',
    career: { name: 'Community Manager / Social Media' },
  },
  {
    formationTitle: 'Licence professionnelle en Marketing et Action Commerciale',
    career: { name: 'Spécialiste Marketing Digital' },
  },
  {
    formationTitle: "Licence professionnelle en Comptabilité et Finance d'Entreprise",
    career: { name: 'Comptable' },
  },
  {
    formationTitle: "Licence professionnelle en Banque et Finance d'Entreprise",
    career: { name: 'Banquier / Conseiller Financier' },
  },
  {
    formationTitle: 'Licence professionnelle en Science Politique et Relation Internationale',
    career: { name: 'Juriste / Avocat' },
  },
  {
    formationTitle: 'Master en Marketing et Communication',
    career: { name: 'Spécialiste Marketing Digital' },
  },
  {
    formationTitle: 'Licence professionnelle en Audit et Contrôle de Gestion',
    career: { name: 'Expert-Comptable' },
  },
  {
    formationTitle: "Licence professionnelle en Banque et Finance d'Entreprise",
    career: { name: 'Banquier / Conseiller Financier' },
  },
  {
    formationTitle: 'Master en Audit et Contrôle de Gestion',
    career: { name: 'Expert-Comptable' },
  },
  {
    formationTitle: 'Master en Communication et Marketing',
    career: { name: 'Spécialiste Marketing Digital' },
  },
  {
    formationTitle: 'Licence professionnelle en Philosophie',
    career: { name: 'Enseignant(e) / Professeur' },
  },
  {
    formationTitle: "Licence professionnelle en Psychologie et Sciences de l'Education",
    career: { name: "Psychologue Scolaire / Conseiller d'Orientation" },
  },
  {
    formationTitle: 'Licence professionnelle en Sciences du Mariage et de la Famille',
    career: { name: 'Animateur Socio-Éducatif' },
  },
  {
    formationTitle: 'Bachelor en Digitalisation & Sciences des Données',
    career: { name: 'Data Scientist / Data Analyst' },
  },
  {
    formationTitle: 'Licence en Design',
    career: { name: 'UI/UX Designer' },
  },
  {
    formationTitle: 'Licence en Informatique de Gestion',
    career: { name: 'Développeur Web Full-Stack' },
  },
  {
    formationTitle: 'Master en Réseaux Informatique et Télécommunications',
    career: { name: 'Administrateur Systèmes / Réseaux' },
  },
  {
    formationTitle: 'Licence en Sciences de Gestion',
    career: { name: 'Entrepreneur / Propriétaire PME' },
  },
  {
    formationTitle: "Master en Droit de l'Homme et Action Humanitaire",
    career: { name: 'Juriste / Avocat' },
  },
  {
    formationTitle: 'Licence Professionnelle en Aquaculture',
    career: { name: 'Pisciculteur' },
  },
  {
    formationTitle: 'Master Professionnel en Aquaculture et Management des Ressources Halieutiques',
    career: { name: 'Pisciculteur' },
  },
  {
    formationTitle: 'Licence Professionnelle en Horticulture et Aménagement des Espaces Verts',
    career: { name: 'Horticulteur / Arboriculteur' },
  },
  {
    formationTitle:
      'Licence Professionnelle en Biotechnologies Végétales et Amélioration des Plantes',
    career: { name: 'Agronome / Ingénieur Agronome' },
  },
  {
    formationTitle: 'Master Professionnel en Foresterie Tropicale',
    career: { name: 'Spécialiste en Gestion des Ressources Naturelles' },
  },
  {
    formationTitle: "Licence en Sciences de l'Ingénieur",
    career: { name: 'Ingénieur Informatique / Software' },
  },
  {
    formationTitle: "Diplôme d'Ingénieur d'État en Génie Civil",
    career: { name: 'Maçon / Constructeur' },
  },
  {
    formationTitle: 'Licence professionnelle en Marketing et Communication',
    career: { name: 'Spécialiste Marketing Digital' },
  },
  {
    formationTitle: 'Licence professionnelle en Banque, Finance et Assurance',
    career: { name: 'Banquier / Conseiller Financier' },
  },
  {
    formationTitle: 'Master en Banque, Finance et Assurance',
    career: { name: 'Banquier / Conseiller Financier' },
  },
  {
    formationTitle: 'Licence professionnelle en Génie Civil (BTP)',
    career: { name: 'Maçon / Constructeur' },
  },
  {
    formationTitle: 'Master Professionnel en Génie Civil',
    career: { name: 'Maçon / Constructeur' },
  },
  {
    formationTitle: "Diplôme d'Ingénieur de Conception des Télécommunications",
    career: { name: 'Administrateur Systèmes / Réseaux' },
  },
  {
    formationTitle: 'Licence en Télécommunications et Informatique',
    career: { name: 'Technicien Fibre Optique (TIT)' },
  },
  {
    formationTitle: 'Licence en Banque Finance et Assurance',
    career: { name: 'Banquier / Conseiller Financier' },
  },
  {
    formationTitle: 'Licence en Informatique de Gestion',
    career: { name: 'Développeur Web Full-Stack' },
  },
  {
    formationTitle: 'Master en Management des Ressources Humaines',
    career: { name: 'Gestionnaire RH / Responsable Ressources Humaines' },
  },
];

export async function seedCareerFormations(prisma: PrismaService) {
  // Implementation for seeding career formations
  for (const careerFormation of careerFormations) {
    const career = await prisma.career.findFirst({
      where: { name: careerFormation.career.name },
    });

    const formation = await prisma.formation.findFirst({
      where: { title: careerFormation.formationTitle },
    });

    if (career && formation) {
      await prisma.careerFormation.upsert({
        where: {
          careerId_formationId: {
            careerId: career.id,
            formationId: formation.id,
          },
        },
        update: { isPrimary: true },
        create: {
          careerId: career.id,
          formationId: formation.id,
          isPrimary: true,
        },
      });
    }
  }
}
