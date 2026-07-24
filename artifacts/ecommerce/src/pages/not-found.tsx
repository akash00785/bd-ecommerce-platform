import { Link } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center min-h-[60vh]">
        <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mb-6">
          <AlertCircle size={48} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          404 - Page Not Found
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link href="/" className="bg-secondary hover:bg-secondary/90 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg shadow-secondary/20">
          Return to Home
        </Link>
      </div>
    </Layout>
  );
}
