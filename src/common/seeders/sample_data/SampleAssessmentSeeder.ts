/* eslint-disable no-console */
import type { PrismaService } from '../../../prisma/prisma.service';
import { Phase2Type } from '@prisma/client';
import { ConfigService } from '../../config/config.service';
import { PasswordService } from '../../../modules/auth/services/password.service';

const config = new ConfigService();
const passwd = new PasswordService(config);

// ============================================================
// TRAINING INSTITUTIONS
// ============================================================

const universities = [
  {
    name: "Centre International de Formation à l'Expertise Comptable",
    acronym: 'CIFEC',
    description:
      "Le Centre International de Formation à l'Expertise Comptable (CIFEC) du Bénin est une grande école spécialisée dans les métiers de la comptabilité. Il propose des formations comme la Licence Comptabilité, Contrôle et Audit (LCCA), le Diplôme de Comptabilité et de Gestion (DCG) et prépare au Diplôme d'Expertise Comptable.",
    phone: '+22966158232',
    email: 'contact@cifec.bj',
    website: 'https://www.cifecbenin.com',
    address: 'Cotonou, Bénin',
    coverUrl: `${config.app.frontendUrl}/CIFEC.jpg`,
    formationUrls: [
      'https://www.cifecbenin.com/formations/licence-comptabilite-controle-et-audit-lcca',
      'https://www.cifecbenin.com/formations/diplome-de-comptabilite-et-de-gestion-dcg',
      'https://www.cifecbenin.com/formations/diplome-de-gestion-et-de-comptabilite-dgc',
      'https://www.cifecbenin.com/formations/licence-en-science-technique-comptable-et-financiere-lstcf',
      'https://www.cifecbenin.com/specialisations',
    ],
  },
  {
    name: 'École Internationale de Graphisme du Bénin',
    acronym: 'EIG',
    description:
      "L'École Internationale de Graphisme du Bénin (EIG) est un groupe scolaire et universitaire privé spécialisé dans les métiers du digital, du graphisme, de l'audiovisuel et du numérique. Implantée au Bénin, au Mali et au Burkina Faso, elle forme plus de 300 apprenants par an avec un taux d'insertion professionnelle de 94%.",
    phone: '+2290166392222',
    email: 'contact@eiggroupe.com',
    website: 'https://eiggroupe.com',
    address: 'Cotonou, Aïbatin, Bénin',
    coverUrl: `${config.app.frontendUrl}/EIG.jpg`,
    formationUrls: [
      'https://eiggroupe.com/stream/communication-visuelle-graphique-et-numerique/',
      'https://eiggroupe.com/stream/developpement-web-mobile-et-logiciel/',
      'https://eiggroupe.com/stream/realisation-cinema-et-television/',
      'https://eiggroupe.com/stream/marketing-et-communication-digitale/',
      'https://eiggroupe.com/stream/journalisme-multimedia/',
      'https://eiggroupe.com/stream/design-graphique/',
      'https://eiggroupe.com/stream/ui-ux-design/',
      'https://eiggroupe.com/stream/developpement-web-et-mobile/',
      'https://eiggroupe.com/stream/montage-video/',
      'https://eiggroupe.com/stream/serigraphie/',
      'https://eiggroupe.com/stream/photographie-et-cadrage/',
    ],
  },
  {
    name: "École Nationale d'Administration et de Magistrature",
    acronym: 'ENA',
    description:
      "L'École Nationale d'Administration et de Magistrature (ENAM) du Bénin, située à Abomey-Calavi, est un établissement public de formation professionnelle et de recherche affilié à l'Université d'Abomey-Calavi. Créée en 1984, elle a pour mission de former et perfectionner les cadres et agents publics béninois.",
    phone: null,
    email: 'enambenin@yahoo.fr',
    website: 'https://www.enam.uac.bj',
    address: 'Abomey-Calavi, Bénin',
    coverUrl: `${config.app.frontendUrl}/ENA.jpg`,
    formationUrls: [],
  },
  {
    name: "École Nationale d'Économie Appliquée et de Management",
    acronym: 'ENEAM',
    description:
      "L'École Nationale d'Économie Appliquée et de Management (ENEAM) est une entité de l'Université d'Abomey-Calavi située à Cotonou. Créée en 1980 sous le nom d'Institut National d'Économie (INE), elle a adopté son nom actuel en 2002. Elle forme dans les domaines de la statistique, la planification du développement, le management des organisations, l'informatique et l'expertise comptable.",
    phone: '+22921304168',
    email: 'eneam.uac@eneam.uac.bj',
    website: 'https://eneam.uac.bj',
    address: 'Gbégamey, Cotonou, Bénin',
    coverUrl: `${config.app.frontendUrl}/ENEAM.webp`,
    formationUrls: ['https://eneam.uac.bj'],
  },
  {
    name: 'Epitech Bénin',
    acronym: 'EPITECH',
    description:
      "Epitech est une école d'expertise informatique implantée au Bénin depuis 2019, premier campus africain du réseau Epitech. Située à Cotonou, elle propose des formations de type Bachelor et MSc Pro en ingénierie logicielle selon une pédagogie active par projets.",
    phone: '+22969077730',
    email: 'info@epitech.bj',
    website: 'https://epitech.africa',
    address: 'Boulevard Saint Michel, Cotonou, Bénin',
    coverUrl: `${config.app.frontendUrl}/EPITECH (2).jpg`,
    formationUrls: ['https://epitech.africa'],
  },
  {
    name: "École Supérieure de Gestion d'Informatique et des Sciences",
    acronym: 'ESGIS',
    description:
      "L'ESGIS est une école supérieure privée agréée évoluant sous l'égide du Ministère de l'Enseignement Supérieur du Togo, du Bénin et du Gabon. Fondée au Togo en 1994, elle s'est implantée au Bénin en 2005 et propose des formations en informatique, gestion et sciences.",
    phone: '+22921324773',
    email: 'esgis.benin@esgis.org',
    website: 'https://www.esgis.bj',
    address: "Boulevard de l'Ouémé, Jéricho, Cotonou, Bénin",
    coverUrl: `${config.app.frontendUrl}/ESGIS.jpeg`,
    formationUrls: ['https://www.esgis.bj'],
  },
  {
    name: 'École Supérieure de Management, Tourisme, Hôtellerie et Restauration',
    acronym: 'ESMATH',
    description:
      'ESMATH-BENIN est une école de référence à Cotonou spécialisée dans les formations professionnelles en tourisme, hôtellerie et restauration. Elle prépare aux diplômes de Licence professionnelle dans ces domaines.',
    phone: '+2290196532197',
    email: 'contact@esmathbenin.org',
    website: 'https://www.esmathbenin.org',
    address: 'Gbèdjromèdé, Cotonou, Bénin',
    coverUrl: `${config.app.frontendUrl}/esmath.jpg`,
    formationUrls: ['https://www.esmathbenin.org'],
  },
  {
    name: 'École Supérieure des Métiers des Energies Renouvelables',
    acronym: 'ESMER-Benin',
    description:
      "L'ESMER est la première école de référence au Bénin spécialisée dans la formation aux métiers des énergies renouvelables (solaire, éolienne, marine, biomasse et leur hybridation). Elle propose des formations de niveau Licence et Master professionnels.",
    phone: '+22995676625',
    email: 'infos@esmer-benin.org',
    website: 'https://esmer-benin.org',
    address: 'Zogbo, Cotonou, Bénin',
    coverUrl: `${config.app.frontendUrl}/ESMER-Benin.jpg`,
    formationUrls: ['https://esmer-benin.org'],
  },
  {
    name: 'École Supérieure de Management',
    acronym: 'ESM-BENIN',
    description:
      "ESM-BENIN est un établissement privé d'enseignement supérieur créé en 2007, spécialisé dans la formation des leaders. Il propose des formations homologuées par l'État béninois et accréditées par le CAMES, conduisant aux grades de Licences et Masters Professionnels dans les domaines du marketing, de la finance, des ressources humaines et de l'hôtellerie.",
    phone: '+2290197308484',
    email: 'contact@esm-benin.com',
    website: 'https://esm-benin.com',
    address: 'Cotonou, Bénin',
    coverUrl: `${config.app.frontendUrl}/ESM-BENIN.jpg`,
    formationUrls: ['https://esm-benin.com'],
  },
  {
    name: 'École Supérieure de Technologie et de Gestion',
    acronym: 'ESTG',
    description:
      "L'École Supérieure de Technologie et de Gestion (ESTG – BENIN) est un établissement privé formant des cadres qualifiés dans les domaines de la gestion, la finance, le droit, la communication, l'informatique, le marketing et l'électronique. Créée en septembre 2013, elle prépare aux diplômes de Licence et Master.",
    phone: '+22962791010',
    email: 'contact@estg-benin.com',
    website: 'https://estg-benin.com',
    address: 'Fidjrossè Kpota, Cotonou, Bénin',
    coverUrl: `${config.app.frontendUrl}/ESTG.jpg`,
    formationUrls: ['https://estg-benin.com'],
  },
  {
    name: 'Faculté de Droit et de Science Politique',
    acronym: 'FADESP',
    description:
      "La Faculté de Droit et des Sciences Politiques (FADESP) est une unité de formation et de recherche de l'Université d'Abomey-Calavi. Elle propose des formations en droit et en science politique, incluant un cycle de capacité en droit et des études universitaires complètes.",
    phone: null,
    email: 'contact@fadesp.net',
    website: 'https://www.fadesp.net',
    address: "Campus d'Abomey-Calavi, Bénin",
    coverUrl: `${config.app.frontendUrl}/FADESP.jpg`,
    formationUrls: ['https://www.fadesp.net'],
  },
  {
    name: 'Faculté des Sciences Économiques et de Gestion',
    acronym: 'FASEG',
    description:
      "La Faculté des Sciences Économiques et de Gestion (FASEG) est une unité de formation et de recherche de l'Université d'Abomey-Calavi. Elle offre des formations dans les domaines de l'économie et de la gestion.",
    phone: '+22991054242',
    email: 'faseg.uac@faseg.uac.bj',
    website: 'https://faseg-uac.bj',
    address: 'Cotonou, Bénin',
    coverUrl: `${config.app.frontendUrl}/FASEG.jpg`,
    formationUrls: [],
  },
  {
    name: "Faculté des Sciences Économiques et de Gestion de l'Université de Parakou",
    acronym: 'FASEG-UP',
    description:
      "La Faculté des Sciences Économiques et de Gestion de l'Université de Parakou (FASEG-UP) est un joyau académique dédié à l'excellence dans les domaines de l'économie et de la gestion. Fondée en 2001, elle constitue un des plus importants sites académiques de l'Université de Parakou.",
    phone: '+22923610712',
    email: 'contact@fasegup.com',
    website: 'https://www.fasegup.com',
    address: 'Université de Parakou, Bénin',
    coverUrl: `${config.app.frontendUrl}/faseg-up.png`,
    formationUrls: [],
  },
  {
    name: 'Faculté des Sciences Humaines et Sociales',
    acronym: 'FASHS',
    description:
      "La Faculté des Sciences Humaines et Sociales (FASHS) est une unité de formation et de recherche de l'Université d'Abomey-Calavi. Créée en 2017 suite à la scission de l'ex FLASH, elle a pour vocation de former dans les domaines des sciences humaines et sociales.",
    phone: null,
    email: null,
    website:
      'https://fr.wikipedia.org/wiki/Facult%C3%A9_des_sciences_humaines_et_sociales_(B%C3%A9nin)',
    address: "Campus d'Abomey-Calavi, Bénin",
    coverUrl: `${config.app.frontendUrl}/FASHS.png`,
    formationUrls: [],
  },
  {
    name: 'Faculté des Sciences et Techniques',
    acronym: 'FAST',
    description:
      "La Faculté des Sciences et Techniques (FAST) est une unité de formation et de recherche de l'Université d'Abomey-Calavi. Elle offre des formations dans les domaines des sciences naturelles, mathématiques, physique et autres disciplines scientifiques.",
    phone: null,
    email: null,
    website:
      'https://www.oreilleducampus.org/universite-abomey-calavi/129-faculte-des-sciences-et-techniques-fast-uac-benin-etudes-mathematique-physique-chimie-sciences-naturelles-geologie-biochimie-biotechnologie-alimentaire-physiologie-formation-etude-en-filiere-offres-formations-diplome-licence-professionnelle-master-recherche-professionnel-doctorat-debouche.html',
    address: "Campus d'Abomey-Calavi, Bénin",
    coverUrl: `${config.app.frontendUrl}/FAST.jpg`,
    formationUrls: [],
  },
  {
    name: 'Faculté des Sciences de la Santé',
    acronym: 'FSS',
    description:
      "La Faculté des Sciences de la Santé (FSS) est une institution publique béninoise de formation et de recherche rattachée à l'Université d'Abomey-Calavi. Créée en 1971, elle forme dans les filières médecine générale, pharmacie, assistance sociale, nutrition et diététique, et kinésithérapie.",
    phone: '+22921304095',
    email: 'fss_cotonou@yahoo.fr',
    website: 'https://www.fss-cotonou.com',
    address: 'Champ de foire, Cotonou, Bénin',
    coverUrl: `${config.app.frontendUrl}/FSS.jpg`,
    formationUrls: ['https://www.fss-cotonou.com'],
  },
  {
    name: 'Haute École de Commerce et de Management',
    acronym: 'HECM',
    description:
      "La Haute École de Commerce et de Management (HECM) est une université privée implantée dans sept localités du Bénin depuis sa création en 1999. Elle propose des formations orientées vers l'emploi dans les secteurs clés de l'économie africaine.",
    phone: '+22921324889',
    email: 'contact@hecm-afrique.net',
    website: 'https://www.hecm-afrique.net',
    address: 'Cotonou, Bénin',
    coverUrl: `${config.app.frontendUrl}/HECM.jpg`,
    formationUrls: ['https://www.hecm-afrique.net'],
  },
  {
    name: 'Institut de Multimédia Appliqué',
    acronym: 'IMA',
    description:
      "L'Institut de Multimédia Appliqué (IMA) est une école de formation professionnelle et technique aux métiers du multimédia. Il forme les talents du numérique dans les domaines du design graphique, webdesign, audiovisuel et développement web.",
    phone: '+22969191960',
    email: 'contactimabenin@gmail.com',
    website: 'https://imalearning.com',
    address: 'Cotonou, Bénin',
    coverUrl: `${config.app.frontendUrl}/IMA.jpg`,
    formationUrls: ['https://imalearning.com'],
  },
  {
    name: 'Institut National Médico-Sanitaire',
    acronym: 'INMES',
    description:
      "L'Institut National Médico-Sanitaire (INMeS) est la plus importante école d'infirmières et de sage-femmes du Bénin. C'est une entité de l'Université d'Abomey-Calavi située à Cotonou, offrant des formations de Licence et Master dans les domaines de la santé.",
    phone: '+2290167333371',
    email: 'inmes.uac@uac.bj',
    website: 'https://inmes.uac.bj',
    address: 'Cadjèhoun, Cotonou, Bénin',
    coverUrl: `${config.app.frontendUrl}/INMES.jpg`,
    formationUrls: ['https://inmes.uac.bj'],
  },
  {
    name: 'IRGIB Africa University',
    acronym: 'IRGIB-Africa',
    description:
      "IRGIB Africa University est une université privée installée au Bénin, autorisée depuis 2006 comme institut et en 2015 comme université. Elle forme des travailleurs hautement qualifiés en sciences avancées, avec un objectif de développement scientifique et technologique de l'Afrique subsaharienne.",
    phone: '+22967296464',
    email: 'contact@irgibafrica.university',
    website: 'https://irgibafrica.university',
    address: 'Akpakpa, Cotonou, Bénin',
    coverUrl: `${config.app.frontendUrl}/IRGIB-Africa.jpg`,
    formationUrls: ['https://irgibafrica.university'],
  },
  {
    name: "Institut Supérieur des Métiers de l'Audiovisuel",
    acronym: 'ISMA',
    description:
      "L'Institut Supérieur des Métiers de l'Audiovisuel (ISMA) est un établissement d'enseignement supérieur technique privé fondé en 2006, reconnu par l'État béninois et accrédité par le CAMES. Il forme aux métiers du journalisme, du cinéma et de l'audiovisuel avec une pédagogie par projets.",
    phone: '+22921300185',
    email: 'info@isma-benin.org',
    website: 'https://isma-benin.org',
    address: 'Fidjrossè, Cotonou, Bénin',
    coverUrl: `${config.app.frontendUrl}/ISMA.jpg`,
    formationUrls: ['https://isma-benin.org'],
  },
  {
    name: 'Institut Supérieur de Management et de Technologies Saint Salomon',
    acronym: 'ISMT',
    description:
      "ISMT St Salomon University est un établissement d'enseignement supérieur bilingue accrédité par le Ministère de l'Enseignement Supérieur et de la Recherche Scientifique du Bénin. Elle propose des formations en sciences, arts, commerce et ingénierie.",
    phone: '+22961216456',
    email: 'contactus@ismtstsalomon.com',
    website: 'https://ismtstsalomon.com',
    address: 'Midombo, Cotonou, Bénin',
    coverUrl: `${config.app.frontendUrl}/ISMT-2.jpeg`,
    formationUrls: ['https://ismtstsalomon.com'],
  },
  {
    name: "Institut Supérieur des Sciences de l'Information et de la Communication",
    acronym: 'ISSIC',
    description:
      "ISSIC University Benin est un établissement privé d'enseignement supérieur fondé en 2015, situé à Cotonou. Accréditée par le Ministère de l'Enseignement Supérieur et de la Recherche Scientifique, elle propose des programmes de Bachelor et Master enseignés en anglais.",
    phone: '+22963008282',
    email: 'info@issicuniversity.edu.bj',
    website: 'https://issicuniversity.edu.bj',
    address: 'PK11, Cotonou, Bénin',
    coverUrl: `${config.app.frontendUrl}/ISSIC.png`,
    formationUrls: ['https://issicuniversity.edu.bj'],
  },
  {
    name: 'Institut Universitaire Les Cours Sonou',
    acronym: 'LCS',
    description:
      "Les Cours Sonou (LCS) est une université privée bilingue au Bénin fondée en 2007 par Fabrice Sonou. Elle forme ses apprenants dans diverses disciplines en mettant l'accent sur l'excellence académique.",
    phone: '+2290160412121',
    email: 'contact@lescoursonou-universite.org',
    website: 'https://lescoursonou-universite.org',
    address: 'Cotonou, Bénin',
    coverUrl: `${config.app.frontendUrl}/LCS.jpg`,
    formationUrls: [],
  },
  {
    name: 'Pigier Bénin',
    acronym: 'PIGIER',
    description:
      "Pigier Bénin est une institution privée d'enseignement supérieur, franchise de la marque Pigier fondée en France en 1850. Agréée par la CREFECF/UEMOA, elle propose des formations Licence et Master Professionnels en banque, finance, audit, contrôle de gestion et informatique.",
    phone: '+22921302906',
    email: null,
    website: 'https://pigier-benin.com',
    address: 'Carré 1270, Rue 320 Agontinkon-Ayidote, Cotonou, Bénin',
    coverUrl: `${config.app.frontendUrl}/PIGIER.jpg`,
    formationUrls: ['https://pigier-benin.com'],
  },
  {
    name: 'Institut Jean Paul II de Philosophie et de Sciences Humaines',
    acronym: 'Saint-Jean-Paul',
    description:
      "L'Institut Jean-Paul II, situé à Cotonou, est un établissement privé d'enseignement supérieur spécialisé en sciences humaines. Il propose des formations variées en philosophie, psychologie, sociologie et domaines connexes, agréées par l'État.",
    phone: null,
    email: 'jpacademie@yahoo.fr',
    website: 'https://institutjeanpaul2.org',
    address: 'Cotonou, Bénin',
    coverUrl: `${config.app.frontendUrl}/saint-jean-paul-2-2.jpeg`,
    formationUrls: [],
  },
  {
    name: 'Sèmè One (Sèmè City)',
    acronym: 'Sèmè One',
    description:
      "Sèmè One est le premier campus de Sèmè City, situé au cœur de Cotonou sur une superficie de 4 500 m². Il fonctionne comme bâtiment administratif central du projet Sèmè City, hébergeant des programmes d'incubation, de formation comme l'Africa Design School, des espaces de co-working et un centre de langues.",
    phone: '+22921368800',
    email: 'contact@semecity.com',
    website: 'https://semecity.bj',
    address: 'Rue 364, Immeuble Sèmè One, Cotonou, Bénin',
    coverUrl: `${config.app.frontendUrl}/Sèmè One.jpg`,
    formationUrls: ['https://semecity.bj'],
  },
  {
    name: 'Université Africaine de Technologie et de Management',
    acronym: 'UATM(Gasa)',
    description:
      "L'Université Africaine de Technologie et de Management (UATM GASA FORMATION) est une université privée créée en 1992 par le Dr Théophane AYI. Première université privée du Bénin, elle compte plus de 2000 étudiants répartis dans 23 filières agréées, formant des ingénieurs, entrepreneurs, comptables, agronomes et juristes.",
    phone: '+22965787721',
    email: 'info@uatm-gasa.com',
    website: 'https://uatm-gasa.com',
    address: 'Gbégamey, Cotonou, Bénin',
    coverUrl: `${config.app.frontendUrl}/UATM(Gasa).avif`,
    formationUrls: ['https://uatm-gasa.com'],
  },
  {
    name: "Université Catholique de l'Afrique de l'Ouest - Unité Universitaire de Cotonou",
    acronym: 'UCAO-UCC',
    description:
      "L'UCAO-UUC est l'unité universitaire de l'Université Catholique de l'Afrique de l'Ouest à Cotonou. Plus grand réseau universitaire privé décentralisé d'Afrique, l'UCAO a été officiellement reconnue comme université privée catholique au Bénin.",
    phone: '+2290121604070',
    email: 'contact@ucaobenin.org',
    website: 'https://www.ucaobenin.org',
    address: "Lot 246, rue de l'hôpital St Jean, Cotonou, Bénin",
    coverUrl: `${config.app.frontendUrl}/UCAO-UCC.jpg`,
    formationUrls: [],
  },
  {
    name: "Université Nationale d'Agriculture",
    acronym: 'UNA',
    description:
      "L'Université Nationale d'Agriculture (UNA) est une université publique béninoise créée en 2016. Elle dispense des formations en Licence Professionnelle, Master et Doctorat dans les domaines de l'agriculture, l'aquaculture, l'horticulture, la foresterie et les industries agroalimentaires.",
    phone: null,
    email: null,
    website: 'https://una.bj',
    address: 'Porto-Novo, Bénin',
    coverUrl: `${config.app.frontendUrl}/una.png`,
    formationUrls: ['https://una.bj'],
  },
  {
    name: 'Université Nationale des Sciences, Technologies, Ingénierie et Mathématiques',
    acronym: 'UNSTIM',
    description:
      "L'UNSTIM est une université publique béninoise créée en 2016. Université thématique basée sur les STIM (Sciences, Technologies, Ingénierie et Mathématiques), elle assure la formation des cadres techniques, la recherche scientifique et l'innovation technologique.",
    phone: '+22940522199',
    email: 'unstim@unstim.bj',
    website: 'https://unstim.bj',
    address: 'Abomey, Bénin',
    coverUrl: `${config.app.frontendUrl}/unstim.png`,
    formationUrls: ['https://unstim.bj'],
  },
  {
    name: "Université Protestante de l'Afrique de l'Ouest",
    acronym: 'UPAO',
    description:
      "L'Université Protestante de l'Afrique de l'Ouest (UPAO) est un établissement privé bilingue situé à Porto-Novo, au Bénin. Fondée en 2003 et accréditée par le Ministère de l'Enseignement Supérieur, elle propose des formations en gestion, management, informatique et sciences sociales.",
    phone: null,
    email: 'info@upaopnbenin-edu.org',
    website: 'https://www.upaopnbenin-edu.org',
    address: 'Porto-Novo, Bénin',
    coverUrl: `${config.app.frontendUrl}/UPAO (2).jpg`,
    formationUrls: [],
  },
  {
    name: 'École Supérieure de Génie Civil Verechaguine A.K.',
    acronym: 'VAK',
    description:
      "L'École Supérieure de Génie Civil VERECHAGUINE A.K. (ESGC-VAK) est un établissement privé fondé en 1998 à Cotonou. Spécialisée historiquement en Génie Civil et Géomètre Topographe, elle a intégré en 2024 la filière Génie Informatique. Reconnue par le MESRS et le CAMES, elle est plusieurs fois primée pour son excellence académique.",
    phone: '+22921306917',
    email: 'contact@esgcvak.com',
    website: 'https://esgcvak.com',
    address: 'Gbégamey, Cotonou, Bénin',
    coverUrl: `${config.app.frontendUrl}/VAK (2).jpg`,
    formationUrls: ['https://esgcvak.com'],
  },
  {
    name: 'École Supérieure Multinationale des Télécommunications',
    acronym: 'ESMT',
    description:
      "L'École Supérieure Multinationale des Télécommunications (ESMT) est un Centre d'Excellence de l'Union Internationale des Télécommunications (UIT) depuis 2000. Elle forme des techniciens supérieurs dans les domaines techniques et managériaux des télécommunications et TIC.",
    phone: null,
    email: 'scolarite@esmt.sn',
    website: 'https://www.esmt.sn',
    address: 'Dakar, Sénégal (représentation au Bénin : Akpakpa, Cotonou)',
    coverUrl: `${config.app.frontendUrl}/ESMT.webp`,
    formationUrls: [],
  },
  {
    name: 'École Supérieure de Gestion et de Technologie',
    acronym: 'ESGT',
    description:
      "L'École Supérieure de Gestion et de Technologie (ESGT-BENIN) est un établissement privé d'enseignement supérieur à vocation universitaire. Elle propose des formations en gestion, management, ingénierie et technologie.",
    phone: '+22961483075',
    email: 'esgtbenin@gmail.com',
    website: 'https://esgt-benin.com',
    address: 'Cotonou, Bénin',
    coverUrl: `${config.app.frontendUrl}/ESGT.jpg`,
    formationUrls: [],
  },
];

