import Link from "next/link";
import { LogoMark } from "@/components/ui/Icons";

export default function Footer() {
  return (
    <footer className="border-t border-sage bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2 text-forest">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest"><LogoMark /></span>
          <span className="font-serif font-semibold">Leaf & Lit</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/gatherings" className="hover:text-forest">Gatherings</Link>
          <Link href="/marketplace" className="hover:text-forest">Marketplace</Link>
          <Link href="/sell" className="hover:text-forest">Sell a Book</Link>
        </div>
        <p>© 2026 Leaf & Lit · Auckland, New Zealand</p>
      </div>
    </footer>
  );
}
