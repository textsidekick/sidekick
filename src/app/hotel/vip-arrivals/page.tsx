"use client";

import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelVipArrivalsPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="VIP arrivals"
          body="Coordinate repeat guests, high-value stays, and personalized welcome prep so preferences, amenities, and room-readiness details do not fall through the cracks."
          action={<div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">{state.vipArrivalItems.filter((item) => item.status !== "welcomed").length} arrivals in prep</div>}
        />

        <div className="space-y-3">
          {state.vipArrivalItems.map((item) => (
            <div key={item.id} className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">Room {item.room} · {item.arrival}</div>
                  <div className="mt-2 text-lg font-semibold text-[#1C1A16]">{item.guestName}</div>
                  <div className="mt-1 text-xs text-black/45">Owner: {item.owner}</div>
                </div>
                <HotelStatusPill tone={item.status === "welcomed" ? "resolved" : item.status === "ready" ? "queued" : "high"}>{item.status}</HotelStatusPill>
              </div>
              <div className="mt-4 rounded-2xl bg-[#fffdfa] px-4 py-3 text-sm leading-6 text-black/60">{item.note}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.status === "prepping" ? (
                  <button
                    onClick={() => actions.updateVipArrivalStatus(item.id, "ready")}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    Mark room ready
                  </button>
                ) : null}
                {item.status !== "welcomed" ? (
                  <button
                    onClick={() => actions.updateVipArrivalStatus(item.id, "welcomed")}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    Mark guest welcomed
                  </button>
                ) : null}
                <button
                  onClick={() => actions.updateVipArrivalNote(item.id, `${item.note} Arrival-prep note added.`)}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60"
                >
                  Add preference note
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
