"use client";

import { useEffect, useMemo, useState } from "react";
import { hotelKnowledge, hotelProperty, hotelRequests, hotelRooms, hotelShiftBoard, hotelStaff } from "@/lib/hotel-demo";

const STORAGE_KEY = "sidekick_hotel_demo_state_v1";

export type HotelDemoRequest = {
  id: string;
  room: string;
  guestName: string | null;
  stayId?: string | null;
  kind: "guest" | "housekeeping" | "maintenance" | "front_desk";
  title: string;
  detail: string;
  assignedTo: string;
  status: "open" | "in_progress" | "needs_approval" | "resolved";
  resolutionState?: "new" | "guest_updated" | "staff_dispatched" | "awaiting_verification" | "closed";
  routeTeam?: string;
  sla?: string;
  triageStatus?: "auto_resolved" | "auto_routed" | "needs_review" | "approved" | "escalated";
  routingConfidence?: "high" | "medium" | "low";
  escalationOwner?: string | null;
  handoffNote?: string | null;
  dispatcher?: string | null;
  priority: string;
  waitMinutes: number;
  source: string;
};

export type HotelDemoRoom = {
  room: string;
  status: string;
  type: string;
  note: string;
  owner: string;
};

export type HotelRequestArtifact = {
  id: string;
  requestId: string;
  name: string;
  kind: "media" | "voice";
  sourceLabel: string;
  addedAt: string;
  originalLanguage?: string;
  translation?: string;
  suggestedCategory?: string;
  suggestedSeverity?: string;
  status?: string;
};

export type HotelKnowledgeItem = {
  title: string;
  team: string;
  summary: string;
  usesThisWeek: number;
};

export type HotelShiftBoardItem = {
  team: string;
  note: string;
};

export type HotelStaffMember = {
  name: string;
  team: string;
  phone: string;
  shift: string;
};

export type HotelStay = {
  id: string;
  room: string;
  guestName: string;
  status: "arriving" | "checked_in" | "departing" | "checked_out";
  eta: string;
  nights: number;
  notes: string;
  source: string;
};

export type HotelPeopleTask = {
  id: string;
  staffName: string;
  team: string;
  kind: "training" | "coverage" | "policy" | "onboarding";
  title: string;
  status: "open" | "in_progress" | "done";
  due: string;
  note: string;
};

export type HotelServiceCase = {
  id: string;
  room: string;
  guestName: string;
  issue: string;
  recovery: string;
  owner: string;
  status: "open" | "offered" | "saved" | "closed";
  valueAtRisk: string;
};

export type HotelLostFoundItem = {
  id: string;
  room: string;
  guestName: string;
  item: string;
  locationFound: string;
  status: "logged" | "contacted" | "claimed" | "shipped";
  owner: string;
  note: string;
};

export type HotelInspectionItem = {
  id: string;
  room: string;
  inspector: string;
  status: "pending" | "in_progress" | "failed" | "passed";
  checklist: string;
  note: string;
};

export type HotelSupplyItem = {
  id: string;
  item: string;
  team: string;
  stock: "ok" | "low" | "critical";
  par: string;
  note: string;
};

export type HotelAuditItem = {
  id: string;
  bucket: string;
  title: string;
  status: "open" | "reviewing" | "resolved";
  impact: string;
  owner: string;
  note: string;
};

export type HotelIncidentItem = {
  id: string;
  area: string;
  title: string;
  severity: "watch" | "high" | "critical";
  status: "open" | "contained" | "closed";
  owner: string;
  note: string;
};

export type HotelParkingItem = {
  id: string;
  guestName: string;
  room: string;
  vehicle: string;
  status: "pending" | "cleared" | "escalated";
  location: string;
  owner: string;
  note: string;
};

export type HotelPackageItem = {
  id: string;
  guestName: string;
  room: string;
  carrier: string;
  status: "received" | "notified" | "picked_up";
  location: string;
  owner: string;
  note: string;
};

export type HotelLuggageItem = {
  id: string;
  guestName: string;
  room: string;
  bags: string;
  status: "stored" | "claimed" | "released";
  location: string;
  owner: string;
  note: string;
};

export type HotelWakeupItem = {
  id: string;
  guestName: string;
  room: string;
  when: string;
  status: "scheduled" | "confirmed" | "completed";
  owner: string;
  note: string;
};

export type HotelLaundryItem = {
  id: string;
  item: string;
  status: "queued" | "washing" | "delivered";
  par: string;
  owner: string;
  note: string;
};

export type HotelShuttleItem = {
  id: string;
  guestName: string;
  room: string;
  trip: string;
  status: "scheduled" | "confirmed" | "completed";
  owner: string;
  note: string;
};

export type HotelRoomMoveItem = {
  id: string;
  guestName: string;
  fromRoom: string;
  toRoom: string;
  reason: string;
  status: "requested" | "coordinating" | "completed";
  owner: string;
  note: string;
};

export type HotelMinibarItem = {
  id: string;
  room: string;
  guestName: string;
  item: string;
  amount: string;
  status: "captured" | "posted" | "waived";
  owner: string;
  note: string;
};

export type HotelVipArrivalItem = {
  id: string;
  guestName: string;
  room: string;
  arrival: string;
  status: "prepping" | "ready" | "welcomed";
  owner: string;
  note: string;
};

export type HotelGroupArrivalItem = {
  id: string;
  groupName: string;
  rooms: string;
  arrival: string;
  status: "planning" | "staged" | "checked_in";
  owner: string;
  note: string;
};

export type HotelOutOfOrderItem = {
  id: string;
  room: string;
  issue: string;
  status: "blocked" | "repairing" | "released";
  revenueAtRisk: string;
  owner: string;
  note: string;
};

export type HotelDeepCleanItem = {
  id: string;
  room: string;
  reason: string;
  status: "scheduled" | "in_progress" | "completed";
  owner: string;
  due: string;
  note: string;
};

export type HotelBreakfastItem = {
  id: string;
  guestName: string;
  room: string;
  order: string;
  pickup: string;
  status: "prep" | "ready" | "delivered";
  owner: string;
  note: string;
};

export type HotelRequestTimelineEvent = {
  id: string;
  type: "guest" | "ai" | "staff" | "system";
  text: string;
  at: string;
};

