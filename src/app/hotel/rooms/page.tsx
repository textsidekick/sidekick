"use client";

import { HotelPageHeader, HotelMetric, HotelSourcePill, HotelStatusPill } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";
import { formatRoomStatus, getRoomStatusTone, roomHistoryRows } from "@/lib/hotel-demo-view";

export default function HotelRoomsPage() {
  const { loaded } = useHotelDemoState();

  if (!loaded) return null;

  const metrics = [
    { label: "Cleaning requested", value: 2, detail: "Entered by guest or front desk" },
    { label: "Manager review", value: 1, detail: "Needs human confirmation" },
    { label: "Maintenance required", value: 2, detail: "Operational follow-through" },
    { label: "Issue resolved", value: 2, detail: "Closed with Sidekick history" },
  ];

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1460px]">
        <HotelPageHeader
          eyebrow="Rooms"
          title="Room-by-room operational history"
          body="The Rooms page tracks only the operational activity Sidekick actually knows from messages, reports, manager entries, and task history. It is not a live occupancy or availability board."
        />

        <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => <HotelMetric key={metric.label} label={metric.label} value={metric.value} sub={metric.detail} />)}
        </div>

        <section className="rounded-2xl border border-[#E1E5E2] bg-white p-5">
          <div className="border-b border-[#E1E5E2] pb-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Operational activity</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#18222C]">Sidekick’s known operational activity and history for each room</h2>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {roomHistoryRows.map((room) => (
              <div key={room.room} className="rounded-2xl border border-[#E1E5E2] bg-[#FCFCFB] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-[#18222C]">Room {room.room} — {room.status}</div>
                    <div className="mt-1 text-sm text-[#5C6975]">{room.detail}</div>
                  </div>
                  <HotelStatusPill tone={getRoomStatusTone(room.status.toLowerCase().replace(/ /g, "_"))}>{room.status}</HotelStatusPill>
                </div>
                <div className="mt-3 space-y-1 text-sm text-[#5C6975]">
                  <div>{room.owner}</div>
                  <div>{room.note}</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#5C6975]">
                  <HotelSourcePill>{room.source}</HotelSourcePill>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[#E1E5E2] bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">Allowed room states</div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              "No active activity",
              "Cleaning requested",
              "Cleaning assigned",
              "Cleaning in progress",
              "Reported clean",
              "Awaiting verification",
              "Guest request open",
              "Maintenance required",
              "Manager review",
              "Manually blocked",
              "Issue resolved",
            ].map((status) => (
              <div key={status} className="rounded-xl border border-[#E1E5E2] bg-[#FCFCFB] px-4 py-3 text-sm text-[#18222C]">{status}</div>
            ))}
          </div>
          <div className="mt-4 text-sm text-[#5C6975]">Do not show live occupancy, availability, arrivals, or departures here unless an actual integration is connected and clearly labeled.</div>
        </section>
      </div>
    </div>
  );
}
