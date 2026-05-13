# Plateforme Orientation API - Dossier Complet UML et Cas d'Usage

## 1. Objectif du document
Ce document formalise l'analyse complète de la plateforme backend NestJS d'orientation RIASEC:
- cas de figure métier,
- cas d'usage fonctionnels,
- structures d'objets et relations,
- interactions temporelles,
- états de cycle de vie,
- couverture par modules API.

Le but est de servir de base de référence pour le produit, le backend, le front back-office, QA et architecture.

## 2. Périmètre
Le périmètre couvre les domaines observés dans le code:
- `auth`, `users`, `sessions`, `assessments`, `questions`, `responses`, `scoring`, `results`, `treasure-map`
- `recommendations`, `careers`, `resources`, `universities`, `formations`, `scholarships`
- `analytics`, `ai`, `badges`, `backoffice`
- couches transverses: sécurité JWT/RBAC, throttling, Prisma, email, cache.

## 3. Acteurs de la plateforme
- `Visiteur` : utilisateur non authentifié.
- `Utilisateur Authentifié` : candidat qui passe le test, consulte ses résultats.
- `Admin` : gestion complète via back-office.
- `Agent` : rôle interne limité (selon règles métier).
- `Système IA` : service externe de génération d'insights.
- `Service Email` : envoi vérification/réinitialisation.

## 4. Vue d'ensemble des cas d'usage
### 4.1 Diagramme global de cas d'utilisation
```mermaid
flowchart LR
    V[Visiteur] --> UC1[Inscription/Connexion]
    V --> UC2[Consulter contenus publics]

    U[Utilisateur Authentifié] --> UC3[Créer session]
    U --> UC4[Passer assessment]
    U --> UC5[Soumettre réponses]
    U --> UC6[Voir résultats]
    U --> UC7[Voir recommandations]
    U --> UC8[Générer carte au trésor]
    U --> UC9[Envoyer feedback/outcome]
    U --> UC10[Utiliser coach IA]

    A[Admin] --> UC11[Gérer utilisateurs]
    A --> UC12[Gérer banque de questions]
    A --> UC13[Gérer contenus métiers]
    A --> UC14[Gérer universités/formations/bourses]
    A --> UC15[Superviser sessions/assessments]
    A --> UC16[Analyser analytics]
    A --> UC17[Exploiter dashboard back-office]

    UC4 --> UC5
    UC5 --> UC6
    UC6 --> UC7
    UC7 --> UC9
```

### 4.2 Cas d'usage détaillés (catalogue)
1. `AUTH-01` Inscription email/mot de passe.
2. `AUTH-02` Connexion + émission JWT.
3. `AUTH-03` Refresh token.
4. `AUTH-04` Vérification email.
5. `AUTH-05` Réinitialisation mot de passe.
6. `USER-01` Consultation profil courant.
7. `USER-02` Mise à jour profil.
8. `SES-01` Création session d'orientation.
9. `SES-02` Création assessment lié à une session.
10. `SES-03` Consultation session par token.
11. `QST-01` Récupération questions phase 1.
12. `QST-02` Récupération questions phase 2.
13. `QST-03` Récupération lot adaptatif suivant.
14. `RSP-01` Soumission réponses phase 1.
15. `RSP-02` Soumission réponses phase 2.
16. `RSP-03` Soumission batch adaptatif.
17. `SCR-01` Calcul score RIASEC.
18. `RES-01` Calcul résultat global assessment.
19. `RES-02` Lecture résultat enrichi.
20. `MAP-01` Génération carte au trésor.
21. `MAP-02` Consultation/partage carte.
22. `REC-01` Génération recommandations métiers.
23. `REC-02` Consultation recommandations.
24. `ANL-01` Capture interactions.
25. `ANL-02` Capture feedback.
26. `ANL-03` Capture outcomes.
27. `ANL-04` Synthèse analytics admin.
28. `AI-01` Résumé IA du profil.
29. `AI-02` Chat/coaching IA.
30. `CAR-01` CRUD carrières.
31. `RSC-01` CRUD ressources.
32. `UNI-01` CRUD universités.
33. `FRM-01` CRUD formations.
34. `SCH-01` CRUD bourses.
35. `BAD-01` Attribution badges/XP.
36. `BO-01` Dashboard back-office complet.
37. `BO-02` CRUD administratifs transverses.

