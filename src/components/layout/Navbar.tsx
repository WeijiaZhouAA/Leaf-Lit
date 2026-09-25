"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BellIcon, LogoMark, MessageIcon } from "@/components/ui/Icons";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/client";
import type { NotificationItem } from "@/types";

const links = [
  { href: "/", label: "Home" },
  { href: "/gatherings", label: "Discover Gatherings" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/my-gatherings", label: "My Gatherings" },
  { href: "/my-listings", label: "My Listings" },
  { href: "/orders", label: "My Purchases" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, unread, refresh } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notes, setNotes] = useState<NotificationItem[]>([]);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function openNotes() {
    setNotifOpen((open) => !open);
    setProfileOpen(false);
    if (user) {
      const data = await api<{ notifications: NotificationItem[] }>("/api/notifications");
      setNotes(data.notifications.slice(0, 4));
    }
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    await refresh();
    setProfileOpen(false);
    router.push("/signin");
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-sage bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="mr-10 flex shrink-0 items-center gap-3 sm:mr-16">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest"><LogoMark /></span>
            <span className="font-serif text-2xl font-semibold leading-none text-forest">Leaf & Lit</span>
          </Link>

          <div className="ml-auto hidden items-center gap-4 md:flex">
            {links.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link key={link.href} href={link.href} className={`hidden shrink-0 items-center justify-center whitespace-nowrap px-2 text-center text-sm font-medium transition-colors lg:inline-flex ${active ? "text-forest" : "text-body hover:text-forest"}`}>
                  {link.label}
                </Link>
              );
            })}
            <Link href="/messages" aria-label="Messages" className="inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-muted hover:bg-mint hover:text-forest">
              <MessageIcon />
            </Link>
            <div className="relative flex shrink-0 justify-center" ref={notifRef}>
              <button aria-label="Notifications" onClick={openNotes} className="relative rounded-lg p-2 text-muted hover:bg-mint hover:text-forest">
                <BellIcon />
                {unread > 0 && <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">{unread}</span>}
              </button>
              {notifOpen && (
                <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-sage bg-white py-2 shadow-lg">
                  <div className="flex items-center justify-between border-b border-sage px-4 py-2">
                    <span className="text-sm font-semibold text-forest">Notifications</span>
                    <Link href="/notifications" onClick={() => setNotifOpen(false)} className="text-xs text-muted hover:text-forest">View all</Link>
                  </div>
                  {user ? notes.map((note) => (
                    <Link key={note.id} href={note.link || "/notifications"} onClick={() => setNotifOpen(false)} className={`block px-4 py-3 hover:bg-surface ${note.read ? "" : "bg-mint/30"}`}>
                      <p className="text-sm text-body">{note.text}</p>
                      <p className="mt-0.5 text-xs text-muted">{note.time}</p>
                    </Link>
                  )) : <p className="px-4 py-3 text-sm text-muted">Sign in to see notifications.</p>}
                </div>
              )}
            </div>
            <Link href="/orders" className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-center text-sm font-medium lg:hidden ${pathname.startsWith("/orders") ? "bg-mint text-forest" : "text-forest hover:bg-mint"}`}>My Purchases</Link>
            <Link href="/gatherings/create" className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-mint px-3 py-1.5 text-center text-sm font-medium text-forest hover:bg-fresh">+ Create Gathering</Link>
            <Link href="/sell" className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-forest px-3 py-1.5 text-center text-sm font-medium text-white hover:bg-forest-light">Sell a Book</Link>
            {user ? (
              <div className="relative flex shrink-0 justify-center" ref={profileRef}>
                <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }} className="rounded-xl p-1 hover:bg-mint">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full border-2 border-fresh object-cover" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-sage bg-white py-2 shadow-lg">
                    <div className="border-b border-sage px-4 py-3">
                      <p className="text-sm font-medium text-forest">{user.name}</p>
                      <p className="text-xs text-muted">{user.location}</p>
                    </div>
                    {[
                      ["/profile", "My Profile"],
                      ["/my-gatherings", "My Gatherings"],
                      ["/my-listings", "My Listings"],
                      ["/saved", "Saved Items"],
                      ["/orders", "My Purchases"],
                    ].map(([href, label]) => (
                      <Link key={href} href={href} onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-body hover:bg-mint hover:text-forest">{label}</Link>
                    ))}
                    <div className="mt-1 border-t border-sage pt-1">
                      <Link href="/settings" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-body hover:bg-mint hover:text-forest">Settings</Link>
                      <button onClick={logout} className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">Log Out</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/signin" className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-sage px-3 py-1.5 text-center text-sm font-medium text-forest hover:bg-mint">Sign In</Link>
            )}
          </div>

          <button className="p-2 text-muted md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
        {mobileOpen && (
          <div className="space-y-1 border-t border-sage py-4 md:hidden">
            {[...links, { href: "/messages", label: "Messages" }, { href: "/notifications", label: "Notifications" }, { href: "/saved", label: "Saved Items" }, { href: "/profile", label: "My Profile" }, { href: "/settings", label: "Settings" }].map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-lg px-4 py-2 text-center text-sm text-body hover:bg-mint hover:text-forest">{item.label}</Link>
            ))}
            <div className="flex gap-2 border-t border-sage px-4 pt-3">
              <Link href="/gatherings/create" className="flex-1 rounded-lg bg-mint py-2 text-center text-sm font-medium text-forest">+ Create Gathering</Link>
              <Link href="/sell" className="flex-1 rounded-lg bg-forest py-2 text-center text-sm font-medium text-white">Sell a Book</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
