import type { HotelDemoState } from "@/lib/hotel-demo-store";

export type Tone = "urgent" | "high" | "normal" | "resolved" | "queued";

export const askSidekickExamples = [
  "What needs my attention right now?",
  "Which guest requests are waiting for staff?",
  "Which rooms were reported clean today?",
  "What happened in Room 304?",
  "Summarize the current shift.",
  "Which maintenance issues are unresolved?",
  "Which guests are still waiting for an update?",
];

export const askSidekickAnswers: Record<string, string> = {
  "What needs my attention right now?": "The biggest issues are the possible water issue in Room 218, the lamp damage photo from Room 204 that still needs manager review, and two requests that have waited too long for staff acknowledgment.",
  "Which guest requests are waiting for staff?": "Room 118 is still waiting on extra towels from housekeeping, and Room 111 still has a checkout-style cleaning task waiting for acknowledgment.",
  "Which rooms were reported clean today?": "Housekeeping reported 14 rooms complete today. Room 304 is the clearest connected example because Elena texted completion and Sidekick notified the guest automatically.",
  "What happened in Room 304?": "The guest asked for cleaning while away. Sidekick created the housekeeping task, assigned Elena, recorded her completion text, updated the room timeline, and notified the guest that the room was ready.",
  "Summarize the current shift.": "Housekeeping is moving, but a few requests still need acknowledgment. Maintenance has one urgent Room 218 issue and one ongoing ice-machine problem. Sidekick is auto-resolving policy questions and keeping the room-cleaning loop tight when staff confirm completion.",
  "Which maintenance issues are unresolved?": "Room 218 has an urgent possible water issue awaiting manager confirmation, and the second-floor ice machine issue is still open with maintenance.",
  "Which guests are still waiting for an update?": "The guest in Room 118 is still waiting on a housekeeping follow-up. Room 304 is already closed and the guest was notified when cleaning finished.",
};

export const operationalMetrics = [
  { label: "Open Guest Requests", value: 5, detail: "2 waiting for staff response", tone: "normal" as Tone },
  { label: "Active Tasks", value: 8, detail: "4 currently in progress", tone: "high" as Tone },
  { label: "Rooms Reported Clean", value: 14, detail: "Based on staff updates today", tone: "resolved" as Tone },
  { label: "Open Property Issues", value: 3, detail: "1 requires manager review", tone: "queued" as Tone },
  { label: "AI Resolved Today", value: 27, detail: "No staff action required", tone: "resolved" as Tone },
  { label: "Waiting for Staff", value: 2, detail: "Not acknowledged within 10 minutes", tone: "queued" as Tone },
];

export type OperationsRow = {
  id: string;
  tab: "needs_attention" | "guest_requests" | "housekeeping" | "maintenance" | "recently_completed";
  location: string;
  title: string;
  detail: string;
  category: string;
  priority: string;
  status: string;
  assignedTo: string;
  age: string;
  source: string;
  action: string;
  tone: Tone;
  badges: string[];
};

