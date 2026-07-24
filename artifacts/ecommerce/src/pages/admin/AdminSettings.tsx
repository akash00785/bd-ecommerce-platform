import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { useGetSiteSettings, useUpdateSiteSettings } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

const SETTING_GROUPS = [
  {
    title: 'বিকাশ (bKash) সেটিং',
    icon: '📱',
    color: 'border-pink-400',
    keys: [
      { key: 'bkash_personal_number', label: 'বিকাশ পার্সোনাল নম্বর' },
      { key: 'bkash_merchant_number', label: 'বিকাশ মার্চেন্ট নম্বর' },
      { key: 'bkash_reference', label: 'বিকাশ রেফারেন্স' },
    ],
  },
  {
    title: 'নগদ (Nagad) সেটিং',
    icon: '💳',
    color: 'border-orange-400',
    keys: [
      { key: 'nagad_personal_number', label: 'নগদ পার্সোনাল নম্বর' },
      { key: 'nagad_merchant_number', label: 'নগদ মার্চেন্ট নম্বর' },
    ],
  },
  {
    title: 'রকেট (Rocket) সেটিং',
    icon: '🚀',
    color: 'border-purple-400',
    keys: [
      { key: 'rocket_personal_number', label: 'রকেট পার্সোনাল নম্বর' },
      { key: 'rocket_merchant_number', label: 'রকেট মার্চেন্ট নম্বর' },
    ],
  },
  {
    title: 'ক্যাশ অন ডেলিভারি',
    icon: '💵',
    color: 'border-green-400',
    keys: [
      { key: 'cod_number', label: 'COD যোগাযোগ নম্বর' },
    ],
  },
  {
    title: 'শিপিং ফি',
    icon: '🚚',
    color: 'border-blue-400',
    keys: [
      { key: 'shipping_dhaka', label: 'ঢাকার ভেতরে শিপিং (৳)' },
      { key: 'shipping_outside_dhaka', label: 'ঢাকার বাইরে শিপিং (৳)' },
    ],
  },
  {
    title: 'সাইট তথ্য',
    icon: '🌐',
    color: 'border-gray-400',
    keys: [
      { key: 'site_name', label: 'সাইটের নাম' },
      { key: 'site_email', label: 'ইমেইল' },
      { key: 'site_phone', label: 'ফোন নম্বর' },
      { key: 'site_address', label: 'ঠিকানা' },
      { key: 'facebook_url', label: 'ফেসবুক লিংক' },
      { key: 'instagram_url', label: 'ইনস্টাগ্রাম লিংক' },
    ],
  },
];

export default function AdminSettings() {
  const { data: settings } = useGetSiteSettings();
  const { mutate: updateSettings } = useUpdateSiteSettings();
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      const map: Record<string, string> = {};
      (settings as any[]).forEach((s: any) => { map[s.key] = s.value; });
      setValues(map);
    }
  }, [settings]);

  const handleSave = (groupKeys: string[]) => {
    const settingsToUpdate = groupKeys.map(key => ({ key, value: values[key] || '' }));
    updateSettings({ data: { settings: settingsToUpdate } }, {
      onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000); qc.invalidateQueries(); }
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">ডায়নামিক সেটিংস</h1>
          {saved && <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">সেভ হয়েছে!</span>}
        </div>
        <p className="text-gray-500 text-sm">এখান থেকে পেমেন্ট নম্বর, শিপিং ফি, ও সাইটের তথ্য পরিবর্তন করুন। কোনো কোড পরিবর্তন না করেই লাইভ সাইটে আপডেট হবে।</p>

        {SETTING_GROUPS.map((group) => (
          <div key={group.title} className={`bg-white rounded-xl shadow-sm border-l-4 ${group.color}`}>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{group.icon}</span>
                <h2 className="text-lg font-semibold">{group.title}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {group.keys.map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={values[key] || ''}
                      onChange={e => setValues(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={`${label} লিখুন`}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleSave(group.keys.map(k => k.key))}
                className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-700 transition"
              >
                সেভ করুন
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
