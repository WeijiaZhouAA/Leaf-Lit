"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui/Feedback";
import { api } from "@/lib/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { OrderDetail } from "@/types";

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { if (!loading && !user) router.replace("/signin"); }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    async function load() {
      try {
        const data = await api<{ order: OrderDetail }>(`/api/orders/${id}`);
        if (active) setOrder(data.order);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "We couldn't find that order.");
      }
    }
    load();
    const timer = window.setInterval(load, 4000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [user, id]);

  if (loading || !user || (!order && !error)) return <LoadingState />;
  if (!order) return <p className="py-24 text-center">{error}</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/orders" className="mb-6 inline-flex text-sm text-muted hover:text-forest">Back to My Purchases</Link>
      <div className="mb-6 flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={order.cover} alt="" className="h-20 w-14 rounded-lg object-cover" />
        <div>
          <h1 className="font-serif text-3xl font-bold text-forest">{order.title}</h1>
          <p className="text-muted">{order.author} · {order.amount}</p>
        </div>
      </div>
      <section className="mb-6 rounded-2xl border border-sage bg-white p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Right now</p>
        <h2 className="mt-1 font-serif text-2xl font-semibold text-forest">{order.statusLabel}</h2>
        <p className="mt-2 text-body">{order.place}</p>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-surface p-3"><p className="text-xs text-muted">Carrier</p><p className="font-medium text-forest">{order.carrier}</p></div>
          <div className="rounded-lg bg-surface p-3"><p className="text-xs text-muted">Tracking number</p><p className="font-mono font-medium text-forest">{order.trackingNumber}</p></div>
          <div className="rounded-lg bg-surface p-3"><p className="text-xs text-muted">Deliver to</p><p className="font-medium text-forest">{order.address}</p><p className="text-muted">{order.phone}</p></div>
          <div className="rounded-lg bg-surface p-3"><p className="text-xs text-muted">Paid with</p><p className="font-medium text-forest">{order.paymentLabel}</p></div>
        </div>
      </section>
      <ol className="space-y-0 rounded-2xl border border-sage bg-white p-6">
        {order.events.map((event, index) => (
          <li key={event.title} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className={`mt-1 h-3 w-3 rounded-full ${event.done ? "bg-forest" : "bg-sage"}`} />
              {index < order.events.length - 1 && <span className={`w-px flex-1 ${event.done ? "bg-forest" : "bg-sage"}`} />}
            </div>
            <div className="pb-6">
              <p className={`text-sm font-medium ${event.current ? "text-forest" : "text-body"}`}>{event.title}</p>
              <p className="text-sm text-muted">{event.place}</p>
              <p className="text-xs text-muted">{new Date(event.time).toLocaleString("en-NZ", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
