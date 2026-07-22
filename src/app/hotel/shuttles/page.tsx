"use client";

import { HotelLegacyRedirectPage } from "@/components/hotel/HotelLegacyRedirectPage";

export default function Page() {
  return (
    <HotelLegacyRedirectPage
      title='Shuttle coordination'
      body='Shuttle coordination now belongs in arrivals and conversations.'
      targetHref='/hotel/stays'
      targetLabel='Arrivals'
      reason='Transportation coordination is just another guest communication workflow in this demo.'
    />
  );
}
