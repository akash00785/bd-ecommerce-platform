import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { auth } from '@/firebase';

type Review = {
  id: number;
  productId: number;
  customerName: string;
  customerPhone?: string | null;
  rating: number;
  comment?: string | null;
  createdAt: string;
};

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Returns the current Firebase ID token, or null when not signed in. */
async function getAuthHeader(): Promise<Record<string, string>> {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const loadReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const authHeaders = await getAuthHeader();
      const response = await fetch(`${BASE}/api/reviews/admin`, { headers: authHeaders });
      if (response.status === 401) throw new Error('অনুমতি নেই — অনুগ্রহ করে পুনরায় লগইন করুন।');
      if (response.status === 403) throw new Error('এই পেজটি শুধুমাত্র অ্যাডমিনদের জন্য।');
      if (!response.ok) throw new Error('রিভিউ লোড করা যায়নি');
      setReviews((await response.json()).reviews ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'রিভিউ লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadReviews(); }, []);

  const moderate = async (id: number, approved: boolean) => {
    setBusyId(id);
    setError('');
    try {
      const authHeaders = await getAuthHeader();
      const response = await fetch(`${BASE}/api/reviews/${id}/moderation`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ approved }),
      });
      if (response.status === 401) throw new Error('অনুমতি নেই — অনুগ্রহ করে পুনরায় লগইন করুন।');
      if (response.status === 403) throw new Error('এই অ্যাকশনটি শুধুমাত্র অ্যাডমিনদের জন্য।');
      if (!response.ok) throw new Error('রিভিউ আপডেট করা যায়নি');
      setReviews((current) => current.filter((review) => review.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'রিভিউ আপডেট করা যায়নি');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">রিভিউ মডারেশন</h1>
            <p className="text-sm text-gray-500 mt-1">অনুমোদনের অপেক্ষায় থাকা {reviews.length}টি রিভিউ</p>
          </div>
          <button
            onClick={() => void loadReviews()}
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

        <div className="grid gap-4">
          {loading ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">লোড হচ্ছে...</div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center text-gray-400">
              <p className="text-4xl mb-3">⭐</p>
              <p>কোনো pending রিভিউ নেই</p>
            </div>
          ) : (
            reviews.map((review) => (
              <article
                key={review.id}
                className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h2 className="font-semibold text-gray-800">{review.customerName}</h2>
                      <span className="text-amber-500">
                        {'★'.repeat(review.rating)}
                        <span className="text-gray-200">{'★'.repeat(5 - review.rating)}</span>
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Product #{review.productId} · {new Date(review.createdAt).toLocaleDateString('bn-BD')}
                    </p>
                    {review.customerPhone && (
                      <p className="text-sm text-gray-500">{review.customerPhone}</p>
                    )}
                    <p className="text-gray-700">{review.comment || 'কোনো মন্তব্য নেই'}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      disabled={busyId === review.id}
                      onClick={() => void moderate(review.id, true)}
                      className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      অনুমোদন
                    </button>
                    <button
                      disabled={busyId === review.id}
                      onClick={() => void moderate(review.id, false)}
                      className="px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm hover:bg-red-100 border border-red-200 disabled:opacity-50"
                    >
                      প্রত্যাখ্যান
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
