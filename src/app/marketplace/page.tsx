"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BookCard from "@/components/cards/BookCard";
import { EmptyState, GenreTag, LoadingState } from "@/components/ui/Feedback";
import { BookIcon, SearchIcon } from "@/components/ui/Icons";
import { CONDITIONS, GENRES, SUBURBS } from "@/lib/constants";
import { api } from "@/lib/client";
import type { BookCardData } from "@/types";

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [condition, setCondition] = useState("All");
  const [location, setLocation] = useState("All");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("Recommended");
  const [books, setBooks] = useState<BookCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sortKey = sort === "Price: Low to High" ? "price-asc" : sort === "Price: High to Low" ? "price-desc" : sort === "Recently Listed" ? "new" : "recommended";
    const query = new URLSearchParams({ q: search, genre, condition, location, maxPrice, sort: sortKey });
    setLoading(true);
    const timer = setTimeout(() => {
      api<{ books: BookCardData[] }>(`/api/books?${query}`).then((data) => setBooks(data.books)).finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(timer);
  }, [search, genre, condition, location, maxPrice, sort]);

  return (
    <div>
      <div className="border-b border-sage bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="mb-2 font-serif text-4xl font-bold text-forest">Second-hand Book Marketplace</h1>
              <p className="text-lg text-body">Find your next read and give pre-loved books a new home.</p>
            </div>
            <Link href="/sell" className="hidden rounded-xl bg-forest px-5 py-2.5 text-sm font-medium text-white hover:bg-forest-light sm:block">+ Sell a Book</Link>
          </div>
          <div className="relative max-w-2xl">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, author, or ISBN…" className="w-full rounded-xl border border-sage bg-surface py-3 pl-11 pr-4 text-sm focus:border-fresh focus:outline-none focus:ring-2 focus:ring-fresh/20" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 rounded-2xl border border-sage bg-white p-5">
          <div className="flex flex-wrap gap-6">
            <div className="min-w-[160px] flex-1">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Genre</p>
              <div className="flex flex-wrap gap-1.5">{["All", ...GENRES.slice(0, 7)].map((item) => <GenreTag key={item} active={genre === item} onClick={() => setGenre(item)}>{item}</GenreTag>)}</div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Condition</p>
              <div className="flex flex-wrap gap-1.5">{["All", ...CONDITIONS].map((item) => <GenreTag key={item} active={condition === item} onClick={() => setCondition(item)}>{item}</GenreTag>)}</div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Location</p>
              <select value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-lg border border-sage px-3 py-1.5 text-sm"><option>All</option>{SUBURBS.map((suburb) => <option key={suburb}>{suburb}</option>)}</select>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Max Price (NZ$)</p>
              <input type="number" min={0} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Any" className="w-24 rounded-lg border border-sage px-3 py-1.5 text-sm" />
            </div>
          </div>
        </div>
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted">{books.length} book{books.length === 1 ? "" : "s"} available</p>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-sage bg-white px-3 py-1.5 text-sm">
            {["Recommended", "Price: Low to High", "Price: High to Low", "Recently Listed"].map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>
        {loading ? <LoadingState /> : books.length === 0 ? (
          <EmptyState icon="book" title="No books found" description="Your bookshelf is looking a little empty here. Try adjusting your filters." />
        ) : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{books.map((book) => <BookCard key={book.id} book={book} />)}</div>}
        <div className="mt-12 rounded-2xl border border-yellow-deep bg-yellow/50 p-8 text-center">
          <BookIcon size={36} className="mx-auto mb-3 text-forest" />
          <h3 className="mb-2 font-serif text-xl font-semibold text-forest">Got books you no longer need?</h3>
          <p className="mb-5 text-sm text-body">List them here and help another reader discover something great.</p>
          <Link href="/sell" className="inline-block rounded-xl bg-forest px-6 py-2.5 text-sm font-medium text-white">Sell Your First Book</Link>
        </div>
      </div>
    </div>
  );
}
