"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BookForm from "@/features/books/BookForm";
import { LoadingState } from "@/components/ui/Feedback";
import { api } from "@/lib/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { BookCardData, BookFormData } from "@/types";

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [initial, setInitial] = useState<Partial<BookFormData> | null>(null);

  useEffect(() => { if (!loading && !user) router.replace("/signin"); }, [loading, user, router]);
  useEffect(() => {
    api<{ book: BookCardData }>(`/api/books/${id}`).then(({ book }) => {
      if (user && !book.isOwner) router.replace(`/marketplace/${id}`);
      setInitial({
        title: book.title, author: book.author, isbn: book.isbn, genre: book.genre, condition: book.condition,
        price: String(book.price), description: book.description, sellerNotes: book.sellerNotes, location: book.location, image: book.cover,
      });
    });
  }, [id, router, user]);

  if (!initial) return <LoadingState />;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-4xl font-bold text-forest">Edit Listing</h1>
      <p className="mb-8 mt-1 text-muted">Update the details buyers will see.</p>
      <BookForm initial={initial} bookId={id} />
    </div>
  );
}
