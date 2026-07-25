import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { useAuth, firebaseAuthMessage } from "@/context/AuthContext";
import { sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";

export default function Login() {
  const [, setLocation] = useLocation();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  const finish = () => setLocation("/account");
  const handleError = (reason: unknown) => {
    const code = typeof reason === "object" && reason && "code" in reason
      ? String((reason as { code: string }).code)
      : "";
    setError(firebaseAuthMessage(reason));
    setShowResend(code === "auth/email-not-verified");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError("");
    setShowResend(false);
    setResendDone(false);
    try {
      await signIn(email, password);
      finish();
    } catch (reason) {
      handleError(reason);
    } finally {
      setPending(false);
    }
  };

  const google = async () => {
    setPending(true);
    setError("");
    setShowResend(false);
    try {
      await signInWithGoogle();
      finish();
    } catch (reason) {
      handleError(reason);
    } finally {
      setPending(false);
    }
  };

  /** Re-sign in silently to get the User object, then send a fresh verification email. */
  const resendVerification = async () => {
    if (!auth || !email || !password) return;
    setPending(true);
    try {
      // We need to sign in to get a fresh user object, then sign out.
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (!result.user.emailVerified) {
        await sendEmailVerification(result.user);
        await auth.signOut();
        setResendDone(true);
        setError("ভেরিফিকেশন ইমেইল পুনরায় পাঠানো হয়েছে। আপনার ইনবক্স চেক করুন।");
        setShowResend(false);
      }
    } catch {
      setError("ভেরিফিকেশন ইমেইল পাঠানো যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।");
    } finally {
      setPending(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[70vh] bg-muted/30 px-4 py-12 flex items-center justify-center">
        <div className="bg-card border border-border rounded-2xl shadow-sm w-full max-w-md p-8">
          <h1 className="text-3xl font-bold text-primary">স্বাগতম</h1>
          <p className="text-muted-foreground mt-2 mb-8">আপনার Bazaar BD অ্যাকাউন্টে লগইন করুন।</p>
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-medium">
              ইমেইল
              <input
                className="mt-1 w-full border rounded-lg px-3 py-3"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-medium">
              পাসওয়ার্ড
              <input
                className="mt-1 w-full border rounded-lg px-3 py-3"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {error && (
              <div className={`text-sm rounded-lg p-3 ${resendDone ? "text-green-700 bg-green-50" : "text-red-600 bg-red-50"}`}>
                {error}
              </div>
            )}
            {showResend && (
              <button
                type="button"
                disabled={pending}
                onClick={() => void resendVerification()}
                className="w-full rounded-lg border border-primary text-primary py-2 text-sm font-medium hover:bg-primary/5 disabled:opacity-60"
              >
                ভেরিফিকেশন ইমেইল পুনরায় পাঠান
              </button>
            )}
            <button
              disabled={pending}
              className="w-full rounded-lg bg-primary text-white py-3 font-semibold disabled:opacity-60"
            >
              {pending ? "লগইন হচ্ছে..." : "ইমেইল দিয়ে লগইন"}
            </button>
          </form>
          <button
            onClick={() => void google()}
            disabled={pending}
            className="w-full rounded-lg border border-border py-3 mt-3 font-semibold hover:bg-muted disabled:opacity-60"
          >
            Google দিয়ে লগইন
          </button>
          <p className="text-sm text-center text-muted-foreground mt-6">
            অ্যাকাউন্ট নেই?{" "}
            <Link href="/register" className="text-secondary font-semibold hover:underline">
              রেজিস্টার করুন
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
