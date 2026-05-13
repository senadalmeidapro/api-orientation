# Audit projet — Verdict, roadmap et plan d'action

> Version du diagnostic: 2026-04-20

## 1) Verdict exécutif

Le projet est **fonctionnel en compilation** mais **non prêt pour une livraison fiable** tant que la qualité CI n'est pas remise au vert.

### Résumé des signaux mesurés

| Domaine          | Statut | Constat                                                          |
| ---------------- | ------ | ---------------------------------------------------------------- |
| Build            | ✅     | `npm run build` passe                                            |
| Lint             | ❌     | 294 erreurs, 5 warnings                                          |
| Unit tests       | ❌     | 2 suites en échec, 11 tests en échec                             |
| E2E tests        | ❌     | 1 suite en échec, 4 tests en échec                               |
| API versioning   | ⚠️     | API en `/api/v1`, mais E2E encore en routes legacy non préfixées |
| Documentation    | ⚠️     | Divergences entre README et implémentation actuelle              |
| Sécurité hygiène | ⚠️     | Tokens JWT exposés dans `request.http`                           |

## 2) Constat détaillé (ce qui bloque aujourd'hui)

### 2.1 Qualité CI / dette lint

- Erreurs dominantes:
  - `@typescript-eslint/no-unsafe-member-access` (121)
  - `@typescript-eslint/no-unsafe-assignment` (86)
  - `@typescript-eslint/no-unused-vars` (25)
  - `@typescript-eslint/require-await` (10)
- 22 erreurs de parsing lint sur fichiers `*.spec.ts` ("not found by project service"), signe d'un **décalage ESLint/tsconfig**.

### 2.2 Tests cassés

- **Unit tests**:
  - `health.controller.spec.ts` ne suit plus la signature actuelle du controller (dépendances `ConfigService` + cache).
  - `config.service.spec.ts` utilise des hypothèses d'env obsolètes (`JWT_SECRET`, etc.), alors que le code exige `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` et d'autres variables strictes.
- **E2E**:
  - Les tests appellent `/auth/login`, `/health`, etc.
  - Les controllers exposent les routes en `/api/v1/...`, d'où les 404.

### 2.3 Cohérence API / contrat

- Interceptor global de succès et filtre d'exception standardisés présents mais non activés globalement.
- Nombreuses annotations Swagger standard (`ApiStandard*`) commentées dans les controllers.
- Ceci fragilise la stabilité du contrat API pour les consommateurs front/mobile.

### 2.4 Risques runtime (Prisma naming)

- Le schéma Prisma est majoritairement en `snake_case` DB.
- Plusieurs services manipulent des propriétés camelCase côté Prisma payload (ex: recommandations/careers), ce qui augmente le risque d'accès de propriétés incohérentes selon les `select/include` et mappings.

### 2.5 Couverture de test insuffisante sur zones critiques

- 19 controllers / 36 services.
- 21 specs unitaires dans `src/`, 1 seul fichier e2e.
- 25 services sans spec co-localisée.
- 11 controllers sans spec co-localisée.

### 2.6 Sécurité et hygiene repo

- Tokens JWT détectés dans `request.http`.
- Le dossier `common/billing` est entièrement commenté (code dormant), source de confusion et dette technique.

## 3) Roadmap priorisée

## P0 — Stabiliser le socle (obligatoire avant toute feature)

1. Corriger la configuration lint type-aware (`projectService`/`tsconfig`) pour inclure correctement les specs.
2. Réparer les tests unitaires cassés (`health`, `config`).
3. Réparer les E2E pour routes `/api/v1/*`.
4. Supprimer/neutraliser les secrets exposés dans `request.http` (rotation incluse côté env).
5. Établir une baseline CI verte (lint + unit + e2e + build).

## P1 — Fiabiliser le contrat applicatif

1. Décider et appliquer le contrat de réponse global (interceptor/filter standards).
2. Réactiver/aligner les annotations Swagger standard dans les controllers.
3. Aligner README principal avec les variables d'env et routes réellement supportées.
4. Corriger les incohérences Prisma field naming sur les modules métier clés.

## P2 — Durcir la maintenabilité

