"use client";

import { HotelPageHeader } from "@/components/hotel/HotelUi";
import { hotelMemoryItems } from "@/lib/hotel-demo-view";

export default function HotelMemoryPage() {
  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1460px]">
        <HotelPageHeader
          eyebrow="Hotel Memory"
          title="Learned operational history and recurring patterns"
          body="Hotel Memory stores learned history — recurring room issues, repeated complaints, cleaning patterns, and staff resolution patterns. It does not become official Hotel Knowledge without manager approval."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {hotelMemoryItems.map((item) => (
            <div key={item.title} className="rounded-2xl border border-[#E1E5E2] bg-white p-5">
              <div className="text-sm font-semibold text-[#18222C]">{item.title}</div>
              <div className="mt-3 text-sm leading-6 text-[#5C6975]">{item.summary}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.actions.map((action) => <button key={action} className="rounded-[10px] border border-[#E1E5E2] bg-[#FCFCFB] px-3 py-2 text-xs font-medium text-[#18222C]">{action}</button>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
