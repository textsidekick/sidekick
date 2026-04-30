import { Eyebrow } from "@/components/landing/Brand";

const PAYOFFS = [
  { h: "Succession-ready", b: "Sell, retire, or step back without the operation seizing up." },
  { h: "Audit-ready", b: "Every answer cites the source SOP, page, and revision." },
  { h: "Vacation-proof", b: "Your floor keeps running when you take a real week off." },
  { h: "Onboarding-ready", b: "New managers inherit a documented business, not tribal knowledge." },
];

const ENTRIES = [
  { q: "CNC-3 coolant PSI", a: "85 PSI · cited SOP-CNC-07 p3", d: "Apr 14" },
  { q: "Forklift battery rotation", a: "Bank A → C every Tues · per Mike", d: "Apr 11" },
  { q: "Spanish onboarding flow", a: "Auto-translated from Onboarding-EN", d: "Apr 09" },
  { q: "Allen-Bradley fault E-04", a: "Reset sequence + photo · per Devin", d: "Apr 06" },
  { q: "Vendor: Granger order code", a: "Use account #41-9087 for net-30", d: "Apr 02" },
  { q: "Heat-stress protocol > 88°F", a: "Mandatory water break q.45min", d: "Mar 28" },
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
            The knowledge in <em className="italic text-accent">your head</em> is the business. Sidekick writes it down.
          </h2>
          <p className="text-[17px] leading-[1.55] text-ink/70 m-0 mb-4 max-w-[540px]">
            Most operators are the single point of failure for their own company. The torque settings, the supplier quirks, the safety workarounds, the way you actually do payroll — it lives in one or two people&apos;s memory. When they take a vacation, the floor stalls. When they retire, the business is harder to sell.
          </p>
          <p className="text-[17px] leading-[1.55] text-ink/70 m-0 mb-7 max-w-[540px]">
            Sidekick captures every answer it gives, every SOP it cites, every workaround a supervisor texts back. The result is a centralized, searchable knowledge base that <em className="italic">compounds</em> with every shift — owned by your company, not your founder.
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
