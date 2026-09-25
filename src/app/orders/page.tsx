"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui/Feedback";
import { api } from "@/lib/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { OrderDetail } from "@/types";

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (!loading && !user) router.replace("/signin"); }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    async function load() {
      try {
        const data = await api<{ orders: OrderDetail[] }>("/api/orders");
        if (active) setOrders(data.orders);
      } finally {
        if (active) setFetching(false);
      }
    }
    load();
    const timer = window.setInterval(load, 4000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [user]);

  function toggle(id: string) {
    setOpenIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  const allOpen = orders.length > 0 && orders.every((order) => openIds.includes(order.id));

  if (loading || !user || fetching) return <LoadingState />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="mb-2 font-serif text-4xl font-bold text-forest">My Purchases</h1>
          <p className="text-muted">Your books, and where each parcel is right now.</p>
        </div>
        {orders.length > 0 && (
          <button
            type="button"
            onClick={() => setOpenIds(allOpen ? [] : orders.map((order) => order.id))}
            className="shrink-0 text-sm font-medium text-forest hover:underline"
          >
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        )}
      </div>
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-sage bg-white p-10 text-center">
          <p className="font-serif text-xl text-forest">No purchases yet.</p>
          <Link href="/marketplace" className="mt-4 inline-block rounded-xl bg-forest px-5 py-2.5 text-sm text-white">Browse Books</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const open = openIds.includes(order.id);
            return (
              <article key={order.id} className="rounded-2xl border border-sage bg-white">
                <button type="button" onClick={() => toggle(order.id)} aria-expanded={open} className="flex w-full items-center gap-4 p-5 text-left">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={order.cover} alt="" className="h-16 w-12 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <h2 className="font-serif font-semibold text-forest">{order.title}</h2>
                    <p className="text-sm text-muted">{order.author} · {order.amount}</p>
                    <p className="text-sm text-muted">{order.carrier} · {order.place}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-forest">{order.statusLabel}</p>
                    <span className="text-muted" aria-hidden="true">{open ? "▴" : "▾"}</span>
                  </div>
                </button>
                {open && (
                  <div className="border-t border-sage px-5 pb-5 pt-4">
                    <div className="grid gap-3 text-sm sm:grid-cols-3">
                      <div className="rounded-lg bg-surface p-3"><p className="text-xs text-muted">Carrier</p><p className="font-medium text-forest">{order.carrier}</p></div>
                      <div className="rounded-lg bg-surface p-3"><p className="text-xs text-muted">Tracking number</p><p className="font-mono font-medium text-forest">{order.trackingNumber}</p></div>
                      <div className="rounded-lg bg-surface p-3"><p className="text-xs text-muted">Current location</p><p className="font-medium text-forest">{order.place}</p></div>
                    </div>
                    <p className="mt-3 text-sm text-muted">Paid with {order.paymentLabel} · {order.address}</p>
                    <ol className="mt-4 space-y-2">
                      {order.events.map((event) => (
                        <li key={event.title} className={`flex items-start justify-between gap-3 text-sm ${event.current ? "text-forest" : event.done ? "text-body" : "text-muted"}`}>
                          <span>{event.current ? "● " : event.done ? "✓ " : "○ "}{event.title} · {event.place}</span>
                          <span className="shrink-0 text-xs">{new Date(event.time).toLocaleString("en-NZ", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
