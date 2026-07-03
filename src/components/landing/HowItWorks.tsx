import Reveal from "@/components/landing/Reveal";

const STEPS = [
  {
    n: "01",
    title: "Text it",
    body: "Equipment issues, safety hazards, quality problems, supply needs — any worker texts what they see. Any language, any phone.",
    icon: "💬",
  },
  {
    n: "02",
    title: "AI triages & assigns",
    body: "Sidekick identifies the asset, sets priority, creates a work order, and texts the right technician with troubleshooting steps.",
    icon: "⚡",
  },
  {
    n: "03",
    title: "Fixed and logged",
    body: "Tech texts START and DONE. The fix becomes searchable knowledge. Patterns get flagged automatically.",
    icon: "✅",
  },
];

export default function HowItWorks() {
  return (
    <section id="product" className="relative px-6 py-24 md:px-10 md:py-32">
      <div className="pointer-events-none absolute inset-0 dot-grid" aria-hidden />
      <div className="relative mx-auto max-w-[1200px]">
        <Reveal>
          <div className="mb-16 text-center md:mb-20">
            <div className="mb-4 text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">
              How it works
            </div>
            <h2
              className="mx-auto max-w-[600px] font-extrabold text-ink"
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
              }}
            >
              From shop floor to closed work order in three texts.
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div
                className="hover-lift group relative flex h-full flex-col rounded-2xl border border-[rgba(17,24,39,0.06)] bg-white p-8 md:p-10"
                style={{
                  boxShadow: "0 1px 3px rgba(17,24,39,0.04), 0 8px 32px -12px rgba(17,24,39,0.08)",
                }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-3xl">{s.icon}</span>
                  <span className="text-[13px] font-bold tracking-wider text-accent opacity-50">
                    {s.n}
                  </span>
                </div>
                <h3 className="mb-3 text-[20px] font-bold text-ink tracking-tight">{s.title}</h3>
                <p className="text-[15px] leading-[1.65] text-[rgba(17,24,39,0.55)]">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
