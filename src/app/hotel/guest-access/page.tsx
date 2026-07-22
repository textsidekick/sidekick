"use client";

import { HotelPageHeader } from "@/components/hotel/HotelUi";
import { guestAccessOptions } from "@/lib/hotel-demo-view";

export default function HotelGuestAccessPage() {
  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1460px]">
        <HotelPageHeader
          eyebrow="Guest Access"
          title="How guests enter Sidekick"
          body="Guest access should be simple, mobile-first, and account-free. The hotel decides what level of verification is required before a guest can request help."
        />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <section className="rounded-2xl border border-[#E1E5E2] bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Access options</div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {guestAccessOptions.map((option) => <div key={option} className="rounded-xl border border-[#E1E5E2] bg-[#FCFCFB] px-4 py-3 text-sm text-[#18222C]">{option}</div>)}
            </div>
          </section>
          <section className="rounded-2xl border border-[#E1E5E2] bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Guest-facing experience</div>
            <div className="mt-3 rounded-2xl border border-[#E1E5E2] bg-[#FCFCFB] p-4">
              <div className="text-lg font-semibold text-[#18222C]">Pacific Stay Motel</div>
              <div className="mt-2 text-sm text-[#5C6975]">Welcome. I’m Sidekick, your hotel assistant. Ask me anything about your stay or request help from the hotel team.</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "Request room cleaning",
                  "Ask for towels",
                  "Report a problem",
                  "Breakfast and amenities",
                  "Parking information",
                  "Contact the front desk",
                ].map((action) => <div key={action} className="rounded-full border border-[#E1E5E2] bg-white px-3 py-1.5 text-xs text-[#18222C]">{action}</div>)}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
