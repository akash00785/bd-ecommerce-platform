import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { useAuth, firebaseAuthMessage } from "@/context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("পাসওয়ার্ড দুটি একই নয়।");
      return;
    }
    setPending(true);
    try {
      await register(form.name, form.email, form.password);
      setVerificationSent(true);
    } catch (reason) {
      setError(firebaseAuthMessage(reason));
    } finally {
      setPending(false);
    }
  };

  if (verificationSent) {
    return (
      <Layout>
        <div className="min-h-[70vh] bg-muted/30 px-4 py-12 flex items-center justify-center">
          <div className="bg-card border border-border rounded-2xl shadow-sm w-full max-w-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">ইমেইল ভেরিফিকেশন প্রয়োজন</h2>
            <p className="text-muted-foreground mb-2">
              <strong>{form.email}</strong> ঠিকানায় একটি ভেরিফিকেশন ইমেইল পাঠানো হয়েছে।
            </p>
            <p className="text-muted-foreground text-sm mb-6">
              আপনার ইনবক্স চেক করুন এবং ভেরিফিকেশন লিঙ্কে ক্লিক করুন। তারপর লগইন করুন।
            </p>
            <Link
              href="/login"
              className="inline-block w-full rounded-lg bg-primary text-white py-3 font-semibold text-center"
            >
              লগইন পেজে যান
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[70vh] bg-muted/30 px-4 py-12 flex items-center justify-center">
        <div className="bg-card border border-border rounded-2xl shadow-sm w-full max-w-md p-8">
          <h1 className="text-3xl font-bold text-primary">অ্যাকাউন্ট তৈরি করুন</h1>
          <p className="text-muted-foreground mt-2 mb-8">রেজিস্টার করুন এবং ইমেইল ভেরিফাই করুন।</p>
          <form onSubmit={submit} className="space-y-4">
            {([["name", "নাম", "text"], ["email", "ইমেইল", "email"], ["password", "পাসওয়ার্ড", "password"], ["confirm", "পাসওয়ার্ড নিশ্চিত করুন", "password"]] as const).map(([key, label, type]) => (
              <label key={key} className="block text-sm font-medium">
                {label}
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-3"
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))}
                  required
                />
              </label>
            ))}
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
            <button
              disabled={pending}
              className="w-full rounded-lg bg-primary text-white py-3 font-semibold disabled:opacity-60"
            >
              {pending ? "তৈরি হচ্ছে..." : "রেজিস্টার করুন"}
            </button>
          </form>
          <p className="text-sm text-center text-muted-foreground mt-6">
            আগেই অ্যাকাউন্ট আছে?{" "}
            <Link href="/login" className="text-secondary font-semibold hover:underline">
              লগইন করুন
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