export type HotelDemoState = {
  property: typeof hotelProperty & {
    frontDeskNumber?: string;
    maintenanceNumber?: string;
    housekeepingLeadNumber?: string;
    breakfastHours?: string;
    checkoutPolicy?: string;
    parkingNote?: string;
  };
  requests: HotelDemoRequest[];
  rooms: HotelDemoRoom[];
  knowledge: HotelKnowledgeItem[];
  shiftBoard: HotelShiftBoardItem[];
  staff: HotelStaffMember[];
  stays: HotelStay[];
  peopleTasks: HotelPeopleTask[];
  serviceCases: HotelServiceCase[];
  lostFoundItems: HotelLostFoundItem[];
  inspections: HotelInspectionItem[];
  supplies: HotelSupplyItem[];
  auditItems: HotelAuditItem[];
  incidentItems: HotelIncidentItem[];
  parkingItems: HotelParkingItem[];
  packageItems: HotelPackageItem[];
  luggageItems: HotelLuggageItem[];
  wakeupItems: HotelWakeupItem[];
  laundryItems: HotelLaundryItem[];
  shuttleItems: HotelShuttleItem[];
  roomMoveItems: HotelRoomMoveItem[];
  minibarItems: HotelMinibarItem[];
  vipArrivalItems: HotelVipArrivalItem[];
  groupArrivalItems: HotelGroupArrivalItem[];
  outOfOrderItems: HotelOutOfOrderItem[];
  deepCleanItems: HotelDeepCleanItem[];
  breakfastItems: HotelBreakfastItem[];
  requestTimelines: Record<string, HotelRequestTimelineEvent[]>;
  requestArtifacts: Record<string, HotelRequestArtifact[]>;
};

