import { useState } from "react";
import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function Footer() {
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [subMsg, setSubMsg] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubStatus("loading");
    try {
      const res = await fetch(`${BASE}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok || res.status === 200) {
        setSubStatus("success");
        setSubMsg(data.message || "সফলভাবে সাবস্ক্রাইব হয়েছে!");
        setEmail("");
      } else {
        setSubStatus("error");
        setSubMsg(data.error || "কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
    } catch {
      setSubStatus("error");
      setSubMsg("সংযোগ সমস্যা। আবার চেষ্টা করুন।");
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

          <div className="flex flex-col gap-4">
            <Link href="/" className="text-2xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
              <span className="bg-secondary text-white w-8 h-8 rounded-lg flex items-center justify-center">B</span>
              Bazaar
            </Link>
            <p className="text-primary-foreground/80 text-sm leading-relaxed max-w-xs">
              Bangladesh's premium online marketplace. Fast delivery, trusted products, and seamless shopping experience.
            </p>
            <div className="flex gap-4 mt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors"><Facebook size={16} /></a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors"><Instagram size={16} /></a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors"><Twitter size={16} /></a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-lg">Shop</h3>
            <div className="flex flex-col gap-2">
              <Link href="/shop" className="text-primary-foreground/80 hover:text-white transition-colors text-sm">All Products</Link>
              <Link href="/shop?category=electronics" className="text-primary-foreground/80 hover:text-white transition-colors text-sm">Electronics</Link>
              <Link href="/shop?category=fashion" className="text-primary-foreground/80 hover:text-white transition-colors text-sm">Fashion & Apparel</Link>
              <Link href="/shop?category=home" className="text-primary-foreground/80 hover:text-white transition-colors text-sm">Home & Lifestyle</Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-lg">Customer Service</h3>
            <div className="flex flex-col gap-2">
              <Link href="/account/orders" className="text-primary-foreground/80 hover:text-white transition-colors text-sm">My Account</Link>
              <Link href="/track" className="text-primary-foreground/80 hover:text-white transition-colors text-sm">Track Order</Link>
              <a href="#" className="text-primary-foreground/80 hover:text-white transition-colors text-sm">Return Policy</a>
              <a href="#" className="text-primary-foreground/80 hover:text-white transition-colors text-sm">FAQ</a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-lg">Contact Us</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 text-primary-foreground/80 text-sm">
                <MapPin size={18} className="shrink-0 mt-0.5 text-secondary" />
                <p>Level 4, Navana Tower, Gulshan 1, Dhaka 1212, Bangladesh</p>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/80 text-sm">
                <Phone size={18} className="shrink-0 text-secondary" />
                <p>+880 1711 000000</p>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/80 text-sm">
                <Mail size={18} className="shrink-0 text-secondary" />
                <p>support@bazaar.com.bd</p>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-white/10 pt-8 pb-6 mb-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">নিউজলেটারে সাবস্ক্রাইব করুন</h3>
              <p className="text-primary-foreground/70 text-sm">অফার, নতুন প্রোডাক্ট ও ডিসকাউন্টের আপডেট পান</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setSubStatus("idle"); }}
                placeholder="আপনার ইমেইল লিখুন"
                className="px-4 py-2 rounded-lg text-gray-900 text-sm flex-1 md:w-72 focus:outline-none focus:ring-2 focus:ring-secondary"
                required
                disabled={subStatus === "loading" || subStatus === "success"}
              />
              <button
                type="submit"
                disabled={subStatus === "loading" || subStatus === "success"}
                className="bg-secondary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-secondary/90 transition disabled:opacity-60 whitespace-nowrap"
              >
                {subStatus === "loading" ? "..." : subStatus === "success" ? "✓ সম্পন্ন" : "সাবস্ক্রাইব"}
              </button>
            </form>
          </div>
          {subMsg && (
            <p className={`mt-3 text-sm ${subStatus === "success" ? "text-green-300" : "text-red-300"}`}>{subMsg}</p>
          )}
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/60 text-sm">
            © {new Date().getFullYear()} Bazaar BD. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-primary-foreground/60 text-sm">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
