"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { BedDouble, ConciergeBell, Wrench, Hotel, ArrowLeft, DoorOpen, CalendarClock, UsersRound, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "Main views",
    items: [
      { label: "Overview", href: "/hotel", icon: Hotel, detail: "Rooms, availability, arrivals, team" },
      { label: "Room Board", href: "/hotel/rooms", icon: DoorOpen, detail: "Inventory + readiness" },
      { label: "Arrivals & Departures", href: "/hotel/stays", icon: CalendarClock, detail: "Who is coming and going" },
      { label: "Guest Requests", href: "/hotel/guest-requests", icon: ConciergeBell, detail: "Open guest issues" },
      { label: "Housekeeping", href: "/hotel/housekeeping", icon: BedDouble, detail: "Turns + service" },
      { label: "Maintenance", href: "/hotel/maintenance", icon: Wrench, detail: "Defects + fixes" },
      { label: "People Ops", href: "/hotel/people", icon: UsersRound, detail: "Coverage + training" },
    ],
  },
];

export function HotelSidebar() {
  const pathname = usePathname();
  const mobilePrimary = NAV_GROUPS.flatMap((group) => group.items).filter((item) => ["/hotel", "/hotel/rooms", "/hotel/stays", "/hotel/guest-requests"].includes(item.href));
  const moreItems = NAV_GROUPS.flatMap((group) => group.items).filter((item) => !mobilePrimary.some((primary) => primary.href === item.href));

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Link href="/hotel" className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Hotel operations</div>
            <div className="truncate text-base font-semibold text-[#17202B]">Pacific Stay Motel</div>
          </Link>
          <details className="relative">
            <summary className="flex list-none items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 marker:content-none">
              <Menu className="h-4 w-4" /> More
            </summary>
            <div className="absolute right-0 mt-2 w-[280px] max-w-[calc(100vw-2rem)] rounded-3xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/60">
              <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">More hotel views</div>
              <div className="max-h-[60vh] space-y-1 overflow-y-auto">
                {moreItems.map((item) => {
                  const active = pathname === item.href || (item.href !== "/hotel" && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        active ? "bg-slate-100 text-[#17202B]" : "text-slate-600 hover:bg-slate-100 hover:text-[#17202B]"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4", active ? "text-[#0060F0]" : "text-slate-500")} />
                      <div className="min-w-0">
                        <div>{item.label}</div>
                        <div className="truncate text-[11px] font-normal text-slate-500">{item.detail}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </details>
        </div>
        <div className="flex gap-2 overflow-x-auto px-4 pb-3">
          {mobilePrimary.map((item) => {
            const active = pathname === item.href || (item.href !== "/hotel" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium",
                  active
                    ? "border-slate-200 bg-slate-100 text-[#17202B]"
                    : "border-slate-200 bg-white text-slate-600"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <aside className="fixed left-0 top-0 bottom-0 z-40 hidden w-[250px] border-r border-slate-200 bg-[#343A40] lg:block">
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5">
          <Image
            src="/images/logo/newsidekicklogo.png"
            alt="Sidekick"
            width={30}
            height={30}
            style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }}
          />
          <div>
            <div className="text-[17px] font-semibold tracking-[-0.02em] text-white">Sidekick</div>
          </div>
        </div>

        <div className="shrink-0 border-b border-white/10 px-4 py-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Demo Property</div>
            <div className="mt-1 text-sm font-semibold text-white">Pacific Stay Motel</div>
            <div className="mt-1 text-xs leading-5 text-slate-300">48 rooms · small motel view · rooms, guests, and staff</div>
          </div>
        </div>

        <nav className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3 pb-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{group.label}</div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.href || (item.href !== "/hotel" && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-white/10 text-white"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4", active ? "text-[#8DB4D9]" : "text-slate-400")} />
                      <div className="min-w-0">
                        <div>{item.label}</div>
                        <div className="truncate text-[11px] font-normal text-slate-400">{item.detail}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-3">
          <Link
            href="/choose"
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to project chooser
          </Link>
        </div>
        </div>
      </aside>
    </>
  );
}
