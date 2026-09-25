"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GatheringCard from "@/components/cards/GatheringCard";
import BookCard from "@/components/cards/BookCard";
import { EmptyState, LoadingState } from "@/components/ui/Feedback";
import { api } from "@/lib/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { BookCardData, MeetupCardData } from "@/types";

export default function SavedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"gatherings" | "books">("gatherings");
  const [meetups, setMeetups] = useState<MeetupCardData[]>([]);
  const [books, setBooks] = useState<BookCardData[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (!loading && !user) router.replace("/signin"); }, [loading, user, router]);

  function load() {
    setFetching(true);
    Promise.all([
      api<{ meetups: MeetupCardData[] }>("/api/meetups?saved=1"),
      api<{ books: BookCardData[] }>("/api/books?saved=1"),
    ]).then(([meetupData, bookData]) => {
      setMeetups(meetupData.meetups);
      setBooks(bookData.books);
    }).finally(() => setFetching(false));
  }

  useEffect(() => { if (user) load(); }, [user]);
  if (loading || !user) return <LoadingState />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 font-serif text-4xl font-bold text-forest">Saved Items</h1>
      <p className="mb-8 text-muted">Books and gatherings you&apos;ve bookmarked for later.</p>
      <div className="mb-8 flex w-fit gap-1 rounded-xl border border-sage bg-surface p-1">
        <button onClick={() => setTab("gatherings")} className={`rounded-lg px-5 py-2 text-sm ${tab === "gatherings" ? "bg-white text-forest shadow-sm" : "text-muted"}`}>Saved Gatherings <span className="ml-1 rounded-full bg-mint px-1.5 text-xs">{meetups.length}</span></button>
        <button onClick={() => setTab("books")} className={`rounded-lg px-5 py-2 text-sm ${tab === "books" ? "bg-white text-forest shadow-sm" : "text-muted"}`}>Saved Books <span className="ml-1 rounded-full bg-mint px-1.5 text-xs">{books.length}</span></button>
      </div>
      {fetching ? <LoadingState /> : tab === "gatherings" ? (
        meetups.length === 0 ? <EmptyState icon="calendar" title="No saved gatherings yet" description="Browse gatherings and save the ones you're interested in attending." action="Discover Gatherings" href="/gatherings" /> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{meetups.map((meetup) => <GatheringCard key={meetup.id} gathering={meetup} />)}</div>
      ) : books.length === 0 ? <EmptyState icon="book" title="No saved books yet" description="Browse the marketplace and save books you'd like to buy." action="Browse Marketplace" href="/marketplace" /> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{books.map((book) => <BookCard key={book.id} book={book} onChange={load} />)}</div>}
    </div>
  );
}
