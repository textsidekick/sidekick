import { NextResponse } from "next/server";
import type { HotelDemoRequest, HotelRequestTimelineEvent } from "@/lib/hotel-demo-store";

function countMatches(message: string, words: string[]) {
  const lower = message.toLowerCase();
  return words.filter((word) => lower.includes(word)).length;
}

function classifyMessage(message: string): HotelDemoRequest["kind"] {
  const lower = message.toLowerCase();
  if (["towel", "sheet", "blanket", "soap", "clean", "housekeeping", "trash", "linen"].some((word) => lower.includes(word))) {
    return "housekeeping";
  }
  if (["shower", "drain", "hvac", "ac", "a/c", "tv", "toilet", "leak", "water", "ice machine", "key card", "lock", "hot water"].some((word) => lower.includes(word))) {
    return "maintenance";
  }
  if (["late checkout", "late check-out", "early check-in", "parking", "park", "refund", "bill", "invoice", "check out", "checkout", "extend", "breakfast"].some((word) => lower.includes(word))) {
    return "front_desk";
  }
  return "guest";
}

function inferRoutingConfidence(message: string, kind: HotelDemoRequest["kind"]) {
  const lower = message.toLowerCase();
  const housekeepingMatches = countMatches(message, ["towel", "sheet", "blanket", "soap", "clean", "housekeeping", "trash", "linen"]);
  const maintenanceMatches = countMatches(message, ["shower", "drain", "hvac", "ac", "a/c", "tv", "toilet", "leak", "water", "ice machine", "key card", "lock", "hot water"]);
  const frontDeskMatches = countMatches(message, ["late checkout", "late check-out", "early check-in", "parking", "park", "refund", "bill", "invoice", "check out", "checkout", "extend", "breakfast"]);
  const matchedBuckets = [housekeepingMatches, maintenanceMatches, frontDeskMatches].filter((count) => count > 0).length;
  const compound = (lower.includes(" and ") || lower.includes("also") || lower.includes("but ")) && matchedBuckets > 1;
  const ambiguous = kind === "guest" && lower.split(/\s+/).length > 6;

  if (compound || matchedBuckets > 1) {
    return { confidence: "low" as const, needsReview: true, reason: "Message mixes multiple issue types and needs a desk review." };
  }
  if (ambiguous) {
    return { confidence: "medium" as const, needsReview: true, reason: "Message is broad enough that a human should confirm the routing before closing the loop." };
  }
  if (kind === "guest") {
    return { confidence: "medium" as const, needsReview: false, reason: null };
  }
  return { confidence: "high" as const, needsReview: false, reason: null };
}

function inferPriority(kind: HotelDemoRequest["kind"], message: string): string {
  const lower = message.toLowerCase();
  if (["flood", "leak", "no hot water", "unsafe", "locked out", "smoke"].some((word) => lower.includes(word))) return "urgent";
  if (kind === "maintenance" || kind === "front_desk") return "high";
  return "normal";
}

function buildTitle(kind: HotelDemoRequest["kind"], message: string): string {
  const trimmed = message.trim();
  if (kind === "housekeeping") return trimmed.includes("towel") ? "Housekeeping supply request" : "Housekeeping request";
  if (kind === "maintenance") return "Guest-reported maintenance issue";
  if (kind === "front_desk") return trimmed.toLowerCase().includes("late") ? "Late checkout request" : "Front desk request";
  return "Guest question";
}

function buildSuggestedGuestUpdate(kind: HotelDemoRequest["kind"], assignedTo: string) {
  if (kind === "maintenance") {
    return `Thanks for flagging this — ${assignedTo} is checking the room issue now and we’ll send you an ETA shortly.`;
  }
  if (kind === "housekeeping") {
    return `Absolutely — ${assignedTo} is bringing this by and we’ll confirm once it has been dropped off.`;
  }
  if (kind === "front_desk") {
    return `Thanks — the front desk is reviewing this request now and will confirm the hotel’s next step shortly.`;
  }
  return `Thanks for texting us — we’re reviewing this now and will update you shortly.`;
}

