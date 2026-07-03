import PhoneFrame from "@/components/landing/PhoneFrame";
import SidekickChat from "@/components/landing/SidekickChat";
import Reveal from "@/components/landing/Reveal";
import { YCBadge } from "@/components/landing/Brand";
import { ArrowIcon } from "@/components/landing/icons";

const HEADLINE = "Your workers text.\nSidekick handles the rest.";
const SUBHEAD =
  "Equipment issues, safety hazards, supply needs — workers report by text in 20 seconds. Sidekick triages, assigns, and tracks everything automatically.";

const STATS = [
  { value: "20s", label: "avg report time" },
  { value: "0", label: "apps to download" },
  { value: "50+", label: "languages supported" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #06080F 0%, #0d1117 100%)" }}>
      {/* Gradient orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute"
          style={{
            width: 600, height: 600, top: -200, right: -100,
            background: "radial-gradient(circle, rgba(0,96,240,0.12) 0%, transparent 70%)",
            animation: "mesh-shift 20s ease-in-out infinite",
          }}
        />
        <div
          className="absolute"
          style={{
            width: 500, height: 500, bottom: -100, left: -150,
            background: "radial-gradient(circle, rgba(0,96,240,0.06) 0%, transparent 70%)",
            animation: "mesh-shift 25s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* Dot grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid-dark" />

      <div className="relative mx-auto max-w-[1200px] px-6 pt-28 pb-20 md:px-10 md:pt-36 md:pb-28">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* Left — Copy */}
          <div>
            <Reveal>
              <YCBadge height={22} dark />
            </Reveal>

            <Reveal delay={80}>
              <h1
                className="mt-8 mb-6 font-extrabold text-white"
                style={{
                  fontSize: "clamp(2.5rem, 5.5vw, 4.25rem)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.035em",
                  whiteSpace: "pre-line",
                }}
              >
                {HEADLINE.split("Sidekick").map((part, i, arr) =>
                  i < arr.length - 1 ? (
                    <span key={i}>
                      {part}
                      <span className="text-accent">Sidekick</span>
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mb-10 max-w-[480px] text-[16px] leading-[1.65] text-[rgba(255,255,255,0.55)]">
                {SUBHEAD}
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="/login"
                  className="btn inline-flex items-center gap-2.5 rounded-lg bg-accent px-7 py-[14px] text-[15px] font-semibold text-white no-underline hover:bg-[#0052cc]"
                  style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.2), 0 0 40px rgba(0,96,240,0.2)" }}
                >
                  Get started free
                  <span className="btn-arrow inline-flex"><ArrowIcon size={14} /></span>
                </a>
                <a
                  href="https://calendly.com/justin-textsidekick"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn inline-flex items-center rounded-lg border border-[rgba(255,255,255,0.12)] px-6 py-[13px] text-[15px] font-medium text-[rgba(255,255,255,0.8)] no-underline hover:border-[rgba(255,255,255,0.25)] hover:text-white"
                >
                  Book a demo
                </a>
              </div>
            </Reveal>

            {/* Stats row */}
            <Reveal delay={320}>
              <div className="mt-14 flex gap-10 border-t border-[rgba(255,255,255,0.08)] pt-8">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-bold text-white tracking-tight">{s.value}</div>
                    <div className="mt-1 text-[13px] text-[rgba(255,255,255,0.4)]">{s.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right — Phone */}
          <Reveal delay={200} className="relative flex justify-center lg:justify-end">
            <div className="phone-glow relative">
              <PhoneFrame scale={0.88} color="#1a1d27">
                <SidekickChat />
              </PhoneFrame>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Bottom fade to white */}
      <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: "linear-gradient(to bottom, transparent, #F8F9FC)" }} />
    </section>
  );
}
