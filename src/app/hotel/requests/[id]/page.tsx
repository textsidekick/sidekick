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
          <Link href="/hotel/guest-requests" className="mt-4 inline-block text-sm text-[#C96442]">Back to guest requests</Link>
        </div>
      </div>
    );
  }

  const timeline = state.requestTimelines[request.id] || [];

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <HotelPageHeader
          eyebrow="Request thread"
          title={`Room ${request.room} · ${request.title}`}
          body={request.detail}
          action={<HotelStatusPill tone={request.status === "resolved" ? "resolved" : request.status === "needs_approval" ? "queued" : request.priority === "urgent" ? "urgent" : request.priority === "high" ? "high" : "normal"}>{request.status}</HotelStatusPill>}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">Conversation + system timeline</div>
            <div className="space-y-3">
              {timeline.map((event) => (
                <div key={event.id} className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${event.type === "guest" ? "bg-[#1d6bf3] text-white ml-auto" : event.type === "ai" ? "bg-[#f3efe4] text-[#26251e]" : event.type === "staff" ? "bg-[#fff4e8] text-[#8a4a2d]" : "bg-[#f7f7f6] text-black/65 border border-black/5"}`}>
                  <div>{event.text}</div>
                  <div className={`mt-1 text-[11px] ${event.type === "guest" ? "text-white/70" : "text-black/35"}`}>{event.at}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-black/8 bg-[#fffdfa] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-black/35">Add manager/staff update</div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Example: Guest notified that maintenance is on the way."
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
                  Add update
                </button>
                <button
                  onClick={() => actions.addTimelineEvent(request.id, { type: "ai", text: "Your request is still being worked on. We’ll update you again shortly.", at: "Now" })}
                  className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black/60"
                >
                  Send guest update
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm self-start">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">Request details</div>
            <div className="mt-4 space-y-3 text-sm text-black/60">
              <div><span className="font-semibold text-[#1C1A16]">Owner:</span> {request.assignedTo}</div>
              <div><span className="font-semibold text-[#1C1A16]">Source:</span> {request.source}</div>
              <div><span className="font-semibold text-[#1C1A16]">Guest:</span> {request.guestName || "Not captured"}</div>
              <div><span className="font-semibold text-[#1C1A16]">Wait time:</span> {request.waitMinutes} minutes</div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {request.status !== "resolved" ? <button onClick={() => actions.updateRequestStatus(request.id, "resolved")} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Resolve</button> : null}
              {request.status !== "in_progress" && request.status !== "resolved" ? <button onClick={() => actions.updateRequestStatus(request.id, "in_progress")} className="rounded-full bg-[#f7f1e8] px-3 py-1 text-xs font-medium text-[#1C1A16]">Start</button> : null}
              <Link href="/hotel/guest-requests" className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60">Back to queue</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
