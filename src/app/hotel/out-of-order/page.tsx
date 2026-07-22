"use client";

import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelOutOfOrderPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Out-of-order rooms"
          body="Coordinate blocked inventory, repair progress, cleaning follow-through, and room re-release so maintenance losses and desk sell-outs stay visible in one place."
          action={<div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">{state.outOfOrderItems.filter((item) => item.status !== "released").length} rooms out of order</div>}
        />

        <div className="space-y-3">
          {state.outOfOrderItems.map((item) => (
            <div key={item.id} className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">Room {item.room} · Revenue at risk {item.revenueAtRisk}</div>
                  <div className="mt-2 text-lg font-semibold text-[#1C1A16]">{item.issue}</div>
                  <div className="mt-1 text-xs text-black/45">Owner: {item.owner}</div>
                </div>
                <HotelStatusPill tone={item.status === "released" ? "resolved" : item.status === "repairing" ? "queued" : "high"}>{item.status}</HotelStatusPill>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">{item.note}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.status === "blocked" ? (
                  <button
                    onClick={() => actions.updateOutOfOrderStatus(item.id, "repairing")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Start repair
                  </button>
                ) : null}
                {item.status !== "released" ? (
                  <button
                    onClick={() => actions.updateOutOfOrderStatus(item.id, "released")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Reopen inventory
                  </button>
                ) : null}
                <button
                  onClick={() => actions.updateOutOfOrderNote(item.id, `${item.note} Out-of-order follow-up note added.`)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Add blocker note
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
