"use client";

import { HotelLegacyRedirectPage } from "@/components/hotel/HotelLegacyRedirectPage";

export default function Page() {
  return (
    <HotelLegacyRedirectPage
      title='Breakfast requests'
      body='Breakfast requests now belong in conversations and tasks, not a separate hospitality module.'
      targetHref='/hotel/conversations'
      targetLabel='Conversations'
      reason='A guest asking for breakfast, timing, or room delivery should just create a Sidekick thread and any needed follow-through.'
    />
  );
}
