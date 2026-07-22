"use client";

import Link from "next/link";
import { BedDouble, ConciergeBell, DoorOpen, Wrench } from "lucide-react";
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

export default function HotelOverviewPage() {
  const { state, loaded } = useHotelDemoState();

  if (!loaded) return null;

  const rooms = [...state.rooms].sort((a, b) => a.room.localeCompare(b.room, undefined, { numeric: true }));
  const availableRooms = rooms.filter((room) => room.status === "ready");
  const occupiedRooms = rooms.filter((room) => room.status === "occupied");
  const cleaningRooms = rooms.filter((room) => room.status === "dirty" || room.status === "inspection" || room.status === "queued");
  const maintenanceRooms = rooms.filter((room) => room.status === "maintenance");
  const arrivals = state.stays.filter((stay) => stay.status === "arriving");
  const lateCheckoutRequests = state.requests.filter(
    (request) => request.status !== "resolved" && request.title.toLowerCase().includes("checkout"),
  );
  const openRequests = state.requests.filter((request) => request.status !== "resolved");
  const roomRequestMap = new Map(
    openRequests
      .filter((request) => /^\d+$/.test(request.room))
      .map((request) => [request.room, request]),
  );

  const priorityItems = [
    ...maintenanceRooms.map((room) => ({
      id: `room-${room.room}`,
      label: `Room ${room.room}`,
      title: room.note,
      detail: `Owner: ${room.owner}`,
      tone: "urgent" as const,
      href: "/hotel/maintenance",
    })),
    ...state.requests
      .filter((request) => request.status !== "resolved")
      .sort((a, b) => b.waitMinutes - a.waitMinutes)
      .slice(0, 4)
      .map((request) => ({
        id: request.id,
        label: request.room.startsWith("Room") ? request.room : `Room ${request.room}`,
        title: request.title,
        detail: `${request.waitMinutes} min waiting · ${request.assignedTo}`,
        tone: request.priority === "urgent" ? "urgent" as const : request.status === "needs_approval" ? "queued" as const : "high" as const,
        href: request.kind === "maintenance" ? "/hotel/maintenance" : "/hotel/guest-requests",
      })),
  ].slice(0, 5);

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <HotelPageHeader
          eyebrow="Hotel overview"
          title={state.property.name}
          body="Keep this simple: room availability, rooms that need work, and the few guest issues that cannot wait."
          action={
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              {state.property.roomCount} rooms · {state.property.occupancyPct}% occupied
            </div>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500"><DoorOpen className="h-4 w-4" /> Available now</div>
            <div className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#17202B]">{availableRooms.length}</div>
            <div className="mt-1 text-xs text-slate-500">Rooms ready to sell</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500"><BedDouble className="h-4 w-4" /> Occupied</div>
            <div className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#17202B]">{occupiedRooms.length}</div>
            <div className="mt-1 text-xs text-slate-500">Rooms with guests in house</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500"><ConciergeBell className="h-4 w-4" /> Needs service</div>
            <div className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#17202B]">{cleaningRooms.length}</div>
            <div className="mt-1 text-xs text-slate-500">Cleaning, inspection, or queued rooms</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500"><Wrench className="h-4 w-4" /> Out with maintenance</div>
            <div className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#17202B]">{maintenanceRooms.length}</div>
            <div className="mt-1 text-xs text-slate-500">Rooms blocked by repairs</div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_360px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Room board</div>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#17202B]">All rooms and availability</h2>
                <p className="mt-2 text-sm text-slate-600">This should be the main thing a small hotel checks: what is open, what is occupied, and what is blocking a room from being sold.</p>
              </div>
              <Link href="/hotel/rooms" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Open room board
              </Link>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {rooms.map((room) => (
                <div key={room.room} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  {(() => {
                    const request = roomRequestMap.get(room.room);
                    const stay = state.stays.find((item) => item.room === room.room && item.status !== "checked_out");
                    return (
                      <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-[#17202B]">Room {room.room}</div>
                      <div className="text-xs text-slate-500">{room.type}{stay ? ` · ${stay.guestName}` : ""}</div>
                    </div>
                    <HotelStatusPill tone={roomToneMap[room.status] || "normal"}>{roomLabelMap[room.status] || room.status}</HotelStatusPill>
                  </div>
                  <div className="mt-3 text-sm text-[#1C1A16]">{room.note}</div>
                  {request ? <div className="mt-2 text-xs font-medium text-slate-600">Issue: {request.title}</div> : null}
                  <div className="mt-2 text-xs text-slate-500">Owner: {room.owner}</div>
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Today</div>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#17202B]">Arrivals and turnover exceptions</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Arrivals</div>
                  <div className="mt-2 space-y-2">
                    {arrivals.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">No arrivals in play.</div> : arrivals.slice(0, 4).map((stay) => (
                      <div key={stay.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                        <div className="text-sm font-semibold text-[#1C1A16]">{stay.guestName} · Room {stay.room}</div>
                        <div className="mt-1 text-xs text-slate-500">ETA {stay.eta} · {stay.notes}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Turnover exceptions</div>
                  <div className="mt-2 space-y-2">
                    {lateCheckoutRequests.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">No turnover exceptions right now.</div> : lateCheckoutRequests.slice(0, 4).map((request) => (
                      <div key={request.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                        <div className="text-sm font-semibold text-[#1C1A16]">Room {request.room} · {request.title}</div>
                        <div className="mt-1 text-xs text-slate-500">{request.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Needs attention now</div>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#17202B]">Only the urgent stuff</h2>
              <div className="mt-4 space-y-3">
                {priorityItems.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">Nothing urgent right now.</div>
                ) : (
                  priorityItems.map((item) => (
                    <Link key={item.id} href={item.href} className="block rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 hover:bg-slate-50">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-[#1C1A16]">{item.label} · {item.title}</div>
                          <div className="mt-1 text-xs text-slate-500">{item.detail}</div>
                        </div>
                        <HotelStatusPill tone={item.tone}>{item.tone === "urgent" ? "Urgent" : item.tone === "queued" ? "Queued" : "Open"}</HotelStatusPill>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Team</div>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#17202B]">All staff on the board</h2>
              <div className="mt-4 space-y-2">
                {state.staff.map((person) => (
                  <div key={person.phone} className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                    <div className="text-sm font-semibold text-[#1C1A16]">{person.name}</div>
                    <div className="mt-1 text-xs text-slate-500">{person.team} · {person.shift}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Quick links</div>
              <div className="mt-4 grid gap-3">
                <Link href="/hotel/guest-requests" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">Guest requests</Link>
                <Link href="/hotel/housekeeping" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">Housekeeping</Link>
                <Link href="/hotel/front-desk" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">Front desk</Link>
                <Link href="/hotel/maintenance" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">Maintenance</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
