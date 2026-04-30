import PhoneFrame from "@/components/landing/PhoneFrame";
import SidekickChat from "@/components/landing/SidekickChat";
import { YCBadge, HeadlineWithSidekick } from "@/components/landing/Brand";
import { ArrowIcon, CheckIcon } from "@/components/landing/icons";

const HEADLINE = "Sidekick: frontline answers, by text.";
const SUBHEAD =
  "Sidekick is the texting assistant for your frontline. Workers ask it anything — shift times, SOPs, safety steps, HR — and get instant answers from your own documents. Every conversation makes Sidekick smarter, turning the knowledge in your head and your binders into a living knowledge base your business actually owns.";

export default function Hero() {
  return (
    <section className="relative px-14 pt-18 pb-15" style={{ paddingTop: 72, paddingBottom: 60 }}>
      <div className="max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-16 items-center">
        <div>
          <div className="mb-6 flex">
            <YCBadge height={32} />
          </div>
          <h1
            className="font-serif font-normal m-0 mb-7"
            style={{
              fontSize: 88,
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
          <div className="flex items-center gap-3.5">
            <a
              href="#contact"
              className="inline-flex items-center gap-2.5 bg-ink text-cream px-[26px] py-4 rounded-full text-[15px] font-medium"
            >
              Book a demo <ArrowIcon size={14} />
            </a>
            <a
              href="#tour"
              className="inline-flex items-center border border-ink/15 bg-transparent text-ink px-[22px] py-[15px] rounded-full text-[15px] font-medium"
            >
              Watch 90-second tour
            </a>
          </div>
          <div className="flex items-center gap-2 mt-7 text-[13px] text-ink/55">
            <span className="text-accent">
              <CheckIcon size={14} w={2.4} />
            </span>
            No app download · Works on any phone · Live in under 2 weeks
          </div>
        </div>
        <div className="flex justify-center relative">
          <div
            className="absolute -inset-5 rounded-[64px] z-0"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 40%, rgba(201,100,66,0.08), transparent 70%)",
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
              Type, talk, any language.
            </div>
            Workers reach Sidekick how they already text.
          </div>
        </div>
      </div>
    </section>
  );
}
