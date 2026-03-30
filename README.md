# API Orientation — Moteur RIASEC Session-Only

Ce projet est une API d’orientation scolaire/professionnelle basée sur le modèle RIASEC.
Elle est strictement **session-centrée** : aucun compte utilisateur, aucune PII, aucun historique global partagé.

## Principes clés

- **Session = unité d’isolation** : chaque test est autonome et identifié par `sessionToken`.
- **Aucun utilisateur** : pas d’authentification, pas d’autorisation, pas de profils.
- **Zéro PII** : aucune donnée personnelle n’est stockée.
- **Données strictement scoped à la session** : réponses, scores, résultats, IA, recommandations.

## Workflow par session

1. Création d’une session
2. Chargement des questions (phase 1 → phase 2)
3. Collecte des réponses
4. Calcul des scores RIASEC
5. Génération du résultat final
6. Recommandations métiers
7. IA (résumé, coaching)
8. Carte au trésor (PDF via `shareToken`)

## Endpoints exposés (session-only)

- `POST /sessions`
- `GET /sessions/:sessionToken`
- `GET /questions/phase1`
- `GET /questions/phase2`
- `POST /responses/phase1`
- `POST /responses/phase2`
- `POST /results/compute`
- `GET /results/by-token/:sessionToken`
- `GET /careers/recommendations`
- `POST /ai/summary`
- `POST /ai/coach`
- `POST /treasure-map`
- `GET /treasure-map/by-token/:sessionToken`
- `GET /treasure-map/:shareToken`
- `GET /treasure-map/pdf/:shareToken`

## Modules principaux

- **Sessions** : création et suivi d’une session anonyme.
- **Questions** : banque de questions RIASEC (phase 1/2).
- **Responses** : enregistrement des réponses par session.
- **Scoring** : calcul des scores RIASEC (service interne).
- **Results** : consolidation du résultat et progression finale.
- **Treasure Map** : synthèse visuelle + PDF partageable.
- **Recommendations** : moteur de recommandations par session.
- **AI** : résumé et coaching uniquement à partir des données de session.
- **Badges** : gamification interne par session.
- **Media/Storage** : stockage des PDF de carte au trésor.
- **Prisma/Common** : accès DB et utilitaires transverses.

## Non-objectifs explicites

- Aucun compte utilisateur
- Aucune authentification/autorisation
- Aucune PII stockée
- Aucun historique inter-session

