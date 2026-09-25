"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, FormField, Input } from "@/components/ui/FormField";
import { api } from "@/lib/client";
import type { ShippingAddress } from "@/types";

const empty: ShippingAddress = { phone: "", line: "", suburb: "", city: "", postcode: "" };

export default function ShippingForm() {
  const [form, setForm] = useState<ShippingAddress>(empty);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ shipping: ShippingAddress }>("/api/settings/shipping").then((data) => setForm(data.shipping)).catch(() => setError("Could not load your address."));
  }, []);

  function set(key: keyof ShippingAddress, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const data = await api<{ shipping: ShippingAddress }>("/api/settings/shipping", { method: "PUT", body: JSON.stringify(form) });
      setForm(data.shipping);
      setMessage("Delivery details saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save your address.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form id="shipping" onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-sage bg-white p-6">
      <div>
        <h2 className="font-serif text-lg font-semibold text-forest">Delivery address</h2>
        <p className="mt-1 text-sm text-muted">Books you buy are sent to this address.</p>
      </div>
      <FormField label="Phone" required><Input value={form.phone} onChange={(event) => set("phone", event.target.value)} placeholder="021 555 0142" required /></FormField>
      <FormField label="Street address" required><Input value={form.line} onChange={(event) => set("line", event.target.value)} placeholder="18 Wellesley Street" required /></FormField>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Suburb" required><Input value={form.suburb} onChange={(event) => set("suburb", event.target.value)} required /></FormField>
        <FormField label="City" required><Input value={form.city} onChange={(event) => set("city", event.target.value)} required /></FormField>
        <FormField label="Postcode" required><Input value={form.postcode} onChange={(event) => set("postcode", event.target.value)} placeholder="1010" required /></FormField>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-forest">{message}</p>}
      <Button type="submit" disabled={busy}>{busy ? "Saving..." : "Save Address"}</Button>
    </form>
  );
}
