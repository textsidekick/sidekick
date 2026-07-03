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
            background: "linear-gradient(135deg, #C96442 0%, #A74D30 100%)",
            boxShadow: "0 1px 2px rgba(28,26,22,0.12), 0 24px 64px -24px rgba(167,77,48,0.5)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 70% at 80% -10%, rgba(247,243,236,0.12), transparent 65%)",
            }}
          />
          <div className="relative text-center">
            <h2
              className="font-serif font-normal text-cream m-0 mb-5"
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
              style={{ fontSize: 17, lineHeight: 1.55, maxWidth: 480, color: "rgba(247,243,236,0.85)" }}
            >
              Set up in 90 seconds. No app, no training, no per-seat pricing.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a
                href="/login"
                className="btn inline-flex items-center gap-2.5 rounded-full px-7 py-[15px] text-[15px] font-semibold no-underline"
                style={{
                  background: "#F7F3EC",
                  color: "#1C1A16",
                  boxShadow: "0 1px 2px rgba(28,26,22,0.08)",
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
