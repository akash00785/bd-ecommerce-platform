import { useState } from 'react';
import { useLocation } from 'wouter';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Verify that this Firebase account has admin privileges by calling a
      // protected admin endpoint. If the server returns 401/403 it is not an admin.
      const token = await result.user.getIdToken();
      const check = await fetch(`${import.meta.env.BASE_URL}api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!check.ok) {
        await auth.signOut();
        setError('এই অ্যাকাউন্টে অ্যাডমিন অ্যাক্সেস নেই।');
        setLoading(false);
        return;
      }

      // Admin verified — navigate to admin panel
      setLocation('/admin');
    } catch (err: any) {
      const code = err?.code ?? '';
      const messages: Record<string, string> = {
        'auth/invalid-credential': 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।',
        'auth/user-not-found': 'এই ইমেইলে কোনো অ্যাকাউন্ট নেই।',
        'auth/wrong-password': 'পাসওয়ার্ড সঠিক নয়।',
        'auth/too-many-requests': 'অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।',
      };
      setError(messages[code] ?? 'লগইন সম্পন্ন হয়নি। আবার চেষ্টা করুন।');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-gray-500 mt-1">BD E-Commerce প্ল্যাটফর্ম</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="admin@example.com"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="পাসওয়ার্ড লিখুন"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-60"
          >
            {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
          </button>
        </form>

        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-center text-xs text-gray-500">
            অ্যাডমিন অ্যাক্সেসের জন্য Firebase-এ <code className="bg-gray-200 px-1 rounded">ADMIN_UIDS</code> সেট করুন অথবা কাস্টম ক্লেইম যোগ করুন
          </p>
        </div>
      </div>
    </div>
  );
}
