import type { Order } from "@prisma/client";

export const PAYMENT_TYPES = [
  { id: "credit_card", label: "Credit card" },
  { id: "debit_card", label: "Debit card" },
  { id: "paypal", label: "PayPal" },
  { id: "apple_pay", label: "Apple Pay" },
  { id: "google_pay", label: "Google Pay" },
  { id: "stripe", label: "Stripe" },
] as const;

export type PaymentType = (typeof PAYMENT_TYPES)[number]["id"];

const CARRIERS = ["NZ Post", "CourierPost", "Aramex", "DHL Express"] as const;

const STEP_SECONDS = [0, 30, 70, 120, 180, 240, 300];

export function isCardType(type: string) {
  return type === "credit_card" || type === "debit_card" || type === "stripe";
}

export function luhn(digits: string) {
  let sum = 0;
  let alternate = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (alternate) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

export function cardBrand(digits: string) {
  if (digits.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "American Express";
  return "Card";
}

export function paymentLabel(input: { type: PaymentType; brand: string; last4: string; email: string }) {
  if (input.type === "paypal") return `PayPal · ${input.email}`;
  if (input.type === "apple_pay") return `Apple Pay · ${input.email}`;
  if (input.type === "google_pay") return `Google Pay · ${input.email}`;
  if (input.type === "stripe") return `Stripe · ${input.brand} ···· ${input.last4}`;
  const kind = input.type === "debit_card" ? "debit" : "credit";
  return `${input.brand} ${kind} ···· ${input.last4}`;
}

export function assignShipment(seed: string) {
  let total = 0;
  for (const char of seed) total += char.charCodeAt(0);
  const carrier = CARRIERS[total % CARRIERS.length];
  const trackingNumber = `LL${seed.replace(/[^a-z0-9]/gi, "").slice(-8).toUpperCase().padEnd(8, "0")}`;
  return { carrier, trackingNumber };
}

type TrackingOrder = Pick<
  Order,
  | "createdAt"
  | "carrier"
  | "trackingNumber"
  | "paymentLabel"
  | "origin"
  | "shipToLine"
  | "shipToSuburb"
  | "shipToCity"
  | "shipToPostcode"
  | "shipToName"
>;

export function describeDelivery(order: TrackingOrder & { sellerName: string }) {
  const destination = `${order.shipToLine}, ${order.shipToSuburb}, ${order.shipToCity} ${order.shipToPostcode}`;
  const steps = [
    {
      title: "Payment confirmed",
      detail: `Paid with ${order.paymentLabel}`,
      place: "Leaf & Lit",
    },
    {
      title: "Packed by the seller",
      detail: `${order.sellerName} prepared the parcel`,
      place: order.origin,
    },
    {
      title: `Collected by ${order.carrier}`,
      detail: `${order.carrier} scanned the parcel`,
      place: order.origin,
    },
    {
      title: "At the sorting centre",
      detail: `${order.carrier} is sorting the parcel`,
      place: "Auckland Mail Centre, Penrose",
    },
    {
      title: "In transit",
      detail: `Heading toward ${order.shipToSuburb}`,
      place: `Between Penrose and ${order.shipToSuburb}`,
    },
    {
      title: "Out for delivery",
      detail: `${order.carrier} is in your neighbourhood`,
      place: `${order.shipToSuburb}, ${order.shipToCity}`,
    },
    {
      title: "Delivered",
      detail: `Left with ${order.shipToName}`,
      place: destination,
    },
  ];

  const elapsed = (Date.now() - order.createdAt.getTime()) / 1000;
  let currentIndex = 0;
  for (let index = 0; index < STEP_SECONDS.length; index += 1) {
    if (elapsed >= STEP_SECONDS[index]) currentIndex = index;
  }

  const events = steps.map((step, index) => ({
    ...step,
    time: new Date(order.createdAt.getTime() + STEP_SECONDS[index] * 1000).toISOString(),
    done: index <= currentIndex,
    current: index === currentIndex,
  }));

  const current = events[currentIndex];
  const status = currentIndex >= 6 ? "delivered" : currentIndex >= 5 ? "out_for_delivery" : currentIndex >= 2 ? "in_transit" : "processing";

  return {
    carrier: order.carrier,
    trackingNumber: order.trackingNumber,
    status,
    statusLabel: statusLabel(status),
    currentTitle: current.title,
    currentPlace: current.place,
    address: destination,
    events,
  };
}

export function statusLabel(status: string) {
  if (status === "processing") return "Preparing";
  if (status === "in_transit") return "In transit";
  if (status === "out_for_delivery") return "Out for delivery";
  if (status === "delivered") return "Delivered";
  return status;
}
