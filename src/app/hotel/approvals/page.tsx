"use client";

import { HotelLegacyRedirectPage } from "@/components/hotel/HotelLegacyRedirectPage";

export default function Page() {
  return (
    <HotelLegacyRedirectPage
      title='Approvals'
      body='Approval-heavy desk workflows have been collapsed into the simpler task and conversation flow.'
      targetHref='/hotel/tasks'
      targetLabel='Tasks'
      reason='Approval should show up as an exception state on a conversation or task, not as a standalone hotel operating surface.'
    />
  );
}
