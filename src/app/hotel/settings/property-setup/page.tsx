"use client";

import { useState } from "react";
import { HotelPageHeader } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelPropertySetupPage() {
  const { state, actions, loaded } = useHotelDemoState();
  const [saved, setSaved] = useState(false);
  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          eyebrow="Property Setup"
          title="Configure what Sidekick can know"
          body="Property Setup controls the hotel facts, departments, staff, documents, rules, and escalation settings that Sidekick is allowed to use."
          action={saved ? <div className="rounded-[10px] border border-[#E1E5E2] bg-white px-4 py-2 text-sm font-medium text-[#18222C]">Saved</div> : null}
        />

        <div className="rounded-2xl border border-[#E1E5E2] bg-white p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-[#5C6975]">Hotel name<input className="mt-2 w-full rounded-2xl border border-[#E1E5E2] px-3 py-2 text-[#18222C] outline-none" value={state.property.name} onChange={(e) => actions.updateProperty({ name: e.target.value })} /></label>
            <label className="text-sm text-[#5C6975]">Phone number<input className="mt-2 w-full rounded-2xl border border-[#E1E5E2] px-3 py-2 text-[#18222C] outline-none" value={state.property.frontDeskNumber || ""} onChange={(e) => actions.updateProperty({ frontDeskNumber: e.target.value })} /></label>
            <label className="text-sm text-[#5C6975]">Time zone<input className="mt-2 w-full rounded-2xl border border-[#E1E5E2] px-3 py-2 text-[#18222C] outline-none" value="America/Los_Angeles" readOnly /></label>
            <label className="text-sm text-[#5C6975]">Supported languages<input className="mt-2 w-full rounded-2xl border border-[#E1E5E2] px-3 py-2 text-[#18222C] outline-none" value={state.property.languages.join(", ")} readOnly /></label>
            <label className="text-sm text-[#5C6975] md:col-span-2">Guest-facing welcome message<textarea className="mt-2 min-h-[90px] w-full rounded-2xl border border-[#E1E5E2] px-3 py-2 text-[#18222C] outline-none" defaultValue="Welcome. I’m Sidekick, your hotel assistant. Ask me anything about your stay or request help from the hotel team." /></label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1200); }} className="rounded-[10px] bg-[#287A65] px-4 py-2 text-sm font-medium text-white">Save Property Setup</button>
            <button className="rounded-[10px] border border-[#E1E5E2] bg-white px-4 py-2 text-sm font-medium text-[#18222C]">Upload documents</button>
          </div>
        </div>
      </div>
    </div>
  );
}
