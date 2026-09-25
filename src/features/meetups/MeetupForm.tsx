"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, FormField, Input, Select, TextArea } from "@/components/ui/FormField";
import { GENRES, MEETUP_TYPES, SUBURBS } from "@/lib/constants";
import { api } from "@/lib/client";
import type { MeetupFormData } from "@/types";

const covers = ["/images/covers/cafe.jpg", "/images/covers/library.jpg", "/images/covers/park.jpg", "/images/covers/evening.jpg"];
const books = ["/images/books/classic.jpg", "/images/books/fiction.jpg", "/images/books/fantasy.jpg", "/images/books/mystery.jpg"];

const empty: MeetupFormData = {
  title: "", bookTitle: "", author: "", description: "", genre: "", date: "", startTime: "", endTime: "",
  location: "", suburb: "", maxAttendees: "12", type: "", topics: "", rules: "", coverImage: covers[0], bookCover: books[0],
};

export default function MeetupForm({ initial, meetupId }: { initial?: Partial<MeetupFormData>; meetupId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<MeetupFormData>({ ...empty, ...initial });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key: keyof MeetupFormData, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(status: "draft" | "published") {
    setError("");
    setBusy(true);
    try {
      const payload = { ...form, status, maxAttendees: form.maxAttendees };
      const result = meetupId
        ? await api<{ meetup: { id: string } }>(`/api/meetups/${meetupId}`, { method: "PUT", body: JSON.stringify(payload) })
        : await api<{ meetup: { id: string } }>("/api/meetups", { method: "POST", body: JSON.stringify(payload) });
      router.push(status === "draft" ? "/my-gatherings" : `/gatherings/${result.meetup.id}?published=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please check the form.");
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void submit("published");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="rounded-2xl border border-sage bg-white p-6">
          <h2 className="mb-5 font-serif text-lg font-semibold text-forest">Gathering Details</h2>
          <div className="space-y-4">
            <FormField label="Gathering Title" required><Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Coffee & Classics" /></FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Book Title" required><Input value={form.bookTitle} onChange={(e) => set("bookTitle", e.target.value)} placeholder="e.g. Pride and Prejudice" /></FormField>
              <FormField label="Author"><Input value={form.author} onChange={(e) => set("author", e.target.value)} placeholder="e.g. Jane Austen" /></FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Genre"><Select value={form.genre} onChange={(e) => set("genre", e.target.value)}><option value="">Select genre...</option>{GENRES.map((genre) => <option key={genre}>{genre}</option>)}</Select></FormField>
              <FormField label="Gathering Type"><Select value={form.type} onChange={(e) => set("type", e.target.value)}><option value="">Select type...</option>{MEETUP_TYPES.map((type) => <option key={type}>{type}</option>)}</Select></FormField>
            </div>
            <FormField label="Description"><TextArea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Tell people what to expect from your gathering..." /></FormField>
          </div>
        </section>
        <section className="rounded-2xl border border-sage bg-white p-6">
          <h2 className="mb-5 font-serif text-lg font-semibold text-forest">Date, Time & Location</h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Date" required><Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} /></FormField>
              <FormField label="Start Time"><Input type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} /></FormField>
              <FormField label="End Time"><Input type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} /></FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Location" required><Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Cafe name, park, library..." /></FormField>
              <FormField label="Suburb"><Select value={form.suburb} onChange={(e) => set("suburb", e.target.value)}><option value="">Select suburb...</option>{SUBURBS.map((suburb) => <option key={suburb}>{suburb}</option>)}</Select></FormField>
            </div>
            <FormField label="Max Attendees"><Input type="number" min={2} max={100} value={form.maxAttendees} onChange={(e) => set("maxAttendees", e.target.value)} /></FormField>
          </div>
        </section>
        <section className="rounded-2xl border border-sage bg-white p-6">
          <h2 className="mb-5 font-serif text-lg font-semibold text-forest">Topics & Guidelines</h2>
          <div className="space-y-4">
            <FormField label="Discussion Topics"><TextArea rows={3} value={form.topics} onChange={(e) => set("topics", e.target.value)} placeholder="One topic per line..." /></FormField>
            <FormField label="Gathering Rules"><TextArea rows={3} value={form.rules} onChange={(e) => set("rules", e.target.value)} placeholder="One rule per line..." /></FormField>
          </div>
        </section>
        <section className="rounded-2xl border border-sage bg-white p-6">
          <h2 className="mb-5 font-serif text-lg font-semibold text-forest">Cover Image</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {covers.map((cover) => (
              <button type="button" key={cover} onClick={() => set("coverImage", cover)} className={`overflow-hidden rounded-xl border-2 ${form.coverImage === cover ? "border-forest" : "border-sage"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cover} alt="" className="h-20 w-full object-cover" />
              </button>
            ))}
          </div>
          <p className="mb-3 mt-5 text-sm text-muted">Book cover</p>
          <div className="flex gap-3">
            {books.map((cover) => (
              <button type="button" key={cover} onClick={() => set("bookCover", cover)} className={`h-16 w-12 overflow-hidden rounded-lg border-2 ${form.bookCover === cover ? "border-forest" : "border-sage"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cover} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </section>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <Button type="button" variant="secondary" disabled={busy} onClick={() => void submit("draft")}>Save Draft</Button>
          <Button type="submit" disabled={busy}>{busy ? "Saving..." : meetupId ? "Save Gathering" : "Publish Gathering"}</Button>
        </div>
      </div>
      <aside className="h-fit rounded-2xl border border-sage bg-white p-5 lg:sticky lg:top-24">
        <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted">Live Preview</p>
        <div className="overflow-hidden rounded-xl border border-sage">
          <div className="flex h-28 items-center justify-center bg-mint">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.coverImage} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="p-4">
            <p className="font-serif font-semibold text-forest">{form.title || "Gathering Title"}</p>
            <p className="mt-0.5 text-xs italic text-muted">&quot;{form.bookTitle || "Book Title"}&quot;{form.author ? ` · ${form.author}` : ""}</p>
            <p className="mt-3 text-xs text-body">{form.date || "Date TBD"}</p>
            <p className="text-xs text-body">{form.location || "Location TBD"}</p>
          </div>
        </div>
      </aside>
    </form>
  );
}
