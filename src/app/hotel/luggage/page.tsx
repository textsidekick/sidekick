"use client";

import { HotelLegacyRedirectPage } from "@/components/hotel/HotelLegacyRedirectPage";

export default function Page() {
  return (
    <HotelLegacyRedirectPage
      title='Luggage handling'
      body='Luggage coordination now belongs in conversations and staff follow-through.'
      targetHref='/hotel/conversations'
      targetLabel='Conversations'
      reason='The core product story is communication turning into tracked work, not luggage software.'
    />
  );
}
