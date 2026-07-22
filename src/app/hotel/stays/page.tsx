"use client";

import type { ReactNode } from "react";
import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelStaysPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  const arriving = state.stays.filter((stay) => stay.status === "arriving");
  const departing = state.stays.filter((stay) => stay.status === "departing");
  const inHouse = state.stays.filter((stay) => stay.status === "checked_in");

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <HotelPageHeader
          title="Arrivals & departures"
          body="Front desk control center for check-ins, departures, late checkout pressure, and guests who need proactive outreach before they show up."
          action={<div className="rounded-full bg-[#f7f1e8] px-4 py-2 text-sm font-medium text-black/60">{arriving.length} arriving · {departing.length} departing</div>}
        />

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
    <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">{title}</div>
      <div className="mt-4 space-y-3">
        {items.map((stay) => (
          <div key={stay.id} className="rounded-2xl border border-black/6 bg-[#fffdfa] px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-[#1C1A16]">Room {stay.room} · {stay.guestName}</div>
                <div className="mt-1 text-xs text-black/45">{stay.source} · ETA {stay.eta} · {stay.nights} night stay</div>
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
