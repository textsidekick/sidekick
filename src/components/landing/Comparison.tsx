import Reveal from "@/components/landing/Reveal";

const OLD_STEPS = [
  "See a problem on the floor",
  "Find your supervisor",
  "Radio the maintenance office",
  "Fill out a form",
  "Hope someone gets to it",
];

export default function Comparison() {
  return (
    <section className="px-6 py-24 md:px-10 md:py-32" style={{ background: "#F1F3F9" }}>
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <div className="mb-16 text-center md:mb-20">
            <div className="mb-4 text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">
              The difference
            </div>
            <h2
              className="mx-auto max-w-[640px] font-extrabold text-ink"
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
              }}
            >
              Reporting an issue shouldn&rsquo;t take longer than fixing it.
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Old way */}
          <Reveal>
            <div
              className="flex h-full flex-col rounded-2xl border border-[rgba(17,24,39,0.06)] bg-white p-9 md:p-11"
              style={{ boxShadow: "0 1px 3px rgba(17,24,39,0.04)" }}
            >
              <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[rgba(17,24,39,0.35)]">
                The old way
              </div>
              <div className="mb-8 text-[48px] font-extrabold tracking-tight text-[rgba(17,24,39,0.15)]">
                3–5 min
              </div>
              <div className="flex flex-col">
                {OLD_STEPS.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 border-t border-[rgba(17,24,39,0.06)] py-3.5 first:border-t-0"
                  >
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(17,24,39,0.04)] text-[11px] font-bold text-[rgba(17,24,39,0.3)]">
                      {i + 1}
                    </span>
                    <span className="text-[15px] text-[rgba(17,24,39,0.5)]">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* With Sidekick */}
          <Reveal delay={120}>
            <div
              className="relative flex h-full flex-col overflow-hidden rounded-2xl p-9 md:p-11"
              style={{
                background: "linear-gradient(135deg, #0d1117 0%, #06080F 100%)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2), 0 24px 64px -24px rgba(0,0,0,0.4)",
              }}
            >
              {/* Glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: "radial-gradient(60% 50% at 80% 0%, rgba(0,96,240,0.12), transparent 65%)",
                }}
              />
              <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid-dark" />
              <div className="relative">
                <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[rgba(255,255,255,0.4)]">
                  With Sidekick
                </div>
                <div className="mb-8 text-[48px] font-extrabold tracking-tight text-accent">
                  20 sec
                </div>
                <h3 className="mb-4 text-[24px] font-bold text-white tracking-tight">
                  Text what you see.
                </h3>
                <p className="mb-8 max-w-[360px] text-[15px] leading-[1.65] text-[rgba(255,255,255,0.5)]">
                  Any issue, any language. Work order created, right person assigned, issue
                  tracked — before the worker puts their phone away.
                </p>
                <div className="inline-flex items-center gap-2.5 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-[13px] text-[rgba(255,255,255,0.6)]">
                  <span className="block h-2 w-2 rounded-full bg-emerald-400" style={{ animation: "sk-pulse 2s ease-in-out infinite" }} />
                  That&rsquo;s the whole process
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
