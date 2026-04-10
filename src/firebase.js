// Firebase — optional. Use .env.local with VITE_FIREBASE_* (see .env.example). Spark (free) tier is enough.
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

/** Must match Cloud Functions region in functions/index.js */
export const FIREBASE_FUNCTIONS_REGION = 'europe-west2';

/** Paste once from Firebase → Project settings → Your apps → Web app (see .env.example). */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

/** True when env has a real web app config (Firebase Spark = free). */
export function isFirebaseConfigured() {
  const k = firebaseConfig.apiKey;
  const pid = firebaseConfig.projectId;
  return Boolean(
    k &&
      pid &&
      firebaseConfig.appId &&
      k.length > 20 &&
      !/^your-/i.test(String(k).trim()) &&
      !String(pid).startsWith('your-')
  );
}

let _app = null;

function getOrInitApp() {
  if (!isFirebaseConfigured()) return null;
  if (!_app) {
    if (getApps().length > 0) {
      _app = getApps()[0];
    } else {
      _app = initializeApp(firebaseConfig);
    }
  }
  return _app;
}

/** @returns {import('firebase/firestore').Firestore | null} */
export function getDb() {
  const app = getOrInitApp();
  return app ? getFirestore(app) : null;
}

/** @returns {import('firebase/auth').Auth | null} */
export function getAuthInstance() {
  const app = getOrInitApp();
  return app ? getAuth(app) : null;
}

/** @returns {import('firebase/functions').Functions | null} */
export function getFunctionsInstance() {
  const app = getOrInitApp();
  return app ? getFunctions(app, FIREBASE_FUNCTIONS_REGION) : null;
}

/** Firestore rejects undefined — strip recursively before addDoc. */
export function omitUndefinedDeep(value) {
  if (value === undefined) return undefined;
  if (value === null || typeof value !== 'object') return value;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) {
    return value
      .map((item) => omitUndefinedDeep(item))
      .filter((item) => item !== undefined);
  }
  const out = {};
  for (const [key, v] of Object.entries(value)) {
    if (v === undefined) continue;
    const next = omitUndefinedDeep(v);
    if (next !== undefined) out[key] = next;
  }
  return out;
}

let authInitialized = false;

export const initializeAuth = () => {
  if (!isFirebaseConfigured()) return Promise.resolve();

  const auth = getAuthInstance();
  if (!auth) return Promise.resolve();

  if (authInitialized) return Promise.resolve();

  authInitialized = true;
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribe();
        resolve();
      } else {
        signInAnonymously(auth)
          .then(() => {
            unsubscribe();
            resolve();
          })
          .catch((error) => {
            console.error('Auth error:', error);
            unsubscribe();
            resolve();
          });
      }
    });
  });
};
