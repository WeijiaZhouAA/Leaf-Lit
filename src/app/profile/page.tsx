"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BookCard from "@/components/cards/BookCard";
import { GenreTag, LoadingState } from "@/components/ui/Feedback";
import { PinIcon } from "@/components/ui/Icons";
import { api } from "@/lib/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { BookCardData, MeetupCardData } from "@/types";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [meetups, setMeetups] = useState<MeetupCardData[]>([]);
  const [books, setBooks] = useState<BookCardData[]>([]);

  useEffect(() => { if (!loading && !user) router.replace("/signin"); }, [loading, user, router]);
  useEffect(() => {
    if (!user) return;
    api<{ meetups: MeetupCardData[] }>("/api/meetups?mine=hosting").then((data) => setMeetups(data.meetups));
    api<{ books: BookCardData[] }>("/api/books?mine=1&status=active").then((data) => setBooks(data.books));
  }, [user]);

  if (loading || !user) return <LoadingState />;
  const upcoming = meetups.filter((meetup) => meetup.status === "published" && new Date(meetup.dateValue) >= new Date(new Date().toDateString()));
  const past = meetups.filter((meetup) => new Date(meetup.dateValue) < new Date(new Date().toDateString()));

  return (
    <div>
      <div className="h-36 bg-gradient-to-r from-forest to-forest-light" />
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="-mt-12 mb-8 flex items-end justify-between">
          <div className="flex items-end gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user.avatar} alt="" className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-lg" />
            <div className="pb-2">
              <h1 className="font-serif text-2xl font-bold text-forest">{user.name}</h1>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted"><PinIcon size={12} />{user.location} · Member since {user.memberSince}</p>
            </div>
          </div>
          <Link href="/profile/edit" className="mb-2 rounded-xl border border-sage px-4 py-2 text-sm hover:bg-surface">Edit Profile</Link>
        </div>
        <div className="grid gap-8 pb-16 lg:grid-cols-3">
          <aside className="space-y-5">
            <section className="rounded-2xl border border-sage bg-white p-5"><h3 className="mb-3 font-serif font-semibold text-forest">About Me</h3><p className="text-sm leading-relaxed text-body">{user.bio || "Add a short bio so other readers can say hello."}</p></section>
            <section className="rounded-2xl border border-sage bg-white p-5"><h3 className="mb-3 font-serif font-semibold text-forest">Favourite Genres</h3><div className="flex flex-wrap gap-2">{user.favouriteGenres.map((genre) => <GenreTag key={genre}>{genre}</GenreTag>)}</div></section>
            <div className="grid grid-cols-3 gap-3">
              {[["Hosted", user.gatheringsHosted], ["Joined", user.gatheringsJoined], ["Sold", user.booksSold]].map(([label, value]) => (
                <div key={String(label)} className="rounded-xl border border-sage bg-white p-3 text-center"><p className="text-xl font-bold text-forest">{value}</p><p className="text-xs text-muted">{label}</p></div>
              ))}
            </div>
          </aside>
          <div className="space-y-8 lg:col-span-2">
            <section>
              <div className="mb-4 flex justify-between"><h2 className="font-serif text-xl font-semibold text-forest">Upcoming Gatherings</h2><Link href="/my-gatherings" className="text-sm text-muted">View all</Link></div>
              {upcoming.length === 0 ? <div className="rounded-2xl border border-sage bg-white p-8 text-center text-sm text-muted">No upcoming gatherings.</div> : upcoming.slice(0, 3).map((meetup) => (
                <div key={meetup.id} className="mb-3 flex items-center gap-3 rounded-2xl border border-sage bg-white p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={meetup.image} alt="" className="h-10 w-16 rounded-lg object-cover" />
                  <div className="flex-1"><p className="text-sm font-medium text-forest">{meetup.title}</p><p className="text-xs text-muted">{meetup.date}</p></div>
                  <Link href={`/gatherings/${meetup.id}`} className="rounded-lg bg-mint px-3 py-1.5 text-xs text-forest">View</Link>
                </div>
              ))}
            </section>
            <section>
              <div className="mb-4 flex justify-between"><h2 className="font-serif text-xl font-semibold text-forest">Books for Sale</h2><Link href="/my-listings" className="text-sm text-muted">View all</Link></div>
              <div className="grid gap-4 sm:grid-cols-2">{books.slice(0, 2).map((book) => <BookCard key={book.id} book={book} />)}</div>
            </section>
            {past.length > 0 && (
              <section>
                <h2 className="mb-4 font-serif text-xl font-semibold text-forest">Past Gatherings</h2>
                {past.slice(0, 3).map((meetup) => <div key={meetup.id} className="mb-3 rounded-2xl border border-sage bg-white p-4 text-sm opacity-70">{meetup.title} · {meetup.date}</div>)}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
