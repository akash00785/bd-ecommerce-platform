import { Link, useLocation } from "wouter";
import { getListOrdersQueryKey, useListOrders } from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import { Heart, LogOut, Package, ArrowRight } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";

export default function Account() {
  const { user, logout } = useAuth();
  const wishlistCount = useWishlistStore((state) => state.productIds.length);
  const [, setLocation] = useLocation();
  const orderParams = { customerEmail: user?.email ?? "", limit: 10 };
  const { data, isLoading } = useListOrders(orderParams, { query: { enabled: Boolean(user?.email), queryKey: getListOrdersQueryKey(orderParams) } });

  if (!user) return null;
  return (
    <Layout>
      <div className="bg-muted/30 border-b border-border py-8"><div className="container mx-auto px-4"><h1 className="text-3xl font-bold text-primary">আমার অ্যাকাউন্ট</h1><p className="text-muted-foreground mt-1">আপনার প্রোফাইল ও অর্ডার এক জায়গায়।</p></div></div>
      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-[280px_1fr] gap-8">
        <aside className="bg-card border border-border rounded-2xl p-6 h-fit">
          <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-2xl font-bold text-secondary">{(user.displayName || user.email || "U")[0].toUpperCase()}</div>
          <h2 className="font-bold text-lg mt-4">{user.displayName || "Bazaar BD customer"}</h2>
          <p className="text-sm text-muted-foreground break-all mt-1">{user.email}</p>
          <button onClick={async () => { await logout(); setLocation("/login"); }} className="mt-6 text-sm text-red-600 flex items-center gap-2 hover:underline"><LogOut size={16} /> লগআউট</button>
           <Link href="/shop" className="mt-4 text-sm text-secondary flex items-center gap-2 hover:underline"><Heart size={16} /> উইশলিস্ট ({wishlistCount})</Link>
        </aside>
        <section>
          <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold">সাম্প্রতিক অর্ডার</h2><Link href="/account/orders" className="text-secondary text-sm font-semibold">সব অর্ডার দেখুন</Link></div>
          {isLoading ? <div className="h-32 rounded-2xl bg-muted animate-pulse" /> : !data?.orders?.length ? <div className="bg-card border border-border rounded-2xl p-10 text-center"><Package className="mx-auto text-muted-foreground" /><p className="mt-3 text-muted-foreground">এখনও কোনো অর্ডার নেই।</p><Link href="/shop" className="inline-block mt-5 bg-secondary text-white rounded-lg px-5 py-2">শপিং শুরু করুন</Link></div> : <div className="space-y-3">{data.orders.slice(0, 3).map((order) => <div key={order.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4"><div><p className="font-mono font-semibold">{order.orderNumber}</p><p className="text-sm text-muted-foreground">{order.orderStatus} · {formatPrice(order.totalAmount)}</p></div><Link href={`/track/${order.orderNumber}`} className="text-secondary"><ArrowRight size={18} /></Link></div>)}</div>}
        </section>
      </div>
    </Layout>
  );
}