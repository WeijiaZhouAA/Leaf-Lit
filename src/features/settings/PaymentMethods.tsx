"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, FormField, Input, Select } from "@/components/ui/FormField";
import { PAYMENT_TYPES, isCardType } from "@/lib/commerce";
import { api } from "@/lib/client";
import type { PaymentMethodItem } from "@/types";

const empty = { type: "credit_card", holderName: "", cardNumber: "", expiry: "", email: "", isDefault: false };

export default function PaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethodItem[]>([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    api<{ methods: PaymentMethodItem[] }>("/api/payment-methods").then((data) => setMethods(data.methods)).catch((err) => setError(err instanceof Error ? err.message : "Could not load payment methods."));
  }

  useEffect(() => { load(); }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/payment-methods", { method: "POST", body: JSON.stringify(form) });
      setForm(empty);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save that payment method.");
    } finally {
      setBusy(false);
    }
  }

  async function makeDefault(id: string) {
    await api(`/api/payment-methods/${id}`, { method: "PATCH" });
    load();
  }

  async function remove(id: string) {
    await api(`/api/payment-methods/${id}`, { method: "DELETE" });
    load();
  }

  const card = isCardType(form.type);

  return (
    <section id="payments" className="space-y-4 rounded-2xl border border-sage bg-white p-6">
      <div>
        <h2 className="font-serif text-lg font-semibold text-forest">Payment methods</h2>
        <p className="mt-1 text-sm text-muted">Only the last four digits of a card are saved. Nothing is sent to a bank.</p>
      </div>
      <div className="space-y-3">
        {methods.length === 0 && <p className="text-sm text-muted">No payment methods yet.</p>}
        {methods.map((method) => (
          <div key={method.id} className="flex items-center justify-between gap-3 rounded-xl border border-sage px-4 py-3">
            <div>
              <p className="text-sm font-medium text-forest">{method.label}{method.isDefault ? " · Default" : ""}</p>
              <p className="text-xs text-muted">{method.detail}</p>
            </div>
            <div className="flex gap-2">
              {!method.isDefault && <button type="button" onClick={() => makeDefault(method.id)} className="text-xs text-forest hover:underline">Make default</button>}
              <button type="button" onClick={() => remove(method.id)} className="text-xs text-red-600 hover:underline">Remove</button>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={onSubmit} className="space-y-4 border-t border-sage pt-4">
        <FormField label="Type" required>
          <Select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            {PAYMENT_TYPES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </Select>
        </FormField>
        {card ? (
          <>
            <FormField label="Name on card" required><Input value={form.holderName} onChange={(event) => setForm({ ...form, holderName: event.target.value })} required /></FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Card number" required><Input value={form.cardNumber} onChange={(event) => setForm({ ...form, cardNumber: event.target.value })} inputMode="numeric" autoComplete="off" placeholder="4242 4242 4242 4242" required /></FormField>
              <FormField label="Expiry" required><Input value={form.expiry} onChange={(event) => setForm({ ...form, expiry: event.target.value })} placeholder="MM/YY" required /></FormField>
            </div>
          </>
        ) : (
          <FormField label="Account email" required><Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></FormField>
        )}
        <label className="flex items-center gap-2 text-sm text-body">
          <input type="checkbox" checked={form.isDefault} onChange={(event) => setForm({ ...form, isDefault: event.target.checked })} />
          Use as the default payment method
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={busy}>{busy ? "Saving..." : "Add Payment Method"}</Button>
      </form>
    </section>
  );
}
