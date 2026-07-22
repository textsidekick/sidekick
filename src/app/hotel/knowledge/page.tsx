"use client";

import { HotelPageHeader } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelKnowledgePage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Operating memory"
          body="This is where the hotel’s institutional knowledge compounds: guest policies, repeat fixes, room history, staff know-how, and the answers Sidekick can reuse instantly next time."
        />
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Guest knowledge</div>
            <div className="mt-2 text-sm text-slate-600">Breakfast, parking, Wi-Fi, late checkout, refunds, and common questions.</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Operational memory</div>
            <div className="mt-2 text-sm text-slate-600">Maintenance history, room issues, cleaning patterns, and property-specific exceptions.</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Auto-learning</div>
            <div className="mt-2 text-sm text-slate-600">Every conversation and follow-up should make the next answer faster and more property-specific.</div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {state.knowledge.map((item) => (
            <div key={item.title} className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">{item.team}</div>
                <button
                  onClick={() => actions.addKnowledgeItem({ ...item, usesThisWeek: item.usesThisWeek + 1, title: `${item.title} (follow-up)` })}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Save follow-up
                </button>
              </div>
              <div className="mt-2 text-lg font-semibold text-[#1C1A16]">{item.title}</div>
              <div className="mt-2 text-sm leading-6 text-black/55">{item.summary}</div>
              <div className="mt-4 text-xs text-black/40">Used {item.usesThisWeek} times this week</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
