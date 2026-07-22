"use client";

import Link from "next/link";
import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelServiceRecoveryPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  const openCases = state.serviceCases.filter((item) => item.status !== "closed");
  const openLinkedRequests = state.requests.filter(
    (request) =>
      request.status !== "resolved" &&
      state.serviceCases.some(
        (serviceCase) =>
          serviceCase.room === request.room &&
          (!request.guestName || serviceCase.guestName === request.guestName)
      )
  );
  const awaitingGuest = state.requests.filter((request) => request.resolutionState === "awaiting_verification");
  const urgentWithoutCase = state.requests.filter(
    (request) =>
      request.priority === "urgent" &&
      request.status !== "resolved" &&
      !state.serviceCases.some(
        (serviceCase) =>
          serviceCase.room === request.room &&
          (!request.guestName || serviceCase.guestName === request.guestName)
      )
  );

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="Service recovery"
          body="Save-the-stay cases, refund handling, and high-risk guest issues before they turn into bad reviews, chargebacks, or lost repeat business."
          action={<div className="rounded-full bg-[#f7f1e8] px-4 py-2 text-sm font-medium text-black/60">{openCases.length} open recovery cases</div>}
        />

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <MetricCard label="Open cases" value={openCases.length} detail="Guests still at risk of a bad review, refund, or churn" />
          <MetricCard label="Linked live requests" value={openLinkedRequests.length} detail="Requests that still need operational follow-through" />
          <MetricCard label="Awaiting guest confirm" value={awaitingGuest.length} detail="Internally fixed, but not yet safe to truly close" />
          <MetricCard label="Urgent without case" value={urgentWithoutCase.length} detail="High-risk guest issues that may still need a recovery decision" />
        </div>

        {urgentWithoutCase.length ? (
          <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-900/70">Recovery watchlist</div>
            <div className="mt-2 text-xl font-semibold tracking-[-0.03em] text-amber-950">Urgent guest issues that still need a save-the-stay decision</div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {urgentWithoutCase.slice(0, 4).map((request) => (
                <div key={request.id} className="rounded-2xl bg-white px-4 py-4 text-sm text-amber-950">
                  <div className="font-semibold">Room {request.room} · {request.title}</div>
                  <div className="mt-1 text-amber-900/75">{request.detail}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        actions.createServiceCase({
                          id: `svc-${request.id}`,
                          room: request.room,
                          guestName: request.guestName || "Guest",
                          issue: request.title,
                          recovery: "Apologize clearly, give one owner, and set a guest-visible make-good before checkout.",
                          owner: request.assignedTo,
                          status: "open",
                          valueAtRisk: request.priority === "urgent" ? "$200+ stay risk" : "$100+ review risk",
                        });
                        actions.addTimelineEvent(request.id, { type: "system", text: "Service recovery case opened from the recovery watchlist.", at: "Now" });
                      }}
                      className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-950"
                    >
                      Open recovery case
                    </button>
                    <Link href={`/hotel/requests/${request.id}`} className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-medium text-amber-900">
                      Open request
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          {state.serviceCases.map((item) => (
            <div key={item.id} className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              {(() => {
                const linkedRequest = state.requests.find(
                  (request) =>
                    request.room === item.room &&
                    (request.guestName ? request.guestName === item.guestName : true)
                );
                const linkedStay = state.stays.find((stay) => stay.room === item.room && stay.guestName === item.guestName);

                return (
                  <>
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

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-[#fffdfa] px-4 py-3 text-sm text-black/60">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-black/35">Linked request</div>
                  {linkedRequest ? (
                    <>
                      <div className="mt-2 font-semibold text-[#1C1A16]">{linkedRequest.title}</div>
                      <div className="mt-1">{linkedRequest.resolutionState?.replace(/_/g, " ") || "new"} · {linkedRequest.sla || "No SLA"}</div>
                    </>
                  ) : (
                    <div className="mt-2">No active request thread linked yet.</div>
                  )}
                </div>
                <div className="rounded-2xl bg-[#fffdfa] px-4 py-3 text-sm text-black/60">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-black/35">Stay context</div>
                  {linkedStay ? (
                    <>
                      <div className="mt-2 font-semibold text-[#1C1A16]">{linkedStay.status.replace(/_/g, " ")} · ETA {linkedStay.eta}</div>
                      <div className="mt-1">{linkedStay.nights} night{linkedStay.nights === 1 ? "" : "s"} · {linkedStay.notes}</div>
                    </>
                  ) : (
                    <div className="mt-2">No active stay matched.</div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.status === "open" ? (
                  <button
                    onClick={() => {
                      actions.updateServiceCaseStatus(item.id, "offered");
                      if (linkedRequest) {
                        actions.addTimelineEvent(linkedRequest.id, { type: "staff", text: "Service recovery was offered to protect the stay while the issue is still active.", at: "Now" });
                      }
                    }}
                    className="rounded-full bg-[#f7f1e8] px-3 py-1 text-xs font-medium text-[#1C1A16]"
                  >
                    Offer recovery
                  </button>
                ) : null}
                {item.status !== "saved" && item.status !== "closed" ? (
                  <button
                    onClick={() => {
                      actions.updateServiceCaseStatus(item.id, "saved");
                      if (linkedRequest) {
                        actions.updateRequestWorkflow(linkedRequest.id, { resolutionState: "awaiting_verification" });
                        actions.addTimelineEvent(linkedRequest.id, { type: "ai", text: "We’ve taken care of this and added a make-good on our side. Please let us know if anything still feels off.", at: "Now" });
                      }
                    }}
                    className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                  >
                    Mark saved
                  </button>
                ) : null}
                {item.status !== "closed" ? (
                  <button
                    onClick={() => {
                      actions.updateServiceCaseStatus(item.id, "closed");
                      if (linkedRequest && linkedRequest.status !== "resolved") {
                        actions.addTimelineEvent(linkedRequest.id, { type: "system", text: "Service recovery case closed. Confirm the guest is stable before ending the request thread.", at: "Now" });
                      }
                    }}
                    className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60"
                  >
                    Close case
                  </button>
                ) : null}
                <button
                  onClick={() => {
                    actions.updateServiceCaseRecovery(item.id, `${item.recovery} Guest received a follow-up text and manager callback window.`);
                    if (linkedRequest) {
                      actions.addTimelineEvent(linkedRequest.id, { type: "staff", text: "Recovery plan expanded with guest follow-up text and manager callback window.", at: "Now" });
                    }
                  }}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60"
                >
                  Add follow-up plan
                </button>
                {linkedRequest ? (
                  <Link href={`/hotel/requests/${linkedRequest.id}`} className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60">
                    Open request thread
                  </Link>
                ) : null}
              </div>
                  </>
                );
              })()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">{label}</div>
      <div className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#1C1A16]">{value}</div>
      <div className="mt-1 text-sm leading-6 text-black/55">{detail}</div>
    </div>
  );
}
