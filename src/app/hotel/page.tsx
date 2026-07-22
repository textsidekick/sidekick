"use client";

import { BedDouble, ConciergeBell, Wrench, Clock3, Languages, Sparkles, DoorOpen, BellRing, MessageSquareText, CalendarClock, UsersRound, HeartHandshake, SearchCheck, ClipboardCheck, Package2, ReceiptText, ShieldAlert, CarFront, PackageCheck, BriefcaseBusiness, AlarmClockCheck, WashingMachine, BusFront, ArrowRightLeft, Refrigerator, Crown, Users, Ban, SprayCan } from "lucide-react";
import { HotelPageHeader, HotelMetric, HotelQueueCard, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelOverviewPage() {
  const { state, metrics, loaded } = useHotelDemoState();

  if (!loaded) return null;

  const attention = state.requests
    .filter((request) => request.status !== "resolved")
    .sort((a, b) => {
      const score = (priority: string) => (priority === "urgent" ? 3 : priority === "high" ? 2 : 1);
      return score(b.priority) - score(a.priority) || b.waitMinutes - a.waitMinutes;
    })
    .slice(0, 5);

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <HotelPageHeader
          eyebrow="Hotel Project"
          title={`${state.property.name} operations`}
          body="Separate hotel app prototype. Guests, front desk, housekeeping, and maintenance all coordinate through text, with every request turned into tracked work and reusable operating memory."
          action={
            <div className="rounded-full bg-[#f7f1e8] px-4 py-2 text-sm font-medium text-black/60">
              {state.property.roomCount} rooms · {state.property.city} · {state.property.occupancyPct}% occupied
            </div>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <HotelMetric label="Open guest requests" value={metrics.openGuestRequests} sub="Requests still waiting on action or update" />
          <HotelMetric label="Rooms needing service" value={metrics.roomsNeedingService} sub="Dirty, inspection, maintenance, or queued" />
          <HotelMetric label="Open maintenance issues" value={metrics.openMaintenanceIssues} sub="Live room-impacting or property issues" />
          <HotelMetric label="Approvals pending" value={metrics.approvalsPending} sub="Late checkout, damage, refund, and exception decisions" />
          <HotelMetric label="Guest response time" value={`${metrics.avgGuestResponseSeconds}s`} sub="Average time to first reply" />
          <HotelMetric label="Auto-resolved" value={metrics.resolvedAutomatically} sub="Guest questions fully handled by AI concierge" />
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-3">
          <div className="rounded-3xl border border-black/8 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">Live desk view</div>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">What needs attention now</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f7f1e8] px-3 py-1 text-xs font-medium text-black/55">
                <Clock3 className="h-3.5 w-3.5" /> Shift handoff in 47 min
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {attention.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 rounded-2xl border border-black/6 bg-[#fffdfa] px-4 py-4">
                  <div>
                    <div className="text-sm font-semibold text-[#1C1A16]">
                      {item.room.startsWith("Room") ? item.room : `Room ${item.room}`} · {item.title}
                    </div>
                    <div className="mt-1 text-xs text-black/45">
                      {item.kind.replace("_", " ")} · {item.detail} · {item.waitMinutes} min waiting
                    </div>
                  </div>
                  <HotelStatusPill tone={item.priority === "urgent" ? "urgent" : item.priority === "high" ? "high" : item.status === "needs_approval" ? "queued" : "normal"}>
                    {item.priority === "urgent" ? "Urgent" : item.status === "needs_approval" ? "Needs approval" : item.status === "in_progress" ? "In progress" : "Open"}
                  </HotelStatusPill>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-black/8 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">Why this is separate</div>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Different operating language</h2>
            <div className="mt-5 space-y-4 text-sm leading-6 text-black/60">
              <div className="flex gap-3"><BedDouble className="mt-0.5 h-4 w-4 text-[#C96442]" /> Rooms, turns, linen, inspections, minibar, damages</div>
              <div className="flex gap-3"><ConciergeBell className="mt-0.5 h-4 w-4 text-[#C96442]" /> Guest requests, late checkout, parking, breakfast, lost and found</div>
              <div className="flex gap-3"><Wrench className="mt-0.5 h-4 w-4 text-[#C96442]" /> Shower, HVAC, key card, TV, plumbing, safety escalation</div>
              <div className="flex gap-3"><Languages className="mt-0.5 h-4 w-4 text-[#C96442]" /> Multilingual staff texting with one clean manager view</div>
              <div className="flex gap-3"><Sparkles className="mt-0.5 h-4 w-4 text-[#C96442]" /> Every exception becomes hotel-specific operating memory</div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-26">
          <HotelQueueCard href="/hotel/guest-requests" icon={ConciergeBell} title="Guest requests" count={metrics.openGuestRequests} detail="Open concierge and guest support texts waiting on either an answer, task, or update." />
          <HotelQueueCard href="/hotel/front-desk" icon={BellRing} title="Front desk board" count={metrics.approvalsPending + state.requests.filter((r) => r.kind === "front_desk" && r.status !== "resolved").length} detail="Check-ins, late checkout calls, policy questions, and approvals waiting on the desk." />
          <HotelQueueCard href="/hotel/sms" icon={MessageSquareText} title="SMS console" count={state.requests.filter((r) => r.source === "guest sms").length} detail="Simulate inbound guest texts and watch them create requests, escalations, and auto-replies." />
          <HotelQueueCard href="/hotel/stays" icon={CalendarClock} title="Arrivals & departures" count={state.stays.filter((stay) => stay.status === "arriving" || stay.status === "departing").length} detail="Track check-ins, departures, late checkouts, and rooms that need desk coordination." />
          <HotelQueueCard href="/hotel/people" icon={UsersRound} title="People ops" count={state.peopleTasks.filter((task) => task.status !== "done").length} detail="Training, coverage, onboarding, and policy rollouts tracked through the same text-first workflow." />
          <HotelQueueCard href="/hotel/service-recovery" icon={HeartHandshake} title="Service recovery" count={state.serviceCases.filter((item) => item.status !== "closed").length} detail="Save-the-stay cases, refund decisions, and service recovery offers before bad reviews or chargebacks." />
          <HotelQueueCard href="/hotel/lost-found" icon={SearchCheck} title="Lost & found" count={state.lostFoundItems.filter((item) => item.status !== "shipped").length} detail="Track found items, guest contact, pickup, and shipping follow-through before claims get messy." />
          <HotelQueueCard href="/hotel/inspections" icon={ClipboardCheck} title="Inspections" count={state.inspections.filter((item) => item.status !== "passed").length} detail="QA room turns before release so missed amenities and defects do not hit the next guest." />
          <HotelQueueCard href="/hotel/supplies" icon={Package2} title="Supplies" count={state.supplies.filter((item) => item.stock !== "ok").length} detail="Track towels, amenities, and guest-comfort stock before shortages slow turns or hurt recovery." />
          <HotelQueueCard href="/hotel/audit" icon={ReceiptText} title="Night audit" count={state.auditItems.filter((item) => item.status !== "resolved").length} detail="Catch folio mismatches, OTA exceptions, and compliance gaps before the shift closes." />
          <HotelQueueCard href="/hotel/incidents" icon={ShieldAlert} title="Incident log" count={state.incidentItems.filter((item) => item.status !== "closed").length} detail="Track safety events, smoking violations, parking incidents, and containment follow-through before exposure grows." />
          <HotelQueueCard href="/hotel/parking" icon={CarFront} title="Parking" count={state.parkingItems.filter((item) => item.status !== "cleared").length} detail="Manage plate capture, oversized vehicles, EV spots, and post-checkout lot exceptions before they hit the desk." />
          <HotelQueueCard href="/hotel/packages" icon={PackageCheck} title="Packages" count={state.packageItems.filter((item) => item.status !== "picked_up").length} detail="Track guest deliveries, notification follow-through, and secure pickup so front desk handoffs do not get messy." />
          <HotelQueueCard href="/hotel/luggage" icon={BriefcaseBusiness} title="Luggage hold" count={state.luggageItems.filter((item) => item.status !== "released").length} detail="Manage bag holds, claim-tag verification, and post-checkout storage so handoffs stay secure during busy shifts." />
          <HotelQueueCard href="/hotel/wakeups" icon={AlarmClockCheck} title="Wake-up calls" count={state.wakeupItems.filter((item) => item.status !== "completed").length} detail="Track morning wake-ups, backup SMS confirms, and guest follow-through so departures do not start with complaints." />
          <HotelQueueCard href="/hotel/laundry" icon={WashingMachine} title="Laundry" count={state.laundryItems.filter((item) => item.status !== "delivered").length} detail="Track linen turnaround, delayed pickups, and room-ready laundry gaps before arrivals get blocked." />
          <HotelQueueCard href="/hotel/shuttles" icon={BusFront} title="Shuttles" count={state.shuttleItems.filter((item) => item.status !== "completed").length} detail="Coordinate airport pickups, conference rides, and departure transports so desk promises actually get executed." />
          <HotelQueueCard href="/hotel/room-moves" icon={ArrowRightLeft} title="Room moves" count={state.roomMoveItems.filter((item) => item.status !== "completed").length} detail="Coordinate service-recovery moves, noise complaints, key swaps, and housekeeping resets without losing the guest." />
          <HotelQueueCard href="/hotel/minibar" icon={Refrigerator} title="Minibar & market" count={state.minibarItems.filter((item) => item.status === "captured").length} detail="Capture room-charge items, post market sales, and document waivers before revenue slips through check-out." />
          <HotelQueueCard href="/hotel/vip-arrivals" icon={Crown} title="VIP arrivals" count={state.vipArrivalItems.filter((item) => item.status !== "welcomed").length} detail="Coordinate preferences, amenities, and personalized arrival prep before high-value stays become recoveries." />
          <HotelQueueCard href="/hotel/group-arrivals" icon={Users} title="Group arrivals" count={state.groupArrivalItems.filter((item) => item.status !== "checked_in").length} detail="Stage keys, room blocks, breakfast plans, and coach/crew logistics before group check-in overwhelms the desk." />
          <HotelQueueCard href="/hotel/out-of-order" icon={Ban} title="Out of order" count={state.outOfOrderItems.filter((item) => item.status !== "released").length} detail="Track blocked rooms, repair progress, and reopened inventory so room loss does not disappear between maintenance and the desk." />
          <HotelQueueCard href="/hotel/deep-cleans" icon={SprayCan} title="Deep cleans" count={state.deepCleanItems.filter((item) => item.status !== "completed").length} detail="Schedule preventive resets, damage-recovery cleaning, and heavy-turn housekeeping before quality slips hit the next guest." />
          <HotelQueueCard href="/hotel/rooms" icon={DoorOpen} title="Room board" count={state.property.roomCount} detail="Live room readiness, service state, damages, inspections, and maintenance blockers." />
          <HotelQueueCard href="/hotel/housekeeping" icon={BedDouble} title="Housekeeping board" count={state.rooms.filter((room) => ["dirty", "inspection", "queued"].includes(room.status)).length} detail="Room cleans, inspections, restocks, damage photos, and room-ready status." />
          <HotelQueueCard href="/hotel/maintenance" icon={Wrench} title="Maintenance queue" count={metrics.openMaintenanceIssues} detail="Broken showers, HVAC issues, key cards, TVs, plumbing, and safety issues." />
          <HotelQueueCard href="/hotel/knowledge" icon={Sparkles} title="Operating memory" count={state.knowledge.length} detail="Captured fixes, guest policies, exceptions, and property-specific know-how." />
        </div>
      </div>
    </div>
  );
}
