"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";
import { useState } from "react";

export default function HotelRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const { state, actions, loaded } = useHotelDemoState();
  const [message, setMessage] = useState("");

  if (!loaded) return null;

  const request = state.requests.find((item) => item.id === params.id);
  if (!request) {
    return (
      <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-4xl rounded-3xl border border-black/8 bg-white p-8 shadow-sm">
          <div className="text-lg font-semibold text-[#1C1A16]">Request not found</div>
          <Link href="/hotel/guest-requests" className="mt-4 inline-block text-sm text-[#0060F0]">Back to guest requests</Link>
        </div>
      </div>
    );
  }

  const timeline = state.requestTimelines[request.id] || [];
  const guestFacingTimeline = timeline.filter((event) => event.type === "guest" || event.type === "ai");
  const internalTimeline = timeline.filter((event) => event.type === "staff" || event.type === "system");
  const room = state.rooms.find((item) => item.room === request.room);
  const stay = state.stays.find((item) => item.room === request.room || item.guestName === request.guestName);
  const recoveryCase = state.serviceCases.find((item) => item.room === request.room && (request.guestName ? item.guestName === request.guestName : true));
  const triageSteps = [
    request.status === "needs_approval" ? "Manager approval needed before promising the guest a final exception." : null,
    request.kind === "maintenance" ? "Dispatch maintenance and give the guest a concrete ETA, not a vague promise." : null,
    request.kind === "housekeeping" ? "Coordinate room access and confirm the room is sellable again after service." : null,
    request.priority === "urgent" ? "Keep updates flowing every few minutes until the guest sees visible progress." : null,
    !recoveryCase && (request.priority === "urgent" || request.status === "needs_approval") ? "Consider opening a service recovery case before this turns into a refund or review problem." : null,
  ].filter(Boolean) as string[];
  const resolutionTone =
    request.resolutionState === "closed"
      ? "resolved"
      : request.resolutionState === "awaiting_verification"
        ? "queued"
        : request.resolutionState === "staff_dispatched"
          ? "high"
          : "normal";

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <HotelPageHeader
          eyebrow="Request thread"
          title={`Room ${request.room} · ${request.title}`}
          body={request.detail}
          action={<HotelStatusPill tone={request.status === "resolved" ? "resolved" : request.status === "needs_approval" ? "queued" : request.priority === "urgent" ? "urgent" : request.priority === "high" ? "high" : "normal"}>{request.status}</HotelStatusPill>}
        />

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <ThreadMetric label="Guest state" value={request.resolutionState?.replace(/_/g, " ") || "new"} detail="Where the guest-visible loop currently stands" />
          <ThreadMetric label="Owner" value={request.assignedTo} detail={`${request.routeTeam || "Unrouted"} · ${request.sla || "No SLA"}`} />
          <ThreadMetric label="Stay context" value={stay ? stay.status.replace(/_/g, " ") : "No stay"} detail={stay ? `${stay.nights} night${stay.nights === 1 ? "" : "s"} · ETA ${stay.eta}` : "No matched active stay"} />
          <ThreadMetric label="Routing / room" value={`${request.routingConfidence || "medium"} confidence`} detail={`${request.triageStatus?.replace(/_/g, " ") || "auto routed"} · ${room?.status || "Unknown"}`} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">Guest conversation</div>
                  <div className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#1C1A16]">What the guest has actually seen</div>
                </div>
                <HotelStatusPill tone={resolutionTone}>{request.resolutionState?.replace(/_/g, " ") || "new"}</HotelStatusPill>
              </div>
              <div className="space-y-3">
                {guestFacingTimeline.length ? (
                  guestFacingTimeline.map((event) => (
                    <div key={event.id} className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${event.type === "guest" ? "ml-auto bg-[#1d6bf3] text-white" : "bg-[#f3efe4] text-[#26251e]"}`}>
                      <div>{event.text}</div>
                      <div className={`mt-1 text-[11px] ${event.type === "guest" ? "text-white/70" : "text-black/35"}`}>{event.at}</div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-black/8 bg-[#fffdfa] px-4 py-6 text-sm text-black/45">No guest-visible messages yet.</div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">Internal work log</div>
                  <div className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#1C1A16]">What the hotel team has done behind the scenes</div>
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">{internalTimeline.length} internal events</div>
              </div>
              <div className="space-y-3">
                {internalTimeline.length ? (
                  internalTimeline.map((event) => (
                    <div key={event.id} className={`rounded-2xl px-4 py-3 text-sm leading-6 ${event.type === "staff" ? "bg-[#fff4e8] text-[#8a4a2d]" : "border border-black/5 bg-[#f7f7f6] text-black/65"}`}>
                      <div>{event.text}</div>
                      <div className="mt-1 text-[11px] text-black/35">{event.at}</div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-black/8 bg-[#fffdfa] px-4 py-6 text-sm text-black/45">No internal work has been logged yet.</div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-black/8 bg-[#fffdfa] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-black/35">Add manager/staff update</div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Example: Maintenance entered room, replaced shower cartridge, and told desk to recheck with guest in 10 min."
                className="mt-3 min-h-[90px] w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm text-[#1C1A16] outline-none"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    if (!message.trim()) return;
                    actions.addTimelineEvent(request.id, { type: "staff", text: message.trim(), at: "Now" });
                    setMessage("");
                  }}
                  className="rounded-full bg-[#26251e] px-4 py-2 text-sm font-medium text-white"
                >
                  Log internal update
                </button>
                <button
                  onClick={() => {
                    actions.addTimelineEvent(request.id, { type: "ai", text: "Your request is still being worked on. We’ll update you again shortly.", at: "Now" });
                    actions.updateRequestWorkflow(request.id, { resolutionState: "guest_updated" });
                  }}
                  className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black/60"
                >
                  Send guest update
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-black/8 bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-black/35">Recommended next steps</div>
              <div className="mt-3 space-y-2 text-sm leading-6 text-black/65">
                {triageSteps.length ? (
                  triageSteps.map((step) => (
                    <div key={step} className="rounded-2xl bg-[#fffdfa] px-4 py-3">{step}</div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-[#fffdfa] px-4 py-3">Guest is already stable. Keep one final follow-up on the thread and close the loop.</div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm self-start">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">Request details</div>
            <div className="mt-4 space-y-3 text-sm text-black/60">
              <div><span className="font-semibold text-[#1C1A16]">Owner:</span> {request.assignedTo}</div>
              <div><span className="font-semibold text-[#1C1A16]">Route team:</span> {request.routeTeam || "Not set"}</div>
              <div><span className="font-semibold text-[#1C1A16]">Dispatcher:</span> {request.dispatcher || "Not set"}</div>
              <div><span className="font-semibold text-[#1C1A16]">Routing confidence:</span> {request.routingConfidence || "medium"}</div>
              <div><span className="font-semibold text-[#1C1A16]">Triage:</span> {request.triageStatus?.replace(/_/g, " ") || "auto routed"}</div>
              <div><span className="font-semibold text-[#1C1A16]">Escalation owner:</span> {request.escalationOwner || "None"}</div>
              <div><span className="font-semibold text-[#1C1A16]">Source:</span> {request.source}</div>
              <div><span className="font-semibold text-[#1C1A16]">Guest:</span> {request.guestName || "Not captured"}</div>
              <div><span className="font-semibold text-[#1C1A16]">Wait time:</span> {request.waitMinutes} minutes</div>
              <div><span className="font-semibold text-[#1C1A16]">SLA:</span> {request.sla || "Not set"}</div>
              <div><span className="font-semibold text-[#1C1A16]">Room status:</span> {room?.status || "Unknown"}</div>
              <div><span className="font-semibold text-[#1C1A16]">Stay context:</span> {stay ? `${stay.status.replace("_", " ")} · ${stay.nights} night${stay.nights === 1 ? "" : "s"}` : "No active stay matched"}</div>
            </div>
            {request.handoffNote ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                <span className="font-semibold">Handoff / review note:</span> {request.handoffNote}
              </div>
            ) : null}
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#fffdfa] px-4 py-3 text-sm text-black/60">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-black/35">Resolution state</div>
                <div className="mt-1 text-[#1C1A16]">{request.resolutionState?.replace(/_/g, " ") || "new"}</div>
              </div>
              <HotelStatusPill tone={resolutionTone}>{request.resolutionState?.replace(/_/g, " ") || "new"}</HotelStatusPill>
            </div>
            {room ? (
              <div className="mt-4 rounded-2xl bg-[#fffdfa] px-4 py-3 text-sm leading-6 text-black/60">
                <span className="font-semibold text-[#1C1A16]">Room note:</span> {room.note}
              </div>
            ) : null}
            {recoveryCase ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                <span className="font-semibold">Linked recovery case:</span> {recoveryCase.issue}
                <div className="mt-1 text-xs text-amber-800/80">Status: {recoveryCase.status} · Risk: {recoveryCase.valueAtRisk}</div>
                <Link href="/hotel/service-recovery" className="mt-2 inline-block text-xs font-medium text-amber-900 underline underline-offset-2">Open service recovery board</Link>
              </div>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-2">
              {request.status !== "resolved" ? <button onClick={() => actions.updateRequestStatus(request.id, "resolved")} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">Resolve</button> : null}
              {request.status !== "in_progress" && request.status !== "resolved" ? <button onClick={() => actions.updateRequestStatus(request.id, "in_progress")} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">Start</button> : null}
              {request.assignedTo !== "Front desk" ? <button onClick={() => { actions.assignRequest(request.id, "Front desk"); actions.updateRequestWorkflow(request.id, { routeTeam: "Front desk", triageStatus: "approved", dispatcher: "Front desk" }); actions.addTimelineEvent(request.id, { type: "system", text: "Request routed to front desk from the thread view.", at: "Now" }); }} className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60">Assign front desk</button> : null}
              {request.assignedTo !== "Housekeeping" ? <button onClick={() => { actions.assignRequest(request.id, "Housekeeping"); actions.updateRequestWorkflow(request.id, { routeTeam: "Housekeeping", triageStatus: "approved", dispatcher: "Front desk" }); actions.addTimelineEvent(request.id, { type: "system", text: "Thread rerouted to housekeeping for room follow-through.", at: "Now" }); }} className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60">Assign housekeeping</button> : null}
              {request.assignedTo !== "Maintenance" ? <button onClick={() => { actions.assignRequest(request.id, "Maintenance"); actions.updateRequestWorkflow(request.id, { routeTeam: "Maintenance", triageStatus: "approved", dispatcher: "Front desk" }); actions.addTimelineEvent(request.id, { type: "system", text: "Thread rerouted to maintenance with guest-visible follow-up pending.", at: "Now" }); }} className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60">Assign maintenance</button> : null}
              {request.triageStatus === "needs_review" ? <button onClick={() => { actions.updateRequestWorkflow(request.id, { triageStatus: "approved", escalationOwner: null, handoffNote: null, dispatcher: "Front desk" }); actions.addTimelineEvent(request.id, { type: "system", text: "Desk reviewed and approved the routing from the thread view.", at: "Now" }); }} className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60">Approve routing</button> : null}
              {request.resolutionState !== "awaiting_verification" && request.status !== "resolved" ? <button onClick={() => { actions.updateRequestWorkflow(request.id, { resolutionState: "awaiting_verification" }); actions.addTimelineEvent(request.id, { type: "staff", text: "Internal work is done. Waiting on guest confirmation before closing.", at: "Now" }); }} className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60">Await guest confirm</button> : null}
              {!recoveryCase ? <button onClick={() => {
                actions.createServiceCase({
                  id: `svc-${request.id}`,
                  room: request.room,
                  guestName: request.guestName || "Guest",
                  issue: request.title,
                  recovery: "Offer a concrete apology, set one owner, and confirm a guest-visible make-good before checkout.",
                  owner: request.assignedTo,
                  status: "open",
                  valueAtRisk: request.priority === "urgent" ? "$200+ stay risk" : "$100+ review risk",
                });
                actions.addTimelineEvent(request.id, { type: "system", text: "Service recovery case opened from the request thread.", at: "Now" });
              }} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">Open recovery case</button> : null}
              <Link href="/hotel/guest-requests" className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60">Back to queue</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThreadMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">{label}</div>
      <div className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#1C1A16]">{value}</div>
      <div className="mt-1 text-sm leading-6 text-black/55">{detail}</div>
    </div>
  );
}
