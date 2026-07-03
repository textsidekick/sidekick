import Reveal from "@/components/landing/Reveal";
import { Eyebrow } from "@/components/landing/Brand";

const OLD_STEPS = [
  "See a problem on the floor",
  "Find your supervisor",
  "Radio the maintenance office",
  "Fill out a form",
  "Hope someone gets to it",
];

export default function Comparison() {
  return (
    <section className="border-t border-[rgba(28,26,22,0.07)] px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1120px]">
        <Reveal>
          <Eyebrow>The difference</Eyebrow>
          <h2
            className="mb-16 mt-5 max-w-[640px] font-serif font-normal text-ink md:mb-20"
            style={{
              fontSize: "clamp(2.125rem, 4.5vw, 3.25rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
            }}
          >
            Reporting an issue shouldn&rsquo;t take longer than fixing it.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* The old way — deliberately flat and quiet */}
          <Reveal>
            <div className="flex h-full flex-col rounded-[24px] border border-[rgba(28,26,22,0.08)] p-9 md:p-11">
              <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[rgba(28,26,22,0.4)]">
                The old way
              </div>
              <div
                className="mb-9 font-serif text-[rgba(28,26,22,0.35)]"
                style={{ fontSize: "clamp(2.5rem, 4vw, 3.25rem)", letterSpacing: "-0.02em", lineHeight: 1 }}
              >
                3–5 minutes
              </div>
              <div className="flex flex-col">
                {OLD_STEPS.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 border-t border-[rgba(28,26,22,0.06)] py-3.5 first:border-t-0"
                  >
                    <span className="w-4 flex-shrink-0 font-mono text-[12px] text-[rgba(28,26,22,0.3)]">
                      {i + 1}
                    </span>
                    <span className="text-[15px] font-light text-[rgba(28,26,22,0.5)]">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* With Sidekick — the one dark surface on the page */}
          <Reveal delay={120}>
            <div
              className="relative flex h-full flex-col overflow-hidden rounded-[24px] p-9 md:p-11"
              style={{
                background: "linear-gradient(160deg, #24211c 0%, #1c1a16 60%)",
                boxShadow: "0 1px 2px rgba(28,26,22,0.2), 0 24px 64px -24px rgba(28,26,22,0.45)",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(70% 55% at 85% 0%, rgba(201,100,66,0.16), transparent 65%)",
                }}
              />
              <div className="relative">
                <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[rgba(247,243,236,0.45)]">
                  With Sidekick
                </div>
                <div
                  className="mb-9 font-serif text-accent"
                  style={{ fontSize: "clamp(2.5rem, 4vw, 3.25rem)", letterSpacing: "-0.02em", lineHeight: 1 }}
                >
                  20 seconds
                </div>
                <div
                  className="mb-4 font-serif text-cream"
                  style={{ fontSize: 26, lineHeight: 1.2, letterSpacing: "-0.015em" }}
                >
                  Text what you see.
                </div>
                <p className="m-0 max-w-[360px] text-[15px] font-light leading-[1.65] text-[rgba(247,243,236,0.6)]">
                  Any issue, any language. Work order created, right person assigned, issue
                  tracked — before the worker puts their phone away.
                </p>
                <div className="mt-9 inline-flex items-center gap-2 rounded-full border border-[rgba(247,243,236,0.14)] px-4 py-2 text-[13px] text-[rgba(247,243,236,0.7)]">
                  <span className="block h-1.5 w-1.5 rounded-full bg-accent" />
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