## 5. Diagrammes de classes d'objets
### 5.1 Domaine utilisateur/auth/session
```mermaid
classDiagram
    class User {
      +id: string
      +email: string
      +role: UserRole
      +status: UserStatus
      +createdAt: Date
    }

    class AuthAccount {
      +provider: AuthProvider
      +providerAccountId: string
    }

    class AuthToken {
      +tokenHash: string
      +tokenType: string
      +expiresAt: Date
    }

    class Session {
      +id: string
      +sessionToken: string
      +isActive: bool
      +isCurrent: bool
      +expiresAt: Date
    }

    class Assessment {
      +id: string
      +type: AssessmentType
      +status: AssessmentStatus
      +currentPhase: PhaseType
      +completionPercentage: int
    }

    User "1" --> "0..*" Session
    User "1" --> "0..*" AuthAccount
    User "1" --> "0..1" AuthToken
    Session "1" --> "0..*" Assessment
```

### 5.2 Domaine test/question/réponse/résultat
```mermaid
classDiagram
    class TestVersion {
      +id: int
      +code: string
      +isActive: bool
    }

    class Phase1Question {
      +id: int
      +riasecTypeId: RiasecType
      +questionText: string
      +isActive: bool
    }

    class Phase2Question {
      +id: int
      +phase2Type: Phase2Type
      +questionText: string
      +isActive: bool
    }

    class Phase1Response {
      +id: string
      +responseValue: int
      +timeTakenMs: int
      +changeCount: int
    }

    class Phase2Response {
      +id: string
      +responseValue: int
      +timeTakenMs: int
      +changeCount: int
    }

    class AssessmentResult {
      +id: string
      +phase1Code: string
      +phase2Code: string
      +consistencyScore: float
      +profileStrength: ProfileStrength
    }

    class TreasureMap {
      +id: string
      +shareToken: string
      +pdfUrl: string
      +viewCount: int
    }

    TestVersion "1" --> "0..*" Phase1Question
    TestVersion "1" --> "0..*" Phase2Question
    Assessment "1" --> "0..*" Phase1Response
    Assessment "1" --> "0..*" Phase2Response
    Assessment "1" --> "0..1" AssessmentResult
    Assessment "1" --> "0..1" TreasureMap
```

### 5.3 Domaine recommandations/formation/contenu
```mermaid
classDiagram
    class Career {
      +id: int
      +name: string
      +riasecCodes: RiasecType[]
      +isActive: bool
      +isFeatured: bool
    }

    class Resource {
      +id: int
      +title: string
      +contentType: string
      +isPublished: bool
    }

    class University {
      +id: int
      +name: string
      +acronym: string
      +isActive: bool
    }

    class Formation {
      +id: int
      +title: string
      +degree: string
      +isActive: bool
    }

    class Scholarship {
      +id: int
      +title: string
      +provider: string
      +isActive: bool
    }

    class AssessmentCareerRecommendation {
      +id: string
      +matchScore: int
      +rankPosition: int
      +savedForLater: bool
    }

    AssessmentResult "1" --> "0..*" AssessmentCareerRecommendation
    AssessmentCareerRecommendation "*" --> "1" Career
    Career "*" --> "*" Resource
    University "1" --> "0..*" Formation
    University "*" --> "*" Scholarship
```

### 5.4 Domaine adaptatif et comportemental
```mermaid
classDiagram
    class QuestionProfile {
      +id: int
      +phase: PhaseType
      +riasecType: RiasecType
      +weight: float
    }

    class BatchHistory {
      +id: string
      +batchIndex: int
      +phaseType: PhaseType
      +questionIds: int[]
      +completedAt: Date
    }

    class IntermediateProfile {
      +id: string
      +batchIndex: int
      +profileData: Json
    }

    class BehavioralIndicator {
      +id: string
      +responseId: string
      +indicatorType: string
      +timeTakenMs: int
      +changeCount: int
    }

    Assessment "1" --> "0..*" BatchHistory
    Assessment "1" --> "0..*" IntermediateProfile
    Assessment "1" --> "0..*" BehavioralIndicator
    Phase1Question "1" --> "0..*" QuestionProfile
    Phase2Question "1" --> "0..*" QuestionProfile
```

