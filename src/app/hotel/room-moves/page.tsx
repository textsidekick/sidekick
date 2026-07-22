"use client";

import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelRoomMovesPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Room moves"
          body="Cross-team coordination for service recovery moves, noise complaints, maintenance relocations, and VIP swaps so the desk can recover the stay without losing operational control."
          action={<div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">{state.roomMoveItems.filter((item) => item.status !== "completed").length} active room moves</div>}
        />

        <div className="space-y-3">
          {state.roomMoveItems.map((item) => (
            <div key={item.id} className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">{item.fromRoom} → {item.toRoom}</div>
                  <div className="mt-2 text-lg font-semibold text-[#1C1A16]">{item.guestName} · {item.reason}</div>
                  <div className="mt-1 text-xs text-black/45">Owner: {item.owner}</div>
                </div>
                <HotelStatusPill tone={item.status === "completed" ? "resolved" : item.status === "coordinating" ? "queued" : "high"}>{item.status}</HotelStatusPill>
              </div>
              <div className="mt-4 rounded-2xl bg-[#fffdfa] px-4 py-3 text-sm leading-6 text-black/60">{item.note}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.status === "requested" ? (
                  <button
                    onClick={() => actions.updateRoomMoveStatus(item.id, "coordinating")}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    Start coordination
                  </button>
                ) : null}
                {item.status !== "completed" ? (
                  <button
                    onClick={() => actions.updateRoomMoveStatus(item.id, "completed")}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    Mark move complete
                  </button>
                ) : null}
                <button
                  onClick={() => actions.updateRoomMoveNote(item.id, `${item.note} Room move follow-up note added.`)}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60"
                >
                  Add move note
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
