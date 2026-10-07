# QUIZORA

QUIZORA is a real-time multiplayer quiz arena built with React, TanStack Router and Firebase.

## Backend

QUIZORA is **Firebase-only**:

- Firebase Authentication — host email/password + Google sign-in and anonymous player sessions.
- Cloud Firestore — quizzes, questions, live games, players and answers with realtime listeners.
- Firebase Storage can be added for question/quiz media later.

There is no Supabase dependency or Supabase project required.

## Firebase setup

1. Open the Firebase Console and select `quizora-1347a`.
2. Authentication → Sign-in method: enable **Email/Password**, **Google**, and **Anonymous**.
3. Firestore Database → Create database.
4. Deploy `firestore.rules` using the Firebase CLI, or paste the rules into Firestore Rules.
5. Start the app with `npm run dev` or `bun run dev`.

## Local development

```bash
npm install --legacy-peer-deps
npm run dev
```

or:

```bash
bun install
bun run dev
```

## Architecture

Host accounts use Firebase Authentication. Players join through a QR/PIN and receive a Firebase anonymous session. Firestore realtime listeners synchronize the game state and player list between the host/projector and all participant phones.


### Player answer-only mode
During an active question, the player screen intentionally does not render the question text. Players receive only the answer choices and timer. The host/projector remains responsible for displaying the question.