export const operationsRows: OperationsRow[] = [
  {
    id: "req-218-water",
    tab: "needs_attention",
    location: "Room 218",
    title: "Possible water issue",
    detail: "Julio reported water near the bathroom through a Spanish voice note. Sidekick translated it and flagged urgent review.",
    category: "Maintenance",
    priority: "Urgent",
    status: "Manager review",
    assignedTo: "Julio + Maya",
    age: "4 minutes ago",
    source: "Spanish voice note",
    action: "Review issue",
    tone: "urgent",
    badges: ["Maintenance", "Urgent", "Translated"],
  },
  {
    id: "req-204-lamp",
    tab: "needs_attention",
    location: "Room 204",
    title: "Lamp damage reported",
    detail: "Housekeeping submitted a photo while cleaning the room. Sidekick suggested damaged fixture and routed it to maintenance.",
    category: "Damage report",
    priority: "High",
    status: "Manager review",
    assignedTo: "Maya",
    age: "12 minutes ago",
    source: "Uploaded photo",
    action: "Open report",
    tone: "queued",
    badges: ["Maintenance", "Manager review"],
  },
  {
    id: "req-111-cleaning",
    tab: "needs_attention",
    location: "Room 111",
    title: "Cleaning requested",
    detail: "Checkout-style cleaning was entered by front desk and assigned to Maria. Sidekick is still waiting for acknowledgment.",
    category: "Housekeeping",
    priority: "High",
    status: "Awaiting acknowledgment",
    assignedTo: "Maria",
    age: "18 minutes ago",
    source: "Front desk entry",
    action: "Follow up",
    tone: "queued",
    badges: ["Housekeeping", "Waiting for staff"],
  },
  {
    id: "req-118-towels",
    tab: "guest_requests",
    location: "Room 118",
    title: "Extra towels requested",
    detail: "Guest asked for extra towels. Assigned to Elena and still waiting for a staff update.",
    category: "Guest request",
    priority: "Normal",
    status: "Assigned",
    assignedTo: "Elena",
    age: "6 minutes ago",
    source: "Guest SMS",
    action: "Reassign",
    tone: "normal",
    badges: ["Housekeeping", "Guest waiting"],
  },
  {
    id: "req-304-cleaning",
    tab: "recently_completed",
    location: "Room 304",
    title: "Cleaning request completed",
    detail: "Elena texted that Room 304 was done. Sidekick marked the task complete and notified the guest automatically.",
    category: "Housekeeping",
    priority: "Normal",
    status: "Guest notified",
    assignedTo: "Elena",
    age: "Completed 2:19 PM",
    source: "Guest SMS + staff SMS",
    action: "View timeline",
    tone: "resolved",
    badges: ["Completed", "Guest notified"],
  },
  {
    id: "req-lobby-ice",
    tab: "maintenance",
    location: "2nd floor ice alcove",
    title: "Ice machine offline",
    detail: "Front desk logged repeat complaints and maintenance is still working the issue.",
    category: "Maintenance",
    priority: "High",
    status: "In progress",
    assignedTo: "Julio",
    age: "41 minutes ago",
    source: "Manager entry",
    action: "Open task",
    tone: "high",
    badges: ["Maintenance"],
  },
  {
    id: "req-117-carpet",
    tab: "housekeeping",
    location: "Room 117",
    title: "Carpet stain photo awaiting classification",
    detail: "Housekeeping uploaded a carpet stain photo. Sidekick suggested follow-up but wants human confirmation.",
    category: "Inspection",
    priority: "High",
    status: "Awaiting verification",
    assignedTo: "Housekeeping",
    age: "22 minutes ago",
    source: "Uploaded photo",
    action: "Classify issue",
    tone: "queued",
    badges: ["Housekeeping", "Awaiting verification"],
  },
  {
    id: "req-204-lamp-house",
    tab: "housekeeping",
    location: "Room 204",
    title: "Damage found during cleaning",
    detail: "Lamp damage was reported while the room was being cleaned and Sidekick asked for manager review before closing the room history.",
    category: "Damage report",
    priority: "High",
    status: "Manager review",
    assignedTo: "Maya",
    age: "12 minutes ago",
    source: "Uploaded photo",
    action: "Review issue",
    tone: "queued",
    badges: ["Photo evidence", "Manager review"],
  },
];

export const attentionItems = [
  {
    title: "Room 218 — Possible water issue",
    detail: "Julio reported water near the bathroom through a Spanish voice note.",
    meta: "Translated by Sidekick · 4 minutes ago",
    action: "Review issue",
    tone: "urgent" as Tone,
  },
  {
    title: "Room 111 — Cleaning requested",
    detail: "Assigned to Maria 18 minutes ago. Still waiting for acknowledgment.",
    meta: "Front desk entry · Waiting for staff",
    action: "Follow up",
    tone: "queued" as Tone,
  },
  {
    title: "Room 204 — Lamp damage",
    detail: "Photo uploaded by housekeeping and routed to maintenance.",
    meta: "Awaiting manager review",
    action: "Open report",
    tone: "queued" as Tone,
  },
];

