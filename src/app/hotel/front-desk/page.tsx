"use client";

import Link from "next/link";
import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelFrontDeskPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  const deskItems = state.requests.filter((request) => request.kind === "front_desk" || request.assignedTo === "Front desk" || request.status === "needs_approval");

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Front desk board"
          body="The live board for guest-facing coordination: late checkout, policy exceptions, parking, refunds, and requests that need desk follow-through."
        />

        <div className="space-y-3">
          {deskItems.map((item) => (
            <div key={item.id} className="rounded-3xl border border-black/8 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-[#1C1A16]">Room {item.room} · {item.title}</div>
                  <div className="mt-1 text-xs text-black/45">{item.detail}</div>
                  <div className="mt-2 text-xs text-black/35">Owner: {item.assignedTo} · Guest: {item.guestName || "Not captured"}</div>
                </div>
                <HotelStatusPill tone={item.status === "resolved" ? "resolved" : item.status === "needs_approval" ? "queued" : item.priority === "high" ? "high" : "normal"}>
                  {item.status}
                </HotelStatusPill>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.assignedTo !== "Front desk" ? (
                  <button
                    onClick={() => {
                      actions.assignRequest(item.id, "Front desk");
                      actions.addTimelineEvent(item.id, { type: "system", text: "Request routed to front desk.", at: "Now" });
                    }}
                    className="rounded-full bg-[#f7f1e8] px-3 py-1 text-xs font-medium text-[#1C1A16]"
                  >
                    Route to front desk
                  </button>
                ) : null}
                {item.status !== "resolved" ? (
                  <button
                    onClick={() => {
                      actions.updateRequestStatus(item.id, "resolved");
                      actions.addTimelineEvent(item.id, { type: "ai", text: "Front desk closed the loop with the guest.", at: "Now" });
                    }}
                    className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                  >
                    Close loop
                  </button>
                ) : null}
                <button
                  onClick={() => {
                    actions.addTimelineEvent(item.id, { type: "staff", text: "Front desk left voicemail and sent follow-up text.", at: "Now" });
                  }}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60"
                >
                  Log follow-up
                </button>
                <Link href={`/hotel/requests/${item.id}`} className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60">Open thread</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
