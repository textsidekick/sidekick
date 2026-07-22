"use client";

import { HotelLegacyRedirectPage } from "@/components/hotel/HotelLegacyRedirectPage";

export default function Page() {
  return (
    <HotelLegacyRedirectPage
      title='Laundry operations'
      body='Laundry work now folds into tasks and staff coverage.'
      targetHref='/hotel/tasks'
      targetLabel='Tasks'
      reason='Laundry is real operational work, but it should show up as routed execution rather than a separate app surface.'
    />
  );
}
