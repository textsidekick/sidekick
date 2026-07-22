"use client";

import { HotelLegacyRedirectPage } from "@/components/hotel/HotelLegacyRedirectPage";

export default function Page() {
  return (
    <HotelLegacyRedirectPage
      title='Out-of-order rooms'
      body='Out-of-order handling now belongs in the room board and maintenance flow.'
      targetHref='/hotel/rooms'
      targetLabel='Rooms'
      reason='A manager should just see room readiness and blockers in one place.'
    />
  );
}
