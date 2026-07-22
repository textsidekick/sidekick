"use client";

import { HotelLegacyRedirectPage } from "@/components/hotel/HotelLegacyRedirectPage";

export default function Page() {
  return (
    <HotelLegacyRedirectPage
      title='Wake-up requests'
      body='Wake-up requests now belong in conversations and reusable property knowledge.'
      targetHref='/hotel/conversations'
      targetLabel='Conversations'
      reason='A wake-up is just a guest request with follow-through, not its own product surface.'
    />
  );
}
