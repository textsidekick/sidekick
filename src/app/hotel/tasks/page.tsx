"use client";

import Link from "next/link";
import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelTasksPage() {
  const { state, loaded } = useHotelDemoState();

  if (!loaded) return null;

  const tasks = state.requests;
  const openTasks = tasks.filter((task) => task.status !== "resolved");
  const newTasks = openTasks.filter((task) => task.status === "new" || task.status === "needs_approval");
  const activeTasks = openTasks.filter((task) => task.status === "in_progress");
  const closedTasks = tasks.filter((task) => task.status === "resolved");

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <HotelPageHeader
          title="Tasks"
          body="Texts become tracked work. Every guest issue, housekeeping update, and maintenance request becomes a task with an owner, status, priority, and conversation history."
          action={<div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">{openTasks.length} open tasks</div>}
        />

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Task model</div>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">Created from a guest or staff text</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">Carries owner, priority, and status</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">Keeps photos, videos, voice, and thread context attached</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">Closes the loop back to the guest automatically</div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Metric label="New" value={newTasks.length} detail="Needs routing or owner confirm" />
          <Metric label="Working" value={activeTasks.length} detail="Owner is handling it" />
          <Metric label="Closed" value={closedTasks.length} detail="Loop was completed" />
          <Metric label="Urgent" value={openTasks.filter((task) => task.priority === "urgent").length} detail="Immediate attention" />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Unified task board</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#17202B]">All tracked work</h2>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
            {tasks.map((task) => {
              const tone = task.status === "resolved" ? "resolved" : task.priority === "urgent" ? "urgent" : task.status === "needs_approval" ? "queued" : task.status === "in_progress" ? "high" : "normal";
              return (
                <div key={task.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{task.kind.replace(/_/g, " ")} · Room {task.room}</div>
                      <div className="mt-2 text-sm font-semibold text-[#17202B]">{task.title}</div>
                    </div>
                    <HotelStatusPill tone={tone}>{task.status.replace(/_/g, " ")}</HotelStatusPill>
                  </div>
                  <div className="mt-3 text-sm text-slate-600">{task.detail}</div>
                  <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs text-slate-600">
                    <div><span className="font-semibold text-[#17202B]">Owner:</span> {task.assignedTo}</div>
                    <div className="mt-1"><span className="font-semibold text-[#17202B]">Priority:</span> {task.priority}</div>
                    <div className="mt-1"><span className="font-semibold text-[#17202B]">Status:</span> {task.resolutionState?.replace(/_/g, " ") || "new"}</div>
                    <div className="mt-1"><span className="font-semibold text-[#17202B]">Source:</span> {task.source}</div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600">Conversation-linked</span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600">Media-ready</span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600">Learns from follow-up</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/hotel/requests/${task.id}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Open conversation</Link>
                    <Link href="/hotel/rooms" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">Open room</Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#17202B]">{value}</div>
      <div className="mt-1 text-sm text-slate-600">{detail}</div>
    </div>
  );
}
