import { YCBadge } from "@/components/landing/Brand";
import { ArrowIcon } from "@/components/landing/icons";

const WORK_ORDER = [
  ["Asset", "Press 4"],
  ["Issue", "Hydraulic leak"],
  ["Priority", "High"],
  ["Assigned", "Miguel A. · Maintenance"],
  ["Status", "Technician dispatched"],
];

const HISTORY = [
  "Prior incident found from Mar 18",
  "Last fix: rear seal replaced + pressure reset",
  "Parts on hand: seal kit HK-42",
];

export default function Hero() {
  return (
    <section className="bg-[#1B2127] text-white">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-16 md:px-8 md:py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:px-12 lg:py-24">
        <div className="max-w-[560px]">
          <div className="mb-6 opacity-85">
            <YCBadge height={24} />
          </div>
          <div className="mb-5 inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-white/70">
            Frontline intake for manufacturing operations
          </div>
          <h1
            className="m-0 max-w-[620px] font-semibold tracking-[-0.04em]"
            style={{ fontSize: "clamp(3.25rem, 7vw, 5.9rem)", lineHeight: 0.94 }}
          >
            Turn a text from the floor into work that gets done.
          </h1>
          <p className="mt-6 max-w-[560px] text-[18px] leading-[1.6] text-white/72 md:text-[19px]">
            Workers report issues and ask questions by text. Sidekick identifies context, routes the work,
            returns grounded answers, and records every resolution without another app to install.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="https://calendly.com/justin-textsidekick"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#F05A28] px-5 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#d94e20]"
            >
              Book a plant walkthrough <ArrowIcon size={14} />
            </a>
            <a
              href="#workflow"
              className="inline-flex items-center gap-2 rounded-[8px] border border-white/16 px-5 py-3.5 text-[15px] font-semibold text-white/88 transition hover:bg-white/5"
            >
              See the workflow
            </a>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-white/58 md:gap-x-5">
            <span>Works over SMS</span>
            <span className="hidden md:inline">/</span>
            <span>Fits alongside existing systems</span>
            <span className="hidden md:inline">/</span>
            <span>Priced by site</span>
          </div>
        </div>

        <div className="rounded-[18px] border border-white/10 bg-[#11161B] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.25)] md:p-5">
          <div className="mb-4 flex items-center justify-between border-b border-white/8 pb-3 text-[12px] text-white/55">
            <span>Example workflow</span>
            <span className="font-mono">01:22:18 AM</span>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_1.1fr]">
            <div className="rounded-[12px] border border-white/8 bg-[#F5F7FA] p-3 text-[#171A1D]">
              <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#66707A]">Worker text thread</div>
              <div className="space-y-2.5">
                <Bubble side="user" text="press 4 is leaking hydraulic oil near the rear seal" />
                <Bubble side="bot" text="Got it. Is the leak active right now or residual from an earlier run?" />
                <Bubble side="user" text="active. puddle forming under the back side" />
                <Bubble side="bot" text="High priority hydraulic leak logged on Press 4. Routing maintenance now." />
              </div>
            </div>

            <div className="rounded-[12px] border border-white/8 bg-[#171C22] p-3 text-white">
              <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/45">Sidekick</div>
              <div className="space-y-2.5">
                {[
                  ["Asset match", "Press 4"],
                  ["Category", "Hydraulic leak"],
                  ["Priority", "High"],
                  ["Source", "SMS intake"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-[10px] border border-white/8 bg-white/4 p-2.5">
                    <div className="text-[11px] uppercase tracking-[0.12em] text-white/42">{k}</div>
                    <div className="mt-1 text-[13px] font-medium text-white/90">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[12px] border border-[#F05A28]/30 bg-[#221913] p-3.5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#F6B095]">Work order created</div>
                  <span className="rounded-[6px] bg-[#F05A28] px-2 py-1 text-[11px] font-semibold text-white">High</span>
                </div>
                <div className="space-y-2">
                  {WORK_ORDER.map(([k, v]) => (
                    <div key={k} className="flex items-start justify-between gap-4 border-b border-white/8 pb-2 text-[13px] last:border-0 last:pb-0">
                      <span className="text-white/55">{k}</span>
                      <span className="text-right font-medium text-white/92">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[12px] border border-white/8 bg-[#151A20] p-3.5">
                <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/45">What fixed this last time?</div>
                <div className="space-y-2">
                  {HISTORY.map((item) => (
                    <div key={item} className="flex items-start gap-2 text-[13px] text-white/80">
                      <span className="mt-1.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#32A36B]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Bubble({ side, text }: { side: "user" | "bot"; text: string }) {
  const isUser = side === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] rounded-[14px] px-3 py-2 text-[13px] leading-[1.45] ${
          isUser ? "bg-[#245BDB] text-white" : "bg-[#E7EBF0] text-[#171A1D]"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
