import Reveal from "@/components/landing/Reveal";

const PAYOFFS = [
  { icon: "🔄", h: "Self-improving", b: "Every repair adds a verified article to your plant's knowledge base." },
  { icon: "🔍", h: "Searchable", b: "Anyone can ask \"what worked last time?\" and get a cited answer." },
  { icon: "📋", h: "Audit-ready", b: "Every resolution is timestamped, attributed, and traceable." },
];

const ENTRIES = [
  { q: "Conveyor 3 bearing failure", a: "Replace 6205-2RS · resolved by Mike T.", d: "Today" },
  { q: "CNC-3 coolant PSI drop", a: "Check pump seal · cited SOP-CNC-07 p3", d: "Apr 14" },
  { q: "Allen-Bradley fault E-04", a: "Reset sequence + photo · per Devin", d: "Apr 06" },
  { q: "Forklift battery rotation", a: "Bank A → C every Tues · per Mike", d: "Apr 11" },
  { q: "Hydraulic press oil change", a: "ISO 46 · every 500hrs · Cage D", d: "Apr 02" },
];

export default function KnowledgeLayer() {
  return (
    <section className="relative px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <div className="mb-16 text-center md:mb-20">
            <div className="mb-4 text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">
              Knowledge layer
            </div>
            <h2
              className="mx-auto max-w-[600px] font-extrabold text-ink"
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
              }}
            >
              Every repair makes your plant smarter.
            </h2>
            <p className="mx-auto mt-5 max-w-[520px] text-[16px] leading-[1.65] text-[rgba(17,24,39,0.55)]">
              When a tech fixes a machine, Sidekick turns the resolution into a searchable knowledge article — automatically.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* Knowledge base mock */}
          <Reveal>
            <div
              className="hover-lift overflow-hidden rounded-2xl border border-[rgba(17,24,39,0.06)] bg-white"
              style={{ boxShadow: "0 1px 3px rgba(17,24,39,0.04), 0 16px 48px -16px rgba(17,24,39,0.1)" }}
            >
              <div className="flex items-center justify-between border-b border-[rgba(17,24,39,0.06)] px-6 py-4">
                <div className="text-[13px] font-bold text-ink">Knowledge base</div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
                  <span className="block h-1.5 w-1.5 rounded-full bg-accent" style={{ animation: "sk-pulse 2.4s ease-in-out infinite" }} />
                  Auto-captured
                </div>
              </div>
              <div>
                {ENTRIES.map((r) => (
                  <div
                    key={r.q}
                    className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-[rgba(17,24,39,0.04)] px-6 py-3.5 transition-colors duration-200 last:border-b-0 hover:bg-[rgba(17,24,39,0.015)]"
                  >
                    <div className="min-w-0">
                      <div className="mb-0.5 truncate text-[13.5px] font-medium text-ink">{r.q}</div>
                      <div className="truncate text-[12.5px] text-[rgba(17,24,39,0.45)]">{r.a}</div>
                    </div>
                    <div className="font-mono text-[11px] text-[rgba(17,24,39,0.3)]">{r.d}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2.5 bg-[rgba(0,96,240,0.04)] px-6 py-3.5">
                <div className="text-[12.5px] text-[rgba(17,24,39,0.6)]">
                  <span className="font-bold text-ink">+12 entries</span> captured this week
                </div>
              </div>
            </div>
          </Reveal>

          {/* Payoffs */}
          <Reveal delay={120}>
            <div className="flex flex-col gap-5">
              {PAYOFFS.map((p) => (
                <div
                  key={p.h}
                  className="hover-lift flex gap-5 rounded-2xl border border-[rgba(17,24,39,0.06)] bg-white p-6"
                  style={{ boxShadow: "0 1px 3px rgba(17,24,39,0.04)" }}
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[rgba(0,96,240,0.06)] text-lg">
                    {p.icon}
                  </span>
                  <div>
                    <div className="mb-1 text-[15px] font-bold text-ink">{p.h}</div>
                    <div className="text-[14px] leading-[1.55] text-[rgba(17,24,39,0.55)]">{p.b}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
