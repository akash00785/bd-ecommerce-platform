import { useState } from 'react';
import AdminLayout from './AdminLayout';
import { useListCoupons, useCreateCoupon } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const apiFetch = (path: string, opts?: RequestInit) => fetch(`${BASE}/api${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts });

export default function AdminCoupons() {
  const { data: coupons, refetch } = useListCoupons();
  const { mutate: createCoupon } = useCreateCoupon();
  const qc = useQueryClient();
  const [form, setForm] = useState({ code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', expiryDate: '', maxUses: '' });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCoupon({
      data: {
        code: form.code,
        discountType: form.discountType as any,
        discountAmount: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
        expiryDate: form.expiryDate || undefined,
        active: true,
      }
    }, {
      onSuccess: () => { setForm({ code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', expiryDate: '', maxUses: '' }); refetch(); qc.invalidateQueries(); }
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('এই কুপন মুছতে চান?')) return;
    await apiFetch(`/coupons/${id}`, { method: 'DELETE' });
    refetch();
    qc.invalidateQueries();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">কুপন ম্যানেজমেন্ট</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4">নতুন কুপন তৈরি করুন</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">কুপন কোড *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm uppercase" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="WELCOME10" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ধরন *</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.discountType} onChange={e => set('discountType', e.target.value)}>
                <option value="percentage">শতকরা (%)</option>
                <option value="fixed">নির্দিষ্ট পরিমাণ (৳)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">পরিমাণ *</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.discountValue} onChange={e => set('discountValue', e.target.value)} placeholder="10" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ন্যূনতম অর্ডার (৳)</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.minOrderAmount} onChange={e => set('minOrderAmount', e.target.value)} placeholder="500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">মেয়াদ শেষ তারিখ</label>
              <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">সর্বোচ্চ ব্যবহার</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.maxUses} onChange={e => set('maxUses', e.target.value)} placeholder="100" />
            </div>
          </div>
          <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-700">কুপন তৈরি করুন</button>
        </form>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">কোড</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ধরন</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">পরিমাণ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ন্যূনতম অর্ডার</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">মেয়াদ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">স্ট্যাটাস</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(coupons as any[])?.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-bold text-green-700">{c.code}</td>
                  <td className="px-4 py-3">{c.discountType === 'percentage' ? 'শতকরা' : 'নির্দিষ্ট'}</td>
                  <td className="px-4 py-3">{c.discountType === 'percentage' ? `${c.discountValue}%` : `৳${c.discountValue}`}</td>
                  <td className="px-4 py-3">{c.minOrderAmount ? `৳${c.minOrderAmount}` : '-'}</td>
                  <td className="px-4 py-3">{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString('bn-BD') : 'সীমাহীন'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline text-xs">মুছুন</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!(coupons as any[])?.length && <p className="text-center text-gray-400 py-8">কোনো কুপন নেই</p>}
        </div>
      </div>
    </AdminLayout>
  );
}
