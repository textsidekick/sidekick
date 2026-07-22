"use client";

import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

const ROOM_STATUSES = ["ready", "dirty", "inspection", "maintenance", "occupied", "queued"];

export default function HotelRoomsPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <HotelPageHeader
          title="Room board"
          body="Live room readiness across cleaning, inspection, maintenance, occupancy, and damage review."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {state.rooms.map((room) => (
            <div key={room.room} className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">Room {room.room}</div>
                  <div className="mt-1 text-lg font-semibold text-[#1C1A16]">{room.type}</div>
                </div>
                <HotelStatusPill tone={room.status === "maintenance" ? "high" : room.status === "ready" ? "resolved" : room.status === "inspection" || room.status === "queued" ? "queued" : "normal"}>
                  {room.status}
                </HotelStatusPill>
              </div>
              <div className="mt-4 text-sm font-medium text-[#1C1A16]">{room.note}</div>
              <div className="mt-2 text-sm text-black/50">Owner: {room.owner}</div>
              <div className="mt-4">
                <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/35">Set status</label>
                <select
                  value={room.status}
                  onChange={(e) => actions.updateRoomStatus(room.room, e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-[#fffdfa] px-3 py-2 text-sm text-[#1C1A16] outline-none"
                >
                  {ROOM_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
