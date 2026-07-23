"use client";

import { useMemo, useState } from "react";
import { HotelPageHeader, HotelMetric, HotelSourcePill, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";
import { maintenanceIssues, operationsRows } from "@/lib/hotel-demo-view";

const taskRows = [
  { id: "req-111-cleaning", title: "Checkout-style cleaning entered", location: "Room 111", category: "Housekeeping", reporter: "Front desk", assigned: "Maria", department: "Housekeeping", priority: "High", status: "Assigned", created: "11:02 AM", deadline: "11:20 AM", completed: "—", guestStatus: "No guest linked", source: "Front desk entry" },
  { id: "req-118-towels", title: "Extra towels requested", location: "Room 118", category: "Guest request", reporter: "Walk-in guest", assigned: "Elena", department: "Housekeeping", priority: "Normal", status: "Assigned", created: "4:52 PM", deadline: "5:05 PM", completed: "—", guestStatus: "Waiting for update", source: "Guest SMS" },
  { id: "req-204-lamp", title: "Lamp damage photo review", location: "Room 204", category: "Damage report", reporter: "Elena", assigned: "Maya", department: "Management", priority: "High", status: "Escalated", created: "4:37 PM", deadline: "5:00 PM", completed: "—", guestStatus: "No guest linked", source: "Uploaded photo" },
  { id: "req-218-water", title: "Possible water issue near bathroom", location: "Room 218", category: "Safety", reporter: "Julio", assigned: "Julio", department: "Maintenance", priority: "Urgent", status: "Escalated", created: "5:07 PM", deadline: "Immediate", completed: "—", guestStatus: "Manager review pending", source: "Spanish voice note" },
  { id: "req-304-cleaning", title: "Room cleaning request", location: "Room 304", category: "Housekeeping", reporter: "K. Morgan", assigned: "Elena", department: "Housekeeping", priority: "Normal", status: "Guest notified", created: "12:41 PM", deadline: "1:30 PM", completed: "2:18 PM", guestStatus: "Delivered", source: "Guest SMS + staff SMS" },
  { id: "req-117-carpet", title: "Carpet stain photo awaiting classification", location: "Room 117", category: "Inspection", reporter: "Housekeeping", assigned: "Housekeeping", department: "Housekeeping", priority: "High", status: "Awaiting confirmation", created: "3:56 PM", deadline: "4:30 PM", completed: "—", guestStatus: "No guest linked", source: "Uploaded photo" },
  { id: "req-lobby-ice", title: "Ice machine offline", location: "2nd floor ice alcove", category: "Maintenance", reporter: "Maya", assigned: "Julio", department: "Maintenance", priority: "High", status: "In progress", created: "2:47 PM", deadline: "3:30 PM", completed: "—", guestStatus: "Guest-visible issue", source: "Manager entry" },
];

const lifecycle = ["Received", "Assigned", "Acknowledged", "In progress", "Completed", "Guest notified"];

export default function HotelTasksPage() {
  const { actions, loaded } = useHotelDemoState();
  const [activeId, setActiveId] = useState("req-218-water");
  const [manualTitle, setManualTitle] = useState("");
  const [manualRoom, setManualRoom] = useState("");

  const activeTask = taskRows.find((task) => task.id === activeId) || taskRows[0];
  const relatedOperation = operationsRows.find((row) => row.id === activeId);
  const relatedMaintenance = maintenanceIssues.find((issue) => issue.id === activeId);

  const metrics = useMemo(() => ([
    { label: "New", value: 1, detail: "Waiting for first human acknowledgment" },
    { label: "Assigned", value: 2, detail: "Routed but not yet acknowledged" },
    { label: "In progress", value: 2, detail: "Human work actively underway" },
    { label: "Escalated", value: 2, detail: "Needs manager or high-priority follow-up" },
  ]), []);

  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1460px]">
        <HotelPageHeader
          eyebrow="Tasks"
          title="Operational record of every request requiring human action"
          body="Sidekick creates tasks from guest and staff messages, managers can create them manually, and the full lifecycle stays visible from receipt to guest-notified closeout."
          action={<button onClick={() => {
            if (!manualTitle.trim() || !manualRoom.trim()) return;
            const id = `req-manual-${Date.now()}`;
            actions.createRequest({
              id,
              room: manualRoom.trim(),
              guestName: null,
              kind: "front_desk",
              title: manualTitle.trim(),
              detail: `Manager created a manual task for Room ${manualRoom.trim()}.`,
              assignedTo: "Front desk",
              status: "open",
              priority: "normal",
              waitMinutes: 0,
              source: "manager entry",
            }, [{ type: "system", text: "Manual task created by manager.", at: "Now" }]);
            setActiveId(id);
            setManualTitle("");
            setManualRoom("");
          }} className="rounded-[10px] bg-[#287A65] px-4 py-2 text-sm font-medium text-white">Create task</button>}
        />

        <div className="mb-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
          <input value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} placeholder="Manual task title" className="rounded-xl border border-[#E1E5E2] bg-white px-3 py-3 text-sm text-[#18222C] outline-none" />
          <input value={manualRoom} onChange={(e) => setManualRoom(e.target.value)} placeholder="Room or location" className="rounded-xl border border-[#E1E5E2] bg-white px-3 py-3 text-sm text-[#18222C] outline-none" />
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => <HotelMetric key={metric.label} label={metric.label} value={metric.value} sub={metric.detail} />)}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
          <section className="rounded-2xl border border-[#E1E5E2] bg-white p-5">
            <div className="border-b border-[#E1E5E2] pb-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Task board</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#18222C]">All tracked work</h2>
            </div>
            <div className="mt-4 space-y-3">
              {taskRows.map((task) => (
                <button key={task.id} onClick={() => setActiveId(task.id)} className={task.id === activeTask.id ? "w-full rounded-2xl border border-[#CFE4DB] bg-[#F3FBF7] p-4 text-left" : "w-full rounded-2xl border border-[#E1E5E2] bg-[#FCFCFB] p-4 text-left"}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-[#18222C]">{task.title}</div>
                      <div className="mt-1 text-xs text-[#5C6975]">{task.location} · {task.category}</div>
                      <div className="mt-2 grid gap-1 text-sm text-[#5C6975] md:grid-cols-2">
                        <div>Reporter: {task.reporter}</div>
                        <div>Assigned: {task.assigned}</div>
                        <div>Deadline: {task.deadline}</div>
                        <div>Source: {task.source}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <HotelStatusPill tone={task.priority === "Urgent" ? "urgent" : task.status === "Guest notified" ? "resolved" : task.status === "Assigned" || task.status === "Awaiting confirmation" || task.status === "Escalated" ? "queued" : "high"}>{task.status}</HotelStatusPill>
                      <div className="text-xs text-[#5C6975]">{task.priority}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#E1E5E2] bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Task detail</div>
            <h2 className="mt-2 text-xl font-semibold text-[#18222C]">{activeTask.title}</h2>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#5C6975]">
              <HotelSourcePill>{activeTask.location}</HotelSourcePill>
              <HotelSourcePill>{activeTask.department}</HotelSourcePill>
              <HotelSourcePill>{activeTask.source}</HotelSourcePill>
            </div>

            <div className="mt-4 space-y-3 text-sm text-[#5C6975]">
              <div><span className="font-semibold text-[#18222C]">Reporter:</span> {activeTask.reporter}</div>
              <div><span className="font-semibold text-[#18222C]">Response deadline:</span> {activeTask.deadline}</div>
              <div><span className="font-semibold text-[#18222C]">Guest notification:</span> {activeTask.guestStatus}</div>
              <div><span className="font-semibold text-[#18222C]">Completion time:</span> {activeTask.completed}</div>
            </div>

            <div className="mt-5 rounded-2xl border border-[#E1E5E2] bg-[#FCFCFB] p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Lifecycle</div>
              <div className="mt-3 space-y-2">
                {lifecycle.map((step) => (
                  <div key={step} className="flex items-center gap-3 rounded-xl border border-[#E1E5E2] bg-white px-3 py-2 text-sm text-[#18222C]">
                    <span className={step === activeTask.status || (step === "Guest notified" && activeTask.status === "Closed") ? "h-2 w-2 rounded-full bg-[#287A65]" : "h-2 w-2 rounded-full bg-[#D0D6DB]"} />
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {relatedOperation ? (
              <div className="mt-5 rounded-2xl border border-[#E1E5E2] bg-[#FCFCFB] p-4 text-sm text-[#5C6975]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Current coordination view</div>
                <div className="mt-2 font-semibold text-[#18222C]">{relatedOperation.location} — {relatedOperation.title}</div>
                <div className="mt-2">{relatedOperation.detail}</div>
              </div>
            ) : null}

            {relatedMaintenance ? (
              <div className="mt-5 rounded-2xl border border-[#E1E5E2] bg-[#FCFCFB] p-4 text-sm text-[#5C6975]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Suggested category and severity</div>
                <div className="mt-2"><span className="font-semibold text-[#18222C]">Category:</span> {relatedMaintenance.suggestedCategory}</div>
                <div className="mt-1"><span className="font-semibold text-[#18222C]">Severity:</span> {relatedMaintenance.suggestedSeverity}</div>
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              <button onClick={() => actions.assignRequest(activeTask.id, activeTask.assigned === "Front desk" ? "Maya" : "Front desk")} className="rounded-[10px] border border-[#E1E5E2] bg-white px-3 py-2 text-xs font-medium text-[#18222C]">Reassign</button>
              <button onClick={() => actions.updateRequest(activeTask.id, { priority: activeTask.priority === "Urgent" ? "high" : "urgent" })} className="rounded-[10px] border border-[#E1E5E2] bg-white px-3 py-2 text-xs font-medium text-[#18222C]">Change priority</button>
              <button onClick={() => { actions.updateRequest(activeTask.id, { status: "needs_approval" }); actions.updateRequestWorkflow(activeTask.id, { triageStatus: "escalated", escalationOwner: "Maya" }); }} className="rounded-[10px] border border-[#E1E5E2] bg-white px-3 py-2 text-xs font-medium text-[#18222C]">Escalate</button>
              <button onClick={() => actions.addTimelineEvent(activeTask.id, { type: "staff", text: "Manager added a follow-up note from the task panel.", at: "Now" })} className="rounded-[10px] border border-[#E1E5E2] bg-white px-3 py-2 text-xs font-medium text-[#18222C]">Add internal note</button>
              <button onClick={() => { actions.updateRequestStatus(activeTask.id, "resolved"); actions.updateRequestWorkflow(activeTask.id, { resolutionState: "closed" }); }} className="rounded-[10px] border border-[#E1E5E2] bg-white px-3 py-2 text-xs font-medium text-[#18222C]">Mark resolved</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
