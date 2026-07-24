import { getListOrdersQueryKey, useListOrders } from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { Link } from "wouter";
import { Package, ArrowRight, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";

export default function OrderHistory() {
  const { user } = useAuth();
  const orderParams = { customerEmail: user?.email ?? "", limit: 10 };
  const { data, isLoading } = useListOrders(orderParams, { query: { enabled: Boolean(user?.email), queryKey: getListOrdersQueryKey(orderParams) } });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': 
      case 'confirmed':
      case 'processing':
        return <span className="bg-yellow-100 text-yellow-700 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase"><Clock size={12} /> {status}</span>;
      case 'shipped': 
        return <span className="bg-blue-100 text-blue-700 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase"><Truck size={12} /> {status}</span>;
      case 'delivered': 
        return <span className="bg-green-100 text-green-700 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase"><CheckCircle2 size={12} /> {status}</span>;
      case 'cancelled': 
        return <span className="bg-red-100 text-red-700 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase"><XCircle size={12} /> {status}</span>;
      default: 
        return <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase">{status}</span>;
    }
  };

  return (
    <Layout>
      <div className="bg-muted/30 border-b border-border py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-primary">My Orders</h1>
          <p className="text-muted-foreground mt-1">View and track your recent orders.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-card rounded-2xl animate-pulse border border-border"></div>
            ))}
          </div>
        ) : !data?.orders || data.orders.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border shadow-sm">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground mx-auto mb-6">
              <Package size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">No orders found</h2>
            <p className="text-muted-foreground mb-8">You haven't placed any orders yet.</p>
            <Link href="/shop" className="bg-secondary hover:bg-secondary/90 text-white font-medium px-6 py-3 rounded-xl transition-colors inline-block">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {data.orders.map((order) => (
              <div key={order.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                
                {/* Header */}
                <div className="bg-muted/30 p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col md:flex-row gap-2 md:gap-8">
                    <div>
                      <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider block">Order Placed</span>
                      <span className="font-medium text-sm">{format(new Date(order.createdAt), "MMM dd, yyyy")}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider block">Total</span>
                      <span className="font-medium text-sm text-primary font-bold">{formatPrice(order.totalAmount)}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider block">Order #</span>
                      <span className="font-mono text-sm font-semibold">{order.orderNumber}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                    {getStatusBadge(order.orderStatus)}
                    <Link href={`/track/${order.orderNumber}`} className="text-sm font-medium text-secondary hover:underline flex items-center gap-1">
                      Track <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
                
                {/* Items */}
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center">
                        <div className="w-16 h-16 bg-muted rounded-xl overflow-hidden shrink-0 border border-border">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <Link href={`/product/${item.productId}`} className="font-semibold text-foreground hover:text-secondary transition-colors line-clamp-1">
                              {item.title}
                            </Link>
                            <span className="text-sm text-muted-foreground mt-1 block">Qty: {item.quantity}</span>
                          </div>
                          <Link href={`/product/${item.productId}`} className="sm:hidden text-sm text-secondary font-medium">Buy Again</Link>
                          <Link href={`/product/${item.productId}`} className="hidden sm:inline-flex bg-muted hover:bg-muted/80 text-foreground text-sm font-medium px-4 py-2 rounded-lg border border-border transition-colors">
                            Buy Again
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
