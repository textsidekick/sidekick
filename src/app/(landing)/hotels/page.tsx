import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, BedDouble, Wrench, Languages, Sparkles, ArrowRight, Clock3, ClipboardList } from "lucide-react";

export const metadata: Metadata = {
  title: "Sidekick for Hotels & Motels",
  description:
    "Sidekick is the guest request and shift coordination layer for hotels and motels. It turns guest messages and room exceptions into owned, time-bound work.",
};

const bullets = [
  "One live queue for guest requests, arrivals, departures, and desk exceptions",
  "Every guest message becomes owned, time-bound work with one clear next step",
  "Housekeeping and maintenance get routed tasks by text in any language",
  "Resolved issues become reusable hotel operating memory instead of disappearing at shift change",
];

const useCases = [
  {
    icon: MessageSquare,
    title: "Guest request loop",
    body: "Capture the text, route the work, keep the guest updated, and close the loop only after the stay is actually protected.",
  },
  {
    icon: Clock3,
    title: "Next 2 hours control",
    body: "Run the shift by arrivals, departures, blocked rooms, and promised guest follow-through instead of scattered departmental boards.",
  },
  {
    icon: BedDouble,
    title: "Room readiness coordination",
    body: "Connect guest demand to room status so the desk, housekeeping, and maintenance can recover inventory before the next wave hits.",
  },
  {
    icon: ClipboardList,
    title: "Shift handoff",
    body: "Preserve unresolved work, guest promises, and room blockers so the next shift inherits what matters instead of starting blind.",
  },
];

export default function HotelsPage() {
  return (
    <main className="min-h-screen bg-[#faf8f1] text-[#26251e]">
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-10 sm:px-8 lg:px-10">
        <div className="mb-14 flex items-center justify-between gap-4">
          <Link href="/" className="text-sm font-medium text-[#1d6bf3] hover:opacity-80">
            ← Back to Sidekick
          </Link>
          <a
            href="https://calendly.com/justin-textsidekick"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#26251e] px-5 py-2.5 text-sm font-medium text-white"
          >
            Book a demo <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black/55">
              <Sparkles className="h-3.5 w-3.5" /> New vertical in progress
            </div>
            <h1 className="max-w-4xl text-5xl font-medium tracking-[-0.04em] sm:text-6xl">
              The guest request and shift coordination layer for hotels and motels.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-black/70">
              Guests and staff already text. Sidekick turns every guest message and room exception into owned work, clear updates, and calmer shift execution across the desk, housekeeping, and maintenance.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {bullets.map((bullet) => (
                <div key={bullet} className="rounded-2xl border border-black/8 bg-white px-4 py-4 text-sm leading-6 text-black/70 shadow-sm">
                  {bullet}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)]">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-black/40">Example live flow</div>
            <div className="space-y-3 text-sm leading-6">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[#1d6bf3] px-4 py-3 text-white">
                Room 214 shower is broken and guest also asked for extra towels.
              </div>
              <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-[#f3efe4] px-4 py-3 text-[#26251e]">
                Got it. I notified maintenance about the shower and sent housekeeping a towel request for Room 214. I’ll text you when both are complete.
              </div>
              <div className="max-w-[82%] rounded-2xl rounded-bl-md bg-[#f7f4ec] px-4 py-3 text-[#26251e] border border-black/5">
                Maintenance task created: <strong>Room 214 shower repair</strong><br />
                Housekeeping task created: <strong>Deliver extra towels</strong>
              </div>
              <div className="max-w-[82%] rounded-2xl rounded-bl-md border border-black/5 bg-[#fff7ec] px-4 py-3 text-[#26251e]">
                Desk note: <strong>Guest updated</strong> · ETA given · service recovery watch enabled until verified.
              </div>
              <div className="ml-auto max-w-[72%] rounded-2xl rounded-br-md bg-[#e8f0ff] px-4 py-3 text-[#1547a8]">
                Towels delivered. Shower repair in progress.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-black/6 bg-white/60 py-20">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-medium tracking-[-0.03em]">First MVP scope</h2>
            <p className="mt-3 text-base leading-7 text-black/65">
              Start with the operational core: the live guest request loop, arrivals/departures execution, room-readiness coordination, and shift handoff.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {useCases.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-3xl border border-black/8 bg-white p-6 shadow-sm">
                <Icon className="mb-4 h-5 w-5 text-black/55" />
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-black/65">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-black/8 bg-[#faf6ef] p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">What this is not</div>
            <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm leading-6 text-black/65">
              <div className="rounded-2xl bg-white px-4 py-4">Not a full PMS replacement with rates, folios, and reservations at the center.</div>
              <div className="rounded-2xl bg-white px-4 py-4">Not a giant stack of disconnected hotel boards that each need their own attention.</div>
              <div className="rounded-2xl bg-white px-4 py-4">Not generic task software — it is built around the moments that actually hurt the stay.</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
