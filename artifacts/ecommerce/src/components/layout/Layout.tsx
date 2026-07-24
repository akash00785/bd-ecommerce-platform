import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-[100dvh] w-full">
      <Navbar />
      <main className="flex-1 pt-16 md:pt-20 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
