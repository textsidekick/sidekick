"use client";

import { HotelPageHeader } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";
import { useState } from "react";

const steps = [
  {
    title: "1. Add the property basics",
    detail: "Property name, room count, front desk number, parking rules, breakfast hours, checkout policy, and escalation contacts.",
  },
  {
    title: "2. Add staff phone numbers",
    detail: "Front desk, housekeeping, maintenance, and manager numbers. This is the main wedge: no machine mapping or app rollout required.",
  },
  {
    title: "3. Load property knowledge",
    detail: "Late checkout policy, Wi-Fi instructions, housekeeping standards, maintenance escalation steps, and refund/guest issue rules.",
  },
  {
    title: "4. Go live on one property",
    detail: "Start with guest requests, room-ready updates, housekeeping flags, and maintenance routing. Expand once one property is working.",
  },
];

export default function HotelOnboardingPage() {
  const { state, actions, loaded } = useHotelDemoState();
  const [saved, setSaved] = useState(false);

  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <HotelPageHeader
          title="Hotel onboarding"
          body="This is the clean hotel onboarding story: phone numbers first, policies second, then live guest and staff messaging."
          action={saved ? <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">Saved</div> : null}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-black/8 bg-white p-6 shadow-sm md:col-span-2">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-black/60">
                Property name
                <input className="mt-2 w-full rounded-2xl border border-black/10 px-3 py-2 text-[#1C1A16] outline-none" value={state.property.name} onChange={(e) => actions.updateProperty({ name: e.target.value })} />
              </label>
              <label className="text-sm text-black/60">
                Room count
                <input className="mt-2 w-full rounded-2xl border border-black/10 px-3 py-2 text-[#1C1A16] outline-none" value={state.property.roomCount} onChange={(e) => actions.updateProperty({ roomCount: Number(e.target.value || 0) })} />
              </label>
              <label className="text-sm text-black/60">
                Front desk number
                <input className="mt-2 w-full rounded-2xl border border-black/10 px-3 py-2 text-[#1C1A16] outline-none" value={state.property.frontDeskNumber || ""} onChange={(e) => actions.updateProperty({ frontDeskNumber: e.target.value })} />
              </label>
              <label className="text-sm text-black/60">
                Maintenance number
                <input className="mt-2 w-full rounded-2xl border border-black/10 px-3 py-2 text-[#1C1A16] outline-none" value={state.property.maintenanceNumber || ""} onChange={(e) => actions.updateProperty({ maintenanceNumber: e.target.value })} />
              </label>
              <label className="text-sm text-black/60 md:col-span-2">
                Breakfast hours
                <input className="mt-2 w-full rounded-2xl border border-black/10 px-3 py-2 text-[#1C1A16] outline-none" value={state.property.breakfastHours || ""} onChange={(e) => actions.updateProperty({ breakfastHours: e.target.value })} />
              </label>
              <label className="text-sm text-black/60 md:col-span-2">
                Checkout policy
                <textarea className="mt-2 min-h-[90px] w-full rounded-2xl border border-black/10 px-3 py-2 text-[#1C1A16] outline-none" value={state.property.checkoutPolicy || ""} onChange={(e) => actions.updateProperty({ checkoutPolicy: e.target.value })} />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1200); }} className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Save demo setup</button>
              <button onClick={() => actions.reset()} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Reset demo</button>
            </div>
          </div>

          {steps.map((step) => (
            <div key={step.title} className="rounded-3xl border border-black/8 bg-white p-6 shadow-sm">
              <div className="text-lg font-semibold text-[#1C1A16]">{step.title}</div>
              <p className="mt-3 text-sm leading-6 text-black/55">{step.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-[#eadfce] bg-[#faf5ee] p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">Why this may be a better wedge</div>
          <div className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#1C1A16]">You mostly need their phone numbers and property rules.</div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-black/60">
            Compared with heavy industrial onboarding, this onboarding path is much lighter. You do not need to map every machine, maintenance tree, or plant workflow before value starts showing up.
          </p>
        </div>
      </div>
    </div>
  );
}
