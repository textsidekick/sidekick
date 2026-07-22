"use client";

import Link from "next/link";
import { HotelPageHeader } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelShiftBoardPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  const frontDeskHandoff = [
    ...state.stays
      .filter((stay) => stay.status === "arriving" || stay.status === "departing")
      .slice(0, 3)
      .map((stay) => `${stay.guestName} in room ${stay.room} is ${stay.status.replace("_", " ")} and needs desk coordination.`),
    ...state.requests
      .filter((request) => request.kind === "front_desk" || request.status === "needs_approval")
      .slice(0, 2)
      .map((request) => `Room ${request.room}: ${request.title} is waiting on a desk decision.`),
  ].slice(0, 4);

  const housekeepingHandoff = [
    ...state.rooms
      .filter((room) => ["dirty", "inspection", "queued"].includes(room.status))
      .slice(0, 3)
      .map((room) => `Room ${room.room} is ${room.status} — ${room.note}`),
    ...state.deepCleanItems
      .filter((item) => item.status !== "completed")
      .slice(0, 2)
      .map((item) => `Deep clean ${item.room}: ${item.reason}.`),
  ].slice(0, 4);

  const maintenanceHandoff = [
    ...state.requests
      .filter((request) => request.kind === "maintenance" && request.status !== "resolved")
      .slice(0, 2)
      .map((request) => `Room ${request.room}: ${request.detail}`),
    ...state.outOfOrderItems
      .filter((item) => item.status !== "released")
      .slice(0, 2)
      .map((item) => `Room ${item.room} is ${item.status} due to ${item.issue}.`),
  ].slice(0, 4);

  const guestSupportHandoff = [
    ...state.serviceCases
      .filter((item) => item.status !== "closed")
      .slice(0, 2)
      .map((item) => `${item.guestName} in room ${item.room}: ${item.issue}`),
    ...state.requests
      .filter((request) => request.resolutionState === "awaiting_verification" || request.priority === "urgent")
      .slice(0, 2)
      .map((request) => `Room ${request.room} needs guest follow-up on ${request.title}.`),
  ].slice(0, 4);

  const generatedHandoff = {
    "Front desk": frontDeskHandoff,
    Housekeeping: housekeepingHandoff,
    Maintenance: maintenanceHandoff,
    "Guest support": guestSupportHandoff,
  } as const;

  const shiftSnapshot = [
    `${state.stays.filter((stay) => stay.status === "arriving").length} arrivals still in play`,
    `${state.stays.filter((stay) => stay.status === "departing").length} departures still in play`,
    `${state.requests.filter((request) => request.status === "needs_approval").length} desk decisions waiting`,
    `${state.rooms.filter((room) => ["dirty", "inspection", "maintenance", "queued"].includes(room.status)).length} rooms not yet fully ready`,
  ];

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px]">
        <div>
          <HotelPageHeader
            title="Shift board"
            body="A hotel-specific handoff view for front desk, housekeeping, maintenance, and guest support."
          />
          <div className="mb-6 rounded-3xl border border-[#eadfce] bg-[linear-gradient(180deg,#fffdfa_0%,#faf5ee_100%)] p-5 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">Shift snapshot</div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {shiftSnapshot.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">{item}</div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-black/8 bg-white shadow-sm">
            {state.shiftBoard.map((item) => (
              <div key={item.team} className="border-b border-black/5 px-5 py-5 last:border-b-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="min-w-[120px] text-sm font-semibold text-[#1C1A16]">{item.team}</div>
                    <div className="mt-2 text-sm leading-6 text-black/55">{item.note}</div>
                  </div>
                  <button
                    onClick={() => actions.updateShiftNote(item.team, `${item.note} Handoff note confirmed.`)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Confirm handoff
                  </button>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/35">Generated handoff priorities</div>
                  <div className="mt-3 space-y-2">
                    {(generatedHandoff[item.team as keyof typeof generatedHandoff] || []).length ? (
                      (generatedHandoff[item.team as keyof typeof generatedHandoff] || []).map((priority) => (
                        <div key={priority} className="rounded-2xl border border-black/6 bg-white px-4 py-3 text-sm text-black/65">
                          {priority}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-black/6 bg-white px-4 py-3 text-sm text-black/50">
                        No active handoff risks right now.
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        const priorities = generatedHandoff[item.team as keyof typeof generatedHandoff] || [];
                        if (!priorities.length) return;
                        actions.updateShiftNote(item.team, `${item.note} Priority handoff: ${priorities.join(" ")}`);
                      }}
                      className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                    >
                      Append generated handoff
                    </button>
                    <Link href="/hotel" className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-black/60">
                      View ops overview
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm self-start">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">On shift now</div>
          <div className="mt-4 space-y-3">
            {state.staff.map((person) => (
              <div key={person.name} className="rounded-2xl border border-black/6 bg-[#fffdfa] px-4 py-3">
                <div className="text-sm font-semibold text-[#1C1A16]">{person.name}</div>
                <div className="mt-1 text-xs text-black/45">{person.team} · {person.shift}</div>
                <div className="mt-1 text-xs text-black/35">{person.phone}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
