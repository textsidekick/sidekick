"use client";

import { useMemo, useState } from "react";
import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

const PRESETS = [
  { room: "118", guestName: "Walk-in guest", message: "Can we get 4 more towels and 2 washcloths?" },
  { room: "214", guestName: "R. Patel", message: "The shower is still not draining and now the bathroom floor is getting wet." },
  { room: "302", guestName: "J. Mendoza", message: "Can I get a late checkout until 1 PM?" },
  { room: "127", guestName: "D. Chen", message: "Where should I park my van overnight?" },
];

export default function HotelSmsConsolePage() {
  const { actions, loaded } = useHotelDemoState();
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
            : "Front desk",
        `${data.request.title} from room ${room} just came in via SMS and was routed to ${data.request.assignedTo}.`
      );
      setLastResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process SMS");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <HotelPageHeader
          title="SMS console"
          body="Backend-backed hotel SMS simulation. Use this to test guest texts, auto-replies, routing, and how requests land in the hotel operations queues."
          action={<div className="rounded-full bg-[#f7f1e8] px-4 py-2 text-sm font-medium text-black/60">Prototype backend active</div>}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">Simulate inbound guest SMS</div>
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
              <button onClick={submitSms} disabled={submitting} className="rounded-full bg-[#26251e] px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                {submitting ? "Processing…" : "Process SMS"}
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
            {error ? <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">What the backend returns</div>
              {lastResult ? (
                <div className="mt-4 space-y-3 text-sm text-black/60">
                  <div>
                    <div className="font-semibold text-[#1C1A16]">Assistant reply</div>
                    <div className="mt-1 rounded-2xl bg-[#fff7ec] px-3 py-3">{lastResult.assistantReply}</div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-[#1C1A16]">Created request</div>
                      <div className="mt-1">{lastResult.request.title}</div>
                    </div>
                    <HotelStatusPill tone={lastResult.request.status === "resolved" ? "resolved" : lastResult.request.status === "needs_approval" ? "queued" : lastResult.request.priority === "urgent" ? "urgent" : lastResult.request.priority === "high" ? "high" : "normal"}>
                      {lastResult.request.status}
                    </HotelStatusPill>
                  </div>
                  <div>Assigned to {lastResult.request.assignedTo}</div>
                </div>
              ) : (
                <div className="mt-4 text-sm text-black/45">Run a test message to see the backend classification, auto-reply, and queue routing.</div>
              )}
            </div>

            <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">Why this matters</div>
              <div className="mt-4 space-y-3 text-sm leading-6 text-black/60">
                <div>Hotels pay for this when guest texts stop disappearing into the front desk.</div>
                <div>Every message becomes either an auto-answer, a tracked task, or an escalation with ownership.</div>
                <div>That directly improves response times, room readiness, and service recovery.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
