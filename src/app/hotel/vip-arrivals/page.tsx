"use client";

import { HotelLegacyRedirectPage } from "@/components/hotel/HotelLegacyRedirectPage";

export default function Page() {
  return (
    <HotelLegacyRedirectPage
      title='Special arrivals'
      body='Special arrival handling now folds into arrivals and knowledge.'
      targetHref='/hotel/stays'
      targetLabel='Arrivals'
      reason='The demo should show a single arrival workflow that can handle exceptions, not a separate VIP product track.'
    />
  );
}
