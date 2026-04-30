import { ArrowIcon } from "@/components/landing/icons";

export default function CTA() {
  return (
    <section className="px-14 pt-24 pb-18" style={{ paddingBottom: 72 }}>
      <div
        className="max-w-[1180px] mx-auto text-cream rounded-[32px] p-16 md:px-16 md:py-20 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-12 items-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #C96442 0%, #A74D30 100%)",
        }}
      >
        <div>
          <h2
            className="font-serif font-normal m-0 mb-5 text-cream"
            style={{ fontSize: 64, lineHeight: 0.98, letterSpacing: "-0.025em" }}
          >
            See Sidekick on <em className="italic">your</em> floor.
          </h2>
          <p className="text-[17px] leading-[1.5] m-0 mb-9 max-w-[520px] text-cream/90">
            A 20-minute demo with a real conversation — we&apos;ll text your own number from a Sidekick loaded with sample docs from a plant like yours.
          </p>
          <div className="flex gap-3 items-center">
            <a
              href="/login"
              className="inline-flex items-center gap-2.5 bg-cream text-ink px-[26px] py-4 rounded-full text-[15px] font-medium"
            >
              Try Sidekick free <ArrowIcon size={14} />
            </a>
            <a
              href="#playbook"
              className="inline-flex items-center border border-cream/30 bg-transparent text-cream px-[22px] py-[15px] rounded-full text-[15px] font-medium"
            >
              Read the playbook
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-2.5 bg-cream/[0.08] rounded-[16px] p-4 backdrop-blur-sm">
          <div className="text-[11px] text-cream/70 uppercase tracking-widest mb-1">
            Try a sample text
          </div>
          <div className="self-end max-w-[85%] px-[13px] py-2.5 bg-cream/90 text-ink rounded-[16px_16px_4px_16px] text-[13px]">
            Text DEMO to <span className="font-semibold">+1 (628) 555-0119</span>
          </div>
          <div className="self-start max-w-[85%] px-[13px] py-2.5 bg-ink/45 text-cream rounded-[16px_16px_16px_4px] text-[13px]">
            Hey! I&apos;m Sidekick. What industry are you in — I&apos;ll pull a relevant SOP for you.
          </div>
        </div>
      </div>
    </section>
  );
}
