import { Button } from "@/components/ui/button";
import { HeadlineWithSidekick } from "@/components/sidekick/Brand";

export default function CTA() {
  return (
    <section className="px-6 py-24 sm:py-32" id="cta">
      <div className="mx-auto max-w-[1200px]">
        <div className="rounded-[28px] bg-ink text-cream px-8 py-16 sm:px-16 sm:py-20">
          <div className="max-w-[640px]">
            <h2 className="text-[44px] sm:text-[56px] leading-[1.05] tracking-[-0.02em] font-serif">
              <HeadlineWithSidekick
                text="Bring Sidekick to your team."
                className="text-cream"
              />
            </h2>
            <p className="mt-6 text-[18px] leading-[1.55] text-cream/70 max-w-[600px]">
              30-minute demo. We'll show you how Sidekick handles your top 20
              repetitive supervisor questions on day one.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#contact">
                <Button
                  size="lg"
                  className="rounded-full bg-cream text-ink hover:bg-cream/90 h-12 px-7 text-[15px]"
                >
                  Book a demo →
                </Button>
              </a>
              <a href="mailto:hello@textsidekick.com">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-cream/20 bg-transparent text-cream hover:bg-cream/10 hover:text-cream h-12 px-7 text-[15px]"
                >
                  Email us
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
