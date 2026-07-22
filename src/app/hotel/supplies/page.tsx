"use client";

import { HotelLegacyRedirectPage } from "@/components/hotel/HotelLegacyRedirectPage";

export default function Page() {
  return (
    <HotelLegacyRedirectPage
      title='Supplies'
      body='Supply shortages now appear as tracked work and staff follow-up.'
      targetHref='/hotel/tasks'
      targetLabel='Tasks'
      reason='Important shortages should become visible tasks rather than a standalone inventory surface.'
    />
  );
}
