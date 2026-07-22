export type HotelRequestStatus = "open" | "in_progress" | "needs_approval" | "resolved";
export type HotelRequestKind = "guest" | "housekeeping" | "maintenance" | "front_desk";

export const hotelProperty = {
  name: "Pacific Stay Motel",
  type: "Independent roadside motel",
  city: "Oakland, CA",
  roomCount: 48,
  occupancyPct: 87,
  languages: ["English", "Spanish"],
  staffCounts: {
    frontDesk: 3,
    housekeeping: 6,
    maintenance: 2,
  },
};

export const hotelRequests = [
  {
    id: "req-214-shower",
    room: "214",
    guestName: "R. Patel",
    kind: "maintenance" as HotelRequestKind,
    title: "Shower not draining",
    detail: "Guest reported standing water in shower and requested update before 6 PM.",
    assignedTo: "Julio",
    status: "in_progress" as HotelRequestStatus,
    priority: "urgent",
    waitMinutes: 18,
    source: "guest sms",
  },
  {
    id: "req-118-towels",
    room: "118",
    guestName: "Walk-in guest",
    kind: "housekeeping" as HotelRequestKind,
    title: "Extra towels",
    detail: "Requested 4 extra towels and 2 washcloths.",
    assignedTo: "Elena",
    status: "open" as HotelRequestStatus,
    priority: "normal",
    waitMinutes: 6,
    source: "guest sms",
  },
  {
    id: "req-302-checkout",
    room: "302",
    guestName: "J. Mendoza",
    kind: "front_desk" as HotelRequestKind,
    title: "Late checkout request",
    detail: "Guest asked to stay until 1 PM due to delayed flight.",
    assignedTo: "Front desk",
    status: "needs_approval" as HotelRequestStatus,
    priority: "normal",
    waitMinutes: 11,
    source: "guest sms",
  },
  {
    id: "req-127-parking",
    room: "127",
    guestName: "D. Chen",
    kind: "guest" as HotelRequestKind,
    title: "Parking instructions",
    detail: "Asked where oversized vehicle parking is located.",
    assignedTo: "AI concierge",
    status: "resolved" as HotelRequestStatus,
    priority: "low",
    waitMinutes: 1,
    source: "guest sms",
  },
  {
    id: "req-208-breakfast",
    room: "208",
    guestName: "A. Alvarez",
    kind: "guest" as HotelRequestKind,
    title: "Breakfast hours in Spanish",
    detail: "Answered automatically in Spanish with property policy.",
    assignedTo: "AI concierge",
    status: "resolved" as HotelRequestStatus,
    priority: "low",
    waitMinutes: 1,
    source: "guest sms",
  },
  {
    id: "req-204-damage",
    room: "204",
    guestName: null,
    kind: "housekeeping" as HotelRequestKind,
    title: "Lamp damage photo review",
    detail: "Housekeeper uploaded damage photo and flagged possible reimbursement issue.",
    assignedTo: "Maya",
    status: "needs_approval" as HotelRequestStatus,
    priority: "high",
    waitMinutes: 24,
    source: "staff sms",
  },
  {
    id: "req-2f-ice",
    room: "2nd Floor",
    guestName: null,
    kind: "maintenance" as HotelRequestKind,
    title: "Ice machine offline",
    detail: "Multiple guest reports. Maintenance waiting on replacement part ETA.",
    assignedTo: "Julio",
    status: "in_progress" as HotelRequestStatus,
    priority: "high",
    waitMinutes: 41,
    source: "front desk escalation",
  },
] as const;

export const hotelRooms = [
  { room: "111", status: "dirty", type: "King", note: "Checkout clean", owner: "Maria" },
  { room: "118", status: "occupied", type: "Double", note: "Deliver towels", owner: "Elena" },
  { room: "127", status: "occupied", type: "King", note: "Guest parking answered", owner: "AI concierge" },
  { room: "204", status: "inspection", type: "Queen", note: "Damage photo waiting review", owner: "Maya" },
  { room: "214", status: "maintenance", type: "King", note: "Shower repair in progress", owner: "Julio" },
  { room: "302", status: "occupied", type: "Queen", note: "Late checkout pending", owner: "Front desk" },
  { room: "315", status: "queued", type: "Double", note: "Deep clean next shift", owner: "Ana" },
  { room: "401", status: "ready", type: "King", note: "Inspected and guest-ready", owner: "Nadia" },
] as const;

export const hotelKnowledge = [
  {
    title: "Late checkout approval policy",
    team: "Front desk",
    summary: "Managers approve checkout past noon unless occupancy exceeds 92% or housekeeping backlog is above 8 rooms.",
    usesThisWeek: 17,
  },
  {
    title: "How to reset key cards after lock battery swap",
    team: "Maintenance",
    summary: "Reprogram lock, wait 30 seconds, reissue card at front desk, then verify with a master card first.",
    usesThisWeek: 6,
  },
  {
    title: "No hot water escalation path",
    team: "Front desk + maintenance",
    summary: "If issue affects more than one room, notify manager immediately and offer room move before technician ETA exceeds 30 minutes.",
    usesThisWeek: 4,
  },
  {
    title: "Damage photo standard for housekeeping",
    team: "Housekeeping",
    summary: "Take wide room shot, close-up shot, and include room placard when possible before guest checkout closes out.",
    usesThisWeek: 9,
  },
] as const;

export const hotelShiftBoard = [
  { team: "Front desk", note: "2 late checkout requests pending approval and 1 guest refund conversation to finish before 6 PM." },
  { team: "Housekeeping", note: "6 rooms cleaned, 3 awaiting inspection, Room 204 damage review still open." },
  { team: "Maintenance", note: "Room 214 shower repair in progress, second-floor ice machine awaiting part ETA." },
  { team: "Guest support", note: "Spanish concierge requests auto-answered at 98% confidence with one parking escalation." },
] as const;

export const hotelStaff = [
  { name: "Julio", team: "Maintenance", phone: "+1 (510) 555-0146", shift: "2 PM - 10 PM" },
  { name: "Elena", team: "Housekeeping", phone: "+1 (510) 555-0184", shift: "9 AM - 5 PM" },
  { name: "Maya", team: "Front desk", phone: "+1 (510) 555-0118", shift: "1 PM - 9 PM" },
  { name: "Nadia", team: "Housekeeping", phone: "+1 (510) 555-0172", shift: "7 AM - 3 PM" },
] as const;

export function getHotelMetrics() {
  const openRequests = hotelRequests.filter((r) => r.status !== "resolved");
  const openMaintenance = hotelRequests.filter((r) => r.kind === "maintenance" && r.status !== "resolved");
  const roomsNeedingService = hotelRooms.filter((r) => ["dirty", "inspection", "maintenance", "queued"].includes(r.status)).length;
  const avgGuestResponseSeconds = 42;

  return {
    openGuestRequests: openRequests.length,
    roomsNeedingService,
    openMaintenanceIssues: openMaintenance.length,
    avgGuestResponseSeconds,
    resolvedAutomatically: hotelRequests.filter((r) => r.assignedTo === "AI concierge" && r.status === "resolved").length,
  };
}