function autoResolve(kind: HotelDemoRequest["kind"], message: string) {
  const lower = message.toLowerCase();
  if (lower.includes(" and ") || lower.includes("also") || lower.includes("but ")) return null;
  if (lower.includes("breakfast")) {
    return "Breakfast is served from 6:30 AM to 9:30 AM near the lobby. Reply here if you need anything else.";
  }
  if (lower.includes("parking") || lower.includes("park")) {
    return "Oversized vehicles use the east lot. Overnight parking is allowed — front desk just needs your plate number.";
  }
  if (kind === "guest" && lower.includes("wifi")) {
    return "Wi‑Fi is PacificStayGuest and the password is available on your room key sleeve. If it still does not work, I can alert the desk.";
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = String(body.message || "").trim();
    const room = String(body.room || "").trim();
    const guestName = body.guestName ? String(body.guestName).trim() : null;

    if (!message || !room) {
      return NextResponse.json({ error: "room and message are required" }, { status: 400 });
    }

    const kind = classifyMessage(message);
    const routing = inferRoutingConfidence(message, kind);
    const autoReply = autoResolve(kind, message);
    const now = new Date();
    const at = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const requestId = `req-${room.replace(/\s+/g, "-").toLowerCase()}-${now.getTime()}`;
    const stayId = room ? `stay-${room}` : null;
    const routeTeam = kind === "maintenance" ? "Maintenance" : kind === "housekeeping" ? "Housekeeping" : "Front desk";
    const assignedTo =
      autoReply
        ? "AI concierge"
        : routing.needsReview
          ? "Maya"
          : kind === "maintenance"
            ? "Julio"
            : kind === "housekeeping"
              ? "Elena"
              : "Front desk";
    const sla =
      kind === "maintenance"
        ? "10 min guest acknowledgment · 20 min ETA"
        : kind === "housekeeping"
          ? "5 min acknowledgment · 15 min delivery"
          : kind === "front_desk"
            ? "5 min acknowledgment · 15 min decision"
            : "5 min acknowledgment";

    const newRequest: HotelDemoRequest = {
      id: requestId,
      room,
      guestName,
      stayId,
      kind,
      title: buildTitle(kind, message),
      detail: message,
      assignedTo,
      status: autoReply ? "resolved" : routing.needsReview || kind === "front_desk" ? "needs_approval" : "open",
      resolutionState: autoReply ? "closed" : "new",
      routeTeam,
      sla,
      triageStatus: autoReply ? "auto_resolved" : routing.needsReview ? "needs_review" : "auto_routed",
      routingConfidence: autoReply ? "high" : routing.confidence,
      escalationOwner: routing.needsReview || inferPriority(kind, message) === "urgent" ? "Maya" : null,
      handoffNote: routing.needsReview ? routing.reason : null,
      dispatcher: "Sidekick triage",
      priority: inferPriority(kind, message),
      waitMinutes: 0,
      source: "guest sms",
    };

    const timeline: Omit<HotelRequestTimelineEvent, "id">[] = [
      { type: "guest", text: message, at },
      autoReply
        ? { type: "ai", text: autoReply, at }
        : routing.needsReview
          ? { type: "system", text: `Sidekick flagged this for desk review before promising the guest a final answer.`, at }
          : { type: "system", text: `${newRequest.assignedTo} was notified and the request was added to the hotel operations board.`, at },
    ];

    const roomPatch =
      kind === "maintenance"
        ? { status: "maintenance", note: "Guest-reported issue just came in", owner: newRequest.assignedTo }
        : kind === "housekeeping"
          ? { status: "queued", note: "Guest supply request waiting on delivery", owner: newRequest.assignedTo }
          : null;

    const knowledgeSuggestion =
      kind === "front_desk" && !autoReply
        ? {
            team: "Front desk",
            title: "Repeated guest policy question worth capturing",
            summary: `Guests are repeatedly asking about: ${message}`,
            usesThisWeek: 1,
          }
        : null;

    const workflow = {
      routeTeam,
      guestUpdate: autoReply || buildSuggestedGuestUpdate(kind, newRequest.assignedTo),
      nextInternalStep:
        kind === "maintenance"
          ? "Dispatch maintenance, set ETA, and decide whether the guest needs a room move or recovery offer."
          : kind === "housekeeping"
            ? "Assign a runner, confirm delivery, and close the loop with the guest in-thread."
            : kind === "front_desk"
              ? "Review the exception, decide policy outcome, and send one definitive guest-facing reply."
              : "Answer the guest or route to the right owner with one clear update.",
      escalationRecommended: !autoReply && (kind === "maintenance" || inferPriority(kind, message) === "urgent"),
      suggestedSla: sla,
      routingConfidence: newRequest.routingConfidence,
      triageStatus: newRequest.triageStatus,
      reviewReason: routing.reason,
      humanReviewRequired: routing.needsReview,
      stayContext: {
        stayId,
        room,
        guestName,
      },
    };

    return NextResponse.json({
      ok: true,
      assistantReply:
        autoReply ||
        (routing.needsReview
          ? `Got it — I’ve flagged this for the front desk to review so we give you one clear answer.`
          : `Got it — I’ve routed this to ${newRequest.assignedTo} and will keep the guest updated.`),
      request: newRequest,
      timeline,
      roomPatch,
      knowledgeSuggestion,
      workflow,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to process message" }, { status: 500 });
  }
}
