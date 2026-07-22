import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, BedDouble, Wrench, Languages, Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Sidekick for Hotels & Motels",
  description:
    "Guests and staff text naturally. Sidekick answers questions, routes hotel tasks, updates guests, and turns every resolved issue into reusable operating knowledge.",
};

const bullets = [
  "Guests text for towels, late checkout, parking, breakfast, or room cleaning",
  "Housekeeping and maintenance get assigned work by text in any language",
  "Broken showers, stains, HVAC issues, and restocks become tracked tasks instantly",
  "Every request, exception, and resolution becomes searchable hotel knowledge",
];

const useCases = [
  {
    icon: MessageSquare,
    title: "Guest requests",
    body: "Answer common questions instantly, create tasks when needed, and text the guest when the request is done.",
  },
  {
    icon: BedDouble,
    title: "Housekeeping coordination",
    body: "Send room assignments, mark rooms cleaned, flag damages, request restocks, and handle late service requests over SMS.",
  },
  {
    icon: Wrench,
    title: "Maintenance routing",
    body: "Turn texts like 'Room 214 shower broken' into tracked work with escalation, photos, and manager visibility.",
  },
  {
    icon: Languages,
    title: "Multilingual staff ops",
    body: "Staff can text in their own language while managers still get one clean operational view.",
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
              The text-first operating system for hotels and motels.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-black/70">
              Guests and staff already text. Sidekick turns those messages into answers, tasks, updates, and reusable operating knowledge across the front desk, housekeeping, and maintenance.
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
              We would start narrow: guest requests, housekeeping coordination, maintenance routing, and automatic guest updates.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {useCases.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-3xl border border-black/8 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f7f3ec]">
                  <Icon className="h-5 w-5 text-[#26251e]" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-black/65">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
