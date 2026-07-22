"use client";

import { HotelLegacyRedirectPage } from "@/components/hotel/HotelLegacyRedirectPage";

export default function Page() {
  return (
    <HotelLegacyRedirectPage
      title='Service recovery'
      body='Service recovery now starts from the request thread rather than a separate command center.'
      targetHref='/hotel/conversations'
      targetLabel='Conversations'
      reason='The right place to manage recovery is the same thread where the issue, owner, and guest updates already live.'
    />
  );
}
