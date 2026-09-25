import Link from "next/link";
import { CalendarIcon, PinIcon } from "@/components/ui/Icons";
import type { MeetupCardData } from "@/types";

export default function GatheringCard({ gathering }: { gathering: MeetupCardData }) {
  const spotsLeft = gathering.maxAttendees - gathering.attendees;
  const fill = Math.min(100, (gathering.attendees / gathering.maxAttendees) * 100);

  return (
    <article className="group overflow-hidden rounded-2xl border border-sage bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="relative h-44 overflow-hidden bg-mint">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={gathering.image} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-forest backdrop-blur-sm">{gathering.category}</span>
          <span className="rounded-full bg-yellow/90 px-2.5 py-1 text-xs font-medium text-forest backdrop-blur-sm">{gathering.type}</span>
        </div>
        {gathering.joined && <span className="absolute right-3 top-3 rounded-full bg-forest px-2.5 py-1 text-xs font-medium text-white">✓ Joined</span>}
      </div>
      <div className="p-4">
        <h3 className="mb-1 font-serif text-lg font-semibold leading-snug text-forest">{gathering.title}</h3>
        <p className="mb-3 text-sm italic text-muted">&quot;{gathering.book.title}&quot; · {gathering.book.author}</p>
        <div className="mb-3 space-y-1.5 text-sm text-body">
          <div className="flex items-center gap-2"><CalendarIcon size={14} className="shrink-0 text-muted" /><span>{gathering.date} · {gathering.time}</span></div>
          <div className="flex items-center gap-2"><PinIcon size={14} className="shrink-0 text-muted" /><span className="truncate">{gathering.location}</span></div>
        </div>
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gathering.host.avatar} alt="" className="h-4 w-4 rounded-full object-cover" />
              {gathering.host.name}
            </span>
            <span className={spotsLeft <= 2 ? "font-medium text-orange-500" : ""}>
              {gathering.attendees}/{gathering.maxAttendees} · {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-sage">
            <div className="h-full rounded-full bg-fresh" style={{ width: `${fill}%` }} />
          </div>
        </div>
        <Link href={`/gatherings/${gathering.id}`} className="block w-full rounded-xl bg-mint py-2 text-center text-sm font-medium text-forest transition-colors hover:bg-fresh">
          View Gathering
        </Link>
      </div>
    </article>
  );
}
