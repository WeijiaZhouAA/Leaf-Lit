"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MeetupForm from "@/features/meetups/MeetupForm";
import { LoadingState } from "@/components/ui/Feedback";
import { api } from "@/lib/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { MeetupCardData, MeetupFormData } from "@/types";

export default function EditGatheringPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [initial, setInitial] = useState<Partial<MeetupFormData> | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/signin");
  }, [loading, user, router]);

  useEffect(() => {
    api<{ meetup: MeetupCardData }>(`/api/meetups/${id}`).then(({ meetup }) => {
      if (user && !meetup.isHost) router.replace(`/gatherings/${id}`);
      setInitial({
        title: meetup.title,
        bookTitle: meetup.book.title,
        author: meetup.book.author,
        description: meetup.description,
        genre: meetup.category,
        type: meetup.type,
        date: meetup.dateValue,
        startTime: meetup.startTime,
        endTime: meetup.endTime,
        location: meetup.location,
        suburb: meetup.suburb,
        maxAttendees: String(meetup.maxAttendees),
        topics: meetup.topics.join("\n"),
        rules: meetup.rules.join("\n"),
        coverImage: meetup.image,
        bookCover: meetup.book.cover,
      });
    });
  }, [id, user, router]);

  if (!initial) return <LoadingState />;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-4xl font-bold text-forest">Edit Gathering</h1>
      <p className="mb-8 mt-1 text-muted">Update the details your readers will see.</p>
      <MeetupForm initial={initial} meetupId={id} />
    </div>
  );
}
