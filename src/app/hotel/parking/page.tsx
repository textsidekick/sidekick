"use client";

import { HotelLegacyRedirectPage } from "@/components/hotel/HotelLegacyRedirectPage";

export default function Page() {
  return (
    <HotelLegacyRedirectPage
      title='Parking questions'
      body='Parking now belongs in arrivals, conversations, and reusable knowledge.'
      targetHref='/hotel/stays'
      targetLabel='Arrivals'
      reason='Most parking work is just guest communication plus property rules.'
    />
  );
}
