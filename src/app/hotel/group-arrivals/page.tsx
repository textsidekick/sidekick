"use client";

import { HotelLegacyRedirectPage } from "@/components/hotel/HotelLegacyRedirectPage";

export default function Page() {
  return (
    <HotelLegacyRedirectPage
      title='Group arrivals'
      body='Group arrival coordination now folds into arrivals and team coordination.'
      targetHref='/hotel/stays'
      targetLabel='Arrivals'
      reason='The important thing is readiness and communication, not a separate enterprise-style arrivals module.'
    />
  );
}
