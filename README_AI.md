# README IA — Integration GPT-4o (Session-Only)

Ce document explique comment integrer l'IA dans l'API d'orientation RIASEC en utilisant le modele GPT-4o.

## Objectif

Ajouter une couche IA pour:

- Expliquer le profil RIASEC en langage naturel.
- Proposer un coach d'orientation (conseils et prochaines etapes).
- Resumer les resultats et recommandations.

**Contrainte stricte :** aucune PII, aucun utilisateur, uniquement des donnees de session.

## Pourquoi GPT-4o

- Modele polyvalent et performant pour la plupart des taches.
- Supporte les endpoints `v1/responses` et `v1/chat/completions`.
- Accepte texte et images en entree, texte en sortie.

## Cas d'usage cibles

- Explication personnalisee du profil (phase1/phase2, forces, coherence, differenciation).
- Synthese des recommandations metiers (top 5, raisons du match).
- Coach d'action (2-3 prochaines actions concretes).

## Architecture proposee

Creer un module IA dedie, independant et facilement remplaçable:

- `AiModule`
- `AiService` (orchestration metier)
- `AiClient` (abstraction fournisseur)
- `prompts/` (prompts versionnes)

### Structure suggeree

- `src/modules/ai/ai.module.ts`
- `src/modules/ai/ai.service.ts`
- `src/modules/ai/ai.client.ts`
- `src/modules/ai/prompts/`

## Flux d'integration

1. Recuperer les donnees du parcours (session, resultats, recommandations).
2. Construire un contexte minimal (pas de PII).
3. Appeler GPT-4o.
4. Valider la reponse (texte ou JSON structure).
5. Sauvegarder ou renvoyer la reponse via l'API.

## Configuration (.env)

Ajouter:

- `OPENAI_API_KEY=...`
- `OPENAI_MODEL=gpt-4o`
- `OPENAI_BASE_URL=https://api.openai.com` (optionnel)
- `OPENAI_TIMEOUT_MS=15000` (optionnel)
- `OPENAI_TEMPERATURE=0.3` (optionnel)

## Exemple d'appel API (Responses)

Recommande par OpenAI pour les integrations modernes.

```bash
curl https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "instructions": "Tu es un conseiller d\'orientation RIASEC. Reponds en francais, clair et actionnable.",
    "input": "Voici les resultats: phase1=RIA, phase2=RIA, forces=R,I, coherence=forte. Donne un resume en 5 lignes."
  }'
```

## Sortie structuree (JSON schema)

Pour des reponses fiables, demander un JSON valide:

```json
{
  "model": "gpt-4o",
  "instructions": "Tu es un conseiller d'orientation. Retourne un JSON valide.",
  "input": "Resume le profil et donne 3 actions.",
  "text": {
    "format": {
      "type": "json_schema",
      "json_schema": {
        "name": "riasec_summary",
        "schema": {
          "type": "object",
          "properties": {
            "summary": {
              "type": "string"
            },
            "strengths": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "actions": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          "required": [
            "summary",
            "strengths",
            "actions"
          ]
        }
      }
    }
  }
}
```

## AiService (exemple de responsabilites)

- Valider les donnees d'entree (resultats existants).
- Charger un prompt versionne.
- Construire un payload minimal.
- Appeler `AiClient`.
- Normaliser la reponse.

## AiClient (abstraction fournisseur)

- Encapsuler l'appel HTTP vers OpenAI.
- Gerer les timeouts et retries.
- Centraliser les logs IA (sans PII).

## Bonnes pratiques

- Ne jamais envoyer d'information personnelle inutile.
- Controler la temperature (0.2-0.4 pour des sorties stables).
- Versionner les prompts pour pouvoir comparer les resultats.
- Ajouter des tests de forme (ex: JSON schema valide).

## Points d'integration dans l'API

- `ResultsService` pour generer le contexte IA.
- `RecommendationsService` pour enrichir les explications.
- Nouveau endpoint: `POST /ai/summary`.

## Etapes de mise en place

1. Ajouter les fichiers du module IA.
2. Ajouter les variables `.env`.
3. Brancher `AiService` dans les services metier.
4. Ajouter les DTO et endpoints.
5. Ajouter un test e2e simple.

---

# Système de Test Adaptatif Multi-Profils

Cette section documente le **système adaptatif** implémenté pour améliorer la qualité et la précision du test RIASEC.

## Vue d'ensemble

Le système adaptatif transforme le test RIASEC traditionnel en une expérience personnalisée et intelligente :

- **Organisation en lots (batches)** : Les questions sont présentées par groupes dynamiques
- **Sélection adaptative** : Chaque lot est choisi en fonction des réponses précédentes
- **Questions multi-profils** : Une question peut contribuer à plusieurs profils RIASEC simultanément
- **Analyse comportementale** : Détection d'hésitation, doute, changements de réponses
- **Intervention IA** : Analyse en temps réel pour affiner la sélection et enrichir le rapport

