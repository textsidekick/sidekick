"use client";

import Link from "next/link";
import { HotelPageHeader } from "@/components/hotel/HotelUi";

export default function HotelSettingsPage() {
  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1460px]">
        <HotelPageHeader
          eyebrow="Settings"
          title="Property configuration and controls"
          body="Settings should cover roles, permissions, privacy, retention, billing, security, and the operational rules that Sidekick uses to route and escalate work."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            "User roles",
            "Permissions",
            "Data retention",
            "Guest privacy",
            "Staff privacy",
            "Media retention",
            "Audit history",
            "Billing",
            "Security",
            "Two-factor authentication",
          ].map((item) => <div key={item} className="rounded-2xl border border-[#E1E5E2] bg-white p-5 text-sm font-medium text-[#18222C]">{item}</div>)}
          <Link href="/hotel/settings/property-setup" className="rounded-2xl border border-[#CFE4DB] bg-[#F3FBF7] p-5 text-sm font-semibold text-[#18222C]">Open Property Setup</Link>
        </div>
      </div>
    </div>
  );
}