function defaultState(): HotelDemoState {
  const normalizedRequests: HotelDemoRequest[] = hotelRequests.map((r) => ({
    ...r,
    stayId: `stay-${String(r.room).replace(/\s+/g, "-").toLowerCase()}`,
    routeTeam:
      r.kind === "maintenance"
        ? "Maintenance"
        : r.kind === "housekeeping"
          ? "Housekeeping"
          : "Front desk",
    sla:
      r.kind === "maintenance"
        ? "10 min guest acknowledgment · 20 min ETA"
        : r.kind === "housekeeping"
          ? "5 min acknowledgment · 15 min delivery"
          : r.kind === "front_desk"
            ? "5 min acknowledgment · 15 min decision"
            : "5 min acknowledgment",
    triageStatus: r.assignedTo === "AI concierge" ? "auto_resolved" : r.status === "needs_approval" ? "needs_review" : "auto_routed",
    routingConfidence: r.assignedTo === "AI concierge" ? "high" : r.kind === "guest" ? "medium" : "high",
    escalationOwner: r.status === "needs_approval" || r.priority === "urgent" ? "Maya" : null,
    handoffNote: r.status === "needs_approval" ? "Carry this into the next shift if no desk decision lands before checkout pressure builds." : null,
    dispatcher: r.source === "guest sms" ? "Sidekick triage" : "Front desk",
  }));

  return {
    property: {
      ...hotelProperty,
      frontDeskNumber: "+1 (510) 555-0100",
      maintenanceNumber: "+1 (510) 555-0146",
      housekeepingLeadNumber: "+1 (510) 555-0184",
      breakfastHours: "6:30 AM - 9:30 AM",
      checkoutPolicy: "Standard checkout 11 AM. Noon allowed without approval. After noon requires manager approval.",
      parkingNote: "Oversized vehicles use east lot. Overnight parking requires plate capture.",
    },
    requests: normalizedRequests,
    rooms: hotelRooms.map((r) => ({ ...r })),
    knowledge: [...hotelKnowledge],
    shiftBoard: [...hotelShiftBoard],
    staff: [...hotelStaff],
    stays: [
      { id: "stay-111", room: "111", guestName: "—", status: "checked_out", eta: "Earlier today", nights: 1, notes: "Front desk entered checkout-style cleaning for this room.", source: "front desk entry" },
      { id: "stay-118", room: "118", guestName: "Walk-in guest", status: "checked_in", eta: "In house", nights: 1, notes: "Guest opted into text updates and requested extra towels.", source: "front desk entry" },
      { id: "stay-127", room: "127", guestName: "D. Chen", status: "checked_in", eta: "In house", nights: 2, notes: "Guest asked for oversized vehicle parking instructions through Sidekick.", source: "front desk entry" },
      { id: "stay-218", room: "218", guestName: "—", status: "checked_in", eta: "In house", nights: 2, notes: "Maintenance concern was reported from a staff voice note tied to this room.", source: "manager entry" },
      { id: "stay-304", room: "304", guestName: "K. Morgan", status: "checked_in", eta: "In house", nights: 2, notes: "Requested room cleaning while away and asked to be notified when complete.", source: "front desk entry" },
    ],
    peopleTasks: [
      { id: "people-1", staffName: "Maya", team: "Front desk", kind: "policy", title: "Refund exception script review", status: "open", due: "Tonight", note: "Manager wants tighter refund language for charge disputes." },
      { id: "people-2", staffName: "Elena", team: "Housekeeping", kind: "training", title: "Damage photo standard refresher", status: "in_progress", due: "Tomorrow", note: "Reduce back-and-forth on room damage reimbursement decisions." },
      { id: "people-3", staffName: "Julio", team: "Maintenance", kind: "coverage", title: "Weekend backup vendor coverage", status: "open", due: "Friday", note: "Need after-hours escalation path for plumbing and lockouts." },
      { id: "people-4", staffName: "Nadia", team: "Housekeeping", kind: "onboarding", title: "New hire text workflow setup", status: "open", due: "Tomorrow morning", note: "Set up bilingual SMS SOP access and inspection checklist." },
    ],
    serviceCases: [
      { id: "svc-214", room: "214", guestName: "R. Patel", issue: "Bathroom drain failure during stay", recovery: "Offer room move or partial refund with proactive follow-up text.", owner: "Maya", status: "open", valueAtRisk: "$169" },
      { id: "svc-302", room: "302", guestName: "J. Mendoza", issue: "Late checkout conflict with housekeeping schedule", recovery: "Offer noon checkout and bag hold if 1 PM cannot be approved.", owner: "Front desk", status: "offered", valueAtRisk: "$119" },
      { id: "svc-204", room: "204", guestName: "Walk-out guest", issue: "Damage dispute after checkout", recovery: "Send photo-backed explanation and manager callback before charge finalization.", owner: "Maya", status: "open", valueAtRisk: "$240" }
    ],
    lostFoundItems: [
      { id: "lf-127", room: "127", guestName: "D. Chen", item: "Black iPad mini", locationFound: "Nightstand drawer", status: "logged", owner: "Front desk", note: "Housekeeping found it during post-checkout reset." },
      { id: "lf-302", room: "302", guestName: "J. Mendoza", item: "Blue passport holder", locationFound: "Desk shelf", status: "contacted", owner: "Maya", note: "Guest texted asking if it was found; awaiting shipping address." },
      { id: "lf-401", room: "401", guestName: "L. Brooks", item: "Phone charger", locationFound: "Wall outlet by bed", status: "claimed", owner: "Front desk", note: "Guest will pick up this evening." }
    ],
    inspections: [
      { id: "insp-204", room: "204", inspector: "Maya", status: "pending", checklist: "Damage review + amenity reset", note: "Verify lamp damage photos and minibar count before releasing room." },
      { id: "insp-315", room: "315", inspector: "Nadia", status: "in_progress", checklist: "Deep clean turnover", note: "High-priority arrival later tonight; confirm linens, odor check, and AC." },
      { id: "insp-401", room: "401", inspector: "Maya", status: "failed", checklist: "VIP arrival readiness", note: "Dust on headboard and missing extra towels blocked release." }
    ],
    supplies: [
      { id: "sup-1", item: "Bath towels", team: "Housekeeping", stock: "low", par: "140 / 180", note: "Laundry delay is putting tonight's arrivals at risk." },
      { id: "sup-2", item: "Toiletry kits", team: "Housekeeping", stock: "ok", par: "96 / 120", note: "Enough for current occupancy and tomorrow arrivals." },
      { id: "sup-3", item: "Bottled water", team: "Front desk", stock: "critical", par: "18 / 72", note: "Service recovery stash almost depleted." },
      { id: "sup-4", item: "Extra pillows", team: "Housekeeping", stock: "low", par: "24 / 40", note: "Several guest comfort requests this week." }
    ],
    auditItems: [
      { id: "audit-1", bucket: "Revenue", title: "Room 214 incidental hold mismatch", status: "open", impact: "$85 pending", owner: "Night audit", note: "Guest folio and card authorization do not match after service recovery credit." },
      { id: "audit-2", bucket: "OTA", title: "Expedia tax discrepancy on room 302", status: "reviewing", impact: "$23 variance", owner: "Maya", note: "Need to confirm whether late checkout fee should be waived before closeout." },
      { id: "audit-3", bucket: "Front desk", title: "Missing ID scan on walk-in guest", status: "open", impact: "Compliance risk", owner: "Front desk", note: "Walk-in check-in completed during rush; ID image was not attached." }
    ],
    incidentItems: [
      { id: "inc-1", area: "Pool", title: "Wet deck slip report pending witness note", severity: "high", status: "open", owner: "Manager on duty", note: "Guest reported a minor slip near the pool gate. Need witness statement and camera timestamp before end of shift." },
      { id: "inc-2", area: "Parking", title: "Broken gate arm causing overnight access gap", severity: "critical", status: "contained", owner: "Julio", note: "Cones and signage placed. Vendor ETA is 9:30 PM and front desk is logging all plate exceptions." },
      { id: "inc-3", area: "Room 118", title: "Smoking violation follow-up", severity: "watch", status: "open", owner: "Front desk", note: "Need photo set and folio note before damage fee decision is finalized." }
    ],
    parkingItems: [
      { id: "park-127", guestName: "D. Chen", room: "127", vehicle: "Ford Transit van", status: "pending", location: "East overflow lot", owner: "Front desk", note: "Oversized vehicle arriving tonight; send gate code and capture plate before 10 PM." },
      { id: "park-302", guestName: "J. Mendoza", room: "302", vehicle: "Silver Honda Civic", status: "escalated", location: "Spot 14", owner: "Maya", note: "Vehicle still in lot after planned checkout. Need extension fee or tow decision before housekeeping blocks spot overnight." },
      { id: "park-401", guestName: "L. Brooks", room: "401", vehicle: "Black Tesla Model Y", status: "cleared", location: "EV spot 2", owner: "Front desk", note: "Charging access approved and plate logged for repeat guest." }
    ],
    packageItems: [
      { id: "pkg-214", guestName: "R. Patel", room: "214", carrier: "Amazon", status: "received", location: "Back office shelf A", owner: "Front desk", note: "Two medium boxes received; guest has not been notified yet." },
      { id: "pkg-401", guestName: "L. Brooks", room: "401", carrier: "FedEx", status: "notified", location: "Front desk hold cabinet", owner: "Maya", note: "Signature required at pickup; guest text sent at 6:48 PM." },
      { id: "pkg-127", guestName: "D. Chen", room: "127", carrier: "DoorDash", status: "picked_up", location: "Lobby handoff", owner: "Front desk", note: "Order handed off on arrival; no storage needed." }
    ],
    luggageItems: [
      { id: "bag-302", guestName: "J. Mendoza", room: "302", bags: "2 roller bags", status: "stored", location: "Bag room rack B", owner: "Front desk", note: "Late flight tonight. Needs claim tag verification before release." },
      { id: "bag-118", guestName: "Walk-in guest", room: "118", bags: "1 duffel", status: "claimed", location: "Lobby closet", owner: "Maya", note: "Early arrival bag hold; guest texted they will return after dinner." },
      { id: "bag-401", guestName: "L. Brooks", room: "401", bags: "3 conference boxes + suitcase", status: "released", location: "Bell cart hold", owner: "Front desk", note: "Released to guest on VIP arrival; cart returned to desk." }
    ],
    wakeupItems: [
      { id: "wu-214", guestName: "R. Patel", room: "214", when: "5:30 AM", status: "scheduled", owner: "Night audit", note: "Airport departure. Confirm backup SMS because guest mentioned heavy sleeper." },
      { id: "wu-127", guestName: "D. Chen", room: "127", when: "6:15 AM", status: "confirmed", owner: "Front desk", note: "Conference shuttle pickup. Guest requested bilingual confirmation text." },
      { id: "wu-401", guestName: "L. Brooks", room: "401", when: "7:00 AM", status: "completed", owner: "Maya", note: "VIP wake-up completed and car service reminder sent." }
    ],
    laundryItems: [
      { id: "laundry-1", item: "Bath towels", status: "queued", par: "140 / 180", owner: "Elena", note: "Late laundry pickup is threatening tonight's arriving rooms." },
      { id: "laundry-2", item: "King sheet sets", status: "washing", par: "34 / 48", owner: "Housekeeping", note: "Rush cycle running for top-floor arrivals and VIP reset." },
      { id: "laundry-3", item: "Pool towels", status: "delivered", par: "52 / 60", owner: "Front desk", note: "Fresh batch delivered to lobby shelf after afternoon pool traffic." }
    ],
    shuttleItems: [
      { id: "shuttle-214", guestName: "R. Patel", room: "214", trip: "Airport pickup · 10:15 PM", status: "scheduled", owner: "Front desk", note: "Flight landed early; driver needs updated terminal text and bag count." },
      { id: "shuttle-127", guestName: "D. Chen", room: "127", trip: "Conference shuttle · 6:40 AM", status: "confirmed", owner: "Maya", note: "Guest received bilingual pickup instructions and lobby meet point." },
      { id: "shuttle-401", guestName: "L. Brooks", room: "401", trip: "Car service to airport · 7:30 AM", status: "completed", owner: "Front desk", note: "VIP departure completed; luggage loaded and folio note closed." }
    ],
    roomMoveItems: [
      { id: "move-214", guestName: "R. Patel", fromRoom: "214", toRoom: "318", reason: "Bathroom drain failure", status: "requested", owner: "Maya", note: "Need clean inspected room, key recode, and folio note before guest returns from dinner." },
      { id: "move-118", guestName: "Walk-in guest", fromRoom: "118", toRoom: "122", reason: "Noise complaint near stairwell", status: "coordinating", owner: "Front desk", note: "Housekeeping is checking linen reset and desk is reissuing keys now." },
      { id: "move-401", guestName: "L. Brooks", fromRoom: "401", toRoom: "405", reason: "VIP quiet-room preference", status: "completed", owner: "Front desk", note: "Move completed with luggage assist and updated arrival amenities." }
    ],
    minibarItems: [
      { id: "mini-302", room: "302", guestName: "J. Mendoza", item: "2 waters + snack tray", amount: "$18", status: "captured", owner: "Housekeeping", note: "Turn inspection found minibar use after late checkout request; waiting for folio posting." },
      { id: "mini-214", room: "214", guestName: "R. Patel", item: "1 sparkling water", amount: "$6", status: "waived", owner: "Maya", note: "Waived as part of service recovery after drain issue." },
      { id: "mini-401", room: "401", guestName: "L. Brooks", item: "Market breakfast bag", amount: "$14", status: "posted", owner: "Front desk", note: "Conference early departure item already added to folio and guest notified." }
    ],
    vipArrivalItems: [
      { id: "vip-401", guestName: "L. Brooks", room: "401", arrival: "8:00 PM", status: "prepping", owner: "Front desk", note: "Repeat guest wants quiet top-floor room, water stocked, and blackout curtains checked before arrival." },
      { id: "vip-315", guestName: "A. Rivera", room: "315", arrival: "9:10 PM", status: "ready", owner: "Nadia", note: "Room inspected, welcome note placed, and extra towels added for family stay." },
      { id: "vip-122", guestName: "K. Olsen", room: "122", arrival: "Arrived", status: "welcomed", owner: "Maya", note: "Desk completed personalized check-in and market credits were applied on arrival." }
    ],
    groupArrivalItems: [
      { id: "grp-1", groupName: "Bayview youth soccer", rooms: "8 rooms", arrival: "Tomorrow · 4:00 PM", status: "planning", owner: "Front desk", note: "Need adjacent double rooms, bus parking note, and early key packet prep before team arrival rush." },
      { id: "grp-2", groupName: "North Coast roofing crew", rooms: "5 rooms", arrival: "Tonight · 8:30 PM", status: "staged", owner: "Maya", note: "Late arrival list printed, breakfast boxes requested, and room keys staged by last name." },
      { id: "grp-3", groupName: "Westlake wedding block", rooms: "12 rooms", arrival: "Checked in", status: "checked_in", owner: "Front desk", note: "Welcome bags delivered and folio routing confirmed for bride suite extras." }
    ],
    outOfOrderItems: [
      { id: "ooo-214", room: "214", issue: "Bathroom drain collapse", status: "blocked", revenueAtRisk: "$169 tonight", owner: "Julio", note: "Guest moved out. Need plumbing repair, deep clean, and inspection before room can return to inventory." },
      { id: "ooo-119", room: "119", issue: "PTAC replacement in progress", status: "repairing", revenueAtRisk: "$109 tonight", owner: "Maintenance", note: "Part arrived. Housekeeping standing by for dust reset and final linen turn." },
      { id: "ooo-328", room: "328", issue: "Window latch safety fix", status: "released", revenueAtRisk: "$0", owner: "Maya", note: "Repair completed, QA passed, and room reopened for late arrival sale." }
    ],
    deepCleanItems: [
      { id: "dc-315", room: "315", reason: "Post-group turnover reset", status: "scheduled", owner: "Nadia", due: "Tomorrow 11:00 AM", note: "Needs upholstery spot clean, odor check, and baseboard dust removal after team stay." },
      { id: "dc-204", room: "204", reason: "Damage-review recovery clean", status: "in_progress", owner: "Elena", due: "Tonight", note: "Lamp damage already documented; room now needs carpet extraction and amenity reset before inspection." },
      { id: "dc-118", room: "118", reason: "Monthly preventive refresh", status: "completed", owner: "Housekeeping", due: "Done", note: "Mattress rotation, vent dusting, and grout touch-up completed on preventive cycle." }
    ],
    breakfastItems: [
      { id: "bf-214", guestName: "R. Patel", room: "214", order: "2 breakfast boxes + coffee", pickup: "5:15 AM", status: "prep", owner: "Night audit", note: "Airport departure. Boxes need dairy-free yogurt and quick lobby handoff." },
      { id: "bf-127", guestName: "D. Chen", room: "127", order: "Conference early-start bag + bilingual label", pickup: "6:05 AM", status: "ready", owner: "Front desk", note: "Guest wants shuttle timing tucked into the bag and fruit separated for kids." },
      { id: "bf-crew", guestName: "North Coast roofing crew", room: "5 rooms", order: "10 hot breakfast vouchers", pickup: "6:30 AM", status: "delivered", owner: "Maya", note: "Crew leader already received voucher packet and dining-room opening reminder." }
    ],
    requestTimelines: {
      "req-111-cleaning": [
        { id: "t1", type: "system", text: "Front desk created a checkout-style cleaning task for Room 111.", at: "11:02 AM" },
        { id: "t2", type: "ai", text: "Sidekick assigned Room 111 to Maria and asked for acknowledgment.", at: "11:03 AM" },
      ],
      "req-118-towels": [
        { id: "t1", type: "guest", text: "Can you send a couple more towels to room 118?", at: "4:52 PM" },
        { id: "t2", type: "ai", text: "Absolutely. I’ve sent that to housekeeping and will update you here.", at: "4:52 PM" },
        { id: "t3", type: "system", text: "Housekeeping task created and assigned to Elena.", at: "4:53 PM" },
      ],
      "req-127-parking": [
        { id: "t1", type: "guest", text: "Can I park an oversized vehicle here overnight?", at: "1:14 PM" },
        { id: "t2", type: "ai", text: "Yes — oversized vehicles use the east overflow row. Please reply with your plate number so the desk can log it before 10 PM.", at: "1:14 PM" },
        { id: "t3", type: "system", text: "Resolved from Hotel Knowledge without creating a staff task.", at: "1:14 PM" },
      ],
      "req-204-lamp": [
        { id: "t1", type: "staff", text: "Photo uploaded from Room 204. Lamp looks damaged near the base.", at: "4:37 PM" },
        { id: "t2", type: "system", text: "Sidekick suggested damaged fixture and routed the report to maintenance.", at: "4:38 PM" },
        { id: "t3", type: "system", text: "Manager review requested before closing the issue.", at: "4:39 PM" },
      ],
      "req-218-water": [
        { id: "t1", type: "staff", text: "Julio voice note (Spanish): Hay agua juntándose cerca del zócalo del baño en la 218.", at: "5:07 PM" },
        { id: "t2", type: "system", text: "Translated from Spanish: Water is collecting near the bathroom baseboard in Room 218.", at: "5:08 PM" },
        { id: "t3", type: "system", text: "Sidekick detected a possible water-related issue and marked it urgent pending manager confirmation.", at: "5:08 PM" },
      ],
      "req-304-cleaning": [
        { id: "t1", type: "guest", text: "Can someone clean my room while I’m out?", at: "12:41 PM" },
        { id: "t2", type: "ai", text: "Absolutely. I’ve sent the request to housekeeping and will let you know when it is complete.", at: "12:41 PM" },
        { id: "t3", type: "system", text: "Housekeeping task created and assigned to Elena.", at: "12:42 PM" },
        { id: "t4", type: "staff", text: "Room 304 done.", at: "2:18 PM" },
        { id: "t5", type: "system", text: "Elena acknowledged the task and marked Room 304 reported clean.", at: "2:18 PM" },
        { id: "t6", type: "ai", text: "Your room has been cleaned and is ready. Let me know if you need anything else.", at: "2:19 PM" },
        { id: "t7", type: "system", text: "Guest notification delivered and task closed.", at: "2:19 PM" },
      ],
      "req-117-carpet": [
        { id: "t1", type: "staff", text: "Photo uploaded from Room 117. Carpet stain near the desk area.", at: "3:56 PM" },
        { id: "t2", type: "system", text: "Awaiting classification and follow-up instruction.", at: "3:57 PM" },
      ],
      "req-lobby-ice": [
        { id: "t1", type: "system", text: "Front desk logged repeat complaints about the second-floor ice machine.", at: "2:47 PM" },
        { id: "t2", type: "staff", text: "Julio is checking the unit and waiting on a parts decision.", at: "3:02 PM" },
      ],
    },
    requestArtifacts: {
      "req-204-lamp": [
        { id: "artifact-204-1", requestId: "req-204-lamp", name: "room-204-lamp-damage.jpg", kind: "media", sourceLabel: "Uploaded photo", addedAt: "4:37 PM", originalLanguage: "English", translation: "Not needed", suggestedCategory: "Damaged fixture", suggestedSeverity: "High", status: "Awaiting manager review" },
      ],
      "req-218-water": [
        { id: "artifact-218-1", requestId: "req-218-water", name: "room-218-water-note.m4a", kind: "voice", sourceLabel: "Spanish voice note", addedAt: "5:07 PM", originalLanguage: "Spanish", translation: "Water is collecting near the bathroom baseboard in Room 218.", suggestedCategory: "Water damage / plumbing", suggestedSeverity: "Urgent", status: "Awaiting manager review" },
      ],
      "req-117-carpet": [
        { id: "artifact-117-1", requestId: "req-117-carpet", name: "room-117-carpet-stain.jpg", kind: "media", sourceLabel: "Uploaded photo", addedAt: "3:56 PM", originalLanguage: "English", translation: "Not needed", suggestedCategory: "Housekeeping follow-up", suggestedSeverity: "Medium", status: "Awaiting classification" },
      ],
    },
  };
}

