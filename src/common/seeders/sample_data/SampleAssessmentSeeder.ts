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
