"use client";

import { HotelLegacyRedirectPage } from "@/components/hotel/HotelLegacyRedirectPage";

export default function Page() {
  return (
    <HotelLegacyRedirectPage
      title='Lost and found'
      body='Lost-and-found follow-up now runs through conversations and task ownership.'
      targetHref='/hotel/conversations'
      targetLabel='Conversations'
      reason='Guest communication and staff follow-through matter more than preserving a niche hotel module in this demo.'
    />
  );
}
