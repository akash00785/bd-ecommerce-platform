import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { auth } from '@/firebase';

type Subscriber = { id: number; email: string; subscribedAt: string };

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Returns the current Firebase ID token header, or empty when not signed in. */
async function getAuthHeader(): Promise<Record<string, string>> {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSubscribers = async () => {
    setLoading(true);
    setError('');
    try {
      const authHeaders = await getAuthHeader();
      const response = await fetch(`${BASE}/api/newsletter/subscribers`, { headers: authHeaders });
      if (response.status === 401) throw new Error('অনুমতি নেই — অনুগ্রহ করে পুনরায় লগইন করুন।');
      if (response.status === 403) throw new Error('এই পেজটি শুধুমাত্র অ্যাডমিনদের জন্য।');
      if (!response.ok) throw new Error('সাবস্ক্রাইবার লোড করা যায়নি');
      const data = await response.json();
      setSubscribers(data.subscribers ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'সাবস্ক্রাইবার লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadSubscribers(); }, []);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">নিউজলেটার সাবস্ক্রাইবার</h1>
            <p className="text-sm text-gray-500 mt-1">মোট {subscribers.length} জন সক্রিয় সাবস্ক্রাইবার</p>
          </div>
          <button
            onClick={() => void loadSubscribers()}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-700"
          >
            রিফ্রেশ
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm border border-red-200">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <p className="p-8 text-center text-gray-400">লোড হচ্ছে...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">#</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">ইমেইল</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">সাবস্ক্রাইবের তারিখ</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {subscribers.map((subscriber, index) => (
                    <tr key={subscriber.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-gray-400">{index + 1}</td>
                      <td className="px-5 py-4 font-medium">{subscriber.email}</td>
                      <td className="px-5 py-4 text-gray-500">
                        {new Date(subscriber.subscribedAt).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!subscribers.length && (
                <p className="py-10 text-center text-gray-400">এখনও কোনো সাবস্ক্রাইবার নেই</p>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