export const liveActivity = [
  { icon: "sparkles", actor: "Sidekick", action: "notified the guest connected to Room 304 that cleaning was complete", room: "304", time: "2:19 PM", status: "Delivered", tone: "resolved" as Tone },
  { icon: "check-circle", actor: "Elena", action: "reported Room 304 clean", room: "304", time: "2:18 PM", status: "Matched to task", tone: "resolved" as Tone },
  { icon: "mic", actor: "Julio", action: "uploaded a maintenance voice note for Room 218", room: "218", time: "5:07 PM", status: "Awaiting review", tone: "urgent" as Tone },
  { icon: "languages", actor: "Sidekick", action: "translated Julio’s Spanish note", room: "218", time: "5:08 PM", status: "Suggested category", tone: "normal" as Tone },
  { icon: "message-circle", actor: "Sidekick", action: "answered a parking question without creating a staff task", room: "127", time: "1:14 PM", status: "AI resolved", tone: "resolved" as Tone },
  { icon: "camera", actor: "Elena", action: "uploaded a lamp-damage photo from Room 204", room: "204", time: "4:37 PM", status: "Manager review", tone: "queued" as Tone },
  { icon: "clipboard", actor: "Sidekick", action: "assigned the extra-towel request to housekeeping", room: "118", time: "4:53 PM", status: "Assigned", tone: "normal" as Tone },
];

export const recentReports = [
  {
    id: "report-204",
    room: "Room 204",
    title: "Lamp damage photo",
    submittedBy: "Elena",
    route: "Routed to maintenance",
    status: "Awaiting manager review",
    source: "Uploaded photo",
    suggestion: "Sidekick suggested damaged-fixture category.",
    detailTitle: "Damage photo review",
    originalLanguage: "English",
    translation: "Not needed",
    severity: "Medium",
    relatedTask: "Lamp damage photo review",
    roomHistory: "Previous minor furniture scuff report two weeks ago.",
  },
  {
    id: "report-218",
    room: "Room 218",
    title: "Spanish voice note translated",
    submittedBy: "Julio",
    route: "Marked urgent",
    status: "Possible water issue",
    source: "Spanish voice note",
    suggestion: "Sidekick detected a possible water-related issue.",
    detailTitle: "Possible plumbing escalation",
    originalLanguage: "Spanish",
    translation: "Water is collecting near the bathroom baseboard in Room 218.",
    severity: "Urgent",
    relatedTask: "Possible water issue near bathroom",
    roomHistory: "Prior AC complaint resolved last month; no prior water issue on file.",
  },
  {
    id: "report-117",
    room: "Room 117",
    title: "Carpet stain photo",
    submittedBy: "Housekeeping",
    route: "Awaiting classification",
    status: "Needs follow-up",
    source: "Uploaded photo",
    suggestion: "Sidekick suggested stain follow-up but is waiting for a human to confirm category.",
    detailTitle: "Inspection follow-up",
    originalLanguage: "English",
    translation: "Not needed",
    severity: "Medium",
    relatedTask: "Carpet stain photo awaiting classification",
    roomHistory: "Two previous housekeeping notes about repeat carpet spotting in this room.",
  },
];

export const housekeepingProgress = [
  { label: "Assigned today", value: 16 },
  { label: "In progress", value: 4 },
  { label: "Reported complete", value: 14 },
  { label: "Awaiting verification", value: 2 },
  { label: "Issues found", value: 3 },
  { label: "Waiting for response", value: 1 },
];

export const housekeepingTasks = [
  {
    room: "304",
    cleaningType: "Requested cleaning",
    cleaner: "Elena",
    started: "12:42 PM",
    status: "Guest notified",
    guestUpdateStatus: "Delivered",
    attachments: "0",
    problems: "None",
    elapsed: "Completed in 1h 37m",
    exampleTexts: ["Room 304 done", "Finished 304", "Room 304 is ready"],
  },
  {
    room: "111",
    cleaningType: "Checkout-style cleaning",
    cleaner: "Maria",
    started: "11:03 AM",
    status: "Awaiting acknowledgment",
    guestUpdateStatus: "Not needed",
    attachments: "0",
    problems: "None yet",
    elapsed: "18 minutes open",
    exampleTexts: ["111 clean", "Ya terminé la habitación 111"],
  },
  {
    room: "204",
    cleaningType: "Inspection",
    cleaner: "Elena",
    started: "4:37 PM",
    status: "Issues found",
    guestUpdateStatus: "No guest linked",
    attachments: "1 photo",
    problems: "Lamp damage",
    elapsed: "12 minutes since report",
    exampleTexts: ["Damage in 204", "Room 204 photo sent"],
  },
];

