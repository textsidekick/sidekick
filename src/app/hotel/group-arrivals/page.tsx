"use client";

import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelGroupArrivalsPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Group arrivals"
          body="Coordinate team blocks, wedding parties, and crew stays so keys, room blocks, breakfast plans, and special logistics are staged before the lobby gets slammed."
          action={<div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">{state.groupArrivalItems.filter((item) => item.status !== "checked_in").length} active group arrivals</div>}
        />

        <div className="space-y-3">
          {state.groupArrivalItems.map((item) => (
            <div key={item.id} className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">{item.rooms} · {item.arrival}</div>
                  <div className="mt-2 text-lg font-semibold text-[#1C1A16]">{item.groupName}</div>
                  <div className="mt-1 text-xs text-black/45">Owner: {item.owner}</div>
                </div>
                <HotelStatusPill tone={item.status === "checked_in" ? "resolved" : item.status === "staged" ? "queued" : "high"}>{item.status}</HotelStatusPill>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">{item.note}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.status === "planning" ? (
                  <button
                    onClick={() => actions.updateGroupArrivalStatus(item.id, "staged")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Stage arrival packet
                  </button>
                ) : null}
                {item.status !== "checked_in" ? (
                  <button
                    onClick={() => actions.updateGroupArrivalStatus(item.id, "checked_in")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Mark group checked in
                  </button>
                ) : null}
                <button
                  onClick={() => actions.updateGroupArrivalNote(item.id, `${item.note} Group coordination note added.`)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Add group note
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
