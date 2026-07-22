"use client";

import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelIncidentsPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Incident log"
          body="Safety, liability, and property exceptions that need containment and documentation before they become reviews, claims, or revenue leakage."
          action={<div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">{state.incidentItems.filter((item) => item.status !== "closed").length} active incidents</div>}
        />

        <div className="space-y-3">
          {state.incidentItems.map((item) => (
            <div key={item.id} className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">{item.area}</div>
                  <div className="mt-2 text-lg font-semibold text-[#1C1A16]">{item.title}</div>
                  <div className="mt-1 text-xs text-black/45">Owner: {item.owner} · Severity: {item.severity}</div>
                </div>
                <HotelStatusPill tone={item.severity === "critical" ? "urgent" : item.severity === "high" ? "high" : item.status === "contained" ? "queued" : "normal"}>{item.status}</HotelStatusPill>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">{item.note}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.status === "open" ? (
                  <button
                    onClick={() => actions.updateIncidentStatus(item.id, "contained")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Mark contained
                  </button>
                ) : null}
                {item.status !== "closed" ? (
                  <button
                    onClick={() => actions.updateIncidentStatus(item.id, "closed")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Close incident
                  </button>
                ) : null}
                <button
                  onClick={() => actions.updateIncidentNote(item.id, `${item.note} Manager follow-up logged with supporting detail.`)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Add manager note
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
