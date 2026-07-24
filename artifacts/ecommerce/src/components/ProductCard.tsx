import { Link } from "wouter";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Product } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";
import { useWishlistStore } from "@/store/wishlist";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const wishlisted = useWishlistStore((state) => state.productIds.includes(product.id));
  const toggleWishlist = useWishlistStore((state) => state.toggle);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail
    e.stopPropagation();
    
    addItem({
      productId: product.id,
      title: product.title,
      price: product.discountPrice || product.price,
      quantity: 1,
      image: product.images[0] || "https://placehold.co/400x400/png",
    });
    
    toast.success("Added to cart", {
      description: `${product.title} has been added to your cart.`,
    });
  };

  const currentPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/product/${product.id}`} className="block h-full">
        <div className="bg-card rounded-2xl overflow-hidden border border-card-border shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col relative">
          
          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {product.flashSale && (
              <span className="bg-destructive text-white text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                FLASH
              </span>
            )}
            {hasDiscount && (
              <span className="bg-secondary text-white text-xs font-bold px-2 py-1 rounded-md">
                -{Math.round((1 - (product.discountPrice! / product.price)) * 100)}%
              </span>
            )}
          </div>
          
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-muted/30">
            <img 
              src={product.images[0] || "https://placehold.co/400x400/png"} 
              alt={product.title}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            <button
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist"); }}
              className="absolute top-3 right-3 z-10 rounded-full bg-white/90 p-2 text-primary shadow hover:text-red-500"
            >
              <Heart size={18} fill={wishlisted ? "currentColor" : "none"} className={wishlisted ? "text-red-500" : ""} />
            </button>
            {/* Quick add to cart overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full bg-white/90 backdrop-blur text-primary font-medium py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={18} />
                {product.stock > 0 ? "Quick Add" : "Out of Stock"}
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {product.categoryName || "Category"}
              </span>
              {product.rating && (
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star size={12} fill="currentColor" />
                  <span className="text-xs font-medium text-foreground">{product.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            
            <h3 className="font-semibold text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
              {product.title}
            </h3>
            
            <div className="mt-auto flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-lg text-primary">
                  {formatPrice(currentPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/50">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
