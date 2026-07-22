"use client";

import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelHousekeepingPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  const rooms = state.rooms.filter((room) => ["dirty", "inspection", "queued", "occupied"].includes(room.status));

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Housekeeping board"
          body="Room turns, restocks, inspections, damage photos, and room-ready updates all live here."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {rooms.map((room) => (
            <div key={room.room} className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">Room {room.room}</div>
              <div className="mt-2 text-lg font-semibold text-[#1C1A16]">{room.note}</div>
              <div className="mt-2 text-sm text-black/55">{room.type} · Owner: {room.owner}</div>
              <div className="mt-4">
                <HotelStatusPill tone={room.status === "inspection" ? "queued" : room.status === "ready" ? "resolved" : room.status === "maintenance" ? "high" : "normal"}>
                  {room.status}
                </HotelStatusPill>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {room.status !== "inspection" ? (
                  <button
                    onClick={() => actions.updateRoomStatus(room.room, "inspection")}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    Mark cleaned
                  </button>
                ) : null}
                {room.status !== "ready" ? (
                  <button
                    onClick={() => actions.updateRoomStatus(room.room, "ready")}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    Mark ready
                  </button>
                ) : null}
                <button
                  onClick={() => actions.updateRoomNote(room.room, `Restocked and checked at ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`)}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60"
                >
                  Add restock note
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
