"use client";

import { HotelLegacyRedirectPage } from "@/components/hotel/HotelLegacyRedirectPage";

export default function Page() {
  return (
    <HotelLegacyRedirectPage
      title='Room inspections'
      body='Inspection follow-through now belongs inside room readiness and task execution.'
      targetHref='/hotel/rooms'
      targetLabel='Rooms'
      reason='Managers mostly need to see whether a room is ready, blocked, or still needs work.'
    />
  );
}
