"use client";

import { HotelLegacyRedirectPage } from "@/components/hotel/HotelLegacyRedirectPage";

export default function Page() {
  return (
    <HotelLegacyRedirectPage
      title='Guest conversations'
      body='Guest requests now live in the unified conversation view.'
      targetHref='/hotel/conversations'
      targetLabel='Conversations'
      reason='There should be one thread model for guest issues, updates, and routed work rather than multiple inbox concepts.'
    />
  );
}
