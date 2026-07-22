"use client";

import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelInspectionsPage() {
  const { state, actions, loaded } = useHotelDemoState();

  const chipBase = "inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700";
  const actionChip = "inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700";

  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Room inspections"
          body="QA the room turn before it goes back into sellable inventory. Catch missed amenities, cleanliness issues, damage, and setup problems before the next guest does."
          action={<div className={chipBase}>{state.inspections.filter((item) => item.status !== "passed").length} rooms need QA</div>}
        />

        <div className="space-y-3">
          {state.inspections.map((item) => (
            <div key={item.id} className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-[#1C1A16]">Room {item.room} · {item.checklist}</div>
                  <div className="mt-1 text-xs text-black/45">Inspector: {item.inspector}</div>
                  <div className="mt-2 text-xs text-black/35">{item.note}</div>
                </div>
                <HotelStatusPill tone={item.status === "passed" ? "resolved" : item.status === "failed" ? "urgent" : item.status === "in_progress" ? "high" : "queued"}>
                  {item.status}
                </HotelStatusPill>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.status === "pending" ? (
                  <button
                    onClick={() => actions.updateInspectionStatus(item.id, "in_progress")}
                    className={actionChip}
                  >
                    Start inspection
                  </button>
                ) : null}
                {item.status !== "passed" ? (
                  <button
                    onClick={() => {
                      actions.updateInspectionStatus(item.id, "passed");
                      actions.updateRoomStatus(item.room, "ready");
                      actions.updateRoomNote(item.room, "Inspected and cleared for next arrival.");
                    }}
                    className={actionChip}
                  >
                    Pass room
                  </button>
                ) : null}
                {item.status !== "failed" ? (
                  <button
                    onClick={() => {
                      actions.updateInspectionStatus(item.id, "failed");
                      actions.updateRoomStatus(item.room, "queued");
                      actions.updateRoomNote(item.room, "Inspection failed; room sent back for correction.");
                    }}
                    className={actionChip}
                  >
                    Fail and send back
                  </button>
                ) : null}
                <button
                  onClick={() => actions.updateInspectionNote(item.id, `${item.note} Inspector added photo notes and pinged housekeeping by text.`)}
                  className={actionChip}
                >
                  Add QA note
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
