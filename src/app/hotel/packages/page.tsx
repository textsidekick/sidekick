"use client";

import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelPackagesPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Package log"
          body="Front-desk package handling for guest deliveries, signature-required items, and secure handoff follow-through before boxes disappear or guests complain."
          action={<div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">{state.packageItems.filter((item) => item.status !== "picked_up").length} open package handoffs</div>}
        />

        <div className="space-y-3">
          {state.packageItems.map((item) => (
            <div key={item.id} className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">Room {item.room} · {item.location}</div>
                  <div className="mt-2 text-lg font-semibold text-[#1C1A16]">{item.guestName} · {item.carrier}</div>
                  <div className="mt-1 text-xs text-black/45">Owner: {item.owner}</div>
                </div>
                <HotelStatusPill tone={item.status === "picked_up" ? "resolved" : item.status === "notified" ? "queued" : "high"}>{item.status}</HotelStatusPill>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">{item.note}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.status === "received" ? (
                  <button
                    onClick={() => actions.updatePackageStatus(item.id, "notified")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Notify guest
                  </button>
                ) : null}
                {item.status !== "picked_up" ? (
                  <button
                    onClick={() => actions.updatePackageStatus(item.id, "picked_up")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Mark picked up
                  </button>
                ) : null}
                <button
                  onClick={() => actions.updatePackageNote(item.id, `${item.note} Front desk handoff note added.`)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Add handoff note
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
