import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { useAuth, firebaseAuthMessage } from "@/context/AuthContext";

export default function Login() {
  const [, setLocation] = useLocation();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const finish = () => setLocation("/account");
  const handleError = (reason: unknown) => setError(firebaseAuthMessage(reason));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true); setError("");
    try { await signIn(email, password); finish(); } catch (reason) { handleError(reason); } finally { setPending(false); }
  };

  const google = async () => {
    setPending(true); setError("");
    try { await signInWithGoogle(); finish(); } catch (reason) { handleError(reason); } finally { setPending(false); }
  };

  return (
    <Layout>
      <div className="min-h-[70vh] bg-muted/30 px-4 py-12 flex items-center justify-center">
        <div className="bg-card border border-border rounded-2xl shadow-sm w-full max-w-md p-8">
          <h1 className="text-3xl font-bold text-primary">স্বাগতম</h1>
          <p className="text-muted-foreground mt-2 mb-8">আপনার Bazaar BD অ্যাকাউন্টে লগইন করুন।</p>
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-medium">ইমেইল<input className="mt-1 w-full border rounded-lg px-3 py-3" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
            <label className="block text-sm font-medium">পাসওয়ার্ড<input className="mt-1 w-full border rounded-lg px-3 py-3" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
            <button disabled={pending} className="w-full rounded-lg bg-primary text-white py-3 font-semibold disabled:opacity-60">{pending ? "লগইন হচ্ছে..." : "ইমেইল দিয়ে লগইন"}</button>
          </form>
          <button onClick={google} disabled={pending} className="w-full rounded-lg border border-border py-3 mt-3 font-semibold hover:bg-muted disabled:opacity-60">Google দিয়ে লগইন</button>
          <p className="text-sm text-center text-muted-foreground mt-6">অ্যাকাউন্ট নেই? <Link href="/register" className="text-secondary font-semibold hover:underline">রেজিস্টার করুন</Link></p>
        </div>
      </div>
    </Layout>
  );
}