"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, FormField, Input, Select, TextArea } from "@/components/ui/FormField";
import { CONDITIONS, CONDITION_DESCRIPTIONS, GENRES, SUBURBS } from "@/lib/constants";
import { api } from "@/lib/client";
import type { BookFormData } from "@/types";

const images = ["/images/books/fiction.jpg", "/images/books/classic.jpg", "/images/books/fantasy.jpg", "/images/books/mystery.jpg", "/images/books/bio.jpg", "/images/books/history.jpg"];

const empty: BookFormData = {
  title: "", author: "", isbn: "", genre: "", condition: "", price: "", description: "", sellerNotes: "", location: "", image: images[0],
};

export default function BookForm({ initial, bookId }: { initial?: Partial<BookFormData>; bookId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<BookFormData>({ ...empty, ...initial });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key: keyof BookFormData, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(status: "draft" | "active") {
    setError("");
    setBusy(true);
    try {
      const payload = { ...form, status };
      const result = bookId
        ? await api<{ book: { id: string } }>(`/api/books/${bookId}`, { method: "PUT", body: JSON.stringify(payload) })
        : await api<{ book: { id: string } }>("/api/books", { method: "POST", body: JSON.stringify(payload) });
      router.push(status === "draft" ? "/my-listings" : `/marketplace/${result.book.id}?published=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please check the form.");
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void submit("active");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="rounded-2xl border border-sage bg-white p-6">
          <h2 className="mb-5 font-serif text-lg font-semibold text-forest">Book Information</h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Book Title" required><Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. The Midnight Library" /></FormField>
              <FormField label="Author" required><Input value={form.author} onChange={(e) => set("author", e.target.value)} placeholder="e.g. Matt Haig" /></FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="ISBN"><Input value={form.isbn} onChange={(e) => set("isbn", e.target.value)} placeholder="978-..." /></FormField>
              <FormField label="Genre"><Select value={form.genre} onChange={(e) => set("genre", e.target.value)}><option value="">Select genre...</option>{GENRES.map((genre) => <option key={genre}>{genre}</option>)}</Select></FormField>
            </div>
            <FormField label="Description"><TextArea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Tell buyers about the book..." /></FormField>
            <FormField label="Seller Notes"><TextArea rows={2} value={form.sellerNotes} onChange={(e) => set("sellerNotes", e.target.value)} placeholder="Marks, annotations, or extras..." /></FormField>
          </div>
        </section>
        <section className="rounded-2xl border border-sage bg-white p-6">
          <h2 className="mb-2 font-serif text-lg font-semibold text-forest">Book Condition <span className="text-red-400">*</span></h2>
          <p className="mb-5 text-sm text-muted">Be honest. Buyers appreciate accurate descriptions.</p>
          <div className="space-y-3">
            {CONDITIONS.map((condition) => (
              <label key={condition} className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 ${form.condition === condition ? "border-forest bg-mint/20" : "border-sage hover:border-fresh"}`}>
                <input type="radio" name="condition" checked={form.condition === condition} onChange={() => set("condition", condition)} className="mt-1 accent-forest" />
                <span><span className="block text-sm font-medium text-forest">{condition}</span><span className="mt-0.5 block text-sm text-muted">{CONDITION_DESCRIPTIONS[condition]}</span></span>
              </label>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-sage bg-white p-6">
          <h2 className="mb-5 font-serif text-lg font-semibold text-forest">Price & Pickup</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Price (NZ$)" required>
              <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">NZ$</span><Input type="number" min={0} step="0.5" value={form.price} onChange={(e) => set("price", e.target.value)} className="pl-12" /></div>
            </FormField>
            <FormField label="Pickup Location"><Select value={form.location} onChange={(e) => set("location", e.target.value)}><option value="">Select suburb...</option>{SUBURBS.map((suburb) => <option key={suburb}>{suburb}</option>)}</Select></FormField>
          </div>
        </section>
        <section className="rounded-2xl border border-sage bg-white p-6">
          <h2 className="mb-4 font-serif text-lg font-semibold text-forest">Book Photos</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {images.map((image) => (
              <button type="button" key={image} onClick={() => set("image", image)} className={`aspect-[2/3] overflow-hidden rounded-xl border-2 ${form.image === image ? "border-forest" : "border-sage"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </section>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <Button type="button" variant="secondary" disabled={busy} onClick={() => void submit("draft")}>Save Draft</Button>
          <Button type="submit" disabled={busy}>{busy ? "Saving..." : bookId ? "Save Listing" : "Publish Listing"}</Button>
        </div>
      </div>
      <aside className="h-fit rounded-2xl border border-sage bg-white p-5 lg:sticky lg:top-24">
        <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted">Live Preview</p>
        <div className="flex gap-3 rounded-xl border border-sage p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={form.image} alt="" className="h-20 w-14 rounded-lg object-cover" />
          <div>
            <h3 className="font-serif text-sm font-semibold text-forest">{form.title || "Book Title"}</h3>
            <p className="text-xs text-muted">{form.author || "Author"}</p>
            <p className="mt-2 font-bold text-forest">{form.price ? `NZ$${form.price}` : "NZ$--"}</p>
          </div>
        </div>
      </aside>
    </form>
  );
}
