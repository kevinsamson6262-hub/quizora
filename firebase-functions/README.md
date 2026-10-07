# QUIZORA Firebase Auth → Supabase role claim

Supabase's Firebase third-party authentication integration expects a Firebase JWT to contain `role: "authenticated"`.

This folder contains a starter Firebase Functions implementation. Deploy it after enabling Firebase Authentication with Identity Platform / blocking functions, or use the Firebase Admin SDK to set the claim for existing users.

For a simple first deployment, install Firebase Functions in this folder and add the following blocking functions:

```ts
import { beforeUserCreated, beforeUserSignedIn } from "firebase-functions/v2/identity";

export const beforecreated = beforeUserCreated(() => ({
  customClaims: { role: "authenticated" },
}));

export const beforesignedin = beforeUserSignedIn(() => ({
  customClaims: { role: "authenticated" },
}));
```

After deploying, users should refresh their Firebase ID token before making Supabase requests.
