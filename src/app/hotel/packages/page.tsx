"use client";

import { HotelLegacyRedirectPage } from "@/components/hotel/HotelLegacyRedirectPage";

export default function Page() {
  return (
    <HotelLegacyRedirectPage
      title='Packages'
      body='Package handling now folds into conversations and front-desk exceptions.'
      targetHref='/hotel/conversations'
      targetLabel='Conversations'
      reason='The desk should use one live queue, not a menu of separate mini-tools.'
    />
  );
}
