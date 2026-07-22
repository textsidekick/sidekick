"use client";

import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelParkingPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Parking board"
          body="Front-desk vehicle workflows: oversized vehicles, EV charging access, plate capture, and lot exceptions that can quickly spill into service recovery or safety issues."
          action={<div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">{state.parkingItems.filter((item) => item.status !== "cleared").length} active parking issues</div>}
        />

        <div className="space-y-3">
          {state.parkingItems.map((item) => (
            <div key={item.id} className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">Room {item.room} · {item.location}</div>
                  <div className="mt-2 text-lg font-semibold text-[#1C1A16]">{item.guestName} · {item.vehicle}</div>
                  <div className="mt-1 text-xs text-black/45">Owner: {item.owner}</div>
                </div>
                <HotelStatusPill tone={item.status === "escalated" ? "urgent" : item.status === "pending" ? "queued" : "resolved"}>{item.status}</HotelStatusPill>
              </div>
              <div className="mt-4 rounded-2xl bg-[#fffdfa] px-4 py-3 text-sm leading-6 text-black/60">{item.note}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.status !== "cleared" ? (
                  <button
                    onClick={() => actions.updateParkingStatus(item.id, "cleared")}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    Mark cleared
                  </button>
                ) : null}
                {item.status === "pending" ? (
                  <button
                    onClick={() => actions.updateParkingStatus(item.id, "escalated")}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    Escalate to manager
                  </button>
                ) : null}
                <button
                  onClick={() => actions.updateParkingNote(item.id, `${item.note} Plate confirmed and guest comms updated.`)}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60"
                >
                  Add parking note
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
