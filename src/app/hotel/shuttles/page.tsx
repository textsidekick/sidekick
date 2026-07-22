"use client";

import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelShuttlesPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Shuttle board"
          body="Front-desk transportation coordination for airport pickups, conference shuttle runs, and departure rides that can quickly turn into service recovery if missed."
          action={<div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">{state.shuttleItems.filter((item) => item.status !== "completed").length} active rides</div>}
        />

        <div className="space-y-3">
          {state.shuttleItems.map((item) => (
            <div key={item.id} className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">Room {item.room}</div>
                  <div className="mt-2 text-lg font-semibold text-[#1C1A16]">{item.guestName} · {item.trip}</div>
                  <div className="mt-1 text-xs text-black/45">Owner: {item.owner}</div>
                </div>
                <HotelStatusPill tone={item.status === "completed" ? "resolved" : item.status === "confirmed" ? "queued" : "high"}>{item.status}</HotelStatusPill>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">{item.note}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.status === "scheduled" ? (
                  <button
                    onClick={() => actions.updateShuttleStatus(item.id, "confirmed")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Confirm driver
                  </button>
                ) : null}
                {item.status !== "completed" ? (
                  <button
                    onClick={() => actions.updateShuttleStatus(item.id, "completed")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Mark ride complete
                  </button>
                ) : null}
                <button
                  onClick={() => actions.updateShuttleNote(item.id, `${item.note} Transportation follow-up note added.`)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Add transport note
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
