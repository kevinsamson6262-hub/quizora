# QUIZORA Firebase Setup

Project: `quizora-1347a`

## 1. Authentication

Firebase Console → Authentication → Sign-in method:

- Enable Email/Password
- Enable Google
- Enable Anonymous

Anonymous auth is required for players because players join by QR/PIN without creating accounts.

## 2. Firestore

Firebase Console → Firestore Database → Create database.

Publish the included `firestore.rules` file.

## 3. Web app configuration

The Firebase web configuration for `quizora-1347a` is already wired into `src/lib/firebase.ts`.

Do not add a service-account private key to the browser project.

## 4. Run locally

```bash
npm install --legacy-peer-deps
npm run dev
```

## 5. Game model

- `quizzes/{quizId}` — host-owned quiz metadata
- `quizzes/{quizId}/questions/{questionId}` — questions
- `games/{gameId}` — live game state
- `games/{gameId}/questions/{position}` — player-safe question copy
- `games/{gameId}/players/{playerId}` — live participants
- `games/{gameId}/answers/{playerId_questionIndex}` — submitted answers

Firestore `onSnapshot` listeners keep the projector, host controls and participant phones synchronized.
