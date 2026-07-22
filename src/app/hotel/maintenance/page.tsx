"use client";

import { useState } from "react";
import { HotelPageHeader, HotelMetric, HotelSourcePill, HotelStatusPill } from "@/components/hotel/HotelUi";
import { maintenanceIssues, maintenanceMetrics } from "@/lib/hotel-demo-view";

export default function HotelMaintenancePage() {
  const [activeId, setActiveId] = useState("req-218-water");
  const activeIssue = maintenanceIssues.find((issue) => issue.id === activeId) || maintenanceIssues[0];

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1460px]">
        <HotelPageHeader
          eyebrow="Maintenance"
          title="Message-driven maintenance workflow"
          body="Maintenance issues should come from guest reports, staff messages, uploaded media, and manager entries — with Sidekick suggesting category and severity while keeping the original evidence visible."
        />

        <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          {maintenanceMetrics.map((metric) => <HotelMetric key={metric.label} label={metric.label} value={metric.value} sub="Current" />)}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
          <section className="rounded-2xl border border-[#E1E5E2] bg-white p-5">
            <div className="border-b border-[#E1E5E2] pb-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Open maintenance issues</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#18222C]">Original reports, media, and suggested classifications</h2>
            </div>

            <div className="mt-4 space-y-3">
              {maintenanceIssues.map((issue) => (
                <button key={issue.id} onClick={() => setActiveId(issue.id)} className={issue.id === activeIssue.id ? "w-full rounded-2xl border border-[#CFE4DB] bg-[#F3FBF7] p-4 text-left" : "w-full rounded-2xl border border-[#E1E5E2] bg-[#FCFCFB] p-4 text-left"}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-[#18222C]">{issue.location} — {issue.title}</div>
                      <div className="mt-2 grid gap-1 text-sm text-[#5C6975] md:grid-cols-2">
                        <div>Reporter: {issue.reporter}</div>
                        <div>Assigned technician: {issue.assignedTo}</div>
                        <div>Media: {issue.media}</div>
                        <div>Time open: {issue.timeOpen}</div>
                      </div>
                    </div>
                    <HotelStatusPill tone={issue.severity === "Urgent" ? "urgent" : issue.status === "Manager review" ? "queued" : "high"}>{issue.status}</HotelStatusPill>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#E1E5E2] bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Issue detail</div>
            <h2 className="mt-2 text-xl font-semibold text-[#18222C]">{activeIssue.location} — {activeIssue.title}</h2>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#5C6975]">
              <HotelSourcePill>{activeIssue.media}</HotelSourcePill>
              <HotelSourcePill>{activeIssue.assignedTo}</HotelSourcePill>
              <HotelSourcePill>{activeIssue.repeatIssue}</HotelSourcePill>
            </div>

            <div className="mt-5 space-y-3 text-sm text-[#5C6975]">
              <div><span className="font-semibold text-[#18222C]">Original message:</span> {activeIssue.transcript}</div>
              <div><span className="font-semibold text-[#18222C]">Translation:</span> {activeIssue.translation}</div>
              <div><span className="font-semibold text-[#18222C]">Suggested category:</span> {activeIssue.suggestedCategory}</div>
              <div><span className="font-semibold text-[#18222C]">Suggested severity:</span> {activeIssue.suggestedSeverity}</div>
              <div><span className="font-semibold text-[#18222C]">Related room history:</span> {activeIssue.roomHistory}</div>
            </div>

            <div className="mt-5 rounded-2xl border border-[#E1E5E2] bg-[#FCFCFB] p-4 text-sm text-[#5C6975]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Manager actions</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  "Confirm category",
                  "Change severity",
                  "Reassign",
                  "Add notes",
                  "Escalate",
                  "Resolve",
                  "Dismiss incorrect suggestion",
                ].map((action) => (
                  <button key={action} className="rounded-[10px] border border-[#E1E5E2] bg-white px-3 py-2 text-xs font-medium text-[#18222C]">{action}</button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
