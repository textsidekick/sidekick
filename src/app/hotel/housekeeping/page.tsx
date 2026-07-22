"use client";

import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelHousekeepingPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  const rooms = state.rooms.filter((room) => ["dirty", "inspection", "queued", "occupied"].includes(room.status));

  function markRoomReady(roomNumber: string) {
    actions.updateRoomStatus(roomNumber, "ready");
    actions.updateRoomNote(roomNumber, `Cleaned and guest-ready at ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`);
    actions.updateRoomOwner(roomNumber, "Housekeeping complete");

    const linkedRequest = state.requests.find(
      (request) => request.room === roomNumber && request.status !== "resolved",
    );

    if (linkedRequest) {
      actions.addTimelineEvent(linkedRequest.id, {
        type: "staff",
        text: `Housekeeping marked Room ${roomNumber} clean and ready.`,
        at: "Now",
      });
      actions.addTimelineEvent(linkedRequest.id, {
        type: "ai",
        text: "Your room is ready now. You can head over whenever you're set, and if you need anything else just text Sidekick here.",
        at: "Now",
      });
      actions.updateRequestStatus(linkedRequest.id, "resolved");
      actions.updateRequestWorkflow(linkedRequest.id, {
        resolutionState: "closed",
        triageStatus: "approved",
        dispatcher: "Sidekick",
      });
    }
  }

  const primaryButton = "inline-flex items-center justify-center rounded-xl bg-[#343A40] px-3 py-2 text-xs font-semibold text-white hover:bg-[#2B3035]";
  const secondaryButton = "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50";

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Housekeeping via text"
          body="Housekeepers should be able to text things like ‘started room 304’ or ‘finished room 304.’ Sidekick updates the room board and can notify the guest automatically when the room is ready."
        />
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Simple workflow</div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">1. Housekeeper texts Sidekick from the field</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">2. Sidekick updates room status and keeps the work visible</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">3. Sidekick updates the guest when the room is ready</div>
          </div>
        </div>
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
                    Move to inspection
                  </button>
                ) : null}
                {room.status !== "ready" ? (
                  <button
                    onClick={() => markRoomReady(room.room)}
                    className={secondaryButton}
                  >
                    Mark ready
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
