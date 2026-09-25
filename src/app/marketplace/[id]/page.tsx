"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import BookCard from "@/components/cards/BookCard";
import { LoadingState, Toast } from "@/components/ui/Feedback";
import { CONDITION_BADGE, CONDITION_DESCRIPTIONS } from "@/lib/constants";
import { api } from "@/lib/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { BookCardData, PaymentMethodItem, ShippingAddress } from "@/types";

export default function BookDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [book, setBook] = useState<BookCardData | null>(null);
  const [similar, setSimilar] = useState<BookCardData[]>([]);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [checkout, setCheckout] = useState(false);
  const [methods, setMethods] = useState<PaymentMethodItem[]>([]);
  const [shipping, setShipping] = useState<ShippingAddress | null>(null);
  const [methodId, setMethodId] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  useEffect(() => {
    api<{ book: BookCardData; similar: BookCardData[] }>(`/api/books/${id}`).then((data) => {
      setBook(data.book);
      setSimilar(data.similar);
    }).catch(() => setError("We couldn't find that listing."));
  }, [id]);

  async function toggleSave() {
    if (!user || !book) return router.push("/signin");
    await api(`/api/saved/books/${id}`, { method: book.saved ? "DELETE" : "POST" });
    setBook({ ...book, saved: !book.saved });
  }

  async function openCheckout() {
    if (!user) return router.push("/signin");
    setPayError("");
    setCheckout(true);
    const [methodData, shippingData] = await Promise.all([
      api<{ methods: PaymentMethodItem[] }>("/api/payment-methods"),
      api<{ shipping: ShippingAddress }>("/api/settings/shipping"),
    ]);
    setMethods(methodData.methods);
    setShipping(shippingData.shipping);
    setMethodId(methodData.methods.find((item) => item.isDefault)?.id || methodData.methods[0]?.id || "");
  }

  async function pay() {
    if (!methodId) return setPayError("Add a payment method in Settings first.");
    setPaying(true);
    setPayError("");
    try {
      const result = await api<{ order: { id: string } }>(`/api/books/${id}/purchase`, {
        method: "POST",
        body: JSON.stringify({ paymentMethodId: methodId }),
      });
      router.push(`/orders/${result.order.id}`);
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Payment could not be completed.");
      setPaying(false);
    }
  }

  async function messageSeller() {
    if (!user || !book) return router.push("/signin");
    const result = await api<{ id: string }>("/api/conversations", {
      method: "POST",
      body: JSON.stringify({ recipientId: book.seller.id, bookId: book.id, body: `Hi, is ${book.title} still available?` }),
    });
    router.push(`/messages?c=${result.id}`);
  }

  if (!book && !error) return <LoadingState />;
  if (!book) return <p className="py-24 text-center">{error}</p>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link href="/marketplace" className="mb-6 inline-flex text-sm text-muted hover:text-forest">← Back to Marketplace</Link>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4">
          <div className="flex justify-center rounded-2xl border border-sage bg-white p-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={book.cover} alt={book.title} className="h-72 w-48 rounded-lg object-cover shadow-lg" />
          </div>
          <div className="rounded-2xl border border-sage bg-white p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">Condition</p>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${CONDITION_BADGE[book.condition]}`}>{book.condition}</span>
              <p className="text-sm text-body">{CONDITION_DESCRIPTIONS[book.condition]}</p>
            </div>
            {book.sellerNotes && <p className="mt-3 border-t border-sage pt-3 text-sm italic">&quot;{book.sellerNotes}&quot;</p>}
          </div>
        </div>
        <div className="space-y-6">
          <section className="rounded-2xl border border-sage bg-white p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h1 className="font-serif text-3xl font-bold text-forest">{book.title}</h1>
                <p className="mt-1 text-body">by <span className="font-medium">{book.author}</span></p>
              </div>
              <button onClick={toggleSave} className={`rounded-xl p-2 ${book.saved ? "bg-red-50 text-red-400" : "bg-surface text-muted"}`}>♥</button>
            </div>
            <div className="mb-4 text-3xl font-bold text-forest">NZ${book.price}</div>
            <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-surface p-3"><p className="text-xs text-muted">Genre</p><p className="font-medium">{book.genre}</p></div>
              <div className="rounded-lg bg-surface p-3"><p className="text-xs text-muted">Location</p><p className="font-medium">{book.location}</p></div>
              {book.isbn && <div className="col-span-2 rounded-lg bg-surface p-3"><p className="text-xs text-muted">ISBN</p><p className="font-mono text-xs font-medium">{book.isbn}</p></div>}
            </div>
            <p className="text-xs text-muted">Listed {book.listedDate}</p>
          </section>
          <section className="rounded-2xl border border-sage bg-white p-6">
            <h3 className="mb-3 font-serif text-lg font-semibold text-forest">About This Book</h3>
            <p className="text-sm leading-relaxed text-body">{book.description}</p>
          </section>
        </div>
        <aside className="space-y-5">
          <div className="sticky top-24 rounded-2xl border border-sage bg-white p-6">
            <div className="mb-2 text-3xl font-bold text-forest">NZ${book.price}</div>
            <p className="mb-5 text-sm text-muted"><span className={`rounded-full px-2.5 py-0.5 font-medium ${CONDITION_BADGE[book.condition]}`}>{book.condition}</span> · {book.location}</p>
            {book.orderId ? (
              <Link href={`/orders/${book.orderId}`} className="block rounded-xl bg-forest py-3 text-center text-sm font-semibold text-white">Track Delivery</Link>
            ) : book.status === "sold" ? <p className="rounded-xl bg-sage py-3 text-center text-sm">This book has been sold.</p> : book.isOwner ? (
              <Link href={`/listings/${book.id}/edit`} className="block rounded-xl bg-forest py-3 text-center text-sm font-semibold text-white">Edit Listing</Link>
            ) : (
              <button onClick={openCheckout} className="w-full rounded-xl bg-forest py-3 text-sm font-semibold text-white hover:bg-forest-light">Buy Now</button>
            )}
            {book.status !== "sold" && !book.isOwner && (
              <button onClick={messageSeller} className="mt-3 w-full rounded-xl border border-sage py-2.5 text-sm">Message Seller</button>
            )}
            {checkout && (
              <div className="mt-4 space-y-3 border-t border-sage pt-4 text-sm">
                <p className="font-medium text-forest">Pay NZ${book.price}</p>
                {shipping?.line ? (
                  <p className="text-muted">Deliver to {shipping.line}, {shipping.suburb} {shipping.postcode} · {shipping.phone}</p>
                ) : (
                  <Link href="/settings#shipping" className="block text-forest underline">Add a delivery address and phone in Settings</Link>
                )}
                {methods.length === 0 ? (
                  <Link href="/settings#payments" className="block text-forest underline">Add a payment method in Settings</Link>
                ) : (
                  <select value={methodId} onChange={(event) => setMethodId(event.target.value)} className="w-full rounded-xl border border-sage px-3 py-2">
                    {methods.map((method) => <option key={method.id} value={method.id}>{method.label}</option>)}
                  </select>
                )}
                {payError && <p className="text-red-600">{payError}</p>}
                <button onClick={pay} disabled={paying || !shipping?.line || methods.length === 0} className="w-full rounded-xl bg-forest py-2.5 font-semibold text-white disabled:opacity-40">{paying ? "Paying..." : "Confirm and Pay"}</button>
              </div>
            )}
            <button onClick={toggleSave} className="mt-3 w-full rounded-xl border border-sage py-2.5 text-sm">{book.saved ? "♥ Saved" : "♡ Save Book"}</button>
          </div>
          <div className="rounded-2xl border border-sage bg-white p-6">
            <h3 className="mb-4 font-serif text-lg font-semibold text-forest">About the Seller</h3>
            <div className="mb-4 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={book.seller.avatar} alt="" className="h-12 w-12 rounded-full border-2 border-fresh object-cover" />
              <div><p className="font-medium text-forest">{book.seller.name}</p><p className="text-xs text-muted">Member since {book.seller.memberSince}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center text-sm">
              <div className="rounded-lg bg-surface p-3"><p className="text-lg font-bold text-forest">{book.seller.soldCount}</p><p className="text-xs text-muted">Books Sold</p></div>
              <div className="rounded-lg bg-surface p-3"><p className="text-lg font-bold text-forest">{book.location.split(" ")[0]}</p><p className="text-xs text-muted">Pickup</p></div>
            </div>
            <Link href={`/users/${book.seller.id}`} className="mt-4 block rounded-xl border border-sage py-2 text-center text-sm hover:bg-surface">View Profile</Link>
          </div>
        </aside>
      </div>
      {similar.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 font-serif text-2xl font-semibold text-forest">You May Also Like</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{similar.map((item) => <BookCard key={item.id} book={item} />)}</div>
        </div>
      )}
      <Toast message={toast} />
    </div>
  );
}
