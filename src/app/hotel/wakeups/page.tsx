"use client";

import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelWakeupsPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Wake-up calls"
          body="Front-desk morning follow-through for guest wake-up requests, backup texts, shuttle departures, and early-flight handoff quality."
          action={<div className="rounded-full bg-[#f7f1e8] px-4 py-2 text-sm font-medium text-black/60">{state.wakeupItems.filter((item) => item.status !== "completed").length} active wake-ups</div>}
        />

        <div className="space-y-3">
          {state.wakeupItems.map((item) => (
            <div key={item.id} className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">Room {item.room} · {item.when}</div>
                  <div className="mt-2 text-lg font-semibold text-[#1C1A16]">{item.guestName}</div>
                  <div className="mt-1 text-xs text-black/45">Owner: {item.owner}</div>
                </div>
                <HotelStatusPill tone={item.status === "completed" ? "resolved" : item.status === "confirmed" ? "queued" : "high"}>{item.status}</HotelStatusPill>
              </div>
              <div className="mt-4 rounded-2xl bg-[#fffdfa] px-4 py-3 text-sm leading-6 text-black/60">{item.note}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.status === "scheduled" ? (
                  <button
                    onClick={() => actions.updateWakeupStatus(item.id, "confirmed")}
                    className="rounded-full bg-[#f7f1e8] px-3 py-1 text-xs font-medium text-[#1C1A16]"
                  >
                    Confirm backup text
                  </button>
                ) : null}
                {item.status !== "completed" ? (
                  <button
                    onClick={() => actions.updateWakeupStatus(item.id, "completed")}
                    className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                  >
                    Mark completed
                  </button>
                ) : null}
                <button
                  onClick={() => actions.updateWakeupNote(item.id, `${item.note} Morning follow-up note added.`)}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60"
                >
                  Add wake-up note
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
