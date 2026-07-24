import { Link, useLocation } from "wouter";
import { Heart, ShoppingCart, Menu, Search, User, X } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useWishlistStore } from "@/store/wishlist";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = useCartStore((state) => state.getCartCount());
  const wishlistCount = useWishlistStore((state) => state.productIds.length);
  const [location] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-white"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-foreground"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <Link href="/" className="text-2xl font-bold font-sans tracking-tight text-primary flex items-center gap-2">
              <span className="bg-secondary text-white w-8 h-8 rounded-lg flex items-center justify-center">B</span>
              Bazaar
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className={cn("text-sm font-medium transition-colors hover:text-secondary", location === "/" ? "text-secondary" : "text-foreground")}>Home</Link>
            <Link href="/shop" className={cn("text-sm font-medium transition-colors hover:text-secondary", location === "/shop" ? "text-secondary" : "text-foreground")}>Shop</Link>
            <Link href="/shop?category=electronics" className="text-sm font-medium transition-colors hover:text-secondary text-foreground">Electronics</Link>
            <Link href="/shop?category=fashion" className="text-sm font-medium transition-colors hover:text-secondary text-foreground">Fashion</Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 text-foreground hover:text-secondary transition-colors hidden md:block">
              <Search size={20} />
            </button>
            
            <Link href={user ? "/account" : "/login"} className="p-2 text-foreground hover:text-secondary transition-colors hidden sm:block">
              <User size={20} />
            </Link>
            <Link href="/shop" aria-label="Wishlist" className="relative p-2 text-foreground hover:text-secondary transition-colors hidden sm:block">
              <Heart size={20} />
              {wishlistCount > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{wishlistCount}</span>}
            </Link>
            
            <Link href="/cart" className="p-2 text-foreground hover:text-secondary transition-colors relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-secondary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden flex">
          <div className="w-3/4 max-w-sm bg-white h-full shadow-xl flex flex-col animate-in slide-in-from-left">
            <div className="p-4 border-b flex items-center justify-between">
              <span className="font-bold text-lg text-primary">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2"><X size={20} /></button>
            </div>
            <div className="flex flex-col p-4 gap-4 overflow-y-auto">
              <Link href="/" className="font-medium p-2 rounded-md hover:bg-muted">Home</Link>
              <Link href="/shop" className="font-medium p-2 rounded-md hover:bg-muted">Shop All</Link>
              <Link href="/shop?category=electronics" className="font-medium p-2 rounded-md hover:bg-muted">Electronics</Link>
              <Link href="/shop?category=fashion" className="font-medium p-2 rounded-md hover:bg-muted">Fashion</Link>
              <Link href="/account/orders" className="font-medium p-2 rounded-md hover:bg-muted">My Orders</Link>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
        </div>
      )}
    </header>
  );
}
