import { Redirect } from "wouter";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-[60vh] flex items-center justify-center">লোড হচ্ছে...</div>;
  return user ? <>{children}</> : <Redirect to="/login" />;
}