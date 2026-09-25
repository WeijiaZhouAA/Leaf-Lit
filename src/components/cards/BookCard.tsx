"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeartIcon, PinIcon } from "@/components/ui/Icons";
import { CONDITION_BADGE } from "@/lib/constants";
import { api } from "@/lib/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { BookCardData } from "@/types";

export default function BookCard({ book, onChange }: { book: BookCardData; onChange?: () => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(book.saved);
  const [busy, setBusy] = useState(false);

  async function toggle(event: React.MouseEvent) {
    event.preventDefault();
    if (!user) {
      router.push("/signin");
      return;
    }
    setBusy(true);
    try {
      await api(saved ? `/api/saved/books/${book.id}` : `/api/saved/books/${book.id}`, { method: saved ? "DELETE" : "POST" });
      setSaved(!saved);
      onChange?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-sage bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex gap-3 p-4 pb-3">
        <div className="h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-mint shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={book.cover} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <h3 className="line-clamp-2 font-serif text-base font-semibold leading-snug text-forest">{book.title}</h3>
              <p className="mt-0.5 text-sm text-muted">{book.author}</p>
            </div>
            <button onClick={toggle} disabled={busy} aria-label={saved ? "Unsave" : "Save"} className={`shrink-0 rounded-lg p-1.5 ${saved ? "bg-red-50 text-red-400" : "text-muted hover:bg-red-50 hover:text-red-400"}`}>
              <HeartIcon size={16} filled={saved} />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xl font-bold text-forest">NZ${book.price}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CONDITION_BADGE[book.condition] ?? "bg-sage text-body"}`}>{book.condition}</span>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="mb-3 flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={book.seller.avatar} alt="" className="h-4 w-4 rounded-full object-cover" />
            <span>{book.seller.name}</span>
          </div>
          <div className="flex items-center gap-1"><PinIcon size={12} /><span>{book.location}</span></div>
        </div>
        <Link href={`/marketplace/${book.id}`} className="block w-full rounded-xl border border-forest py-2 text-center text-sm font-medium text-forest transition-colors hover:bg-forest hover:text-white">
          View Listing
        </Link>
      </div>
    </article>
  );
}
