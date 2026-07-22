export type HotelRequestStatus = "open" | "in_progress" | "needs_approval" | "resolved";
export type HotelRequestKind = "guest" | "housekeeping" | "maintenance" | "front_desk";

export const hotelProperty = {
  name: "Pacific Stay Motel",
  type: "Independent roadside motel",
  city: "Oakland, CA",
  roomCount: 48,
  occupancyPct: 0,
  languages: ["English", "Spanish"],
  staffCounts: {
    frontDesk: 3,
    housekeeping: 6,
    maintenance: 2,
  },
};

export const hotelRequests = [
  {
    id: "req-111-cleaning",
    room: "111",
    guestName: null,
    kind: "front_desk" as HotelRequestKind,
    title: "Checkout-style cleaning entered",
    detail: "Front desk entered a cleaning turn for Room 111 and assigned it to Maria. Waiting for acknowledgment.",
    assignedTo: "Maria",
    status: "open" as HotelRequestStatus,
    priority: "high",
    waitMinutes: 18,
    source: "front desk entry",
  },
  {
    id: "req-118-towels",
    room: "118",
    guestName: "Walk-in guest",
    kind: "housekeeping" as HotelRequestKind,
    title: "Extra towels requested",
    detail: "Guest asked for extra towels and Sidekick routed it to housekeeping.",
    assignedTo: "Elena",
    status: "open" as HotelRequestStatus,
    priority: "normal",
    waitMinutes: 6,
    source: "guest sms",
  },
  {
    id: "req-127-parking",
    room: "127",
    guestName: "D. Chen",
    kind: "guest" as HotelRequestKind,
    title: "Oversized vehicle parking question",
    detail: "Guest asked where to park an oversized vehicle. Sidekick answered from hotel policy.",
    assignedTo: "AI concierge",
    status: "resolved" as HotelRequestStatus,
    priority: "low",
    waitMinutes: 1,
    source: "guest sms",
  },
  {
    id: "req-204-lamp",
    room: "204",
    guestName: null,
    kind: "maintenance" as HotelRequestKind,
    title: "Lamp damage photo review",
    detail: "Housekeeping uploaded a lamp-damage photo during cleaning. Sidekick routed it to maintenance and requested manager review.",
    assignedTo: "Maya",
    status: "needs_approval" as HotelRequestStatus,
    priority: "high",
    waitMinutes: 12,
    source: "uploaded photo",
  },
  {
    id: "req-218-water",
    room: "218",
    guestName: null,
    kind: "maintenance" as HotelRequestKind,
    title: "Possible water issue near bathroom",
    detail: "Julio sent a Spanish voice note describing water collecting near the bathroom baseboard.",
    assignedTo: "Julio",
    status: "needs_approval" as HotelRequestStatus,
    priority: "urgent",
    waitMinutes: 4,
    source: "spanish voice note",
  },
  {
    id: "req-304-cleaning",
    room: "304",
    guestName: "K. Morgan",
    kind: "housekeeping" as HotelRequestKind,
    title: "Room cleaning request",
    detail: "Guest requested room cleaning while away. Sidekick assigned Elena and later notified the guest when it was complete.",
    assignedTo: "Elena",
    status: "resolved" as HotelRequestStatus,
    priority: "normal",
    waitMinutes: 0,
    source: "guest sms",
  },
  {
    id: "req-117-carpet",
    room: "117",
    guestName: null,
    kind: "housekeeping" as HotelRequestKind,
    title: "Carpet stain photo awaiting classification",
    detail: "Housekeeping uploaded a carpet-stain photo and Sidekick suggested follow-up review.",
    assignedTo: "Housekeeping",
    status: "in_progress" as HotelRequestStatus,
    priority: "high",
    waitMinutes: 22,
    source: "uploaded photo",
  },
  {
    id: "req-lobby-ice",
    room: "Ice machine alcove",
    guestName: null,
    kind: "maintenance" as HotelRequestKind,
    title: "Ice machine offline",
    detail: "Front desk reported the second-floor ice machine offline after repeat guest complaints.",
    assignedTo: "Julio",
    status: "in_progress" as HotelRequestStatus,
    priority: "high",
    waitMinutes: 41,
    source: "manager entry",
  },
] as const;

