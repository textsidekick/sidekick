"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { BedDouble, ConciergeBell, Sparkles, Wrench, ClipboardList, Hotel, ArrowLeft, DoorOpen, Settings, BadgeCheck, BellRing, MessageSquareText, CalendarClock, UsersRound, HeartHandshake, SearchCheck, ClipboardCheck, Package2, ReceiptText, ShieldAlert, CarFront, PackageCheck, BriefcaseBusiness, AlarmClockCheck, WashingMachine, BusFront, ArrowRightLeft, Refrigerator, Crown, Users, Ban, SprayCan } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Overview", href: "/hotel", icon: Hotel },
  { label: "Guest Requests", href: "/hotel/guest-requests", icon: ConciergeBell },
  { label: "Approvals", href: "/hotel/approvals", icon: BadgeCheck },
  { label: "Front Desk", href: "/hotel/front-desk", icon: BellRing },
  { label: "SMS Console", href: "/hotel/sms", icon: MessageSquareText },
  { label: "Arrivals & Departures", href: "/hotel/stays", icon: CalendarClock },
  { label: "People Ops", href: "/hotel/people", icon: UsersRound },
  { label: "Service Recovery", href: "/hotel/service-recovery", icon: HeartHandshake },
  { label: "Lost & Found", href: "/hotel/lost-found", icon: SearchCheck },
  { label: "Inspections", href: "/hotel/inspections", icon: ClipboardCheck },
  { label: "Supplies", href: "/hotel/supplies", icon: Package2 },
  { label: "Night Audit", href: "/hotel/audit", icon: ReceiptText },
  { label: "Incident Log", href: "/hotel/incidents", icon: ShieldAlert },
  { label: "Parking", href: "/hotel/parking", icon: CarFront },
  { label: "Packages", href: "/hotel/packages", icon: PackageCheck },
  { label: "Luggage Hold", href: "/hotel/luggage", icon: BriefcaseBusiness },
  { label: "Wake-up Calls", href: "/hotel/wakeups", icon: AlarmClockCheck },
  { label: "Laundry", href: "/hotel/laundry", icon: WashingMachine },
  { label: "Shuttles", href: "/hotel/shuttles", icon: BusFront },
  { label: "Room Moves", href: "/hotel/room-moves", icon: ArrowRightLeft },
  { label: "Minibar & Market", href: "/hotel/minibar", icon: Refrigerator },
  { label: "VIP Arrivals", href: "/hotel/vip-arrivals", icon: Crown },
  { label: "Group Arrivals", href: "/hotel/group-arrivals", icon: Users },
  { label: "Out of Order", href: "/hotel/out-of-order", icon: Ban },
  { label: "Deep cleans", href: "/hotel/deep-cleans", icon: SprayCan },
  { label: "Room Board", href: "/hotel/rooms", icon: DoorOpen },
  { label: "Housekeeping", href: "/hotel/housekeeping", icon: BedDouble },
  { label: "Maintenance", href: "/hotel/maintenance", icon: Wrench },
  { label: "Operating Memory", href: "/hotel/knowledge", icon: Sparkles },
  { label: "Shift Board", href: "/hotel/shift-board", icon: ClipboardList },
  { label: "Onboarding", href: "/hotel/onboarding", icon: Settings },
];

export function HotelSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 hidden w-[250px] border-r border-[#eadfce] bg-[#fffdfa] lg:block">
      <div className="flex h-16 items-center gap-3 border-b border-[#eadfce] px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C96442] p-1.5">
          <Image
            src="/images/logo/newsidekicklogo.png"
            alt="Sidekick"
            width={28}
            height={28}
            style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }}
          />
        </div>
        <div>
          <div className="text-[15px] font-semibold tracking-[-0.02em] text-[#1C1A16]">Sidekick Hotels</div>
          <div className="text-xs text-black/45">Hotel operations OS</div>
        </div>
      </div>

      <div className="border-b border-[#eadfce] px-4 py-4">
        <div className="rounded-2xl border border-[#f0e6d7] bg-[#faf5ee] p-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">Demo Property</div>
          <div className="mt-1 text-sm font-semibold text-[#1C1A16]">Pacific Stay Motel</div>
          <div className="mt-1 text-xs leading-5 text-black/50">48 rooms · multilingual staff · front desk + housekeeping + maintenance</div>
        </div>
      </div>

      <nav className="space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/hotel" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[#C96442]/10 text-[#1C1A16]"
                  : "text-black/55 hover:bg-[#f7f1e8] hover:text-[#1C1A16]"
              )}
            >
              <item.icon className={cn("h-4 w-4", active ? "text-[#C96442]" : "text-black/45")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute inset-x-0 bottom-0 border-t border-[#eadfce] p-3">
        <Link
          href="/choose"
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-black/55 transition-colors hover:bg-[#f7f1e8] hover:text-[#1C1A16]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to project chooser
        </Link>
      </div>
    </aside>
  );
}
