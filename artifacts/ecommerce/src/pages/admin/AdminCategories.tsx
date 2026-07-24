import { useState } from 'react';
import AdminLayout from './AdminLayout';
import { useListCategories, useCreateCategory } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const apiFetch = (path: string, opts?: RequestInit) => fetch(`${BASE}/api${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts });

export default function AdminCategories() {
  const { data: categories, refetch } = useListCategories();
  const { mutate: createCategory } = useCreateCategory();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', slug: '', icon: '', description: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', slug: '', icon: '', description: '' });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createCategory({ data: form }, {
      onSuccess: () => { setForm({ name: '', slug: '', icon: '', description: '' }); refetch(); qc.invalidateQueries(); }
    });
  };

  const handleUpdate = async (id: number) => {
    await apiFetch(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(editForm) });
    setEditId(null);
    refetch();
    qc.invalidateQueries();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('এই ক্যাটাগরি মুছতে চান?')) return;
    await apiFetch(`/categories/${id}`, { method: 'DELETE' });
    refetch();
    qc.invalidateQueries();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">ক্যাটাগরি ম্যানেজমেন্ট</h1>

        <form onSubmit={handleCreate} className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4">নতুন ক্যাটাগরি</h2>
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
              <label className="block text-sm font-medium mb-1">আইকন</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} placeholder="📱" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">বিবরণ</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-700">যোগ করুন</button>
        </form>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">আইকন</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">নাম</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">স্লাগ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">বিবরণ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(categories as any[])?.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  {editId === c.id ? (
                    <>
                      <td className="px-4 py-2"><input className="w-16 border rounded px-2 py-1 text-xs" value={editForm.icon} onChange={e => setEditForm(p => ({ ...p, icon: e.target.value }))} /></td>
                      <td className="px-4 py-2"><input className="w-full border rounded px-2 py-1 text-xs" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} /></td>
                      <td className="px-4 py-2"><input className="w-full border rounded px-2 py-1 text-xs" value={editForm.slug} onChange={e => setEditForm(p => ({ ...p, slug: e.target.value }))} /></td>
                      <td className="px-4 py-2"><input className="w-full border rounded px-2 py-1 text-xs" value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} /></td>
                      <td className="px-4 py-2">
                        <button onClick={() => handleUpdate(c.id)} className="text-green-600 hover:underline text-xs mr-2">সেভ</button>
                        <button onClick={() => setEditId(null)} className="text-gray-600 hover:underline text-xs">বাতিল</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-2xl">{c.icon || '-'}</td>
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-gray-500">{c.slug}</td>
                      <td className="px-4 py-3 text-gray-500">{c.description || '-'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => { setEditId(c.id); setEditForm({ name: c.name, slug: c.slug, icon: c.icon || '', description: c.description || '' }); }} className="text-blue-600 hover:underline text-xs mr-2">এডিট</button>
                        <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline text-xs">মুছুন</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