export const hotelRooms = [
  { room: "111", status: "cleaning_requested", type: "King", note: "Checkout-style cleaning entered by front desk", owner: "Maria" },
  { room: "118", status: "guest_request_open", type: "Double", note: "Extra towels requested · waiting 6 minutes", owner: "Elena" },
  { room: "127", status: "issue_resolved", type: "King", note: "Oversized vehicle parking answered automatically", owner: "AI concierge" },
  { room: "204", status: "manager_review", type: "Queen", note: "Lamp damage photo submitted by housekeeping", owner: "Maya" },
  { room: "218", status: "maintenance_required", type: "King", note: "Possible water issue from Spanish voice note", owner: "Julio" },
  { room: "304", status: "reported_clean", type: "Queen", note: "Elena reported room clean and guest was notified", owner: "Elena" },
  { room: "117", status: "awaiting_verification", type: "Double", note: "Carpet stain photo awaiting classification", owner: "Housekeeping" },
  { room: "315", status: "no_active_activity", type: "King", note: "No recent Sidekick activity for this room", owner: "—" },
] as const;

export const hotelKnowledge = [
  {
    title: "Oversized vehicle parking",
    team: "Front desk",
    summary: "Oversized vehicles use the east overflow row. Ask the guest to text their plate so the desk can log it before 10 PM.",
    usesThisWeek: 18,
  },
  {
    title: "Breakfast hours and lobby coffee",
    team: "Guest support",
    summary: "Breakfast runs 6:30 AM to 9:30 AM. Lobby coffee stays out until 10 AM.",
    usesThisWeek: 22,
  },
  {
    title: "Requested cleaning guest script",
    team: "Housekeeping",
    summary: "When a guest asks for cleaning while away, tell them the request has been sent to housekeeping and that Sidekick will notify them when the room is ready.",
    usesThisWeek: 11,
  },
  {
    title: "Water-issue escalation path",
    team: "Maintenance",
    summary: "If water is reported near a bathroom wall or baseboard, flag it urgent, alert maintenance, and request manager review before marking the issue resolved.",
    usesThisWeek: 7,
  },
] as const;

export const hotelShiftBoard = [
  { team: "Front desk", note: "Two guest requests still need staff acknowledgment and one manager review item is open." },
  { team: "Housekeeping", note: "14 rooms were reported complete today, one damage photo needs review, and one carpet stain is still being classified." },
  { team: "Maintenance", note: "Room 218 possible water issue is urgent and the second-floor ice machine is still unresolved." },
  { team: "Sidekick", note: "Parking and amenity questions continue to auto-resolve while guest cleaning updates are being pushed automatically." },
] as const;

export const hotelStaff = [
  { name: "Maya", team: "Management", phone: "+1 (510) 555-0118", shift: "1 PM - 9 PM" },
  { name: "Elena", team: "Housekeeping", phone: "+1 (510) 555-0184", shift: "9 AM - 5 PM" },
  { name: "Maria", team: "Housekeeping", phone: "+1 (510) 555-0161", shift: "8 AM - 4 PM" },
  { name: "Julio", team: "Maintenance", phone: "+1 (510) 555-0146", shift: "2 PM - 10 PM" },
  { name: "Nadia", team: "Front desk", phone: "+1 (510) 555-0172", shift: "7 AM - 3 PM" },
] as const;

export function getHotelMetrics() {
  const openGuestRequests = hotelRequests.filter((r) => r.source === "guest sms" && r.status !== "resolved").length;
  const activeTasks = hotelRequests.filter((r) => r.assignedTo !== "AI concierge").length;
  const openMaintenanceIssues = hotelRequests.filter((r) => r.kind === "maintenance" && r.status !== "resolved").length;
  const resolvedAutomatically = hotelRequests.filter((r) => r.assignedTo === "AI concierge" && r.status === "resolved").length;

  return {
    openGuestRequests,
    roomsNeedingService: hotelRooms.filter((room) => room.status !== "no_active_activity" && room.status !== "issue_resolved" && room.status !== "reported_clean").length,
    openMaintenanceIssues,
    avgGuestResponseSeconds: 46,
    resolvedAutomatically,
    activeTasks,
  };
}