export const roomHistoryRows = [
  { room: "111", status: "Cleaning requested", detail: "Checkout-style cleaning entered by front desk", owner: "Assigned to Maria", source: "Front desk entry", note: "Waiting for acknowledgment" },
  { room: "118", status: "Guest request open", detail: "Extra towels requested", owner: "Assigned to Elena", source: "Guest SMS", note: "Waiting 6 minutes" },
  { room: "127", status: "Issue resolved", detail: "Guest asked about oversized vehicle parking", owner: "Answered automatically by Sidekick", source: "Hotel Knowledge", note: "No staff action required" },
  { room: "204", status: "Manager review", detail: "Lamp damage photo submitted by housekeeping", owner: "Routed to maintenance", source: "Uploaded photo", note: "Review required" },
  { room: "218", status: "Maintenance required", detail: "Voice note suggested possible water issue", owner: "Assigned to Julio", source: "Spanish voice note", note: "Urgent review pending" },
  { room: "304", status: "Reported clean", detail: "Guest requested cleaning while away", owner: "Completed by Elena", source: "Guest SMS + staff SMS", note: "Guest notified" },
];

export const maintenanceMetrics = [
  { label: "Open issues", value: 3 },
  { label: "Urgent issues", value: 1 },
  { label: "In progress", value: 2 },
  { label: "Waiting for parts", value: 1 },
  { label: "Awaiting verification", value: 1 },
  { label: "Recurring problems", value: 2 },
];

export const maintenanceIssues = [
  {
    id: "req-218-water",
    title: "Possible water issue near bathroom",
    location: "Room 218",
    severity: "Urgent",
    reporter: "Julio",
    assignedTo: "Julio",
    status: "Manager review",
    timeOpen: "4 minutes",
    media: "Voice note",
    repeatIssue: "No repeat detected yet",
    transcript: "Hay agua juntándose cerca del zócalo del baño en la 218.",
    translation: "Water is collecting near the bathroom baseboard in Room 218.",
    suggestedCategory: "Water damage / plumbing",
    suggestedSeverity: "Urgent",
    roomHistory: "No prior water issue in the last month.",
  },
  {
    id: "req-204-lamp",
    title: "Lamp damage photo review",
    location: "Room 204",
    severity: "High",
    reporter: "Elena",
    assignedTo: "Maya",
    status: "Manager review",
    timeOpen: "12 minutes",
    media: "Photo",
    repeatIssue: "Previous furniture scuff note on file",
    transcript: "Staff note: lamp base looks cracked.",
    translation: "Not needed",
    suggestedCategory: "Furniture / fixture damage",
    suggestedSeverity: "High",
    roomHistory: "One prior damage note for this room two weeks ago.",
  },
  {
    id: "req-lobby-ice",
    title: "Ice machine offline",
    location: "2nd floor ice alcove",
    severity: "High",
    reporter: "Front desk",
    assignedTo: "Julio",
    status: "In progress",
    timeOpen: "41 minutes",
    media: "No media",
    repeatIssue: "Yes — repeat complaint this week",
    transcript: "Guests reported the machine is not dispensing ice.",
    translation: "Not needed",
    suggestedCategory: "Appliance",
    suggestedSeverity: "High",
    roomHistory: "Same machine needed reset twice in the last six weeks.",
  },
];

export const teamRoutingRules = [
  "Towels → Housekeeping",
  "Cleaning → Housekeeping",
  "Broken lamp → Maintenance",
  "Water problem → Maintenance and manager",
  "Safety hazard → Manager and owner",
  "Guest complaint → Front desk and manager",
  "Damage photo → Manager review",
  "Lost property → Front desk",
];

export const hotelMemoryItems = [
  {
    title: "Recurring issue detected",
    summary: "Room 218 has received four air-conditioning reports during the past six weeks. Three were temporarily resolved by resetting the unit.",
    actions: ["Create maintenance review", "Add to room history", "Assign manager", "Dismiss pattern"],
  },
  {
    title: "Cleaning pattern",
    summary: "Room 304 guests often request service while away and opt into completion texts. Sidekick now has a reliable closed-loop pattern for this room type.",
    actions: ["Approve memory", "Correct memory", "Archive memory", "Review supporting tasks"],
  },
  {
    title: "Guest question trend",
    summary: "Oversized vehicle parking is one of the most frequent policy questions and is being resolved reliably from approved hotel knowledge.",
    actions: ["Promote to suggestion review", "Inspect conversations", "Archive memory", "Delete memory"],
  },
];

