import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ✅ Fixed: only init Firebase when ALL required keys are present.
// Previously a throw here would crash the entire React app before render → blank white page.
const isConfigured = Object.values(firebaseConfig).every(Boolean);

if (!isConfigured) {
  console.warn(
    "[Firebase] VITE_FIREBASE_* environment variables are not set. " +
    "Login/register features will be disabled. Set the secrets and restart."
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _auth: ReturnType<typeof getAuth> | null = null;

if (isConfigured) {
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    _auth = getAuth(app);
    void setPersistence(_auth, browserLocalPersistence);
  } catch (err) {
    console.warn("[Firebase] Initialisation failed:", err);
  }
}

// Export auth — may be null when Firebase is not configured.
// All call sites guard with `if (!auth)` before use.
export const auth = _auth;
export const googleProvider = new GoogleAuthProvider();
