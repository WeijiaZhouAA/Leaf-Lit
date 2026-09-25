import Link from "next/link";
import { BookIcon, CalendarIcon, SearchIcon } from "@/components/ui/Icons";

export function EmptyState({
  title,
  description,
  action,
  href,
  icon = "search",
}: {
  title: string;
  description: string;
  action?: string;
  href?: string;
  icon?: "search" | "book" | "calendar" | "people";
}) {
  return (
    <div className="py-24 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-mint text-forest">
        {icon === "book" ? <BookIcon size={28} /> : icon === "calendar" ? <CalendarIcon size={28} /> : <SearchIcon size={28} />}
      </div>
      <h3 className="mb-2 font-serif text-xl font-semibold text-forest">{title}</h3>
      <p className="mx-auto mb-6 max-w-xs text-sm text-muted">{description}</p>
      {action && href && (
        <Link href={href} className="inline-block rounded-xl bg-forest px-5 py-2.5 text-sm font-medium text-white hover:bg-forest-light">
          {action}
        </Link>
      )}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-24 text-sm text-muted">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-fresh border-t-forest" />
      {label}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-forest/30 px-4">
      <div className="w-full max-w-md rounded-2xl border border-sage bg-white p-6 shadow-lg">
        <h3 className="font-serif text-xl font-semibold text-forest">{title}</h3>
        <p className="mt-2 text-sm text-body">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-xl border border-sage px-4 py-2 text-sm text-body hover:bg-surface">Cancel</button>
          <button onClick={onConfirm} disabled={busy} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40">
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[60] rounded-xl border border-fresh bg-white px-4 py-3 text-sm text-forest shadow-lg">
      {message}
    </div>
  );
}

export function GenreTag({ children, active, onClick }: { children: string; active?: boolean; onClick?: () => void }) {
  const className = `rounded-full border px-3 py-1.5 text-xs transition-colors ${
    active ? "border-forest bg-forest text-white" : "border-sage bg-white text-body hover:border-fresh hover:text-forest"
  }`;
  if (onClick) return <button type="button" onClick={onClick} className={className}>{children}</button>;
  return <span className="rounded-full bg-mint px-3 py-1.5 text-xs font-medium text-forest">{children}</span>;
}

export function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>{children}</span>;
}
