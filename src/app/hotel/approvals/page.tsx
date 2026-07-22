"use client";

import Link from "next/link";
import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelApprovalsPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  const approvals = state.requests.filter((request) => request.status === "needs_approval");

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Approvals"
          body="Manager approvals for late checkout, damage handling, refunds, and other exceptions that need a front-desk or owner decision."
          action={
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
              {approvals.length} pending
            </div>
          }
        />

        <div className="space-y-3">
          {approvals.map((request) => (
            <div key={request.id} className="rounded-3xl border border-black/8 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-[#1C1A16]">Room {request.room} · {request.title}</div>
                  <div className="mt-1 text-xs text-black/45">{request.detail}</div>
                  <div className="mt-2 text-xs text-black/35">Requested by {request.guestName || request.assignedTo} · {request.waitMinutes} min ago</div>
                </div>
                <HotelStatusPill tone="queued">Needs approval</HotelStatusPill>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    actions.updateRequestDetail(request.id, `${request.detail} Approval granted and guest updated.`);
                    actions.updateRequestStatus(request.id, "resolved");
                    actions.addTimelineEvent(request.id, { type: "system", text: "Approval granted by manager.", at: "Now" });
                    actions.addTimelineEvent(request.id, { type: "ai", text: "Good news — your request was approved.", at: "Now" });
                  }}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    actions.updateRequestDetail(request.id, `${request.detail} Approval denied. Front desk asked to offer standard policy alternative.`);
                    actions.assignRequest(request.id, "Front desk");
                    actions.addTimelineEvent(request.id, { type: "system", text: "Approval denied. Front desk follow-up required.", at: "Now" });
                  }}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                >
                  Deny
                </button>
                <button
                  onClick={() => { actions.assignRequest(request.id, "Maya"); actions.addTimelineEvent(request.id, { type: "system", text: "Approval task assigned to Maya.", at: "Now" }); }}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60"
                >
                  Assign Maya
                </button>
                <Link href={`/hotel/requests/${request.id}`} className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60">Open thread</Link>
              </div>
            </div>
          ))}

          {approvals.length === 0 ? (
            <div className="rounded-3xl border border-black/8 bg-white px-5 py-10 text-center text-sm text-black/45 shadow-sm">
              No approvals pending right now.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
