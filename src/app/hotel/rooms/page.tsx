"use client";

import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

const roomToneMap: Record<string, "urgent" | "high" | "normal" | "resolved" | "queued"> = {
  maintenance: "urgent",
  dirty: "high",
  inspection: "queued",
  queued: "queued",
  occupied: "normal",
  ready: "resolved",
};

const roomLabelMap: Record<string, string> = {
  maintenance: "Maintenance",
  dirty: "Dirty",
  inspection: "Inspection",
  queued: "Queued",
  occupied: "Occupied",
  ready: "Available",
};

export default function HotelRoomsPage() {
  const { state, loaded } = useHotelDemoState();

  if (!loaded) return null;

  const rooms = [...state.rooms].sort((a, b) => a.room.localeCompare(b.room, undefined, { numeric: true }));
  const openRequests = state.requests.filter((request) => request.status !== "resolved");
  const roomRequestMap = new Map(
    openRequests
      .filter((request) => /^\d+$/.test(request.room))
      .map((request) => [request.room, request]),
  );

  const summary = [
    { label: "Available", value: rooms.filter((room) => room.status === "ready").length },
    { label: "Occupied", value: rooms.filter((room) => room.status === "occupied").length },
    { label: "Not ready", value: rooms.filter((room) => ["dirty", "inspection", "queued"].includes(room.status)).length },
    { label: "Maintenance", value: rooms.filter((room) => room.status === "maintenance").length },
  ];

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <HotelPageHeader
          eyebrow="Rooms"
          title="Room board"
          body="One simple inventory view: what is sellable, what is occupied, and what is blocking a room from being used."
          action={<div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">{state.property.roomCount} rooms</div>}
        />

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summary.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</div>
                <div className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#17202B]">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Inventory</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#17202B]">All rooms</h2>
              <p className="mt-2 text-sm text-slate-600">Keep this dense and simple so a non-technical manager can scan it fast.</p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {rooms.map((room) => {
              const request = roomRequestMap.get(room.room);
              const stay = state.stays.find((item) => item.room === room.room && item.status !== "checked_out");
              return (
                <div key={room.room} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-[#17202B]">Room {room.room}</div>
                      <div className="text-xs text-slate-500">{stay ? stay.guestName : room.type}</div>
                    </div>
                    <HotelStatusPill tone={roomToneMap[room.status] || "normal"}>{roomLabelMap[room.status] || room.status}</HotelStatusPill>
                  </div>
                  <div className="mt-2 line-clamp-2 text-sm text-[#1C1A16]">{request ? request.title : room.note}</div>
                  <div className="mt-1 text-xs text-slate-500">{room.owner}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
