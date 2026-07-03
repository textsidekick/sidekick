import { SidekickLogo, YCBadge } from "@/components/landing/Brand";

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(17,24,39,0.06)] px-6 pt-12 pb-10 md:px-10">
      <div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-12 md:flex-row">
        <div className="max-w-[320px]">
          <div className="mb-3 flex items-center gap-2.5">
            <SidekickLogo size={32} />
            <span className="text-[18px] font-bold tracking-tight text-ink">Sidekick</span>
          </div>
          <p className="mb-4 text-[13px] leading-[1.55] text-[rgba(17,24,39,0.45)]">
            Built in San Francisco for the 80% of American workers without a desk.
          </p>
          <YCBadge height={20} />
        </div>
        <div className="flex gap-14 text-[13px]">
          <div>
            <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[rgba(17,24,39,0.35)]">Company</div>
            <div className="flex flex-col gap-2.5 text-[rgba(17,24,39,0.5)]">
              <a href="https://textsidekick.substack.com/" target="_blank" rel="noopener noreferrer" className="link-quiet no-underline hover:text-ink">Blog</a>
              <a href="mailto:hello@textsidekick.com" className="link-quiet no-underline hover:text-ink">Contact</a>
            </div>
          </div>
          <div>
            <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[rgba(17,24,39,0.35)]">Legal</div>
            <div className="flex flex-col gap-2.5 text-[rgba(17,24,39,0.5)]">
              <a href="/privacy" className="link-quiet no-underline hover:text-ink">Privacy Policy</a>
              <a href="/terms" className="link-quiet no-underline hover:text-ink">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 flex max-w-[1200px] justify-between border-t border-[rgba(17,24,39,0.06)] pt-5 text-xs text-[rgba(17,24,39,0.35)]">
        <div>© {new Date().getFullYear()} Sidekick HQ, Inc.</div>
        <div>hello@textsidekick.com</div>
      </div>
    </footer>
  );
}
