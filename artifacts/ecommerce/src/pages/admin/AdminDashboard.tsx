import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { useGetDashboardStats, useGetRecentOrders, useGetLowStockProducts } from '@workspace/api-client-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

function StatCard({ label, value, icon, color, sub }: { label: string; value: string | number; icon: string; color: string; sub?: string }) {
  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${color}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats } = useGetDashboardStats();
  const { data: recentOrders } = useGetRecentOrders();
  const { data: lowStock } = useGetLowStockProducts();
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${BASE}/api/dashboard/revenue`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setRevenueData(data);
      })
      .catch(() => {});
  }, []);

  const s = stats as any;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">ড্যাশবোর্ড</h1>
          <span className="text-xs text-gray-400">আজকের তারিখ: {new Date().toLocaleDateString('bn-BD')}</span>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="মোট রেভিনিউ" value={`৳${((s?.totalRevenue as number) || 0).toLocaleString()}`} icon="💰" color="border-green-500" sub={`আজ: ৳${((s?.todayRevenue as number) || 0).toLocaleString()}`} />
          <StatCard label="মোট অর্ডার" value={(s?.totalOrders as number) || 0} icon="🛒" color="border-blue-500" sub={`আজ: ${(s?.todayOrders as number) || 0}টি`} />
          <StatCard label="পেন্ডিং অর্ডার" value={(s?.pendingOrders as number) || 0} icon="⏳" color="border-yellow-500" sub={`শিপড: ${(s?.shippedOrders as number) || 0}`} />
          <StatCard label="লো স্টক প্রোডাক্ট" value={(s?.lowStockCount as number) || 0} icon="⚠️" color="border-red-500" sub={`মোট প্রোডাক্ট: ${(s?.totalProducts as number) || 0}`} />
        </div>

        {/* Revenue Chart — real DB data */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">মাসিক রেভিনিউ (সর্বশেষ ৬ মাস)</h2>
            {revenueData.length === 0 && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">ডেটা লোড হচ্ছে...</span>}
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData.length > 0 ? revenueData : [{ name: 'কোনো ডেটা নেই', revenue: 0, orders: 0 }]}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip formatter={(v: number, name: string) => [name === 'revenue' ? `৳${v.toLocaleString()}` : `${v}টি`, name === 'revenue' ? 'রেভিনিউ' : 'অর্ডার']} />
              <Area type="monotone" dataKey="revenue" stroke="#16a34a" fill="url(#colorRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">সাম্প্রতিক অর্ডার</h2>
            <div className="space-y-3">
              {(recentOrders as any[])?.slice(0, 6).map((order: any) => (
                <div key={order.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">#{order.orderNumber}</p>
                    <p className="text-gray-500 text-xs">{order.shippingAddress?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">৳{order.totalAmount?.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${order.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
              {!(recentOrders as any[])?.length && <p className="text-gray-400 text-sm text-center py-4">কোনো অর্ডার নেই</p>}
            </div>
          </div>

          {/* Low Stock */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">লো স্টক প্রোডাক্ট</h2>
            <div className="space-y-3">
              {(lowStock as any[])?.slice(0, 6).map((p: any) => (
                <div key={p.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    {p.images?.[0] && <img src={p.images[0]} className="w-8 h-8 rounded object-cover" />}
                    <p className="text-sm font-medium line-clamp-1">{p.title}</p>
                  </div>
                  <span className={`font-bold text-sm px-2 py-0.5 rounded-full ${p.stock <= 2 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>{p.stock} বাকি</span>
                </div>
              ))}
              {!(lowStock as any[])?.length && <p className="text-gray-400 text-sm text-center py-4">কোনো লো স্টক প্রোডাক্ট নেই</p>}
            </div>
          </div>
        </div>

        {/* Order Status Summary */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">অর্ডার স্ট্যাটাস সারসংক্ষেপ</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'পেন্ডিং', key: 'pendingOrders', color: 'bg-yellow-100 text-yellow-700' },
              { label: 'কনফার্ম', key: 'confirmedOrders', color: 'bg-blue-100 text-blue-700' },
              { label: 'শিপড', key: 'shippedOrders', color: 'bg-indigo-100 text-indigo-700' },
              { label: 'ডেলিভার্ড', key: 'deliveredOrders', color: 'bg-green-100 text-green-700' },
              { label: 'বাতিল', key: 'cancelledOrders', color: 'bg-red-100 text-red-700' },
              { label: 'মোট', key: 'totalOrders', color: 'bg-gray-100 text-gray-700' },
            ].map(item => (
              <div key={item.key} className={`rounded-lg p-3 text-center ${item.color}`}>
                <p className="text-2xl font-bold">{(s?.[item.key] as number) || 0}</p>
                <p className="text-xs mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
