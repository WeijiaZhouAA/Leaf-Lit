"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MeetupForm from "@/features/meetups/MeetupForm";
import { useAuth } from "@/components/providers/AuthProvider";
import { LoadingState } from "@/components/ui/Feedback";

export default function CreateGatheringPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && !user) router.replace("/signin"); }, [loading, user, router]);
  if (loading || !user) return <LoadingState />;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-4xl font-bold text-forest">Create a Gathering</h1>
      <p className="mb-8 mt-1 text-muted">Fill in the details and invite your community to read together.</p>
      <MeetupForm />
    </div>
  );
}
