"use client";

import { HotelPageHeader, HotelMetric } from "@/components/hotel/HotelUi";
import { analyticsMetrics } from "@/lib/hotel-demo-view";

export default function HotelAnalyticsPage() {
  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1460px]">
        <HotelPageHeader
          eyebrow="Analytics"
          title="Operational value created by Sidekick"
          body="Every metric here should be grounded in conversations, tasks, translations, knowledge usage, and automations — not occupancy or revenue systems unless an actual integration exists."
        />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {analyticsMetrics.map((metric) => <HotelMetric key={metric.label} label={metric.label} value={metric.value} sub={metric.detail} />)}
        </div>
      </div>
    </div>
  );
}
