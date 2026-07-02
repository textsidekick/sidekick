import { Eyebrow } from "@/components/landing/Brand";

const STEPS = [
  {
    n: "01",
    title: "Text it",
    body: "Equipment issues, safety hazards, quality problems, supply needs — any worker texts what they see. Any language, any phone. No app needed.",
  },
  {
    n: "02",
    title: "AI triages & assigns",
    body: "Sidekick identifies the asset, sets priority, creates a work order, and texts the right technician with troubleshooting steps.",
  },
  {
    n: "03",
    title: "It gets fixed and logged",
    body: "Tech texts START and DONE. The fix becomes searchable knowledge. Patterns get flagged automatically.",
  },
];

export default function HowItWorks() {
  return (
    <section id="product" className="px-14 py-24 border-t border-ink/10">
      <div className="max-w-[1180px] mx-auto">
        <Eyebrow>How it works</Eyebrow>
        <h2
          className="font-serif font-normal mt-5 mb-14 max-w-[720px]"
          style={{ fontSize: 56, lineHeight: 1, letterSpacing: "-0.02em" }}
        >
          An issue reported is an issue handled.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="bg-white rounded-[20px] p-7 border border-ink/[0.06]"
              style={{
                boxShadow:
                  "0 1px 0 rgba(28,26,22,0.04), 0 8px 24px -12px rgba(28,26,22,0.08)",
              }}
            >
              <div className="font-mono text-xs text-accent mb-6 tracking-widest">
                STEP {s.n}
              </div>
              <h3
                className="font-serif font-normal m-0 mb-3"
                style={{ fontSize: 28, lineHeight: 1.1, letterSpacing: "-0.015em" }}
              >
                {s.title}
              </h3>
              <p className="text-[15px] leading-[1.55] text-ink/70 m-0">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
