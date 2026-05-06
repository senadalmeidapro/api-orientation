# Quick Start - Configuration Google AI Studio

## 1. Obtenez votre API key

1. Allez sur [Google AI Studio](https://aistudio.google.com)
2. Cliquez sur **"Get API key"**
3. Créez une nouvelle clé API (ou utilisez une existante)
4. Copiez la clé

## 2. Configurez votre .env

```bash
# Remplacez openai par google
AI_PROVIDER=google

# Paste votre clé Google AI
GOOGLE_AI_API_KEY=AIzaSyDxWJYj-qjAGSLZUd7jWxu-...

# (Optionnel) Configurez le modèle
GOOGLE_AI_MODEL=gemini-2.0-flash

# (Optionnel) Ajustez la température et timeout
AI_TEMPERATURE=0.3
AI_TIMEOUT_MS=15000
```

## 3. Redémarrez l'application

```bash
npm run dev
# ou
npm run start
```

## 4. Vérifiez que ça fonctionne

```bash
curl -X POST http://localhost:3000/api/v1/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{"prompt": "Bonjour"}'
```

## Modèles disponibles

| Modèle | Description |
|--------|-------------|
| `gemini-2.0-flash` | **Recommandé** - Ultra-rapide, haute qualité |
| `gemini-2.0-pro` | Plus puissant, plus lent |
| `gemini-1.5-flash` | Alternatif rapide |
| `gemini-1.5-pro` | Ancien pro (compatible) |

## Variables d'environnement minimales

```env
AI_PROVIDER=google
GOOGLE_AI_API_KEY=AIzaSy...
```

## Dépannage

### Erreur : "GOOGLE_AI_API_KEY manquant"
→ Vérifiez que `GOOGLE_AI_API_KEY` est défini dans `.env`

### Erreur : "AI provider 'google' non configuré"
→ Assurez-vous que `AI_PROVIDER=google` (pas de typo)

### Timeout
→ Augmentez `AI_TIMEOUT_MS` à `30000` ou plus

## Revenir à OpenAI

Si vous voulez revenir à OpenAI :

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

## Support

Pour plus d'infos : [`docs/ai-provider-configuration.md`](./ai-provider-configuration.md)
