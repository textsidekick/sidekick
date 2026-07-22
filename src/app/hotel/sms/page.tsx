"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

const PRESETS = [
  { room: "118", guestName: "Walk-in guest", message: "Can we get 4 more towels and 2 washcloths?" },
  { room: "214", guestName: "R. Patel", message: "The shower is still not draining and now the bathroom floor is getting wet." },
  { room: "302", guestName: "J. Mendoza", message: "Can I get a late checkout until 1 PM?" },
  { room: "127", guestName: "D. Chen", message: "Where should I park my van overnight?" },
];

export default function HotelSmsConsolePage() {
  const { actions, state, loaded } = useHotelDemoState();
  const [room, setRoom] = useState("118");
  const [guestName, setGuestName] = useState("Walk-in guest");
  const [message, setMessage] = useState("Can we get 4 more towels and 2 washcloths?");
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const examples = useMemo(() => PRESETS, []);

  if (!loaded) return null;

  async function submitSms() {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/hotel/demo-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room, guestName, message }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to process SMS");
      }

      actions.createRequest(data.request, data.timeline || []);
      if (data.roomPatch) {
        actions.updateRoomStatus(room, data.roomPatch.status);
        actions.updateRoomNote(room, data.roomPatch.note);
        actions.updateRoomOwner(room, data.roomPatch.owner);
      }
      if (data.knowledgeSuggestion) {
        actions.addKnowledgeItem(data.knowledgeSuggestion);
      }
      actions.updateShiftNote(
        data.request.kind === "maintenance"
          ? "Maintenance"
          : data.request.kind === "housekeeping"
            ? "Housekeeping"
            : "Guest support",
        `${data.request.title} from room ${room} just came in via SMS and was routed to ${data.request.assignedTo}.`
      );
      setLastResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process SMS");
    } finally {
      setSubmitting(false);
    }
  }

  const createdRequest = lastResult ? state.requests.find((item) => item.id === lastResult.request.id) : null;
  const createdTimeline = createdRequest ? state.requestTimelines[createdRequest.id] || [] : [];
  const relatedStay = createdRequest ? state.stays.find((stay) => stay.room === createdRequest.room || stay.id === createdRequest.stayId) : null;

  const resolutionTone =
    createdRequest?.resolutionState === "closed"
      ? "resolved"
      : createdRequest?.resolutionState === "awaiting_verification"
        ? "queued"
        : createdRequest?.resolutionState === "staff_dispatched"
          ? "high"
          : "normal";

  function sendGuestUpdateFromWorkflow() {
    if (!lastResult || !createdRequest) return;
    actions.addTimelineEvent(createdRequest.id, { type: "ai", text: lastResult.workflow.guestUpdate, at: "Now" });
    actions.updateRequestStatus(createdRequest.id, createdRequest.status === "resolved" ? "resolved" : "in_progress");
    actions.updateRequestWorkflow(createdRequest.id, {
      resolutionState: createdRequest.status === "resolved" ? "closed" : "guest_updated",
      triageStatus: createdRequest.triageStatus === "needs_review" ? "approved" : createdRequest.triageStatus,
      dispatcher: createdRequest.dispatcher || "Sidekick triage",
    });
  }

  function dispatchOwner() {
    if (!lastResult || !createdRequest) return;
    actions.assignRequest(createdRequest.id, lastResult.request.assignedTo);
    actions.addTimelineEvent(createdRequest.id, { type: "system", text: `${lastResult.request.assignedTo} accepted the task and is working it now.`, at: "Now" });
      actions.updateRequestWorkflow(createdRequest.id, {
        resolutionState: "staff_dispatched",
        routeTeam: lastResult.workflow.routeTeam,
        sla: lastResult.workflow.suggestedSla,
        triageStatus: "approved",
        escalationOwner: null,
        handoffNote: null,
        dispatcher: "Sidekick",
      });
  }

  function openRecoveryCase() {
    if (!lastResult || !createdRequest) return;
    actions.createServiceCase({
      id: `svc-${createdRequest.id}`,
      room: createdRequest.room,
      guestName: createdRequest.guestName || "Guest",
      issue: createdRequest.title,
      recovery: "Apologize quickly, set a visible ETA, and prepare a make-good before checkout if the issue continues.",
      owner: createdRequest.assignedTo,
      status: "open",
      valueAtRisk: createdRequest.priority === "urgent" ? "$200+ stay risk" : "$100+ review risk",
    });
    actions.addTimelineEvent(createdRequest.id, { type: "system", text: "Service recovery case opened from SMS triage.", at: "Now" });
  }

  function markAwaitingGuestConfirmation() {
    if (!createdRequest) return;
    actions.updateRequestWorkflow(createdRequest.id, { resolutionState: "awaiting_verification" });
    actions.addTimelineEvent(createdRequest.id, { type: "staff", text: "Work completed internally. Waiting on guest confirmation before closing the request.", at: "Now" });
  }

  function closeResolvedLoop() {
    if (!createdRequest) return;
    actions.updateRequestStatus(createdRequest.id, "resolved");
    actions.updateRequestWorkflow(createdRequest.id, { resolutionState: "closed" });
    actions.addTimelineEvent(createdRequest.id, { type: "ai", text: "Everything should be set now. If anything still looks off, just reply here and we’ll jump back in.", at: "Now" });
  }

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Sidekick text line"
          body="This is the guest-facing and staff-facing communication layer. Test how Sidekick answers, routes work, and closes the loop without forcing the team into heavyweight software."
          action={<div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">SMS workflow active</div>}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">Simulate an incoming text to Sidekick</div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-black/60">
                Room
                <input value={room} onChange={(e) => setRoom(e.target.value)} className="mt-2 w-full rounded-2xl border border-black/10 bg-[#fffdfa] px-3 py-2 text-sm text-[#1C1A16] outline-none" />
              </label>
              <label className="text-sm text-black/60">
                Guest name
                <input value={guestName} onChange={(e) => setGuestName(e.target.value)} className="mt-2 w-full rounded-2xl border border-black/10 bg-[#fffdfa] px-3 py-2 text-sm text-[#1C1A16] outline-none" />
              </label>
            </div>
            <label className="mt-4 block text-sm text-black/60">
              SMS message
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="mt-2 min-h-[120px] w-full rounded-2xl border border-black/10 bg-[#fffdfa] px-3 py-3 text-sm text-[#1C1A16] outline-none" />
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={submitSms} disabled={submitting} className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60">
                {submitting ? "Processing…" : "Process text"}
              </button>
              {examples.map((preset) => (
                <button
                  key={`${preset.room}-${preset.message}`}
                  onClick={() => {
                    setRoom(preset.room);
                    setGuestName(preset.guestName);
                    setMessage(preset.message);
                  }}
                  className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-black/60"
                >
                  Load {preset.room}
                </button>
              ))}
            </div>
        {error ? <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{error}</div> : null}
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">What Sidekick does</div>
              {lastResult ? (
                <div className="mt-4 space-y-3 text-sm text-black/60">
                  <div>
                    <div className="font-semibold text-[#1C1A16]">Reply to guest</div>
                    <div className="mt-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">{lastResult.assistantReply}</div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-[#1C1A16]">Created work</div>
                      <div className="mt-1">{lastResult.request.title}</div>
                    </div>
                    <HotelStatusPill tone={lastResult.request.status === "resolved" ? "resolved" : lastResult.request.status === "needs_approval" ? "queued" : lastResult.request.priority === "urgent" ? "urgent" : lastResult.request.priority === "high" ? "high" : "normal"}>
                      {lastResult.request.status}
                    </HotelStatusPill>
                  </div>
                  <div>Assigned to {lastResult.request.assignedTo}</div>
                  {createdRequest ? (
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-black/35">Resolution state</div>
                        <div className="mt-1 text-sm text-[#1C1A16]">{createdRequest.resolutionState?.replace(/_/g, " ") || "new"}</div>
                      </div>
                      <HotelStatusPill tone={resolutionTone}>{createdRequest.resolutionState?.replace(/_/g, " ") || "new"}</HotelStatusPill>
                    </div>
                  ) : null}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-black/35">What happens next</div>
                    <div className="mt-2 text-sm"><span className="font-semibold text-[#1C1A16]">Route:</span> {lastResult.workflow.routeTeam}</div>
                    <div className="mt-1 text-sm"><span className="font-semibold text-[#1C1A16]">ETA to guest:</span> {lastResult.workflow.suggestedSla}</div>
                    <div className="mt-1 text-sm"><span className="font-semibold text-[#1C1A16]">Review state:</span> {lastResult.workflow.triageStatus?.replace(/_/g, " ")}</div>
                    <div className="mt-1 text-sm leading-6"><span className="font-semibold text-[#1C1A16]">Next step:</span> {lastResult.workflow.nextInternalStep}</div>
                  </div>
                  {lastResult.workflow.humanReviewRequired ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Fallback review state</div>
                      <div className="mt-2">{lastResult.workflow.reviewReason || "A human should review this before promising the guest a final answer."}</div>
                    </div>
                  ) : null}
                  {relatedStay ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-black/35">Stay context</div>
                      <div className="mt-2"><span className="font-semibold text-[#1C1A16]">Guest:</span> {relatedStay.guestName}</div>
                      <div className="mt-1"><span className="font-semibold text-[#1C1A16]">Stay:</span> {relatedStay.status.replace(/_/g, " ")} · {relatedStay.nights} night{relatedStay.nights === 1 ? "" : "s"}</div>
                      <div className="mt-1"><span className="font-semibold text-[#1C1A16]">Note:</span> {relatedStay.notes}</div>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <button onClick={sendGuestUpdateFromWorkflow} className="rounded-full bg-[#26251e] px-3 py-2 text-xs font-medium text-white">Send guest update</button>
                    <button onClick={dispatchOwner} className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-black/60">Dispatch owner</button>
                    <button onClick={markAwaitingGuestConfirmation} className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-black/60">Wait for guest confirm</button>
                <button onClick={closeResolvedLoop} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700">Close loop</button>
                    {createdRequest?.triageStatus === "needs_review" ? (
                      <button onClick={dispatchOwner} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">Approve + dispatch</button>
                    ) : null}
                    {lastResult.workflow.escalationRecommended ? (
                <button onClick={openRecoveryCase} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700">Open Recovery Case</button>
                    ) : null}
                    <Link href={`/hotel/requests/${lastResult.request.id}`} className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-black/60">Open conversation</Link>
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-sm text-black/45">Run a test message to see how Sidekick answers, creates work, and keeps the guest updated.</div>
              )}
            </div>

            <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">Live request timeline</div>
              {createdRequest ? (
                <div className="mt-4 space-y-3">
                  {createdTimeline.map((event) => (
                    <div key={event.id} className={`rounded-2xl px-4 py-3 text-sm leading-6 ${event.type === "guest" ? "bg-[#1d6bf3] text-white" : event.type === "ai" ? "bg-[#f3efe4] text-[#26251e]" : event.type === "staff" ? "bg-[#fff4e8] text-[#8a4a2d]" : "border border-black/5 bg-[#f7f7f6] text-black/65"}`}>
                      <div>{event.text}</div>
                      <div className={`mt-1 text-[11px] ${event.type === "guest" ? "text-white/75" : "text-black/35"}`}>{event.at}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 text-sm text-black/45">Once you process a message, you can watch the guest thread evolve here as you dispatch, update, and recover.</div>
              )}
            </div>

            <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">Why this matters</div>
              <div className="mt-4 space-y-3 text-sm leading-6 text-black/60">
                <div>Hotels pay for this when guest texts stop disappearing between the desk, housekeeping, and maintenance.</div>
                <div>Every message becomes either an auto-answer, a tracked task, or an escalation with ownership.</div>
                <div>That directly improves response times, room readiness, and proactive guest updates.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
