"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BellIcon, BookIcon, CalendarIcon, HeartIcon, MessageIcon, PeopleIcon, SearchIcon } from "@/components/ui/Icons";
import { LoadingState } from "@/components/ui/Feedback";
import { api } from "@/lib/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { NotificationItem } from "@/types";

const colors: Record<string, string> = {
  join: "bg-mint text-forest",
  reminder: "bg-yellow text-forest",
  message: "bg-blue-50 text-blue-600",
  save: "bg-red-50 text-red-400",
  discover: "bg-purple-50 text-purple-600",
};

function Icon({ type }: { type: string }) {
  if (type === "join") return <PeopleIcon size={16} />;
  if (type === "reminder") return <CalendarIcon size={16} />;
  if (type === "message") return <MessageIcon size={16} />;
  if (type === "save") return <HeartIcon size={16} />;
  if (type === "discover") return <SearchIcon size={16} />;
  return <BellIcon size={16} />;
}

export default function NotificationsPage() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (!loading && !user) router.replace("/signin"); }, [loading, user, router]);
  useEffect(() => {
    if (!user) return;
    api<{ notifications: NotificationItem[] }>("/api/notifications").then((data) => setItems(data.notifications)).finally(() => setFetching(false));
  }, [user]);

  async function mark(id: string, link: string | null) {
    await api(`/api/notifications/${id}`, { method: "PATCH" });
    setItems((current) => current.map((item) => item.id === id ? { ...item, read: true } : item));
    await refresh();
    if (link) router.push(link);
  }

  async function markAll() {
    await api("/api/notifications/read-all", { method: "POST" });
    setItems((current) => current.map((item) => ({ ...item, read: true })));
    await refresh();
  }

  if (loading || !user || fetching) return <LoadingState />;
  const unread = items.filter((item) => !item.read);
  const read = items.filter((item) => item.read);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div><h1 className="font-serif text-3xl font-bold text-forest">Notifications</h1>{unread.length > 0 && <p className="mt-1 text-sm text-muted">{unread.length} unread</p>}</div>
        {unread.length > 0 && <button onClick={markAll} className="text-sm text-muted hover:text-forest">Mark all as read</button>}
      </div>
      {items.length === 0 ? (
        <div className="py-24 text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-mint text-forest"><BookIcon size={28} /></div><h3 className="font-serif text-xl text-forest">You&apos;re all caught up</h3><p className="text-sm text-muted">No new notifications right now.</p></div>
      ) : (
        <>
          {unread.length > 0 && <Group label="New" items={unread} onOpen={mark} />}
          {read.length > 0 && <Group label="Earlier" items={read} muted onOpen={mark} />}
        </>
      )}
    </div>
  );
}

function Group({ label, items, muted, onOpen }: { label: string; items: NotificationItem[]; muted?: boolean; onOpen: (id: string, link: string | null) => void }) {
  return (
    <div className="mb-6">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <div className="space-y-2">
        {items.map((item) => (
          <button key={item.id} onClick={() => onOpen(item.id, item.link)} className={`flex w-full items-start gap-4 rounded-2xl border border-sage bg-white p-4 text-left hover:border-fresh ${muted ? "opacity-70" : "shadow-sm"}`}>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colors[item.type] ?? "bg-mint text-forest"}`}><Icon type={item.type} /></span>
            <span className="flex-1"><span className="block text-sm text-body">{item.text}</span><span className="mt-1 block text-xs text-muted">{item.time}</span></span>
            {!item.read && <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-forest" />}
          </button>
        ))}
      </div>
    </div>
  );
}
