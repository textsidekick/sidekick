"use client";

import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

const toneByKind = {
  training: "high",
  coverage: "queued",
  policy: "normal",
  onboarding: "high",
} as const;

export default function HotelPeoplePage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  const openTasks = state.peopleTasks.filter((task) => task.status !== "done");

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="People ops"
          body="Hotel staffing and HR work that should run through the same operating system: training, policy rollout, shift coverage, multilingual onboarding, and manager follow-through."
          action={<div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">{openTasks.length} active people tasks</div>}
        />

        <div className="grid gap-4 md:grid-cols-2">
          {state.peopleTasks.map((task) => (
            <div key={task.id} className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">{task.team} · {task.kind}</div>
                  <div className="mt-2 text-lg font-semibold text-[#1C1A16]">{task.title}</div>
                  <div className="mt-2 text-sm text-black/55">{task.staffName} · due {task.due}</div>
                </div>
                <HotelStatusPill tone={task.status === "done" ? "resolved" : toneByKind[task.kind]}>{task.status.replace("_", " ")}</HotelStatusPill>
              </div>

              <div className="mt-4 rounded-2xl bg-[#fffdfa] px-4 py-3 text-sm leading-6 text-black/60">{task.note}</div>

              <div className="mt-4 flex flex-wrap gap-2">
                {task.status !== "in_progress" && task.status !== "done" ? (
                  <button
                    onClick={() => actions.updatePeopleTaskStatus(task.id, "in_progress")}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    Start
                  </button>
                ) : null}
                {task.status !== "done" ? (
                  <button
                    onClick={() => actions.updatePeopleTaskStatus(task.id, "done")}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    Mark complete
                  </button>
                ) : null}
                <button
                  onClick={() => actions.updatePeopleTaskNote(task.id, `${task.note} SMS reminder sent and manager was updated.`)}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60"
                >
                  Send reminder
                </button>
                <button
                  onClick={() => actions.updatePeopleTaskNote(task.id, `${task.note} Translated SOP and quick reply snippets attached for staff.`)}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60"
                >
                  Attach SOP help
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
