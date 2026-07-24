import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { Filter, SlidersHorizontal, ChevronDown, Search } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

export default function Shop() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const [category, setCategory] = useState<string>(searchParams.get("category") || "");
  const [sort, setSort] = useState<string>("newest");
  const [search, setSearch] = useState<string>(searchParams.get("search") || "");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync category state when URL changes
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setCategory(searchParams.get("category") || "");
    setSearch(searchParams.get("search") || "");
  }, [location]);

  const { data: productsData, isLoading } = useListProducts({
    category: category || undefined,
    search: search.trim() || undefined,
    sort: sort as any,
    limit: 50,
  });

  const { data: categories } = useListCategories();

  const handleCategoryChange = (slug: string) => {
    setCategory(slug === category ? "" : slug);
    // Update URL without full page reload if possible, or just let state handle it
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(window.location.search);
    if (value.trim()) params.set("search", value.trim()); else params.delete("search");
    window.history.replaceState({}, "", `${window.location.pathname}${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <Layout>
      <div className="bg-muted/30 border-b border-border py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            {category ? categories?.find(c => c.slug === category)?.name || "Shop" : "All Products"}
          </h1>
          <p className="text-muted-foreground">
            Explore our vast collection of quality products at the best prices.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center justify-between">
            <Button variant="outline" onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)} className="gap-2">
              <Filter size={16} /> Filters
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <select 
                value={sort} 
                onChange={(e) => setSort(e.target.value)}
                className="text-sm border-none bg-transparent font-medium focus:ring-0 cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Sidebar Filters */}
          <aside className={`lg:w-64 shrink-0 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-card rounded-2xl border border-card-border p-5 sticky top-24">
              <div className="flex items-center gap-2 font-semibold text-lg border-b pb-4 mb-4">
                <SlidersHorizontal size={20} className="text-secondary" />
                Filters
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Categories</h3>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => handleCategoryChange("")}
                    className={`text-left text-sm py-1 transition-colors ${!category ? "text-secondary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    All Categories
                  </button>
                  {categories?.map((cat) => (
                    <button 
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={`text-left text-sm py-1 transition-colors ${category === cat.slug ? "text-secondary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="hidden lg:flex items-center justify-between mb-6 bg-card border border-card-border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Search size={17} className="text-muted-foreground" />
                <input value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="প্রোডাক্ট খুঁজুন..." className="bg-transparent outline-none text-sm w-56" />
              </div>
              <span className="text-muted-foreground text-sm">
                Showing <span className="font-medium text-foreground">{productsData?.products?.length || 0}</span> results
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <select 
                  value={sort} 
                  onChange={(e) => setSort(e.target.value)}
                  className="text-sm border-none bg-transparent font-medium focus:ring-0 cursor-pointer outline-none"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>
            <div className="lg:hidden mb-5 flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
              <Search size={17} className="text-muted-foreground" />
              <input value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="প্রোডাক্ট খুঁজুন..." className="bg-transparent outline-none text-sm w-full" />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl p-4 aspect-[3/4] animate-pulse flex flex-col gap-4">
                    <div className="w-full h-1/2 bg-muted rounded-xl"></div>
                    <div className="w-3/4 h-4 bg-muted rounded mt-auto"></div>
                    <div className="w-1/4 h-4 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : productsData?.products?.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-2xl border border-card-border">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted text-muted-foreground mb-4">
                  <Search size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your filters or search query.</p>
                <Button onClick={() => setCategory("")} variant="outline">Clear Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {productsData?.products?.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
