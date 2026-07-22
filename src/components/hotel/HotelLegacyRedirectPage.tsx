"use client";

import Link from "next/link";
import { HotelPageHeader } from "@/components/hotel/HotelUi";

export function HotelLegacyRedirectPage({
  title,
  body,
  targetHref,
  targetLabel,
  reason,
}: {
  title: string;
  body: string;
  targetHref: string;
  targetLabel: string;
  reason: string;
}) {
  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <HotelPageHeader title={title} body={body} />

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Collapsed legacy surface</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#17202B]">This workflow now lives in the simpler motel model</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{reason}</p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">Guests and staff should text Sidekick instead of switching between niche back-office tools.</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">Sidekick should turn those texts into conversations, tracked work, and room updates automatically.</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">Managers should mostly live in Today, Conversations, Tasks, Rooms, Arrivals, Staff, and Knowledge.</div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={targetHref} className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              Open {targetLabel}
            </Link>
            <Link href="/hotel" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Back to Today
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
