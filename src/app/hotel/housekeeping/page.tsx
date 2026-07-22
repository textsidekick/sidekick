"use client";

import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelHousekeepingPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  const rooms = state.rooms.filter((room) => ["dirty", "inspection", "queued", "occupied"].includes(room.status));

  const primaryButton = "inline-flex items-center justify-center rounded-xl bg-[#343A40] px-3 py-2 text-xs font-semibold text-white hover:bg-[#2B3035]";
  const secondaryButton = "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50";

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
                    className={primaryButton}
                  >
                    Move To Inspection
                  </button>
                ) : null}
                {room.status !== "ready" ? (
                  <button
                    onClick={() => actions.updateRoomStatus(room.room, "ready")}
                    className={secondaryButton}
                  >
                    Mark Ready
                  </button>
                ) : null}
                <button
                  onClick={() => actions.updateRoomNote(room.room, `Restocked and checked at ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`)}
                  className={secondaryButton}
                >
                  Add Restock Note
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
