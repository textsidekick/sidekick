"use client";

import Link from "next/link";
import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

const ROOM_STATUSES = ["ready", "dirty", "inspection", "maintenance", "occupied", "queued"];

export default function HotelRoomsPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  const blockedRooms = state.rooms.filter((room) => ["dirty", "inspection", "maintenance", "queued"].includes(room.status));
  const readyRooms = state.rooms.filter((room) => room.status === "ready");
  const maintenanceBlocked = state.rooms.filter((room) => room.status === "maintenance");
  const arrivalPressure = state.stays.filter(
    (stay) => stay.status === "arriving" && blockedRooms.some((room) => room.room === stay.room)
  );

  const readinessLanes = [
    {
      key: "sellable",
      title: "Sellable now",
      detail: "Rooms that should be ready to assign or already back in inventory.",
      items: readyRooms,
      tone: "resolved" as const,
    },
    {
      key: "turns",
      title: "Need turn / inspection",
      detail: "Rooms still being cleaned, queued, or waiting for final release.",
      items: state.rooms.filter((room) => ["dirty", "queued", "inspection"].includes(room.status)),
      tone: "queued" as const,
    },
    {
      key: "blocked",
      title: "Inventory blocked",
      detail: "Rooms not sellable because maintenance or defects are still in the way.",
      items: maintenanceBlocked,
      tone: "high" as const,
    },
  ];

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <HotelPageHeader
          title="Room readiness board"
          body="Run sellable inventory from here: what is ready now, what still needs a turn, and what is blocking arrivals or revenue."
          action={<div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">Inventory control view</div>}
        />

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <MetricCard label="Sellable now" value={readyRooms.length} detail="Rooms currently back in inventory" />
          <MetricCard label="Needs turn" value={blockedRooms.filter((room) => room.status !== "maintenance").length} detail="Still being cleaned, queued, or inspected" />
          <MetricCard label="Blocked by maintenance" value={maintenanceBlocked.length} detail="Out of inventory until engineering follow-through" />
          <MetricCard label="Arrivals at risk" value={arrivalPressure.length} detail="Incoming stays tied to rooms not yet truly ready" />
        </div>

        {arrivalPressure.length ? (
          <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm shadow-amber-100/50">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-900/70">Inventory pressure</div>
            <div className="mt-2 text-xl font-semibold tracking-[-0.03em] text-amber-950">Arrivals are waiting on room readiness</div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {arrivalPressure.map((stay) => {
                const room = state.rooms.find((item) => item.room === stay.room);
                return (
                  <div key={stay.id} className="rounded-2xl border border-amber-100 bg-white px-4 py-4 text-sm text-amber-950">
                    <div className="font-semibold">{stay.guestName} · Room {stay.room}</div>
                    <div className="mt-1 text-amber-900/75">ETA {stay.eta} · {room?.status || "unknown"}</div>
                    <div className="mt-2 text-amber-900/80">{stay.notes}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => actions.updateRoomNote(stay.room, `${room?.note || ""} Front desk escalated this room for arrival readiness.`.trim())}
                        className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-950"
                      >
                        Rush room
                      </button>
                      <Link href="/hotel/stays" className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-medium text-amber-900">
                        Open arrivals
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-3">
          {readinessLanes.map((lane) => (
            <div key={lane.key} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{lane.title}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">{lane.detail}</div>
                </div>
                <HotelStatusPill tone={lane.tone}>{lane.items.length}</HotelStatusPill>
              </div>

              <div className="mt-4 space-y-3">
                {lane.items.length ? (
                  lane.items.map((room) => {
                    const relatedStay = state.stays.find((stay) => stay.room === room.room && stay.status === "arriving");
                    return (
                      <div key={room.room} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-[#17202B]">Room {room.room}</div>
                            <div className="mt-1 text-xs text-slate-500">{room.type} · Owner: {room.owner}</div>
                          </div>
                          <HotelStatusPill tone={room.status === "maintenance" ? "high" : room.status === "ready" ? "resolved" : room.status === "inspection" || room.status === "queued" ? "queued" : "normal"}>
                            {room.status}
                          </HotelStatusPill>
                        </div>

                        <div className="mt-3 text-sm leading-6 text-slate-600">{room.note}</div>
                        {relatedStay ? (
                          <div className="mt-3 rounded-2xl border border-amber-100 bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-950">
                            <span className="font-semibold">Arrival pressure:</span> {relatedStay.guestName} due {relatedStay.eta}
                          </div>
                        ) : null}

                        <div className="mt-4 space-y-3">
                          <div>
                            <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Set status</label>
                            <select
                              value={room.status}
                              onChange={(e) => actions.updateRoomStatus(room.room, e.target.value)}
                              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#17202B] outline-none"
                            >
                              {ROOM_STATUSES.map((status) => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {room.status !== "inspection" && room.status !== "ready" ? (
                              <button
                                onClick={() => actions.updateRoomStatus(room.room, "inspection")}
                                className="rounded-full bg-[#0060F0] px-3 py-1 text-xs font-medium text-white"
                              >
                                Move to inspection
                              </button>
                            ) : null}
                            {room.status !== "ready" ? (
                              <button
                                onClick={() => actions.updateRoomStatus(room.room, "ready")}
                                className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                              >
                                Mark sellable
                              </button>
                            ) : null}
                            <button
                              onClick={() => actions.updateRoomNote(room.room, `Room reviewed at ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.`)}
                              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
                            >
                              Add review note
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">No rooms in this lane right now.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#17202B]">{value}</div>
      <div className="mt-1 text-sm leading-6 text-slate-600">{detail}</div>
    </div>
  );
}
