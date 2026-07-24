import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "@/firebase";
import { setAuthTokenGetter } from "@workspace/api-client-react";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Fixed: guard against auth being null when Firebase is misconfigured
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);

      if (nextUser) {
        setAuthTokenGetter(() => nextUser.getIdToken());
      } else {
        setAuthTokenGetter(null);
      }
    });
    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    signIn: async (email, password) => {
      if (!auth) throw new Error("Firebase not configured");
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    },
    register: async (name, email, password) => {
      if (!auth) throw new Error("Firebase not configured");
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (name.trim()) await updateProfile(result.user, { displayName: name.trim() });
      return result.user;
    },
    signInWithGoogle: async () => {
      if (!auth) throw new Error("Firebase not configured");
      return (await signInWithPopup(auth, googleProvider)).user;
    },
    logout: () => {
      if (!auth) return Promise.resolve();
      return signOut(auth);
    },
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

export function firebaseAuthMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code: string }).code)
    : "";
  const messages: Record<string, string> = {
    "auth/invalid-credential": "ইমেইল বা পাসওয়ার্ড সঠিক নয়।",
    "auth/email-already-in-use": "এই ইমেইল দিয়ে আগে থেকেই অ্যাকাউন্ট আছে।",
    "auth/weak-password": "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।",
    "auth/popup-closed-by-user": "Google লগইন বাতিল করা হয়েছে।",
  };
  return messages[code] ?? "অনুরোধটি সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।";
}
