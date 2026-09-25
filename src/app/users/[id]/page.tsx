"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import BookCard from "@/components/cards/BookCard";
import { GenreTag, LoadingState } from "@/components/ui/Feedback";
import { PinIcon } from "@/components/ui/Icons";
import { api } from "@/lib/client";
import type { BookCardData, MeetupCardData, PublicUser } from "@/types";

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [meetups, setMeetups] = useState<MeetupCardData[]>([]);
  const [books, setBooks] = useState<BookCardData[]>([]);

  useEffect(() => {
    api<{ user: PublicUser; meetups: MeetupCardData[]; books: BookCardData[] }>(`/api/users/${id}`).then((data) => {
      setProfile(data.user);
      setMeetups(data.meetups);
      setBooks(data.books);
    });
  }, [id]);

  if (!profile) return <LoadingState />;

  return (
    <div>
      <div className="h-36 bg-gradient-to-r from-forest to-forest-light" />
      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <div className="-mt-12 mb-8 flex items-end gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={profile.avatar} alt="" className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-lg" />
          <div className="pb-2">
            <h1 className="font-serif text-2xl font-bold text-forest">{profile.name}</h1>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted"><PinIcon size={12} />{profile.location} · Member since {profile.memberSince}</p>
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <aside className="space-y-5">
            <section className="rounded-2xl border border-sage bg-white p-5"><h3 className="mb-3 font-serif text-forest">About</h3><p className="text-sm text-body">{profile.bio}</p></section>
            <div className="flex flex-wrap gap-2">{profile.favouriteGenres.map((genre) => <GenreTag key={genre}>{genre}</GenreTag>)}</div>
          </aside>
          <div className="space-y-6 lg:col-span-2">
            <section>
              <h2 className="mb-4 font-serif text-xl text-forest">Gatherings</h2>
              {meetups.slice(0, 3).map((meetup) => <Link key={meetup.id} href={`/gatherings/${meetup.id}`} className="mb-3 block rounded-2xl border border-sage bg-white p-4 text-sm text-forest">{meetup.title} · {meetup.date}</Link>)}
            </section>
            <section>
              <h2 className="mb-4 font-serif text-xl text-forest">Books for Sale</h2>
              <div className="grid gap-4 sm:grid-cols-2">{books.slice(0, 2).map((book) => <BookCard key={book.id} book={book} />)}</div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
