import PhoneFrame from "@/components/landing/PhoneFrame";
import SidekickChat from "@/components/landing/SidekickChat";
import Reveal from "@/components/landing/Reveal";
import { YCBadge, HeadlineWithSidekick } from "@/components/landing/Brand";
import { ArrowIcon } from "@/components/landing/icons";

const HEADLINE = "Your workers text. Sidekick handles the rest.";
const SUBHEAD =
  "A machine acting up. A safety hazard on the floor. A part running low. Your workers report it in 20 seconds by text — Sidekick triages, assigns, and tracks every issue automatically.";

export default function Hero() {
  return (
    <section className="relative px-6 pt-24 pb-16 md:px-10 md:pt-32 md:pb-24">
      <div className="mx-auto grid max-w-[1120px] grid-cols-1 items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div>
          <Reveal>
            <div className="mb-8 flex">
              <YCBadge height={26} />
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1
              className="m-0 mb-6 font-serif font-extrabold text-ink"
              style={{
                fontSize: "clamp(2.75rem, 6.5vw, 5rem)",
                lineHeight: 1.02,
                letterSpacing: "-0.03em",
                textWrap: "balance" as React.CSSProperties["textWrap"],
              }}
            >
              <HeadlineWithSidekick text={HEADLINE} />
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p
              className="m-0 mb-10 max-w-[500px] font-light text-[rgba(17,24,39,0.65)]"
              style={{ fontSize: "clamp(1.0625rem, 1.6vw, 1.1875rem)", lineHeight: 1.6 }}
            >
              {SUBHEAD}
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/login"
                className="btn inline-flex items-center gap-2.5 rounded-full bg-ink px-7 py-[15px] text-[15px] font-medium text-cream no-underline hover:bg-[#1e293b]"
                style={{ boxShadow: "0 1px 2px rgba(17,24,39,0.12), 0 8px 24px -12px rgba(17,24,39,0.35)" }}
              >
                Get started
                <span className="btn-arrow inline-flex">
                  <ArrowIcon size={14} />
                </span>
              </a>
              <a
                href="https://calendly.com/justin-textsidekick"
                target="_blank"
                rel="noopener noreferrer"
                className="btn inline-flex items-center rounded-full border border-[rgba(17,24,39,0.14)] px-6 py-[14px] text-[15px] font-medium text-ink no-underline hover:border-[rgba(17,24,39,0.28)] hover:bg-[rgba(17,24,39,0.03)]"
              >
                Book a walkthrough
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[rgba(17,24,39,0.5)]">
              {["No app download", "Works on any phone", "Set up in 90 seconds"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <span className="block h-1 w-1 rounded-full bg-accent" style={{ opacity: 0.7 }} />
                  {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Phone */}
        <Reveal delay={200} className="relative flex justify-center lg:justify-end">
          <div
            aria-hidden
            className="absolute -inset-10 z-0"
            style={{
              background:
                "radial-gradient(55% 50% at 50% 42%, rgba(0,96,240,0.06) 0%, rgba(0,96,240,0.02) 45%, transparent 72%)",
            }}
          />
          <div className="relative z-10">
            <PhoneFrame scale={0.92}>
              <SidekickChat />
            </PhoneFrame>

            {/* Grounded status chip — replaces the rotated sticky note */}
            <div
              className="absolute -left-6 -bottom-4 z-20 hidden items-center gap-2.5 rounded-full border border-[rgba(17,24,39,0.08)] py-2.5 pl-3.5 pr-4 md:flex"
              style={{
                background: "rgba(248,249,252,0.85)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 1px 2px rgba(17,24,39,0.04), 0 12px 32px -16px rgba(17,24,39,0.16)",
              }}
            >
              <span
                className="block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent"
                style={{ animation: "sk-pulse 2.4s ease-in-out infinite" }}
              />
              <span className="text-[12.5px] font-medium text-ink">
                Any phone. Any language.{" "}
                <span className="font-normal text-[rgba(17,24,39,0.55)]">No app.</span>
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
