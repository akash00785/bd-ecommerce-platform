import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import DOMPurify from "dompurify";
import { useGetProduct, useGetRelatedProducts, getGetProductQueryKey, getGetRelatedProductsQueryKey } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Shield, Truck, RotateCcw, Minus, Plus, ThumbsUp } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

// Reviews Component
function ProductReviews({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ customerName: '', rating: 5, comment: '' });
  const [showForm, setShowForm] = useState(false);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/products/${productId}/reviews`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setAvgRating(data.avgRating || 0);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { if (productId) loadReviews(); }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim()) { toast.error("নাম দিন"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/products/${productId}/reviews`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("রিভিউ সফলভাবে জমা হয়েছে!");
        setForm({ customerName: '', rating: 5, comment: '' });
        setShowForm(false);
        loadReviews();
      } else {
        const err = await res.json();
        toast.error(err.error || "রিভিউ জমা দিতে সমস্যা হয়েছে");
      }
    } catch { toast.error("সংযোগ সমস্যা।"); }
    setSubmitting(false);
  };

  const StarRow = ({ value, onChange }: { value: number; onChange?: (v: number) => void }) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} onClick={() => onChange?.(i)} className={`text-xl ${onChange ? 'cursor-pointer' : ''} ${i <= value ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl">
        <div className="text-center">
          <p className="text-5xl font-bold text-gray-800">{avgRating.toFixed(1)}</p>
          <StarRow value={Math.round(avgRating)} />
          <p className="text-sm text-gray-500 mt-1">{total} টি রিভিউ</p>
        </div>
        <div className="flex-1">
          {[5,4,3,2,1].map(star => {
            const count = reviews.filter(r => r.rating === star).length;
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 mb-1">
                <span className="text-xs w-4">{star}</span>
                <span className="text-yellow-400 text-xs">★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-gray-400 w-6">{count}</span>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
        >
          রিভিউ লিখুন
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-green-200 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-gray-800">আপনার রিভিউ লিখুন</h3>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">রেটিং</label>
            <StarRow value={form.rating} onChange={v => setForm(p => ({ ...p, rating: v }))} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">আপনার নাম *</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.customerName} onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))} placeholder="আপনার নাম" required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">মন্তব্য (ঐচ্ছিক)</label>
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm h-24 resize-none" value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))} placeholder="প্রোডাক্ট সম্পর্কে আপনার অভিজ্ঞতা লিখুন..." />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60">{submitting ? 'জমা হচ্ছে...' : 'রিভিউ জমা দিন'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-lg text-sm border hover:bg-gray-50">বাতিল</button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">রিভিউ লোড হচ্ছে...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <ThumbsUp className="mx-auto mb-3 text-gray-300" size={40} />
          <p>এখনো কোনো রিভিউ নেই। প্রথম রিভিউ দিন!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-white border rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{r.customerName}</span>
                    {r.isVerified && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ ক্রেতা</span>}
                  </div>
                  <StarRow value={r.rating} />
                </div>
                <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('bn-BD')}</span>
              </div>
              {r.comment && <p className="text-sm text-gray-600 mt-2">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const productId = Number(params?.id);
  
  const { data: product, isLoading } = useGetProduct(productId, { 
    query: { enabled: !!productId, queryKey: getGetProductQueryKey(productId) } 
  });
  
  const { data: relatedProducts } = useGetRelatedProducts(productId, {
    query: { enabled: !!productId, queryKey: getGetRelatedProductsQueryKey(productId) }
  });

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  
  const addItem = useCartStore(state => state.addItem);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-3xl"></div>
            <div className="flex flex-col gap-4 py-4">
              <div className="w-1/4 h-6 bg-muted rounded"></div>
              <div className="w-3/4 h-10 bg-muted rounded"></div>
              <div className="w-1/2 h-8 bg-muted rounded"></div>
              <div className="w-full h-32 bg-muted rounded mt-4"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
        </div>
      </Layout>
    );
  }

  const currentPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  const handleAddToCart = () => {
    if (product.sizes?.length && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (product.colors?.length && !selectedColor) {
      toast.error("Please select a color");
      return;
    }

    addItem({
      productId: product.id,
      title: product.title,
      price: currentPrice,
      quantity,
      image: product.images[0] || "https://placehold.co/400x400/png",
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    });
    
    toast.success("Added to cart", {
      description: `${quantity}x ${product.title} added to your cart.`,
    });
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border py-4">
        <div className="container mx-auto px-4 flex text-sm text-muted-foreground gap-2">
          <a href="/" className="hover:text-foreground">Home</a>
          <span>/</span>
          <a href="/shop" className="hover:text-foreground">Shop</a>
          {product.categoryName && (
            <>
              <span>/</span>
              <a href={`/shop?category=${product.categoryId}`} className="hover:text-foreground">{product.categoryName}</a>
            </>
          )}
          <span>/</span>
          <span className="text-foreground font-medium truncate">{product.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          
          {/* Images */}
          <div className="flex flex-col gap-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-muted/20 rounded-3xl overflow-hidden border border-border aspect-square relative"
            >
              <img 
                src={product.images[selectedImage] || "https://placehold.co/800x800/png"} 
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-secondary text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-md">
                  -{Math.round((1 - (product.discountPrice! / product.price)) * 100)}% OFF
                </span>
              )}
            </motion.div>
            
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 lg:grid-cols-5 gap-3">
                {product.images.map((img, i) => (
                  <button 
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-secondary shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {product.brandName && (
              <span className="text-secondary font-bold tracking-wider uppercase text-sm mb-2">{product.brandName}</span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4 leading-tight">{product.title}</h1>
            
            {product.rating && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star size={18} fill="currentColor" />
                  <span className="font-bold text-foreground">{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-muted-foreground text-sm">({product.reviewCount} reviews)</span>
              </div>
            )}

            <div className="flex items-end gap-4 mb-6">
              <span className="text-4xl font-bold text-primary">{formatPrice(currentPrice)}</span>
              {hasDiscount && (
                <span className="text-xl text-muted-foreground line-through decoration-muted-foreground/50 pb-1">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Selectors */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Size</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] h-10 px-3 rounded-lg border text-sm font-medium transition-all ${
                        selectedSize === size 
                          ? 'border-primary bg-primary text-primary-foreground shadow-md' 
                          : 'border-border bg-card text-foreground hover:border-primary/50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <span className="font-medium mb-2 block">Color</span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`h-10 px-4 rounded-lg border text-sm font-medium transition-all ${
                        selectedColor === color 
                          ? 'border-primary bg-primary text-primary-foreground shadow-md' 
                          : 'border-border bg-card text-foreground hover:border-primary/50'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center border border-border rounded-xl bg-card h-14">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-12 h-full flex items-center justify-center text-foreground hover:bg-muted/50 rounded-l-xl transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="w-12 h-full flex items-center justify-center text-foreground hover:bg-muted/50 rounded-r-xl transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
              
              <Button 
                size="lg" 
                className="h-14 flex-1 text-lg gap-3 bg-secondary hover:bg-secondary/90 text-white rounded-xl shadow-lg shadow-secondary/20"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                <ShoppingCart size={22} />
                {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-y border-border">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Truck size={18} />
                </div>
                <div>
                  <span className="font-semibold block">Delivery</span>
                  <span className="text-muted-foreground">{product.deliveryTime || "2-5 days across BD"}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Shield size={18} />
                </div>
                <div>
                  <span className="font-semibold block">Warranty</span>
                  <span className="text-muted-foreground">{product.warranty || "100% Authentic Product"}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <RotateCcw size={18} />
                </div>
                <div>
                  <span className="font-semibold block">Return Policy</span>
                  <span className="text-muted-foreground">{product.returnPolicy || "7 days easy return"}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Tabs for Description etc */}
        <div className="mt-16 mb-20">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0 h-auto gap-8 overflow-x-auto overflow-y-hidden flex-nowrap">
              <TabsTrigger 
                value="description" 
                className="rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-secondary py-4 text-base data-[state=active]:text-secondary font-medium"
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="shipping" 
                className="rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-secondary py-4 text-base data-[state=active]:text-secondary font-medium"
              >
                Shipping & Returns
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-secondary py-4 text-base data-[state=active]:text-secondary font-medium"
              >
                রিভিউ {(product.reviewCount ?? 0) > 0 && <span className="ml-1 text-xs bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full">{product.reviewCount}</span>}
              </TabsTrigger>
            </TabsList>
            <div className="py-6">
              <TabsContent value="description" className="prose prose-sm md:prose-base max-w-none text-muted-foreground focus:outline-none">
                {product.description ? (
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }} />
                ) : (
                  <>
                    <p>Experience the premium quality of this authentic product. Designed carefully to meet your everyday needs with style and durability.</p>
                    <ul>
                      <li>High quality materials</li>
                      <li>Durable construction</li>
                      <li>Perfect for everyday use</li>
                      <li>Authentic brand product</li>
                    </ul>
                  </>
                )}
              </TabsContent>
              <TabsContent value="shipping" className="text-muted-foreground focus:outline-none">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-bold text-foreground text-lg mb-3">Shipping Details</h3>
                    <ul className="space-y-2">
                      <li><strong>Inside Dhaka:</strong> Delivery within 1-2 business days. Fee: ৳60.</li>
                      <li><strong>Outside Dhaka:</strong> Delivery within 3-5 business days via Courier. Fee: ৳130.</li>
                      <li>Free shipping on orders over ৳5000.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg mb-3">Return Policy</h3>
                    <ul className="space-y-2">
                      <li>Returns accepted within 7 days of delivery.</li>
                      <li>Item must be unused and in original packaging.</li>
                      <li>Refunds processed within 3-5 days after receiving the returned item.</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="focus:outline-none">
                <ProductReviews productId={productId} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {relatedProducts.slice(0, 5).map((prod, i) => (
                <ProductCard key={prod.id} product={prod} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
