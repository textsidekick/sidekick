import Reveal from "@/components/landing/Reveal";
import { Eyebrow } from "@/components/landing/Brand";

const STEPS = [
  {
    n: "1",
    title: "Text it",
    body: "Equipment issues, safety hazards, quality problems, supply needs — any worker texts what they see. Any language, any phone. No app needed.",
  },
  {
    n: "2",
    title: "AI triages & assigns",
    body: "Sidekick identifies the asset, sets priority, creates a work order, and texts the right technician with troubleshooting steps.",
  },
  {
    n: "3",
    title: "Fixed and logged",
    body: "Tech texts START and DONE. The fix becomes searchable knowledge. Patterns get flagged automatically.",
  },
];

export default function HowItWorks() {
  return (
    <section id="product" className="border-t border-[rgba(17,24,39,0.07)] px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1120px]">
        <Reveal>
          <div className="mb-16 flex flex-col gap-6 md:mb-20 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow>How it works</Eyebrow>
              <h2
                className="mt-5 max-w-[560px] font-serif font-bold text-ink"
                style={{
                  fontSize: "clamp(2.125rem, 4.5vw, 3.25rem)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.025em",
                  textWrap: "balance" as React.CSSProperties["textWrap"],
                }}
              >
                An issue reported is an issue handled.
              </h2>
            </div>
            <p className="m-0 max-w-[300px] pb-1 text-[15px] font-light leading-relaxed text-[rgba(17,24,39,0.5)]">
              From the shop floor to a closed work order — with nobody chasing anybody down.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-y-12 md:grid-cols-3 md:gap-y-0 md:divide-x md:divide-[rgba(17,24,39,0.08)]">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div
                className="md:px-10"
                style={i === 0 ? { paddingLeft: 0 } : i === 2 ? { paddingRight: 0 } : undefined}
              >
                <div
                  className="mb-6 font-serif text-accent"
                  style={{ fontSize: 64, lineHeight: 1, opacity: 0.35, letterSpacing: "-0.02em" }}
                >
                  {s.n}
                </div>
                <h3
                  className="m-0 mb-3 font-serif font-bold text-ink"
                  style={{ fontSize: 26, lineHeight: 1.15, letterSpacing: "-0.015em" }}
                >
                  {s.title}
                </h3>
                <p className="m-0 max-w-[300px] text-[15px] font-light leading-[1.65] text-[rgba(17,24,39,0.6)]">
                  {s.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
