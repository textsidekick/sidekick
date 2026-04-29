import { Eyebrow, HeadlineWithSidekick } from "./Brand";
import { FileText, CalendarDays, ShieldCheck, Users } from "lucide-react";

const SOURCES = [
  { icon: FileText, label: "SOPs & training PDFs", count: "412 docs" },
  { icon: CalendarDays, label: "Shift schedules", count: "Synced hourly" },
  { icon: ShieldCheck, label: "Safety & compliance", count: "OSHA, HACCP" },
  { icon: Users, label: "HR policies", count: "Handbook + benefits" },
];

export default function KnowledgeLayer() {
  return (
    <section className="px-6 py-28">
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <Eyebrow>The knowledge layer</Eyebrow>
          <h2 className="font-serif font-normal mt-4 text-[48px] lg:text-[58px] leading-[1.05] tracking-[-0.02em]">
            <HeadlineWithSidekick text="Your binders, finally answering back." />
          </h2>
          <p className="mt-6 text-[18px] leading-[1.55] text-ink/70 max-w-[540px]">
            Sidekick ingests every SOP, schedule, and policy doc you have — then
            stays in sync as you update them. Workers get the latest answer, every
            time. Cited back to the source.
          </p>
          <ul className="mt-8 space-y-3 text-[15px] text-ink/70">
            <li className="flex gap-3"><span className="text-accent">→</span> SOC 2 Type II in progress · SSO &amp; SAML</li>
            <li className="flex gap-3"><span className="text-accent">→</span> PII redaction before any LLM call</li>
            <li className="flex gap-3"><span className="text-accent">→</span> Every answer traceable to a source doc</li>
          </ul>
        </div>

        {/* Knowledge graphic */}
        <div className="relative">
          <div className="rounded-2xl border border-ink/8 bg-cream2/70 p-7">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.12em] text-ink/45 font-medium">
              <span>Knowledge base</span>
              <span className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-600"
                  style={{ animation: "sk-pulse 2s ease-in-out infinite" }}
                />
                Live
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {SOURCES.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className="p-4 rounded-xl bg-cream border border-ink/6"
                  >
                    <Icon className="w-4 h-4 text-accent" strokeWidth={1.75} />
                    <div className="mt-2 text-[14px] font-medium text-ink">{s.label}</div>
                    <div className="text-xs text-ink/50 mt-0.5">{s.count}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 p-4 rounded-xl bg-ink text-cream">
              <div className="text-xs uppercase tracking-[0.12em] text-cream/55 font-medium">
                Worker question
              </div>
              <div className="mt-1.5 text-[14px]">
                "What PPE do I need for the acid wash on line 2?"
              </div>
              <div className="mt-4 text-xs uppercase tracking-[0.12em] text-cream/55 font-medium">
                Sidekick answer · cited
              </div>
              <div className="mt-1.5 text-[14px] leading-[1.5]">
                Nitrile gloves, splash goggles, and acid-resistant apron. See SOP-204 §3.2.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