function readState(): HotelDemoState {
  const base = defaultState();
  if (typeof window === "undefined") return base;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    return {
      ...base,
      ...parsed,
      property: { ...base.property, ...(parsed?.property || {}) },
      requests: Array.isArray(parsed?.requests) ? parsed.requests : base.requests,
      rooms: Array.isArray(parsed?.rooms) ? parsed.rooms : base.rooms,
      knowledge: Array.isArray(parsed?.knowledge) ? parsed.knowledge : base.knowledge,
      shiftBoard: Array.isArray(parsed?.shiftBoard) ? parsed.shiftBoard : base.shiftBoard,
      staff: Array.isArray(parsed?.staff) ? parsed.staff : base.staff,
      stays: Array.isArray(parsed?.stays) ? parsed.stays : base.stays,
      peopleTasks: Array.isArray(parsed?.peopleTasks) ? parsed.peopleTasks : base.peopleTasks,
      serviceCases: Array.isArray(parsed?.serviceCases) ? parsed.serviceCases : base.serviceCases,
      lostFoundItems: Array.isArray(parsed?.lostFoundItems) ? parsed.lostFoundItems : base.lostFoundItems,
      inspections: Array.isArray(parsed?.inspections) ? parsed.inspections : base.inspections,
      supplies: Array.isArray(parsed?.supplies) ? parsed.supplies : base.supplies,
      auditItems: Array.isArray(parsed?.auditItems) ? parsed.auditItems : base.auditItems,
      incidentItems: Array.isArray(parsed?.incidentItems) ? parsed.incidentItems : base.incidentItems,
      parkingItems: Array.isArray(parsed?.parkingItems) ? parsed.parkingItems : base.parkingItems,
      packageItems: Array.isArray(parsed?.packageItems) ? parsed.packageItems : base.packageItems,
      luggageItems: Array.isArray(parsed?.luggageItems) ? parsed.luggageItems : base.luggageItems,
      wakeupItems: Array.isArray(parsed?.wakeupItems) ? parsed.wakeupItems : base.wakeupItems,
      laundryItems: Array.isArray(parsed?.laundryItems) ? parsed.laundryItems : base.laundryItems,
      shuttleItems: Array.isArray(parsed?.shuttleItems) ? parsed.shuttleItems : base.shuttleItems,
      roomMoveItems: Array.isArray(parsed?.roomMoveItems) ? parsed.roomMoveItems : base.roomMoveItems,
      minibarItems: Array.isArray(parsed?.minibarItems) ? parsed.minibarItems : base.minibarItems,
      vipArrivalItems: Array.isArray(parsed?.vipArrivalItems) ? parsed.vipArrivalItems : base.vipArrivalItems,
      groupArrivalItems: Array.isArray(parsed?.groupArrivalItems) ? parsed.groupArrivalItems : base.groupArrivalItems,
      outOfOrderItems: Array.isArray(parsed?.outOfOrderItems) ? parsed.outOfOrderItems : base.outOfOrderItems,
      deepCleanItems: Array.isArray(parsed?.deepCleanItems) ? parsed.deepCleanItems : base.deepCleanItems,
      breakfastItems: Array.isArray(parsed?.breakfastItems) ? parsed.breakfastItems : base.breakfastItems,
      requestTimelines: parsed?.requestTimelines && typeof parsed.requestTimelines === "object" ? parsed.requestTimelines : base.requestTimelines,
      requestArtifacts: parsed?.requestArtifacts && typeof parsed.requestArtifacts === "object" ? parsed.requestArtifacts : base.requestArtifacts,
    };
  } catch {
    return base;
  }
}

