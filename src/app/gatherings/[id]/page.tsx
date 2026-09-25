"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import GatheringCard from "@/components/cards/GatheringCard";
import { LoadingState, Toast } from "@/components/ui/Feedback";
import { CalendarIcon, CheckIcon, ClockIcon, HeartIcon, PeopleIcon, PinIcon } from "@/components/ui/Icons";
import { api } from "@/lib/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { MeetupCardData } from "@/types";

export default function GatheringDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [meetup, setMeetup] = useState<MeetupCardData | null>(null);
  const [similar, setSimilar] = useState<MeetupCardData[]>([]);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(search.get("published") ? "Gathering published." : "");
  const [busy, setBusy] = useState(false);

  function load() {
    return api<{ meetup: MeetupCardData; similar: MeetupCardData[] }>(`/api/meetups/${id}`).then((data) => {
      setMeetup(data.meetup);
      setSimilar(data.similar);
    });
  }

  useEffect(() => { load().catch(() => setError("We couldn't find that gathering.")); }, [id]);

  async function toggleJoin() {
    if (!user) return router.push("/signin");
    if (!meetup) return;
    setBusy(true);
    setError("");
    try {
      const data = await api<{ meetup: MeetupCardData }>(`/api/meetups/${id}/join`, { method: meetup.joined ? "DELETE" : "POST" });
      setMeetup(data.meetup);
      setToast(data.meetup.joined ? "You're joining this gathering." : "You've left this gathering.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update your place.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleSave() {
    if (!user) return router.push("/signin");
    if (!meetup) return;
    await api(`/api/saved/meetups/${id}`, { method: meetup.saved ? "DELETE" : "POST" });
    setMeetup({ ...meetup, saved: !meetup.saved });
  }

  async function messageHost() {
    if (!user || !meetup) return router.push("/signin");
    const result = await api<{ id: string }>("/api/conversations", {
      method: "POST",
      body: JSON.stringify({ recipientId: meetup.host.id, meetupId: meetup.id, body: `Hi ${meetup.host.name.split(" ")[0]}, I'd like to ask about ${meetup.title}.` }),
    });
    router.push(`/messages?c=${result.id}`);
  }

  if (!meetup && !error) return <LoadingState />;
  if (!meetup) return <p className="py-24 text-center text-body">{error}</p>;
  const full = meetup.attendees >= meetup.maxAttendees && !meetup.joined;

  return (
    <div>
      <div className="relative h-64 overflow-hidden bg-forest sm:h-80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={meetup.image} alt="" className="h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/70 via-forest/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <div className="mb-3 flex gap-2">
            <span className="rounded-full border border-white/30 bg-white/20 px-2.5 py-1 text-xs font-medium text-white">{meetup.category}</span>
            <span className="rounded-full bg-yellow/90 px-2.5 py-1 text-xs font-medium text-forest">{meetup.type}</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white sm:text-4xl">{meetup.title}</h1>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <section className="flex items-start gap-5 rounded-2xl border border-sage bg-white p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={meetup.book.cover} alt="" className="h-24 w-16 rounded-lg object-cover shadow-sm" />
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">Book Being Discussed</p>
                <h2 className="font-serif text-2xl font-semibold text-forest">{meetup.book.title}</h2>
                <p className="mt-1 text-body">by {meetup.book.author}</p>
              </div>
            </section>
            <section className="rounded-2xl border border-sage bg-white p-6">
              <h3 className="mb-3 font-serif text-xl font-semibold text-forest">About This Gathering</h3>
              <p className="leading-relaxed text-body">{meetup.description}</p>
            </section>
            <section className="rounded-2xl border border-sage bg-white p-6">
              <h3 className="mb-4 font-serif text-xl font-semibold text-forest">Discussion Topics</h3>
              <ul className="space-y-3">{meetup.topics.map((topic, index) => <li key={topic} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint text-xs font-bold text-forest">{index + 1}</span><span>{topic}</span></li>)}</ul>
            </section>
            <section className="rounded-2xl border border-yellow-deep bg-yellow/50 p-6">
              <h3 className="mb-4 font-serif text-xl font-semibold text-forest">Gathering Guidelines</h3>
              <ul className="space-y-2">{meetup.rules.map((rule) => <li key={rule} className="flex items-center gap-2 text-sm"><CheckIcon size={16} className="text-forest" />{rule}</li>)}</ul>
            </section>
            <section className="rounded-2xl border border-sage bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-serif text-xl font-semibold text-forest">Attendees <span className="text-base font-normal text-muted">({meetup.attendees}/{meetup.maxAttendees})</span></h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {meetup.attendeeAvatars.map((person) => (
                  <Link key={person.id} href={`/users/${person.id}`} title={person.name}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={person.avatar} alt={person.name} className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm" />
                  </Link>
                ))}
              </div>
            </section>
            <section className="rounded-2xl border border-sage bg-white p-6">
              <h3 className="mb-4 font-serif text-xl font-semibold text-forest">Location</h3>
              <p className="mb-4 flex items-center gap-3 font-medium"><PinIcon className="text-forest" />{meetup.location}</p>
              <div className="flex h-40 items-center justify-center rounded-xl border border-sage bg-mint/50 text-sm text-muted">{meetup.location}{meetup.suburb ? ` · ${meetup.suburb}` : ""}</div>
            </section>
          </div>
          <aside className="space-y-6">
            <div className="sticky top-24 rounded-2xl border border-sage bg-white p-6">
              <div className="mb-6 space-y-3 text-sm">
                <p className="flex items-center gap-3"><CalendarIcon size={16} className="text-forest" />{meetup.date}</p>
                <p className="flex items-center gap-3"><ClockIcon size={16} className="text-forest" />{meetup.time}</p>
                <p className="flex items-center gap-3"><PinIcon size={16} className="text-forest" />{meetup.location}</p>
                <p className="flex items-center gap-3"><PeopleIcon size={16} className="text-forest" />{meetup.attendees} / {meetup.maxAttendees} attending</p>
              </div>
              {meetup.isHost ? (
                <Link href={`/gatherings/${meetup.id}/edit`} className="block rounded-xl bg-forest py-3 text-center text-sm font-semibold text-white">Edit Gathering</Link>
              ) : (
                <button disabled={busy || full || meetup.status !== "published"} onClick={toggleJoin} className={`w-full rounded-xl py-3 text-sm font-semibold ${meetup.joined ? "bg-mint text-forest hover:bg-sage" : "bg-forest text-white hover:bg-forest-light"} disabled:opacity-50`}>
                  {meetup.joined ? "✓ You're Joining — Leave?" : full ? "Gathering Full" : "Join Gathering"}
                </button>
              )}
              <button onClick={toggleSave} className="mt-3 w-full rounded-xl border border-sage py-2.5 text-sm">{meetup.saved ? "♥ Saved" : "♡ Save Gathering"}</button>
            </div>
            <div className="rounded-2xl border border-sage bg-white p-6">
              <h3 className="mb-4 font-serif text-lg font-semibold text-forest">Hosted by</h3>
              <Link href={`/users/${meetup.host.id}`} className="mb-3 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={meetup.host.avatar} alt="" className="h-12 w-12 rounded-full border-2 border-fresh object-cover" />
                <span><span className="block font-medium text-forest">{meetup.host.name}</span><span className="text-xs text-muted">Event Organiser</span></span>
              </Link>
              <p className="mb-4 text-sm leading-relaxed text-body">{meetup.host.bio}</p>
              {!meetup.isHost && <button onClick={messageHost} className="w-full rounded-xl border border-forest py-2 text-sm font-medium text-forest hover:bg-forest hover:text-white">Message Host</button>}
            </div>
          </aside>
        </div>
        {similar.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 font-serif text-2xl font-semibold text-forest">Similar Gatherings</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{similar.map((item) => <GatheringCard key={item.id} gathering={item} />)}</div>
          </div>
        )}
      </div>
      <Toast message={toast} />
    </div>
  );
}
