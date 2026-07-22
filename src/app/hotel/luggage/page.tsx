"use client";

import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelLuggagePage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Luggage hold"
          body="Front-desk bag storage for early arrivals, post-checkout holds, and secure claim-tag release before bags walk off or guest handoffs get messy."
          action={<div className="rounded-full bg-[#f7f1e8] px-4 py-2 text-sm font-medium text-black/60">{state.luggageItems.filter((item) => item.status !== "released").length} active bag holds</div>}
        />

        <div className="space-y-3">
          {state.luggageItems.map((item) => (
            <div key={item.id} className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">Room {item.room} · {item.location}</div>
                  <div className="mt-2 text-lg font-semibold text-[#1C1A16]">{item.guestName} · {item.bags}</div>
                  <div className="mt-1 text-xs text-black/45">Owner: {item.owner}</div>
                </div>
                <HotelStatusPill tone={item.status === "released" ? "resolved" : item.status === "claimed" ? "queued" : "high"}>{item.status}</HotelStatusPill>
              </div>
              <div className="mt-4 rounded-2xl bg-[#fffdfa] px-4 py-3 text-sm leading-6 text-black/60">{item.note}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.status === "stored" ? (
                  <button
                    onClick={() => actions.updateLuggageStatus(item.id, "claimed")}
                    className="rounded-full bg-[#f7f1e8] px-3 py-1 text-xs font-medium text-[#1C1A16]"
                  >
                    Verify claim tag
                  </button>
                ) : null}
                {item.status !== "released" ? (
                  <button
                    onClick={() => actions.updateLuggageStatus(item.id, "released")}
                    className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                  >
                    Release bags
                  </button>
                ) : null}
                <button
                  onClick={() => actions.updateLuggageNote(item.id, `${item.note} Front desk release note added.`)}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60"
                >
                  Add hold note
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
