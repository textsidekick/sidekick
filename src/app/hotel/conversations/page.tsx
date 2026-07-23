"use client";

import { useMemo, useState } from "react";
import { HotelPageHeader, HotelSourcePill, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";
import { askSidekickExamples } from "@/lib/hotel-demo-view";

const tabs = ["All", "Guests", "Staff", "Escalated", "Unresolved", "AI Resolved"] as const;

const conversationMeta: Record<string, { person: string; role: string; language: string; urgency: string; unread?: boolean; latest: string; assignedTo: string; status: string; translated?: boolean }> = {
  "req-111-cleaning": { person: "Front desk", role: "Staff", language: "English", urgency: "High", unread: true, latest: "Checkout-style cleaning entered for Room 111.", assignedTo: "Maria", status: "Awaiting acknowledgment" },
  "req-118-towels": { person: "Walk-in guest", role: "Guest", language: "English", urgency: "Normal", unread: true, latest: "Can you send a couple more towels to room 118?", assignedTo: "Elena", status: "Assigned" },
  "req-127-parking": { person: "D. Chen", role: "Guest", language: "English", urgency: "Low", latest: "Can I park an oversized vehicle here overnight?", assignedTo: "AI resolved", status: "AI Resolved" },
  "req-204-lamp": { person: "Elena", role: "Staff", language: "English", urgency: "High", unread: true, latest: "Photo uploaded from Room 204. Lamp looks damaged near the base.", assignedTo: "Maya", status: "Manager review" },
  "req-218-water": { person: "Julio", role: "Staff", language: "Spanish", urgency: "Urgent", unread: true, latest: "Hay agua juntándose cerca del zócalo del baño en la 218.", assignedTo: "Julio + Maya", status: "Escalated", translated: true },
  "req-304-cleaning": { person: "K. Morgan", role: "Guest", language: "English", urgency: "Normal", latest: "Can someone clean my room while I’m out?", assignedTo: "Elena", status: "Closed" },
  "req-117-carpet": { person: "Housekeeping", role: "Staff", language: "English", urgency: "High", latest: "Photo uploaded from Room 117. Carpet stain near the desk area.", assignedTo: "Housekeeping", status: "Awaiting verification" },
  "req-lobby-ice": { person: "Maya", role: "Manager", language: "English", urgency: "High", latest: "Repeat guest complaints about the ice machine.", assignedTo: "Julio", status: "In progress" },
};

export default function HotelConversationsPage() {
  const { state, actions, loaded } = useHotelDemoState();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All");
  const [activeId, setActiveId] = useState("req-218-water");
  const [draftReply, setDraftReply] = useState("");
  const [internalNote, setInternalNote] = useState("");

  if (!loaded) return null;

  const allConversations = state.requests.map((request) => ({
    ...request,
    ...(conversationMeta[request.id] || {
      person: request.guestName || request.assignedTo,
      role: request.guestName ? "Guest" : "Staff",
      language: "English",
      urgency: request.priority,
      latest: request.detail,
      assignedTo: request.assignedTo,
      status: request.status,
    }),
  }));

  const filtered = useMemo(() => {
    return allConversations.filter((item) => {
      if (activeTab === "All") return true;
      if (activeTab === "Guests") return item.role === "Guest";
      if (activeTab === "Staff") return item.role !== "Guest";
      if (activeTab === "Escalated") return item.status === "Escalated" || item.status === "Manager review";
      if (activeTab === "Unresolved") return item.status !== "Closed" && item.status !== "AI Resolved";
      if (activeTab === "AI Resolved") return item.status === "AI Resolved";
      return true;
    });
  }, [activeTab, allConversations]);

  const activeConversation = filtered.find((item) => item.id === activeId) || filtered[0];
  const timeline = activeConversation ? state.requestTimelines[activeConversation.id] || [] : [];

  function reassignConversation(target: string) {
    if (!activeConversation) return;
    actions.assignRequest(activeConversation.id, target);
    actions.addTimelineEvent(activeConversation.id, { type: "system", text: `Conversation reassigned to ${target}.`, at: "Now" });
  }

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1460px]">
        <HotelPageHeader
          eyebrow="Inbox"
          title="One message workspace for the whole property"
          body="Guest conversations, housekeeping updates, maintenance notes, manager instructions, and Sidekick actions all live in one operational inbox."
          action={<div className="rounded-[10px] border border-[#E1E5E2] bg-white px-4 py-2 text-sm font-medium text-[#18222C]">{filtered.length} conversations</div>}
        />

        <div className="mb-5 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? "rounded-full bg-[#18222C] px-3 py-1.5 text-xs font-semibold text-white" : "rounded-full border border-[#E1E5E2] bg-white px-3 py-1.5 text-xs font-semibold text-[#5C6975]"}>
              {tab}
            </button>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <section className="rounded-2xl border border-[#E1E5E2] bg-white p-4">
            <div className="space-y-3">
              {filtered.map((conversation) => (
                <button key={conversation.id} onClick={() => setActiveId(conversation.id)} className={conversation.id === activeConversation?.id ? "w-full rounded-2xl border border-[#CFE4DB] bg-[#F3FBF7] p-4 text-left" : "w-full rounded-2xl border border-[#E1E5E2] bg-[#FCFCFB] p-4 text-left"}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-sm font-semibold text-[#18222C]">{conversation.person}</div>
                        <HotelSourcePill>{conversation.role}</HotelSourcePill>
                        {conversation.unread ? <span className="h-2 w-2 rounded-full bg-[#287A65]" /> : null}
                      </div>
                      <div className="mt-1 text-xs text-[#5C6975]">{conversation.room ? `Room ${conversation.room}` : "Property"} · {conversation.language}</div>
                      <div className="mt-2 line-clamp-2 text-sm text-[#5C6975]">{conversation.latest}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <HotelStatusPill tone={conversation.urgency === "Urgent" || conversation.priority === "urgent" ? "urgent" : conversation.status === "AI Resolved" || conversation.status === "Closed" ? "resolved" : conversation.status === "Manager review" || conversation.status === "Awaiting acknowledgment" || conversation.status === "Escalated" ? "queued" : "normal"}>{conversation.status}</HotelStatusPill>
                      <div className="text-xs text-[#5C6975]">{conversation.assignedTo}</div>
                    </div>
                  </div>
                  {conversation.translated ? <div className="mt-2 text-xs text-[#3976A8]">Translated from Spanish · View original</div> : null}
                </button>
              ))}
            </div>
          </section>

          {activeConversation ? (
            <section className="rounded-2xl border border-[#E1E5E2] bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E1E5E2] pb-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Active conversation</div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#18222C]">{activeConversation.person} · {activeConversation.room ? `Room ${activeConversation.room}` : "Property"}</h2>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#5C6975]">
                    <HotelSourcePill>{activeConversation.role}</HotelSourcePill>
                    <HotelSourcePill>{activeConversation.assignedTo}</HotelSourcePill>
                    <HotelSourcePill>{activeConversation.language}</HotelSourcePill>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => { actions.assignRequest(activeConversation.id, "Maya"); actions.addTimelineEvent(activeConversation.id, { type: "system", text: "Manager took over the conversation.", at: "Now" }); }} className="rounded-[10px] border border-[#E1E5E2] bg-white px-3 py-2 text-xs font-medium text-[#18222C]">Take over</button>
                  <button onClick={() => { actions.updateRequestWorkflow(activeConversation.id, { dispatcher: "AI paused by manager" }); actions.addTimelineEvent(activeConversation.id, { type: "system", text: "AI replies paused by manager.", at: "Now" }); }} className="rounded-[10px] border border-[#E1E5E2] bg-white px-3 py-2 text-xs font-medium text-[#18222C]">Pause AI replies</button>
                  <button onClick={() => { if (!draftReply.trim()) return; actions.addTimelineEvent(activeConversation.id, { type: "ai", text: draftReply.trim(), at: "Now" }); actions.updateRequestWorkflow(activeConversation.id, { resolutionState: "guest_updated" }); setDraftReply(""); }} className="rounded-[10px] border border-[#E1E5E2] bg-white px-3 py-2 text-xs font-medium text-[#18222C]">Send direct response</button>
                  <button onClick={() => reassignConversation(activeConversation.kind === "maintenance" ? "Front desk" : "Maintenance")} className="rounded-[10px] border border-[#E1E5E2] bg-white px-3 py-2 text-xs font-medium text-[#18222C]">Reassign</button>
                  <button onClick={() => { const next = activeConversation.priority === "urgent" ? "high" : activeConversation.priority === "high" ? "normal" : "urgent"; actions.updateRequest(activeConversation.id, { priority: next }); actions.addTimelineEvent(activeConversation.id, { type: "system", text: `Priority changed to ${next}.`, at: "Now" }); }} className="rounded-[10px] border border-[#E1E5E2] bg-white px-3 py-2 text-xs font-medium text-[#18222C]">Change priority</button>
                  <button onClick={() => { actions.updateRequest(activeConversation.id, { status: "needs_approval" }); actions.updateRequestWorkflow(activeConversation.id, { triageStatus: "escalated", escalationOwner: "Maya" }); actions.addTimelineEvent(activeConversation.id, { type: "system", text: "Conversation escalated for manager review.", at: "Now" }); }} className="rounded-[10px] border border-[#E1E5E2] bg-white px-3 py-2 text-xs font-medium text-[#18222C]">Escalate</button>
                  <button onClick={() => { if (!internalNote.trim()) return; actions.addTimelineEvent(activeConversation.id, { type: "staff", text: internalNote.trim(), at: "Now" }); setInternalNote(""); }} className="rounded-[10px] border border-[#E1E5E2] bg-white px-3 py-2 text-xs font-medium text-[#18222C]">Add internal note</button>
                  <button onClick={() => { actions.updateRequestStatus(activeConversation.id, "resolved"); actions.addTimelineEvent(activeConversation.id, { type: "system", text: "Conversation marked resolved.", at: "Now" }); }} className="rounded-[10px] border border-[#E1E5E2] bg-white px-3 py-2 text-xs font-medium text-[#18222C]">Mark resolved</button>
                  <button onClick={() => { actions.updateRequestWorkflow(activeConversation.id, { resolutionState: "awaiting_verification" }); actions.addTimelineEvent(activeConversation.id, { type: "ai", text: "Please confirm if everything is resolved on your side.", at: "Now" }); }} className="rounded-[10px] border border-[#E1E5E2] bg-white px-3 py-2 text-xs font-medium text-[#18222C]">Request guest confirmation</button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {timeline.map((event) => (
                  <div key={event.id} className={event.type === "guest" ? "ml-auto max-w-[80%] rounded-2xl bg-[#3976A8] px-4 py-3 text-sm text-white" : event.type === "ai" ? "max-w-[80%] rounded-2xl bg-[#EFF6FB] px-4 py-3 text-sm text-[#18222C]" : event.type === "staff" ? "max-w-[80%] rounded-2xl bg-[#FFF7EC] px-4 py-3 text-sm text-[#18222C]" : "rounded-2xl border border-[#E1E5E2] bg-[#F8F9F7] px-4 py-3 text-sm text-[#18222C]"}>
                    <div>{event.text}</div>
                    {activeConversation.id === "req-218-water" && event.id === "t1" ? <div className="mt-2 text-xs opacity-80">Translated from Spanish · <span className="underline underline-offset-2">View original</span></div> : null}
                    <div className="mt-2 text-[11px] opacity-70">{event.at}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-[#E1E5E2] bg-[#FCFCFB] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Sidekick operational actions</div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {[
                    "Sidekick created a housekeeping task",
                    "Assigned to Elena",
                    "Elena acknowledged the task",
                    "Elena reported Room 304 clean",
                    "Sidekick notified the guest",
                    "Task closed",
                  ].map((line) => (
                    <div key={line} className="rounded-xl border border-[#E1E5E2] bg-white px-3 py-3 text-sm text-[#5C6975]">{line}</div>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[#E1E5E2] bg-[#FCFCFB] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Direct response</div>
                  <textarea value={draftReply} onChange={(e) => setDraftReply(e.target.value)} className="mt-3 min-h-[96px] w-full rounded-xl border border-[#E1E5E2] bg-white px-3 py-2 text-sm text-[#18222C] outline-none" placeholder="Type a message to the guest or staff member..." />
                </div>
                <div className="rounded-2xl border border-[#E1E5E2] bg-[#FCFCFB] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Internal note</div>
                  <textarea value={internalNote} onChange={(e) => setInternalNote(e.target.value)} className="mt-3 min-h-[96px] w-full rounded-xl border border-[#E1E5E2] bg-white px-3 py-2 text-sm text-[#18222C] outline-none" placeholder="Add an internal note for the team..." />
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-[#E1E5E2] bg-[#FCFCFB] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Suggested follow-ups</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {askSidekickExamples.slice(0, 4).map((prompt) => (
                    <div key={prompt} className="rounded-full border border-[#E1E5E2] bg-white px-3 py-1.5 text-xs text-[#5C6975]">{prompt}</div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
