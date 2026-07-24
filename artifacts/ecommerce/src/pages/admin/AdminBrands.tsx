import { useState } from 'react';
import AdminLayout from './AdminLayout';
import { useListBrands, useCreateBrand } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const apiFetch = (path: string, opts?: RequestInit) => fetch(`${BASE}/api${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts });

export default function AdminBrands() {
  const { data: brands, refetch } = useListBrands();
  const { mutate: createBrand } = useCreateBrand();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', slug: '', logo: '', description: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', slug: '', logo: '', description: '' });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createBrand({ data: form }, {
      onSuccess: () => { setForm({ name: '', slug: '', logo: '', description: '' }); refetch(); qc.invalidateQueries(); }
    });
  };

  const handleUpdate = async (id: number) => {
    await apiFetch(`/brands/${id}`, { method: 'PATCH', body: JSON.stringify(editForm) });
    setEditId(null);
    refetch();
    qc.invalidateQueries();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('এই ব্র্যান্ড মুছতে চান?')) return;
    await apiFetch(`/brands/${id}`, { method: 'DELETE' });
    refetch();
    qc.invalidateQueries();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">ব্র্যান্ড ম্যানেজমেন্ট</h1>

        <form onSubmit={handleCreate} className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4">নতুন ব্র্যান্ড</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">নাম *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">স্লাগ *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">লোগো URL</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.logo} onChange={e => setForm(p => ({ ...p, logo: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">বিবরণ</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-700">যোগ করুন</button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(brands as any[])?.map((b: any) => (
            <div key={b.id} className="bg-white rounded-xl shadow-sm p-4">
              {editId === b.id ? (
                <div className="space-y-2">
                  <input className="w-full border rounded px-2 py-1 text-sm" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} placeholder="নাম" />
                  <input className="w-full border rounded px-2 py-1 text-sm" value={editForm.slug} onChange={e => setEditForm(p => ({ ...p, slug: e.target.value }))} placeholder="স্লাগ" />
                  <input className="w-full border rounded px-2 py-1 text-sm" value={editForm.logo} onChange={e => setEditForm(p => ({ ...p, logo: e.target.value }))} placeholder="লোগো URL" />
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(b.id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs">সেভ</button>
                    <button onClick={() => setEditId(null)} className="bg-gray-200 px-3 py-1 rounded text-xs">বাতিল</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {b.logo ? <img src={b.logo} className="w-12 h-12 object-contain rounded" alt={b.name} /> : <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-500 text-xs">No logo</div>}
                  <div className="flex-1">
                    <p className="font-semibold">{b.name}</p>
                    <p className="text-gray-500 text-xs">{b.slug}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => { setEditId(b.id); setEditForm({ name: b.name, slug: b.slug, logo: b.logo || '', description: b.description || '' }); }} className="text-blue-600 hover:underline text-xs">এডিট</button>
                    <button onClick={() => handleDelete(b.id)} className="text-red-600 hover:underline text-xs">মুছুন</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
