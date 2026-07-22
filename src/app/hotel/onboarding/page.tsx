"use client";

import Link from "next/link";
import { HotelPageHeader } from "@/components/hotel/HotelUi";

export default function HotelOnboardingPage() {
  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <HotelPageHeader
          eyebrow="Property Setup"
          title="Onboarding moved into Settings"
          body="Property setup now lives inside Settings so the hotel’s rules, staff data, guest-access settings, and uploaded documents are configured in one place."
        />
        <div className="rounded-2xl border border-[#E1E5E2] bg-white p-6">
          <Link href="/hotel/settings/property-setup" className="rounded-[10px] bg-[#287A65] px-4 py-2 text-sm font-medium text-white">Open Property Setup</Link>
        </div>
      </div>
    </div>
  );
}
