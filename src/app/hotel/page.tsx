"use client";

import Link from "next/link";
import { BedDouble, ConciergeBell, Wrench, Clock3, Languages, Sparkles, DoorOpen, BellRing, MessageSquareText, CalendarClock, HeartHandshake, ShieldAlert, CarFront, AlarmClockCheck, Crown, Users, Ban } from "lucide-react";
import { HotelPageHeader, HotelMetric, HotelQueueCard, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelOverviewPage() {
  const { state, metrics, loaded } = useHotelDemoState();

  if (!loaded) return null;

  const attention = state.requests
    .filter((request) => request.status !== "resolved")
    .sort((a, b) => {
      const score = (priority: string) => (priority === "urgent" ? 3 : priority === "high" ? 2 : 1);
      return score(b.priority) - score(a.priority) || b.waitMinutes - a.waitMinutes;
    })
    .slice(0, 5);

  const arrivalsAtRisk = state.stays.filter((stay) => stay.status === "arriving").length;
  const departuresInPlay = state.stays.filter((stay) => stay.status === "departing").length;
  const blockedRooms = state.outOfOrderItems.filter((item) => item.status !== "released").length;
  const deskExceptions = state.requests.filter((r) => r.kind === "front_desk" || r.status === "needs_approval").length;
  const activeRecovery = state.serviceCases.filter((item) => item.status !== "closed").length;
  const nextTwoHoursFeed = [
    ...state.stays
      .filter((stay) => stay.status === "arriving" || stay.status === "departing")
      .slice(0, 4)
      .map((stay) => ({
        id: `stay-${stay.id}`,
        time: stay.eta,
        label: stay.status === "arriving" ? "Arrival in play" : "Departure in play",
        title: `${stay.guestName} · Room ${stay.room}`,
        detail: stay.notes,
        tone: stay.status === "arriving" ? "high" : "queued" as const,
      })),
    ...state.requests
      .filter((request) => request.priority === "urgent" || request.status === "needs_approval")
      .slice(0, 3)
      .map((request) => ({
        id: `request-${request.id}`,
        time: `${request.waitMinutes} min`,
        label: request.status === "needs_approval" ? "Decision due" : "Urgent guest issue",
        title: `Room ${request.room} · ${request.title}`,
        detail: request.detail,
        tone: request.priority === "urgent" ? "urgent" : "queued" as const,
      })),
    ...state.outOfOrderItems
      .filter((item) => item.status !== "released")
      .slice(0, 2)
      .map((item) => ({
        id: `ooo-${item.id}`,
        time: "Tonight",
        label: "Revenue blocked",
        title: `Room ${item.room} out of order`,
        detail: `${item.issue} · ${item.revenueAtRisk}`,
        tone: "high" as const,
      })),
  ].slice(0, 6);
  const operationsCards = [
    {
      title: "Guest",
      summary: "Texts, arrivals, and at-risk stays that need guest-facing follow-through.",
      href: "/hotel/guest-requests",
      icon: ConciergeBell,
      metrics: [
        `${metrics.openGuestRequests} open requests`,
        `${arrivalsAtRisk} arrivals at risk`,
        `${activeRecovery} recovery cases`,
      ],
      links: [
        { label: "Guest requests", href: "/hotel/guest-requests" },
        { label: "SMS console", href: "/hotel/sms" },
        { label: "Service recovery", href: "/hotel/service-recovery" },
      ],
    },
    {
      title: "Rooms",
      summary: "Sellable inventory, turns, inspections, and rooms blocked by maintenance or quality issues.",
      href: "/hotel/rooms",
      icon: DoorOpen,
      metrics: [
        `${metrics.roomsNeedingService} rooms need service`,
        `${blockedRooms} rooms blocked`,
        `${state.inspections.filter((item) => item.status !== "passed").length} inspections open`,
      ],
      links: [
        { label: "Room board", href: "/hotel/rooms" },
        { label: "Housekeeping", href: "/hotel/housekeeping" },
        { label: "Out of order", href: "/hotel/out-of-order" },
      ],
    },
    {
      title: "Front desk",
      summary: "Exceptions that hit the desk first: approvals, parking, luggage, breakfast, and departures.",
      href: "/hotel/front-desk",
      icon: BellRing,
      metrics: [
        `${deskExceptions} desk exceptions`,
        `${departuresInPlay} departures in play`,
        `${state.parkingItems.filter((item) => item.status !== "cleared").length} parking issues`,
      ],
      links: [
        { label: "Front desk board", href: "/hotel/front-desk" },
        { label: "Approvals", href: "/hotel/approvals" },
        { label: "Breakfast", href: "/hotel/breakfast" },
      ],
    },
    {
      title: "Property ops",
      summary: "Maintenance, preventive work, incidents, and operating memory that keep the property stable.",
      href: "/hotel/maintenance",
      icon: Wrench,
      metrics: [
        `${metrics.openMaintenanceIssues} maintenance issues`,
        `${state.deepCleanItems.filter((item) => item.status !== "completed").length} deep cleans active`,
        `${state.incidentItems.filter((item) => item.status !== "closed").length} incident items`,
      ],
      links: [
        { label: "Maintenance", href: "/hotel/maintenance" },
        { label: "Deep cleans", href: "/hotel/deep-cleans" },
        { label: "Operating memory", href: "/hotel/knowledge" },
      ],
    },
  ];

  const secondaryTools = [
    { href: "/hotel/vip-arrivals", icon: Crown, title: "VIP arrivals", count: state.vipArrivalItems.filter((item) => item.status !== "welcomed").length },
    { href: "/hotel/group-arrivals", icon: Users, title: "Group arrivals", count: state.groupArrivalItems.filter((item) => item.status !== "checked_in").length },
    { href: "/hotel/parking", icon: CarFront, title: "Parking", count: state.parkingItems.filter((item) => item.status !== "cleared").length },
    { href: "/hotel/wakeups", icon: AlarmClockCheck, title: "Wake-up calls", count: state.wakeupItems.filter((item) => item.status !== "completed").length },
    { href: "/hotel/incidents", icon: ShieldAlert, title: "Incident log", count: state.incidentItems.filter((item) => item.status !== "closed").length },
    { href: "/hotel/out-of-order", icon: Ban, title: "Out of order", count: blockedRooms },
  ];

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <HotelPageHeader
          eyebrow="Hotel Project"
          title={`${state.property.name} operations`}
          body="Separate hotel app prototype. Guests, front desk, housekeeping, and maintenance all coordinate through text, with every request turned into tracked work and reusable operating memory."
          action={
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              {state.property.roomCount} rooms · {state.property.city} · {state.property.occupancyPct}% occupied
            </div>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <HotelMetric label="Arrivals at risk" value={arrivalsAtRisk} sub="Check-ins that still need prep, routing, or follow-up" />
          <HotelMetric label="Desk exceptions" value={deskExceptions} sub="Late checkout, approvals, parking, and policy edge cases" />
          <HotelMetric label="Rooms off track" value={metrics.roomsNeedingService} sub="Inventory still blocked by cleaning, inspection, or maintenance" />
          <HotelMetric label="Recovery in play" value={activeRecovery} sub="Guest issues that could become refunds, reviews, or churn" />
          <HotelMetric label="Guest first response" value={`${metrics.avgGuestResponseSeconds}s`} sub="Average time to acknowledge a guest text or request" />
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Next 2 hours</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#17202B]">One operational feed for what can still hurt the stay</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Use this before diving into boards. It mixes arrivals, departures, urgent guest issues, decision bottlenecks, and revenue-blocking rooms into one shift-level picture.</p>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">{nextTwoHoursFeed.length} items in play</div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {nextTwoHoursFeed.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{item.time} · {item.label}</div>
                    <div className="mt-2 text-sm font-semibold text-[#17202B]">{item.title}</div>
                  </div>
                  <HotelStatusPill tone={item.tone}>{item.label}</HotelStatusPill>
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.9fr)]">
          <div className="rounded-[32px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)] p-7 shadow-sm shadow-slate-200/50">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Shift priority</div>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#17202B]">Run the hotel by moments that hurt the guest first</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">This view is now organized around the small set of things that actually swing the stay: guest communication, room readiness, front-desk exceptions, and property stability.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">
                <Clock3 className="h-3.5 w-3.5" /> Shift handoff in 47 min
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {operationsCards.map((card) => (
                <Link key={card.title} href={card.href} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 transition-transform hover:-translate-y-0.5">
                  <div className="flex items-start justify-between gap-3">
                    <card.icon className="h-5 w-5 text-slate-600" />
                    <div className="rounded-md border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Core pillar</div>
                  </div>
                  <div className="mt-5 text-xl font-semibold text-[#17202B]">{card.title}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{card.summary}</p>
                  <div className="mt-4 space-y-2">
                    {card.metrics.map((metric) => (
                      <div key={metric} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">{metric}</div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {card.links.map((link) => (
                      <span key={link.href} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">{link.label}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-black/8 bg-white p-6 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">Live desk view</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">What needs attention now</h2>

              <div className="mt-5 space-y-3">
                {attention.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-black/6 bg-[#fffdfa] px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-[#1C1A16]">{item.room.startsWith("Room") ? item.room : `Room ${item.room}`} · {item.title}</div>
                        <div className="mt-1 text-xs text-black/45">{item.kind.replace("_", " ")} · {item.waitMinutes} min waiting</div>
                      </div>
                      <HotelStatusPill tone={item.priority === "urgent" ? "urgent" : item.priority === "high" ? "high" : item.status === "needs_approval" ? "queued" : "normal"}>
                        {item.priority === "urgent" ? "Urgent" : item.status === "needs_approval" ? "Needs approval" : item.status === "in_progress" ? "In progress" : "Open"}
                      </HotelStatusPill>
                    </div>
                    <div className="mt-2 text-sm leading-6 text-black/60">{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-black/8 bg-white p-6 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">Hospitality lens</div>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Why this should feel different</h2>
              <div className="mt-5 space-y-4 text-sm leading-6 text-black/60">
                <div className="flex gap-3"><BedDouble className="mt-0.5 h-4 w-4 text-[#0060F0]" /> Sellable room inventory matters more than raw task counts.</div>
                <div className="flex gap-3"><ConciergeBell className="mt-0.5 h-4 w-4 text-[#0060F0]" /> Guest perception changes with every update, ETA, and make-good.</div>
                <div className="flex gap-3"><Languages className="mt-0.5 h-4 w-4 text-[#0060F0]" /> Staff and guest messaging needs bilingual, role-based, text-first coordination.</div>
                <div className="flex gap-3"><Sparkles className="mt-0.5 h-4 w-4 text-[#0060F0]" /> Good hotel software should feel calm, precise, and operational—not gimmicky.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">Supporting views</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#1C1A16]">Specialized tools that support the main operating flow</h2>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">Useful when needed — not the system of record</div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {secondaryTools.map((tool) => (
              <HotelQueueCard key={tool.href} href={tool.href} icon={tool.icon} title={tool.title} count={tool.count} detail="Use this only when the live queue or arrivals flow needs a deeper supporting view." />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
