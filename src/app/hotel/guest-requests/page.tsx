"use client";

import Link from "next/link";
import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelGuestRequestsPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  const requests = state.requests.filter((item) => item.kind === "guest" || item.source === "guest sms" || item.kind === "front_desk");

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Guest requests"
          body="This queue is hotel-specific: guest texts, concierge answers, approvals, and task-linked updates."
        />
        <div className="overflow-hidden rounded-3xl border border-black/8 bg-white shadow-sm">
          {requests.map((request) => (
            <div key={request.id} className="border-b border-black/5 px-5 py-4 last:border-b-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-[#1C1A16]">Room {request.room} · {request.title}</div>
                  <div className="mt-1 text-xs text-black/45">{request.detail}</div>
                  <div className="mt-2 text-xs text-black/35">Owner: {request.assignedTo} · Source: {request.source}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <HotelStatusPill tone={request.status === "resolved" ? "resolved" : request.status === "needs_approval" ? "queued" : request.priority === "high" ? "high" : "normal"}>
                    {request.status === "resolved" ? "Resolved" : request.status === "needs_approval" ? "Needs approval" : request.status === "in_progress" ? "In progress" : "Open"}
                  </HotelStatusPill>
                  <div className="text-xs text-black/40">{request.waitMinutes} min ago</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {request.status !== "in_progress" && request.status !== "resolved" ? (
                  <button onClick={() => { actions.updateRequestStatus(request.id, "in_progress"); actions.addTimelineEvent(request.id, { type: "system", text: "Front desk started working the request.", at: "Now" }); }} className="rounded-full bg-[#f7f1e8] px-3 py-1 text-xs font-medium text-[#1C1A16]">Start</button>
                ) : null}
                {request.status !== "resolved" ? (
                  <button onClick={() => { actions.updateRequestStatus(request.id, "resolved"); actions.addTimelineEvent(request.id, { type: "ai", text: "Your request is complete. Let us know if you need anything else.", at: "Now" }); }} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Mark resolved</button>
                ) : null}
                {request.assignedTo !== "Front desk" ? (
                  <button onClick={() => { actions.assignRequest(request.id, "Front desk"); actions.addTimelineEvent(request.id, { type: "system", text: "Request assigned to front desk.", at: "Now" }); }} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-black/60 border border-black/10">Assign front desk</button>
                ) : null}
                <Link href={`/hotel/requests/${request.id}`} className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60">Open thread</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