export function useHotelDemoState() {
  const [state, setState] = useState<HotelDemoState>(readState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setState(readState());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage write failures so the demo UI never hard-crashes.
    }
  }, [state, loaded]);

  const actions = useMemo(() => ({
    updateRequestStatus(requestId: string, status: HotelDemoRequest["status"]) {
      setState((prev) => ({
        ...prev,
        requests: prev.requests.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status,
                resolutionState: status === "resolved" ? "closed" : request.resolutionState,
                waitMinutes: status === "resolved" ? 0 : request.waitMinutes,
              }
            : request
        ),
      }));
    },
    assignRequest(requestId: string, assignedTo: string) {
      setState((prev) => ({
        ...prev,
        requests: prev.requests.map((request) =>
          request.id === requestId
            ? {
                ...request,
                assignedTo,
                status: request.status === "resolved" ? request.status : "in_progress",
                resolutionState: request.status === "resolved" ? "closed" : "staff_dispatched",
              }
            : request
        ),
      }));
    },
    updateRequestWorkflow(requestId: string, patch: Partial<Pick<HotelDemoRequest, "resolutionState" | "routeTeam" | "sla" | "stayId" | "triageStatus" | "routingConfidence" | "escalationOwner" | "handoffNote" | "dispatcher">>) {
      setState((prev) => ({
        ...prev,
        requests: prev.requests.map((request) =>
          request.id === requestId ? { ...request, ...patch } : request
        ),
      }));
    },
    updateRequest(requestId: string, patch: Partial<HotelDemoRequest>) {
      setState((prev) => ({
        ...prev,
        requests: prev.requests.map((request) =>
          request.id === requestId ? { ...request, ...patch } : request
        ),
      }));
    },
    updateRequestDetail(requestId: string, detail: string) {
      setState((prev) => ({
        ...prev,
        requests: prev.requests.map((request) =>
          request.id === requestId ? { ...request, detail } : request
        ),
      }));
    },
    addTimelineEvent(requestId: string, event: Omit<HotelRequestTimelineEvent, "id">) {
      setState((prev) => ({
        ...prev,
        requestTimelines: {
          ...prev.requestTimelines,
          [requestId]: [
            ...(prev.requestTimelines[requestId] || []),
            { ...event, id: `${requestId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
          ],
        },
      }));
    },
    addRequestArtifact(requestId: string, artifact: Omit<HotelRequestArtifact, "id" | "requestId">) {
      setState((prev) => ({
        ...prev,
        requestArtifacts: {
          ...prev.requestArtifacts,
          [requestId]: [
            ...(prev.requestArtifacts[requestId] || []),
            { ...artifact, requestId, id: `${requestId}-artifact-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
          ],
        },
      }));
    },
    createRequest(request: HotelDemoRequest, timeline: Omit<HotelRequestTimelineEvent, "id">[] = []) {
      const normalizedRequest: HotelDemoRequest = {
        ...request,
        resolutionState: request.resolutionState || (request.status === "resolved" ? "closed" : "new"),
        triageStatus: request.triageStatus || (request.status === "resolved" ? "auto_resolved" : request.status === "needs_approval" ? "needs_review" : "auto_routed"),
        routingConfidence: request.routingConfidence || "medium",
        escalationOwner: request.escalationOwner ?? (request.priority === "urgent" || request.status === "needs_approval" ? "Maya" : null),
        handoffNote: request.handoffNote ?? null,
        dispatcher: request.dispatcher ?? "Sidekick triage",
      };
      setState((prev) => ({
        ...prev,
        requests: [normalizedRequest, ...prev.requests],
        requestTimelines: {
          ...prev.requestTimelines,
          [normalizedRequest.id]: timeline.map((event, index) => ({
            ...event,
            id: `${normalizedRequest.id}-seed-${index}`,
          })),
        },
        requestArtifacts: {
          ...prev.requestArtifacts,
          [normalizedRequest.id]: prev.requestArtifacts[normalizedRequest.id] || [],
        },
      }));
    },
    createServiceCase(serviceCase: HotelServiceCase) {
      setState((prev) => ({
        ...prev,
        serviceCases: [serviceCase, ...prev.serviceCases],
      }));
    },
    updateRoomStatus(roomNumber: string, status: string) {
      setState((prev) => ({
        ...prev,
        rooms: prev.rooms.map((room) => (room.room === roomNumber ? { ...room, status } : room)),
      }));
    },
    updateRoomNote(roomNumber: string, note: string) {
      setState((prev) => ({
        ...prev,
        rooms: prev.rooms.map((room) => (room.room === roomNumber ? { ...room, note } : room)),
      }));
    },
    updateRoomOwner(roomNumber: string, owner: string) {
      setState((prev) => ({
        ...prev,
        rooms: prev.rooms.map((room) => (room.room === roomNumber ? { ...room, owner } : room)),
      }));
    },
    updateProperty(patch: Partial<HotelDemoState["property"]>) {
      setState((prev) => ({ ...prev, property: { ...prev.property, ...patch } }));
    },
    addKnowledgeItem(item: HotelKnowledgeItem) {
      setState((prev) => ({
        ...prev,
        knowledge: [item, ...prev.knowledge],
      }));
    },
    updateShiftNote(team: string, note: string) {
      setState((prev) => ({
        ...prev,
        shiftBoard: prev.shiftBoard.map((item) => (item.team === team ? { ...item, note } : item)),
      }));
    },
    updateStayStatus(stayId: string, status: HotelStay["status"]) {
      setState((prev) => ({
        ...prev,
        stays: prev.stays.map((stay) => (stay.id === stayId ? { ...stay, status } : stay)),
      }));
    },
    updateStayNote(stayId: string, notes: string) {
      setState((prev) => ({
        ...prev,
        stays: prev.stays.map((stay) => (stay.id === stayId ? { ...stay, notes } : stay)),
      }));
    },
    updatePeopleTaskStatus(taskId: string, status: HotelPeopleTask["status"]) {
      setState((prev) => ({
        ...prev,
        peopleTasks: prev.peopleTasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
      }));
    },
    updatePeopleTaskNote(taskId: string, note: string) {
      setState((prev) => ({
        ...prev,
        peopleTasks: prev.peopleTasks.map((task) => (task.id === taskId ? { ...task, note } : task)),
      }));
    },
    updateServiceCaseStatus(caseId: string, status: HotelServiceCase["status"]) {
      setState((prev) => ({
        ...prev,
        serviceCases: prev.serviceCases.map((item) => (item.id === caseId ? { ...item, status } : item)),
      }));
    },
    updateServiceCaseRecovery(caseId: string, recovery: string) {
      setState((prev) => ({
        ...prev,
        serviceCases: prev.serviceCases.map((item) => (item.id === caseId ? { ...item, recovery } : item)),
      }));
    },
    updateLostFoundStatus(itemId: string, status: HotelLostFoundItem["status"]) {
      setState((prev) => ({
        ...prev,
        lostFoundItems: prev.lostFoundItems.map((item) => (item.id === itemId ? { ...item, status } : item)),
      }));
    },
    updateLostFoundNote(itemId: string, note: string) {
      setState((prev) => ({
        ...prev,
        lostFoundItems: prev.lostFoundItems.map((item) => (item.id === itemId ? { ...item, note } : item)),
      }));
    },
    updateInspectionStatus(inspectionId: string, status: HotelInspectionItem["status"]) {
      setState((prev) => ({
        ...prev,
        inspections: prev.inspections.map((item) => (item.id === inspectionId ? { ...item, status } : item)),
      }));
    },
    updateInspectionNote(inspectionId: string, note: string) {
      setState((prev) => ({
        ...prev,
        inspections: prev.inspections.map((item) => (item.id === inspectionId ? { ...item, note } : item)),
      }));
    },
    updateSupplyStock(supplyId: string, stock: HotelSupplyItem["stock"]) {
      setState((prev) => ({
        ...prev,
        supplies: prev.supplies.map((item) => (item.id === supplyId ? { ...item, stock } : item)),
      }));
    },
    updateSupplyNote(supplyId: string, note: string) {
      setState((prev) => ({
        ...prev,
        supplies: prev.supplies.map((item) => (item.id === supplyId ? { ...item, note } : item)),
      }));
    },
    updateAuditStatus(auditId: string, status: HotelAuditItem["status"]) {
      setState((prev) => ({
        ...prev,
        auditItems: prev.auditItems.map((item) => (item.id === auditId ? { ...item, status } : item)),
      }));
    },
    updateAuditNote(auditId: string, note: string) {
      setState((prev) => ({
        ...prev,
        auditItems: prev.auditItems.map((item) => (item.id === auditId ? { ...item, note } : item)),
      }));
    },
    updateIncidentStatus(incidentId: string, status: HotelIncidentItem["status"]) {
      setState((prev) => ({
        ...prev,
        incidentItems: prev.incidentItems.map((item) => (item.id === incidentId ? { ...item, status } : item)),
      }));
    },
    updateIncidentNote(incidentId: string, note: string) {
      setState((prev) => ({
        ...prev,
        incidentItems: prev.incidentItems.map((item) => (item.id === incidentId ? { ...item, note } : item)),
      }));
    },
    updateParkingStatus(parkingId: string, status: HotelParkingItem["status"]) {
      setState((prev) => ({
        ...prev,
        parkingItems: prev.parkingItems.map((item) => (item.id === parkingId ? { ...item, status } : item)),
      }));
    },
    updateParkingNote(parkingId: string, note: string) {
      setState((prev) => ({
        ...prev,
        parkingItems: prev.parkingItems.map((item) => (item.id === parkingId ? { ...item, note } : item)),
      }));
    },
    updatePackageStatus(packageId: string, status: HotelPackageItem["status"]) {
      setState((prev) => ({
        ...prev,
        packageItems: prev.packageItems.map((item) => (item.id === packageId ? { ...item, status } : item)),
      }));
    },
    updatePackageNote(packageId: string, note: string) {
      setState((prev) => ({
        ...prev,
        packageItems: prev.packageItems.map((item) => (item.id === packageId ? { ...item, note } : item)),
      }));
    },
    updateLuggageStatus(luggageId: string, status: HotelLuggageItem["status"]) {
      setState((prev) => ({
        ...prev,
        luggageItems: prev.luggageItems.map((item) => (item.id === luggageId ? { ...item, status } : item)),
      }));
    },
    updateLuggageNote(luggageId: string, note: string) {
      setState((prev) => ({
        ...prev,
        luggageItems: prev.luggageItems.map((item) => (item.id === luggageId ? { ...item, note } : item)),
      }));
    },
    updateWakeupStatus(wakeupId: string, status: HotelWakeupItem["status"]) {
      setState((prev) => ({
        ...prev,
        wakeupItems: prev.wakeupItems.map((item) => (item.id === wakeupId ? { ...item, status } : item)),
      }));
    },
    updateWakeupNote(wakeupId: string, note: string) {
      setState((prev) => ({
        ...prev,
        wakeupItems: prev.wakeupItems.map((item) => (item.id === wakeupId ? { ...item, note } : item)),
      }));
    },
    updateLaundryStatus(laundryId: string, status: HotelLaundryItem["status"]) {
      setState((prev) => ({
        ...prev,
        laundryItems: prev.laundryItems.map((item) => (item.id === laundryId ? { ...item, status } : item)),
      }));
    },
    updateLaundryNote(laundryId: string, note: string) {
      setState((prev) => ({
        ...prev,
        laundryItems: prev.laundryItems.map((item) => (item.id === laundryId ? { ...item, note } : item)),
      }));
    },
    updateShuttleStatus(shuttleId: string, status: HotelShuttleItem["status"]) {
      setState((prev) => ({
        ...prev,
        shuttleItems: prev.shuttleItems.map((item) => (item.id === shuttleId ? { ...item, status } : item)),
      }));
    },
    updateShuttleNote(shuttleId: string, note: string) {
      setState((prev) => ({
        ...prev,
        shuttleItems: prev.shuttleItems.map((item) => (item.id === shuttleId ? { ...item, note } : item)),
      }));
    },
    updateRoomMoveStatus(roomMoveId: string, status: HotelRoomMoveItem["status"]) {
      setState((prev) => ({
        ...prev,
        roomMoveItems: prev.roomMoveItems.map((item) => (item.id === roomMoveId ? { ...item, status } : item)),
      }));
    },
    updateRoomMoveNote(roomMoveId: string, note: string) {
      setState((prev) => ({
        ...prev,
        roomMoveItems: prev.roomMoveItems.map((item) => (item.id === roomMoveId ? { ...item, note } : item)),
      }));
    },
    updateMinibarStatus(minibarId: string, status: HotelMinibarItem["status"]) {
      setState((prev) => ({
        ...prev,
        minibarItems: prev.minibarItems.map((item) => (item.id === minibarId ? { ...item, status } : item)),
      }));
    },
    updateMinibarNote(minibarId: string, note: string) {
      setState((prev) => ({
        ...prev,
        minibarItems: prev.minibarItems.map((item) => (item.id === minibarId ? { ...item, note } : item)),
      }));
    },
    updateVipArrivalStatus(vipId: string, status: HotelVipArrivalItem["status"]) {
      setState((prev) => ({
        ...prev,
        vipArrivalItems: prev.vipArrivalItems.map((item) => (item.id === vipId ? { ...item, status } : item)),
      }));
    },
    updateVipArrivalNote(vipId: string, note: string) {
      setState((prev) => ({
        ...prev,
        vipArrivalItems: prev.vipArrivalItems.map((item) => (item.id === vipId ? { ...item, note } : item)),
      }));
    },
    updateGroupArrivalStatus(groupId: string, status: HotelGroupArrivalItem["status"]) {
      setState((prev) => ({
        ...prev,
        groupArrivalItems: prev.groupArrivalItems.map((item) => (item.id === groupId ? { ...item, status } : item)),
      }));
    },
    updateGroupArrivalNote(groupId: string, note: string) {
      setState((prev) => ({
        ...prev,
        groupArrivalItems: prev.groupArrivalItems.map((item) => (item.id === groupId ? { ...item, note } : item)),
      }));
    },
    updateOutOfOrderStatus(itemId: string, status: HotelOutOfOrderItem["status"]) {
      setState((prev) => ({
        ...prev,
        outOfOrderItems: prev.outOfOrderItems.map((item) => (item.id === itemId ? { ...item, status } : item)),
      }));
    },
    updateOutOfOrderNote(itemId: string, note: string) {
      setState((prev) => ({
        ...prev,
        outOfOrderItems: prev.outOfOrderItems.map((item) => (item.id === itemId ? { ...item, note } : item)),
      }));
    },
    updateDeepCleanStatus(itemId: string, status: HotelDeepCleanItem["status"]) {
      setState((prev) => ({
        ...prev,
        deepCleanItems: prev.deepCleanItems.map((item) => (item.id === itemId ? { ...item, status } : item)),
      }));
    },
    updateDeepCleanNote(itemId: string, note: string) {
      setState((prev) => ({
        ...prev,
        deepCleanItems: prev.deepCleanItems.map((item) => (item.id === itemId ? { ...item, note } : item)),
      }));
    },
    updateBreakfastStatus(itemId: string, status: HotelBreakfastItem["status"]) {
      setState((prev) => ({
        ...prev,
        breakfastItems: prev.breakfastItems.map((item) => (item.id === itemId ? { ...item, status } : item)),
      }));
    },
    updateBreakfastNote(itemId: string, note: string) {
      setState((prev) => ({
        ...prev,
        breakfastItems: prev.breakfastItems.map((item) => (item.id === itemId ? { ...item, note } : item)),
      }));
    },
    reset() {
      const next = defaultState();
      setState(next);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
    },
  }), []);

  const metrics = useMemo(() => {
    const openRequests = state.requests.filter((r) => r.status !== "resolved");
    const openMaintenance = state.requests.filter((r) => r.kind === "maintenance" && r.status !== "resolved");
    const roomsNeedingService = state.rooms.filter((r) => ["dirty", "inspection", "maintenance", "queued", "occupied"].includes(r.status)).length;
    const approvalsPending = state.requests.filter((r) => r.status === "needs_approval").length;
    return {
      openGuestRequests: openRequests.length,
      roomsNeedingService,
      openMaintenanceIssues: openMaintenance.length,
      approvalsPending,
      avgGuestResponseSeconds: 42,
      resolvedAutomatically: state.requests.filter((r) => r.assignedTo === "AI concierge" && r.status === "resolved").length,
    };
  }, [state]);

  return { state, actions, metrics, loaded };
}