1. Augmenter la couverture de test sur modules non couverts (auth, users, careers, resources, training, analytics, ai).
2. Traiter le code dormant (`billing`) via suppression propre ou réactivation complète.
3. Définir des garde-fous CI supplémentaires (ex: seuil de couverture, contrôle secrets automatisé).

## 4) Plan d'action détaillé

### Chantier A — Remise au vert CI

**Objectif:** avoir `lint`, `test`, `test:e2e`, `build` verts sur une branche propre.

1. **Lint config**
   - Ajouter une stratégie claire pour les fichiers de test (`tsconfig` dédié tests ou override ESLint).
   - Vérifier que tous les `*.spec.ts` sont résolus par TypeScript project service.
2. **Dette TypeScript ESLint**
   - Traiter en priorité les modules à forte densité d'erreurs (`ai`, `recommendations`, `results`, `sessions`, `email`, `auth`).
   - Remplacer les `any` non nécessaires par des types Prisma/Nest explicites.
   - Éliminer `async` inutiles et variables non utilisées.
3. **Validation**
   - Exécuter la séquence CI locale dans l'ordre: lint → unit → e2e → build.

**Critère de sortie:** 0 erreur lint, 0 test en échec, build OK.

---

### Chantier B — Réparer la suite de tests

**Objectif:** rétablir une suite de tests alignée avec l'API actuelle.

1. **Unit**
   - Mettre à jour `health.controller.spec.ts` pour mocker correctement les dépendances actuelles.
   - Rebaser `config.service.spec.ts` sur les variables d'env réellement requises par `ConfigService`.
2. **E2E**
   - Préfixer tous les endpoints testés en `/api/v1`.
   - Vérifier les statuts attendus (`201`, `200`, `401`, etc.) selon le comportement réel des controllers.

**Critère de sortie:** suites unitaires et e2e entièrement vertes.

---

### Chantier C — Contrat API et documentation

**Objectif:** réduire les ambiguïtés côté intégration front/mobile.

1. Activer (ou officiellement abandonner) le pattern d'enveloppe standard des réponses.
2. Uniformiser les annotations Swagger standard et corriger les exemples.
3. Mettre à jour le README racine:
   - variables env actuelles,
   - routes `/api/v1`,
   - comportement réel SMTP/Redis/cache/auth.

**Critère de sortie:** doc et code racontent la même chose.

---

### Chantier D — Cohérence data access Prisma

**Objectif:** éviter les erreurs silencieuses ou runtime dues aux champs mal adressés.

1. Audit ciblé des services `careers`, `recommendations`, `resources`, `training-centers`, `training-paths`.
2. Normaliser l'accès aux champs Prisma selon le schéma et les mappings effectifs.
3. Ajouter des tests de régression sur les chemins de lecture/écriture critiques.

**Critère de sortie:** accès champs cohérent et couvert par tests.

---

### Chantier E — Sécurité opérationnelle

**Objectif:** supprimer l'exposition de secrets et réduire le risque de fuite.

1. Retirer les tokens statiques de `request.http`.
2. Remplacer par placeholders (`{{accessToken}}`, `{{refreshToken}}`) uniquement.
3. Rotation des secrets potentiellement compromis (JWT secrets, comptes de test si nécessaires).

**Critère de sortie:** aucun secret actif versionné dans le dépôt.

## 5) Backlog exécutable (ordre recommandé)

1. Fix lint config tests (`projectService` + tsconfig tests)
2. Corriger `health.controller.spec.ts`
3. Corriger `config.service.spec.ts`
4. Corriger E2E routes vers `/api/v1`
5. Purger tokens `request.http` + rotation secrets
6. Traiter erreurs lint top modules (`ai`, `results`, `recommendations`, `sessions`, `auth`, `email`)
7. Normaliser contrat de réponse global
8. Réactiver documentation Swagger standard
9. Corriger README racine (env/routes/comportements)
10. Étendre couverture tests sur controllers/services non couverts
11. Décider du sort du module `billing` (supprimer ou finaliser)

## 6) Définition de Done globale

Le plan est considéré terminé quand:

- CI verte de bout en bout (lint + unit + e2e + build),
- aucun secret actif dans le repo,
- routes et docs alignées sur `/api/v1`,
- contrat API homogène documenté,
- risques Prisma naming couverts,
- couverture de tests renforcée sur les modules critiques.
