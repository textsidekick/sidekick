"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelStaysPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  const arriving = state.stays.filter((stay) => stay.status === "arriving");
  const departing = state.stays.filter((stay) => stay.status === "departing");
  const inHouse = state.stays.filter((stay) => stay.status === "checked_in");
  const arrivalExecution = arriving.map((stay) => {
    const room = state.rooms.find((item) => item.room === stay.room);
    const blocked = state.outOfOrderItems.find((item) => item.room === stay.room && item.status !== "released");
    const readiness = blocked ? "blocked" : room?.status === "inspection" ? "inspection" : room?.status === "queued" ? "queued" : room?.status === "maintenance" ? "maintenance" : "ready";
    return { stay, room, blocked, readiness };
  });
  const departureExecution = departing.map((stay) => {
    const dependentArrival = arriving.find((item) => item.room === stay.room);
    return { stay, dependentArrival };
  });
  const readinessGaps = arrivalExecution.filter((item) => item.readiness !== "ready");
  const arrivalsNeedingPrep = arrivalExecution.filter((item) => item.stay.notes.toLowerCase().includes("pref") || item.stay.notes.toLowerCase().includes("parking") || item.stay.notes.toLowerCase().includes("quiet"));

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <HotelPageHeader
          title="Arrivals & departures"
          body="Front desk control center for check-ins, departures, late checkout pressure, and guests who need proactive outreach before they show up."
          action={<div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">{arriving.length} arriving · {departing.length} departing</div>}
        />

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Next 2–4 hours</div>
            <div className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#17202B]">{arriving.length}</div>
            <div className="mt-1 text-sm text-slate-600">Arrivals that still need a ready room, guest outreach, or special handling.</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Room readiness gaps</div>
            <div className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#17202B]">{readinessGaps.length}</div>
            <div className="mt-1 text-sm text-slate-600">Arrivals tied to rooms that are still blocked, queued, under maintenance, or waiting on inspection.</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Departure pressure</div>
            <div className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#17202B]">{departureExecution.filter((item) => item.dependentArrival).length}</div>
            <div className="mt-1 text-sm text-slate-600">Departures directly blocking a same-room arrival or desk promise later today.</div>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Execution view</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#17202B]">What the desk has to line up before the next wave hits</h2>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">{arrivalsNeedingPrep.length} arrivals need special prep</div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {arrivalExecution.map(({ stay, room, blocked, readiness }) => (
              <div key={stay.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">ETA {stay.eta}</div>
                    <div className="mt-2 text-sm font-semibold text-[#17202B]">{stay.guestName} · Room {stay.room}</div>
                  </div>
                  <HotelStatusPill tone={readiness === "ready" ? "resolved" : readiness === "blocked" || readiness === "maintenance" ? "urgent" : "high"}>
                    {readiness === "ready" ? "room ready" : readiness.replace(/_/g, " ")}
                  </HotelStatusPill>
                </div>
                <div className="mt-3 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-500">
                  <div><span className="font-semibold text-[#17202B]">Source:</span> {stay.source}</div>
                  <div><span className="font-semibold text-[#17202B]">Stay:</span> {stay.nights} night{stay.nights === 1 ? "" : "s"}</div>
                  <div><span className="font-semibold text-[#17202B]">Room status:</span> {blocked ? `${blocked.issue} · ${blocked.revenueAtRisk}` : room?.status || "Unknown"}</div>
                </div>
                <div className="mt-3 text-sm leading-6 text-slate-600">{stay.notes}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => actions.updateStayNote(stay.id, `${stay.notes} Pre-arrival text sent with arrival expectations and desk contact.`)}
                    className="rounded-full bg-[#2F5D8A] px-3 py-1 text-xs font-medium text-white"
                  >
                    Send pre-arrival text
                  </button>
                  {room && room.status !== "ready" ? (
                    <button
                      onClick={() => actions.updateRoomNote(stay.room, `${room.note} Front desk escalated this room for arrival readiness.`)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      Rush room
                    </button>
                  ) : null}
                  <button
                    onClick={() => actions.updateStayStatus(stay.id, "checked_in")}
                    className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                  >
                    Check in
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Section
            title="Arriving today"
            items={arriving}
            renderActions={(stay) => (
              <>
                <button
                  onClick={() => actions.updateStayStatus(stay.id, "checked_in")}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                >
                  Check in
                </button>
                <button
                  onClick={() => actions.updateStayNote(stay.id, `${stay.notes} Guest sent pre-arrival text and room was pre-blocked.`)}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60"
                >
                  Log pre-arrival text
                </button>
              </>
            )}
          />

          <Section
            title="Departing / at-risk"
            items={departing}
            renderActions={(stay) => (
              <>
                <button
                  onClick={() => actions.updateStayStatus(stay.id, "checked_out")}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                >
                  Check out
                </button>
                <button
                  onClick={() => actions.updateStayNote(stay.id, `${stay.notes} Front desk sent checkout reminder and coordinated with housekeeping.`)}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60"
                >
                  Send checkout reminder
                </button>
                <button
                  onClick={() => actions.createRequest({
                    id: `req-checkout-${stay.id}`,
                    room: stay.room,
                    guestName: stay.guestName,
                    stayId: stay.id,
                    kind: "front_desk",
                    title: "Checkout follow-up",
                    detail: `Guest departure for room ${stay.room} needs desk follow-through before room release.`,
                    assignedTo: "Front desk",
                    status: "needs_approval",
                    resolutionState: "new",
                    routeTeam: "Front desk",
                    sla: "5 min acknowledgment · 15 min decision",
                    priority: "high",
                    waitMinutes: 0,
                    source: "desk workflow",
                  }, [
                    { type: "system", text: "Checkout follow-up created from arrivals/departures board.", at: "Now" },
                  ])}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60"
                >
                  Create desk follow-up
                </button>
              </>
            )}
          />

          <Section
            title="In house watchlist"
            items={inHouse}
            renderActions={(stay) => (
              <>
                <button
                  onClick={() => actions.updateStayNote(stay.id, `${stay.notes} Guest satisfaction check sent by text.`)}
                  className="rounded-full bg-[#f7f1e8] px-3 py-1 text-xs font-medium text-[#1C1A16]"
                >
                  Send satisfaction check
                </button>
                <Link href="/hotel/guest-requests" className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60">
                  Open guest inbox
                </Link>
              </>
            )}
          />
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  items,
  renderActions,
}: {
  title: string;
  items: { id: string; room: string; guestName: string; status: string; eta: string; nights: number; notes: string; source: string }[];
  renderActions: (stay: { id: string; room: string; guestName: string; status: string; eta: string; nights: number; notes: string; source: string }) => ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</div>
      <div className="mt-4 space-y-3">
        {items.map((stay) => (
          <div key={stay.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm shadow-slate-200/30">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-[#17202B]">Room {stay.room} · {stay.guestName}</div>
                <div className="mt-1 text-xs text-slate-500">{stay.source} · ETA {stay.eta} · {stay.nights} night stay</div>
              </div>
              <HotelStatusPill tone={stay.status === "checked_out" ? "resolved" : stay.status === "departing" ? "queued" : stay.status === "arriving" ? "high" : "normal"}>
                {stay.status.replace("_", " ")}
              </HotelStatusPill>
            </div>
            <div className="mt-3 text-sm leading-6 text-black/60">{stay.notes}</div>
            <div className="mt-4 flex flex-wrap gap-2">{renderActions(stay)}</div>
          </div>
        ))}
        {items.length === 0 ? <div className="rounded-2xl border border-dashed border-black/10 px-4 py-6 text-sm text-black/45">Nothing in this bucket right now.</div> : null}
      </div>
    </div>
  );
}
