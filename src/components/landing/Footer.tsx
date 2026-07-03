import { SidekickLogo, YCBadge } from "@/components/landing/Brand";

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(17,24,39,0.07)] px-6 pt-12 pb-10 md:px-10">
      <div className="mx-auto max-w-[1120px] flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="max-w-[320px]">
          <div className="flex items-center gap-2.5 mb-3">
            <SidekickLogo size={36} />
            <span className="text-[20px] font-semibold tracking-tight text-ink">Sidekick</span>
          </div>
          <p className="text-[13px] text-[rgba(17,24,39,0.5)] leading-[1.55] m-0 mb-4">
            Built in San Francisco for the 80% of American workers without a desk.
          </p>
          <YCBadge height={20} />
        </div>
        <div className="flex gap-14 text-[13px]">
          <div>
            <div className="font-semibold mb-3 text-ink">Company</div>
            <div className="flex flex-col gap-2 text-[rgba(17,24,39,0.55)]">
              <a
                href="https://textsidekick.substack.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="link-quiet no-underline hover:text-ink"
              >
                Blog
              </a>
              <a href="mailto:hello@textsidekick.com" className="link-quiet no-underline hover:text-ink">
                Contact
              </a>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-3 text-ink">Legal</div>
            <div className="flex flex-col gap-2 text-[rgba(17,24,39,0.55)]">
              <a href="/privacy" className="link-quiet no-underline hover:text-ink">Privacy Policy</a>
              <a href="/terms" className="link-quiet no-underline hover:text-ink">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1120px] mt-8 pt-5 border-t border-[rgba(17,24,39,0.06)] flex justify-between text-xs text-[rgba(17,24,39,0.4)]">
        <div>© {new Date().getFullYear()} Sidekick HQ, Inc.</div>
        <div>hello@textsidekick.com</div>
      </div>
    </footer>
  );
}
