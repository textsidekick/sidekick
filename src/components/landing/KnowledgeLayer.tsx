import Reveal from "@/components/landing/Reveal";
import { Eyebrow } from "@/components/landing/Brand";

const PAYOFFS = [
  { h: "Self-improving.", b: "Every repair adds a verified article to your plant's knowledge base." },
  { h: "Searchable.", b: "Anyone can ask \u201Cwhat worked last time?\u201D and get a cited answer." },
  { h: "Audit-ready.", b: "Every resolution is timestamped, attributed, and traceable." },
];

const ENTRIES = [
  { q: "Conveyor 3 bearing failure", a: "Replace 6205-2RS · resolved by Mike T.", d: "Today" },
  { q: "CNC-3 coolant PSI drop", a: "Check pump seal · cited SOP-CNC-07 p3", d: "Apr 14" },
  { q: "Allen-Bradley fault E-04", a: "Reset sequence + photo · per Devin", d: "Apr 06" },
  { q: "Forklift battery rotation", a: "Bank A → C every Tues · per Mike", d: "Apr 11" },
  { q: "Hydraulic press oil change", a: "ISO 46 · every 500hrs · Cage D", d: "Apr 02" },
  { q: "Compressor E-stop trigger", a: "Check relief valve first · per SOP-COMP-03", d: "Mar 28" },
];

export default function KnowledgeLayer() {
  return (
    <section className="border-t border-[rgba(17,24,39,0.07)] px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto grid max-w-[1120px] grid-cols-1 items-center gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
        {/* Mock — on the left for page rhythm */}
        <Reveal className="order-2 lg:order-1">
          <div
            className="overflow-hidden rounded-[20px] bg-white"
            style={{
              border: "1px solid rgba(17,24,39,0.06)",
              boxShadow:
                "0 1px 2px rgba(17,24,39,0.04), 0 24px 64px -32px rgba(17,24,39,0.18)",
            }}
          >
            <div className="flex items-center justify-between border-b border-[rgba(17,24,39,0.06)] px-6 py-4">
              <div className="text-[13px] font-semibold text-ink">
                Knowledge base · Halverson Mfg
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[rgba(17,24,39,0.4)]">
                <span
                  className="block h-1.5 w-1.5 rounded-full bg-accent"
                  style={{ animation: "sk-pulse 2.4s ease-in-out infinite" }}
                />
                Auto-captured
              </div>
            </div>
            <div>
              {ENTRIES.map((r) => (
                <div
                  key={r.q}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-[rgba(17,24,39,0.05)] px-6 py-3.5 transition-colors duration-200 last:border-b-0 hover:bg-[rgba(17,24,39,0.025)]"
                >
                  <div className="min-w-0">
                    <div className="mb-0.5 truncate text-[13.5px] font-medium text-ink">{r.q}</div>
                    <div className="truncate text-[12.5px] font-light text-[rgba(17,24,39,0.5)]">
                      {r.a}
                    </div>
                  </div>
                  <div className="font-mono text-[11px] text-[rgba(17,24,39,0.35)]">{r.d}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2.5 bg-[rgba(0,96,240,0.05)] px-6 py-3.5">
              <div className="text-[12.5px] text-[rgba(17,24,39,0.65)]">
                <span className="font-semibold text-ink">+12 entries</span> captured this week
              </div>
            </div>
          </div>
        </Reveal>

        {/* Copy */}
        <Reveal delay={120} className="order-1 lg:order-2">
          <Eyebrow>The knowledge layer</Eyebrow>
          <h2
            className="mb-6 mt-5 font-serif font-extrabold text-ink"
            style={{
              fontSize: "clamp(2.125rem, 4.5vw, 3.5rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
              textWrap: "balance" as React.CSSProperties["textWrap"],
            }}
          >
            Every repair makes your plant <em className="italic text-accent">smarter.</em>
          </h2>
          <p className="m-0 mb-10 max-w-[480px] text-[16px] font-light leading-[1.65] text-[rgba(17,24,39,0.6)]">
            When a tech fixes a machine, Sidekick turns the resolution into a searchable
            knowledge article — automatically. Next time it breaks, anyone can ask
            &ldquo;what worked last time?&rdquo; and get a cited, verified answer.
          </p>
          <div className="max-w-[480px]">
            {PAYOFFS.map((p) => (
              <div
                key={p.h}
                className="border-t border-[rgba(17,24,39,0.07)] py-4 text-[15px] leading-relaxed last:border-b last:border-b-[rgba(17,24,39,0.07)]"
              >
                <span className="font-medium text-ink">{p.h}</span>{" "}
                <span className="font-light text-[rgba(17,24,39,0.55)]">{p.b}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
