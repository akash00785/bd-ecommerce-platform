import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

import Home from '@/pages/Home';
import Shop from '@/pages/Shop';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import OrderSuccess from '@/pages/OrderSuccess';
import OrderTrack from '@/pages/OrderTrack';
import OrderHistory from '@/pages/OrderHistory';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Account from '@/pages/Account';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Admin pages
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminBanners from '@/pages/admin/AdminBanners';
import AdminCoupons from '@/pages/admin/AdminCoupons';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminBrands from '@/pages/admin/AdminBrands';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminNewsletter from '@/pages/admin/AdminNewsletter';
import AdminReviews from '@/pages/admin/AdminReviews';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-success" component={OrderSuccess} />
      <Route path="/track" component={OrderTrack} />
      <Route path="/track/:orderNumber" component={OrderTrack} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/account">
        <ProtectedRoute><Account /></ProtectedRoute>
      </Route>
      <Route path="/account/orders">
        <ProtectedRoute><OrderHistory /></ProtectedRoute>
      </Route>

      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/banners" component={AdminBanners} />
      <Route path="/admin/coupons" component={AdminCoupons} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/brands" component={AdminBrands} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/newsletter" component={AdminNewsletter} />
      <Route path="/admin/reviews" component={AdminReviews} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
