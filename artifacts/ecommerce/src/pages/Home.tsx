import { useListFeaturedProducts, useListFlashSaleProducts, useListCategories } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Zap, Grid2X2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/ProductCard";

export default function Home() {
  const { data: featuredProducts, isLoading: isFeaturedLoading } = useListFeaturedProducts({ type: "featured" });
  const { data: trendingProducts, isLoading: isTrendingLoading } = useListFeaturedProducts({ type: "trending" });
  const { data: flashSaleProducts, isLoading: isFlashLoading } = useListFlashSaleProducts();
  const { data: categories, isLoading: isCategoriesLoading } = useListCategories();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="2" fill="currentColor" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#dotPattern)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-4 py-12 md:py-24 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-start gap-6 max-w-xl"
            >
              <span className="bg-secondary/20 text-secondary font-semibold px-4 py-1.5 rounded-full text-sm">
                Bengali New Year Sale
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                Authentic Bangladeshi <span className="text-secondary">Style & Living</span>
              </h1>
              <p className="text-primary-foreground/80 text-lg md:text-xl">
                Discover curated collections from local artisans to top brands. Fast delivery inside Dhaka & nationwide.
              </p>
              <Link href="/shop" className="bg-secondary hover:bg-secondary/90 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-secondary/20 transition-all flex items-center gap-2 mt-2 group">
                Shop Now <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden md:block aspect-square max-w-md mx-auto"
            >
              <div className="absolute inset-0 bg-secondary/20 rounded-full blur-3xl"></div>
              <img 
                src="https://placehold.co/600x600/264653/F4A261?text=Bazaar+Hero" 
                alt="Bazaar BD Hero" 
                className="relative z-10 w-full h-full object-cover rounded-3xl shadow-2xl border-4 border-white/10"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-primary">Shop by Category</h2>
            <Link href="/shop" className="text-secondary font-medium flex items-center gap-1 hover:underline">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {isCategoriesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 aspect-square animate-pulse flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-full"></div>
                  <div className="w-20 h-4 bg-muted rounded"></div>
                </div>
              ))
            ) : categories?.slice(0, 6).map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Link href={`/shop?category=${cat.slug}`} className="bg-white hover:bg-secondary hover:text-white hover:shadow-lg transition-all duration-300 rounded-2xl p-6 aspect-square flex flex-col items-center justify-center gap-4 text-center group border border-border">
                  <div className="w-16 h-16 bg-muted group-hover:bg-white/20 rounded-full flex items-center justify-center text-primary transition-colors">
                    <Grid2X2 size={24} />
                  </div>
                  <span className="font-semibold">{cat.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale */}
      {flashSaleProducts && flashSaleProducts.length > 0 && (
        <section className="py-16 bg-destructive/5 border-y border-destructive/10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-destructive text-white p-3 rounded-xl">
                  <Zap size={28} />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                    Flash Sale
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">Hurry up! Offers end soon.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-border text-primary font-mono font-bold text-lg">
                <Clock size={20} className="text-destructive" />
                <span>12</span>:<span>45</span>:<span>00</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {flashSaleProducts.slice(0, 5).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-primary">Featured Selection</h2>
            <Link href="/shop?featured=true" className="text-secondary font-medium flex items-center gap-1 hover:underline">
              More Featured <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {isFeaturedLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl p-4 aspect-[3/4] animate-pulse flex flex-col gap-4">
                  <div className="w-full h-1/2 bg-muted rounded-xl"></div>
                  <div className="w-3/4 h-4 bg-muted rounded mt-auto"></div>
                  <div className="w-1/4 h-4 bg-muted rounded"></div>
                </div>
              ))
            ) : featuredProducts?.slice(0, 8).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Join the Bazaar Community</h2>
          <p className="text-primary-foreground/80 mb-8">
            Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
          </p>
          <form className="flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <button type="submit" className="bg-secondary hover:bg-secondary/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
}
