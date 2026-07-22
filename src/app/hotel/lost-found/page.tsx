"use client";

import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelLostFoundPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Lost & found"
          body="Keep found items from turning into front-desk chaos. Log what was found, contact the guest, and track pickup or shipping follow-through."
          action={<div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">{state.lostFoundItems.length} tracked items</div>}
        />

        <div className="space-y-3">
          {state.lostFoundItems.map((item) => (
            <div key={item.id} className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-[#1C1A16]">Room {item.room} · {item.item}</div>
                  <div className="mt-1 text-xs text-black/45">Guest: {item.guestName} · Found in {item.locationFound}</div>
                  <div className="mt-2 text-xs text-black/35">Owner: {item.owner}</div>
                </div>
                <HotelStatusPill tone={item.status === "claimed" || item.status === "shipped" ? "resolved" : item.status === "contacted" ? "queued" : "normal"}>{item.status}</HotelStatusPill>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">{item.note}</div>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.status === "logged" ? (
                  <button
                    onClick={() => actions.updateLostFoundStatus(item.id, "contacted")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Contact guest
                  </button>
                ) : null}
                {item.status !== "claimed" && item.status !== "shipped" ? (
                  <button
                    onClick={() => actions.updateLostFoundStatus(item.id, "claimed")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Mark pickup arranged
                  </button>
                ) : null}
                {item.status !== "shipped" ? (
                  <button
                    onClick={() => actions.updateLostFoundStatus(item.id, "shipped")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Mark shipped
                  </button>
                ) : null}
                <button
                  onClick={() => actions.updateLostFoundNote(item.id, `${item.note} Shipping address confirmed and guest received tracking update.`)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Add follow-up
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
