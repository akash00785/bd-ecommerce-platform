import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
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
  register: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      // ─────────────────────────────────────────────────────────────────────
      // IMPORTANT: Do NOT filter by emailVerified here.
      //
      // Admin login uses signInWithEmailAndPassword directly (bypassing
      // useAuth().signIn), so filtering here would set user → null for any
      // admin whose Firebase account email hasn't been verified, causing
      // AdminLayout to redirect them straight back to /admin/login.
      //
      // Email-verification enforcement for *regular* users happens inside
      // signIn() below. ProtectedRoute also guards customer-facing pages.
      // ─────────────────────────────────────────────────────────────────────
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

    /**
     * Regular customer sign-in.
     * Blocks email/password accounts whose email has not been verified.
     * Admin login calls Firebase directly and does NOT go through this function.
     */
    signIn: async (email, password) => {
      if (!auth) throw new Error("Firebase not configured");
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Block unverified email/password accounts from the storefront.
      if (!result.user.emailVerified) {
        await signOut(auth);
        const err = new Error("email-not-verified");
        (err as any).code = "auth/email-not-verified";
        throw err;
      }

      return result.user;
    },

    register: async (name, email, password) => {
      if (!auth) throw new Error("Firebase not configured");
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (name.trim()) await updateProfile(result.user, { displayName: name.trim() });

      // Send a Firebase verification email, then sign out immediately.
      // The user must verify before they can log in.
      await sendEmailVerification(result.user);
      await signOut(auth);
    },

    signInWithGoogle: async () => {
      if (!auth) throw new Error("Firebase not configured");
      // Google sign-in users have emailVerified === true by default.
      return (await signInWithPopup(auth, googleProvider)).user;
    },

    logout: () => {
      if (!auth) return Promise.resolve();
      return signOut(auth);
    },

    resendVerificationEmail: async () => {
      if (!auth) throw new Error("Firebase not configured");
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No user signed in");
      await sendEmailVerification(currentUser);
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
    "auth/email-not-verified":
      "ইমেইল ভেরিফাই করা হয়নি। আপনার ইনবক্স চেক করুন এবং ভেরিফিকেশন লিঙ্কে ক্লিক করুন।",
  };
  return messages[code] ?? "অনুরোধটি সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।";
}
