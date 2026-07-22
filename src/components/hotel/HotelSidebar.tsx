"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { BedDouble, ConciergeBell, Sparkles, Wrench, ClipboardList, Hotel, ArrowLeft, DoorOpen, Settings, BadgeCheck, BellRing, MessageSquareText, CalendarClock, UsersRound, HeartHandshake, SearchCheck, ClipboardCheck, Package2, ReceiptText, ShieldAlert, CarFront, PackageCheck, BriefcaseBusiness, AlarmClockCheck, WashingMachine, BusFront, ArrowRightLeft, Refrigerator, Crown, Users, Ban, SprayCan, Coffee, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "Run the shift",
    items: [
      { label: "Overview", href: "/hotel", icon: Hotel, detail: "Shift summary" },
      { label: "Front Desk Live Queue", href: "/hotel/front-desk", icon: BellRing, detail: "Authoritative now view" },
      { label: "Guest Inbox", href: "/hotel/guest-requests", icon: ConciergeBell, detail: "Workflow lanes" },
      { label: "Arrivals & Departures", href: "/hotel/stays", icon: CalendarClock, detail: "Next wave execution" },
      { label: "SMS Console", href: "/hotel/sms", icon: MessageSquareText, detail: "Test the text loop" },
      { label: "Service Recovery", href: "/hotel/service-recovery", icon: HeartHandshake, detail: "Escalations + make-goods" },
    ],
  },
  {
    label: "Property views",
    items: [
      { label: "Room Board", href: "/hotel/rooms", icon: DoorOpen, detail: "Inventory + readiness" },
      { label: "Housekeeping", href: "/hotel/housekeeping", icon: BedDouble, detail: "Turns + service" },
      { label: "Maintenance", href: "/hotel/maintenance", icon: Wrench, detail: "Defects + fixes" },
      { label: "Inspections", href: "/hotel/inspections", icon: ClipboardCheck, detail: "Quality gates" },
      { label: "Out of Order", href: "/hotel/out-of-order", icon: Ban, detail: "Blocked revenue" },
      { label: "Deep Cleans", href: "/hotel/deep-cleans", icon: SprayCan, detail: "Recurring reset work" },
    ],
  },
  {
    label: "Supporting tools",
    items: [
      { label: "Approvals", href: "/hotel/approvals", icon: BadgeCheck, detail: "Desk exceptions" },
      { label: "Parking", href: "/hotel/parking", icon: CarFront, detail: "Vehicle edge cases" },
      { label: "Packages", href: "/hotel/packages", icon: PackageCheck, detail: "Deliveries" },
      { label: "Luggage Hold", href: "/hotel/luggage", icon: BriefcaseBusiness, detail: "Bell desk tasks" },
      { label: "Breakfast", href: "/hotel/breakfast", icon: Coffee, detail: "Morning service" },
      { label: "Wake-up Calls", href: "/hotel/wakeups", icon: AlarmClockCheck, detail: "Guest reminders" },
      { label: "Shuttles", href: "/hotel/shuttles", icon: BusFront, detail: "Transport timing" },
    ],
  },
  {
    label: "Reference + edge cases",
    items: [
      { label: "VIP Arrivals", href: "/hotel/vip-arrivals", icon: Crown, detail: "Special handling" },
      { label: "Group Arrivals", href: "/hotel/group-arrivals", icon: Users, detail: "Bulk check-in prep" },
      { label: "Room Moves", href: "/hotel/room-moves", icon: ArrowRightLeft, detail: "Relocation cases" },
      { label: "Minibar & Market", href: "/hotel/minibar", icon: Refrigerator, detail: "Retail exceptions" },
      { label: "Laundry", href: "/hotel/laundry", icon: WashingMachine, detail: "Linens + guest items" },
      { label: "Supplies", href: "/hotel/supplies", icon: Package2, detail: "Par levels" },
      { label: "Night Audit", href: "/hotel/audit", icon: ReceiptText, detail: "End-of-day controls" },
      { label: "Incident Log", href: "/hotel/incidents", icon: ShieldAlert, detail: "Safety + security" },
      { label: "Lost & Found", href: "/hotel/lost-found", icon: SearchCheck, detail: "Claim tracking" },
      { label: "People Ops", href: "/hotel/people", icon: UsersRound, detail: "Coverage + training" },
      { label: "Operating Memory", href: "/hotel/knowledge", icon: Sparkles, detail: "Reusable know-how" },
      { label: "Shift Board", href: "/hotel/shift-board", icon: ClipboardList, detail: "Handoff summary" },
      { label: "Onboarding", href: "/hotel/onboarding", icon: Settings, detail: "New staff setup" },
    ],
  },
];

export function HotelSidebar() {
  const pathname = usePathname();
  const mobilePrimary = NAV_GROUPS.flatMap((group) => group.items).filter((item) => ["/hotel", "/hotel/front-desk", "/hotel/guest-requests", "/hotel/rooms", "/hotel/sms"].includes(item.href));
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
            <summary className="flex list-none items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 marker:content-none">
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
                        active ? "bg-blue-50 text-[#17202B]" : "text-slate-600 hover:bg-slate-100 hover:text-[#17202B]"
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
                  "whitespace-nowrap rounded-full border px-3 py-2 text-xs font-medium",
                  active
                    ? "border-blue-200 bg-blue-50 text-[#17202B]"
                    : "border-slate-200 bg-white text-slate-600"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <aside className="fixed left-0 top-0 bottom-0 z-40 hidden w-[250px] border-r border-slate-200 bg-[#182430] lg:block">
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#0060F0] p-1.5 shadow-[0_8px_24px_rgba(0,96,240,0.25)]">
            <Image
              src="/images/logo/newsidekicklogo.png"
              alt="Sidekick"
              width={28}
              height={28}
              style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }}
          />
          </div>
          <div>
            <div className="text-[17px] font-semibold tracking-[-0.02em] text-white">Sidekick</div>
            <div className="text-xs text-slate-300">Hotels</div>
          </div>
        </div>

        <div className="shrink-0 border-b border-white/10 px-4 py-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Demo Property</div>
            <div className="mt-1 text-sm font-semibold text-white">Pacific Stay Motel</div>
            <div className="mt-1 text-xs leading-5 text-slate-300">48 rooms · multilingual staff · one shift system for desk, rooms, and guest messaging</div>
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
