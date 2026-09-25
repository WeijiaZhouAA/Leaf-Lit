export function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("en-NZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatTimeLabel(value: string) {
  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText ?? "0");
  if (Number.isNaN(hour)) return value;
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

export function formatTimeRange(start: string, end: string) {
  if (!end) return formatTimeLabel(start);
  return `${formatTimeLabel(start)} – ${formatTimeLabel(end)}`;
}

export function formatMoney(price: number | string) {
  const amount = typeof price === "string" ? Number(price) : price;
  return `NZ$${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
}

export function relativeTime(date: Date) {
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return formatShortDate(date);
}

export function memberSince(date: Date) {
  return new Intl.DateTimeFormat("en-NZ", { month: "long", year: "numeric" }).format(date);
}

export function clockTime(date: Date) {
  return new Intl.DateTimeFormat("en-NZ", { hour: "numeric", minute: "2-digit" }).format(date);
}

export function avatarFallback(name: string) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#DDEFD8"/><text x="50%" y="54%" text-anchor="middle" font-family="Georgia" font-size="28" fill="#294936">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
