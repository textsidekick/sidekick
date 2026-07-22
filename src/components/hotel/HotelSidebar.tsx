"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Hotel, ArrowLeft, DoorOpen, UsersRound, Menu, MessagesSquare, ClipboardList, BrainCircuit, ShieldCheck, Wrench, Bot, ChartNoAxesCombined, QrCode, PlugZap, Settings2, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHotelDemoState } from "@/lib/hotel-demo-store";
import { getSidebarCounts } from "@/lib/hotel-demo-view";

const NAV_GROUPS = [
  {
    label: "Operations",
    items: [
      { label: "Overview", href: "/hotel", icon: Hotel },
      { label: "Inbox", href: "/hotel/conversations", icon: MessagesSquare, countKey: "inbox" as const },
      { label: "Tasks", href: "/hotel/tasks", icon: ClipboardList, countKey: "tasks" as const },
      { label: "Housekeeping", href: "/hotel/housekeeping", icon: Building2 },
      { label: "Rooms", href: "/hotel/rooms", icon: DoorOpen },
      { label: "Maintenance", href: "/hotel/maintenance", icon: Wrench, countKey: "maintenance" as const },
      { label: "Team", href: "/hotel/people", icon: UsersRound },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Hotel Knowledge", href: "/hotel/knowledge", icon: BrainCircuit },
      { label: "Hotel Memory", href: "/hotel/memory", icon: ShieldCheck },
      { label: "Analytics", href: "/hotel/analytics", icon: ChartNoAxesCombined },
      { label: "Automations", href: "/hotel/automations", icon: Bot },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Guest Access", href: "/hotel/guest-access", icon: QrCode },
      { label: "Integrations", href: "/hotel/integrations", icon: PlugZap },
      { label: "Settings", href: "/hotel/settings", icon: Settings2 },
    ],
  },
];

export function HotelSidebar() {
  const pathname = usePathname();
  const { state, loaded } = useHotelDemoState();
  const counts = loaded ? getSidebarCounts(state) : { inbox: 0, tasks: 0, maintenance: 0 };
  const mobilePrimary = NAV_GROUPS[0].items.slice(0, 4);
  const moreItems = NAV_GROUPS.flatMap((group) => group.items).filter((item) => !mobilePrimary.some((primary) => primary.href === item.href));

  function renderBadge(key?: "inbox" | "tasks" | "maintenance") {
    if (!key) return null;
    const value = counts[key];
    return <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white">{value}</span>;
  }

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-[#E1E5E2] bg-white/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Link href="/hotel" className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Live operations</div>
            <div className="truncate text-base font-semibold text-[#18222C]">Pacific Stay Motel</div>
          </Link>
          <details className="relative">
            <summary className="flex list-none items-center gap-2 rounded-[10px] border border-[#E1E5E2] bg-white px-3 py-2 text-sm font-medium text-[#5C6975] marker:content-none">
              <Menu className="h-4 w-4" /> More
            </summary>
            <div className="absolute right-0 mt-2 w-[280px] max-w-[calc(100vw-2rem)] rounded-2xl border border-[#E1E5E2] bg-white p-3 shadow-lg">
              <div className="max-h-[60vh] space-y-1 overflow-y-auto">
                {moreItems.map((item) => {
                  const active = pathname === item.href || (item.href !== "/hotel" && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        active ? "bg-[#EEF5FA] text-[#18222C]" : "text-[#5C6975] hover:bg-[#F5F6F4] hover:text-[#18222C]"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4", active ? "text-[#3976A8]" : "text-[#5C6975]")} />
                      <div>{item.label}</div>
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
                  "whitespace-nowrap rounded-[10px] border px-3 py-2 text-xs font-medium",
                  active ? "border-[#E1E5E2] bg-[#EEF5FA] text-[#18222C]" : "border-[#E1E5E2] bg-white text-[#5C6975]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <aside className="fixed left-0 top-0 bottom-0 z-40 hidden w-[250px] border-r border-[#20384F] bg-[#162A3D] lg:block">
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5">
            <Image src="/images/logo/newsidekicklogo.png" alt="Sidekick" width={30} height={30} style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }} />
            <div className="text-[17px] font-semibold tracking-[-0.02em] text-white">Sidekick</div>
          </div>

          <div className="shrink-0 border-b border-white/10 px-4 py-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-sm font-semibold text-white">Pacific Stay Motel</div>
              <div className="mt-1 text-xs leading-5 text-slate-300">Demo property</div>
              <div className="mt-1 text-xs leading-5 text-slate-300">Guests and staff communicate through Sidekick</div>
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
                          active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <item.icon className={cn("h-4 w-4", active ? "text-[#7FBCD1]" : "text-slate-400")} />
                        <div>{item.label}</div>
                        {renderBadge(item.countKey)}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="shrink-0 border-t border-white/10 p-3">
            <Link href="/choose" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to project chooser
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
