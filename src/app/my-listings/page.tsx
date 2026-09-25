"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmDialog, LoadingState, Toast } from "@/components/ui/Feedback";
import { CONDITION_BADGE } from "@/lib/constants";
import { api } from "@/lib/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { BookCardData } from "@/types";

type Tab = "active" | "sold" | "draft";

export default function MyListingsPage() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("active");
  const [books, setBooks] = useState<BookCardData[]>([]);
  const [fetching, setFetching] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => { if (!loading && !user) router.replace("/signin"); }, [loading, user, router]);

  function load() {
    setFetching(true);
    api<{ books: BookCardData[] }>("/api/books?mine=1&status=all").then((data) => setBooks(data.books)).finally(() => setFetching(false));
  }

  useEffect(() => { if (user) load(); }, [user]);

  const visible = books.filter((book) => book.status === tab);
  const savedBy = books.reduce((sum, book) => sum + book.savedBy, 0);

  async function markSold(id: string) {
    await api(`/api/books/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: "sold" }) });
    setToast("Marked as sold.");
    await refresh();
    load();
  }

  async function remove() {
    if (!deleteId) return;
    await api(`/api/books/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    setToast("Listing deleted.");
    load();
  }

  if (loading || !user) return <LoadingState />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-start justify-between">
        <div><h1 className="font-serif text-4xl font-bold text-forest">My Listings</h1><p className="mt-1 text-muted">Manage your second-hand book listings.</p></div>
        <Link href="/sell" className="rounded-xl bg-forest px-4 py-2.5 text-sm font-medium text-white">+ Sell a Book</Link>
      </div>
      <div className="mb-8 grid grid-cols-3 gap-4">
        {[["Active Listings", books.filter((book) => book.status === "active").length], ["Books Sold", books.filter((book) => book.status === "sold").length], ["Saved by Others", savedBy]].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-sage bg-white p-5 text-center"><p className="text-3xl font-bold text-forest">{value}</p><p className="text-sm text-muted">{label}</p></div>
        ))}
      </div>
      <div className="mb-6 flex w-fit gap-1 rounded-xl border border-sage bg-surface p-1">
        {(["active", "sold", "draft"] as Tab[]).map((item) => (
          <button key={item} onClick={() => setTab(item)} className={`rounded-lg px-5 py-2 text-sm font-medium capitalize ${tab === item ? "bg-white text-forest shadow-sm" : "text-muted"}`}>
            {item === "draft" ? "Drafts" : item} <span className="ml-1 rounded-full bg-mint px-1.5 text-xs">{books.filter((book) => book.status === item).length}</span>
          </button>
        ))}
      </div>
      {fetching ? <LoadingState /> : visible.length === 0 ? (
        <div className="py-20 text-center"><h3 className="font-serif text-xl text-forest">{tab === "active" ? "Your bookshelf is looking a little empty." : "Nothing in this tab yet."}</h3>{tab !== "sold" && <Link href="/sell" className="mt-4 inline-block rounded-xl bg-forest px-5 py-2.5 text-sm text-white">Sell Your First Book</Link>}</div>
      ) : (
        <div className="space-y-4">
          {visible.map((book) => (
            <article key={book.id} className={`flex items-center gap-4 rounded-2xl border border-sage bg-white p-5 ${book.status === "sold" ? "opacity-70" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={book.cover} alt="" className="h-16 w-12 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <h3 className="font-serif font-semibold text-forest">{book.title}</h3>
                <p className="text-sm text-muted">{book.author}</p>
                <div className="mt-2 flex items-center gap-3"><span className="font-bold text-forest">NZ${book.price}</span><span className={`rounded-full px-2 py-0.5 text-xs ${CONDITION_BADGE[book.condition]}`}>{book.condition}</span>{book.savedBy > 0 && <span className="text-xs text-muted">{book.savedBy} saved</span>}</div>
              </div>
              <div className="flex flex-col gap-2">
                {book.status !== "sold" && <Link href={`/listings/${book.id}/edit`} className="rounded-lg bg-mint px-3 py-1.5 text-center text-xs text-forest">Edit</Link>}
                {book.status === "active" && <button onClick={() => markSold(book.id)} className="rounded-lg border border-sage px-3 py-1.5 text-xs">Mark Sold</button>}
                {book.status === "draft" && <button onClick={() => api(`/api/books/${book.id}/status`, { method: "PATCH", body: JSON.stringify({ status: "active" }) }).then(load)} className="rounded-lg bg-forest px-3 py-1.5 text-xs text-white">Publish</button>}
                {book.status === "sold" && <button onClick={() => api(`/api/books/${book.id}/status`, { method: "PATCH", body: JSON.stringify({ status: "active" }) }).then(() => { setToast("Listing is active again."); load(); })} className="rounded-lg border border-sage px-3 py-1.5 text-xs">Relist</button>}
                {book.status !== "sold" && <button onClick={() => setDeleteId(book.id)} className="text-xs text-red-500">Delete</button>}
              </div>
            </article>
          ))}
        </div>
      )}
      <ConfirmDialog open={Boolean(deleteId)} title="Delete this listing?" message="This removes the listing for everyone. Saved copies will disappear too." confirmLabel="Delete" onCancel={() => setDeleteId(null)} onConfirm={remove} />
      <Toast message={toast} />
    </div>
  );
}