## Architecture technique

### 1. Modèles de données

#### QuestionProfile
Permet aux questions d'avoir plusieurs profils RIASEC avec des poids différents :

```prisma
model QuestionProfile {
  id          Int         @id @default(autoincrement())
  question_id Int
  phase       PhaseType   // PHASE1 ou PHASE2
  riasec_type RiasecType  // R, I, A, S, E, C
  weight      Float       // 0.0 à 1.0
  
  @@unique([question_id, phase, riasec_type])
}
```

**Exemple** : Question "Réparer des objets" → R:0.8, I:0.2

#### BatchHistory
Historique des lots présentés à l'utilisateur :

```prisma
model BatchHistory {
  id            String   @id @default(uuid())
  assessment_id String
  batch_index   Int      // 0, 1, 2...
  phase_type    PhaseType
  question_ids  Int[]    // IDs des questions du lot
  presented_at  DateTime @default(now())
  completed_at  DateTime?
}
```

#### IntermediateProfile
Profils intermédiaires calculés après chaque lot :

```prisma
model IntermediateProfile {
  id            String   @id @default(uuid())
  assessment_id String
  batch_index   Int
  profile_data  Json     // { R: 0.3, I: 0.2, A: 0.15, ... }
  calculated_at DateTime
}
```

#### BehavioralIndicator
Indices comportementaux détectés en temps réel :

```prisma
model BehavioralIndicator {
  id            String   @id @default(uuid())
  assessment_id String
  response_id   String
  indicator_type String  // 'hesitation', 'doubt', 'excitement', 'change'
  time_taken_ms Int?
  change_count  Int      @default(0)
  metadata      Json?
  detected_at   DateTime
}
```

### 2. Services

#### AdaptiveSelectionService
Sélection intelligente des questions basée sur le profil intermédiaire :

- `selectNextBatch()` : Sélectionne le prochain lot de questions
- `calculateIntermediateProfile()` : Calcule le profil après un lot
- `getMultiProfileQuestions()` : Récupère les questions avec leurs poids multi-profils

**Stratégie de sélection** :
1. Exclure les questions déjà posées
2. Calculer un score de pertinence pour chaque question restante
3. Équilibrer diversité (couvrir tous les profils) et spécificité (approfondir les profils dominants)
4. Normaliser les scores et sélectionner le top N

#### BehavioralAnalysisService
Analyse comportementale en temps réel :

- `analyzeResponse()` : Détecte les patterns comportementaux
- `detectHesitation()` : Temps > 15s ou > 2× moyenne
- `detectDoubt()` : Changements >= 2
- `detectExcitement()` : Réponse rapide (<2s) sans changements
- `generateBehavioralInsights()` : Génère des insights psychologiques

**Seuils comportementaux** :
- Hésitation : > 15 secondes ou > 2× temps moyen
- Doute : >= 2 changements de réponse
- Excitation : < 2 secondes sans changement

#### BatchManagementService
Gestion du cycle de vie des lots :

- `startNewBatch()` : Démarre un nouveau lot
- `completeBatch()` : Marque un lot comme complété
- `getCurrentBatch()` : Récupère le lot en cours
- `getBatchProgress()` : Calcule la progression

#### AIAdaptiveService
Intervention IA pour améliorer la sélection et l'analyse :

- `analyzeIntermediateProfile()` : Analyse IA du profil intermédiaire
- `suggestNextQuestions()` : Suggestions IA pour le prochain lot
- `generateBehavioralInsights()` : Insights psychologiques enrichis
- `enrichFinalReport()` : Enrichissement du rapport final

#### EnhancedResultsService
Génération de rapports enrichis avec observations comportementales :

- `generateEnhancedReport()` : Rapport complet avec IA
- `formatBehavioralObservations()` : Formatage des observations
- `generateRecommendations()` : Recommandations personnalisées

### 3. Flux adaptatif

```
1. Démarrer le test → Assessment créé avec batch_size (défaut: 5)
   ↓
2. Sélection du lot initial → Questions variées couvrant tous les profils
   ↓
3. Utilisateur répond → Capture de time_taken_ms, change_count
   ↓
4. Analyse comportementale → Détection automatique d'hésitation/doute
   ↓
5. Calcul profil intermédiaire → Scores multi-profils normalisés
   ↓
6. Sélection lot suivant → Basée sur profil + comportement + diversité
   ↓
7. Répéter 3-6 jusqu'à quota de questions atteint
   ↓
8. Rapport final enrichi → Résultats + observations + recommandations IA
```

### 4. API Endpoints

#### GET /questions/next-batch
Récupère le prochain lot de questions adaptatif :

**Query params** :
- `assessmentId` (required)
- `batchSize` (optional, default: 5)
- `lang` (optional, default: 'fr')

**Response** :
```json
{
  "batchIndex": 0,
  "questions": [...],
  "totalBatches": 6,
  "progress": 0,
  "intermediateProfile": { R: 0, I: 0, ... }
}
```

