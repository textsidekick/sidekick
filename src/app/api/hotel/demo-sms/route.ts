import { NextResponse } from "next/server";
import type { HotelDemoRequest, HotelRequestTimelineEvent } from "@/lib/hotel-demo-store";

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

function autoResolve(kind: HotelDemoRequest["kind"], message: string) {
  const lower = message.toLowerCase();
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
    const autoReply = autoResolve(kind, message);
    const now = new Date();
    const at = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const requestId = `req-${room.replace(/\s+/g, "-").toLowerCase()}-${now.getTime()}`;

    const newRequest: HotelDemoRequest = {
      id: requestId,
      room,
      guestName,
      kind,
      title: buildTitle(kind, message),
      detail: message,
      assignedTo: autoReply ? "AI concierge" : kind === "maintenance" ? "Julio" : kind === "housekeeping" ? "Elena" : "Front desk",
      status: autoReply ? "resolved" : kind === "front_desk" ? "needs_approval" : "open",
      priority: inferPriority(kind, message),
      waitMinutes: 0,
      source: "guest sms",
    };

    const timeline: Omit<HotelRequestTimelineEvent, "id">[] = [
      { type: "guest", text: message, at },
      autoReply
        ? { type: "ai", text: autoReply, at }
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

    return NextResponse.json({
      ok: true,
      assistantReply: autoReply || `Got it — I’ve routed this to ${newRequest.assignedTo} and will keep the guest updated.`,
      request: newRequest,
      timeline,
      roomPatch,
      knowledgeSuggestion,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to process message" }, { status: 500 });
  }
}
