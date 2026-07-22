"use client";

import Link from "next/link";
import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelGuestRequestsPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  const requests = state.requests.filter((item) => item.kind === "guest" || item.source === "guest sms" || item.kind === "front_desk");
  const inboxColumns = [
    {
      key: "new",
      title: "New",
      detail: "Fresh guest issues that still need an owner or first update.",
      items: requests.filter((request) => !request.resolutionState || request.resolutionState === "new" || request.triageStatus === "needs_review"),
      tone: "normal" as const,
    },
    {
      key: "working",
      title: "Working",
      detail: "Guests have been updated or the owner has already started on the task.",
      items: requests.filter((request) => request.resolutionState === "guest_updated" || request.resolutionState === "staff_dispatched" || request.status === "in_progress"),
      tone: "high" as const,
    },
    {
      key: "verify",
      title: "Awaiting guest confirm",
      detail: "Internal work is done but the guest has not confirmed the fix yet.",
      items: requests.filter((request) => request.resolutionState === "awaiting_verification"),
      tone: "queued" as const,
    },
  ];

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Guest requests"
          body="This queue is hotel-specific: guest texts, concierge answers, approvals, and task-linked updates. It now behaves more like an operational inbox than a flat list."
        />
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {inboxColumns.map((column) => (
            <div key={column.key} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Inbox lane</div>
                  <div className="mt-2 text-lg font-semibold text-[#17202B]">{column.title}</div>
                </div>
                <HotelStatusPill tone={column.tone}>{column.items.length}</HotelStatusPill>
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-600">{column.detail}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {inboxColumns.map((column) => (
            <div key={column.key} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
              <div className="border-b border-slate-200 px-2 pb-3">
                <div className="text-sm font-semibold text-[#17202B]">{column.title}</div>
                <div className="mt-1 text-xs text-slate-500">{column.items.length} items in this lane</div>
              </div>

              <div className="mt-4 space-y-3">
                {column.items.length ? (
                  column.items.map((request) => {
                    const stay = state.stays.find((item) => item.room === request.room || item.id === request.stayId);
                    const resolutionLabel = request.resolutionState?.replace(/_/g, " ") || "new";
                    const statusTone = request.status === "resolved" ? "resolved" : request.triageStatus === "needs_review" || request.status === "needs_approval" ? "queued" : request.priority === "urgent" ? "urgent" : request.priority === "high" || request.resolutionState === "staff_dispatched" ? "high" : "normal";

                    return (
                      <div key={request.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-[#17202B]">Room {request.room} · {request.title}</div>
                            <div className="mt-1 text-xs text-slate-500">{request.detail}</div>
                          </div>
                          <HotelStatusPill tone={statusTone}>{request.status === "needs_approval" ? "Needs approval" : request.status === "in_progress" ? "In progress" : request.status === "resolved" ? "Resolved" : "Open"}</HotelStatusPill>
                        </div>

                        <div className="mt-3 grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-500">
                          <div><span className="font-semibold text-[#17202B]">Resolution:</span> {resolutionLabel}</div>
                          <div><span className="font-semibold text-[#17202B]">Owner:</span> {request.assignedTo} · {request.routeTeam || "Unrouted"}</div>
                          <div><span className="font-semibold text-[#17202B]">SLA:</span> {request.sla || "Not set"}</div>
                          <div><span className="font-semibold text-[#17202B]">Routing:</span> {request.routingConfidence || "medium"} confidence · {request.triageStatus?.replace(/_/g, " ") || "auto routed"}</div>
                          <div><span className="font-semibold text-[#17202B]">Stay:</span> {stay ? `${stay.status.replace(/_/g, " ")} · ${stay.nights} night${stay.nights === 1 ? "" : "s"}` : "No stay context"}</div>
                        </div>
                        {request.triageStatus === "needs_review" ? (
                          <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-3 text-xs leading-5 text-blue-800">
                            <span className="font-semibold">Review needed:</span> {request.handoffNote || "Desk should confirm routing or split this request before the guest gets a final answer."}
                          </div>
                        ) : null}

                        <div className="mt-3 flex flex-wrap gap-2">
                          {request.status !== "in_progress" && request.status !== "resolved" ? (
                            <button onClick={() => { actions.updateRequestStatus(request.id, "in_progress"); actions.updateRequestWorkflow(request.id, { resolutionState: "staff_dispatched" }); actions.addTimelineEvent(request.id, { type: "system", text: "Front desk started working the request.", at: "Now" }); }} className="rounded-full bg-[#2F5D8A] px-3 py-1 text-xs font-medium text-white">Start</button>
                          ) : null}
                          {request.resolutionState !== "awaiting_verification" && request.status !== "resolved" ? (
                            <button onClick={() => { actions.updateRequestWorkflow(request.id, { resolutionState: "awaiting_verification" }); actions.addTimelineEvent(request.id, { type: "ai", text: "We believe this is taken care of. Please reply here if anything still needs attention.", at: "Now" }); }} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">Await verify</button>
                          ) : null}
                          {request.status !== "resolved" ? (
                            <button onClick={() => { actions.updateRequestStatus(request.id, "resolved"); actions.updateRequestWorkflow(request.id, { resolutionState: "closed" }); actions.addTimelineEvent(request.id, { type: "ai", text: "Your request is complete. Let us know if you need anything else.", at: "Now" }); }} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Close</button>
                          ) : null}
                          {request.assignedTo !== "Front desk" ? (
                            <button onClick={() => { actions.assignRequest(request.id, "Front desk"); actions.updateRequestWorkflow(request.id, { routeTeam: "Front desk", triageStatus: "approved", dispatcher: "Front desk" }); actions.addTimelineEvent(request.id, { type: "system", text: "Request assigned to front desk.", at: "Now" }); }} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 border border-slate-200">Assign desk</button>
                          ) : null}
                          {request.triageStatus === "needs_review" ? (
                            <button onClick={() => { actions.updateRequestWorkflow(request.id, { triageStatus: "approved", escalationOwner: null, handoffNote: null, dispatcher: "Front desk" }); actions.addTimelineEvent(request.id, { type: "system", text: "Desk reviewed and approved the current routing path.", at: "Now" }); }} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 border border-slate-200">Approve routing</button>
                          ) : null}
                          <Link href={`/hotel/requests/${request.id}`} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">Open thread</Link>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                    Nothing in this lane right now.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
