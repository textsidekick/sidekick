import { SidekickLogo, YCBadge } from "@/components/landing/Brand";

export default function Footer() {
  return (
    <footer className="px-14 pt-12 pb-10 border-t border-ink/10">
      <div className="max-w-[1180px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="max-w-[320px]">
          <div className="flex items-center gap-3 mb-3">
            <SidekickLogo size={40} />
            <span className="text-[22px] font-semibold tracking-tight">Sidekick</span>
          </div>
          <p className="text-[13px] text-ink/55 leading-[1.5] m-0 mb-4">
            Built in San Francisco for the 80% of American workers without a desk.
          </p>
          <YCBadge height={22} />
        </div>
        <div className="flex gap-16 text-[13px]">
          <div>
            <div className="font-semibold mb-3 text-ink">Company</div>
            <div className="flex flex-col gap-2 text-ink/60">
              <a
                href="https://textsidekick.substack.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink"
              >
                Blog
              </a>
              <a href="mailto:hello@textsidekick.com" className="hover:text-ink">
                Contact
              </a>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-3 text-ink">Legal</div>
            <div className="flex flex-col gap-2 text-ink/60">
              <a href="/privacy" className="hover:text-ink">Privacy Policy</a>
              <a href="/terms" className="hover:text-ink">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-[1180px] mx-auto mt-8 pt-5 border-t border-ink/[0.06] flex justify-between text-xs text-ink/45">
        <div>© {new Date().getFullYear()} Sidekick HQ, Inc.</div>
        <div>hello@textsidekick.com</div>
      </div>
    </footer>
  );
}
