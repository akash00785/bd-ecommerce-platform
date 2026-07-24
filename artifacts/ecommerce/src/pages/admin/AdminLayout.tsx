import { useLocation, Link } from 'wouter';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/firebase';

const navItems = [
  { path: '/admin', label: 'ড্যাশবোর্ড', icon: '📊' },
  { path: '/admin/products', label: 'প্রোডাক্ট', icon: '📦' },
  { path: '/admin/orders', label: 'অর্ডার', icon: '🛒' },
  { path: '/admin/reviews', label: 'রিভিউ মডারেশন', icon: '⭐' },
  { path: '/admin/newsletter', label: 'নিউজলেটার', icon: '✉️' },
  { path: '/admin/banners', label: 'ব্যানার', icon: '🖼️' },
  { path: '/admin/coupons', label: 'কুপন', icon: '🎟️' },
  { path: '/admin/categories', label: 'ক্যাটাগরি', icon: '📂' },
  { path: '/admin/brands', label: 'ব্র্যান্ড', icon: '🏷️' },
  { path: '/admin/settings', label: 'সেটিংস', icon: '⚙️' },
];

/**
 * Checks whether the currently signed-in Firebase user holds the admin role.
 *
 * Admin status is determined by either:
 *   1. A custom Firebase claim `{ admin: true }` set via the Admin SDK, OR
 *   2. The user's UID being present in the VITE_ADMIN_UIDS env var
 *      (comma-separated, useful for local dev before custom claims are configured).
 *
 * The token is force-refreshed so that newly granted claims take effect
 * without requiring a full logout/login cycle.
 */
async function checkIsAdmin(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    // Force-refresh to pick up any recently granted custom claims
    const idTokenResult = await user.getIdTokenResult(/* forceRefresh */ true);

    // Custom claim check (set via Firebase Admin SDK)
    if (idTokenResult.claims['admin'] === true) return true;

    // Fallback: UID allowlist from env (for development / initial setup)
    const allowedUids = (import.meta.env.VITE_ADMIN_UIDS ?? '')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
    if (allowedUids.includes(user.uid)) return true;
  } catch {
    // Token verification failed — treat as non-admin
  }

  return false;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/admin/login');
      return;
    }

    if (user) {
      // Verify admin role — being logged in is NOT sufficient
      void checkIsAdmin().then((result) => {
        setIsAdmin(result);
        if (!result) {
          // Signed in but not admin → redirect to storefront login
          setLocation('/admin/login');
        }
      });
    }
  }, [user, loading, setLocation]);

  const handleLogout = async () => {
    await auth.signOut();
    setLocation('/admin/login');
  };

  // Show loading spinner while auth state or admin check is in progress
  if (loading || isAdmin === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-gray-500">লোড হচ্ছে...</div>
      </div>
    );
  }

  // Not signed in or not admin — render nothing (redirect is already triggered)
  if (!user || !isAdmin) return null;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-white flex flex-col shadow-xl">
        <div className="p-5 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center font-bold text-lg">A</div>
            <div>
              <p className="font-bold text-sm">BD E-Commerce</p>
              <p className="text-gray-400 text-xs truncate max-w-[120px]">{user.email}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.path === '/admin'
              ? location === '/admin'
              : location.startsWith(item.path);
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center gap-3 px-5 py-3 text-sm cursor-pointer transition-colors ${
                    isActive ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <Link href="/">
            <div className="flex items-center gap-2 text-gray-400 hover:text-white text-sm cursor-pointer mb-2">
              <span>🏪</span><span>শপে যান</span>
            </div>
          </Link>
          <button
            onClick={() => void handleLogout()}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm w-full"
          >
            <span>🚪</span><span>লগআউট</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
