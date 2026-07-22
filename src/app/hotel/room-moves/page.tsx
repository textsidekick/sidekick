"use client";

import { HotelLegacyRedirectPage } from "@/components/hotel/HotelLegacyRedirectPage";

export default function Page() {
  return (
    <HotelLegacyRedirectPage
      title='Room moves'
      body='Room moves now route through conversations, room readiness, and tasks.'
      targetHref='/hotel/rooms'
      targetLabel='Rooms'
      reason='A room move is really a combination of communication, inventory, and follow-through.'
    />
  );
}
