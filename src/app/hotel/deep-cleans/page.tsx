"use client";

import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelDeepCleansPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Deep cleans"
          body="Preventive room resets, damage-recovery cleaning, and heavy-turn housekeeping work that sits between room quality, maintenance prevention, and sellable inventory." 
          action={<div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">{state.deepCleanItems.filter((item) => item.status !== "completed").length} active deep cleans</div>}
        />

        <div className="space-y-3">
          {state.deepCleanItems.map((item) => (
            <div key={item.id} className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">Room {item.room} · Due {item.due}</div>
                  <div className="mt-2 text-lg font-semibold text-[#1C1A16]">{item.reason}</div>
                  <div className="mt-1 text-xs text-black/45">Owner: {item.owner}</div>
                </div>
                <HotelStatusPill tone={item.status === "completed" ? "resolved" : item.status === "in_progress" ? "queued" : "high"}>{item.status}</HotelStatusPill>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">{item.note}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.status === "scheduled" ? (
                  <button
                    onClick={() => actions.updateDeepCleanStatus(item.id, "in_progress")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Start deep clean
                  </button>
                ) : null}
                {item.status !== "completed" ? (
                  <button
                    onClick={() => actions.updateDeepCleanStatus(item.id, "completed")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Mark completed
                  </button>
                ) : null}
                <button
                  onClick={() => actions.updateDeepCleanNote(item.id, `${item.note} Deep-clean follow-up note added.`)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Add quality note
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
