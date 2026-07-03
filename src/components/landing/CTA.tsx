import { ArrowIcon } from "@/components/landing/icons";
import Reveal from "@/components/landing/Reveal";

export default function CTA() {
  return (
    <section className="px-6 py-24 md:px-10">
      <Reveal>
        <div
          className="relative mx-auto overflow-hidden rounded-2xl"
          style={{
            maxWidth: 1200,
            padding: "72px 48px",
            background: "linear-gradient(135deg, #06080F 0%, #0d1117 50%, #06080F 100%)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2), 0 24px 64px -24px rgba(0,0,0,0.4)",
          }}
        >
          {/* Gradient orbs */}
          <div
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              width: 400, height: 400, top: -100, right: -50,
              background: "radial-gradient(circle, rgba(0,96,240,0.15) 0%, transparent 70%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              width: 300, height: 300, bottom: -80, left: -60,
              background: "radial-gradient(circle, rgba(0,96,240,0.08) 0%, transparent 70%)",
            }}
          />
          <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid-dark" />

          <div className="relative text-center">
            <h2
              className="m-0 mb-5 font-extrabold text-white"
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
              }}
            >
              Give your team a{" "}
              <span className="text-accent">Sidekick.</span>
            </h2>
            <p
              className="m-0 mx-auto mb-9"
              style={{ fontSize: 16, lineHeight: 1.6, maxWidth: 440, color: "rgba(255,255,255,0.5)" }}
            >
              Set up in 90 seconds. No app, no training, no per-seat pricing.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <a
                href="/login"
                className="btn inline-flex items-center gap-2.5 rounded-lg bg-accent px-7 py-[14px] text-[15px] font-semibold text-white no-underline hover:bg-[#0052cc]"
                style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.2), 0 0 40px rgba(0,96,240,0.2)" }}
              >
                Get Started
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
          </div>
        </div>
      </Reveal>
    </section>
  );
}
