"use client";

import { useMemo, useState } from "react";
import { Bot, CheckCircle2, ClipboardList, Languages, MessageCircle, Mic, Camera, Sparkles } from "lucide-react";
import { HotelPageHeader, HotelMetric, HotelSourcePill, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";
import { askSidekickAnswers, askSidekickExamples, attentionItems, housekeepingProgress, liveActivity, operationalMetrics, operationsRows, recentReports } from "@/lib/hotel-demo-view";

const tabs = [
  { key: "needs_attention", label: "Needs Attention" },
  { key: "guest_requests", label: "Guest Requests" },
  { key: "housekeeping", label: "Housekeeping" },
  { key: "maintenance", label: "Maintenance" },
  { key: "recently_completed", label: "Recently Completed" },
] as const;

const activityIcons = {
  sparkles: Sparkles,
  "check-circle": CheckCircle2,
  mic: Mic,
  languages: Languages,
  "message-circle": MessageCircle,
  camera: Camera,
  clipboard: ClipboardList,
};

export default function HotelOverviewPage() {
  const { state, loaded } = useHotelDemoState();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["key"]>("needs_attention");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantQuestion, setAssistantQuestion] = useState(askSidekickExamples[0]);

  const filteredRows = useMemo(() => operationsRows.filter((row) => row.tab === activeTab), [activeTab]);

  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1460px]">
        <HotelPageHeader
          eyebrow="Live operations"
          title={state.property.name}
          body="Guest requests, staff updates, room reports, and property issues coordinated by Sidekick."
          meta="Demo property · Updated moments ago"
          action={
            <button onClick={() => setAssistantOpen(true)} className="rounded-[10px] bg-[#287A65] px-4 py-2 text-sm font-medium text-white hover:bg-[#236B59]">
              Ask Sidekick
            </button>
          }
        />

        <section className="mb-6 rounded-2xl border border-[#CFE4DB] bg-[#F3FBF7] p-6">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full bg-[#E1F1EA] p-2 text-[#287A65]"><Bot className="h-4 w-4" /></div>
            <div className="flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#287A65]">Sidekick Briefing</div>
              <div className="mt-2 text-lg font-semibold text-[#18222C]">Housekeeping has reported 14 rooms complete today. Two guest requests are still waiting for staff acknowledgment. A possible water issue in Room 218 requires manager review, and the guest connected to Room 304 was automatically notified after cleaning was completed.</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="rounded-[10px] bg-[#287A65] px-4 py-2 text-sm font-medium text-white">Review priority items</button>
                <button className="rounded-[10px] border border-[#CFE4DB] bg-white px-4 py-2 text-sm font-medium text-[#287A65]">Generate shift summary</button>
                <button onClick={() => setAssistantOpen(true)} className="rounded-[10px] border border-[#CFE4DB] bg-white px-4 py-2 text-sm font-medium text-[#287A65]">Ask a follow-up</button>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {operationalMetrics.map((metric) => (
            <HotelMetric key={metric.label} label={metric.label} value={metric.value} sub={metric.detail} />
          ))}
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.7fr)_380px]">
          <section className="rounded-2xl border border-[#E1E5E2] bg-white p-5">
            <div className="border-b border-[#E1E5E2] pb-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Live Operations</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#18222C]">Current requests, staff updates, and property issues that require coordination.</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={activeTab === tab.key ? "rounded-full bg-[#18222C] px-3 py-1.5 text-xs font-semibold text-white" : "rounded-full border border-[#E1E5E2] bg-white px-3 py-1.5 text-xs font-semibold text-[#5C6975]"}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {filteredRows.map((row) => (
                <div key={row.id} className="rounded-2xl border border-[#E1E5E2] bg-[#FCFCFB] p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-[#18222C]">{row.location} — {row.title}</div>
                      <div className="mt-2 text-sm leading-6 text-[#5C6975]">{row.detail}</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {row.badges.map((badge) => (
                          <HotelStatusPill key={badge} tone={row.tone}>{badge}</HotelStatusPill>
                        ))}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#5C6975]">
                        <HotelSourcePill>{row.source}</HotelSourcePill>
                        <HotelSourcePill>{row.assignedTo}</HotelSourcePill>
                        <HotelSourcePill>{row.age}</HotelSourcePill>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
                      <div className="text-xs text-[#5C6975]">{row.category} · {row.priority}</div>
                      <HotelStatusPill tone={row.tone}>{row.status}</HotelStatusPill>
                      <button className="rounded-[10px] border border-[#E1E5E2] bg-white px-3 py-2 text-xs font-medium text-[#18222C] hover:bg-[#F8F9F7]">{row.action}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-4">
            <section className="rounded-2xl border border-[#E1E5E2] bg-white p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Needs Attention</div>
              <h2 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#18222C]">Urgent and actionable</h2>
              <div className="mt-4 space-y-3">
                {attentionItems.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-[#E1E5E2] bg-[#FCFCFB] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-[#18222C]">{item.title}</div>
                        <div className="mt-1 text-sm text-[#5C6975]">{item.detail}</div>
                        <div className="mt-2 text-xs text-[#5C6975]">{item.meta}</div>
                      </div>
                      <HotelStatusPill tone={item.tone}>{item.tone === "urgent" ? "Urgent" : "Review"}</HotelStatusPill>
                    </div>
                    <button className="mt-3 rounded-[10px] border border-[#E1E5E2] bg-white px-3 py-2 text-xs font-medium text-[#18222C]">{item.action}</button>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-[#E1E5E2] bg-white p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Live Activity</div>
              <div className="mt-4 space-y-3">
                {liveActivity.map((item) => {
                  const Icon = activityIcons[item.icon as keyof typeof activityIcons] || Sparkles;
                  return (
                    <div key={`${item.actor}-${item.time}-${item.room}`} className="rounded-2xl border border-[#E1E5E2] bg-[#FCFCFB] p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-[#EEF5FA] p-2 text-[#3976A8]"><Icon className="h-4 w-4" /></div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-[#18222C]"><span className="font-semibold">{item.actor}</span> {item.action}</div>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-[#5C6975]">
                            <span>{item.room ? `Room ${item.room}` : "Property"}</span>
                            <span>{item.time}</span>
                          </div>
                        </div>
                        <HotelStatusPill tone={item.tone}>{item.status}</HotelStatusPill>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-[#E1E5E2] bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Housekeeping Progress</div>
          <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            {housekeepingProgress.map((item) => (
              <div key={item.label} className="rounded-xl border border-[#E1E5E2] bg-[#FCFCFB] px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">{item.label}</div>
                <div className="mt-1 text-2xl font-semibold text-[#18222C]">{item.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[#E1E5E2] bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Recent Reports</div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {recentReports.map((report) => (
              <div key={report.id} className="rounded-2xl border border-[#E1E5E2] bg-[#FCFCFB] p-4">
                <div className="text-sm font-semibold text-[#18222C]">{report.room}</div>
                <div className="mt-1 text-base font-semibold text-[#18222C]">{report.title}</div>
                <div className="mt-2 space-y-1 text-sm text-[#5C6975]">
                  <div>Submitted by {report.submittedBy}</div>
                  <div>{report.route}</div>
                  <div>{report.status}</div>
                </div>
                <div className="mt-3 text-sm text-[#3976A8]">{report.suggestion}</div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#5C6975]">
                  <HotelSourcePill>{report.source}</HotelSourcePill>
                  <HotelSourcePill>{report.relatedTask}</HotelSourcePill>
                </div>
                <button className="mt-3 rounded-[10px] border border-[#E1E5E2] bg-white px-3 py-2 text-xs font-medium text-[#18222C]">Open detail panel</button>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_320px]">
          <div className="rounded-2xl border border-[#E1E5E2] bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Recently Completed</div>
            <div className="mt-4 space-y-3">
              {operationsRows.filter((row) => row.tab === "recently_completed").map((row) => (
                <div key={row.id} className="rounded-2xl border border-[#E1E5E2] bg-[#FCFCFB] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-[#18222C]">{row.location} — {row.title}</div>
                      <div className="mt-1 text-sm text-[#5C6975]">{row.detail}</div>
                    </div>
                    <HotelStatusPill tone={row.tone}>{row.status}</HotelStatusPill>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#E1E5E2] bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Staff on Shift</div>
            <div className="mt-4 space-y-3">
              {state.staff.slice(0, 4).map((person) => (
                <div key={person.phone} className="rounded-xl border border-[#E1E5E2] bg-[#FCFCFB] px-4 py-3">
                  <div className="text-sm font-semibold text-[#18222C]">{person.name}</div>
                  <div className="mt-1 text-sm text-[#5C6975]">{person.team}</div>
                  <div className="mt-1 text-xs text-[#5C6975]">{person.shift}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {assistantOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
          <div className="h-full w-full max-w-[440px] border-l border-[#E1E5E2] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Ask Sidekick</div>
                <div className="mt-1 text-xl font-semibold text-[#18222C]">Operational assistant</div>
              </div>
              <button onClick={() => setAssistantOpen(false)} className="rounded-[10px] border border-[#E1E5E2] px-3 py-2 text-sm text-[#5C6975]">Close</button>
            </div>

            <div className="mt-6 space-y-2">
              {askSidekickExamples.map((question) => (
                <button
                  key={question}
                  onClick={() => setAssistantQuestion(question)}
                  className={assistantQuestion === question ? "w-full rounded-2xl border border-[#CFE4DB] bg-[#F3FBF7] px-4 py-3 text-left text-sm font-medium text-[#18222C]" : "w-full rounded-2xl border border-[#E1E5E2] bg-[#FCFCFB] px-4 py-3 text-left text-sm text-[#5C6975]"}
                >
                  {question}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-[#E1E5E2] bg-[#FCFCFB] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5C6975]">Answer</div>
              <div className="mt-2 text-sm leading-6 text-[#18222C]">{askSidekickAnswers[assistantQuestion]}</div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
