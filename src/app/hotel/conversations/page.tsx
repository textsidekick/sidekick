"use client";

import Link from "next/link";
import { HotelPageHeader, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelConversationsPage() {
  const { state, loaded } = useHotelDemoState();

  if (!loaded) return null;

  const threads = state.requests.filter((item) => item.status !== "resolved");
  const columns = [
    {
      key: "new",
      title: "New",
      detail: "New texts that Sidekick still needs to answer or route.",
      items: threads.filter((request) => !request.resolutionState || request.resolutionState === "new" || request.triageStatus === "needs_review"),
      tone: "normal" as const,
    },
    {
      key: "active",
      title: "Active",
      detail: "Sidekick has replied and the owner is working the request.",
      items: threads.filter((request) => request.status === "in_progress" || request.resolutionState === "guest_updated" || request.resolutionState === "staff_dispatched"),
      tone: "high" as const,
    },
    {
      key: "waiting",
      title: "Waiting on guest",
      detail: "Internal work is done and Sidekick is waiting for the guest reply.",
      items: threads.filter((request) => request.resolutionState === "awaiting_verification"),
      tone: "queued" as const,
    },
  ];

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <HotelPageHeader
          title="Conversations"
          body="One inbox for the hotel. Guests and staff text Sidekick, Sidekick keeps the thread, routes the work, and gives management one live view of what is still open."
          action={<div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">{threads.length} open threads</div>}
        />

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Guest side</div>
            <div className="mt-2 text-sm leading-6 text-slate-600">Guests should just text Sidekick for questions, towels, cleaning, issues, or room updates.</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Staff side</div>
            <div className="mt-2 text-sm leading-6 text-slate-600">Housekeeping and maintenance should text updates naturally without learning a heavy tool.</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Media-ready</div>
            <div className="mt-2 text-sm leading-6 text-slate-600">Photos, videos, and voice notes should attach directly to the conversation and carry into the task history.</div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {columns.map((column) => (
            <div key={column.key} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Conversation lane</div>
                  <div className="mt-2 text-lg font-semibold text-[#17202B]">{column.title}</div>
                </div>
                <HotelStatusPill tone={column.tone}>{column.items.length}</HotelStatusPill>
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-600">{column.detail}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {columns.map((column) => (
            <div key={column.key} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
              <div className="border-b border-slate-200 px-2 pb-3">
                <div className="text-sm font-semibold text-[#17202B]">{column.title}</div>
                <div className="mt-1 text-xs text-slate-500">{column.items.length} threads</div>
              </div>

              <div className="mt-4 space-y-3">
                {column.items.length ? column.items.map((request) => {
                  const stay = state.stays.find((item) => item.room === request.room || item.id === request.stayId);
                  const tone = request.priority === "urgent" ? "urgent" : request.triageStatus === "needs_review" ? "queued" : request.status === "in_progress" ? "high" : "normal";
                  return (
                    <div key={request.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-[#17202B]">Room {request.room} · {request.guestName || "Guest"}</div>
                          <div className="mt-1 text-xs text-slate-500">{request.title}</div>
                        </div>
                        <HotelStatusPill tone={tone}>{request.status === "needs_approval" ? "Review" : request.status === "in_progress" ? "Working" : "Open"}</HotelStatusPill>
                      </div>
                      <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600">
                        <div><span className="font-semibold text-[#17202B]">Guest said:</span> {request.detail}</div>
                        <div className="mt-1"><span className="font-semibold text-[#17202B]">Owner:</span> {request.assignedTo}</div>
                        <div className="mt-1"><span className="font-semibold text-[#17202B]">Next promise:</span> {request.sla || "No ETA set"}</div>
                        <div className="mt-1"><span className="font-semibold text-[#17202B]">Context:</span> {stay ? `${stay.status.replace(/_/g, " ")} · ${stay.nights} night stay` : "No stay context"}</div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600">Text thread</span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600">Photo / video / voice ready</span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600">Learns property context</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link href={`/hotel/requests/${request.id}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Open conversation</Link>
                        <Link href="/hotel/tasks" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">Open task</Link>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">Nothing in this lane right now.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
