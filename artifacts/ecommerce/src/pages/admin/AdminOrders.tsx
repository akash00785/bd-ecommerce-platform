import { useState } from 'react';
import AdminLayout from './AdminLayout';
import { useListOrders, useUpdateOrderStatus, useGetOrder } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_BN: Record<string, string> = {
  pending: 'পেন্ডিং', confirmed: 'কনফার্ম', processing: 'প্রসেসিং',
  shipped: 'শিপড', delivered: 'ডেলিভার্ড', cancelled: 'বাতিল'
};

function OrderDetail({ orderId, onClose }: { orderId: number; onClose: () => void }) {
  const { data: order } = useGetOrder(orderId);
  const o = order as any;
  if (!o) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="print-invoice bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="no-print flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">অর্ডার #{o.orderNumber}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <div className="hidden print:block mb-5 text-center border-b pb-4">
          <h1 className="text-2xl font-bold">BD E-Commerce</h1>
          <p className="text-sm text-gray-500">Invoice / Memo · #{o.orderNumber}</p>
          <p className="text-xs text-gray-400">{o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-GB') : ''}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-semibold mb-2">কাস্টমার তথ্য</p>
            <p>নাম: {o.shippingAddress?.name}</p>
            <p>ফোন: {o.shippingAddress?.phone}</p>
            {o.customerEmail && <p>ইমেইল: {o.customerEmail}</p>}
            <p>ঠিকানা: {o.shippingAddress?.address}, {o.shippingAddress?.upazila}, {o.shippingAddress?.district}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-semibold mb-2">পেমেন্ট তথ্য</p>
            <p>পদ্ধতি: {o.paymentMethod}</p>
            <p>স্ট্যাটাস: {o.paymentStatus}</p>
            {o.transactionId && <p>ট্রানজেকশন: {o.transactionId}</p>}
          </div>
        </div>
        <div className="border rounded-lg overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">প্রোডাক্ট</th>
                <th className="px-3 py-2">পরিমাণ</th>
                <th className="px-3 py-2">মূল্য</th>
              </tr>
            </thead>
            <tbody>
              {o.items?.map((item: any, i: number) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2">{item.title || item.productTitle}</td>
                  <td className="px-3 py-2 text-center">{item.quantity}</td>
                  <td className="px-3 py-2 text-center">৳{(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ml-auto max-w-xs space-y-2 text-sm">
          <div className="flex justify-between"><span>সাবটোটাল</span><span>৳{(Number(o.totalAmount || 0) - Number(o.shippingFee || 0) + Number(o.discountAmount || 0)).toLocaleString()}</span></div>
          <div className="flex justify-between"><span>ডেলিভারি চার্জ</span><span>৳{Number(o.shippingFee || 0).toLocaleString()}</span></div>
          {Number(o.discountAmount || 0) > 0 && <div className="flex justify-between text-green-700"><span>ডিসকাউন্ট</span><span>-৳{Number(o.discountAmount).toLocaleString()}</span></div>}
          <div className="flex justify-between border-t pt-2 font-bold text-base"><span>সর্বমোট</span><span>৳{Number(o.totalAmount || 0).toLocaleString()}</span></div>
        </div>
        <button onClick={() => window.print()} className="no-print mt-5 w-full rounded-lg bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-700">🖨️ Print Invoice / Memo</button>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data: ordersData, refetch } = useListOrders({ status: statusFilter || undefined } as any);
  const { mutate: updateStatus } = useUpdateOrderStatus();
  const [viewId, setViewId] = useState<number | null>(null);
  const qc = useQueryClient();

  const orders = (ordersData as any)?.orders || [];

  const handleStatusChange = (id: number, orderStatus: string) => {
    updateStatus({ id, data: { orderStatus } as any }, {
      onSuccess: () => { refetch(); qc.invalidateQueries(); }
    });
  };

  return (
    <AdminLayout>
      {viewId && <OrderDetail orderId={viewId} onClose={() => setViewId(null)} />}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">অর্ডার ম্যানেজমেন্ট</h1>

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setStatusFilter('')} className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === '' ? 'bg-gray-900 text-white' : 'bg-white border hover:bg-gray-50'}`}>সব</button>
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === s ? 'bg-gray-900 text-white' : 'bg-white border hover:bg-gray-50'}`}>
              {STATUS_BN[s]}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">অর্ডার #</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">কাস্টমার</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">মোট</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">পেমেন্ট</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">স্ট্যাটাস</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{o.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.shippingAddress?.name}</p>
                      <p className="text-gray-500 text-xs">{o.shippingAddress?.phone}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold">৳{o.totalAmount?.toLocaleString()}</td>
                    <td className="px-4 py-3">{o.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${STATUS_COLORS[o.orderStatus]}`}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_BN[s]}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setViewId(o.id)} className="text-blue-600 hover:underline text-xs">বিস্তারিত</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <p className="text-center text-gray-400 py-8">কোনো অর্ডার পাওয়া যায়নি</p>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
