"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { LogoMark } from "@/components/ui/Icons";
import { Button, FormField, Input } from "@/components/ui/FormField";
import { api } from "@/lib/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { GENRES } from "@/lib/constants";

function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const mode = params.get("mode") === "signup" ? "signup" : params.get("mode") === "forgot" ? "forgot" : "signin";
  const { refresh } = useAuth();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [genres, setGenres] = useState<string[]>([]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      if (mode === "signin") {
        await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
        await refresh();
        router.push("/");
      } else if (mode === "signup") {
        await api("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name: form.get("name"),
            location: form.get("location"),
            email: form.get("email"),
            password: form.get("password"),
            confirmPassword: form.get("confirmPassword"),
            favouriteGenres: genres,
          }),
        });
        await refresh();
        router.push("/");
      } else {
        const result = await api<{ message: string }>("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email: form.get("email") }) });
        setMessage(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <div className="hidden w-[420px] shrink-0 flex-col justify-between bg-forest p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20"><LogoMark /></span><span className="font-serif text-xl font-semibold text-white">Leaf & Lit</span></Link>
        <div>
          <blockquote className="mb-6 font-serif text-2xl leading-relaxed text-white">&quot;Join a community built around good books and good conversations.&quot;</blockquote>
          <div className="space-y-4 text-sm">
            <p className="text-fresh">Emma W. — Found my favourite book club here!</p>
            <p className="text-fresh">James P. — Sold 15 books in my first month.</p>
          </div>
        </div>
        <p className="text-xs text-fresh">© 2026 Leaf & Lit · Auckland, New Zealand</p>
      </div>
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 lg:hidden"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest"><LogoMark /></span><span className="font-serif text-xl font-semibold text-forest">Leaf & Lit</span></Link>
          {mode === "signin" && (
            <>
              <h2 className="mb-1 font-serif text-3xl font-bold text-forest">Welcome back</h2>
              <p className="mb-8 text-muted">Sign in to your Leaf & Lit account.</p>
              <form onSubmit={onSubmit} className="space-y-4">
                <FormField label="Email"><Input name="email" type="email" placeholder="you@email.com" required /></FormField>
                <FormField label="Password"><Input name="password" type="password" placeholder="••••••••" required /></FormField>
                <div className="flex justify-end"><Link href="/forgot-password" className="text-xs text-muted hover:text-forest">Forgot password?</Link></div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" disabled={busy} className="w-full py-3">{busy ? "Signing in…" : "Sign In"}</Button>
              </form>
              <p className="mt-6 text-center text-sm text-muted">New here? <Link href="/signup" className="font-medium text-forest hover:underline">Create an account</Link></p>
            </>
          )}
          {mode === "signup" && (
            <>
              <h2 className="mb-1 font-serif text-3xl font-bold text-forest">Join Leaf & Lit</h2>
              <p className="mb-8 text-muted">Create your free account and start reading together.</p>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Full Name"><Input name="name" placeholder="Alex Mercer" required /></FormField>
                  <FormField label="Location"><Input name="location" placeholder="Auckland" required /></FormField>
                </div>
                <FormField label="Email"><Input name="email" type="email" placeholder="you@email.com" required /></FormField>
                <FormField label="Password"><Input name="password" type="password" placeholder="Min. 8 characters" required /></FormField>
                <FormField label="Confirm Password"><Input name="confirmPassword" type="password" placeholder="Repeat password" required /></FormField>
                <div>
                  <p className="mb-2 text-sm font-medium text-body">Favourite Genres (pick a few)</p>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.slice(0, 10).map((genre) => (
                      <button type="button" key={genre} onClick={() => setGenres((current) => current.includes(genre) ? current.filter((item) => item !== genre) : [...current, genre])} className={`rounded-full border px-3 py-1.5 text-xs ${genres.includes(genre) ? "border-forest bg-forest text-white" : "border-sage bg-white text-body"}`}>{genre}</button>
                    ))}
                  </div>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" disabled={busy} className="w-full py-3">{busy ? "Creating account…" : "Create Account"}</Button>
              </form>
              <p className="mt-6 text-center text-sm text-muted">Already have an account? <Link href="/signin" className="font-medium text-forest hover:underline">Sign in</Link></p>
            </>
          )}
          {mode === "forgot" && (
            <>
              <h2 className="mb-1 font-serif text-3xl font-bold text-forest">Reset your password</h2>
              <p className="mb-8 text-muted">We&apos;ll prepare a reset link for your account.</p>
              <form onSubmit={onSubmit} className="space-y-4">
                <FormField label="Email Address"><Input name="email" type="email" placeholder="you@email.com" required /></FormField>
                {error && <p className="text-sm text-red-600">{error}</p>}
                {message && <p className="rounded-xl bg-mint px-4 py-3 text-sm text-forest">{message}</p>}
                <Button type="submit" disabled={busy} className="w-full py-3">Send Reset Link</Button>
              </form>
              <p className="mt-6 text-center text-sm"><Link href="/signin" className="font-medium text-forest hover:underline">← Back to Sign In</Link></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return <Suspense><AuthForm /></Suspense>;
}
