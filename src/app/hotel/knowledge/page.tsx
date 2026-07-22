"use client";

import { HotelPageHeader, HotelSourcePill, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";
import { knowledgeSuggestions } from "@/lib/hotel-demo-view";

export default function HotelKnowledgePage() {
  const { state, loaded } = useHotelDemoState();

  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1460px]">
        <HotelPageHeader
          eyebrow="Hotel Knowledge"
          title="Manager-approved facts and policies"
          body="Hotel Knowledge contains official information Sidekick can safely use with guests and staff. It stays separate from Hotel Memory, which contains learned operational history and patterns."
          action={<button className="rounded-[10px] bg-[#287A65] px-4 py-2 text-sm font-medium text-white">Add knowledge item</button>}
        />

        <div className="mb-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
          <section className="rounded-2xl border border-[#E1E5E2] bg-white p-5">
            <div className="border-b border-[#E1E5E2] pb-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Approved knowledge</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#18222C]">Policies, instructions, and reusable answers</h2>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {state.knowledge.map((item) => (
                <div key={item.title} className="rounded-2xl border border-[#E1E5E2] bg-[#FCFCFB] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-[#18222C]">{item.title}</div>
                      <div className="mt-1 text-sm text-[#5C6975]">{item.summary}</div>
                    </div>
                    <HotelStatusPill tone="resolved">Approved</HotelStatusPill>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#5C6975]">
                    <HotelSourcePill>{item.team}</HotelSourcePill>
                    <HotelSourcePill>Manager entry</HotelSourcePill>
                    <HotelSourcePill>Used {item.usesThisWeek} times this week</HotelSourcePill>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#E1E5E2] bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">How managers add knowledge</div>
            <div className="mt-4 space-y-2 text-sm text-[#5C6975]">
              {[
                "Typing it manually",
                "Uploading documents",
                "Uploading PDFs",
                "Uploading spreadsheets",
                "Importing website content",
                "Approving AI suggestions",
              ].map((line) => <div key={line} className="rounded-xl border border-[#E1E5E2] bg-[#FCFCFB] px-4 py-3 text-[#18222C]">{line}</div>)}
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-[#E1E5E2] bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Knowledge gaps and AI suggestions</div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {knowledgeSuggestions.map((suggestion) => (
              <div key={suggestion.title} className="rounded-2xl border border-[#E1E5E2] bg-[#FCFCFB] p-4">
                <div className="text-sm font-semibold text-[#18222C]">{suggestion.title}</div>
                <div className="mt-2 text-sm text-[#5C6975]">{suggestion.detail}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestion.actions.map((action) => <button key={action} className="rounded-[10px] border border-[#E1E5E2] bg-white px-3 py-2 text-xs font-medium text-[#18222C]">{action}</button>)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-[#5C6975]">Sidekick should never silently turn uncertain information into official hotel policy.</div>
        </section>
      </div>
    </div>
  );
}
