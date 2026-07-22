"use client";

import { HotelLegacyRedirectPage } from "@/components/hotel/HotelLegacyRedirectPage";

export default function Page() {
  return (
    <HotelLegacyRedirectPage
      title='Housekeeping workflow'
      body='Housekeeping work now appears through rooms, tasks, and staff coordination.'
      targetHref='/hotel/tasks'
      targetLabel='Tasks'
      reason='Housekeeping should work through Sidekick updates and room readiness, not a heavyweight standalone board.'
    />
  );
}
