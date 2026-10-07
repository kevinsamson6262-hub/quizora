import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  signInAnonymously,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBv1i6VmaMQI3h9TV_Q8WxjNIWghENd6K4",
  authDomain: "quizora-1347a.firebaseapp.com",
  projectId: "quizora-1347a",
  storageBucket: "quizora-1347a.firebasestorage.app",
  messagingSenderId: "972862207871",
  appId: "1:972862207871:web:1faa00395441210d5a0c4a",
  measurementId: "G-781NTWKM6R",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseDb = getFirestore(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

export function waitForFirebaseUser(): Promise<User | null> {
  if (firebaseAuth.currentUser) return Promise.resolve(firebaseAuth.currentUser);
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export async function ensureAnonymousUser(): Promise<User> {
  if (firebaseAuth.currentUser) return firebaseAuth.currentUser;
  const result = await signInAnonymously(firebaseAuth);
  return result.user;
}

export async function getFirebaseAccessToken(): Promise<string | null> {
  const user = firebaseAuth.currentUser ?? (await waitForFirebaseUser());
  return user ? user.getIdToken(false) : null;
}

export {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  signInAnonymously,
  type User,
};
