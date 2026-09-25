"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, FormField, Input, TextArea } from "@/components/ui/FormField";
import { LoadingState } from "@/components/ui/Feedback";
import { GENRES } from "@/lib/constants";
import { api } from "@/lib/client";
import { useAuth } from "@/components/providers/AuthProvider";

const avatars = ["/images/avatars/alex.jpg", "/images/avatars/emma.jpg", "/images/avatars/james.jpg", "/images/avatars/sarah.jpg", "/images/avatars/lena.jpg", "/images/avatars/default.jpg"];

export default function EditProfilePage() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [avatar, setAvatar] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && !user) router.replace("/signin"); }, [loading, user, router]);
  useEffect(() => {
    if (!user) return;
    setName(user.name); setBio(user.bio); setLocation(user.location); setAvatar(user.avatar); setGenres(user.favouriteGenres);
  }, [user]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/profile", { method: "PUT", body: JSON.stringify({ name, bio, location, favouriteGenres: genres, avatar }) });
      await refresh();
      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save your profile.");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !user) return <LoadingState />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 font-serif text-4xl font-bold text-forest">Edit Profile</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-sage bg-white p-6">
        <div className="flex gap-3">{avatars.map((src) => <button type="button" key={src} onClick={() => setAvatar(src)} className={`h-14 w-14 overflow-hidden rounded-xl border-2 ${avatar === src ? "border-forest" : "border-sage"}`}><img src={src} alt="" className="h-full w-full object-cover" /></button>)}</div>
        <FormField label="Name" required><Input value={name} onChange={(e) => setName(e.target.value)} /></FormField>
        <FormField label="Location" required><Input value={location} onChange={(e) => setLocation(e.target.value)} /></FormField>
        <FormField label="Bio"><TextArea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} /></FormField>
        <div>
          <p className="mb-2 text-sm font-medium text-body">Favourite genres</p>
          <div className="flex flex-wrap gap-2">{GENRES.map((genre) => <button type="button" key={genre} onClick={() => setGenres((current) => current.includes(genre) ? current.filter((item) => item !== genre) : [...current, genre])} className={`rounded-full border px-3 py-1.5 text-xs ${genres.includes(genre) ? "border-forest bg-forest text-white" : "border-sage"}`}>{genre}</button>)}</div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={busy}>{busy ? "Saving..." : "Save Profile"}</Button>
      </form>
    </div>
  );
}
