import { Redirect } from "wouter";
import { useAuth } from "@/context/AuthContext";

/**
 * Guards customer-facing routes (account, order history, checkout, etc.).
 *
 * Rules:
 * - Not signed in            → redirect to /login
 * - Signed in but email/password account whose email is NOT verified
 *                            → redirect to /login so they see the
 *                              "please verify your email" message
 * - Google sign-in           → always allowed (emailVerified is true by default)
 * - Verified email/password  → allowed
 *
 * NOTE: Admin routes use AdminLayout's own auth guard, not this component.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        লোড হচ্ছে...
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  // Block email/password users who signed in before completing verification.
  // Google users always have emailVerified === true so they are never blocked.
  const isPasswordUser = user.providerData[0]?.providerId === "password";
  if (isPasswordUser && !user.emailVerified) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}
