"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, FormField, Input } from "@/components/ui/FormField";
import { LoadingState } from "@/components/ui/Feedback";
import PaymentMethods from "@/features/settings/PaymentMethods";
import ShippingForm from "@/features/settings/ShippingForm";
import { api } from "@/lib/client";
import { useAuth } from "@/components/providers/AuthProvider";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && !user) router.replace("/signin"); }, [loading, user, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api("/api/auth/password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: form.get("currentPassword"),
          newPassword: form.get("newPassword"),
          confirmPassword: form.get("confirmPassword"),
        }),
      });
      setMessage("Password updated.");
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update your password.");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !user) return <LoadingState />;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div>
        <h1 className="mb-2 font-serif text-4xl font-bold text-forest">Settings</h1>
        <p className="text-muted">Signed in as {user.email}</p>
      </div>
      <ShippingForm />
      <PaymentMethods />
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-sage bg-white p-6">
        <h2 className="font-serif text-lg font-semibold text-forest">Change password</h2>
        <FormField label="Current password"><Input name="currentPassword" type="password" required /></FormField>
        <FormField label="New password"><Input name="newPassword" type="password" required /></FormField>
        <FormField label="Confirm new password"><Input name="confirmPassword" type="password" required /></FormField>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-forest">{message}</p>}
        <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Update Password"}</Button>
      </form>
    </div>
  );
}
