"use client";

import { HotelLegacyRedirectPage } from "@/components/hotel/HotelLegacyRedirectPage";

export default function Page() {
  return (
    <HotelLegacyRedirectPage
      title='Incidents'
      body='Incident handling now routes into conversations, tasks, and escalation notes.'
      targetHref='/hotel/conversations'
      targetLabel='Conversations'
      reason='The demo should show one operating loop instead of another specialized hotel module.'
    />
  );
}
