"use client";

import { HotelLegacyRedirectPage } from "@/components/hotel/HotelLegacyRedirectPage";

export default function Page() {
  return (
    <HotelLegacyRedirectPage
      title='Charges and minibar'
      body='Charge exceptions now belong in conversations and knowledge instead of a dedicated minibar workflow.'
      targetHref='/hotel/knowledge'
      targetLabel='Knowledge'
      reason='Policy answers and exception handling matter more than modeling every hotel-specific subsystem.'
    />
  );
}
