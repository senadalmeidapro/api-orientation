# ECOSYT API — Documentation complète

> **API d'orientation professionnelle basée sur le modèle RIASEC**
> Application NestJS · PostgreSQL · Prisma · TypeScript

---

## Table des matières

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [État du dépôt](#2-état-du-dépôt)
3. [Architecture technique](#3-architecture-technique)
4. [Prérequis et installation](#4-prérequis-et-installation)
5. [Configuration (.env)](#5-configuration-env)
6. [Scripts disponibles](#6-scripts-disponibles)
7. [Structure du projet](#7-structure-du-projet)
8. [Modèle de données (Prisma)](#8-modèle-de-données-prisma)
9. [Référence des modules et endpoints API](#9-référence-des-modules-et-endpoints-api)
10. [Flux métier principal (parcours RIASEC)](#10-flux-métier-principal-parcours-riasec)
11. [Sécurité](#11-sécurité)
12. [Module IA (GPT-4o)](#12-module-ia-gpt-4o)
13. [Moteur de recommandation adaptatif](#13-moteur-de-recommandation-adaptatif)
14. [Stockage de fichiers](#14-stockage-de-fichiers)
15. [Tests](#15-tests)
16. [Déploiement](#16-déploiement)
17. [Documentation Swagger](#17-documentation-swagger)

---

## 1. Vue d'ensemble du projet

**ECOSYT API** est le backend d'une plateforme d'orientation professionnelle destinée principalement aux jeunes béninois. Elle implémente le modèle psychométrique **RIASEC** (Holland) pour identifier les profils professionnels et proposer des recommandations de métiers adaptées au contexte local.

### Fonctionnalités principales

- **Test RIASEC en 2 phases** : phase 1 (amorce rapide, style swipe) + phase 2 (sections Occupations / Aptitudes / Personnalité)
- **Scoring multi-dimensionnel** : scores bruts, normalisés, codes dominants (ex. `RIA`), cohérence et différentiation du profil
- **Recommandations de métiers** avec pondération RIASEC et prise en compte de la demande locale
- **Moteur de recommandation adaptatif** : enrichi par le comportement utilisateur (feedbacks, interactions, temps de réponse)
- **Carte au trésor** : synthèse PDF exportable du profil et des recommandations
- **Intégration IA (GPT-4o)** : résumé du profil en langage naturel, coach d'orientation
- **Gamification** : badges, XP et niveaux utilisateur
- **Catalogue de contenu** : métiers, ressources pédagogiques, établissements de formation
- **Multi-langue** : infrastructure de traduction pour le contenu (fr, fon, yoruba, etc.)
- **Administration complète** : RBAC (admin/editor/analyst), audit trail, annonces

---

## 2. État du dépôt

### Branches

| Branche | Description |
|---|---|
| `copilot/analyze-repo-state-and-redact-readme` | Branche principale active (contient le code complet de l'application) |

> **Note** : Le dépôt est un clone shallow depuis le commit initial `init`. Il n'existe qu'une seule branche distante visible. L'historique complet et les autres branches éventuelles sont à vérifier directement sur GitHub.

### Dernier commit

```
81bbeca  format
58477c2  init
```

### Technologies et versions clés

| Technologie | Version |
|---|---|
| NestJS | 11.x |
| TypeScript | 5.7.x |
| Prisma ORM | 7.5.x |
| PostgreSQL | 14+ recommandé |
| Node.js | 20+ recommandé |
| Jest | 30.x |

---

## 3. Architecture technique

```
┌─────────────────────────────────────────────────────────────────┐
│                          Client (HTTP)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                        NestJS App                               │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────────┐   │
│  │ ThrottlerGuard│  │ JwtAuthGuard│  │    RolesGuard        │   │
│  └──────────────┘  └─────────────┘  └──────────────────────┘   │
│                    (Guards globaux)                             │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                 Modules métier                          │    │
│  │  auth · users · sessions · questions · responses        │    │
│  │  scoring · results · recommendations · careers          │    │
│  │  badges · announcements · contact · institutions        │    │
│  │  resources · localization · media · admin · ai          │    │
│  │  adaptive · outcomes · feedback                         │    │
│  └───────────────────────┬────────────────────────────────┘    │
│                          │                                      │
│  ┌───────────────────────▼────────────────────────────────┐    │
│  │              Infrastructure commune                     │    │
│  │  PrismaService · AuditService · MailService             │    │
│  │  PinoLogger · StorageService · AdaptiveCacheService     │    │
│  └───────────────────────┬────────────────────────────────┘    │
└──────────────────────────┼──────────────────────────────────────┘
                           │
          ┌────────────────┼──────────────────┐
          ▼                ▼                  ▼
    PostgreSQL           Redis             S3 / Local FS
    (données)         (cache adaptatif)    (fichiers PDF)
```

### Principes d'architecture

- **Guards globaux** : `ThrottlerBehindProxyGuard` (rate limiting), `JwtAuthGuard` (JWT par défaut), `RolesGuard` (RBAC)
- **Routes publiques** : décorateur `@Public()` pour exempter un endpoint de l'authentification JWT
- **RBAC** : décorateur `@Roles('admin' | 'editor' | 'analyst')` — les admins ont un flag `isAdmin` dédié
- **ValidationPipe global** : `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- **Helmet** : en-têtes HTTP de sécurité
- **CORS** : configurable via `CORS_ORIGIN` et `CORS_CREDENTIALS`
- **Rate limiting** : 120 requêtes / 60 secondes par IP (configurable)

---

## 4. Prérequis et installation

### Prérequis

- **Node.js** ≥ 20
- **npm** ≥ 10
- **PostgreSQL** ≥ 14
- **Redis** (optionnel, recommandé pour la production)

### Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/senadalmeidapro/api-orientation.git
cd api-orientation

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 4. Générer le client Prisma
npx prisma generate

# 5. Appliquer les migrations
npx prisma db push
# ou en production :
npx prisma migrate deploy

# 6. (Optionnel) Alimenter la base de données
npm run seed

# 7. Démarrer en mode développement
npm run start:dev
```

L'API est disponible sur `http://localhost:3000` par défaut.

---

## 5. Configuration (.env)

Copier `.env.example` vers `.env` et renseigner les valeurs suivantes :

```env
# ── Général ──────────────────────────────────────────────
NODE_ENV=development          # development | production | test
PORT=3000
LOG_LEVEL=info                # trace | debug | info | warn | error

# ── Base de données (requis) ──────────────────────────────
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME

# ── JWT (requis) ──────────────────────────────────────────
JWT_SECRET=change-me-in-production

# ── CORS ──────────────────────────────────────────────────
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
CORS_CREDENTIALS=true

# ── SMTP – réinitialisation de mot de passe (optionnel) ──
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=no-reply@compaspro.local
APP_BASE_URL=http://localhost:3000

# ── S3 – stockage des PDFs (optionnel) ───────────────────
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_PUBLIC_BASE_URL=

# ── OpenAI / IA (optionnel) ───────────────────────────────
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o
OPENAI_BASE_URL=https://api.openai.com
OPENAI_TIMEOUT_MS=15000
OPENAI_TEMPERATURE=0.3

# ── Redis – cache adaptatif (optionnel) ───────────────────
REDIS_URL=redis://localhost:6379

# ── Swagger – accès sécurisé (optionnel) ─────────────────
SWAGGER_USER=admin
SWAGGER_PASS=change-me
```

> Si `S3_BUCKET` n'est pas configuré, les PDFs sont stockés localement dans `storage/treasure-maps/`.
> Si `REDIS_URL` n'est pas configuré, le cache adaptatif bascule automatiquement en mémoire.
> Si `SMTP_HOST` n'est pas configuré, les emails ne sont pas envoyés (avertissement dans les logs).

---

## 6. Scripts disponibles

```bash
npm run build          # Compile le projet (dist/)
npm run start          # Démarre en mode normal
npm run start:dev      # Démarre avec rechargement automatique (watch)
npm run start:debug    # Démarre en mode debug (port 9229)
npm run start:prod     # Démarre depuis le build compilé

npm run lint           # Lint + corrections automatiques (ESLint + Prettier)
npm run format         # Formate le code source avec Prettier

npm run test           # Lance les tests unitaires (Jest)
npm run test:watch     # Tests en mode watch
npm run test:cov       # Tests avec couverture de code
npm run test:e2e       # Tests end-to-end (requiert PostgreSQL)

npm run seed           # Alimente la BDD avec les données initiales (types RIASEC, questions, métiers…)
```

---

## 7. Structure du projet

```
api-orientation/
├── prisma/
│   ├── schema.prisma          # Schéma Prisma (modèles + enums)
│   ├── migrations/            # Migrations SQL générées
│   └── seeders/
│       └── seed.ts            # Script de seed complet
├── src/
│   ├── main.ts                # Bootstrap (CORS, Helmet, ValidationPipe, Swagger)
│   ├── app.module.ts          # Module racine (imports + guards globaux)
│   ├── app.controller.ts      # Endpoint healthcheck racine
│   ├── fastify-swagger.ts     # Configuration Swagger sécurisé
│   ├── prisma/                # Module Prisma (PrismaService)
│   ├── common/
│   │   ├── audit/             # AuditService (journal des actions admin)
│   │   ├── decorators/        # @Public(), @Roles(), @CurrentUser()
│   │   ├── guards/            # JwtAuthGuard, RolesGuard, ThrottlerBehindProxyGuard
│   │   ├── filters/           # Filtres d'exceptions HTTP
│   │   ├── interceptors/      # Interceptors globaux
│   │   ├── logger/            # PinoLoggerService (JSON structuré)
│   │   ├── mail/              # MailService (nodemailer)
│   │   ├── pipes/             # Pipes de validation
│   │   └── utils/             # Utilitaires divers
│   └── modules/
│       ├── auth/              # Authentification JWT + tokens
│       ├── users/             # Profil et paramètres utilisateur
│       ├── sessions/          # Sessions de test RIASEC
│       ├── questions/         # Banque de questions (phase 1 & 2)
│       ├── responses/         # Enregistrement des réponses
│       ├── scoring/           # Calcul des scores RIASEC
│       ├── results/           # Résultats + Carte au trésor (PDF)
│       ├── recommendations/   # Recommandations de métiers
│       ├── adaptive/          # Moteur adaptatif (profil comportemental + cache Redis)
│       ├── ai/                # Intégration GPT-4o (résumé + coach)
│       ├── careers/           # Catalogue des métiers
│       ├── resources/         # Ressources pédagogiques
│       ├── institutions/      # Établissements de formation
│       ├── announcements/     # Annonces et actualités
│       ├── badges/            # Gamification (badges, XP, niveaux)
│       ├── contact/           # Demandes de contact
│       ├── feedback/          # Feedbacks comportementaux
│       ├── outcomes/          # Suivi des parcours post-test
│       ├── localization/      # Gestion des langues
│       ├── media/             # Stockage de fichiers (S3 / local)
│       └── admin/             # Administration (types RIASEC, audit logs, rôles)
└── test/
    └── app.e2e-spec.ts        # Tests end-to-end
```

---

## 8. Modèle de données (Prisma)

### Énumérations principales

| Enum | Valeurs | Usage |
|---|---|---|
| `RiasecType` | R, I, A, S, E, C | Profil RIASEC de Holland |
| `PhaseType` | PHASE_1, PHASE_2, PHASE_3 | Avancement dans le test |
| `SectionType` | OCCUPATIONS, APTITUDES, PERSONALITY | Sections de la phase 2 |
| `ProfileStrength` | TRES_FAIBLE → EXCEPTIONNEL | Force du profil calculée |
| `ConsistencyLevel` | FAIBLE, MOYENNE, FORTE | Cohérence interne du profil |
| `BadgeRarity` | COMMON, RARE, EPIC, LEGENDARY | Rareté des badges |
| `UserRole` | ADMIN, EDITOR, ANALYST | Rôles de back-office |
| `CareerCategory` | NUMERIQUE, AGRICULTURE, ARTISANAT, SANTE, EDUCATION, COMMERCE, ADMINISTRATION | Secteurs métier |
| `Departement` | 12 départements du Bénin | Localisation utilisateur |
| `Gender` | M, F, Other | Genre |
| `Theme` | light, dark, system | Préférence d'affichage |
| `AnnouncementType` | INFO, EVENT, ALERTE, PROMO | Type d'annonce |
| `OutcomeStatus` | STUDENT, INTERNSHIP, EMPLOYED, DROPOUT | Suivi post-orientation |

### Modèles principaux

```
TestVersion ──< Phase1Question >── RiasecTypeModel
            ──< Phase2Question >── AptitudeResponseOption
            ──< UserTestSession >── User
                    │
                    ├──< Phase1Response
                    ├──< Phase2Response
                    └──> UserResult >──< UserCareerRecommendation >── Career

User ──> UserSettings
     ──> UserLevel
     ──< RefreshToken
     ──< UserBadge >── Badge
     ──< PasswordResetToken

Career ──< CareerTranslation
       ──< CareerRiasecCode

Institution ──< InstitutionTranslation
Resource    ──< ResourceTranslation
Announcement ──< AnnouncementTranslation

AdminAuditLog ── User
FeedbackEvent  ── User, Career
InteractionEvent ── User
Outcome ── User
ContactRequest
Language
```

---

## 9. Référence des modules et endpoints API

> Toutes les routes sont protégées par JWT sauf indication `[PUBLIC]`.
> Préfixe de base : `http://localhost:3000`

---

### 🔐 Auth — `/auth`

| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/auth/register` | PUBLIC | Inscription (retourne access + refresh tokens) |
| POST | `/auth/login` | PUBLIC | Connexion |
| POST | `/auth/refresh` | PUBLIC | Rafraîchissement du token (rotation automatique) |
| POST | `/auth/logout` | Auth | Révocation du refresh token |
| POST | `/auth/request-password-reset` | PUBLIC | Demande de réinitialisation de mot de passe (email) |
| POST | `/auth/reset-password` | PUBLIC | Réinitialisation via token reçu par email |
| GET | `/auth/me` | Auth | Profil de l'utilisateur connecté |

**Tokens** : `access_token` (court terme, Bearer) + `refresh_token` (long terme, rotation à chaque appel `/refresh`).

---

### 👤 Users — `/users`

| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/users/me` | Auth | Profil complet (avec settings et niveau) |
| PATCH | `/users/me` | Auth | Mise à jour du profil (nom, téléphone, localisation…) |
| PATCH | `/users/settings` | Auth | Mise à jour des préférences (thème, taille police, partage) |
| GET | `/users` | Admin | Liste paginée des utilisateurs |
| PATCH | `/users/:id/roles` | Admin | Attribution de rôles à un utilisateur |
| GET | `/users/health` | Auth | Healthcheck |

---

### 📋 Sessions — `/sessions`

| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/sessions` | Auth (ou anonyme via DTO) | Crée une session de test (résout automatiquement la version active) |
| GET | `/sessions/:sessionToken` | PUBLIC | Récupère l'état d'une session par son token |

---

### ❓ Questions — `/questions`

| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/questions/phase1` | PUBLIC | Liste des questions de phase 1 (avec traductions) |
| POST | `/questions/phase1` | Admin/Editor | Crée une question de phase 1 |
| PATCH | `/questions/phase1/:id` | Admin/Editor | Met à jour une question de phase 1 |
| GET | `/questions/phase2` | PUBLIC | Liste des questions de phase 2 |
| POST | `/questions/phase2` | Admin/Editor | Crée une question de phase 2 |
| PATCH | `/questions/phase2/:id` | Admin/Editor | Met à jour une question de phase 2 |

---

### 📝 Responses — `/responses`

| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/responses/phase1` | Auth | Enregistre les réponses de phase 1 (binaire oui/non) |
| POST | `/responses/phase2` | Auth | Enregistre les réponses de phase 2 (valeur 1–5 selon section) |

> La soumission des réponses met automatiquement à jour la progression de la session et déclenche les badges de phase.

---

### 📊 Scoring — `/scoring`

| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/scoring/health` | Auth | Healthcheck du service de scoring |

> Le scoring est déclenché en interne par `/results/compute`. Il calcule les scores bruts, normalisés, les codes dominants, la cohérence et la différentiation.

---

### 🏆 Results — `/results`

| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/results/compute` | Auth | Calcule et persiste les résultats (déclenche scoring + badges) |
| GET | `/results/by-token/:sessionToken` | PUBLIC | Résultats par token de session |
| GET | `/results/:sessionId` | Auth | Résultats par ID de session |

**Treasure Map** — `/results` (sous-routes)

| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/results/treasure-map` | Auth | Génère la carte au trésor (PDF + recommandations) |
| GET | `/results/treasure-map/:sessionToken` | PUBLIC | Accès public à la carte par token |

---

### 🎯 Recommendations — `/careers`

| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/careers/recommendations` | Auth | Recommandations basées sur le profil RIASEC |
| GET | `/careers/recommendations/adaptive` | Auth | Recommandations enrichies par le profil comportemental |
| GET | `/careers/recommendations/:careerId/explain` | Auth | Explication du score de correspondance pour un métier |

---

### 💼 Careers — `/careers`

| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/careers` | PUBLIC | Liste des métiers (filtres : catégorie, recherche textuelle) |
| GET | `/careers/id/:id` | PUBLIC | Détail d'un métier |
| POST | `/careers` | Admin/Editor | Crée un métier |
| PATCH | `/careers/:id` | Admin/Editor | Met à jour un métier |
| DELETE | `/careers/:id` | Admin | Désactive un métier (soft delete) |

---

### 📚 Resources — `/resources`

| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/resources` | PUBLIC | Liste des ressources actives |
| GET | `/resources/:id` | PUBLIC | Détail d'une ressource |
| GET | `/resources/admin/list` | Admin/Editor | Liste complète (admin) |
| GET | `/resources/admin/:id` | Admin/Editor | Détail (admin) |
| POST | `/resources` | Admin/Editor | Crée une ressource |
| PATCH | `/resources/:id` | Admin/Editor | Met à jour une ressource |
| POST | `/resources/:id/translations` | Admin/Editor | Ajoute une traduction |

---

### 🏫 Institutions — `/institutions`

| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/institutions` | PUBLIC | Liste des établissements actifs |
| GET | `/institutions/:id` | PUBLIC | Détail d'un établissement |
| GET | `/institutions/admin/list` | Admin/Editor | Liste complète (admin) |
| GET | `/institutions/admin/:id` | Admin/Editor | Détail (admin) |
| POST | `/institutions` | Admin/Editor | Crée un établissement |
| PATCH | `/institutions/:id` | Admin/Editor | Met à jour un établissement |
| POST | `/institutions/:id/translations` | Admin/Editor | Ajoute une traduction |

---

### 📣 Announcements — `/announcements`

| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/announcements` | PUBLIC | Annonces actives (filtrées par audience et période) |
| GET | `/announcements/:id` | PUBLIC | Détail d'une annonce |
| GET | `/announcements/admin/list` | Admin | Liste complète (admin) |
| GET | `/announcements/admin/:id` | Admin | Détail (admin) |
| POST | `/announcements` | Admin/Editor | Crée une annonce |
| PATCH | `/announcements/:id` | Admin/Editor | Met à jour une annonce |
| POST | `/announcements/:id/translations` | Admin/Editor | Ajoute une traduction |

---

### 🏅 Badges — `/badges`

| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/badges` | Auth | Catalogue de tous les badges |
| GET | `/badges/me` | Auth | Badges obtenus par l'utilisateur connecté |
| GET | `/badges/me/level` | Auth | Niveau et XP de l'utilisateur connecté |
| GET | `/badges/user/:userId` | Auth | Badges d'un utilisateur spécifique |

**Badges automatiques** déclenchés par les événements :

| Code | Nom | Déclencheur | Rareté | XP |
|---|---|---|---|---|
| `PHASE1_COMPLETED` | Explorateur 🧭 | Fin phase 1 | COMMON | 20 |
| `PHASE2_COMPLETED` | Analyste 🧠 | Fin phase 2 | RARE | 30 |
| `TEST_COMPLETED` | Orientation 🏁 | Résultat calculé | EPIC | 50 |
| `TREASURE_MAP` | Carte au trésor 🗺️ | Génération du PDF | RARE | 20 |

---

### 📩 Contact — `/contact`

| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/contact` | PUBLIC | Soumet une demande de contact |
| GET | `/contact` | Admin | Liste des demandes |
| GET | `/contact/export` | Admin | Export CSV des demandes |
| PATCH | `/contact/:id` | Admin | Met à jour le statut d'une demande |

---

### 💬 Feedback — `/feedback`

| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/feedback` | Auth | Enregistre un feedback comportemental (LIKE/DISLIKE/CLICK/VIEW/SKIP) |
| GET | `/feedback` | Admin/Analyst | Liste des feedbacks |

---

### 🗺️ Outcomes — `/outcomes`

| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/outcomes` | Auth | Déclare le statut post-orientation (étudiant, emploi…) |
| GET | `/outcomes` | Admin/Analyst | Liste des parcours déclarés |

---

### 🌐 Localization — `/localization`

| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/localization/languages` | PUBLIC | Liste des langues actives |
| POST | `/localization/languages` | Admin | Ajoute une langue |
| PATCH | `/localization/languages/:id` | Admin | Met à jour une langue |

---

### 🖼️ Media — `/media`

| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/media/health` | Auth | Healthcheck du service de stockage |

---

### ⚙️ Admin — `/admin`

| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/admin/riasec-types` | Auth | Liste des types RIASEC |
| POST | `/admin/riasec-types` | Admin | Crée un type RIASEC |
| PATCH | `/admin/riasec-types/:id` | Admin | Met à jour un type RIASEC |
| GET | `/admin/aptitude-options` | Auth | Options de réponse d'aptitude |
| POST | `/admin/aptitude-options` | Admin | Crée une option d'aptitude |
| PATCH | `/admin/aptitude-options/:id` | Admin | Met à jour une option |
| GET | `/admin/audit-logs` | Admin | Journal d'audit paginé et filtré |
| GET | `/admin/roles` | Admin | Liste des rôles applicatifs |

---

### 🤖 AI — `/ai`

| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/ai/summary` | Auth | Génère un résumé IA du profil RIASEC (GPT-4o) |
| POST | `/ai/coach` | Auth | Obtient des conseils d'orientation personnalisés |

---

## 10. Flux métier principal (parcours RIASEC)

```
1. [POST /sessions]
   └─ Création de la session (token unique, version de test active)

2. [GET /questions/phase1]
   └─ Récupération des questions de phase 1 (≈60 questions, oui/non)

3. [POST /responses/phase1]
   └─ Enregistrement des réponses → progression mise à jour → badge PHASE1

4. [GET /questions/phase2]
   └─ Questions de phase 2 (3 sections : Occupations, Aptitudes, Personnalité)

5. [POST /responses/phase2]
   └─ Enregistrement des réponses → badge PHASE2

6. [POST /results/compute]
   └─ Calcul RIASEC (scores bruts, normalisés, codes ex. "RIA", cohérence)
   └─ Badge TEST_COMPLETED + niveau XP mis à jour

7. [GET /careers/recommendations]
   └─ Top N métiers pondérés par les codes dominants + demande locale

8. [POST /results/treasure-map]      ← optionnel
   └─ Génération du PDF (synthèse profil + recommandations)
   └─ Badge TREASURE_MAP

9. [POST /ai/summary]                ← optionnel
   └─ Résumé IA du profil en langage naturel

10. [POST /ai/coach]                 ← optionnel
    └─ Plan d'action personnalisé
```

---

## 11. Sécurité

### Authentification

- **JWT** : `Authorization: Bearer <access_token>`
- **Durée du access token** : configurable via `JWT_SECRET` (par défaut courte)
- **Refresh token** : rotation à chaque renouvellement, révocable, stocké hashé en BDD

### Autorisation (RBAC)

| Rôle | `isAdmin` | Rôles (`roles[]`) | Accès |
|---|---|---|---|
| Utilisateur standard | false | `[]` | Endpoints Auth (propres données) |
| Editor | false | `['editor']` | + gestion du contenu (careers, resources, etc.) |
| Analyst | false | `['analyst']` | + lecture analytics, feedbacks, outcomes |
| Admin | **true** | `['admin']` | Accès complet |

### Autres mesures

- **Helmet** : en-têtes de sécurité HTTP (CSP, HSTS, etc.)
- **Rate limiting** : 120 req/min par IP (via `@nestjs/throttler`)
- **Validation stricte** : `whitelist` + `forbidNonWhitelisted` sur tous les DTOs
- **Audit trail** : toutes les actions admin sont tracées dans `AdminAuditLog`
- **Mots de passe** : hashés avec bcrypt (salt rounds = 10)
- **Réinitialisation de mot de passe** : token aléatoire, expirant, hashé en BDD

---

## 12. Module IA (GPT-4o)

Le module `ai` intègre l'API OpenAI pour enrichir l'expérience d'orientation.

### Configuration

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
OPENAI_BASE_URL=https://api.openai.com
OPENAI_TIMEOUT_MS=15000
OPENAI_TEMPERATURE=0.3
```

### Endpoints

**POST `/ai/summary`**
```json
{
  "sessionToken": "uuid-de-la-session",
  "limit": 6
}
```
Retourne un JSON structuré : `summary` (texte), `strengths` (tableau), `actions` (tableau).

**POST `/ai/coach`**
```json
{
  "sessionToken": "uuid-de-la-session",
  "question": "Quels métiers correspondent à mon profil ?"
}
```
Retourne un `answer` en langage naturel avec des conseils actionnables.

### Architecture

- **`AiClient`** : abstraction HTTP vers OpenAI, gère timeouts et retries
- **`AiService`** : orchestre la récupération des données (session, résultats, recommandations), construit le contexte et normalise la réponse
- Réponses structurées via **JSON Schema** pour garantir le format

> **Bonnes pratiques** : aucune PII inutile n'est envoyée à OpenAI, température basse (0.3) pour des sorties stables.

---

## 13. Moteur de recommandation adaptatif

Le module `adaptive` enrichit les recommandations avec le comportement réel de l'utilisateur.

### Composants

| Service | Rôle |
|---|---|
| `AdaptiveProfileService` | Construit le profil comportemental (vitesse, cohérence, exploration) |
| `RecommendationEngine` | Score les métiers en croisant profil RIASEC + comportement + feedbacks |
| `ExplanationService` | Génère des explications textuelles des scores |
| `AdaptiveCacheService` | Cache Redis (fallback en mémoire si Redis absent) |
| `FeatureService` | Gestion des feature flags |
| `InteractionEventsService` | Enregistre et lit les événements d'interaction |
| `AdaptiveQueueService` | File de traitement asynchrone des interactions |

### Algorithme de scoring adaptatif

```
score_final = (score_RIASEC × 0.6) + (poids_comportemental × 0.2) + (boost_feedback × 0.2)
```

- **score_RIASEC** : correspondance entre les codes du métier et le profil RIASEC pondéré
- **poids_comportemental** : basé sur vitesse de réponse, exploration, variance
- **boost_feedback** : +0.3 si un métier aimé partage des codes RIASEC, -0.5 si un métier détesté

### Cache

- TTL par défaut : **300 secondes** (5 minutes)
- Clé : `adaptive:recommendations:{userId}:{limit}`
- Redis recommandé en production via `REDIS_URL`

---

## 14. Stockage de fichiers

Le service `StorageService` gère les PDFs (Cartes au trésor) avec deux modes :

### Mode S3 (production recommandée)

Configurez `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` et `S3_PUBLIC_BASE_URL`.

### Mode local (développement)

Sans configuration S3, les fichiers sont stockés dans `storage/treasure-maps/` à la racine du projet. Ce dossier est créé automatiquement.

```
storage/
└── treasure-maps/
    ├── uuid1.pdf
    └── uuid2.pdf
```

---

## 15. Tests

### Tests unitaires

```bash
npm run test             # Lance tous les tests
npm run test:watch       # Mode watch
npm run test:cov         # Avec couverture de code
```

Les specs `.spec.ts` couvrent chaque service et contrôleur. Configuration Jest dans `package.json`.

### Tests end-to-end

```bash
# Prérequis : base PostgreSQL accessible via DATABASE_URL
npx prisma generate
npx prisma db push
npm run test:e2e
```

Configuration dans `test/jest-e2e.json`.

---

## 16. Déploiement

### Variables d'environnement de production

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=<valeur longue et aléatoire>
CORS_ORIGIN=https://votre-frontend.com
REDIS_URL=redis://...
S3_BUCKET=...
OPENAI_API_KEY=...
SMTP_HOST=...
```

### Build et démarrage

```bash
npm run build
npm run start:prod
```

### Docker (exemple minimal)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY dist/ ./dist/
COPY prisma/ ./prisma/
RUN npx prisma generate
EXPOSE 3000
CMD ["node", "dist/main"]
```

### CI/CD (GitHub Actions)

Pour un pipeline type :
1. `npm ci`
2. `npx prisma generate`
3. `npx prisma db push`
4. `npm run test`
5. `npm run build`
6. `npm run test:e2e`

---

## 17. Documentation Swagger

La documentation interactive est accessible à :

```
http://localhost:3000/api/v1/docs/v1
```

Elle est protégée par une authentification HTTP Basic (`SWAGGER_USER` / `SWAGGER_PASS`).

Les deux serveurs documentés sont :
- `http://localhost:3000` — Serveur local
- `https://api.ecosyt.com` — Serveur distant

---

## Liens

- **Auteur** : Sèna D'ALMEIDA — [senadalmeidapro@gmail.com](mailto:senadalmeidapro@gmail.com)
- **Site** : [https://ecosyt.com](https://ecosyt.com)
- **Dépôt** : [github.com/senadalmeidapro/api-orientation](https://github.com/senadalmeidapro/api-orientation)

---

*Documentation générée le 2026-04-13 — ECOSYT API v1.0.0*
