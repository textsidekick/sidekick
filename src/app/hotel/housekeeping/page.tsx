"use client";

import { HotelPageHeader, HotelMetric, HotelSourcePill, HotelStatusPill } from "@/components/hotel/HotelUi";
import { housekeepingProgress, housekeepingTasks } from "@/lib/hotel-demo-view";

export default function HotelHousekeepingPage() {
  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1460px]">
        <HotelPageHeader
          eyebrow="Housekeeping"
          title="Text-native housekeeping coordination"
          body="Cleaners can text naturally, Sidekick matches the room and task, updates the workflow, and only asks a clarifying question when confidence is too low to close the loop safely."
        />

        <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          {housekeepingProgress.map((item) => <HotelMetric key={item.label} label={item.label} value={item.value} sub="Today" />)}
        </div>

        <section className="rounded-2xl border border-[#E1E5E2] bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">How it works</div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-[#E1E5E2] bg-[#FCFCFB] px-4 py-3 text-sm text-[#5C6975]">Guests can ask for cleaning through Sidekick.</div>
            <div className="rounded-xl border border-[#E1E5E2] bg-[#FCFCFB] px-4 py-3 text-sm text-[#5C6975]">Sidekick creates and assigns the task automatically.</div>
            <div className="rounded-xl border border-[#E1E5E2] bg-[#FCFCFB] px-4 py-3 text-sm text-[#5C6975]">Cleaners can text naturally in English, Spanish, or French-style shorthand.</div>
            <div className="rounded-xl border border-[#E1E5E2] bg-[#FCFCFB] px-4 py-3 text-sm text-[#5C6975]">When confidence is low, Sidekick asks for confirmation instead of closing the task automatically.</div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[#E1E5E2] bg-white p-5">
          <div className="flex items-end justify-between gap-4 border-b border-[#E1E5E2] pb-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Cleaning tasks</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#18222C]">Assigned, in progress, and recently completed</h2>
            </div>
            <HotelSourcePill>Guest SMS · Staff SMS · Manager entry</HotelSourcePill>
          </div>

          <div className="mt-4 space-y-3">
            {housekeepingTasks.map((task) => (
              <div key={task.room} className="rounded-2xl border border-[#E1E5E2] bg-[#FCFCFB] p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-[#18222C]">Room {task.room} — {task.cleaningType}</div>
                    <div className="mt-2 grid gap-1 text-sm text-[#5C6975] md:grid-cols-2">
                      <div>Assigned cleaner: {task.cleaner}</div>
                      <div>Start time: {task.started}</div>
                      <div>Guest update status: {task.guestUpdateStatus}</div>
                      <div>Attachments: {task.attachments}</div>
                      <div>Problems reported: {task.problems}</div>
                      <div>Time elapsed: {task.elapsed}</div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {task.exampleTexts.map((text) => (
                        <HotelSourcePill key={text}>{text}</HotelSourcePill>
                      ))}
                    </div>
                  </div>
                  <HotelStatusPill tone={task.status === "Guest notified" ? "resolved" : task.status === "Awaiting acknowledgment" || task.status === "Awaiting verification" ? "queued" : task.status === "Issues found" ? "high" : "normal"}>{task.status}</HotelStatusPill>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-[#E1E5E2] bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Guest notification flow</div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-[#5C6975]">
              <div className="rounded-xl border border-[#E1E5E2] bg-[#FCFCFB] p-4"><span className="font-semibold text-[#18222C]">Guest:</span> Can someone clean my room while I’m out?</div>
              <div className="rounded-xl border border-[#E1E5E2] bg-[#FCFCFB] p-4"><span className="font-semibold text-[#18222C]">Sidekick:</span> Absolutely. I’ve sent the request to housekeeping and will let you know when it is complete.</div>
              <div className="rounded-xl border border-[#E1E5E2] bg-[#FCFCFB] p-4"><span className="font-semibold text-[#18222C]">Cleaner:</span> Room 304 done.</div>
              <div className="rounded-xl border border-[#CFE4DB] bg-[#F3FBF7] p-4 text-[#18222C]">Sidekick marked the task complete, updated the Room 304 timeline, sent the guest a confirmation message, and added the event to Live Activity.</div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E1E5E2] bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Low-confidence handling</div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-[#5C6975]">
              <div className="rounded-xl border border-[#E1E5E2] bg-[#FCFCFB] p-4">If a cleaner sends a vague message or Sidekick cannot confidently match the room, it should ask: <span className="font-semibold text-[#18222C]">Are you confirming that Room 304 is finished?</span></div>
              <div className="rounded-xl border border-[#E1E5E2] bg-[#FCFCFB] p-4">Do not close a task automatically when confidence is low.</div>
              <div className="rounded-xl border border-[#E1E5E2] bg-[#FCFCFB] p-4">Examples Sidekick should understand: <span className="font-semibold text-[#18222C]">Room 304 done</span>, <span className="font-semibold text-[#18222C]">Finished 304</span>, <span className="font-semibold text-[#18222C]">304 clean</span>, <span className="font-semibold text-[#18222C]">Ya terminé la habitación 304</span>, <span className="font-semibold text-[#18222C]">Chambre 304 terminée</span>.</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
