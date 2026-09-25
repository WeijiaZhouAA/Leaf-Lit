"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GatheringCard from "@/components/cards/GatheringCard";
import BookCard from "@/components/cards/BookCard";
import { LoadingState } from "@/components/ui/Feedback";
import { CloudIcon, PinIcon } from "@/components/ui/Icons";
import { GENRES } from "@/lib/constants";
import { api } from "@/lib/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { BookCardData, MeetupCardData } from "@/types";

export default function HomePage() {
  const { user } = useAuth();
  const [meetups, setMeetups] = useState<MeetupCardData[]>([]);
  const [books, setBooks] = useState<BookCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<{ meetups: MeetupCardData[] }>("/api/meetups?when=upcoming"),
      api<{ books: BookCardData[] }>("/api/books"),
    ]).then(([meetupData, bookData]) => {
      setMeetups(meetupData.meetups.slice(0, 3));
      setBooks(bookData.books.slice(0, 6));
    }).finally(() => setLoading(false));
  }, []);

  const city = user?.location?.split(",")[0] || "Auckland";
  const country = user?.location?.split(",")[1]?.trim() || "New Zealand";

  return (
    <div>
      <section className="border-b border-sage bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1.5 text-sm font-medium text-forest">
                <CloudIcon /> Community reading platform
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-sage bg-white px-3 py-1.5 text-sm text-body shadow-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                <PinIcon size={13} className="text-muted" />
                <span className="font-medium text-forest">{city}</span>
                <span className="text-xs text-muted">{country}</span>
              </div>
            </div>
            <h1 className="mb-6 font-serif text-5xl font-bold leading-tight text-forest lg:text-6xl">Read.<br />Meet.<br />Share.</h1>
            <p className="mb-8 max-w-md text-xl leading-relaxed text-body">Discover local book lovers, join meaningful conversations, and give great books a second life.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/gatherings" className="rounded-xl bg-forest px-6 py-3 text-sm font-medium text-white hover:bg-forest-light">Explore Gatherings</Link>
              <Link href="/marketplace" className="rounded-xl border border-yellow-deep bg-yellow px-6 py-3 text-sm font-medium text-forest hover:bg-yellow-deep">Browse Books</Link>
            </div>
            <div className="mt-10 flex items-center gap-6 border-t border-sage pt-8">
              {[["1,240", "Readers"], ["347", "Gatherings Hosted"], ["2,800+", "Books Shared"]].map(([value, label], index) => (
                <div key={label} className="flex items-center gap-6">
                  {index > 0 && <div className="h-8 w-px bg-sage" />}
                  <div><p className="text-2xl font-bold text-forest">{value}</p><p className="text-sm text-muted">{label}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="h-80 overflow-hidden rounded-3xl bg-mint shadow-lg lg:h-[460px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hero.jpg" alt="A book and coffee on a cosy blanket" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div><h2 className="font-serif text-3xl font-semibold text-forest">Upcoming Gatherings</h2><p className="mt-1 text-muted">Events happening near you this month</p></div>
            <Link href="/gatherings" className="text-sm font-medium text-forest hover:underline">View all →</Link>
          </div>
          {loading ? <LoadingState /> : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{meetups.map((meetup) => <GatheringCard key={meetup.id} gathering={meetup} />)}</div>
          )}
        </div>
      </section>

      <section className="border-y border-sage bg-surface py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 sm:px-6">
          <span className="mr-2 text-sm font-medium text-muted">Browse by genre:</span>
          {GENRES.filter((genre) => !["Poetry", "Sci-Fi"].includes(genre)).map((genre) => (
            <Link key={genre} href={`/gatherings?genre=${encodeURIComponent(genre)}`} className="rounded-full border border-sage bg-white px-3 py-1.5 text-sm text-body hover:border-fresh hover:bg-mint hover:text-forest">{genre}</Link>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div><h2 className="font-serif text-3xl font-semibold text-forest">Books Looking for a New Home</h2><p className="mt-1 text-muted">Pre-loved books available near you</p></div>
            <Link href="/marketplace" className="text-sm font-medium text-forest hover:underline">Browse all →</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{books.map((book) => <BookCard key={book.id} book={book} />)}</div>
        </div>
      </section>

      <section className="bg-forest py-16 text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="mb-3 font-serif text-sm font-medium italic text-mint">A place for readers, by readers</p>
          <h2 className="mb-4 font-serif text-4xl font-bold text-white">Every great conversation<br />starts with a great book.</h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-fresh">Create your first gathering or list a book you love. The community is waiting.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/gatherings/create" className="rounded-xl bg-yellow px-6 py-3 text-sm font-medium text-forest hover:bg-yellow-deep">Host a Gathering</Link>
            <Link href="/sell" className="rounded-xl border border-fresh px-6 py-3 text-sm font-medium text-white hover:bg-white/10">List a Book</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
