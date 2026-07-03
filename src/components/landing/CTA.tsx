import { ArrowIcon } from "@/components/landing/icons";
import Reveal from "@/components/landing/Reveal";

export default function CTA() {
  return (
    <section className="px-6 py-24 md:px-10">
      <Reveal>
        <div
          className="mx-auto relative overflow-hidden rounded-[28px]"
          style={{
            maxWidth: 1120,
            padding: "72px 64px",
            background: "linear-gradient(135deg, #0060F0 0%, #004BB8 100%)",
            boxShadow: "0 1px 2px rgba(17,24,39,0.12), 0 24px 64px -24px rgba(0,75,184,0.5)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 70% at 80% -10%, rgba(255,255,255,0.15), transparent 65%)",
            }}
          />
          <div className="relative text-center">
            <h2
              className="font-serif font-extrabold text-cream m-0 mb-5"
              style={{
                fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
                lineHeight: 0.98,
                letterSpacing: "-0.025em",
              }}
            >
              Give your team a <em className="italic">Sidekick.</em>
            </h2>
            <p
              className="m-0 mx-auto mb-9 font-light"
              style={{ fontSize: 17, lineHeight: 1.55, maxWidth: 480, color: "rgba(255,255,255,0.85)" }}
            >
              Set up in 90 seconds. No app, no training, no per-seat pricing.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a
                href="/login"
                className="btn inline-flex items-center gap-2.5 rounded-full px-7 py-[15px] text-[15px] font-semibold no-underline"
                style={{
                  background: "#FFFFFF",
                  color: "#111827",
                  boxShadow: "0 1px 2px rgba(17,24,39,0.08)",
                }}
              >
                Get Started
                <span className="btn-arrow inline-flex">
                  <ArrowIcon size={14} />
                </span>
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
