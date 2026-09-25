"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import GatheringCard from "@/components/cards/GatheringCard";
import { EmptyState, GenreTag, LoadingState } from "@/components/ui/Feedback";
import { GridIcon, ListIcon, SearchIcon } from "@/components/ui/Icons";
import { GENRES, MEETUP_TYPES, SUBURBS } from "@/lib/constants";
import { api } from "@/lib/client";
import type { MeetupCardData } from "@/types";

function Discover() {
  const params = useSearchParams();
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState(params.get("genre") || "All");
  const [type, setType] = useState("All");
  const [location, setLocation] = useState("All");
  const [when, setWhen] = useState("upcoming");
  const [spots, setSpots] = useState("all");
  const [sort, setSort] = useState("recommended");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [items, setItems] = useState<MeetupCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const query = new URLSearchParams({
      q: search, genre, type, location, when, spots, sort:
        sort === "Date" ? "date" : sort === "Most Popular" ? "popular" : sort === "Newly Added" ? "new" : "recommended",
    });
    setLoading(true);
    const timer = setTimeout(() => {
      api<{ meetups: MeetupCardData[] }>(`/api/meetups?${query}`).then((data) => setItems(data.meetups)).finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(timer);
  }, [search, genre, type, location, when, spots, sort]);

  return (
    <div>
      <div className="border-b border-sage bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="mb-2 font-serif text-4xl font-bold text-forest">Discover Book Gatherings</h1>
          <p className="mb-8 text-lg text-body">Find readers, conversations, and stories happening near you.</p>
          <div className="relative max-w-2xl">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search gatherings, books, or topics…" className="w-full rounded-xl border border-sage bg-surface py-3 pl-11 pr-4 text-sm focus:border-fresh focus:outline-none focus:ring-2 focus:ring-fresh/20" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <FilterRow label="Genre" options={["All", ...GENRES.slice(0, 8)]} value={genre} onChange={setGenre} />
        <FilterRow label="Type" options={["All", ...MEETUP_TYPES.slice(0, 5)]} value={type} onChange={setType} />
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-body">When:</span>
          {[["upcoming", "Upcoming"], ["week", "This week"], ["month", "This month"], ["past", "Past"]].map(([value, label]) => (
            <GenreTag key={value} active={when === value} onClick={() => setWhen(value)}>{label}</GenreTag>
          ))}
          <span className="ml-2 text-sm font-medium text-body">Location:</span>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-lg border border-sage bg-white px-3 py-1.5 text-sm">
            <option>All</option>{SUBURBS.map((suburb) => <option key={suburb}>{suburb}</option>)}
          </select>
          <GenreTag active={spots === "open"} onClick={() => setSpots(spots === "open" ? "all" : "open")}>Available spots</GenreTag>
        </div>
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted">{items.length} gathering{items.length === 1 ? "" : "s"} found</p>
          <div className="flex items-center gap-3">
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-sage bg-white px-3 py-1.5 text-sm">
              {["Recommended", "Date", "Most Popular", "Newly Added"].map((option) => <option key={option}>{option}</option>)}
            </select>
            <div className="flex overflow-hidden rounded-lg border border-sage">
              <button onClick={() => setView("grid")} className={`p-2 ${view === "grid" ? "bg-mint text-forest" : "bg-white text-muted"}`}><GridIcon /></button>
              <button onClick={() => setView("list")} className={`p-2 ${view === "list" ? "bg-mint text-forest" : "bg-white text-muted"}`}><ListIcon /></button>
            </div>
          </div>
        </div>
        {loading ? <LoadingState /> : items.length === 0 ? (
          <EmptyState title="No gatherings found" description="Try adjusting your search or filters to discover more events." action="Clear filters" href="/gatherings" />
        ) : view === "grid" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map((meetup) => <GatheringCard key={meetup.id} gathering={meetup} />)}</div>
        ) : (
          <div className="space-y-4">
            {items.map((meetup) => (
              <div key={meetup.id} className="flex items-start gap-4 rounded-2xl border border-sage bg-white p-4 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={meetup.image} alt="" className="h-16 w-24 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif font-semibold text-forest">{meetup.title}</h3>
                  <p className="text-sm italic text-muted">&quot;{meetup.book.title}&quot; · {meetup.book.author}</p>
                  <p className="mt-2 text-sm text-body">{meetup.date} · {meetup.location} · {meetup.attendees}/{meetup.maxAttendees} attending</p>
                </div>
                <Link href={`/gatherings/${meetup.id}`} className="rounded-xl bg-mint px-4 py-2 text-sm font-medium text-forest hover:bg-fresh">View</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterRow({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-body">{label}:</span>
      {options.map((option) => <GenreTag key={option} active={value === option} onClick={() => onChange(option)}>{option}</GenreTag>)}
    </div>
  );
}

export default function DiscoverPage() {
  return <Suspense><Discover /></Suspense>;
}
