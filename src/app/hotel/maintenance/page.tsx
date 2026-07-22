"use client";

import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

const ASSIGNEES = ["Julio", "Front desk", "Vendor", "Night maintenance"];

export default function HotelMaintenancePage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  const issues = state.requests.filter((request) => request.kind === "maintenance");

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Maintenance queue"
          body="Maintenance should run as text-driven work: issue comes in through Sidekick, staff update the thread naturally, and the guest gets progress without the desk having to babysit it."
        />
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Maintenance workflow</div>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">1. Guest or staff texts the issue</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">2. Sidekick creates and routes the task</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">3. Staff can attach photos, videos, or voice notes</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">4. Sidekick closes the loop with the guest</div>
          </div>
        </div>
        <div className="space-y-3">
          {issues.map((issue) => (
            <div key={issue.id} className="rounded-3xl border border-black/8 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-[#1C1A16]">{issue.room} · {issue.title}</div>
                  <div className="mt-1 text-xs text-black/45">{issue.detail}</div>
                  <div className="mt-2 text-xs text-black/35">Assigned to {issue.assignedTo}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <HotelStatusPill tone={issue.priority === "urgent" ? "urgent" : issue.priority === "high" ? "high" : "normal"}>
                    {issue.priority}
                  </HotelStatusPill>
                  <div className="text-xs text-black/40">{issue.waitMinutes} min open</div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {ASSIGNEES.map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      actions.assignRequest(issue.id, name);
                      actions.updateRoomOwner(issue.room.replace(/^Room\s+/i, ""), name);
                      actions.addTimelineEvent(issue.id, { type: "system", text: `Maintenance request reassigned to ${name}.`, at: "Now" });
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Assign {name}
                  </button>
                ))}
                {issue.status !== "in_progress" ? (
                  <button
                    onClick={() => {
                      actions.updateRequestStatus(issue.id, "in_progress");
                      actions.updateRoomStatus(issue.room.replace(/^Room\s+/i, ""), "maintenance");
                      actions.addTimelineEvent(issue.id, { type: "system", text: "Repair work started.", at: "Now" });
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Start repair
                  </button>
                ) : null}
                {issue.status !== "resolved" ? (
                  <button
                    onClick={() => {
                      actions.updateRequestStatus(issue.id, "resolved");
                      actions.updateRoomStatus(issue.room.replace(/^Room\s+/i, ""), "inspection");
                      actions.updateRoomNote(issue.room.replace(/^Room\s+/i, ""), "Repair completed; waiting on final room check.");
                      actions.addTimelineEvent(issue.id, { type: "ai", text: "Maintenance completed the repair and the room is being checked.", at: "Now" });
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Mark fixed
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