## 6. Diagrammes de séquence (scénarios clés)
### 6.1 Parcours nominal complet (de login à recommandations)
```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant AUTH as AuthController/Service
    participant SES as SessionsController/Service
    participant Q as QuestionsService
    participant R as ResponsesService
    participant S as ScoringService
    participant RES as ResultsService
    participant REC as RecommendationsService

    U->>AUTH: POST /auth/login
    AUTH-->>U: accessToken + refreshToken

    U->>SES: POST /sessions
    SES-->>U: sessionToken + assessment

    loop Phase 1 et/ou Phase 2
      U->>Q: GET /questions/*
      Q-->>U: lot de questions
      U->>R: POST /responses/*
      R-->>U: progression
    end

    U->>S: POST /scoring/compute
    S-->>U: scores riasec

    U->>RES: POST /results/compute
    RES-->>U: resultId + code

    U->>REC: GET /careers/recommendations
    REC-->>U: top métiers recommandés
```

### 6.2 Flux adaptatif par batch
```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant Q as QuestionsService
    participant A as AdaptiveSelectionService
    participant B as BatchManagementService
    participant R as ResponsesService
    participant BI as BehavioralAnalysisService

    U->>Q: GET /questions/next-batch
    Q->>A: selectNextBatch(assessment)
    A-->>Q: questionIds
    Q->>B: startNewBatch()
    Q-->>U: questions

    U->>R: POST /responses/batch
    R->>BI: analyzeResponse(timeTakenMs, changeCount)
    BI-->>R: indicators
    R->>B: completeBatch()
    R->>A: calculateIntermediateProfile()
    R-->>U: batch terminé + nextAvailable
```

### 6.3 Génération de carte au trésor
```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant RC as ResultsController
    participant TS as TreasureMapService
    participant PDF as PDF Generator
    participant ST as StorageService

    U->>RC: POST /treasure-map
    RC->>TS: createTreasureMap(assessmentId)
    TS->>PDF: render(template + data)
    PDF-->>TS: pdfBuffer
    TS->>ST: upload/save(pdf)
    ST-->>TS: pdfUrl
    TS-->>RC: shareToken + pdfUrl
    RC-->>U: treasureMap
```

### 6.4 Back-office supervision
```mermaid
sequenceDiagram
    actor Admin
    participant BO as BackofficeController
    participant BOS as BackofficeService
    participant DB as Prisma

    Admin->>BO: GET /backoffice/dashboard
    BO->>BOS: getDashboardSummary(from,to)
    BOS->>DB: agrégations multiples
    DB-->>BOS: compteurs + états + périodes
    BOS-->>BO: payload dashboard
    BO-->>Admin: KPI complets
```

## 7. Diagrammes d'activité
### 7.1 Activité: Passage d'un test
```mermaid
flowchart TD
    A[Start] --> B[Utilisateur authentifié]
    B --> C[Créer session]
    C --> D[Créer assessment]
    D --> E{Phase courante?}
    E -->|Phase 1| F[Charger questions P1]
    E -->|Phase 2| G[Charger questions P2]
    F --> H[Soumettre réponses]
    G --> H
    H --> I{Assessment terminé?}
    I -->|Non| E
    I -->|Oui| J[Calcul scoring]
    J --> K[Calcul résultat]
    K --> L[Générer recommandations]
    L --> M[Option carte au trésor]
    M --> N[End]
```

### 7.2 Activité: Gouvernance back-office
```mermaid
flowchart TD
    A[Admin login] --> B[Consulter dashboard]
    B --> C{Anomalie détectée?}
    C -->|Oui| D[Analyser sessions/assessments]
    D --> E[Corriger contenus/questions]
    E --> F[Suivre impact via analytics]
    F --> B
    C -->|Non| G[Pilotage normal]
    G --> B
```

## 8. Diagrammes d'état
### 8.1 État d'un assessment
```mermaid
stateDiagram-v2
    [*] --> IN_PROGRESS
    IN_PROGRESS --> COMPLETED: toutes étapes validées
    IN_PROGRESS --> ABANDONED: abandon utilisateur/admin
    COMPLETED --> [*]
    ABANDONED --> [*]
```

### 8.2 État d'un utilisateur
```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> ACTIVE: email validé / activation
    ACTIVE --> SUSPENDED: action admin
    SUSPENDED --> ACTIVE: réactivation
    ACTIVE --> DELETED: suppression logique
    SUSPENDED --> DELETED: suppression logique
    DELETED --> [*]
```

### 8.3 État publication ressource
```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> PUBLISHED: publication admin
    PUBLISHED --> DRAFT: dépublication
    PUBLISHED --> ARCHIVED: désactivation retrait
    ARCHIVED --> [*]
```

