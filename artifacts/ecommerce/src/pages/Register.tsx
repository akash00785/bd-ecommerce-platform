import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { useAuth, firebaseAuthMessage } from "@/context/AuthContext";

export default function Register() {
  const [, setLocation] = useLocation();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError("");
    if (form.password !== form.confirm) { setError("পাসওয়ার্ড দুটি একই নয়।"); return; }
    setPending(true);
    try { await register(form.name, form.email, form.password); setLocation("/account"); }
    catch (reason) { setError(firebaseAuthMessage(reason)); } finally { setPending(false); }
  };

  return (
    <Layout>
      <div className="min-h-[70vh] bg-muted/30 px-4 py-12 flex items-center justify-center">
        <div className="bg-card border border-border rounded-2xl shadow-sm w-full max-w-md p-8">
          <h1 className="text-3xl font-bold text-primary">অ্যাকাউন্ট তৈরি করুন</h1>
          <p className="text-muted-foreground mt-2 mb-8">অর্ডার ট্র্যাক করা আরও সহজ করুন।</p>
          <form onSubmit={submit} className="space-y-4">
            {([["name", "নাম", "text"], ["email", "ইমেইল", "email"], ["password", "পাসওয়ার্ড", "password"], ["confirm", "পাসওয়ার্ড নিশ্চিত করুন", "password"]] as const).map(([key, label, type]) => (
              <label key={key} className="block text-sm font-medium">{label}<input className="mt-1 w-full border rounded-lg px-3 py-3" type={type} value={form[key]} onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} required /></label>
            ))}
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
            <button disabled={pending} className="w-full rounded-lg bg-primary text-white py-3 font-semibold disabled:opacity-60">{pending ? "তৈরি হচ্ছে..." : "রেজিস্টার করুন"}</button>
          </form>
          <p className="text-sm text-center text-muted-foreground mt-6">আগেই অ্যাকাউন্ট আছে? <Link href="/login" className="text-secondary font-semibold hover:underline">লগইন করুন</Link></p>
        </div>
      </div>
    </Layout>
  );
}