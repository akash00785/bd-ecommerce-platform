import { Link, useLocation } from "wouter";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useValidateCoupon } from "@workspace/api-client-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { items, removeItem, updateQuantity, getCartTotal, couponCode, discountAmount, applyCoupon, removeCoupon } = useCartStore();
  
  const [couponInput, setCouponInput] = useState(couponCode || "");
  const validateCoupon = useValidateCoupon();

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    
    validateCoupon.mutate({
      data: { code: couponInput, orderAmount: items.reduce((acc, item) => acc + (item.price * item.quantity), 0) }
    }, {
      onSuccess: (data) => {
        applyCoupon(data.code, data.discountAmount);
        toast.success("Coupon applied successfully!");
      },
      onError: () => {
        toast.error("Invalid or expired coupon");
        removeCoupon();
        setCouponInput("");
      }
    });
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = getCartTotal();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 min-h-[60vh] flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-6">
            <ShoppingBag size={40} />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Looks like you haven't added anything to your cart yet. Explore our products and find something you love.
          </p>
          <Link href="/shop" className="bg-secondary hover:bg-secondary/90 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg shadow-secondary/20">
            Start Shopping
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-muted/30 border-b border-border py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Shopping Cart</h1>
          <p className="text-muted-foreground">{items.length} item(s) in your cart</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-card rounded-2xl border border-card-border overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-border text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>
              
              <div className="divide-y border-border">
                {items.map((item, index) => (
                  <div key={`${item.productId}-${item.size}-${item.color}-${index}`} className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="col-span-1 md:col-span-6 flex items-center gap-4">
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-muted rounded-xl overflow-hidden shrink-0">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <Link href={`/product/${item.productId}`} className="font-semibold text-foreground hover:text-secondary line-clamp-2 transition-colors">
                          {item.title}
                        </Link>
                        {(item.size || item.color) && (
                          <div className="flex gap-2 text-sm text-muted-foreground mt-1">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.color && <span>Color: {item.color}</span>}
                          </div>
                        )}
                        {/* Mobile remove button */}
                        <button 
                          onClick={() => removeItem(item.productId, item.size, item.color)}
                          className="text-destructive text-sm font-medium mt-2 flex items-center gap-1 md:hidden w-fit"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                    
                    <div className="hidden md:block col-span-2 text-center font-medium">
                      {formatPrice(item.price)}
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-center">
                      <div className="md:hidden font-medium">{formatPrice(item.price)}</div>
                      
                      <div className="flex items-center border border-border rounded-lg bg-background h-10 w-28 shrink-0">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size, item.color)}
                          className="w-8 h-full flex items-center justify-center text-foreground hover:bg-muted transition-colors rounded-l-lg"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="flex-1 text-center font-medium text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size, item.color)}
                          className="w-8 h-full flex items-center justify-center text-foreground hover:bg-muted transition-colors rounded-r-lg"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="hidden md:flex col-span-2 items-center justify-end gap-4">
                      <span className="font-bold text-primary">{formatPrice(item.price * item.quantity)}</span>
                      <button 
                        onClick={() => removeItem(item.productId, item.size, item.color)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6">
              <Link href="/shop" className="text-secondary font-medium flex items-center gap-2 hover:underline w-fit">
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 xl:w-96 shrink-0">
            <div className="bg-card rounded-2xl border border-card-border p-6 sticky top-24">
              <h2 className="text-xl font-bold border-b border-border pb-4 mb-4 text-primary">Order Summary</h2>
              
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-secondary">
                    <span>Discount {couponCode ? `(${couponCode})` : ''}</span>
                    <span className="font-medium">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              
              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-lg">Total</span>
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-2xl text-primary">{formatPrice(total)}</span>
                    <span className="text-xs text-muted-foreground">VAT included</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">Have a coupon code?</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter code" 
                    className="flex-1 h-10 px-3 rounded-lg border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-secondary uppercase"
                    disabled={validateCoupon.isPending}
                  />
                  <Button 
                    variant="outline" 
                    className="h-10 px-4"
                    onClick={handleApplyCoupon}
                    disabled={validateCoupon.isPending || !couponInput}
                  >
                    Apply
                  </Button>
                </div>
                {couponCode && (
                  <button onClick={removeCoupon} className="text-xs text-destructive mt-2 hover:underline">
                    Remove coupon
                  </button>
                )}
              </div>
              
              <Button 
                className="w-full h-12 text-base font-semibold bg-secondary hover:bg-secondary/90 text-white flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-secondary/20"
                onClick={() => setLocation("/checkout")}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