## 9. Diagramme de composants
```mermaid
flowchart TB
    subgraph API[NestJS API]
      AUTH[Auth Module]
      USR[Users Module]
      SES[Sessions Module]
      QST[Questions Module]
      RSP[Responses Module]
      SCR[Scoring Module]
      RES[Results Module]
      REC[Recommendations Module]
      CON[Careers/Resources/Universities]
      ANL[Analytics Module]
      AI[AI Module]
      BO[Backoffice Module]
    end

    DB[(PostgreSQL/Prisma)]
    REDIS[(Redis Cache)]
    EMAIL[Email Provider]
    LLM[AI Provider]
    S3[S3/Storage]

    AUTH --> DB
    USR --> DB
    SES --> DB
    QST --> DB
    RSP --> DB
    SCR --> DB
    RES --> DB
    REC --> DB
    CON --> DB
    ANL --> DB
    BO --> DB

    QST --> REDIS
    RSP --> REDIS

    AUTH --> EMAIL
    AI --> LLM
    RES --> S3
```

## 10. Diagramme de déploiement (logique)
```mermaid
flowchart LR
    Client[Web/Mobile Client] --> LB[Reverse Proxy / Load Balancer]
    LB --> APP[NestJS App Instances]
    APP --> PG[(PostgreSQL)]
    APP --> RD[(Redis)]
    APP --> OBJ[(Object Storage S3/local)]
    APP --> SMTP[SMTP/Brevo]
    APP --> LLM[OpenAI/Google AI]
```

## 11. Matrice cas d'usage → modules
| Domaine | Cas d'usage principaux | Modules backend |
|---|---|---|
| Authentification | login/register/refresh/reset/verify | `auth`, `users`, `email` |
| Parcours test | création session, progression assessment | `sessions`, `assessments` |
| Questionnaire | chargement questions, sélection adaptative | `questions`, `responses` |
| Calcul | scoring, résultat, synthèse | `scoring`, `results`, `ai` |
| Recommandation | ranking métiers, feedback loop | `recommendations`, `careers`, `analytics` |
| Contenus | ressources, établissements, formations, bourses | `resources`, `universities`, `careers` |
| Pilotage | dashboard, CRUD admin transverse | `backoffice`, `analytics`, tous modules métier |

## 12. Cas de figure (nominal + alternatifs)
### 12.1 Nominal
1. Utilisateur se connecte.
2. Crée session + assessment initial.
3. Répond aux questions (phase 1 puis phase 2).
4. Reçoit résultat RIASEC et recommandations.
5. Fournit feedback et poursuit exploration.

### 12.2 Alternatifs/erreurs
1. `JWT absent/invalide` → `401 Unauthorized`.
2. `Rôle insuffisant` → `403 Forbidden`.
3. `Session introuvable/expirée` → `404/400`.
4. `Assessment non actif` pour soumission → `400`.
5. `Transition de phase invalide` (phase 2 avant phase 1) → `400`.
6. `Payload invalide` (validation pipe) → `400`.
7. `Throttle dépassé` → `429`.
8. `Ressource métier inexistante` → `404`.

### 12.3 Cas back-office
1. Supervision état global et période (`from/to`).
2. Détection déséquilibre pipeline (beaucoup `IN_PROGRESS`, peu `COMPLETED`).
3. Audit qualité contenu (`active/inactive`, `published/draft`).
4. Correction rapide via CRUD centralisé.

## 13. KPIs recommandés pour exploitation
- Taux de complétion assessment: `COMPLETED / total`.
- Taux d'abandon: `ABANDONED / total`.
- Temps médian par question et par batch.
- Distribution profils RIASEC dominants.
- Taux de consultation recommandations.
- Taux `savedForLater` sur recommandations.
- Taux publication contenus (`published/draft`).
- Cohérence profil moyenne (`consistencyScore`).

## 14. Limites actuelles et améliorations possibles
1. Ajouter diagrammes BPMN détaillés par rôle back-office.
2. Ajouter diagramme C4 niveau 1/2/3.
3. Ajouter traçabilité explicite endpoint -> règles métier -> tests.
4. Ajouter diagrammes de séquence pour refresh token, reset password, social login.
5. Ajouter catalogue événements asynchrones (email, IA, notifications).

## 15. Conclusion
La plateforme implémente une architecture modulaire robuste avec un noyau d'orientation RIASEC, un pipeline adaptatif, un écosystème de contenu et un back-office transversal. Les diagrammes ci-dessus couvrent les cas d'usage métier et techniques majeurs, et servent de base pour industrialiser design, QA, sécurité et roadmap produit.
