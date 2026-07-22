"use client";

import Link from "next/link";
import { BedDouble, DoorOpen, Wrench } from "lucide-react";
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
  const openRequests = state.requests.filter((request) => request.status !== "resolved");
  const roomsNeedingAttention = rooms.filter((room) => room.status !== "ready" && room.status !== "occupied");
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

  const todaySummary = [
    {
      label: "Available",
      value: availableRooms.length,
      tone: "normal" as const,
    },
    {
      label: "Arrivals",
      value: arrivals.length,
      tone: "queued" as const,
    },
    {
      label: "Not ready",
      value: cleaningRooms.length,
      tone: "high" as const,
    },
    {
      label: "Maintenance",
      value: maintenanceRooms.length,
      tone: "urgent" as const,
    },
  ];

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <HotelPageHeader
          eyebrow="Hotel overview"
          title={state.property.name}
          body="A simple motel board: what is open, what needs work, and what matters today."
          action={
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              {state.property.roomCount} rooms · {state.property.occupancyPct}% occupied
            </div>
          }
        />

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {todaySummary.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</div>
                    <div className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#17202B]">{item.value}</div>
                  </div>
                  <HotelStatusPill tone={item.tone}>{item.label}</HotelStatusPill>
                </div>
              </div>
            ))}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 xl:col-span-1">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Staff on shift</div>
              <div className="mt-2 space-y-1.5">
                {state.staff.slice(0, 3).map((person) => (
                  <div key={person.phone} className="text-sm text-[#1C1A16]">
                    <span className="font-medium">{person.name}</span>
                    <span className="text-slate-500"> · {person.team}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,2.4fr)_280px]">
          <div className="self-start rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
            <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Room board</div>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#17202B]">All rooms and availability</h2>
                <p className="mt-2 text-sm text-slate-600">This is the main view. A manager should be able to glance once and know what needs attention.</p>
              </div>
              <div className="hidden text-sm text-slate-500 xl:block">{roomsNeedingAttention.length} rooms need work</div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {rooms.map((room) => (
                <div key={room.room} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
                  {(() => {
                    const request = roomRequestMap.get(room.room);
                    const stay = state.stays.find((item) => item.room === room.room && item.status !== "checked_out");
                    return (
                      <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-[#17202B]">Room {room.room}</div>
                      <div className="text-xs text-slate-500">{stay ? stay.guestName : room.type}</div>
                    </div>
                    <HotelStatusPill tone={roomToneMap[room.status] || "normal"}>{roomLabelMap[room.status] || room.status}</HotelStatusPill>
                  </div>
                  <div className="mt-2 line-clamp-2 text-sm text-[#1C1A16]">{request ? request.title : room.note}</div>
                  <div className="mt-1 text-xs text-slate-500">{room.owner}</div>
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Today</div>
              <h2 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#17202B]">Only what matters</h2>
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
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Needs attention now</div>
              <h2 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#17202B]">Urgent only</h2>
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

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Occupancy</div>
              <h2 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#17202B]">In house</h2>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <BedDouble className="h-4 w-4 text-slate-400" />
                {occupiedRooms.length} occupied · {availableRooms.length} available
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <DoorOpen className="h-4 w-4 text-slate-400" />
                {roomsNeedingAttention.length} rooms need work before they can be sold
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <Wrench className="h-4 w-4 text-slate-400" />
                {openRequests.length} open guest or maintenance issues
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
