# Correctifs Avatar Beyond Presence - Synchronisation Audio

## Problèmes identifiés et résolus

### 1. **Le recruteur parlait avant l'affichage de l'avatar**
**Cause :** Dans `base-coach.service.ts`, la méthode `start()` déclenchait immédiatement le greeting (première question du coach) via `requestResponseCreation(true)` sans attendre que l'avatar Beyond Presence soit connecté.

**Solution :**
- Ajout d'une option `delayGreeting` à la méthode `start()` dans `base-coach.service.ts`
- Création d'une nouvelle méthode `triggerGreeting()` pour déclencher le greeting manuellement
- Modification de `/api/coach/fcl055d/start/route.ts` pour passer `delayGreeting: true` par défaut
- Création d'une nouvelle route `/api/coach/fcl055d/trigger-greeting/route.ts`
- Dans `realtime-session.tsx`, appel de cette route **APRÈS** que l'avatar soit connecté

### 2. **L'avatar ne parlait pas (audio joué localement)**
**Cause :** L'audio OpenAI Realtime était joué directement dans le navigateur via `playAssistantAudio()` au lieu d'être routé vers l'avatar Beyond Presence via LiveKit.

**Solution :**
- Désactivation de la lecture audio locale dans `useRealtimeCoach.ts`
- L'audio OpenAI est maintenant géré par le LiveKit Agent (`agents/livekit-agent.mjs`) qui le route automatiquement vers l'avatar Beyond Presence
- Ajout d'un log explicatif : `"🔇 Audio playback disabled - routing to Beyond Presence avatar via LiveKit"`

### 3. **Le recruteur répondait à sa propre question**
**Cause :** Le coach OpenAI Realtime créait parfois des réponses successives sans attendre la réponse du candidat. Cela était lié au prompt et au timing de `requestResponseCreation`.

**Solution partielle :**
- Le prompt existant dans `fcl055d-coach.ts` contient déjà : `"After you ask something, pause and wait. Never answer your own prompts..."`
- La synchronisation avec l'avatar devrait réduire ce problème car le greeting est maintenant mieux contrôlé
- **Note :** Ce comportement peut encore se produire si OpenAI génère du contenu supplémentaire ; vérifiez les logs `shouldEnd` dans la console

## Fichiers modifiés

1. **`lib/coach/base-coach.service.ts`**
   - Ajout du paramètre `options?: { delayGreeting?: boolean }` à `start()`
   - Ajout de la méthode `triggerGreeting()`

2. **`app/api/coach/fcl055d/start/route.ts`**
   - Ajout du paramètre `delayGreeting` dans le body de la requête
   - Passage de `{ delayGreeting: true }` par défaut à `entry.service.start()`

3. **`app/api/coach/fcl055d/trigger-greeting/route.ts`** *(nouveau fichier)*
   - Nouvelle route POST pour déclencher le greeting manuellement après connexion avatar

