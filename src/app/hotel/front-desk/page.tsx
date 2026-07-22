"use client";

import Link from "next/link";
import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelFrontDeskPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  const arrivalsInPlay = state.stays.filter((stay) => stay.status === "arriving");
  const departuresInPlay = state.stays.filter((stay) => stay.status === "departing");
  const deskItems = state.requests.filter((request) => request.kind === "front_desk" || request.assignedTo === "Front desk" || request.status === "needs_approval");
  const awaitingGuest = state.requests.filter((request) => request.resolutionState === "awaiting_verification");
  const urgentGuestItems = state.requests.filter((request) => request.priority === "urgent" && request.status !== "resolved");
  const reviewNeeded = state.requests.filter((request) => request.triageStatus === "needs_review" && request.status !== "resolved");

  const nowQueue = [
    ...deskItems.map((item) => ({
      id: `request-${item.id}`,
      kind: "request" as const,
      title: `Room ${item.room} · ${item.title}`,
      detail: item.detail,
      meta: `${item.assignedTo} · ${item.sla || "No SLA"} · ${item.routingConfidence || "medium"} confidence`,
      tone: item.triageStatus === "needs_review" ? "queued" : item.priority === "urgent" ? "urgent" : item.status === "needs_approval" ? "queued" : item.priority === "high" ? "high" : "normal",
      request: item,
    })),
    ...arrivalsInPlay.slice(0, 3).map((stay) => ({
      id: `arrival-${stay.id}`,
      kind: "arrival" as const,
      title: `${stay.guestName} arriving · Room ${stay.room}`,
      detail: stay.notes,
      meta: `ETA ${stay.eta} · ${stay.nights} night${stay.nights === 1 ? "" : "s"}`,
      tone: "high" as const,
      stay,
    })),
    ...departuresInPlay.slice(0, 3).map((stay) => ({
      id: `departure-${stay.id}`,
      kind: "departure" as const,
      title: `${stay.guestName} departing · Room ${stay.room}`,
      detail: stay.notes,
      meta: `ETA ${stay.eta} · room turn pressure`,
      tone: "queued" as const,
      stay,
    })),
  ].slice(0, 8);

  const handoffNotes = [
    `${arrivalsInPlay.length} arrivals still need desk awareness before the next wave.`,
    `${departuresInPlay.length} departures are still in play for room turns.`,
    `${deskItems.filter((item) => item.status === "needs_approval").length} desk decisions still need an answer.`,
    `${awaitingGuest.length} requests are waiting on guest confirmation before true closure.`,
  ];

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <HotelPageHeader
          title="Front desk live queue"
          body="The desk should be able to run the next few hours from here: guest issues, arrivals, departures, approvals, and unresolved follow-through in one place."
          action={<div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">Authoritative shift queue</div>}
        />

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <MetricCard label="Desk queue" value={deskItems.length} detail="Requests or exceptions owned by the desk" />
          <MetricCard label="Arrivals in play" value={arrivalsInPlay.length} detail="Upcoming check-ins still needing prep or visibility" />
          <MetricCard label="Departures in play" value={departuresInPlay.length} detail="Checkouts still affecting room release" />
          <MetricCard label="Needs review / guest confirm" value={reviewNeeded.length + awaitingGuest.length} detail="Requests needing desk judgment or final guest confirmation" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Live queue</div>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#17202B]">What the desk has to move right now</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">This combines desk-owned requests with arrivals and departures so the shift does not have to hunt across separate boards.</p>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">{urgentGuestItems.length} urgent · {reviewNeeded.length} review needed</div>
            </div>

            <div className="mt-4 space-y-3">
              {nowQueue.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-[#17202B]">{item.title}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.meta}</div>
                    </div>
                    <HotelStatusPill tone={item.tone}>{item.kind}</HotelStatusPill>
                  </div>
                  <div className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</div>
                  {item.kind === "request" && item.request.triageStatus === "needs_review" ? (
                    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-700">
                      <span className="font-semibold">Desk review required:</span> {item.request.handoffNote || "Low-confidence routing or mixed request needs a human decision before the guest gets a final answer."}
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.kind === "request" ? (
                      <>
                        {item.request.assignedTo !== "Front desk" ? (
                          <button
                            onClick={() => {
                              actions.assignRequest(item.request.id, "Front desk");
                              actions.updateRequestWorkflow(item.request.id, { routeTeam: "Front desk", triageStatus: "approved", dispatcher: "Front desk" });
                              actions.addTimelineEvent(item.request.id, { type: "system", text: "Request routed to front desk.", at: "Now" });
                            }}
                            className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                          >
                            Take ownership
                          </button>
                        ) : null}
                        {item.request.status !== "in_progress" && item.request.status !== "resolved" ? (
                          <button
                            onClick={() => {
                              actions.updateRequestStatus(item.request.id, "in_progress");
                              actions.updateRequestWorkflow(item.request.id, { resolutionState: "staff_dispatched", triageStatus: "approved", dispatcher: "Front desk" });
                              actions.addTimelineEvent(item.request.id, { type: "staff", text: "Front desk is actively working this now.", at: "Now" });
                            }}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                          >
                            Start work
                          </button>
                        ) : null}
                        {item.request.resolutionState !== "awaiting_verification" && item.request.status !== "resolved" ? (
                          <button
                            onClick={() => {
                              actions.updateRequestWorkflow(item.request.id, { resolutionState: "awaiting_verification" });
                              actions.addTimelineEvent(item.request.id, { type: "ai", text: "We believe this is taken care of. Please reply here if anything still needs attention.", at: "Now" });
                            }}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                          >
                            Await guest confirm
                          </button>
                        ) : null}
                        {item.request.triageStatus === "needs_review" ? (
                          <button
                            onClick={() => {
                              actions.updateRequestWorkflow(item.request.id, { triageStatus: "approved", escalationOwner: null, handoffNote: null, dispatcher: "Front desk" });
                              actions.addTimelineEvent(item.request.id, { type: "system", text: "Desk reviewed the routing and approved the current plan.", at: "Now" });
                            }}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                          >
                            Approve routing
                          </button>
                        ) : null}
                        {item.request.status !== "resolved" ? (
                          <button
                            onClick={() => {
                              actions.updateRequestStatus(item.request.id, "resolved");
                              actions.updateRequestWorkflow(item.request.id, { resolutionState: "closed" });
                              actions.addTimelineEvent(item.request.id, { type: "ai", text: "Front desk closed the loop with the guest.", at: "Now" });
                            }}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Close loop
                          </button>
                        ) : null}
                        <Link href={`/hotel/requests/${item.request.id}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">Open thread</Link>
                      </>
                    ) : item.kind === "arrival" ? (
                      <>
                        <button
                          onClick={() => actions.updateStayNote(item.stay.id, `${item.stay.notes} Front desk sent pre-arrival text and confirmed arrival plan.`)}
                          className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                        >
                          Send pre-arrival text
                        </button>
                        <button
                          onClick={() => actions.updateStayStatus(item.stay.id, "checked_in")}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Check in
                        </button>
                        <Link href="/hotel/stays" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">Open arrivals board</Link>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => actions.updateStayNote(item.stay.id, `${item.stay.notes} Front desk sent checkout reminder and coordinated room release.`)}
                          className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                        >
                          Send checkout reminder
                        </button>
                        <button
                          onClick={() => actions.updateStayStatus(item.stay.id, "checked_out")}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Check out
                        </button>
                        <Link href="/hotel/stays" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">Open departures board</Link>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Shift handoff notes</div>
              <div className="mt-4 space-y-3">
                {handoffNotes.map((note) => (
                  <div key={note} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{note}</div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/hotel/shift-board" className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">Open shift board</Link>
                <Link href="/hotel/guest-requests" className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">Open guest inbox</Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Desk queue rules</div>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <div>Run the desk from one queue first, then branch into detail views only when you need depth.</div>
                <div>Arrivals, departures, and guest exceptions share the same clock, so they should share the same shift surface.</div>
                <div>Only move something out of the live queue after the guest is updated or the room is actually released.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#17202B]">{value}</div>
      <div className="mt-1 text-sm leading-6 text-slate-600">{detail}</div>
    </div>
  );
}
