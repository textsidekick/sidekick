"use client";

import { HotelPageHeader } from "@/components/hotel/HotelUi";
import { automationTemplates } from "@/lib/hotel-demo-view";

export default function HotelAutomationsPage() {
  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1460px]">
        <HotelPageHeader
          eyebrow="Automations"
          title="When this happens → If these conditions are true → Perform these actions"
          body="Automations should handle the repetitive communication loop while keeping managers in control of escalation, review, and policy."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {automationTemplates.map((item, index) => (
            <div key={item} className="rounded-2xl border border-[#E1E5E2] bg-white p-5">
              <div className="text-sm font-semibold text-[#18222C]">{item}</div>
              <div className="mt-3 text-sm text-[#5C6975]">Active · Used {12 - (index % 5)} times this week · Last triggered today</div>
              <div className="mt-3 rounded-xl border border-[#E1E5E2] bg-[#FCFCFB] p-3 text-sm text-[#5C6975]">Success status visible · Errors visible · Last edited by Maya</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
