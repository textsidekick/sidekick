import { ArrowIcon } from "@/components/landing/icons";

export default function CTA() {
  return (
    <section className="bg-[#171C22] px-5 py-20 text-white md:px-8 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-[1280px] rounded-[20px] border border-white/10 bg-white/[0.03] p-8 md:p-10 lg:p-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-[720px]">
            <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/45">See Sidekick on your floor</div>
            <h2
              className="mt-4"
              style={{ fontSize: "clamp(2.4rem, 4.6vw, 4rem)", lineHeight: 0.98, letterSpacing: "-0.03em", fontWeight: 650 }}
            >
              We’ll show you how a real frontline workflow would run through Sidekick.
            </h2>
            <p className="mt-5 max-w-[620px] text-[17px] leading-[1.65] text-white/70">
              We can walk through issue intake, routing, question answering, and how the resolution history stays attached to the operation.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            <a
              href="https://calendly.com/justin-textsidekick"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#F05A28] px-5 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#d94e20]"
            >
              Book a demo <ArrowIcon size={14} />
            </a>
            <a
              href="mailto:hello@textsidekick.com"
              className="inline-flex items-center gap-2 rounded-[8px] border border-white/16 px-5 py-3.5 text-[15px] font-semibold text-white/85 transition hover:bg-white/5"
            >
              Email us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