const formations: {
  university: { name: string; acronym: string };
  title: string;
  description: string;
  duration: string;
  degree: string;
  field: string;
  link: string;
  costMin: number | null;
  costMax: number | null;
  programs: string[];
}[] = [
  {
    title: 'Licence Comptabilité, Contrôle et Audit (LCCA)',
    description:
      'Diplôme du CNAM INTEC de Paris — Grade de Licence (RNCP 35924). Formation de base solide dans les disciplines fondamentales des métiers de la comptabilité.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Comptabilité',
    link: 'https://cifecbenin.com/public/formations/licence-comptabilite-controle-et-audit-lcca',
    costMin: null,
    costMax: null,
    programs: ['Comptabilité', 'Contrôle', 'Audit'],
    university: {
      acronym: 'CIFEC',
      name: "Centre International de Formation à l'Expertise Comptable",
    },
  },
  {
    title: 'Diplôme de Comptabilité et de Gestion (DCG)',
    description:
      "Diplôme de l'État Français. Premier échelon de la filière expertise comptable française, conférant le grade de licence.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Comptabilité',
    link: 'https://cifecbenin.com/public/formations/diplome-de-comptabilite-et-de-gestion-dcg',
    costMin: null,
    costMax: null,
    programs: ['Comptabilité', 'Gestion', 'Droit fiscal'],
    university: {
      acronym: 'CIFEC',
      name: "Centre International de Formation à l'Expertise Comptable",
    },
  },
  {
    title: 'Diplôme de Gestion et de Comptabilité (DGC)',
    description:
      "Diplôme de l'INTEC de Paris équivalent au DCG, permettant d'obtenir un double diplôme.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Comptabilité',
    link: 'https://cifecbenin.com/public/formations/diplome-de-gestion-et-de-comptabilite-dgc',
    costMin: null,
    costMax: null,
    programs: ['Gestion', 'Comptabilité'],
    university: {
      acronym: 'CIFEC',
      name: "Centre International de Formation à l'Expertise Comptable",
    },
  },
  {
    title: 'Licence en Science Technique Comptable et Financière (LSTCF)',
    description:
      "Diplôme de l'ESCAE Niamey. Formation spécialisée dans les techniques comptables et financières adaptée au contexte régional.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Finance',
    link: 'https://cifecbenin.com/public/formations/licence-en-science-technique-comptable-et-financiere-lstcf',
    costMin: null,
    costMax: null,
    programs: ['Techniques comptables', 'Analyse financière'],
    university: {
      acronym: 'CIFEC',
      name: "Centre International de Formation à l'Expertise Comptable",
    },
  },
  {
    title: 'Licence Nationale Béninoise (FCA)',
    description: "Diplôme de l'État du Bénin préparé en triple parcours avec le DCG et la LCCA.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Comptabilité',
    link: 'https://cifecbenin.com/public/formations/licence-nationale-beninoise-fca',
    costMin: null,
    costMax: null,
    programs: ['Comptabilité', 'Fiscalité', 'Audit'],
    university: {
      acronym: 'CIFEC',
      name: "Centre International de Formation à l'Expertise Comptable",
    },
  },
  {
    title: 'Master Comptabilité, Contrôle et Audit (MCCA)',
    description:
      "Diplôme de l'ESCAE Niamey / CNAM-INTEC. Diplôme de référence pour accéder aux métiers de l'audit et de l'expertise comptable.",
    duration: '2 ans',
    degree: 'Master',
    field: 'Comptabilité',
    link: 'https://cifecbenin.com/public/formations/master-comptabilite-controle-et-audit-mcca',
    costMin: null,
    costMax: null,
    programs: ['Audit', 'Contrôle de gestion', 'Expertise comptable'],
    university: {
      acronym: 'CIFEC',
      name: "Centre International de Formation à l'Expertise Comptable",
    },
  },
  {
    title: 'Diplôme Supérieur de Gestion et de Comptabilité (DSGC)',
    description:
      "Diplôme de l'INTEC de Paris conférant le grade de Master, préparant au stage d'expertise comptable.",
    duration: '2 ans',
    degree: 'Master',
    field: 'Comptabilité',
    link: 'https://cifecbenin.com/public/formations/diplome-superieur-de-gestion-et-de-comptabilite-dsgc',
    costMin: null,
    costMax: null,
    programs: ['Gestion', 'Comptabilité', 'Audit'],
    university: {
      acronym: 'CIFEC',
      name: "Centre International de Formation à l'Expertise Comptable",
    },
  },
  {
    title: 'Diplôme Supérieur de Comptabilité et de Gestion (DSCG)',
    description:
      "Diplôme de l'État Français. Deuxième échelon de la filière de l'expertise comptable française.",
    duration: '2 ans',
    degree: 'Master',
    field: 'Comptabilité',
    link: 'https://cifecbenin.com/public/formations/diplome-superieur-de-comptabilite-et-de-gestion-dscg',
    costMin: null,
    costMax: null,
    programs: ['Comptabilité', 'Gestion', 'Expertise comptable'],
    university: {
      acronym: 'CIFEC',
      name: "Centre International de Formation à l'Expertise Comptable",
    },
  },
  {
    title: 'Licence Professionnelle en Communication Visuelle (Graphique et Numérique)',
    description:
      'Formation professionnelle aux métiers du design graphique et de la communication visuelle pour supports print et numériques.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Design',
    link: 'https://eiggroupe.com/formations/licence-pro/',
    costMin: null,
    costMax: null,
    programs: ['Design graphique', 'Illustration', 'PAO', 'UI Design', 'Typographie'],
    university: {
      acronym: 'EIG',
      name: 'École Internationale de Graphisme du Bénin',
    },
  },
  {
    title: 'Licence Professionnelle en Réalisation Cinéma et Télévision',
    description:
      'Formation aux techniques de prise de vue, montage, direction artistique et gestion de projets audiovisuels.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Audiovisuel',
    link: 'https://eiggroupe.com/formations/licence-pro/',
    costMin: null,
    costMax: null,
    programs: ['Cadrage', 'Montage vidéo', 'Direction artistique', 'Gestion de projets'],
    university: {
      acronym: 'EIG',
      name: 'École Internationale de Graphisme du Bénin',
    },
  },
  {
    title: 'Licence Professionnelle en Développement Web',
    description:
      'Formation aux technologies de développement de sites et applications web, orientée vers les métiers du numérique.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Informatique',
    link: 'https://eiggroupe.com/formations/licence-pro/',
    costMin: null,
    costMax: null,
    programs: ['HTML', 'CSS', 'JavaScript', 'PHP', 'React'],
    university: {
      acronym: 'EIG',
      name: 'École Internationale de Graphisme du Bénin',
    },
  },
  {
    title: 'Administration Générale et Territoriale (AGT)',
    description:
      "Formation de cadres administratifs pour l'administration publique et les collectivités territoriales.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Administration',
    link: 'https://www.oreilleducampus.org/universite-abomey-calavi/132-ecole-nationale-administration-et-de-magistrature-enam-uac-benin.html',
    costMin: null,
    costMax: null,
    programs: ['Droit public', 'Gestion administrative', 'Finances publiques'],
    university: {
      acronym: 'ENA',
      name: "École Nationale d'Administration et de Magistrature",
    },
  },
  {
    title: 'Diplomatie et Relations Internationales (DRI)',
    description: 'Formation aux métiers de la diplomatie et des relations internationales.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Relations Internationales',
    link: 'https://www.oreilleducampus.org/universite-abomey-calavi/132-ecole-nationale-administration-et-de-magistrature-enam-uac-benin.html',
    costMin: null,
    costMax: null,
    programs: ['Droit international', 'Protocole', 'Négociation'],
    university: {
      acronym: 'ENA',
      name: "École Nationale d'Administration et de Magistrature",
    },
  },
  {
    title: 'Administration du Travail et de Sécurité Sociale (ATSS)',
    description:
      "Formation spécialisée en droit du travail et gestion de la sécurité sociale dans l'administration publique.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Droit Social',
    link: 'https://www.oreilleducampus.org/universite-abomey-calavi/132-ecole-nationale-administration-et-de-magistrature-enam-uac-benin.html',
    costMin: null,
    costMax: null,
    programs: ['Droit du travail', 'Sécurité sociale', 'Gestion du personnel'],
    university: {
      acronym: 'ENA',
      name: "École Nationale d'Administration et de Magistrature",
    },
  },
  {
    title: 'Administration des Finances et du Trésor (AFT)',
    description: 'Formation spécialisée en finances publiques et administration du trésor.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Finance',
    link: 'https://www.oreilleducampus.org/universite-abomey-calavi/132-ecole-nationale-administration-et-de-magistrature-enam-uac-benin.html',
    costMin: null,
    costMax: null,
    programs: ['Comptabilité publique', 'Fiscalité', 'Gestion budgétaire'],
    university: {
      acronym: 'ENA',
      name: "École Nationale d'Administration et de Magistrature",
    },
  },
  {
    title: 'Administration des Impôts',
    description: 'Formation spécialisée en fiscalité et administration des impôts.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Fiscalité',
    link: 'https://www.oreilleducampus.org/universite-abomey-calavi/132-ecole-nationale-administration-et-de-magistrature-enam-uac-benin.html',
    costMin: null,
    costMax: null,
    programs: ['Droit fiscal', 'Procédures fiscales', 'Gestion des impôts'],
    university: {
      acronym: 'ENA',
      name: "École Nationale d'Administration et de Magistrature",
    },
  },
  {
    title: "Administration Hospitalière, Universitaire et d'Intendance (AHUI)",
    description:
      "Formation à la gestion administrative des hôpitaux, universités et services d'intendance.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Administration',
    link: 'https://www.oreilleducampus.org/universite-abomey-calavi/132-ecole-nationale-administration-et-de-magistrature-enam-uac-benin.html',
    costMin: null,
    costMax: null,
    programs: ['Gestion hospitalière', 'Administration universitaire', 'Intendance'],
    university: {
      acronym: 'ENA',
      name: "École Nationale d'Administration et de Magistrature",
    },
  },
  {
    title: 'Gestion des Marchés Publics (GMP)',
    description: 'Formation spécialisée en passation et gestion des marchés publics.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Marchés Publics',
    link: 'https://www.oreilleducampus.org/universite-abomey-calavi/132-ecole-nationale-administration-et-de-magistrature-enam-uac-benin.html',
    costMin: null,
    costMax: null,
    programs: ['Code des marchés publics', 'Gestion contractuelle', 'Audit des marchés'],
    university: {
      acronym: 'ENA',
      name: "École Nationale d'Administration et de Magistrature",
    },
  },
  {
    title: 'Gestion Financière des Collectivités Locales (GFCL)',
    description: 'Formation en gestion budgétaire et financière des collectivités territoriales.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Finance',
    link: 'https://www.oreilleducampus.org/universite-abomey-calavi/132-ecole-nationale-administration-et-de-magistrature-enam-uac-benin.html',
    costMin: null,
    costMax: null,
    programs: ['Finances locales', 'Budget communal', 'Comptabilité publique'],
    university: {
      acronym: 'ENA',
      name: "École Nationale d'Administration et de Magistrature",
    },
  },
  {
    title: 'Planification et Développement Local (PDL)',
    description: 'Formation en planification stratégique et développement local.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Développement Local',
    link: 'https://www.oreilleducampus.org/universite-abomey-calavi/132-ecole-nationale-administration-et-de-magistrature-enam-uac-benin.html',
    costMin: null,
    costMax: null,
    programs: ['Planification stratégique', 'Développement territorial', 'Gestion de projets'],
    university: {
      acronym: 'ENA',
      name: "École Nationale d'Administration et de Magistrature",
    },
  },
  {
    title: 'Archivistique',
    description: "Formation aux techniques d'archivage et de gestion documentaire.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Documentation',
    link: 'https://www.oreilleducampus.org/universite-abomey-calavi/132-ecole-nationale-administration-et-de-magistrature-enam-uac-benin.html',
    costMin: null,
    costMax: null,
    programs: ['Archivistique', 'Gestion documentaire', 'Conservation'],
    university: {
      acronym: 'ENA',
      name: "École Nationale d'Administration et de Magistrature",
    },
  },
  {
    title: 'Bibliothéconomie',
    description:
      'Formation aux techniques de gestion des bibliothèques et centres de documentation.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Documentation',
    link: 'https://www.oreilleducampus.org/universite-abomey-calavi/132-ecole-nationale-administration-et-de-magistrature-enam-uac-benin.html',
    costMin: null,
    costMax: null,
    programs: ['Bibliothéconomie', 'Catalogage', "Gestion de l'information"],
    university: {
      acronym: 'ENA',
      name: "École Nationale d'Administration et de Magistrature",
    },
  },
  {
    title: 'Secrétariat Comptable',
    description: 'Formation en secrétariat avec spécialisation en comptabilité.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Secrétariat',
    link: 'https://www.oreilleducampus.org/universite-abomey-calavi/132-ecole-nationale-administration-et-de-magistrature-enam-uac-benin.html',
    costMin: null,
    costMax: null,
    programs: ['Secrétariat', 'Comptabilité', 'Bureautique'],
    university: {
      acronym: 'ENA',
      name: "École Nationale d'Administration et de Magistrature",
    },
  },
  {
    title: 'Secrétariat Bilingue',
    description: 'Formation en secrétariat avec maîtrise de deux langues (Français et Anglais).',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Secrétariat',
    link: 'https://www.oreilleducampus.org/universite-abomey-calavi/132-ecole-nationale-administration-et-de-magistrature-enam-uac-benin.html',
    costMin: null,
    costMax: null,
    programs: ['Secrétariat', 'Anglais professionnel', 'Correspondance'],
    university: {
      acronym: 'ENA',
      name: "École Nationale d'Administration et de Magistrature",
    },
  },
  {
    title: 'Secrétariat Médical',
    description: 'Formation spécialisée en secrétariat médical et gestion administrative de santé.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Secrétariat',
    link: 'https://www.oreilleducampus.org/universite-abomey-calavi/132-ecole-nationale-administration-et-de-magistrature-enam-uac-benin.html',
    costMin: null,
    costMax: null,
    programs: ['Terminologie médicale', 'Gestion hospitalière', 'Secrétariat'],
    university: {
      acronym: 'ENA',
      name: "École Nationale d'Administration et de Magistrature",
    },
  },
  {
    title: 'Secrétariat de Direction',
    description: 'Formation de cadres en secrétariat de direction et assistanat.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Secrétariat',
    link: 'https://www.oreilleducampus.org/universite-abomey-calavi/132-ecole-nationale-administration-et-de-magistrature-enam-uac-benin.html',
    costMin: null,
    costMax: null,
    programs: ['Secrétariat de direction', 'Organisation', 'Communication professionnelle'],
    university: {
      acronym: 'ENA',
      name: "École Nationale d'Administration et de Magistrature",
    },
  },
  {
    title: 'Licence Professionnelle en Gestion Financière et Comptable',
    description:
      'Formation aux techniques de gestion financière et comptable en entreprise avec des débouchés en cabinets comptables, banques, assurances et administrations.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Finance',
    link: 'https://eneam.uac.bj/',
    costMin: null,
    costMax: null,
    programs: ['Comptabilité', 'Analyse financière', 'Contrôle de gestion'],
    university: {
      acronym: 'ENEAM',
      name: "École Nationale d'Économie Appliquée et de Management",
    },
  },
  {
    title: 'Licence Professionnelle en Gestion des Ressources Humaines',
    description:
      'Formation en gestion du personnel, droit social et relations sociales en entreprise.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Management',
    link: 'https://eneam.uac.bj/',
    costMin: null,
    costMax: null,
    programs: ['Droit du travail', 'Recrutement', 'GPEC'],
    university: {
      acronym: 'ENEAM',
      name: "École Nationale d'Économie Appliquée et de Management",
    },
  },
  {
    title: 'Licence Professionnelle en Gestion des Banques et Assurances',
    description:
      'Formation spécialisée en techniques bancaires, marchés financiers et micro-finance.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Finance',
    link: 'https://eneam.uac.bj/',
    costMin: null,
    costMax: null,
    programs: ['Techniques bancaires', 'Marchés financiers', 'Assurance'],
    university: {
      acronym: 'ENEAM',
      name: "École Nationale d'Économie Appliquée et de Management",
    },
  },
  {
    title: 'Licence Professionnelle en Gestion Commerciale',
    description: 'Formation aux techniques de vente, marketing et commerce international.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Commerce',
    link: 'https://eneam.uac.bj/',
    costMin: null,
    costMax: null,
    programs: ['Techniques de vente', 'Commerce international', 'Marketing'],
    university: {
      acronym: 'ENEAM',
      name: "École Nationale d'Économie Appliquée et de Management",
    },
  },
  {
    title: 'Licence Professionnelle en Gestion des Transports et Logistique',
    description: "Formation spécialisée en logistique, transport et chaîne d'approvisionnement.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Logistique',
    link: 'https://eneam.uac.bj/',
    costMin: null,
    costMax: null,
    programs: ['Transport', 'Logistique', 'Supply chain'],
    university: {
      acronym: 'ENEAM',
      name: "École Nationale d'Économie Appliquée et de Management",
    },
  },
  {
    title: 'Licence Professionnelle en Statistique',
    description:
      'Formation en statistique appliquée avec débouchés en banques, assurances, recherche et administrations.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Statistique',
    link: 'https://eneam.uac.bj/',
    costMin: null,
    costMax: null,
    programs: ['Statistique', 'Économétrie', 'Analyse de données'],
    university: {
      acronym: 'ENEAM',
      name: "École Nationale d'Économie Appliquée et de Management",
    },
  },
  {
    title: 'Licence Professionnelle en Planification',
    description: 'Formation en planification stratégique et programmation économique.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Planification',
    link: 'https://eneam.uac.bj/',
    costMin: null,
    costMax: null,
    programs: ['Planification', 'Prévision', 'Programmation'],
    university: {
      acronym: 'ENEAM',
      name: "École Nationale d'Économie Appliquée et de Management",
    },
  },
  {
    title: 'Licence Professionnelle en Informatique de Gestion',
    description:
      "Formation en systèmes d'information et gestion informatique appliquée à l'entreprise.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Informatique',
    link: 'https://eneam.uac.bj/',
    costMin: null,
    costMax: null,
    programs: ['Programmation', 'Réseaux', 'Bases de données'],
    university: {
      acronym: 'ENEAM',
      name: "École Nationale d'Économie Appliquée et de Management",
    },
  },
  {
    title: 'BTS en Comptabilité et Gestion',
    description: 'Brevet de Technicien Supérieur en comptabilité et gestion.',
    duration: '2 ans',
    degree: 'BTS',
    field: 'Comptabilité',
    link: 'https://eneam.uac.bj/',
    costMin: null,
    costMax: null,
    programs: ['Comptabilité', 'Gestion', 'Fiscalité'],
    university: {
      acronym: 'ENEAM',
      name: "École Nationale d'Économie Appliquée et de Management",
    },
  },
  {
    title: "BTS en Banque et Finance d'Entreprise",
    description:
      "Brevet de Technicien Supérieur spécialisé en techniques bancaires et finance d'entreprise.",
    duration: '2 ans',
    degree: 'BTS',
    field: 'Finance',
    link: 'https://eneam.uac.bj/',
    costMin: null,
    costMax: null,
    programs: ['Banque', 'Finance', 'Gestion'],
    university: {
      acronym: 'ENEAM',
      name: "École Nationale d'Économie Appliquée et de Management",
    },
  },
  {
    title: 'BTS en Marketing et Action Commerciale',
    description: 'Brevet de Technicien Supérieur en techniques marketing et commerciales.',
    duration: '2 ans',
    degree: 'BTS',
    field: 'Marketing',
    link: 'https://eneam.uac.bj/',
    costMin: null,
    costMax: null,
    programs: ['Marketing', 'Commerce', 'Communication'],
    university: {
      acronym: 'ENEAM',
      name: "École Nationale d'Économie Appliquée et de Management",
    },
  },
  {
    title: 'BTS en Informatique de Gestion',
    description: 'Brevet de Technicien Supérieur en informatique appliquée à la gestion.',
    duration: '2 ans',
    degree: 'BTS',
    field: 'Informatique',
    link: 'https://eneam.uac.bj/',
    costMin: null,
    costMax: null,
    programs: ['Programmation', 'Bases de données', 'Réseaux'],
    university: {
      acronym: 'ENEAM',
      name: "École Nationale d'Économie Appliquée et de Management",
    },
  },
  {
    title: 'BTS en Transport Logistique',
    description: 'Brevet de Technicien Supérieur en transport et logistique.',
    duration: '2 ans',
    degree: 'BTS',
    field: 'Logistique',
    link: 'https://eneam.uac.bj/',
    costMin: null,
    costMax: null,
    programs: ['Transport', 'Logistique', 'Supply chain'],
    university: {
      acronym: 'ENEAM',
      name: "École Nationale d'Économie Appliquée et de Management",
    },
  },
  {
    title: 'Bachelor en Informatique',
    description:
      "Programme en 3 ans post-bac pour acquérir de solides compétences en ingénierie logicielle. Diplôme reconnu à l'international.",
    duration: '3 ans',
    degree: 'Bachelor',
    field: 'Informatique',
    link: 'https://epitech.africa/',
    costMin: null,
    costMax: null,
    programs: ['Algorithmique', 'Programmation', 'Réseaux', 'Systèmes', 'Bases de données'],
    university: {
      acronym: 'EPITECH',
      name: 'Epitech Bénin',
    },
  },
  {
    title: 'MSc Pro Intelligence Artificielle',
    description:
      'Programme de spécialisation en alternance de 2 ans pour devenir expert en Intelligence Artificielle.',
    duration: '2 ans',
    degree: 'Master',
    field: 'Intelligence Artificielle',
    link: 'https://epitech.africa/formation-alternance/master-of-science-post-bac3/',
    costMin: null,
    costMax: null,
    programs: ['Machine Learning', 'Deep Learning', 'IA', 'Data Science'],
    university: {
      acronym: 'EPITECH',
      name: 'Epitech Bénin',
    },
  },
  {
    title: 'MSc Pro Big Data',
    description:
      'Programme de spécialisation en alternance de 2 ans pour devenir expert en traitement de données massives.',
    duration: '2 ans',
    degree: 'Master',
    field: 'Big Data',
    link: 'https://epitech.africa/formation-alternance/master-of-science-post-bac3/',
    costMin: null,
    costMax: null,
    programs: ['Big Data', 'Data Science', 'Hadoop', 'Spark'],
    university: {
      acronym: 'EPITECH',
      name: 'Epitech Bénin',
    },
  },
  {
    title: 'MSc Pro Cybersécurité',
    description:
      'Programme de spécialisation en alternance de 2 ans pour devenir expert en sécurité informatique.',
    duration: '2 ans',
    degree: 'Master',
    field: 'Cybersécurité',
    link: 'https://epitech.africa/formation-alternance/master-of-science-post-bac3/',
    costMin: null,
    costMax: null,
    programs: ['Sécurité réseau', 'Cryptographie', 'Pentesting', 'Audit de sécurité'],
    university: {
      acronym: 'EPITECH',
      name: 'Epitech Bénin',
    },
  },
  {
    title: 'MSc Pro Cloud',
    description:
      'Programme de spécialisation en alternance de 2 ans pour devenir expert en infrastructures Cloud.',
    duration: '2 ans',
    degree: 'Master',
    field: 'Cloud Computing',
    link: 'https://epitech.africa/formation-alternance/master-of-science-post-bac3/',
    costMin: null,
    costMax: null,
    programs: ['Cloud', 'DevOps', 'AWS', 'Azure'],
    university: {
      acronym: 'EPITECH',
      name: 'Epitech Bénin',
    },
  },
  {
    title: 'MSc Pro Transformation Digitale',
    description:
      'Programme de spécialisation en alternance de 2 ans pour piloter la transformation digitale des organisations.',
    duration: '2 ans',
    degree: 'Master',
    field: 'Transformation Digitale',
    link: 'https://epitech.africa/formation-alternance/master-of-science-post-bac3/',
    costMin: null,
    costMax: null,
    programs: ['Transformation digitale', 'Management', 'Stratégie IT'],
    university: {
      acronym: 'EPITECH',
      name: 'Epitech Bénin',
    },
  },
  {
    title: 'Licence en Sciences de Gestion — Marketing Communication',
    description:
      "Formation en stratégies marketing, communication d'entreprise et commerce international.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Marketing',
    link: 'https://www.esgis.bj/',
    costMin: null,
    costMax: null,
    programs: ['Marketing', 'Communication', 'Commerce international'],
    university: {
      acronym: 'ESGIS',
      name: "École Supérieure de Gestion d'Informatique et des Sciences",
    },
  },
  {
    title:
      "Licence en Sciences de Gestion — Finance d'Entreprise, Relations Bancaires et Comptabilité",
    description: "Formation en finance d'entreprise, techniques bancaires et comptabilité.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Finance',
    link: 'https://www.esgis.bj/',
    costMin: null,
    costMax: null,
    programs: ["Finance d'entreprise", 'Banque', 'Comptabilité'],
    university: {
      acronym: 'ESGIS',
      name: "École Supérieure de Gestion d'Informatique et des Sciences",
    },
  },
  {
    title: 'Licence en Sciences de Gestion — Comptabilité, Contrôle et Audit',
    description: 'Formation spécialisée en comptabilité, contrôle de gestion et audit.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Comptabilité',
    link: 'https://www.esgis.bj/',
    costMin: null,
    costMax: null,
    programs: ['Comptabilité', 'Contrôle de gestion', 'Audit'],
    university: {
      acronym: 'ESGIS',
      name: "École Supérieure de Gestion d'Informatique et des Sciences",
    },
  },
  {
    title: 'Licence en Sciences de Gestion — Banque Finance',
    description: 'Formation aux métiers de la banque, de la finance et des marchés financiers.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Finance',
    link: 'https://www.esgis.bj/',
    costMin: null,
    costMax: null,
    programs: ['Banque', 'Finance', 'Marchés financiers'],
    university: {
      acronym: 'ESGIS',
      name: "École Supérieure de Gestion d'Informatique et des Sciences",
    },
  },
  {
    title: 'Licence en Sciences de Gestion — Gestion des Ressources Humaines',
    description: 'Formation en gestion du personnel, recrutement et droit social.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Management',
    link: 'https://www.esgis.bj/',
    costMin: null,
    costMax: null,
    programs: ['GRH', 'Droit du travail', 'Recrutement'],
    university: {
      acronym: 'ESGIS',
      name: "École Supérieure de Gestion d'Informatique et des Sciences",
    },
  },
  {
    title: 'Licence en Sciences de Gestion — Transport Logistique et Management Portuaire',
    description: 'Formation en logistique, transport international et gestion portuaire.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Logistique',
    link: 'https://www.esgis.bj/',
    costMin: null,
    costMax: null,
    programs: ['Transport', 'Logistique', 'Management portuaire'],
    university: {
      acronym: 'ESGIS',
      name: "École Supérieure de Gestion d'Informatique et des Sciences",
    },
  },
  {
    title: 'Licence en Sciences de Gestion — Gestion des Projets',
    description: "Formation en conduite de projets, management d'équipes et suivi-évaluation.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Management',
    link: 'https://www.esgis.bj/',
    costMin: null,
    costMax: null,
    programs: ['Gestion de projets', 'Suivi-évaluation', "Management d'équipe"],
    university: {
      acronym: 'ESGIS',
      name: "École Supérieure de Gestion d'Informatique et des Sciences",
    },
  },
  {
    title: 'Licence en Informatique, Réseaux et Télécommunication',
    description: 'Formation en génie informatique, administration réseaux et télécommunications.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Informatique',
    link: 'https://www.esgis.bj/',
    costMin: null,
    costMax: null,
    programs: ['Programmation', 'Réseaux', 'Télécommunications'],
    university: {
      acronym: 'ESGIS',
      name: "École Supérieure de Gestion d'Informatique et des Sciences",
    },
  },
  {
    title: 'Master en Comptabilité Contrôle Audit',
    description: 'Formation avancée en audit, contrôle de gestion et expertise comptable.',
    duration: '2 ans',
    degree: 'Master',
    field: 'Comptabilité',
    link: 'https://www.esgis.org/',
    costMin: null,
    costMax: null,
    programs: ['Audit', 'Contrôle de gestion', 'Normes IFRS'],
    university: {
      acronym: 'ESGIS',
      name: "École Supérieure de Gestion d'Informatique et des Sciences",
    },
  },
  {
    title: 'Master en Intelligence Artificielle et Big Data',
    description:
      'Formation avancée en intelligence artificielle et traitement de données massives.',
    duration: '2 ans',
    degree: 'Master',
    field: 'Informatique',
    link: 'https://www.esgis.org/',
    costMin: null,
    costMax: null,
    programs: ['IA', 'Big Data', 'Machine Learning'],
    university: {
      acronym: 'ESGIS',
      name: "École Supérieure de Gestion d'Informatique et des Sciences",
    },
  },
  {
    title: 'Licence Professionnelle en Hôtellerie-Restauration',
    description:
      'Formation professionnelle basée sur 70% de travaux pratiques pour former des cadres immédiatement opérationnels en hôtellerie et restauration.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Hôtellerie',
    link: 'https://www.esmathbenin.org/',
    costMin: null,
    costMax: null,
    programs: ['Gestion hôtelière', 'Restauration', 'Management'],
    university: {
      acronym: 'ESMATH',
      name: 'École Supérieure de Management, Tourisme, Hôtellerie et Restauration',
    },
  },
  {
    title: 'Licence Professionnelle en Tourisme',
    description:
      "Formation aux métiers du tourisme : guidage, gestion d'agences de voyage et management touristique.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Tourisme',
    link: 'https://www.esmathbenin.org/',
    costMin: null,
    costMax: null,
    programs: ['Tourisme', 'Guidage', 'Management touristique'],
    university: {
      acronym: 'ESMATH',
      name: 'École Supérieure de Management, Tourisme, Hôtellerie et Restauration',
    },
  },
  {
    title: 'Licence Professionnelle en Génie Electrique et Energies Renouvelables (GEER)',
    description:
      "Formation aux métiers de l'électricité et des énergies renouvelables, spécialisée en solaire, éolien et biomasse.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Énergies Renouvelables',
    link: 'https://esmer-benin.org/',
    costMin: null,
    costMax: null,
    programs: ['Solaire', 'Éolien', 'Biomasse', 'Électricité'],
    university: {
      acronym: 'ESMER-Benin',
      name: 'École Supérieure des Métiers des Energies Renouvelables',
    },
  },
  {
    title: 'Licence Professionnelle en Génie Energétique et Développement Durable (GEDu)',
    description:
      'Formation en génie énergétique orientée vers le développement durable et la transition énergétique.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Énergies Renouvelables',
    link: 'https://esmer-benin.org/',
    costMin: null,
    costMax: null,
    programs: ['Génie énergétique', 'Développement durable', 'Transition énergétique'],
    university: {
      acronym: 'ESMER-Benin',
      name: 'École Supérieure des Métiers des Energies Renouvelables',
    },
  },
  {
    title: 'Licence Professionnelle en Génie Frigorifique et Climatisation (GeFriCER)',
    description: 'Formation spécialisée en techniques de froid et climatisation.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Génie Thermique',
    link: 'https://esmer-benin.org/',
    costMin: null,
    costMax: null,
    programs: ['Froid', 'Climatisation', 'Thermodynamique'],
    university: {
      acronym: 'ESMER-Benin',
      name: 'École Supérieure des Métiers des Energies Renouvelables',
    },
  },
  {
    title: 'Master en Energies Renouvelables et Efficacité Energétique (ENREE)',
    description:
      "Formation avancée en gestion des systèmes énergétiques renouvelables et optimisation de l'efficacité énergétique.",
    duration: '2 ans',
    degree: 'Master',
    field: 'Énergies Renouvelables',
    link: 'https://esmer-benin.org/',
    costMin: null,
    costMax: null,
    programs: ['Efficacité énergétique', 'Solaire', 'Réseaux électriques'],
    university: {
      acronym: 'ESMER-Benin',
      name: 'École Supérieure des Métiers des Energies Renouvelables',
    },
  },
  {
    title:
      'Master en Stratégies de Développement et Conduite des Ressources Energétiques et Energies Renouvelables (SDéCRE)',
    description:
      'Formation avancée en stratégies de développement des ressources énergétiques renouvelables.',
    duration: '2 ans',
    degree: 'Master',
    field: 'Énergies Renouvelables',
    link: 'https://esmer-benin.org/',
    costMin: null,
    costMax: null,
    programs: ['Stratégies énergétiques', 'Développement durable', 'Ressources renouvelables'],
    university: {
      acronym: 'ESMER-Benin',
      name: 'École Supérieure des Métiers des Energies Renouvelables',
    },
  },
  {
    title: 'Master en Réseaux Electriques et Distribution (REDi)',
    description:
      'Formation avancée en conception et gestion des réseaux électriques et systèmes de distribution.',
    duration: '2 ans',
    degree: 'Master',
    field: 'Énergies Renouvelables',
    link: 'https://esmer-benin.org/',
    costMin: null,
    costMax: null,
    programs: ['Réseaux électriques', 'Distribution', 'Smart grids'],
    university: {
      acronym: 'ESMER-Benin',
      name: 'École Supérieure des Métiers des Energies Renouvelables',
    },
  },
  {
    title: 'Licence en Marketing, Communication et Commerce (MCC)',
    description:
      "Formation en stratégies marketing, communication d'entreprise et techniques commerciales.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Marketing',
    link: 'https://esm-benin.com/nos-filieres/',
    costMin: null,
    costMax: null,
    programs: ['Marketing', 'Communication', 'Commerce'],
    university: {
      acronym: 'ESM-BENIN',
      name: 'École Supérieure de Management',
    },
  },
  {
    title: 'Licence en Finance Comptabilité et Audit (FCA)',
    description: 'Formation spécialisée en comptabilité, contrôle de gestion et audit financier.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Finance',
    link: 'https://esm-benin.com/nos-filieres/',
    costMin: null,
    costMax: null,
    programs: ['Comptabilité', 'Audit', 'Contrôle de gestion'],
    university: {
      acronym: 'ESM-BENIN',
      name: 'École Supérieure de Management',
    },
  },
  {
    title: 'Licence en Banque Finance et Assurance (BFA)',
    description: "Formation aux métiers de la banque, des marchés financiers et de l'assurance.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Finance',
    link: 'https://esm-benin.com/nos-filieres/',
    costMin: null,
    costMax: null,
    programs: ['Banque', 'Finance', 'Assurance'],
    university: {
      acronym: 'ESM-BENIN',
      name: 'École Supérieure de Management',
    },
  },
  {
    title: 'Licence en Gestion des Ressources Humaines (GRH)',
    description: 'Formation en gestion du capital humain, recrutement et droit social.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Management',
    link: 'https://esm-benin.com/nos-filieres/',
    costMin: null,
    costMax: null,
    programs: ['GRH', 'Droit du travail', 'Recrutement'],
    university: {
      acronym: 'ESM-BENIN',
      name: 'École Supérieure de Management',
    },
  },
  {
    title: 'Licence en Entrepreneuriat et Gestion des Projets (EGP)',
    description: "Formation en création d'entreprise, gestion de projets et innovation.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Management',
    link: 'https://esm-benin.com/nos-filieres/',
    costMin: null,
    costMax: null,
    programs: ['Entrepreneuriat', 'Gestion de projets', 'Innovation'],
    university: {
      acronym: 'ESM-BENIN',
      name: 'École Supérieure de Management',
    },
  },
  {
    title: 'Licence en Transport et Logistique (TL)',
    description: 'Formation en gestion des transports et de la chaîne logistique.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Logistique',
    link: 'https://esm-benin.com/nos-filieres/',
    costMin: null,
    costMax: null,
    programs: ['Transport', 'Logistique', 'Supply chain'],
    university: {
      acronym: 'ESM-BENIN',
      name: 'École Supérieure de Management',
    },
  },
  {
    title: 'Licence en Gestion des Médias (GM)',
    description:
      'Formation aux métiers de la communication média, gestion de contenus et stratégies éditoriales.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Communication',
    link: 'https://esm-benin.com/nos-filieres/',
    costMin: null,
    costMax: null,
    programs: ['Gestion des médias', 'Stratégie éditoriale', 'Communication'],
    university: {
      acronym: 'ESM-BENIN',
      name: 'École Supérieure de Management',
    },
  },
  {
    title: 'Licence en Hôtellerie et Tourisme (HT)',
    description: 'Formation en gestion hôtelière, management touristique et restauration.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Tourisme',
    link: 'https://esm-benin.com/nos-filieres/',
    costMin: null,
    costMax: null,
    programs: ['Hôtellerie', 'Tourisme', 'Restauration'],
    university: {
      acronym: 'ESM-BENIN',
      name: 'École Supérieure de Management',
    },
  },
  {
    title: 'Licence en Systèmes Informatiques et Logiciels (SIL)',
    description:
      'Formation en développement logiciel, administration réseaux et programmation web.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Informatique',
    link: 'https://esm-benin.com/nos-filieres/',
    costMin: null,
    costMax: null,
    programs: ['Programmation', 'Réseaux', 'Développement web'],
    university: {
      acronym: 'ESM-BENIN',
      name: 'École Supérieure de Management',
    },
  },
  {
    title: 'Licence en Génie Civil, Eau et Assainissement',
    description: 'Formation en génie civil avec spécialisation en eau et assainissement.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Génie Civil',
    link: 'https://esm-benin.com/nos-filieres/',
    costMin: null,
    costMax: null,
    programs: ['Génie civil', 'Eau', 'Assainissement'],
    university: {
      acronym: 'ESM-BENIN',
      name: 'École Supérieure de Management',
    },
  },
  {
    title: 'DTS en Finance Comptabilité et Audit (FCA)',
    description: 'Diplôme de Technicien Supérieur en finance, comptabilité et audit.',
    duration: '2 ans',
    degree: 'BTS',
    field: 'Finance',
    link: 'https://estg-benin.com/nos-formations/',
    costMin: null,
    costMax: null,
    programs: ['Finance', 'Comptabilité', 'Audit'],
    university: {
      acronym: 'ESTG',
      name: 'École Supérieure de Technologie et de Gestion',
    },
  },
  {
    title: 'DTS en Gestion Commerciale (GC)',
    description: 'Diplôme de Technicien Supérieur en gestion commerciale et techniques de vente.',
    duration: '2 ans',
    degree: 'BTS',
    field: 'Commerce',
    link: 'https://estg-benin.com/nos-formations/',
    costMin: null,
    costMax: null,
    programs: ['Commerce', 'Vente', 'Marketing'],
    university: {
      acronym: 'ESTG',
      name: 'École Supérieure de Technologie et de Gestion',
    },
  },
  {
    title: "DTS en Communication d'Entreprise (CE)",
    description:
      'Diplôme de Technicien Supérieur en communication corporate et relations publiques.',
    duration: '2 ans',
    degree: 'BTS',
    field: 'Communication',
    link: 'https://estg-benin.com/nos-formations/',
    costMin: null,
    costMax: null,
    programs: ['Communication', 'Relations publiques', 'Événementiel'],
    university: {
      acronym: 'ESTG',
      name: 'École Supérieure de Technologie et de Gestion',
    },
  },
  {
    title: 'DTS en Gestion des Ressources Humaines (GRH)',
    description: 'Diplôme de Technicien Supérieur en gestion du personnel et administration RH.',
    duration: '2 ans',
    degree: 'BTS',
    field: 'Management',
    link: 'https://estg-benin.com/nos-formations/',
    costMin: null,
    costMax: null,
    programs: ['GRH', 'Droit du travail', 'Administration du personnel'],
    university: {
      acronym: 'ESTG',
      name: 'École Supérieure de Technologie et de Gestion',
    },
  },
  {
    title: "DTS en Informatique Développeur d'Application (IDA)",
    description: "Diplôme de Technicien Supérieur en développement d'applications informatiques.",
    duration: '2 ans',
    degree: 'BTS',
    field: 'Informatique',
    link: 'https://estg-benin.com/nos-formations/',
    costMin: null,
    costMax: null,
    programs: ['Programmation', 'Développement web', 'Bases de données'],
    university: {
      acronym: 'ESTG',
      name: 'École Supérieure de Technologie et de Gestion',
    },
  },
  {
    title: 'DTS en Tourisme et Hôtellerie (TH)',
    description: 'Diplôme de Technicien Supérieur en tourisme, hôtellerie et restauration.',
    duration: '2 ans',
    degree: 'BTS',
    field: 'Tourisme',
    link: 'https://estg-benin.com/nos-formations/',
    costMin: null,
    costMax: null,
    programs: ['Tourisme', 'Hôtellerie', 'Restauration'],
    university: {
      acronym: 'ESTG',
      name: 'École Supérieure de Technologie et de Gestion',
    },
  },
  {
    title: 'Licence Professionnelle en Gestion des Ressources Humaines (GRH)',
    description: 'Formation professionnalisante en gestion stratégique des ressources humaines.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Management',
    link: 'https://estg-benin.com/nos-formations/',
    costMin: null,
    costMax: null,
    programs: ['GRH', 'Droit du travail', 'GPEC'],
    university: {
      acronym: 'ESTG',
      name: 'École Supérieure de Technologie et de Gestion',
    },
  },
  {
    title: 'Licence Professionnelle en Transport et Logistique (TL)',
    description: 'Formation professionnelle en gestion des transports et logistique.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Logistique',
    link: 'https://estg-benin.com/nos-formations/',
    costMin: null,
    costMax: null,
    programs: ['Transport', 'Logistique', 'Supply chain'],
    university: {
      acronym: 'ESTG',
      name: 'École Supérieure de Technologie et de Gestion',
    },
  },
  {
    title: 'Licence Professionnelle en Banques Finance et Assurance (BFA)',
    description: 'Formation professionnelle aux métiers de la banque, finance et assurance.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Finance',
    link: 'https://estg-benin.com/nos-formations/',
    costMin: null,
    costMax: null,
    programs: ['Banque', 'Finance', 'Assurance'],
    university: {
      acronym: 'ESTG',
      name: 'École Supérieure de Technologie et de Gestion',
    },
  },
  {
    title: 'Licence Professionnelle en Finance Comptabilité et Audit (FCA)',
    description: 'Formation professionnelle en comptabilité, contrôle de gestion et audit.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Finance',
    link: 'https://estg-benin.com/nos-formations/',
    costMin: null,
    costMax: null,
    programs: ['Comptabilité', 'Audit', 'Contrôle de gestion'],
    university: {
      acronym: 'ESTG',
      name: 'École Supérieure de Technologie et de Gestion',
    },
  },
  {
    title: 'Licence Professionnelle en Marketing Communication et Commerce (MCC)',
    description:
      'Formation professionnelle en stratégies marketing, communication digitale et commerce.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Marketing',
    link: 'https://estg-benin.com/nos-formations/',
    costMin: null,
    costMax: null,
    programs: ['Marketing', 'Communication', 'Commerce'],
    university: {
      acronym: 'ESTG',
      name: 'École Supérieure de Technologie et de Gestion',
    },
  },
  {
    title: 'Licence Professionnelle en Système Informatique et Logiciel (SIL)',
    description: 'Formation professionnelle en développement logiciel et systèmes informatiques.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Informatique',
    link: 'https://estg-benin.com/nos-formations/',
    costMin: null,
    costMax: null,
    programs: ['Programmation', 'Réseaux', 'Systèmes informatiques'],
    university: {
      acronym: 'ESTG',
      name: 'École Supérieure de Technologie et de Gestion',
    },
  },
  {
    title: 'Master Professionnel en Marketing Communication et Commerce (MCC)',
    description: 'Formation avancée en stratégies marketing, communication corporate et commerce.',
    duration: '2 ans',
    degree: 'Master',
    field: 'Marketing',
    link: 'https://estg-benin.com/nos-formations/',
    costMin: null,
    costMax: null,
    programs: ['Marketing stratégique', 'Communication', 'Commerce'],
    university: {
      acronym: 'ESTG',
      name: 'École Supérieure de Technologie et de Gestion',
    },
  },
  {
    title: 'Master Professionnel en Finance Comptabilité et Audit (FCA)',
    description: "Formation avancée en audit, contrôle de gestion et finance d'entreprise.",
    duration: '2 ans',
    degree: 'Master',
    field: 'Finance',
    link: 'https://estg-benin.com/nos-formations/',
    costMin: null,
    costMax: null,
    programs: ['Audit', 'Contrôle de gestion', 'Normes IFRS'],
    university: {
      acronym: 'ESTG',
      name: 'École Supérieure de Technologie et de Gestion',
    },
  },
  {
    title: 'Master Professionnel en Gestion des Ressources Humaines (GRH)',
    description: 'Formation avancée en gestion stratégique des ressources humaines et management.',
    duration: '2 ans',
    degree: 'Master',
    field: 'Management',
    link: 'https://estg-benin.com/nos-formations/',
    costMin: null,
    costMax: null,
    programs: ['GRH', 'Droit du travail', 'GPEC'],
    university: {
      acronym: 'ESTG',
      name: 'École Supérieure de Technologie et de Gestion',
    },
  },
  {
    title: 'Master Professionnel en Banque Finance et Assurance (BFA)',
    description: 'Formation avancée en gestion bancaire, marchés financiers et assurance.',
    duration: '2 ans',
    degree: 'Master',
    field: 'Finance',
    link: 'https://estg-benin.com/nos-formations/',
    costMin: null,
    costMax: null,
    programs: ['Banque', 'Finance', 'Assurance'],
    university: {
      acronym: 'ESTG',
      name: 'École Supérieure de Technologie et de Gestion',
    },
  },
  {
    title: 'Master Professionnel en Entrepreneuriat et Gestion des Projets (EGP)',
    description: 'Formation avancée en entrepreneuriat, gestion de projets et innovation.',
    duration: '2 ans',
    degree: 'Master',
    field: 'Management',
    link: 'https://estg-benin.com/nos-formations/',
    costMin: null,
    costMax: null,
    programs: ['Entrepreneuriat', 'Gestion de projets', 'Innovation'],
    university: {
      acronym: 'ESTG',
      name: 'École Supérieure de Technologie et de Gestion',
    },
  },
  {
    title: 'Licence en Droit Public',
    description:
      'Formation en droit public, couvrant les institutions politiques, le droit administratif et les libertés fondamentales.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Droit',
    link: 'https://www.fadesp.net/fr/organisation-des-formations/',
    costMin: null,
    costMax: null,
    programs: ['Droit administratif', 'Droit constitutionnel', 'Libertés publiques'],
    university: {
      acronym: 'FADESP',
      name: 'Faculté de Droit et de Science Politique',
    },
  },
  {
    title: 'Licence en Droit Privé',
    description:
      'Formation en droit privé, centrée sur le droit civil, le droit commercial et les obligations.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Droit',
    link: 'https://www.fadesp.net/fr/organisation-des-formations/',
    costMin: null,
    costMax: null,
    programs: ['Droit civil', 'Droit commercial', 'Droit des obligations'],
    university: {
      acronym: 'FADESP',
      name: 'Faculté de Droit et de Science Politique',
    },
  },
  {
    title: 'Licence en Science Politique',
    description:
      'Formation en science politique, abordant les théories politiques, les relations internationales et la sociologie politique.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Science Politique',
    link: 'https://www.fadesp.net/fr/organisation-des-formations/',
    costMin: null,
    costMax: null,
    programs: ['Théories politiques', 'Relations internationales', 'Sociologie politique'],
    university: {
      acronym: 'FADESP',
      name: 'Faculté de Droit et de Science Politique',
    },
  },
  {
    title: 'Licence Mention Gestion – Comptabilité, Audit et Contrôle de Gestion',
    description:
      "Formation en gestion axée sur la comptabilité, l'audit et le contrôle de gestion, préparant aux métiers de l'expertise comptable et du contrôle financier.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Comptabilité',
    link: 'https://faseg-uac.bj/',
    costMin: null,
    costMax: null,
    programs: ['Comptabilité', 'Audit', 'Contrôle de gestion'],
    university: {
      acronym: 'FASEG',
      name: 'Faculté des Sciences Économiques et de Gestion',
    },
  },
  {
    title: 'Licence Mention Gestion – Finance, Banque et Assurance',
    description:
      'Formation en finance, banque et assurance, couvrant les techniques bancaires, les marchés financiers et la gestion des risques.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Finance',
    link: 'https://faseg-uac.bj/',
    costMin: null,
    costMax: null,
    programs: ['Finance', 'Banque', 'Assurance'],
    university: {
      acronym: 'FASEG',
      name: 'Faculté des Sciences Économiques et de Gestion',
    },
  },
  {
    title: 'Licence Mention Gestion – Marketing et Stratégie',
    description:
      'Formation en marketing et stratégie, préparant aux métiers du marketing, de la communication commerciale et de la planification stratégique.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Marketing',
    link: 'https://faseg-uac.bj/',
    costMin: null,
    costMax: null,
    programs: ['Marketing', 'Stratégie', 'Communication'],
    university: {
      acronym: 'FASEG',
      name: 'Faculté des Sciences Économiques et de Gestion',
    },
  },
  {
    title: 'Licence Mention Gestion – Théorie des organisations et Gestion des Ressources Humaines',
    description:
      'Formation en gestion des ressources humaines et en théorie des organisations, axée sur le management du personnel et la gestion administrative.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Management',
    link: 'https://faseg-uac.bj/',
    costMin: null,
    costMax: null,
    programs: ['GRH', 'Théorie des organisations', 'Management'],
    university: {
      acronym: 'FASEG',
      name: 'Faculté des Sciences Économiques et de Gestion',
    },
  },
  {
    title: "Licence Mention Gestion – Gestion de production et Systèmes d'information",
    description:
      "Formation en gestion de production et systèmes d'information, centrée sur l'optimisation des processus industriels et la gestion des flux.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Gestion',
    link: 'https://faseg-uac.bj/',
    costMin: null,
    costMax: null,
    programs: ['Gestion de production', "Systèmes d'information", 'Logistique'],
    university: {
      acronym: 'FASEG',
      name: 'Faculté des Sciences Économiques et de Gestion',
    },
  },
  {
    title: 'Licence Mention Sciences économiques – Analyse et politiques de développement',
    description:
      "Formation en économie du développement, axée sur l'analyse des politiques de développement et la planification économique.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Économie',
    link: 'https://faseg-uac.bj/',
    costMin: null,
    costMax: null,
    programs: ['Analyse économique', 'Politiques de développement', 'Planification'],
    university: {
      acronym: 'FASEG',
      name: 'Faculté des Sciences Économiques et de Gestion',
    },
  },
  {
    title: 'Licence Mention Sciences économiques – Analyse des projets',
    description:
      "Formation en analyse et gestion de projets, couvrant l'évaluation, le suivi et le financement de projets de développement.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Économie',
    link: 'https://faseg-uac.bj/',
    costMin: null,
    costMax: null,
    programs: ['Gestion de projets', 'Évaluation', 'Suivi'],
    university: {
      acronym: 'FASEG',
      name: 'Faculté des Sciences Économiques et de Gestion',
    },
  },
  {
    title: 'Licence Mention Sciences économiques – Economie et gestion des structures sanitaires',
    description:
      "Formation en économie et gestion des structures sanitaires, axée sur l'administration des hôpitaux et des services de santé.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Économie',
    link: 'https://faseg-uac.bj/',
    costMin: null,
    costMax: null,
    programs: ['Gestion sanitaire', 'Économie de la santé', 'Administration hospitalière'],
    university: {
      acronym: 'FASEG',
      name: 'Faculté des Sciences Économiques et de Gestion',
    },
  },
  {
    title: 'Licence Mention Sciences économiques – Economie et gestion des exploitations agricoles',
    description:
      "Formation en économie et gestion des exploitations agricoles, préparant aux métiers de la gestion d'entreprises agricoles et du développement rural.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Économie',
    link: 'https://faseg-uac.bj/',
    costMin: null,
    costMax: null,
    programs: ['Gestion agricole', 'Économie rurale', 'Développement rural'],
    university: {
      acronym: 'FASEG',
      name: 'Faculté des Sciences Économiques et de Gestion',
    },
  },
  {
    title: 'Licence Mention Sciences économiques – Statistiques et économétrie',
    description:
      "Formation en statistiques et économétrie, axée sur l'analyse quantitative et la modélisation économique.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Statistique',
    link: 'https://faseg-uac.bj/',
    costMin: null,
    costMax: null,
    programs: ['Statistiques', 'Économétrie', 'Analyse de données'],
    university: {
      acronym: 'FASEG',
      name: 'Faculté des Sciences Économiques et de Gestion',
    },
  },
  {
    title: 'Licence Professionnelle en Économie et Finance des Collectivités Locales (EFCL)',
    description:
      'Formation professionnelle en économie et finance des collectivités locales, maîtrisant les mécanismes financiers locaux pour des solutions durables.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Finance',
    link: 'https://www.fasegup.com/cycle-de-licence/',
    costMin: null,
    costMax: null,
    programs: ['Finances locales', 'Droit administratif', 'Gestion budgétaire'],
    university: {
      acronym: 'FASEG-UP',
      name: "Faculté des Sciences Économiques et de Gestion de l'Université de Parakou",
    },
  },
  {
    title: 'Licence Professionnelle en Économie Agricole',
    description:
      'Formation professionnelle en économie agricole, plongeant dans les défis et opportunités économiques du secteur agricole.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Économie',
    link: 'https://www.fasegup.com/cycle-de-licence/',
    costMin: null,
    costMax: null,
    programs: ['Économie rurale', 'Gestion agricole', 'Développement rural'],
    university: {
      acronym: 'FASEG-UP',
      name: "Faculté des Sciences Économiques et de Gestion de l'Université de Parakou",
    },
  },
  {
    title: 'Licence Professionnelle en Analyse et Politiques Économiques (APE)',
    description:
      'Formation professionnelle en analyse et politiques économiques, développant une expertise analytique pour influencer les politiques économiques.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Économie',
    link: 'https://www.fasegup.com/cycle-de-licence/',
    costMin: null,
    costMax: null,
    programs: ['Analyse économique', 'Politiques économiques', 'Planification'],
    university: {
      acronym: 'FASEG-UP',
      name: "Faculté des Sciences Économiques et de Gestion de l'Université de Parakou",
    },
  },
  {
    title: 'Licence Professionnelle en Économie et Finance Internationale (EFI)',
    description:
      "Formation professionnelle en économie et finance internationale, explorant les rouages complexes de la finance à l'échelle mondiale.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Finance',
    link: 'https://www.fasegup.com/cycle-de-licence/',
    costMin: null,
    costMax: null,
    programs: ['Finance internationale', 'Commerce international', 'Macroéconomie'],
    university: {
      acronym: 'FASEG-UP',
      name: "Faculté des Sciences Économiques et de Gestion de l'Université de Parakou",
    },
  },
  {
    title: 'Licence en Sociologie',
    description:
      'Formation en sociologie générale et méthodologie des sciences sociales, avec des cours théoriques et pratiques.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Sciences Humaines',
    link: 'https://www.esseyi.com/organizations/fashs-uac',
    costMin: null,
    costMax: null,
    programs: ['Sociologie générale', "Méthodes d'enquête", 'Anthropologie'],
    university: {
      acronym: 'FASHS',
      name: 'Faculté des Sciences Humaines et Sociales',
    },
  },
  {
    title: 'Licence en Psychologie',
    description:
      'Formation en psychologie clinique et sociale, avec des applications dans le secteur de la santé mentale et des ressources humaines.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Psychologie',
    link: 'https://www.esseyi.com/organizations/fashs-uac',
    costMin: null,
    costMax: null,
    programs: ['Psychologie cognitive', 'Psychologie du développement', 'Psychologie sociale'],
    university: {
      acronym: 'FASHS',
      name: 'Faculté des Sciences Humaines et Sociales',
    },
  },
  {
    title: 'Licence en Histoire',
    description:
      'Formation en histoire, avec une spécialisation en histoire africaine, histoire contemporaine et méthodologie de la recherche historique.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Sciences Humaines',
    link: 'https://www.esseyi.com/organizations/fashs-uac',
    costMin: null,
    costMax: null,
    programs: ['Histoire africaine', 'Histoire contemporaine', 'Méthodologie historique'],
    university: {
      acronym: 'FASHS',
      name: 'Faculté des Sciences Humaines et Sociales',
    },
  },
  {
    title: 'Licence en Géographie',
    description:
      "Formation en géographie physique et humaine, avec des applications en aménagement du territoire et en gestion de l'environnement.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Sciences Humaines',
    link: 'https://www.esseyi.com/organizations/fashs-uac',
    costMin: null,
    costMax: null,
    programs: ['Géographie physique', 'Géographie humaine', 'Aménagement du territoire'],
    university: {
      acronym: 'FASHS',
      name: 'Faculté des Sciences Humaines et Sociales',
    },
  },
  {
    title: 'Licence ès Mathématiques',
    description:
      "Formation fondamentale en mathématiques pures et appliquées, préparant aux métiers de l'enseignement et de la recherche.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Mathématiques',
    link: 'https://www.oreilleducampus.org/universite-abomey-calavi/129-faculte-des-sciences-et-techniques-fast-uac-benin',
    costMin: null,
    costMax: null,
    programs: ['Algèbre', 'Analyse', 'Probabilités'],
    university: {
      acronym: 'FAST',
      name: 'Faculté des Sciences et Techniques',
    },
  },
  {
    title: 'Licence de Physique',
    description:
      "Formation en physique fondamentale et appliquée, couvrant la mécanique, l'électromagnétisme et la thermodynamique.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Physique',
    link: 'https://www.oreilleducampus.org/universite-abomey-calavi/129-faculte-des-sciences-et-techniques-fast-uac-benin',
    costMin: null,
    costMax: null,
    programs: ['Mécanique', 'Électromagnétisme', 'Thermodynamique'],
    university: {
      acronym: 'FAST',
      name: 'Faculté des Sciences et Techniques',
    },
  },
  {
    title: 'Licence de Chimie',
    description:
      'Formation en chimie générale, organique et minérale, avec des applications en industrie pharmaceutique et en recherche.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Chimie',
    link: 'https://www.oreilleducampus.org/universite-abomey-calavi/129-faculte-des-sciences-et-techniques-fast-uac-benin',
    costMin: null,
    costMax: null,
    programs: ['Chimie organique', 'Chimie minérale', 'Thermodynamique'],
    university: {
      acronym: 'FAST',
      name: 'Faculté des Sciences et Techniques',
    },
  },
  {
    title: 'Doctorat en Médecine',
    description:
      'Formation complète en médecine générale, durée de 7 ans après le baccalauréat, incluant des stages hospitaliers et des enseignements théoriques.',
    duration: '7 ans',
    degree: 'Doctorat',
    field: 'Médecine',
    link: 'https://www.fss-cotonou.com/formations/',
    costMin: null,
    costMax: null,
    programs: ['Anatomie', 'Physiologie', 'Pathologie', 'Stages hospitaliers'],
    university: {
      acronym: 'FSS',
      name: 'Faculté des Sciences de la Santé',
    },
  },
  {
    title: 'Doctorat en Pharmacie',
    description:
      'Formation en sciences pharmaceutiques, durée de 6 ans après le baccalauréat, alliant enseignements théoriques en sciences pharmaceutiques et biologiques à des stages en officine.',
    duration: '6 ans',
    degree: 'Doctorat',
    field: 'Pharmacie',
    link: 'https://www.fss-cotonou.com/formations/',
    costMin: null,
    costMax: null,
    programs: ['Chimie pharmaceutique', 'Pharmacologie', 'Stage officinal'],
    university: {
      acronym: 'FSS',
      name: 'Faculté des Sciences de la Santé',
    },
  },
  {
    title: 'Licence professionnelle en Journalisme',
    description:
      'Formation aux techniques du journalisme écrit et audiovisuel, préparant aux métiers de la presse, de la radio et de la télévision.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Journalisme',
    link: 'https://www.hecm-afrique.net/',
    costMin: null,
    costMax: null,
    programs: ['Presse écrite', 'Radio', 'Télévision'],
    university: {
      acronym: 'HECM',
      name: 'Haute École de Commerce et de Management',
    },
  },
  {
    title: 'Licence professionnelle en Génie Informatique',
    description:
      "Formation en ingénierie informatique, couvrant la programmation, les réseaux et la sécurité des systèmes d'information.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Informatique',
    link: 'https://www.hecm-afrique.net/',
    costMin: null,
    costMax: null,
    programs: ['Programmation', 'Réseaux', 'Sécurité'],
    university: {
      acronym: 'HECM',
      name: 'Haute École de Commerce et de Management',
    },
  },
  {
    title: 'Design Graphique',
    description:
      'Formation pratique aux logiciels de création graphique et à la communication visuelle.',
    duration: '2 ans',
    degree: 'BTS',
    field: 'Design',
    link: 'https://imalearning.com/',
    costMin: null,
    costMax: null,
    programs: ['Photoshop', 'Illustrator', 'InDesign'],
    university: {
      acronym: 'IMA',
      name: 'Institut de Multimédia Appliqué',
    },
  },
  {
    title: 'Développement Web',
    description:
      'Formation pratique aux langages de programmation web (HTML, CSS, PHP, Java) pour la création de sites et applications web.',
    duration: '2 ans',
    degree: 'BTS',
    field: 'Informatique',
    link: 'https://imalearning.com/',
    costMin: null,
    costMax: null,
    programs: ['HTML', 'CSS', 'PHP', 'Java'],
    university: {
      acronym: 'IMA',
      name: 'Institut de Multimédia Appliqué',
    },
  },
  {
    title: 'Licence en Sciences Infirmières',
    description:
      "Formation menant au diplôme d'infirmier d'État, niveau Bac+3, préparant aux soins infirmiers et à la gestion des soins.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Santé',
    link: 'https://inmes.uac.bj/',
    costMin: null,
    costMax: null,
    programs: ['Soins infirmiers', 'Anatomie', 'Stage clinique'],
    university: {
      acronym: 'INMES',
      name: 'Institut National Médico-Sanitaire',
    },
  },
  {
    title: 'Licence en Maïeutique (Sage-Femme)',
    description:
      "Formation menant au diplôme de sage-femme d'État, niveau Bac+3, spécialisée en obstétrique et néonatalogie.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Santé',
    link: 'https://inmes.uac.bj/',
    costMin: null,
    costMax: null,
    programs: ['Obstétrique', 'Néonatalogie', 'Stage clinique'],
    university: {
      acronym: 'INMES',
      name: 'Institut National Médico-Sanitaire',
    },
  },
  {
    title:
      "Licence professionnelle en Génie des Technologies de l'Information et de la Communication",
    description:
      'Formation en informatique, réseaux et télécommunications, préparant aux métiers du numérique et des télécommunications.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Informatique',
    link: 'https://irgibafrica.university/',
    costMin: null,
    costMax: null,
    programs: ['Réseaux', 'Télécommunications', 'Programmation'],
    university: {
      acronym: 'IRGIB-Africa',
      name: 'IRGIB Africa University',
    },
  },
  {
    title: 'Licence professionnelle en Administration des Affaires',
    description:
      'Formation en gestion des affaires, couvrant le management, le marketing, la finance et les ressources humaines.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Management',
    link: 'https://irgibafrica.university/',
    costMin: null,
    costMax: null,
    programs: ['Management', 'Marketing', 'Finance', 'GRH'],
    university: {
      acronym: 'IRGIB-Africa',
      name: 'IRGIB Africa University',
    },
  },
  {
    title: 'Licence professionnelle en Génie des Procédés de Productions Industrielles',
    description:
      'Formation en ingénierie des procédés de production industrielle, axée sur la transformation des matières premières et la gestion de la production.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Ingénierie',
    link: 'https://irgibafrica.university/',
    costMin: null,
    costMax: null,
    programs: ['Gestion de production', 'Qualité', 'Maintenance'],
    university: {
      acronym: 'IRGIB-Africa',
      name: 'IRGIB Africa University',
    },
  },
  {
    title: 'Licence professionnelle en Réalisation Cinéma et Télévision',
    description:
      "Formation aux techniques de réalisation audiovisuelle, couvrant la mise en scène, la direction d'acteurs et la postproduction.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Audiovisuel',
    link: 'https://isma-benin.org/index.php/formations/',
    costMin: null,
    costMax: null,
    programs: ['Réalisation', 'Scénario', 'Montage', 'Postproduction'],
    university: {
      acronym: 'ISMA',
      name: "Institut Supérieur des Métiers de l'Audiovisuel",
    },
  },
  {
    title: 'Licence professionnelle en Journalisme Audiovisuel',
    description:
      'Formation aux techniques du journalisme télévisé et radiophonique, préparant aux métiers de reporter et présentateur.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Journalisme',
    link: 'https://isma-benin.org/index.php/formations/',
    costMin: null,
    costMax: null,
    programs: ['Journalisme audiovisuel', 'Reportage', 'Montage', 'Éthique'],
    university: {
      acronym: 'ISMA',
      name: "Institut Supérieur des Métiers de l'Audiovisuel",
    },
  },
  {
    title: "Licence professionnelle en Métiers de l'Image",
    description:
      'Formation aux techniques de prise de vue, cadrage et éclairage pour le cinéma et la télévision.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Audiovisuel',
    link: 'https://isma-benin.org/index.php/formations/',
    costMin: null,
    costMax: null,
    programs: ['Cadrage', 'Éclairage', 'Composition'],
    university: {
      acronym: 'ISMA',
      name: "Institut Supérieur des Métiers de l'Audiovisuel",
    },
  },
  {
    title: 'Licence professionnelle en Métiers du Son',
    description:
      "Formation aux techniques de prise de son, mixage et sound design pour l'audiovisuel.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Audiovisuel',
    link: 'https://isma-benin.org/index.php/formations/',
    costMin: null,
    costMax: null,
    programs: ['Prise de son', 'Mixage', 'Sound design'],
    university: {
      acronym: 'ISMA',
      name: "Institut Supérieur des Métiers de l'Audiovisuel",
    },
  },
  {
    title: 'Licence professionnelle en Montage et Postproduction',
    description:
      'Formation spécialisée en montage vidéo, effets spéciaux et postproduction audiovisuelle.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Audiovisuel',
    link: 'https://isma-benin.org/index.php/formations/',
    costMin: null,
    costMax: null,
    programs: ['Montage', 'Effets spéciaux', 'Étalonnage'],
    university: {
      acronym: 'ISMA',
      name: "Institut Supérieur des Métiers de l'Audiovisuel",
    },
  },
  {
    title: 'Licence professionnelle en Gestion de la Production Audiovisuelle',
    description:
      "Formation en gestion de production pour le cinéma et la télévision, couvrant le budget, la logistique et le management d'équipe.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Audiovisuel',
    link: 'https://isma-benin.org/index.php/formations/',
    costMin: null,
    costMax: null,
    programs: ['Gestion de production', 'Budget', 'Logistique'],
    university: {
      acronym: 'ISMA',
      name: "Institut Supérieur des Métiers de l'Audiovisuel",
    },
  },
  {
    title: 'Master en Réalisation Cinéma et Télévision',
    description:
      "Formation avancée en réalisation audiovisuelle, approfondissant les techniques de mise en scène, direction d'acteurs et gestion de projet.",
    duration: '2 ans',
    degree: 'Master',
    field: 'Audiovisuel',
    link: 'https://isma-benin.org/index.php/formations/',
    costMin: null,
    costMax: null,
    programs: ['Réalisation', 'Scénario', 'Production', "Direction d'acteurs"],
    university: {
      acronym: 'ISMA',
      name: "Institut Supérieur des Métiers de l'Audiovisuel",
    },
  },
  {
    title: "Licence professionnelle en Communication d'Entreprise",
    description: 'Formation en communication corporate, relations publiques et événementiel.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Communication',
    link: 'https://ismtstsalomon.com/',
    costMin: null,
    costMax: null,
    programs: ['Communication digitale', 'Relations presse', 'Événementiel'],
    university: {
      acronym: 'ISMT',
      name: 'Institut Supérieur de Management et de Technologies Saint Salomon',
    },
  },
  {
    title: 'Licence professionnelle en Comptabilité Gestion',
    description: 'Formation en comptabilité, gestion financière et contrôle de gestion.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Comptabilité',
    link: 'https://ismtstsalomon.com/',
    costMin: null,
    costMax: null,
    programs: ['Comptabilité', 'Gestion', 'Contrôle de gestion'],
    university: {
      acronym: 'ISMT',
      name: 'Institut Supérieur de Management et de Technologies Saint Salomon',
    },
  },
  {
    title: 'Licence professionnelle en Gestion des Ressources Humaines',
    description: 'Formation en gestion du personnel, recrutement et droit social.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Management',
    link: 'https://ismtstsalomon.com/',
    costMin: null,
    costMax: null,
    programs: ['GRH', 'Droit du travail', 'Recrutement'],
    university: {
      acronym: 'ISMT',
      name: 'Institut Supérieur de Management et de Technologies Saint Salomon',
    },
  },
  {
    title: "Master en Communication d'Entreprise",
    description:
      'Formation avancée en stratégies de communication corporate et relations publiques.',
    duration: '2 ans',
    degree: 'Master',
    field: 'Communication',
    link: 'https://ismtstsalomon.com/',
    costMin: null,
    costMax: null,
    programs: ['Stratégie de communication', 'Communication de crise', 'Brand management'],
    university: {
      acronym: 'ISMT',
      name: 'Institut Supérieur de Management et de Technologies Saint Salomon',
    },
  },
  {
    title: 'Licence professionnelle en Journalisme',
    description:
      'Formation aux techniques du journalisme, couvrant la presse écrite, radio, télévision et web journalisme.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Journalisme',
    link: 'https://issicuniversity.edu.bj/',
    costMin: null,
    costMax: null,
    programs: ['Journalisme', 'Presse écrite', 'Radio', 'Télévision'],
    university: {
      acronym: 'ISSIC',
      name: "Institut Supérieur des Sciences de l'Information et de la Communication",
    },
  },
  {
    title: 'Licence professionnelle en Communication',
    description:
      "Formation en communication d'entreprise, relations publiques et communication digitale.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Communication',
    link: 'https://issicuniversity.edu.bj/',
    costMin: null,
    costMax: null,
    programs: ['Communication', 'Relations publiques', 'Communication digitale'],
    university: {
      acronym: 'ISSIC',
      name: "Institut Supérieur des Sciences de l'Information et de la Communication",
    },
  },
  {
    title: 'Master en Journalisme',
    description:
      "Formation avancée en journalisme d'investigation, journalisme multimédia et gestion de rédaction.",
    duration: '2 ans',
    degree: 'Master',
    field: 'Journalisme',
    link: 'https://issicuniversity.edu.bj/',
    costMin: null,
    costMax: null,
    programs: ["Journalisme d'investigation", 'Web journalisme', 'Déontologie'],
    university: {
      acronym: 'ISSIC',
      name: "Institut Supérieur des Sciences de l'Information et de la Communication",
    },
  },
  {
    title: 'Licence professionnelle en Marketing et Action Commerciale',
    description:
      'Formation en techniques de vente, marketing et commerce, préparant aux métiers de la force de vente et du marketing opérationnel.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Marketing',
    link: 'https://lescoursonou-universite.org/',
    costMin: null,
    costMax: null,
    programs: ['Marketing', 'Action commerciale', 'Commerce'],
    university: {
      acronym: 'LCS',
      name: 'Institut Universitaire Les Cours Sonou',
    },
  },
  {
    title: "Licence professionnelle en Comptabilité et Finance d'Entreprise",
    description: "Formation en comptabilité générale, finance d'entreprise et gestion financière.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Finance',
    link: 'https://lescoursonou-universite.org/',
    costMin: null,
    costMax: null,
    programs: ['Comptabilité', 'Finance', 'Gestion'],
    university: {
      acronym: 'LCS',
      name: 'Institut Universitaire Les Cours Sonou',
    },
  },
  {
    title: "Licence professionnelle en Banque et Finance d'Entreprise",
    description:
      "Formation aux métiers de la banque, de la finance d'entreprise et des marchés financiers.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Finance',
    link: 'https://lescoursonou-universite.org/',
    costMin: null,
    costMax: null,
    programs: ['Banque', 'Finance', 'Marchés financiers'],
    university: {
      acronym: 'LCS',
      name: 'Institut Universitaire Les Cours Sonou',
    },
  },
  {
    title: 'Licence professionnelle en Science Politique et Relation Internationale',
    description: 'Formation en science politique, relations internationales et diplomatie.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Science Politique',
    link: 'https://lescoursonou-universite.org/',
    costMin: null,
    costMax: null,
    programs: ['Science politique', 'Relations internationales', 'Diplomatie'],
    university: {
      acronym: 'LCS',
      name: 'Institut Universitaire Les Cours Sonou',
    },
  },
  {
    title: 'Master en Marketing et Communication',
    description: "Formation avancée en stratégies marketing et communication d'entreprise.",
    duration: '2 ans',
    degree: 'Master',
    field: 'Marketing',
    link: 'https://lescoursonou-universite.org/',
    costMin: null,
    costMax: null,
    programs: ['Marketing stratégique', 'Communication', 'Commerce'],
    university: {
      acronym: 'LCS',
      name: 'Institut Universitaire Les Cours Sonou',
    },
  },
  {
    title: 'Licence professionnelle en Audit et Contrôle de Gestion',
    description:
      "Formation aux métiers de l'audit interne, contrôle de gestion et gestion financière.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Finance',
    link: 'https://pigier-benin.com/formations/',
    costMin: null,
    costMax: null,
    programs: ['Audit', 'Contrôle de gestion', 'Comptabilité'],
    university: {
      acronym: 'PIGIER',
      name: 'Pigier Bénin',
    },
  },
  {
    title: "Licence professionnelle en Banque et Finance d'Entreprise",
    description: "Formation en techniques bancaires, finance d'entreprise et marchés financiers.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Finance',
    link: 'https://pigier-benin.com/formations/',
    costMin: null,
    costMax: null,
    programs: ['Banque', 'Finance', 'Marchés financiers'],
    university: {
      acronym: 'PIGIER',
      name: 'Pigier Bénin',
    },
  },
  {
    title: 'Master en Audit et Contrôle de Gestion',
    description: 'Formation avancée en audit, contrôle de gestion et gestion financière.',
    duration: '2 ans',
    degree: 'Master',
    field: 'Finance',
    link: 'https://pigier-benin.com/formations/',
    costMin: null,
    costMax: null,
    programs: ['Audit', 'Contrôle de gestion', 'Normes IFRS'],
    university: {
      acronym: 'PIGIER',
      name: 'Pigier Bénin',
    },
  },
  {
    title: 'Master en Communication et Marketing',
    description: 'Formation avancée en stratégies marketing et communication corporate.',
    duration: '2 ans',
    degree: 'Master',
    field: 'Marketing',
    link: 'https://pigier-benin.com/formations/',
    costMin: null,
    costMax: null,
    programs: ['Marketing', 'Communication', 'Stratégie'],
    university: {
      acronym: 'PIGIER',
      name: 'Pigier Bénin',
    },
  },
  {
    title: 'Licence professionnelle en Philosophie',
    description: 'Formation en philosophie générale, éthique et métaphysique.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Philosophie',
    link: 'https://legrandfrere.africa/etablissement/institut-jean-paul-ii/',
    costMin: null,
    costMax: null,
    programs: ['Histoire de la philosophie', 'Éthique', 'Métaphysique'],
    university: {
      acronym: 'Saint-Jean-Paul',
      name: 'Institut Jean Paul II de Philosophie et de Sciences Humaines',
    },
  },
  {
    title: "Licence professionnelle en Psychologie et Sciences de l'Education",
    description:
      "Formation en psychologie générale, psychologie du développement et sciences de l'éducation.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Psychologie',
    link: 'https://legrandfrere.africa/etablissement/institut-jean-paul-ii/',
    costMin: null,
    costMax: null,
    programs: ['Psychologie cognitive', 'Psychologie du développement', 'Pédagogie'],
    university: {
      acronym: 'Saint-Jean-Paul',
      name: 'Institut Jean Paul II de Philosophie et de Sciences Humaines',
    },
  },
  {
    title: 'Licence professionnelle en Sciences du Mariage et de la Famille',
    description:
      'Formation en sciences humaines appliquées à la famille, au mariage et aux relations familiales.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Sciences Humaines',
    link: 'https://legrandfrere.africa/etablissement/institut-jean-paul-ii/',
    costMin: null,
    costMax: null,
    programs: ['Sciences de la famille', 'Psychologie', 'Sociologie'],
    university: {
      acronym: 'Saint-Jean-Paul',
      name: 'Institut Jean Paul II de Philosophie et de Sciences Humaines',
    },
  },
  {
    title: 'Bachelor en Digitalisation & Sciences des Données',
    description:
      "Formation en transformation digitale et analyse de données, niveau Bac+4, reconnue par l'État béninois.",
    duration: '4 ans',
    degree: 'Bachelor',
    field: 'Informatique',
    link: 'https://semecity.bj/programmes/bachelor-en-digitalisation-sciences-des-donnees/',
    costMin: null,
    costMax: null,
    programs: ['Data Science', 'IA', 'Digitalisation'],
    university: {
      acronym: 'Sèmè One',
      name: 'Sèmè One (Sèmè City)',
    },
  },
  {
    title: 'Licence en Design',
    description:
      "Formation en design produit, graphique et numérique, en partenariat avec l'École de Design Nantes Atlantique.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Design',
    link: 'https://semecity.bj/programmes/licence-en-design/',
    costMin: null,
    costMax: null,
    programs: ['Design thinking', 'CAO', 'Prototypage'],
    university: {
      acronym: 'Sèmè One',
      name: 'Sèmè One (Sèmè City)',
    },
  },
  {
    title: 'Licence en Informatique de Gestion',
    description: "Formation en systèmes d'information, gestion informatique et programmation.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Informatique',
    link: 'https://uatm-gasa.com/',
    costMin: null,
    costMax: null,
    programs: ['Programmation', 'Réseaux', 'Bases de données'],
    university: {
      acronym: 'UATM(Gasa)',
      name: 'Université Africaine de Technologie et de Management',
    },
  },
  {
    title: 'Master en Réseaux Informatique et Télécommunications',
    description:
      'Formation avancée en réseaux informatiques, télécommunications et sécurité des systèmes.',
    duration: '2 ans',
    degree: 'Master',
    field: 'Informatique',
    link: 'https://uatm-gasa.com/',
    costMin: null,
    costMax: null,
    programs: ['Réseaux', 'Télécommunications', 'Sécurité'],
    university: {
      acronym: 'UATM(Gasa)',
      name: 'Université Africaine de Technologie et de Management',
    },
  },
  {
    title: 'Licence en Sciences de Gestion',
    description: 'Formation en gestion des organisations, management et comptabilité.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Management',
    link: 'https://www.ucaobenin.org/',
    costMin: null,
    costMax: null,
    programs: ['Management', 'Comptabilité', 'Marketing'],
    university: {
      acronym: 'UCAO-UCC',
      name: "Université Catholique de l'Afrique de l'Ouest - Unité Universitaire de Cotonou",
    },
  },
  {
    title: "Master en Droit de l'Homme et Action Humanitaire",
    description: 'Formation avancée en droits humains et action humanitaire.',
    duration: '2 ans',
    degree: 'Master',
    field: 'Droit',
    link: 'https://www.ucaobenin.org/',
    costMin: null,
    costMax: null,
    programs: ['Droit international humanitaire', 'Protection des droits', 'Gestion de projets'],
    university: {
      acronym: 'UCAO-UCC',
      name: "Université Catholique de l'Afrique de l'Ouest - Unité Universitaire de Cotonou",
    },
  },
  {
    title: 'Licence Professionnelle en Aquaculture',
    description:
      "Formation aux techniques d'élevage aquacole et de gestion des ressources halieutiques.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Agriculture',
    link: 'https://una.bj/',
    costMin: null,
    costMax: null,
    programs: ['Aquaculture', 'Gestion des pêches', 'Biologie marine'],
    university: {
      acronym: 'UNA',
      name: "Université Nationale d'Agriculture",
    },
  },
  {
    title: 'Master Professionnel en Aquaculture et Management des Ressources Halieutiques',
    description: 'Formation avancée en aquaculture et gestion durable des ressources halieutiques.',
    duration: '2 ans',
    degree: 'Master',
    field: 'Agriculture',
    link: 'https://una.bj/',
    costMin: null,
    costMax: null,
    programs: ['Aquaculture', 'Management des ressources', 'Développement durable'],
    university: {
      acronym: 'UNA',
      name: "Université Nationale d'Agriculture",
    },
  },
  {
    title: 'Licence Professionnelle en Horticulture et Aménagement des Espaces Verts',
    description: 'Formation en horticulture, aménagement paysager et gestion des espaces verts.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Agriculture',
    link: 'https://una.bj/',
    costMin: null,
    costMax: null,
    programs: ['Horticulture', 'Aménagement paysager', 'Espaces verts'],
    university: {
      acronym: 'UNA',
      name: "Université Nationale d'Agriculture",
    },
  },
  {
    title: 'Licence Professionnelle en Biotechnologies Végétales et Amélioration des Plantes',
    description:
      'Formation en biotechnologies appliquées aux plantes, amélioration variétale et cultures durables.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Agriculture',
    link: 'https://una.bj/',
    costMin: null,
    costMax: null,
    programs: ['Biotechnologies végétales', 'Amélioration des plantes', 'Cultures'],
    university: {
      acronym: 'UNA',
      name: "Université Nationale d'Agriculture",
    },
  },
  {
    title: 'Master Professionnel en Foresterie Tropicale',
    description: 'Formation avancée en gestion des forêts tropicales et aménagement durable.',
    duration: '2 ans',
    degree: 'Master',
    field: 'Foresterie',
    link: 'https://una.bj/',
    costMin: null,
    costMax: null,
    programs: ['Sylviculture', 'Aménagement forestier', 'Écologie'],
    university: {
      acronym: 'UNA',
      name: "Université Nationale d'Agriculture",
    },
  },
  {
    title: "Licence en Sciences de l'Ingénieur",
    description:
      "Formation généraliste en sciences pour l'ingénieur, couvrant les mathématiques, la physique et l'informatique.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Ingénierie',
    link: 'https://www.unstim.bj/',
    costMin: null,
    costMax: null,
    programs: ['Mathématiques', 'Physique', 'Informatique'],
    university: {
      acronym: 'UNSTIM',
      name: 'Université Nationale des Sciences, Technologies, Ingénierie et Mathématiques',
    },
  },
  {
    title: "Diplôme d'Ingénieur d'État en Génie Civil",
    description:
      "Formation d'ingénieur en génie civil, spécialisée en bâtiments et travaux publics.",
    duration: '5 ans',
    degree: 'Ingénieur',
    field: 'Génie Civil',
    link: 'https://www.unstim.bj/',
    costMin: null,
    costMax: null,
    programs: ['Génie civil', 'BTP', 'Résistance des matériaux'],
    university: {
      acronym: 'UNSTIM',
      name: 'Université Nationale des Sciences, Technologies, Ingénierie et Mathématiques',
    },
  },
  {
    title: 'Licence professionnelle en Marketing et Communication',
    description: "Formation en stratégies marketing et communication d'entreprise.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Marketing',
    link: 'https://www.upaopnbenin-edu.org/',
    costMin: null,
    costMax: null,
    programs: ['Marketing digital', 'Communication', 'Publicité'],
    university: {
      acronym: 'UPAO',
      name: "Université Protestante de l'Afrique de l'Ouest",
    },
  },
  {
    title: 'Licence professionnelle en Banque, Finance et Assurance',
    description: "Formation aux métiers de la banque, de la finance et de l'assurance.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Finance',
    link: 'https://www.upaopnbenin-edu.org/',
    costMin: null,
    costMax: null,
    programs: ['Banque', 'Finance', 'Assurance'],
    university: {
      acronym: 'UPAO',
      name: "Université Protestante de l'Afrique de l'Ouest",
    },
  },
  {
    title: 'Master en Banque, Finance et Assurance',
    description: 'Formation avancée en gestion bancaire et financière.',
    duration: '2 ans',
    degree: 'Master',
    field: 'Finance',
    link: 'https://www.upaopnbenin-edu.org/',
    costMin: null,
    costMax: null,
    programs: ['Gestion bancaire', 'Finance de marché', 'Assurance'],
    university: {
      acronym: 'UPAO',
      name: "Université Protestante de l'Afrique de l'Ouest",
    },
  },
  {
    title: 'Licence professionnelle en Génie Civil (BTP)',
    description:
      "Formation aux métiers du bâtiment et des travaux publics, avec des débouchés en tant que chef chantier, technicien d'études ou assistant maître d'œuvre.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Génie Civil',
    link: 'https://esgcvak.com/cycleformation',
    costMin: null,
    costMax: null,
    programs: ['Résistance des matériaux', 'Topographie', 'Conduite de travaux'],
    university: {
      acronym: 'VAK',
      name: 'École Supérieure de Génie Civil Verechaguine A.K.',
    },
  },
  {
    title: 'Master Professionnel en Génie Civil',
    description:
      "Formation avancée d'ingénieur de conception en génie civil, accessible aux titulaires d'une Licence Professionnelle en Génie Civil avec mention Assez-Bien.",
    duration: '2 ans',
    degree: 'Master',
    field: 'Génie Civil',
    link: 'https://esgcvak.com/cycleformation',
    costMin: null,
    costMax: null,
    programs: ['Calcul de structures', 'Béton armé', 'Management de projet'],
    university: {
      acronym: 'VAK',
      name: 'École Supérieure de Génie Civil Verechaguine A.K.',
    },
  },
  {
    title: "Diplôme d'Ingénieur de Conception des Télécommunications",
    description: "Formation d'ingénieur en télécommunications et TIC, reconnue par le CAMES.",
    duration: '5 ans',
    degree: 'Ingénieur',
    field: 'Télécommunications',
    link: 'https://www.esmt.sn/',
    costMin: null,
    costMax: null,
    programs: ['Réseaux', 'Télécommunications', 'Informatique'],
    university: {
      acronym: 'ESMT',
      name: 'École Supérieure Multinationale des Télécommunications',
    },
  },
  {
    title: 'Licence en Télécommunications et Informatique',
    description:
      'Formation en télécommunications et informatique, couvrant les réseaux, la programmation et les systèmes télécoms.',
    duration: '3 ans',
    degree: 'Licence',
    field: 'Télécommunications',
    link: 'https://www.esmt.sn/',
    costMin: null,
    costMax: null,
    programs: ['Télécommunications', 'Informatique', 'Réseaux'],
    university: {
      acronym: 'ESMT',
      name: 'École Supérieure Multinationale des Télécommunications',
    },
  },
  {
    title: 'Licence en Banque Finance et Assurance',
    description: "Formation aux métiers de la banque, de la finance et de l'assurance.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Finance',
    link: 'https://esgtbenin.com/',
    costMin: null,
    costMax: null,
    programs: ['Banque', 'Finance', 'Assurance'],
    university: {
      acronym: 'ESGT',
      name: 'École Supérieure de Gestion et de Technologie',
    },
  },
  {
    title: 'Licence en Informatique de Gestion',
    description: "Formation en systèmes d'information, programmation et gestion informatique.",
    duration: '3 ans',
    degree: 'Licence',
    field: 'Informatique',
    link: 'https://esgtbenin.com/',
    costMin: null,
    costMax: null,
    programs: ['Programmation', 'Réseaux', 'Bases de données'],
    university: {
      acronym: 'ESGT',
      name: 'École Supérieure de Gestion et de Technologie',
    },
  },
  {
    title: 'Master en Management des Ressources Humaines',
    description: 'Formation avancée en gestion stratégique des ressources humaines et management.',
    duration: '2 ans',
    degree: 'Master',
    field: 'Management',
    link: 'https://esgtbenin.com/',
    costMin: null,
    costMax: null,
    programs: ['GRH', 'Droit du travail', 'GPEC'],
    university: {
      acronym: 'ESGT',
      name: 'École Supérieure de Gestion et de Technologie',
    },
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
// HELPERS
// ============================================================

async function upsertUniversities(prisma: PrismaService) {
  for (const inst of universities) {
    const existing = await prisma.university.findFirst({ where: { name: inst.name } });

    if (existing) {
      await prisma.university.update({
        where: { id: existing.id },
        data: { ...inst, website: inst.website ?? existing.website, isActive: true },
      });
    } else {
      await prisma.university.create({
        data: { ...inst, website: inst.website, isActive: true },
      });
    }
  }
  console.log(`✓ ${universities.length} institutions upserted`);
}

async function upsertFormations(prisma: PrismaService) {
  for (const form of formations) {
    // Correction 1 : extraire proprement l'université et les autres champs
    const { university, ...formData } = form;

    // Correction 2 : rechercher l'existant avec le titre et la relation université
    const existing = await prisma.formation.findFirst({
      where: {
        title: formData.title,
        university: {
          name: university.name,
          acronym: university.acronym,
        },
      },
    });

    // Correction 3 : un seul bloc if/else, pas de duplication
    if (existing) {
      await prisma.formation.update({
        where: { id: existing.id },
        data: { ...formData, isActive: true },
      });
    } else {
      await prisma.formation.create({
        data: {
          ...formData,
          isActive: true,
          university: {
            connect: { acronym: university.acronym },
          },
        },
      });
    }
  }
  console.log(`✓ ${formations.length} formations upserted`);
}

async function upsertResources(prisma: PrismaService) {
  for (const res of resources) {
    const existing = await prisma.resource.findFirst({ where: { title: res.title } });
    const publishedAt = res.isPublished ? new Date() : null;

    if (existing) {
      await prisma.resource.update({
        where: { id: existing.id },
        data: { ...res, publishedAt },
      });
    } else {
      await prisma.resource.create({ data: { ...res, publishedAt } });
    }
  }
  console.log(`✓ ${resources.length} resources upserted`);
}

// ============================================================
// MAIN SEEDER
// ============================================================

export async function seedSampleAssessmentData(prisma: PrismaService) {
  console.log('\n🌱 Seeding sample data...\n');

  await upsertUniversities(prisma);
  await upsertFormations(prisma);
  await upsertResources(prisma);

  // User & Session
  const user = await prisma.user.upsert({
    where: { email: 'senadalmeidapro@gmail.com' },
    update: { status: 'ACTIVE' },
    create: {
      email: 'senadalmeidapro@gmail.com',
      firstName: 'Sena Gedeon',
      lastName: "D'almeida",
      displayName: "Sena Gedeon D'almeida",
      password: await passwd.hashPassword('senadegno'),
      role: 'USER',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });

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
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      totalXp: 150,
      level: 2,
    },
  });
  console.log(`✓ User & session ready (${user.email})`);

  // Test version
  const testVersion = await prisma.testVersion.findUnique({ where: { code: 'v1' } });
  if (!testVersion) {
    console.warn('⚠️  Test version "v1" not found — skipping assessment seeding.');
    return;
  }

  // Assessment
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
      startedAt: new Date(Date.now() - 15 * 60 * 1000),
      completedAt: new Date(),
      adaptiveState: {
        probabilities: { R: 0.15, I: 0.25, A: 0.2, S: 0.15, E: 0.1, C: 0.15 },
        askedQuestions: [],
      },
    },
  });
  console.log(`✓ Assessment ready (${assessment.id})`);

  // Phase 1 responses
  const phase1Questions = await prisma.phase1Question.findMany({
    where: { testVersionId: testVersion.id },
    take: 12,
  });

  for (let i = 0; i < phase1Questions.length; i++) {
    const question = phase1Questions[i];
    if (!question) continue;

    await prisma.phase1Response.upsert({
      where: {
        assessmentId_questionId: { assessmentId: assessment.id, questionId: question.id },
      },
      update: { responseValue: i % 2 },
      create: {
        id: `phase1_resp_sample_${i}`,
        assessmentId: assessment.id,
        questionId: question.id,
        responseValue: i % 2,
        responseTimeMs: 3000 + i * 500,
        timeTakenMs: 3000 + i * 500,
        changeCount: i % 3,
        metadata: { hesitation: i % 4 === 0 },
      },
    });
  }
  console.log(`✓ ${phase1Questions.length} Phase 1 responses created`);

  // Behavioral indicators
  const phase1Responses = await prisma.phase1Response.findMany({
    where: { assessmentId: assessment.id },
    take: 4,
  });

  for (let i = 0; i < phase1Responses.length; i++) {
    const response = phase1Responses[i];
    if (!response) continue;

    await prisma.behavioralIndicator.upsert({
      where: { id: `behavior_sample_${i}` },
      update: {},
      create: {
        id: `behavior_sample_${i}`,
        assessmentId: assessment.id,
        responseId: response.id,
        indicatorType: i % 3 === 0 ? 'hesitation' : i % 3 === 1 ? 'change' : 'consistent',
        timeTakenMs: 3000 + i * 500,
        changeCount: i % 2,
        metadata: { pattern: 'normal' },
      },
    });
  }
  console.log(`✓ ${phase1Responses.length} behavioral indicators created`);

  // Phase 2 — Occupations
  const phase2Occupations = await prisma.phase2Question.findMany({
    where: { testVersionId: testVersion.id, phase2Type: Phase2Type.OCCUPATIONS },
    take: 6,
  });

  for (let i = 0; i < phase2Occupations.length; i++) {
    const question = phase2Occupations[i];
    if (!question) continue;

    await prisma.phase2Response.upsert({
      where: {
        assessmentId_questionId: { assessmentId: assessment.id, questionId: question.id },
      },
      update: { responseValue: i % 2 },
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
  console.log(`✓ ${phase2Occupations.length} Phase 2 Occupations responses created`);

  // Phase 2 — Aptitudes
  const phase2Aptitudes = await prisma.phase2Question.findMany({
    where: { testVersionId: testVersion.id, phase2Type: Phase2Type.APTITUDES },
    take: 6,
  });

  for (let i = 0; i < phase2Aptitudes.length; i++) {
    const question = phase2Aptitudes[i];
    if (!question) continue;

    await prisma.phase2Response.upsert({
      where: {
        assessmentId_questionId: { assessmentId: assessment.id, questionId: question.id },
      },
      update: { responseValue: (i % 3) + 1 },
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
  console.log(`✓ ${phase2Aptitudes.length} Phase 2 Aptitudes responses created`);

  // Assessment result
  const result = await prisma.assessmentResult.upsert({
    where: { assessmentId: assessment.id },
    update: { profileStrength: 'FORT' },
    create: {
      id: 'result_sample_v1',
      assessmentId: assessment.id,
      phase1Code: 'IAS',
      phase2Code: 'IAE',
      phase1Scores: { R: 12, I: 18, A: 15, S: 10, E: 8, C: 10 },
      phase2Scores: { R: 25, I: 35, A: 30, S: 20, E: 15, C: 20 },
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
  console.log(`✓ Assessment result ready`);

  // Career recommendations
  const topCareers = await prisma.career.findMany({ where: { isActive: true }, take: 3 });

  for (let i = 0; i < topCareers.length; i++) {
    const career = topCareers[i];
    if (!career) continue;

    await prisma.assessmentCareerRecommendation.upsert({
      where: { resultId_careerId: { resultId: result.id, careerId: career.id } },
      update: { matchScore: 85 - i * 15, rankPosition: i + 1 },
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
  console.log(`✓ ${topCareers.length} career recommendations created`);

  // Treasure map
  await prisma.treasureMap.upsert({
    where: { assessmentId: assessment.id },
    update: {},
    create: {
      id: 'treasure_map_sample_v1',
      assessmentId: assessment.id,
      shareToken: `share_${Date.now()}`,
      mapData: {
        riasecProfile: 'IAS',
        phase1Code: 'IAS',
        phase2Code: 'IAE',
        scores: { R: 12, I: 18, A: 15, S: 10, E: 8, C: 10 },
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
  console.log(`✓ Treasure map created`);

  // XP history
  await prisma.xPHistory.createMany({
    data: [
      {
        id: 'xp_sample_1',
        sessionId: session.id,
        amount: 100,
        reason: 'phase1_completion',
        assessmentId: assessment.id,
      },
      {
        id: 'xp_sample_2',
        sessionId: session.id,
        amount: 50,
        reason: 'phase2_completion',
        assessmentId: assessment.id,
      },
    ],
    skipDuplicates: true,
  });
  console.log(`✓ XP history created`);

  // Badge
  const badge = await prisma.badge.findFirst();
  if (badge) {
    await prisma.sessionBadge.upsert({
      where: { sessionId_badgeId: { sessionId: session.id, badgeId: badge.id } },
      update: {},
      create: {
        id: 'session_badge_sample_1',
        sessionId: session.id,
        badgeId: badge.id,
        unlockedAt: new Date(),
      },
    });
    console.log(`✓ Badge unlocked`);
  }

  console.log(`
✅ Seeding complete!
   User     : ${user.email}
   Session  : ${session.id}
   Assessment: ${assessment.id}
    `);
}
