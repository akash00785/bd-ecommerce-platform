import { useState } from 'react';
import AdminLayout from './AdminLayout';
import { useListBanners, useCreateBanner } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const apiFetch = (path: string, opts?: RequestInit) => fetch(`${BASE}/api${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts });

export default function AdminBanners() {
  const { data: banners, refetch } = useListBanners();
  const { mutate: createBanner } = useCreateBanner();
  const qc = useQueryClient();
  const [url, setUrl] = useState('');
  const [link, setLink] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    createBanner({ data: { imageUrl: url, link, title, isActive: true } as any }, {
      onSuccess: () => { setUrl(''); setLink(''); setTitle(''); refetch(); qc.invalidateQueries(); }
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('এই ব্যানার মুছতে চান?')) return;
    await apiFetch(`/banners/${id}`, { method: 'DELETE' });
    refetch();
    qc.invalidateQueries();
  };

  const handleToggle = async (banner: any) => {
    await apiFetch(`/banners/${banner.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !banner.isActive }) });
    refetch();
    qc.invalidateQueries();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">ব্যানার ম্যানেজমেন্ট</h1>

        <form onSubmit={handleAdd} className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4">নতুন ব্যানার যোগ করুন</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">ছবির URL *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">টাইটেল</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={title} onChange={e => setTitle(e.target.value)} placeholder="ব্যানার টাইটেল" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">লিংক</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={link} onChange={e => setLink(e.target.value)} placeholder="/shop" />
            </div>
          </div>
          <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-700">যোগ করুন</button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(banners as any[])?.map((b: any) => (
            <div key={b.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <img src={b.imageUrl} alt={b.title} className="w-full h-40 object-cover" onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Image'; }} />
              <div className="p-3">
                <p className="font-medium text-sm line-clamp-1">{b.title || 'শিরোনাম নেই'}</p>
                {b.link && <p className="text-gray-500 text-xs mt-1">{b.link}</p>}
                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={() => handleToggle(b)}
                    className={`text-xs px-3 py-1 rounded-full font-medium ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {b.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="text-red-600 hover:underline text-xs">মুছুন</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {!(banners as any[])?.length && <p className="text-center text-gray-400 py-8 bg-white rounded-xl">কোনো ব্যানার নেই</p>}
      </div>
    </AdminLayout>
  );
}
