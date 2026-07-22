"use client";

import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelLaundryPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Laundry board"
          body="Track linen and towel turnaround so housekeeping can release rooms on time, protect guest comfort stock, and catch vendor delays before arrivals stack up."
          action={<div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">{state.laundryItems.filter((item) => item.status !== "delivered").length} active laundry gaps</div>}
        />

        <div className="space-y-3">
          {state.laundryItems.map((item) => (
            <div key={item.id} className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">Par: {item.par}</div>
                  <div className="mt-2 text-lg font-semibold text-[#1C1A16]">{item.item}</div>
                  <div className="mt-1 text-xs text-black/45">Owner: {item.owner}</div>
                </div>
                <HotelStatusPill tone={item.status === "delivered" ? "resolved" : item.status === "washing" ? "queued" : "high"}>{item.status}</HotelStatusPill>
              </div>
              <div className="mt-4 rounded-2xl bg-[#fffdfa] px-4 py-3 text-sm leading-6 text-black/60">{item.note}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.status === "queued" ? (
                  <button
                    onClick={() => actions.updateLaundryStatus(item.id, "washing")}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    Start wash cycle
                  </button>
                ) : null}
                {item.status !== "delivered" ? (
                  <button
                    onClick={() => actions.updateLaundryStatus(item.id, "delivered")}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    Mark delivered
                  </button>
                ) : null}
                <button
                  onClick={() => actions.updateLaundryNote(item.id, `${item.note} Laundry follow-up note added.`)}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60"
                >
                  Add linen note
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
