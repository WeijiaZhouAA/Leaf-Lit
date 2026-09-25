"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import BookForm from "@/features/books/BookForm";
import { LoadingState } from "@/components/ui/Feedback";
import { useAuth } from "@/components/providers/AuthProvider";

export default function SellPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && !user) router.replace("/signin"); }, [loading, user, router]);
  if (loading || !user) return <LoadingState />;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-4xl font-bold text-forest">Sell a Book</h1>
      <p className="mb-8 mt-1 text-muted">List a book you no longer need and help another reader discover it.</p>
      <BookForm />
    </div>
  );
}
