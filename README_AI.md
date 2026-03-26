# README IA — Integration GPT-4o

Ce document explique comment integrer l'IA dans l'API d'orientation RIASEC en utilisant le modele GPT-4o.

## Objectif

Ajouter une couche IA pour:

- Expliquer le profil RIASEC en langage naturel.
- Proposer un coach d'orientation (conseils et prochaines etapes).
- Resumer les resultats et recommandations.

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
2. Construire un contexte minimal (pas de PII inutile).
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

