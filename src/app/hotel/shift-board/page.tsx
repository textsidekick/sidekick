"use client";

import { HotelLegacyRedirectPage } from "@/components/hotel/HotelLegacyRedirectPage";

export default function Page() {
  return (
    <HotelLegacyRedirectPage
      title='Shift board'
      body='Shift context now lives in Today, Tasks, and Staff.'
      targetHref='/hotel'
      targetLabel='Today'
      reason='The motel version should keep manager awareness lightweight instead of maintaining another operational dashboard.'
    />
  );
}
