"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmDialog, EmptyState, LoadingState, Toast } from "@/components/ui/Feedback";
import { api } from "@/lib/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { MeetupCardData } from "@/types";

type Tab = "hosting" | "joined" | "past";

export default function MyGatheringsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("hosting");
  const [items, setItems] = useState<MeetupCardData[]>([]);
  const [fetching, setFetching] = useState(true);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<MeetupCardData | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => { if (!loading && !user) router.replace("/signin"); }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    const query = tab === "hosting" ? "mine=hosting&when=upcoming" : tab === "joined" ? "mine=joined&when=upcoming" : "mine=hosting&when=past";
    api<{ meetups: MeetupCardData[] }>(`/api/meetups?${query}&status=`).then((data) => {
      setItems(tab === "past" ? data.meetups : data.meetups.filter((item) => item.status !== "cancelled"));
    }).finally(() => setFetching(false));
  }, [tab, user]);

  async function cancel() {
    if (!cancelId) return;
    await api(`/api/meetups/${cancelId}`, { method: "DELETE" });
    setItems((current) => current.filter((item) => item.id !== cancelId));
    setCancelId(null);
    setToast("Gathering cancelled.");
  }

  if (loading || !user) return <LoadingState />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div><h1 className="font-serif text-4xl font-bold text-forest">My Gatherings</h1><p className="mt-1 text-muted">Manage your events and track your reading community.</p></div>
        <Link href="/gatherings/create" className="rounded-xl bg-forest px-4 py-2.5 text-sm font-medium text-white">+ Create Gathering</Link>
      </div>
      <div className="mb-8 grid grid-cols-3 gap-4">
        {[["Gatherings Hosted", user.gatheringsHosted], ["Gatherings Joined", user.gatheringsJoined], ["Books Sold", user.booksSold]].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-sage bg-white p-5 text-center"><p className="mb-1 text-3xl font-bold text-forest">{value}</p><p className="text-sm text-muted">{label}</p></div>
        ))}
      </div>
      <div className="mb-6 flex w-fit gap-1 rounded-xl border border-sage bg-surface p-1">
        {(["hosting", "joined", "past"] as Tab[]).map((item) => (
          <button key={item} onClick={() => setTab(item)} className={`rounded-lg px-5 py-2 text-sm font-medium capitalize ${tab === item ? "bg-white text-forest shadow-sm" : "text-muted"}`}>{item}</button>
        ))}
      </div>
      {fetching ? <LoadingState /> : items.length === 0 ? (
        <EmptyState icon="calendar" title={tab === "hosting" ? "No upcoming gatherings hosted" : "Nothing here yet"} description="Your gatherings will show up in this tab." action="Explore Gatherings" href="/gatherings" />
      ) : (
        <div className="space-y-4">
          {items.map((meetup) => (
            <article key={meetup.id} className={`rounded-2xl border border-sage bg-white p-5 ${tab === "past" ? "opacity-75" : ""}`}>
              <div className="flex items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={meetup.image} alt="" className={`h-14 w-20 shrink-0 rounded-xl object-cover ${tab === "past" ? "grayscale" : ""}`} />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="font-serif font-semibold text-forest">{meetup.title}</h3>
                    <span className="rounded-full bg-mint px-2 py-0.5 text-xs text-forest">{meetup.status === "draft" ? "Draft" : tab === "past" ? "Past" : "Upcoming"}</span>
                  </div>
                  <p className="text-sm italic text-muted">&quot;{meetup.book.title}&quot; · {meetup.book.author}</p>
                  <p className="mt-2 text-sm text-body">{meetup.date} · {meetup.time} · {meetup.attendees}/{meetup.maxAttendees}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <Link href={`/gatherings/${meetup.id}`} className="rounded-lg bg-mint px-3 py-1.5 text-center text-xs text-forest">View</Link>
                  {tab === "hosting" && <Link href={`/gatherings/${meetup.id}/edit`} className="rounded-lg border border-sage px-3 py-1.5 text-center text-xs">Edit</Link>}
                  {tab === "joined" && <Link href={`/messages`} className="rounded-lg border border-sage px-3 py-1.5 text-center text-xs">Message Host</Link>}
                </div>
              </div>
              {tab === "hosting" && (
                <div className="mt-4 flex gap-3 border-t border-sage pt-4 text-xs">
                  <button onClick={() => setAttendees(meetup)} className="text-muted hover:text-body">View Attendees ({meetup.attendees})</button>
                  <button onClick={() => setCancelId(meetup.id)} className="text-red-500">Cancel Gathering</button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      <ConfirmDialog open={Boolean(cancelId)} title="Cancel this gathering?" message="Attendees will be notified. This cannot be undone from the public list." confirmLabel="Cancel gathering" onCancel={() => setCancelId(null)} onConfirm={cancel} />
      {attendees && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-forest/30 px-4" onClick={() => setAttendees(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6" onClick={(event) => event.stopPropagation()}>
            <h3 className="mb-4 font-serif text-xl text-forest">Attendees</h3>
            <ul className="space-y-3">{attendees.attendeeAvatars.map((person) => <li key={person.id} className="flex items-center gap-3"><img src={person.avatar} alt="" className="h-8 w-8 rounded-full" />{person.name}</li>)}</ul>
            {attendees.attendeeAvatars.length === 0 && <p className="text-sm text-muted">No one has joined yet.</p>}
            <button onClick={() => setAttendees(null)} className="mt-5 text-sm text-forest">Close</button>
          </div>
        </div>
      )}
      <Toast message={toast} />
    </div>
  );
}
