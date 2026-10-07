# QUIZORA Firebase-only architecture

The previous Supabase/Lovable backend integration has been removed.

## Backend

Firebase Authentication + Cloud Firestore are now the only application backend services.

Hosts authenticate with Firebase email/password or Google.
Players use Firebase Anonymous Authentication after scanning the QR/PIN.

## Realtime

Firestore `onSnapshot` powers:

- Game state
- Player lobby
- Answer count
- Leaderboard score updates
- Reconnection/session recovery

## Important

For production anti-cheat hardening, move answer validation/scoring into a Firebase callable Cloud Function. The current client implementation is designed to be functional without requiring a separate backend project.
