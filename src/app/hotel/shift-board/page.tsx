"use client";

import { HotelPageHeader } from "@/components/hotel/HotelUi";
import { useHotelDemoState } from "@/lib/hotel-demo-store";

export default function HotelShiftBoardPage() {
  const { state, actions, loaded } = useHotelDemoState();

  if (!loaded) return null;

  return (
    <div className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px]">
        <div>
          <HotelPageHeader
            title="Shift board"
            body="A hotel-specific handoff view for front desk, housekeeping, maintenance, and guest support."
          />
          <div className="overflow-hidden rounded-3xl border border-black/8 bg-white shadow-sm">
            {state.shiftBoard.map((item) => (
              <div key={item.team} className="flex items-start gap-4 border-b border-black/5 px-5 py-4 last:border-b-0">
                <div className="min-w-[120px] text-sm font-semibold text-[#1C1A16]">{item.team}</div>
                <div className="flex-1 text-sm text-black/55">{item.note}</div>
                <button
                  onClick={() => actions.updateShiftNote(item.team, `${item.note} Handoff note confirmed.`)}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60"
                >
                  Confirm handoff
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm self-start">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">On shift now</div>
          <div className="mt-4 space-y-3">
            {state.staff.map((person) => (
              <div key={person.name} className="rounded-2xl border border-black/6 bg-[#fffdfa] px-4 py-3">
                <div className="text-sm font-semibold text-[#1C1A16]">{person.name}</div>
                <div className="mt-1 text-xs text-black/45">{person.team} · {person.shift}</div>
                <div className="mt-1 text-xs text-black/35">{person.phone}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
