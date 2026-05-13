# Guide Développeur : Système de Test Adaptatif

Ce document fournit un guide détaillé pour les développeurs travaillant sur le système de test adaptatif RIASEC.

## Table des matières

1. [Architecture](#architecture)
2. [Modèles de données](#modèles-de-données)
3. [Services](#services)
4. [Utilitaires](#utilitaires)
5. [API](#api)
6. [Configuration](#configuration)
7. [Développement](#développement)
8. [Tests](#tests)

---

## Architecture

### Vue d'ensemble

```
┌────────────────────────────────────────────────────────────────┐
│                         Client (Frontend)                      │
│  • Capture timeTakenMs, changeCount                            │
│  • Appels GET /next-batch → POST /batch (répété)               │
└───────────────────────┬────────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────────────┐
│                     Controllers Layer                          │
│  • QuestionsController → getNextBatch()                        │
│  • ResponsesController → submitBatch()                         │
│  • ResultsController → getEnhanced()                           │
└───────────────────────┬────────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────────────┐
│                      Services Layer                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ QuestionsService                                        │   │
│  │  → getNextBatchQuestions()                              │   │
│  │     ├─ AdaptiveSelectionService.selectNextBatch()       │   │
│  │     └─ BatchManagementService.startNewBatch()           │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ResponsesService                                        │   │
│  │  → submitBatchResponses()                               │   │
│  │     ├─ BehavioralAnalysisService.analyzeResponse()      │   │
│  │     ├─ BatchManagementService.completeBatch()           │   │
│  │     └─ AdaptiveSelectionService.calculateIntermediate() │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ResultsService                                          │   │
│  │  → computeEnhancedResult()                              │   │
│  │     ├─ EnhancedResultsService.generateReport()          │   │
│  │     ├─ AIAdaptiveService.enrichFinalReport()            │   │
│  │     └─ BehavioralAnalysisService.generateInsights()     │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────────┬────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL)                        │
│  • QuestionProfile (multi-profil weights)                       │
│  • BatchHistory (lots présentés)                                │
│  • IntermediateProfile (profils intermédiaires)                 │
│  • BehavioralIndicator (indices comportementaux)                │
└─────────────────────────────────────────────────────────────────┘
```

### Principes de conception

1. **Separation of Concerns** : Chaque service a une responsabilité unique
2. **Dependency Injection** : Tous les services utilisent l'injection NestJS
3. **Single Source of Truth** : PrismaService pour toutes les opérations DB
4. **Fail-Safe Design** : Fallback sur RIASEC classique si multi-profils indisponible
5. **Extensibilité** : Nouveaux services peuvent être ajoutés sans modifier l'existant

---

## Modèles de données

### QuestionProfile

**Responsabilité** : Mapper les questions à plusieurs profils RIASEC avec des poids

```prisma
model QuestionProfile {
  id          Int         @id @default(autoincrement())
  question_id Int
  phase       PhaseType   // PHASE1 | PHASE2
  riasec_type RiasecType  // R | I | A | S | E | C
  weight      Float       // 0.0 - 1.0

  created_at  DateTime    @default(now())
  updated_at  DateTime    @updatedAt

  @@unique([question_id, phase, riasec_type])
  @@map("question_profiles")
}
```

**Exemples d'utilisation** :

```typescript
// Question technique pure
{ question_id: 1, phase: PHASE1, riasec_type: R, weight: 1.0 }

// Question hybride (technique + analytique)
{ question_id: 5, phase: PHASE1, riasec_type: R, weight: 0.7 }
{ question_id: 5, phase: PHASE1, riasec_type: I, weight: 0.3 }

// Question transversale (3 profils)
{ question_id: 10, phase: PHASE1, riasec_type: S, weight: 0.5 }
{ question_id: 10, phase: PHASE1, riasec_type: E, weight: 0.3 }
{ question_id: 10, phase: PHASE1, riasec_type: A, weight: 0.2 }
```

**Contraintes** :

- La somme des poids pour une question donnée devrait idéalement = 1.0 (mais non forcé)
- Unique constraint empêche les doublons

### BatchHistory

**Responsabilité** : Historique des lots présentés à l'utilisateur

```prisma
model BatchHistory {
  id            String      @id @default(uuid())
  assessment_id String
  assessment    Assessment  @relation(...)
  batch_index   Int         // 0, 1, 2, 3...
  phase_type    PhaseType
  question_ids  Int[]       // [1, 5, 10, 15, 20]
  presented_at  DateTime    @default(now())
  completed_at  DateTime?   // null tant que non complété

  @@unique([assessment_id, batch_index])
  @@map("batch_history")
}
```

**Workflow** :

1. `startNewBatch()` → créé avec `completed_at = null`
2. Utilisateur répond → réponses enregistrées
3. `completeBatch()` → `completed_at` mis à jour

### IntermediateProfile

**Responsabilité** : Stocker les profils RIASEC calculés après chaque lot

```prisma
model IntermediateProfile {
  id            String      @id @default(uuid())
  assessment_id String
  assessment    Assessment  @relation(...)
  batch_index   Int
  profile_data  Json        // { R: 0.25, I: 0.20, A: 0.15, ... }
  calculated_at DateTime    @default(now())

  @@unique([assessment_id, batch_index])
  @@map("intermediate_profiles")
}
```

**Format profile_data** :

```json
{
  "R": 0.25,
  "I": 0.2,
  "A": 0.15,
  "S": 0.15,
  "E": 0.13,
  "C": 0.12
}
```

**Normalisé** : La somme = 1.0 (100%)

### BehavioralIndicator

**Responsabilité** : Capturer les indices comportementaux en temps réel

```prisma
model BehavioralIndicator {
  id             String      @id @default(uuid())
  assessment_id  String
  assessment     Assessment  @relation(...)
  response_id    String      // ID de Phase1Response ou Phase2Response
  indicator_type String      // 'hesitation' | 'doubt' | 'excitement' | 'consistent'
  time_taken_ms  Int?
  change_count   Int         @default(0)
  metadata       Json?       // Données supplémentaires
  detected_at    DateTime    @default(now())

  @@map("behavioral_indicators")
}
```

**Types d'indicateurs** :

- **hesitation** : `time_taken_ms > 15000` ou `> 2 × avgTime`
- **doubt** : `change_count >= 2`
- **excitement** : `time_taken_ms < 2000 && change_count == 0`
- **consistent** : `change_count == 0 && time normal`

---

## Services

### AdaptiveSelectionService

**Localisation** : `src/modules/questions/services/adaptive-selection.service.ts`

**Responsabilité** : Sélection intelligente des questions basée sur profils intermédiaires

#### Méthodes principales

```typescript
async selectNextBatch(
  assessmentId: string,
  batchSize: number,
  phaseType: PhaseType
): Promise<number[]>
```

- Récupère le profil intermédiaire actuel
- Exclut les questions déjà posées
- Calcule un score de pertinence pour chaque question
- Sélectionne le top N questions

**Algorithme de scoring** :

```
score(question) = diversityWeight × diversityScore + profileWeight × relevanceScore

où:
- diversityScore = 1 si profil sous-représenté, 0 sinon
- relevanceScore = distance entre profil question et profil utilisateur
- diversityWeight = 0.6 (favorise la couverture)
- profileWeight = 0.4 (favorise la spécificité)
```

```typescript
async calculateIntermediateProfile(
  assessmentId: string,
  batchIndex: number
): Promise<RiasecProfile>
```

- Récupère toutes les réponses jusqu'au batch actuel
- Applique les poids multi-profils
- Normalise les scores (somme = 1.0)
- Sauvegarde dans `IntermediateProfile`

```typescript
async getMultiProfileQuestions(
  testVersionId: string,
  phaseType: PhaseType,
  excludedIds: number[]
): Promise<QuestionWithProfiles[]>
```

- Charge les questions avec leurs profils associés
- Exclut les questions déjà posées
- Fallback sur `riasec_type_id` si pas de profils

#### Utilitaires utilisés

- `normalizeScores()` : Normalisation des scores RIASEC
- `scoreQuestionRelevance()` : Calcul de pertinence
- `selectTopQuestions()` : Sélection des top N

### BehavioralAnalysisService

**Localisation** : `src/modules/responses/services/behavioral-analysis.service.ts`

**Responsabilité** : Analyse comportementale en temps réel

#### Méthodes principales

```typescript
async analyzeResponse(responseData: {
  assessmentId: string;
  responseId: string;
  timeTakenMs?: number;
  changeCount?: number;
}): Promise<void>
```

- Détecte les patterns comportementaux
- Enregistre les indicateurs dans la DB
- Calcule les moyennes pour comparaison

**Patterns détectés** :

```typescript
if (timeTakenMs > HESITATION_THRESHOLD_MS) → 'hesitation'
if (changeCount >= DOUBT_CHANGE_THRESHOLD) → 'doubt'
if (timeTakenMs < 2000 && changeCount === 0) → 'excitement'
if (changeCount === 0 && temps normal) → 'consistent'
```

```typescript
async generateBehavioralInsights(
  assessmentId: string
): Promise<string[]>
```

- Agrège tous les indicateurs
- Génère des insights textuels
- Utilise des seuils statistiques

**Exemple d'insights** :

```
"L'utilisateur a montré de l'hésitation sur 15% des questions, particulièrement sur les questions sociales"
"Très peu de changements de réponses (3%), indiquant une forte confiance"
```

### BatchManagementService

**Localisation** : `src/modules/sessions/services/batch-management.service.ts`

**Responsabilité** : Gestion du cycle de vie des lots

#### Méthodes principales

```typescript
async startNewBatch(
  assessmentId: string,
  questionIds: number[],
  phaseType: PhaseType
): Promise<BatchHistory>
```

```typescript
async completeBatch(
  assessmentId: string,
  batchIndex: number
): Promise<void>
```

```typescript
async getBatchProgress(
  assessmentId: string,
  totalQuestions: number
): Promise<number>
```

- Calcule le pourcentage de progression
- Basé sur `(batchIndex + 1) × batchSize / totalQuestions`

### AIAdaptiveService

**Localisation** : `src/modules/ai/services/ai-adaptive.service.ts`

**Responsabilité** : Intervention IA pour améliorer sélection et analyse

#### Méthodes principales

```typescript
async analyzeIntermediateProfile(
  profile: RiasecProfile,
  responses: Response[]
): Promise<AIProfileAnalysis>
```

- Envoie le profil intermédiaire à l'IA
- Obtient une analyse enrichie
- Fallback si IA indisponible

```typescript
async suggestNextQuestions(
  profile: RiasecProfile,
  availableQuestions: Question[]
): Promise<number[]>
```

- Demande à l'IA de suggérer les meilleures questions
- Combine avec algorithme local si échec

```typescript
async generateBehavioralInsights(
  indicators: BehavioralIndicator[]
): Promise<string[]>
```

- Analyse psychologique des comportements
- Génère des insights personnalisés

### EnhancedResultsService

**Localisation** : `src/modules/results/services/enhanced-results.service.ts`

**Responsabilité** : Génération de rapports enrichis

#### Méthodes principales

```typescript
async generateEnhancedReport(
  assessmentId: string
): Promise<EnhancedReportDto>
```

- Agrège profil RIASEC, comportements, IA
- Formate en rapport structuré
- Inclut recommandations personnalisées

**Structure du rapport** :

```typescript
{
  riasecProfile: { R: 25, I: 20, ... },
  behavioralAnalysis: {
    hesitationRate: 0.15,
    doubtRate: 0.08,
    insights: [...]
  },
  aiSummary: "Votre profil...",
  recommendations: [...],
  intermediateProfiles: [...]
}
```

---

## Utilitaires

### multi-profile.util.ts

**Localisation** : `src/common/utils/multi-profile.util.ts`

#### Fonctions clés

```typescript
applyWeightedResponse(
  profile: RiasecScores,
  riasecType: RiasecType,
  weight: number,
  responseValue: number
): void
```

- Applique un poids à une réponse
- Met à jour le profil en place

```typescript
normalizeScores(scores: RiasecScores): RiasecProfile
```

- Normalise les scores bruts
- Convertit en pourcentages (somme = 1.0)

```typescript
calculateProfileDistance(
  profile1: RiasecProfile,
  profile2: RiasecProfile
): number
```

- Distance euclidienne entre deux profils
- Utilisé pour mesurer la stabilité

### behavioral.util.ts

**Localisation** : `src/common/utils/behavioral.util.ts`

#### Fonctions clés

```typescript
analyzeResponse(responseData: {
  timeTakenMs?: number;
  changeCount?: number;
  avgTimeTaken?: number;
}): BehavioralPattern[]
```

- Détecte les patterns comportementaux
- Retourne liste de patterns détectés

```typescript
detectHesitation(timeTaken: number, avgTime?: number): boolean
```

```typescript
detectDoubt(changeCount: number): boolean
```

```typescript
generateBehavioralInsights(
  indicators: BehavioralIndicator[]
): string[]
```

### adaptive.util.ts

**Localisation** : `src/common/utils/adaptive.util.ts`

#### Fonctions clés

```typescript
selectTopQuestions(
  questions: QuestionWithScore[],
  count: number
): number[]
```

- Trie par score décroissant
- Sélectionne le top N

```typescript
calculateQuestionScore(
  question: QuestionWithProfiles,
  profile: RiasecProfile,
  coverage: RiasecScores
): number
```

- Calcule le score de pertinence
- Combine diversité + spécificité

```typescript
analyzeProfileStability(
  profiles: IntermediateProfile[]
): number
```

- Mesure la stabilité du profil
- Retourne un score 0-1 (1 = très stable)

---

## API

### Endpoints

#### GET /questions/next-batch

**Description** : Récupère le prochain lot de questions adaptatif

**Query Parameters** :

- `assessmentId` (required) : ID de l'assessment
- `batchSize` (optional, default: 5) : Taille du lot
- `lang` (optional, default: 'fr') : Langue des questions

**Response** :

```json
{
  "batchIndex": 0,
  "questions": [
    {
      "id": 123,
      "question_text": "Réparer des objets",
      "phase": "PHASE1",
      "profiles": [
        { "riasec_type": "R", "weight": 0.8 },
        { "riasec_type": "I", "weight": 0.2 }
      ]
    }
  ],
  "totalBatches": 6,
  "progress": 0,
  "intermediateProfile": {
    "R": 0.25,
    "I": 0.2,
    "A": 0.15,
    "S": 0.15,
    "E": 0.13,
    "C": 0.12
  }
}
```

**Codes d'erreur** :

- `404` : Assessment non trouvé
- `400` : Assessment déjà complété

#### POST /responses/batch

**Description** : Soumet les réponses d'un lot complet

**Body** :

```json
{
  "assessmentId": "uuid-xxx",
  "batchIndex": 0,
  "responses": [
    {
      "questionId": 123,
      "responseValue": 4,
      "timeTakenMs": 5400,
      "changeCount": 1
    }
  ]
}
```

**Response** :

```json
{
  "success": true,
  "batchIndex": 0,
  "intermediateProfile": {
    "R": 0.28,
    "I": 0.22,
    "A": 0.14,
    "S": 0.14,
    "E": 0.12,
    "C": 0.1
  },
  "behaviorsDetected": ["hesitation", "consistent"]
}
```

**Logique** :

1. Valide que toutes les questions du lot ont une réponse
2. Enregistre chaque réponse avec métadonnées
3. Déclenche analyse comportementale
4. Calcule profil intermédiaire
5. Marque le lot comme complété

#### GET /responses/behavioral/:assessmentId

**Description** : Récupère l'analyse comportementale

**Response** :

```json
{
  "indicators": [
    {
      "type": "hesitation",
      "count": 5,
      "avgTime": 18500
    },
    {
      "type": "doubt",
      "count": 2,
      "avgTime": null
    }
  ],
  "metrics": {
    "hesitationRate": 0.15,
    "doubtRate": 0.08,
    "avgResponseTime": 6500
  },
  "insights": [
    "L'utilisateur a montré de l'hésitation sur 15% des questions",
    "Très peu de changements de réponses, indiquant une forte confiance"
  ]
}
```

#### GET /results/enhanced/:assessmentId

**Description** : Récupère le rapport enrichi final

**Response** : Voir `EnhancedReportDto` (structure complète)

---

## Configuration

### Variables d'environnement

Le système adaptatif réutilise les variables existantes. Aucune nouvelle configuration nécessaire.

**Variables utilisées** :

- `DATABASE_URL` : Connexion PostgreSQL
- `OPENAI_API_KEY` : Pour AIAdaptiveService
- `OPENAI_MODEL` : Modèle IA (default: gpt-4o)

### Seed data

**Fichier** : `src/common/seeders/assessment/QuestionProfileSeeder.ts`

**Exécution** :

```bash
npm run seed
```

**Configuration** :
Modifier `PHASE1_MULTI_PROFILES` et `PHASE2_MULTI_PROFILES` pour ajuster les poids.

**Exemple** :

```typescript
{
  questionId: 5,
  phase: PhaseType.PHASE1,
  profiles: [
    { riasecType: RiasecType.R, weight: 0.7 },
    { riasecType: RiasecType.I, weight: 0.3 }
  ]
}
```

### Paramètres par défaut

**Seuils comportementaux** (`behavioral.util.ts`) :

```typescript
export const HESITATION_THRESHOLD_MS = 15000; // 15 secondes
export const DOUBT_CHANGE_THRESHOLD = 2; // 2 changements
export const EXCITEMENT_THRESHOLD_MS = 2000; // 2 secondes
```

**Poids de sélection** (`adaptive.util.ts`) :

```typescript
const DIVERSITY_WEIGHT = 0.6; // Favorise la couverture
const PROFILE_WEIGHT = 0.4; // Favorise la spécificité
```

---

## Développement

### Ajouter une nouvelle question multi-profils

1. Identifier la question existante (ID)
2. Éditer `src/common/seeders/assessment/QuestionProfileSeeder.ts`
3. Ajouter l'entrée :
   ```typescript
   {
     questionId: 42,
     phase: PhaseType.PHASE1,
     profiles: [
       { riasecType: RiasecType.A, weight: 0.6 },
       { riasecType: RiasecType.S, weight: 0.4 }
     ]
   }
   ```
4. Lancer `npm run seed`

### Ajouter un nouvel indicateur comportemental

1. Éditer `behavioral.util.ts`
2. Ajouter une fonction de détection :
   ```typescript
   export function detectMyNewPattern(data): boolean {
     // logique
   }
   ```
3. Mettre à jour `analyzeResponse()` pour appeler la nouvelle fonction
4. Ajouter le type dans `BehavioralIndicatorDto`

### Modifier l'algorithme de sélection

1. Éditer `adaptive.util.ts` → `calculateQuestionScore()`
2. Ajuster les poids `DIVERSITY_WEIGHT` / `PROFILE_WEIGHT`
3. Tester avec différents profils

### Étendre le rapport enrichi

1. Éditer `EnhancedReportDto` pour ajouter champs
2. Modifier `EnhancedResultsService.generateEnhancedReport()`
3. Mettre à jour Swagger annotations

---

## Tests

### Tests unitaires

**AdaptiveSelectionService** :

```bash
npm run test -- src/modules/questions/services/adaptive-selection.service.spec.ts
```

**BehavioralAnalysisService** :

```bash
npm run test -- src/modules/responses/services/behavioral-analysis.service.spec.ts
```

**Utilitaires** :

```bash
npm run test -- src/common/utils/multi-profile.util.spec.ts
npm run test -- src/common/utils/behavioral.util.spec.ts
npm run test -- src/common/utils/adaptive.util.spec.ts
```

### Tests E2E

**Flux complet adaptatif** :

```bash
npm run test:e2e -- test/adaptive-flow.e2e-spec.ts
```

**Scénario** :

1. Créer une session
2. Récupérer le lot initial
3. Soumettre réponses avec métadonnées
4. Récupérer lot suivant
5. Vérifier profil intermédiaire
6. Compléter le test
7. Récupérer rapport enrichi

### Tests manuels

**Via Swagger** :

1. Démarrer l'API : `npm run start:dev`
2. Ouvrir `http://localhost:3000/api`
3. Tester les endpoints dans l'ordre :
   - POST `/sessions` → créer assessment
   - GET `/questions/next-batch?assessmentId=xxx`
   - POST `/responses/batch`
   - GET `/results/enhanced/:assessmentId`

**Via REST Client** :
Voir `request.http` pour des exemples de requêtes

---

## Troubleshooting

### Questions multi-profils non utilisées

**Symptôme** : Le système sélectionne toujours des questions avec un seul profil

**Solutions** :

1. Vérifier que `npm run seed` a été exécuté
2. Vérifier la table `question_profiles` :
   ```sql
   SELECT * FROM question_profiles WHERE phase = 'PHASE1';
   ```
3. S'assurer que les `question_id` correspondent aux questions existantes

### Profil intermédiaire toujours vide

**Symptôme** : `intermediateProfile` est `{ R: 0, I: 0, ... }`

**Solutions** :

1. Vérifier que `submitBatchResponses` est appelé avec **toutes** les réponses du lot
2. Vérifier que `responseValue` est un nombre valide (1-5)
3. Check logs : `AdaptiveSelectionService.calculateIntermediateProfile()`

### Analyse comportementale ne détecte rien

**Symptôme** : `behaviorsDetected` est toujours `[]`

**Solutions** :

1. S'assurer que `timeTakenMs` et `changeCount` sont envoyés dans le body
2. Vérifier les seuils dans `behavioral.util.ts`
3. Check table `behavioral_indicators` :
   ```sql
   SELECT * FROM behavioral_indicators WHERE assessment_id = 'xxx';
   ```

### IA ne répond pas

**Symptôme** : `aiSummary` est vide ou générique

**Solutions** :

1. Vérifier `OPENAI_API_KEY` dans `.env`
2. Vérifier les logs du service IA
3. Tester avec `AIAdaptiveService` directement
4. Fallback activé : système fonctionne sans IA

---

## Glossaire

- **Batch** : Lot de questions présenté à l'utilisateur
- **Multi-profil** : Question contribuant à plusieurs types RIASEC
- **Profil intermédiaire** : Profil RIASEC calculé après chaque lot
- **Indicateur comportemental** : Pattern détecté (hésitation, doute)
- **Sélection adaptative** : Choix des questions basé sur profil émergent
- **Poids** : Contribution d'une question à un profil (0.0 - 1.0)
- **Normalisation** : Conversion des scores bruts en pourcentages

---

## Ressources

- [Prisma Documentation](https://www.prisma.io/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [RIASEC Model](https://en.wikipedia.org/wiki/Holland_Codes)
- [OpenAI API](https://platform.openai.com/docs)
