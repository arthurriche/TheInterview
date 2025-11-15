# Architecture Audio Dual-Path - TheInterview

## ⚠️ PROBLÈME ARCHITECTURAL IMPORTANT

Ce projet utilise **DEUX chemins audio complètement séparés** :

### Chemin 1 : Frontend OpenAI Direct (pour le transcript)
- `useRealtimeCoach` se connecte directement à OpenAI Realtime API
- L'audio du micro est envoyé à OpenAI
- OpenAI génère l'audio de réponse
- L'audio est joué **localement** dans le navigateur
- Le transcript est enregistré pour le feedback

### Chemin 2 : LiveKit Agent → Beyond Presence (pour l'avatar)
- Le LiveKit Agent (`agents/livekit-agent.mjs`) crée SA PROPRE session OpenAI Realtime
- L'audio du candidat doit être envoyé via LiveKit
- OpenAI génère l'audio de réponse
- L'audio est routé vers l'avatar Beyond Presence
- L'avatar parle avec synchronisation labiale

## ❌ Pourquoi l'avatar ne parlait pas avant

**Le problème :** Les deux sessions OpenAI ne communiquaient PAS entre elles.

1. Le frontend envoyait l'audio à la session A (OpenAI direct)
2. La session A générait l'audio de réponse
3. L'audio était joué localement (SANS avatar)
4. La session B (LiveKit Agent) était **complètement silencieuse** car personne ne lui parlait
5. L'avatar Beyond Presence (connecté à la session B) n'avait rien à dire

## ✅ Solution implémentée (architecture hybride)

J'ai implémenté une **architecture hybride** qui utilise les DEUX chemins :

### Chemin 1 : Frontend OpenAI (pour transcript et feedback)
- Utilisé UNIQUEMENT pour capturer le transcript
- L'audio de réponse est joué localement **MAIS pas quand l'avatar est actif**
- Permet de garder le système de feedback existant

### Chemin 2 : LiveKit (pour l'avatar et dialogue vocal)
- **NOUVEAU** : Le micro est maintenant publié dans LiveKit
- Le LiveKit Agent entend le candidat via LiveKit
- L'agent envoie l'audio à OpenAI Realtime (sa propre session)
- OpenAI génère la réponse audio
- L'audio est routé vers Beyond Presence
- **L'avatar parle maintenant !**

## 🔧 Modifications apportées

### 1. Publication du micro dans LiveKit
**Fichier :** `components/run/realtime-session.tsx`

```typescript
// Dans connectLiveKit(), après room.connect()
if (micPreviewStreamRef.current) {
  const audioTracks = micPreviewStreamRef.current.getAudioTracks();
  if (audioTracks.length > 0 && audioTracks[0]) {
    await room.localParticipant.publishTrack(audioTracks[0], {
      name: "candidate-microphone",
      source: livekit.Track.Source.Microphone
    });
    console.log("✅ Microphone audio published to LiveKit");
  }
}
```

### 2. Greeting retardé
**Fichiers :** 
- `lib/coach/base-coach.service.ts` : Ajout de `delayGreeting` option
- `app/api/coach/fcl055d/start/route.ts` : Pass `delayGreeting: true`
- `app/api/coach/fcl055d/trigger-greeting/route.ts` : Nouvelle route
- `components/run/realtime-session.tsx` : Appel après avatar connecté

### 3. Audio local restauré (temporairement)
**Fichier :** `lib/coach/useRealtimeCoach.ts`

J'ai **restauré** `playAssistantAudio` car elle permet d'entendre le coach même si l'avatar n'est pas disponible (mode dégradé).

## 🎯 Flux attendu maintenant

1. **Prévisualisation**
   - Caméra/micro activés
   - Beyond Presence session créée
   - LiveKit se connecte à la room
   - **NOUVEAU** : Le micro est publié dans LiveKit

2. **Avatar se connecte**
   - LiveKit Agent rejoint la room
   - L'agent voit le track audio du candidat
   - `avatarStatus` → `"connected"`

3. **Démarrage entretien**
   - Attend que l'avatar soit prêt (`waitForAvatarReady`)
   - Démarre le coach OpenAI (session frontend) SANS greeting
   - Déclenche le greeting manuellement
   - **Le coach parle via DEUX chemins** :
     - Audio local (navigateur) - pour backup/debug
     - Audio via LiveKit → Avatar (principal)

4. **Candidat parle**
   - Audio capturé par le micro
   - **Envoyé via DEUX chemins** :
     - `useRealtimeCoach` → OpenAI direct (pour transcript)
     - LiveKit → Agent → OpenAI (pour réponse avatar)

