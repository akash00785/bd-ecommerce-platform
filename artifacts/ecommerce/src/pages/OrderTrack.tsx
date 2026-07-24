import { useRoute } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { useTrackOrder, getTrackOrderQueryKey } from "@workspace/api-client-react";
import { Package, Truck, CheckCircle2, Clock, Search, XCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";

export default function OrderTrack() {
  const [, params] = useRoute("/track/:orderNumber");
  const orderNumber = params?.orderNumber;

  const { data: order, isLoading, isError } = useTrackOrder(orderNumber || "", {
    query: { enabled: !!orderNumber, queryKey: getTrackOrderQueryKey(orderNumber || "") }
  });

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending': return 1;
      case 'confirmed': return 2;
      case 'processing': return 3;
      case 'shipped': return 4;
      case 'delivered': return 5;
      case 'cancelled': return 0;
      default: return 1;
    }
  };

  if (!orderNumber) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-6">
            <Search size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-4">Track Your Order</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Please enter your order number below to check its current status.
          </p>
          <form 
            className="flex w-full max-w-sm"
            onSubmit={(e) => {
              e.preventDefault();
              const input = new FormData(e.currentTarget).get("orderNumber") as string;
              if (input) window.location.href = `/track/${input}`;
            }}
          >
            <input 
              name="orderNumber"
              placeholder="e.g. ORD-12345" 
              className="flex-1 h-12 px-4 rounded-l-xl border border-input focus:outline-none focus:ring-2 focus:ring-secondary uppercase"
              required
            />
            <button type="submit" className="bg-secondary hover:bg-secondary/90 text-white px-6 font-medium rounded-r-xl transition-colors">
              Track
            </button>
          </form>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 animate-pulse">
          <div className="h-8 w-64 bg-muted rounded mb-8"></div>
          <div className="h-40 bg-muted rounded-xl mb-8"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-64 bg-muted rounded-xl"></div>
            <div className="h-64 bg-muted rounded-xl"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mb-6">
            <XCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-muted-foreground mb-8">
            We couldn't find an order with number "{orderNumber}".
          </p>
          <a href="/track" className="text-secondary font-medium hover:underline">
            Try another number
          </a>
        </div>
      </Layout>
    );
  }

  const currentStep = getStatusStep(order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';

  return (
    <Layout>
      <div className="bg-muted/30 border-b border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2 flex items-center gap-3">
                Order <span className="text-secondary font-mono bg-white px-2 py-1 rounded-md border text-lg">{order.orderNumber}</span>
              </h1>
              <p className="text-muted-foreground">
                Placed on {format(new Date(order.createdAt), "MMMM dd, yyyy 'at' hh:mm a")}
              </p>
            </div>
            
            <div className="bg-white px-4 py-2 rounded-lg border border-border inline-flex items-center gap-2 self-start md:self-auto shadow-sm">
              <span className="text-sm font-medium text-muted-foreground">Total:</span>
              <span className="text-xl font-bold text-primary">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Tracking Timeline */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-10 mb-8 shadow-sm">
          <h2 className="text-xl font-bold mb-8">Delivery Status</h2>
          
          {isCancelled ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-center gap-3 border border-destructive/20">
              <XCircle size={24} />
              <div>
                <span className="font-bold block">Order Cancelled</span>
                <span className="text-sm">This order has been cancelled and will not be delivered.</span>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-6 right-6 h-1 bg-muted rounded-full hidden md:block">
                <div 
                  className="absolute top-0 left-0 h-full bg-secondary rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${(Math.max(0, currentStep - 1) / 4) * 100}%` }}
                ></div>
              </div>

              <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-0">
                {/* Step 1: Pending */}
                <div className="flex md:flex-col items-center md:text-center gap-4 md:gap-3 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${currentStep >= 1 ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'bg-muted text-muted-foreground'}`}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <span className={`font-bold block ${currentStep >= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>Order Placed</span>
                    <span className="text-xs text-muted-foreground">We have received your order</span>
                  </div>
                </div>

                {/* Step 2: Confirmed */}
                <div className="flex md:flex-col items-center md:text-center gap-4 md:gap-3 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${currentStep >= 2 ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'bg-muted text-muted-foreground'}`}>
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <span className={`font-bold block ${currentStep >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>Confirmed</span>
                    <span className="text-xs text-muted-foreground">Order has been verified</span>
                  </div>
                </div>

                {/* Step 3: Processing */}
                <div className="flex md:flex-col items-center md:text-center gap-4 md:gap-3 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${currentStep >= 3 ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'bg-muted text-muted-foreground'}`}>
                    <Package size={20} />
                  </div>
                  <div>
                    <span className={`font-bold block ${currentStep >= 3 ? 'text-foreground' : 'text-muted-foreground'}`}>Processing</span>
                    <span className="text-xs text-muted-foreground">Items are being packed</span>
                  </div>
                </div>

                {/* Step 4: Shipped */}
                <div className="flex md:flex-col items-center md:text-center gap-4 md:gap-3 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${currentStep >= 4 ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'bg-muted text-muted-foreground'}`}>
                    <Truck size={20} />
                  </div>
                  <div>
                    <span className={`font-bold block ${currentStep >= 4 ? 'text-foreground' : 'text-muted-foreground'}`}>Shipped</span>
                    <span className="text-xs text-muted-foreground">Handed over to courier</span>
                  </div>
                </div>

                {/* Step 5: Delivered */}
                <div className="flex md:flex-col items-center md:text-center gap-4 md:gap-3 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${currentStep >= 5 ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-muted text-muted-foreground'}`}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <span className={`font-bold block ${currentStep >= 5 ? 'text-green-600' : 'text-muted-foreground'}`}>Delivered</span>
                    <span className="text-xs text-muted-foreground">Package arrived</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 border-b border-border pb-2">Order Items</h3>
            <div className="flex flex-col gap-4 mb-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-16 h-16 bg-muted rounded-xl overflow-hidden shrink-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold block line-clamp-1">{item.title}</span>
                    <div className="text-sm text-muted-foreground flex gap-2">
                      <span>Qty: {item.quantity}</span>
                      {(item.size || item.color) && (
                        <span>| {item.size} {item.color}</span>
                      )}
                    </div>
                    <span className="font-bold text-primary text-sm mt-1 block">{formatPrice(item.price)}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-muted/50 p-4 rounded-xl space-y-2 mt-6 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(order.totalAmount - order.shippingFee + (order.discountAmount || 0))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">{formatPrice(order.shippingFee)}</span>
              </div>
              {order.discountAmount && order.discountAmount > 0 && (
                <div className="flex justify-between text-secondary">
                  <span>Discount</span>
                  <span className="font-medium">-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 mt-2 font-bold text-base">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-fit">
            <h3 className="font-bold text-lg mb-4 border-b border-border pb-2">Delivery Information</h3>
            
            <div className="space-y-6">
              <div>
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1 block">Shipping Address</span>
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {order.shippingAddress.address}<br />
                  {order.shippingAddress.upazila && `${order.shippingAddress.upazila}, `}
                  {order.shippingAddress.district}, {order.shippingAddress.division}
                </p>
                <p className="text-sm font-medium mt-2">{order.shippingAddress.phone}</p>
              </div>

              <div>
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1 block">Payment Method</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-muted px-3 py-1 rounded-md text-sm font-medium uppercase border border-border">
                    {order.paymentMethod}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              {order.trackingId && (
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1 block">Courier Tracking ID</span>
                  <span className="font-mono bg-secondary/10 text-secondary px-3 py-1.5 rounded-lg border border-secondary/20 inline-block mt-1 font-bold">
                    {order.trackingId}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
