"use client";

import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelMinibarPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Minibar & market"
          body="Revenue capture for in-room minibar use and front-desk market sales so housekeeping findings, desk postings, and service-recovery waivers stay synchronized."
          action={<div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">{state.minibarItems.filter((item) => item.status === "captured").length} unposted charges</div>}
        />

        <div className="space-y-3">
          {state.minibarItems.map((item) => (
            <div key={item.id} className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">Room {item.room} · {item.amount}</div>
                  <div className="mt-2 text-lg font-semibold text-[#1C1A16]">{item.guestName} · {item.item}</div>
                  <div className="mt-1 text-xs text-black/45">Owner: {item.owner}</div>
                </div>
                <HotelStatusPill tone={item.status === "posted" ? "resolved" : item.status === "waived" ? "queued" : "high"}>{item.status}</HotelStatusPill>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">{item.note}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.status === "captured" ? (
                  <button
                    onClick={() => actions.updateMinibarStatus(item.id, "posted")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Post to folio
                  </button>
                ) : null}
                {item.status === "captured" ? (
                  <button
                    onClick={() => actions.updateMinibarStatus(item.id, "waived")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Waive charge
                  </button>
                ) : null}
                <button
                  onClick={() => actions.updateMinibarNote(item.id, `${item.note} Charge review note added.`)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Add revenue note
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
