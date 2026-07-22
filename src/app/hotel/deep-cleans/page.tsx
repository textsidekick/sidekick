"use client";

import { HotelLegacyRedirectPage } from "@/components/hotel/HotelLegacyRedirectPage";

export default function Page() {
  return (
    <HotelLegacyRedirectPage
      title='Deep cleans'
      body='Deep-clean exceptions should roll into the room board and task queue.'
      targetHref='/hotel/tasks'
      targetLabel='Tasks'
      reason='Special cleaning is still real work, but it should not require its own product surface in this demo.'
    />
  );
}
