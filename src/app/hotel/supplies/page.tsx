"use client";

import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelSuppliesPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Housekeeping supplies"
          body="Track the stock that quietly breaks hotel operations when it runs low: towels, toiletries, water, pillows, and other guest-comfort essentials."
          action={<div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">{state.supplies.filter((item) => item.stock !== "ok").length} low-stock items</div>}
        />

        <div className="grid gap-4 md:grid-cols-2">
          {state.supplies.map((item) => (
            <div key={item.id} className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-[#1C1A16]">{item.item}</div>
                  <div className="mt-1 text-xs text-black/45">{item.team} · par level {item.par}</div>
                </div>
                <HotelStatusPill tone={item.stock === "critical" ? "urgent" : item.stock === "low" ? "high" : "resolved"}>{item.stock}</HotelStatusPill>
              </div>

              <div className="mt-4 rounded-2xl bg-[#fffdfa] px-4 py-3 text-sm leading-6 text-black/60">{item.note}</div>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.stock !== "ok" ? (
                  <button
                    onClick={() => actions.updateSupplyStock(item.id, "ok")}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    Mark restocked
                  </button>
                ) : null}
                {item.stock !== "critical" ? (
                  <button
                    onClick={() => actions.updateSupplyStock(item.id, "critical")}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    Escalate shortage
                  </button>
                ) : null}
                <button
                  onClick={() => actions.updateSupplyNote(item.id, `${item.note} Purchase run assigned and desk notified.`)}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60"
                >
                  Add procurement note
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