#### POST /responses/batch
Soumet les réponses d'un lot complet :

**Body** :
```json
{
  "assessmentId": "uuid",
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

#### GET /responses/behavioral/:assessmentId
Récupère l'analyse comportementale :

**Response** :
```json
{
  "indicators": [
    {
      "type": "hesitation",
      "count": 3,
      "avgTime": 18500
    }
  ],
  "insights": ["L'utilisateur a montré de l'hésitation sur les questions sociales..."]
}
```

#### GET /results/enhanced/:assessmentId
Récupère le rapport enrichi avec IA :

**Response** :
```json
{
  "riasecProfile": { R: 25, I: 20, ... },
  "behavioralAnalysis": {
    "hesitationRate": 0.15,
    "doubtRate": 0.08,
    "insights": [...]
  },
  "aiSummary": "Votre profil dominant est Réaliste...",
  "recommendations": [...]
}
```

## Configuration

### Variables d'environnement

Aucune variable supplémentaire nécessaire. Le système utilise la configuration existante.

### Seed data

Les questions multi-profils sont configurées dans `src/common/seeders/assessment/QuestionProfileSeeder.ts` :

```typescript
// Exemple de question avec 2 profils
{ 
  questionId: 3, 
  phase: PhaseType.PHASE1, 
  profiles: [
    { riasecType: RiasecType.R, weight: 0.7 },
    { riasecType: RiasecType.I, weight: 0.3 }
  ]
}
```

**Lancer le seed** :
```bash
npm run seed
```

## Utilisation

### Workflow client

1. **Démarrer le test** : `POST /sessions` → obtenir `assessmentId`
2. **Récupérer lot initial** : `GET /questions/next-batch?assessmentId=xxx`
3. **Soumettre réponses** : `POST /responses/batch` avec `timeTakenMs` et `changeCount`
4. **Récupérer lot suivant** : `GET /questions/next-batch?assessmentId=xxx`
5. **Répéter 3-4** jusqu'à `progress === 100`
6. **Obtenir rapport final** : `GET /results/enhanced/:assessmentId`

### Tracking comportemental

Le frontend doit capturer :
- **timeTakenMs** : Temps entre affichage et soumission de la réponse
- **changeCount** : Nombre de fois que l'utilisateur a modifié sa réponse

**Exemple JavaScript** :
```javascript
let startTime = Date.now();
let changeCount = 0;

// Quand l'utilisateur change sa réponse
onChange(() => changeCount++);

// À la soumission
const timeTakenMs = Date.now() - startTime;
submitResponse({ timeTakenMs, changeCount });
```

## Principes SOLID appliqués

- **Single Responsibility** : Chaque service a une responsabilité unique
- **Open/Closed** : Extensions via nouveaux services, pas de modifications destructrices
- **Liskov Substitution** : Services testables indépendamment
- **Interface Segregation** : DTOs spécifiques par use case
- **Dependency Inversion** : Dépendances sur abstractions (PrismaService, AIService)

## Bénéfices du système adaptatif

1. **Précision améliorée** : Questions ciblées selon le profil émergent
2. **Expérience personnalisée** : Chaque utilisateur a un parcours unique
3. **Détection précoce** : Identification des profils dominants rapidement
4. **Insights psychologiques** : Observations comportementales enrichissent le rapport
5. **Réduction de durée** : Questions multi-profils réduisent le nombre total
6. **Engagement utilisateur** : Test plus dynamique et moins monotone

## Migration depuis système classique

Le système est **rétrocompatible** :
- Si aucun `QuestionProfile` n'existe, fallback sur `riasec_type_id` unique
- Les endpoints classiques restent fonctionnels
- Les tests existants continuent de fonctionner

## Performance

- **Indexation** : Contraintes uniques sur `QuestionProfile`, `BatchHistory`, `IntermediateProfile`
- **Batch operations** : Insertion groupée des réponses
- **Cache** : Possibilité d'ajouter Redis pour profils intermédiaires (optionnel)

## Tests

### Tests unitaires
```bash
npm run test -- src/modules/questions/services/adaptive-selection.service.spec.ts
npm run test -- src/modules/responses/services/behavioral-analysis.service.spec.ts
```

### Tests E2E
```bash
npm run test:e2e -- test/adaptive-flow.e2e-spec.ts
```

## Troubleshooting

**Q: Les questions multi-profils ne sont pas utilisées**
R: Vérifier que `npm run seed` a été exécuté et que `QuestionProfile` contient des données

**Q: Le profil intermédiaire est toujours vide**
R: S'assurer que `submitBatchResponses` est appelé avec toutes les réponses du lot

**Q: L'analyse comportementale ne détecte rien**
R: Vérifier que `timeTakenMs` et `changeCount` sont envoyés dans les réponses

**Q: L'IA ne répond pas**
R: Vérifier `OPENAI_API_KEY` dans `.env` et que le service IA est actif
