import PhoneFrame from "@/components/landing/PhoneFrame";
import SidekickChat from "@/components/landing/SidekickChat";
import { YCBadge, HeadlineWithSidekick } from "@/components/landing/Brand";
import { ArrowIcon, CheckIcon } from "@/components/landing/icons";

const HEADLINE = "Your workers text. Sidekick handles the rest.";
const SUBHEAD =
  "Workers report issues by text. Sidekick creates the work order, routes the right person, and turns every fix into searchable knowledge — without asking the floor to learn another system.";

export default function Hero() {
  return (
    <section className="relative px-6 md:px-10 lg:px-14 pt-18 pb-15" style={{ paddingTop: 72, paddingBottom: 60 }}>
      <div className="max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-16 items-center">
        <div>
          <div className="mb-6 flex">
            <YCBadge height={32} />
          </div>
          <h1
            className="font-serif font-normal m-0 mb-7"
            style={{
              fontSize: "clamp(3.25rem, 8vw, 5.5rem)",
              lineHeight: 0.98,
              letterSpacing: "-0.025em",
              textWrap: "balance" as React.CSSProperties["textWrap"],
            }}
          >
            <HeadlineWithSidekick text={HEADLINE} />
          </h1>
          <p
            className="text-ink/70 m-0 mb-9 max-w-[520px]"
            style={{ fontSize: 19, lineHeight: 1.5 }}
          >
            {SUBHEAD}
          </p>
          <div className="flex flex-wrap gap-2.5 mb-8 text-[13px] text-ink/65">
            {[
              "No app download",
              "Works with any phone",
              "Creates audit-ready records",
            ].map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-full border border-ink/10 bg-white/70 px-3 py-1.5"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3.5">
            <a
              href="https://calendly.com/justin-textsidekick"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-ink text-cream px-[26px] py-4 rounded-full text-[15px] font-medium"
            >
              Book a demo <ArrowIcon size={14} />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center border border-ink/15 bg-transparent text-ink px-[22px] py-[15px] rounded-full text-[15px] font-medium"
            >
              Talk to us
            </a>
          </div>
          <div className="flex items-center gap-2 mt-7 text-[13px] text-ink/55">
            <span className="text-accent">
              <CheckIcon size={14} w={2.4} />
            </span>
            Workers use text. Managers get structure, routing, and history.
          </div>
        </div>
        <div className="flex justify-center relative animate-[float_7s_ease-in-out_infinite]">
          <div
            className="absolute -inset-5 rounded-[64px] z-0"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 40%, rgba(0,96,240,0.08), transparent 70%)",
              filter: "blur(20px)",
            }}
          />
          <div className="relative z-10">
            <PhoneFrame scale={0.92}>
              <SidekickChat />
            </PhoneFrame>
          </div>
          <div
            className="absolute z-20 bg-white border border-ink/10 rounded-[14px] px-3.5 py-2.5 max-w-[200px]"
            style={{
              top: 40,
              left: -30,
              boxShadow: "0 8px 24px rgba(28,26,22,0.06)",
              fontSize: 12,
              color: "rgba(28,26,22,0.7)",
              transform: "rotate(-3deg)",
            }}
          >
            <div className="font-semibold text-ink mb-0.5">
              Report it in seconds.
            </div>
            Sidekick routes the work and remembers the fix.
          </div>
        </div>
      </div>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </section>
  );
}
