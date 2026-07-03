import { Eyebrow } from "@/components/landing/Brand";

const PAYOFFS = [
  { h: "Self-improving", b: "Every repair adds a verified article to your plant's knowledge base." },
  { h: "Searchable", b: "Anyone can ask 'what worked last time?' and get a cited answer." },
  { h: "Audit-ready", b: "Every resolution is timestamped, attributed, and traceable." },
  { h: "Compounds over time", b: "The more your team works, the smarter Sidekick gets." },
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
    <section className="px-14 py-24 border-t border-ink/10">
      <div className="max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-20 items-center">
        <div>
          <Eyebrow>The knowledge layer</Eyebrow>
          <h2
            className="font-serif font-normal mt-3 mb-6"
            style={{
              fontSize: 64,
              lineHeight: 1,
              letterSpacing: "-0.025em",
              textWrap: "balance" as React.CSSProperties["textWrap"],
            }}
          >
            Every repair makes your plant <em className="italic text-accent">smarter.</em>
          </h2>
          <p className="text-[17px] leading-[1.55] text-ink/70 m-0 mb-7 max-w-[540px]">
            When a tech fixes a machine, Sidekick turns the resolution into a searchable knowledge article — automatically. Next time it breaks, anyone can ask &ldquo;what worked last time?&rdquo; and get a cited, verified answer. The more your team works, the smarter Sidekick gets.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[540px]">
            {PAYOFFS.map((p) => (
              <div
                key={p.h}
                className="px-4 py-4 rounded-xl border border-ink/[0.06] bg-ink/[0.03]"
              >
                <div className="text-sm font-semibold text-ink mb-1">{p.h}</div>
                <div className="text-[13px] text-ink/65 leading-[1.45]">{p.b}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-cream2 border border-ink/10 rounded-[20px] p-8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <div className="text-[13px] font-semibold text-ink">
              Knowledge base · Halverson Mfg
            </div>
            <div className="text-[11px] text-ink/50 uppercase tracking-widest">
              Auto-captured
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            {ENTRIES.map((r) => (
              <div
                key={r.q}
                className="grid grid-cols-[1fr_auto] gap-4 items-center px-3.5 py-3 bg-white rounded-[10px] border border-ink/[0.06]"
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-ink mb-0.5 truncate">
                    {r.q}
                  </div>
                  <div className="text-xs text-ink/60 truncate">{r.a}</div>
                </div>
                <div className="text-[11px] text-ink/40 font-mono">{r.d}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 px-3.5 py-2.5 bg-accent/[0.08] border border-accent/20 rounded-[10px] flex items-center gap-2.5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-accent"
              style={{ animation: "sk-pulse 2s infinite" }}
            />
            <div className="text-xs text-ink">
              <span className="font-semibold">+12 entries</span> captured this week
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
