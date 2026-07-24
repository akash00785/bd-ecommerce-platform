import { useState } from "react";
import { useLocation } from "wouter";
import { ShieldCheck, Truck, Lock, CreditCard } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useCreateOrder, OrderInputPaymentMethod } from "@workspace/api-client-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";

const DIVISIONS = ["Dhaka", "Chattogram", "Rajshahi", "Khulna", "Barishal", "Sylhet", "Mymensingh", "Rangpur"];

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, getCartTotal, couponCode, discountAmount, clearCart } = useCartStore();
  const createOrder = useCreateOrder();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    division: "Dhaka",
    district: "",
    upazila: "",
    notes: ""
  });
  
  const [paymentMethod, setPaymentMethod] = useState<OrderInputPaymentMethod>("cod");
  
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingFee = formData.division === "Dhaka" ? 60 : 130;
  const totalAmount = subtotal - discountAmount + shippingFee;

  // Redirect if cart is empty
  if (items.length === 0 && !createOrder.isSuccess) {
    setLocation("/cart");
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDivisionChange = (val: string) => {
    setFormData(prev => ({ ...prev, division: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.phone || !formData.address || !formData.district) {
      toast.error("Please fill in all required address fields");
      return;
    }

    createOrder.mutate({
      data: {
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: user?.email || undefined,
        totalAmount,
        shippingFee,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        paymentMethod,
        shippingAddress: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          division: formData.division,
          district: formData.district,
          upazila: formData.upazila || undefined,
        },
        items: items.map(item => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          size: item.size,
          color: item.color,
        })),
        couponCode: couponCode || undefined,
        notes: formData.notes || undefined,
      }
    }, {
      onSuccess: (order) => {
        clearCart();
        toast.success("Order placed successfully!");
        setLocation(`/order-success?id=${order.orderNumber}`);
      },
      onError: (err) => {
        toast.error("Failed to place order. Please try again.");
        console.error(err);
      }
    });
  };

  return (
    <Layout>
      <div className="bg-muted/30 border-b border-border py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Checkout</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column - Forms */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Delivery Address */}
            <div className="bg-card rounded-2xl border border-card-border p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Truck className="text-secondary" /> Delivery Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name *</label>
                  <Input 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder="Enter your full name" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number *</label>
                  <Input 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    placeholder="e.g. 01712345678" 
                    required 
                  />
                </div>
                
                <div className="col-span-1 md:col-span-2 space-y-2 mt-2">
                  <label className="text-sm font-medium">Street Address *</label>
                  <Input 
                    name="address" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    placeholder="House/Apt No, Road, Area" 
                    required 
                  />
                </div>
                
                <div className="space-y-2 mt-2">
                  <label className="text-sm font-medium">Division *</label>
                  <Select value={formData.division} onValueChange={handleDivisionChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Division" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIVISIONS.map(div => (
                        <SelectItem key={div} value={div}>{div}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 mt-2">
                  <label className="text-sm font-medium">District *</label>
                  <Input 
                    name="district" 
                    value={formData.district} 
                    onChange={handleInputChange} 
                    placeholder="e.g. Dhaka City" 
                    required 
                  />
                </div>
                
                <div className="space-y-2 mt-2">
                  <label className="text-sm font-medium">Thana/Upazila</label>
                  <Input 
                    name="upazila" 
                    value={formData.upazila} 
                    onChange={handleInputChange} 
                    placeholder="e.g. Gulshan" 
                  />
                </div>
                
                <div className="col-span-1 md:col-span-2 space-y-2 mt-2">
                  <label className="text-sm font-medium">Order Notes (Optional)</label>
                  <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Notes about your order, e.g. special notes for delivery."
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card rounded-2xl border border-card-border p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="text-secondary" /> Payment Method
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-secondary bg-secondary/5' : 'border-border hover:border-border/80'}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="cod" 
                    checked={paymentMethod === 'cod'} 
                    onChange={() => setPaymentMethod('cod')}
                    className="w-4 h-4 text-secondary focus:ring-secondary border-gray-300" 
                  />
                  <div className="flex-1 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                      <Truck size={20} />
                    </div>
                    <div>
                      <span className="block font-semibold">Cash on Delivery</span>
                      <span className="block text-xs text-muted-foreground">Pay when you receive</span>
                    </div>
                  </div>
                </label>
                
                <label className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50' : 'border-border hover:border-border/80'}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="bkash" 
                    checked={paymentMethod === 'bkash'} 
                    onChange={() => setPaymentMethod('bkash')}
                    className="w-4 h-4 text-pink-500 focus:ring-pink-500 border-gray-300" 
                  />
                  <div className="flex-1 flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-pink-600 font-bold text-sm">bKash</span>
                    </div>
                    <div>
                      <span className="block font-semibold">bKash</span>
                      <span className="block text-xs text-muted-foreground">Mobile Banking</span>
                    </div>
                  </div>
                </label>
                
                <label className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'nagad' ? 'border-orange-500 bg-orange-50' : 'border-border hover:border-border/80'}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="nagad" 
                    checked={paymentMethod === 'nagad'} 
                    onChange={() => setPaymentMethod('nagad')}
                    className="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300" 
                  />
                  <div className="flex-1 flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-orange-600 font-bold text-xs">Nagad</span>
                    </div>
                    <div>
                      <span className="block font-semibold">Nagad</span>
                      <span className="block text-xs text-muted-foreground">Mobile Banking</span>
                    </div>
                  </div>
                </label>

                <label className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'rocket' ? 'border-purple-500 bg-purple-50' : 'border-border hover:border-border/80'}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="rocket" 
                    checked={paymentMethod === 'rocket'} 
                    onChange={() => setPaymentMethod('rocket')}
                    className="w-4 h-4 text-purple-500 focus:ring-purple-500 border-gray-300" 
                  />
                  <div className="flex-1 flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-purple-600 font-bold text-xs">Rocket</span>
                    </div>
                    <div>
                      <span className="block font-semibold">Rocket</span>
                      <span className="block text-xs text-muted-foreground">Mobile Banking</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-80 xl:w-96 shrink-0">
            <div className="bg-card rounded-2xl border border-card-border p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold border-b border-border pb-4 mb-4 text-primary">Order Summary</h2>
              
              <div className="flex flex-col gap-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="relative w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <span className="font-medium text-sm line-clamp-1">{item.title}</span>
                      <span className="text-primary font-bold text-sm">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col gap-3 mb-6 border-t border-border pt-4">
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-secondary text-sm">
                    <span>Discount {couponCode ? `(${couponCode})` : ''}</span>
                    <span className="font-medium">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>Shipping Fee</span>
                  <span className="font-medium text-foreground">{formatPrice(shippingFee)}</span>
                </div>
              </div>
              
              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-primary">{formatPrice(totalAmount)}</span>
                </div>
              </div>
              
              <div className="bg-green-50 text-green-800 p-3 rounded-xl flex items-start gap-2 mb-6 text-sm">
                <ShieldCheck size={18} className="shrink-0 mt-0.5" />
                <p>100% secure payment processing and buyer protection guarantee.</p>
              </div>
              
              <Button 
                type="submit"
                className="w-full h-12 text-base font-semibold bg-secondary hover:bg-secondary/90 text-white flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-secondary/20"
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? "Processing..." : (
                  <>
                    <Lock size={16} /> Place Order
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
