"use client";

import { HotelLegacyRedirectPage } from "@/components/hotel/HotelLegacyRedirectPage";

export default function Page() {
  return (
    <HotelLegacyRedirectPage
      title='Audit follow-through'
      body='Audit issues now feed into tracked work instead of living in a separate hotel board.'
      targetHref='/hotel/tasks'
      targetLabel='Tasks'
      reason='If an audit finds a problem, it should become a task with an owner and visible follow-up.'
    />
  );
}
