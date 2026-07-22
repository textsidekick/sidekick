"use client";

import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelServiceRecoveryPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Service recovery"
          body="Save-the-stay cases, refund handling, and high-risk guest issues before they turn into bad reviews, chargebacks, or lost repeat business."
          action={<div className="rounded-full bg-[#f7f1e8] px-4 py-2 text-sm font-medium text-black/60">{state.serviceCases.filter((item) => item.status !== "closed").length} open recovery cases</div>}
        />

        <div className="space-y-3">
          {state.serviceCases.map((item) => (
            <div key={item.id} className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-[#1C1A16]">Room {item.room} · {item.guestName}</div>
                  <div className="mt-1 text-xs text-black/45">{item.issue}</div>
                  <div className="mt-2 text-xs text-black/35">Owner: {item.owner} · Revenue / review risk: {item.valueAtRisk}</div>
                </div>
                <HotelStatusPill tone={item.status === "saved" || item.status === "closed" ? "resolved" : item.status === "offered" ? "queued" : "high"}>{item.status}</HotelStatusPill>
              </div>

              <div className="mt-4 rounded-2xl bg-[#fffdfa] px-4 py-3 text-sm leading-6 text-black/60">
                <span className="font-semibold text-[#1C1A16]">Recovery plan:</span> {item.recovery}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.status === "open" ? (
                  <button
                    onClick={() => actions.updateServiceCaseStatus(item.id, "offered")}
                    className="rounded-full bg-[#f7f1e8] px-3 py-1 text-xs font-medium text-[#1C1A16]"
                  >
                    Offer recovery
                  </button>
                ) : null}
                {item.status !== "saved" && item.status !== "closed" ? (
                  <button
                    onClick={() => actions.updateServiceCaseStatus(item.id, "saved")}
                    className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                  >
                    Mark saved
                  </button>
                ) : null}
                {item.status !== "closed" ? (
                  <button
                    onClick={() => actions.updateServiceCaseStatus(item.id, "closed")}
                    className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60"
                  >
                    Close case
                  </button>
                ) : null}
                <button
                  onClick={() => actions.updateServiceCaseRecovery(item.id, `${item.recovery} Guest received a follow-up text and manager callback window.`)}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60"
                >
                  Add follow-up plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
