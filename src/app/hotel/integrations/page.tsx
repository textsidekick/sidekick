"use client";

import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { integrationCards } from "@/lib/hotel-demo-view";

export default function HotelIntegrationsPage() {
  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1460px]">
        <HotelPageHeader
          eyebrow="Integrations"
          title="What Sidekick is actually connected to"
          body="Data-source honesty matters. Sidekick should only claim live reservations, occupancy, payment, or booking knowledge when the relevant integration is really connected."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {integrationCards.map((card) => (
            <div key={card.title} className="rounded-2xl border border-[#E1E5E2] bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-semibold text-[#18222C]">{card.title}</div>
                <HotelStatusPill tone={card.state === "Not connected" ? "queued" : card.state === "Demo connected" ? "resolved" : "normal"}>{card.state}</HotelStatusPill>
              </div>
              <div className="mt-3 text-sm text-[#5C6975]">{card.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
