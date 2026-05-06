# Configuration du fournisseur IA

## Vue d'ensemble

Le module `ai` supporte maintenant **OpenAI** et **Google Gemini** comme fournisseurs IA. Vous pouvez choisir le fournisseur par environnement.

## Configuration

### Variables d'environnement requises

```env
# Sélectionner le fournisseur (openai ou google)
AI_PROVIDER=openai

# Paramètres globaux
AI_TEMPERATURE=0.3
AI_TIMEOUT_MS=15000

# Configuration OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
OPENAI_BASE_URL=https://api.openai.com

# Configuration Google Gemini
GOOGLE_AI_API_KEY=AIzaSy...
GOOGLE_AI_MODEL=gemini-2.0-flash
```

## Utilisation

### Avec OpenAI (par défaut)

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

### Avec Google Gemini

```env
AI_PROVIDER=google
GOOGLE_AI_API_KEY=AIzaSy...
```

## Architecture

### Classes principales

- **`AiClient`** : Client OpenAI (fetch API personnalisée)
- **`GoogleAiClient`** : Client Google Gemini (SDK officiel)
- **`AiProviderFactory`** : Factory pour sélectionner le provider
- **`AiService`** : Service métier utilisant le provider configuré
- **`IAiProvider`** : Interface commune pour les deux providers

### Flux d'utilisation

```
AiService (injecte AiProviderFactory)
  ↓
AiProviderFactory.getProvider() 
  ↓
AiClient (OpenAI) OU GoogleAiClient (Google)
```

## Supports des formats de réponse

Les deux clients supportent :

- **`chat(prompt)`** : Réponse texte simple
- **`respondText()`** : Réponse texte structurée
- **`respondJson()`** : Réponse JSON avec schéma

## Points d'attention

### Google Gemini

- Utilise le SDK officiel `@google/generative-ai`
- Conversion automatique du schéma JSON vers le format Google
- Les timeouts sont gérés avec `Promise.race()`
- Support natif des schémas structurés

### OpenAI

- Utilise l'API REST personnalisée (fetch)
- Endpoint personnalisé supporté via `OPENAI_BASE_URL`
- Format de réponse structuré

## Migration de OpenAI vers Google Gemini

Changez simplement :

```env
# avant
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...

# après
AI_PROVIDER=google
GOOGLE_AI_API_KEY=AIzaSy...
```

Aucune modification de code ne est requise. Le `AiProviderFactory` gère la sélection automatiquement.

## Coûts

- **OpenAI** : Consultation tarifaire
- **Google Gemini** : [Google AI Studio pricing](https://ai.google.dev/pricing)
