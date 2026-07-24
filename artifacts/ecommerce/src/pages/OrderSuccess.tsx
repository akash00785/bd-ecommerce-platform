import { useLocation } from "wouter";
import { CheckCircle2, Package, ArrowRight, Copy } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { toast } from "sonner";
import { useEffect } from "react";

export default function OrderSuccess() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const orderId = searchParams.get("id");

  // In a real app, we'd fetch the order details, but for this success screen
  // we just need the ID to show the user.

  useEffect(() => {
    // If somehow landed here without an order ID, go home
    if (!orderId && location === "/order-success") {
      window.location.href = "/";
    }
  }, [orderId, location]);

  const copyToClipboard = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      toast.success("Order ID copied to clipboard");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20 min-h-[70vh] flex flex-col items-center justify-center text-center">
        
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 relative z-10">
            <CheckCircle2 size={48} className="animate-in zoom-in duration-500" />
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
          Order Successfully Placed!
        </h1>
        
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Thank you for shopping with Bazaar BD. Your order has been received and is now being processed.
        </p>
        
        <div className="bg-card border border-border p-6 rounded-2xl max-w-md w-full mb-8 shadow-sm">
          <p className="text-sm text-muted-foreground mb-2">Your Order Number</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl font-bold font-mono tracking-wider text-primary">
              {orderId || "ORD-XXXXX"}
            </span>
            <button 
              onClick={copyToClipboard}
              className="text-muted-foreground hover:text-secondary transition-colors"
              title="Copy Order ID"
            >
              <Copy size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link href={`/track/${orderId}`} className="flex-1">
            <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white flex items-center gap-2 rounded-xl">
              <Package size={18} /> Track Order
            </Button>
          </Link>
          <Link href="/shop" className="flex-1">
            <Button variant="outline" className="w-full h-12 flex items-center gap-2 rounded-xl border-2">
              Continue Shopping <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
        
      </div>
    </Layout>
  );
}
