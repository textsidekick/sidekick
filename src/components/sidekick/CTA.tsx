import { Button } from "@/components/ui/button";
import { HeadlineWithSidekick } from "./Brand";

export default function CTA() {
  return (
    <section className="px-6 py-28">
      <div className="max-w-[1240px] mx-auto">
        <div className="rounded-3xl bg-ink text-cream px-10 py-20 lg:px-20 lg:py-24 relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full opacity-25 blur-3xl"
            style={{ background: "radial-gradient(circle, var(--color-accent), transparent 70%)" }}
          />
          <div className="relative max-w-[820px]">
            <h2 className="font-serif font-normal text-[44px] lg:text-[60px] leading-[1.05] tracking-[-0.02em]">
              <HeadlineWithSidekick text="Give every shift a Sidekick." />
            </h2>
            <p className="mt-6 text-[18px] leading-[1.55] text-cream/70 max-w-[600px]">
              30-minute demo. We'll show you how Sidekick handles your top 20
              repetitive supervisor questions on day one.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-cream text-ink hover:bg-cream/90 h-12 px-7 text-[15px]"
              >
                <a href="#contact">Book a demo →</a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-cream/20 bg-transparent text-cream hover:bg-cream/10 hover:text-cream h-12 px-7 text-[15px]"
              >
                <a href="mailto:hello@textsidekick.com">Email us</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