4. **`lib/coach/useRealtimeCoach.ts`**
   - Désactivation complète de `playAssistantAudio()` (ne joue plus l'audio localement)

5. **`components/run/realtime-session.tsx`**
   - Ajout d'un appel à `/api/coach/fcl055d/trigger-greeting` après `startCoachSession()` et `waitForAvatarReady()`

## Flux attendu maintenant

1. **Prévisualisation** : L'utilisateur clique sur "Prévisualiser" → caméra/micro activés, Beyond Presence session créée, LiveKit se connecte
2. **Connexion avatar** : LiveKit se connecte à la room, l'agent Beyond Presence se joint, `avatarStatus` passe à `"connected"`
3. **Démarrage entretien** : Utilisateur clique sur "Démarrer l'entretien"
   - `waitForAvatarReady()` attend que `avatarStatus === "connected"` (ou timeout 20s)
   - `startCoachSession()` démarre le coach OpenAI Realtime **SANS** greeting
   - Appel de `/api/coach/fcl055d/trigger-greeting` pour déclencher le greeting **maintenant**
4. **Avatar parle** : Le coach génère l'audio du greeting, le LiveKit Agent le reçoit et le route vers l'avatar Beyond Presence
5. **Candidat répond** : L'utilisateur parle, le micro capture l'audio, `useRealtimeCoach` l'envoie à OpenAI Realtime
6. **Coach pose une autre question** : OpenAI génère la réponse, LiveKit Agent la route vers l'avatar
7. **Attente réponse** : Le coach attend la réponse du candidat (selon le prompt)

## Tests recommandés

1. **Test basique** :
   ```bash
   npm run dev
   ```
   - Allez sur `/run`
   - Vérifiez que la caméra/micro s'activent automatiquement (prévisualisation)
   - Attendez que "Avatar : connected" s'affiche
   - Cliquez sur "Démarrer l'entretien"
   - **Vérifiez** : L'avatar doit parler (lèvres bougent) ET vous entendez la voix
   - **Vérifiez** : Pas de double audio (pas de son dans le navigateur en plus de l'avatar)

2. **Test de synchronisation** :
   - Ouvrez la console navigateur (Cmd+Opt+J)
   - Cherchez les logs :
     - `⏸️ Greeting delayed - waiting for avatar connection`
     - `▶️ Triggering greeting now that avatar is ready`
     - `✅ Greeting triggered successfully - avatar should speak now`
     - `🔇 Audio playback disabled - routing to Beyond Presence avatar via LiveKit`

3. **Test du dialogue** :
   - Répondez à la question du coach
   - Vérifiez qu'il ne répond PAS à sa propre question
   - Vérifiez qu'il attend votre réponse avant de parler à nouveau

## Problèmes potentiels restants

### Architecture double-session

⚠️ **Problème architectural** : Le projet utilise **deux connexions OpenAI Realtime indépendantes** :
- Une depuis le frontend (`useRealtimeCoach`)
- Une depuis le LiveKit Agent (`agents/livekit-agent.mjs`)

**Conséquence** : Les deux sessions ne sont PAS synchronisées. L'agent LiveKit ne "voit" pas ce que le frontend envoie à OpenAI et vice-versa.

**Solution actuelle (temporaire)** :
- On désactive l'audio local pour éviter la double lecture
- On retarde le greeting pour synchroniser le démarrage
- **MAIS** : Le frontend envoie toujours l'audio via sa propre session OpenAI

**Solution idéale (refactorisation majeure)** :
1. Supprimer complètement `useRealtimeCoach` et sa connexion OpenAI directe
2. Utiliser uniquement LiveKit pour TOUT :
   - Le frontend envoie l'audio du micro via LiveKit (pas directement à OpenAI)
   - Le LiveKit Agent reçoit l'audio, le transmet à OpenAI Realtime
   - OpenAI génère la réponse audio, le LiveKit Agent la reçoit et la route vers l'avatar
   - Le frontend reçoit le transcript via un autre canal (SSE ou LiveKit Data Channel)

### Vérifier l'agent LiveKit

Pour que l'avatar parle, l'agent LiveKit **DOIT** être en cours d'exécution :

```bash
cd agents
node livekit-agent.mjs
```

**Variables d'environnement requises dans `.env` :**
```
LIVEKIT_API_KEY=<votre clé>
LIVEKIT_API_SECRET=<votre secret>
LIVEKIT_URL=<votre URL LiveKit Cloud>
OPENAI_API_KEY=sk-...
BEY_API_KEY=<votre clé Beyond Presence>
BEY_AVATAR_ID=<optionnel>
LIVEKIT_AGENT_NAME=finance-coach-avatar
```

Si l'agent n'est pas lancé, `agentDispatched` sera `false` et l'avatar ne recevra jamais l'audio.

## Prochaines étapes recommandées

1. **Tester les changements** avec `npm run dev` et l'agent LiveKit en parallèle
2. **Vérifier les logs console** pour confirmer le flux
3. **Si ça fonctionne** : commit et push des changements
4. **Si problème de double session persiste** : envisager la refactorisation majeure pour utiliser uniquement LiveKit

## Notes supplémentaires

- Les erreurs TypeScript dans `base-coach.service.ts` (ligne 69 "Object is possibly 'undefined'") existaient **avant** mes modifications et ne sont pas liées à ce correctif
- Le `.gitignore` a déjà été mis à jour pour ignorer `node_modules`, `envAIpioneers`, `.env`, etc.

---

**Date des modifications :** 15 novembre 2025
**Fichiers modifiés :** 5 fichiers (4 modifiés, 1 créé)
**Tests requis :** Oui (voir section Tests recommandés ci-dessus)