export const knowledgeSuggestions = [
  {
    title: "EV charging answer missing",
    detail: "Guests asked about EV charging 18 times this month, but no approved response exists.",
    actions: ["Add official answer", "Review conversations", "Dismiss suggestion"],
  },
  {
    title: "Housekeeping verification wording",
    detail: "Staff used three different phrases for room-complete texts this week. A cleaner-approved script could reduce uncertainty.",
    actions: ["Add official answer", "Review conversations", "Dismiss suggestion"],
  },
];

export const automationTemplates = [
  "Notify guest when cleaning is complete",
  "Escalate requests that staff have not acknowledged",
  "Route maintenance photos",
  "Ask for completion evidence",
  "Generate a shift handoff report",
  "Notify a manager about property damage",
  "Ask guests to confirm resolution",
  "Send review requests",
  "Alert maintenance about recurring issues",
  "Translate staff messages automatically",
  "Notify the owner about urgent events",
];

export const analyticsMetrics = [
  { label: "Total conversations", value: "183", detail: "Guest and staff threads this week" },
  { label: "Requests handled by Sidekick", value: "142", detail: "Includes routing and AI answers" },
  { label: "Tasks created", value: "58", detail: "Human-action requests only" },
  { label: "AI resolution rate", value: "61%", detail: "Resolved without staff action" },
  { label: "Average guest response time", value: "46 sec", detail: "Initial Sidekick response" },
  { label: "Average staff acknowledgment time", value: "8 min", detail: "For human-routed requests" },
  { label: "Average task completion time", value: "42 min", detail: "From assignment to completion" },
  { label: "Guest updates sent", value: "31", detail: "Triggered by automations and managers" },
  { label: "Escalations", value: "6", detail: "Needed manager or owner review" },
  { label: "Estimated staff time saved", value: "9.4 hrs", detail: "Modeled from AI-resolved volume" },
  { label: "Translation usage", value: "12", detail: "Staff notes translated automatically" },
  { label: "Knowledge gaps", value: "3", detail: "Questions missing approved answers" },
];

export const guestAccessOptions = [
  "Property-wide QR code",
  "Room-specific QR codes",
  "SMS number",
  "Check-in card",
  "Printed lobby sign",
  "Digital link",
  "Wi-Fi welcome page",
  "Future PMS welcome message",
];

export const integrationCards = [
  {
    title: "Reservation system",
    state: "Not connected",
    detail: "Until this is connected, Sidekick should not claim live occupancy, arrival, departure, or room-inventory data.",
  },
  {
    title: "Phone / SMS",
    state: "Demo connected",
    detail: "Guest and staff messages are the main trusted operating signal in this demo.",
  },
  {
    title: "Document imports",
    state: "Ready",
    detail: "Knowledge can be built from policies, PDFs, spreadsheets, and uploaded hotel documents.",
  },
];

export function getSourceTone(source: string): Tone {
  if (/voice/i.test(source)) return "queued";
  if (/photo|video/i.test(source)) return "normal";
  if (/knowledge|memory/i.test(source)) return "resolved";
  if (/manager/i.test(source)) return "high";
  return "normal";
}

export function getRoomStatusTone(status: string): Tone {
  const map: Record<string, Tone> = {
    no_active_activity: "normal",
    cleaning_requested: "queued",
    cleaning_assigned: "queued",
    cleaning_in_progress: "high",
    reported_clean: "resolved",
    awaiting_verification: "queued",
    guest_request_open: "normal",
    maintenance_required: "urgent",
    manager_review: "queued",
    manually_blocked: "urgent",
    issue_resolved: "resolved",
  };
  return map[status] || "normal";
}

export function formatRoomStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getSidebarCounts(state: HotelDemoState) {
  return {
    inbox: state.requests.filter((item) => item.status !== "resolved").length,
    tasks: state.requests.filter((item) => item.assignedTo !== "AI concierge").length,
    maintenance: state.requests.filter((item) => item.kind === "maintenance" && item.status !== "resolved").length,
  };
}
