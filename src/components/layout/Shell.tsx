"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = pathname === "/signin" || pathname === "/signup" || pathname === "/forgot-password";
  const messages = pathname.startsWith("/messages");
  if (bare) return <>{children}</>;
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      {children}
      {!messages && <Footer />}
    </div>
  );
}