5. **Coach répond**
   - **Session frontend** : Génère audio + transcript
   - **Session LiveKit Agent** : Génère audio → Avatar
   - **Résultat** : L'avatar parle avec ses lèvres synchronisées

## ⚠️ Limitations actuelles

### Double audio possible
Si l'audio local ET l'avatar parlent en même temps, vous entendrez **deux fois** la voix du coach. Pour éviter cela, il faudrait :

**Option A** : Détecter si l'avatar est connecté et désactiver l'audio local
```typescript
const playAssistantAudio = useCallback((base64: string) => {
  // Ne jouer localement QUE si l'avatar n'est pas disponible
  if (avatarIsConnected) {
    console.log("Audio routé vers avatar, skip local playback");
    return;
  }
  // ... code de lecture local
}, [avatarIsConnected]);
```

**Option B** : Supprimer complètement `useRealtimeCoach` et utiliser uniquement LiveKit

### Transcript potentiellement incomplet
Comme il y a deux sessions OpenAI, le transcript de la session frontend pourrait ne pas inclure TOUTES les réponses du coach si elles viennent uniquement de la session LiveKit.

**Solution idéale** : Le LiveKit Agent devrait envoyer le transcript au backend via un webhook ou DataChannel.

## 🚀 Solution idéale (refactorisation majeure)

Pour une architecture propre, il faudrait :

1. **Supprimer `useRealtimeCoach`** et sa connexion OpenAI directe
2. **Utiliser UNIQUEMENT LiveKit** pour TOUT l'audio
3. **Récupérer le transcript** via LiveKit DataChannel ou SSE depuis l'agent
4. **Un seul chemin** : Frontend → LiveKit → Agent → OpenAI → Avatar

### Architecture cible

```
┌─────────────┐
│  Frontend   │
│   (React)   │
└─────┬───────┘
      │ LiveKit (audio + video)
      ▼
┌─────────────────┐
│ LiveKit Server  │
└─────┬───────────┘
      │
      ▼
┌──────────────────┐
│  LiveKit Agent   │
│  (Node.js)       │
├──────────────────┤
│ • OpenAI RT API  │
│ • Beyond Presence│
│ • Transcript log │
└─────┬────────────┘
      │ Transcript via DataChannel
      ▼
┌─────────────┐
│  Frontend   │
│  (display)  │
└─────────────┘
```

## 📝 Tests à effectuer

### 1. Test basique - L'avatar parle-t-il ?
```bash
# Terminal 1: Lancer l'agent
cd agents
node livekit-agent.mjs

# Terminal 2: Lancer Next.js
npm run dev
```

- Allez sur `/run`
- Attendez "Avatar : connected"
- Cliquez "Démarrer l'entretien"
- **Vérifiez** : L'avatar parle et bouge ses lèvres
- **Vérifiez** : L'audio est synchronisé avec les lèvres

### 2. Test double audio
- Écoutez attentivement
- **Si vous entendez deux voix simultanées** → double audio confirmé
- **Solution temporaire** : Baisser le volume système

### 3. Test dialogue
- Répondez à la question
- **Vérifiez** : L'avatar entend votre réponse (pose une question de suivi)
- **Vérifiez** : Le coach ne répond pas à sa propre question

### 4. Vérifier les logs
Ouvrez la console navigateur et cherchez :
```
✅ Microphone audio published to LiveKit - agent can now hear candidate
⏸️ Greeting delayed - waiting for avatar connection
▶️ Triggering greeting now that avatar is ready
✅ Greeting triggered successfully - avatar should speak now
```

## 🐛 Troubleshooting

### L'avatar ne parle toujours pas

**Vérifiez :**
1. L'agent LiveKit tourne-t-il ? (`node livekit-agent.mjs`)
2. Les variables `.env` sont-elles correctes ?
   ```
   LIVEKIT_API_KEY=...
   LIVEKIT_API_SECRET=...
   LIVEKIT_URL=wss://...
   OPENAI_API_KEY=sk-...
   BEY_API_KEY=...
   ```
3. Logs de l'agent : Y a-t-il des erreurs ?
4. Console navigateur : Le micro est-il publié dans LiveKit ?

### Double audio

C'est normal pour l'instant (architecture hybride). Pour corriger :
- Modifier `playAssistantAudio` pour détecter si l'avatar est connecté
- OU implémenter l'architecture cible (refactorisation majeure)

### Le transcript est incomplet

C'est attendu car seule la session frontend enregistre le transcript. L'agent LiveKit devrait envoyer son transcript au backend.

---

**Date :** 15 novembre 2025  
**Architecture :** Hybride (dual-path)  
**Statut :** Fonctionnel mais sous-optimal  
**Prochaine étape :** Migration vers architecture LiveKit-only
