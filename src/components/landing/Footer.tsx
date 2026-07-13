import { SidekickLogo } from "@/components/landing/Brand";

export default function Footer() {
  return (
    <footer className="border-t border-black/8 bg-[#F3F4F1] px-5 py-10 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-[340px]">
          <div className="flex items-center gap-3">
            <SidekickLogo size={34} />
            <span className="text-[20px] font-semibold tracking-tight text-[#171A1D]">Sidekick</span>
          </div>
          <p className="mt-3 text-[14px] leading-[1.6] text-[#55606A]">
            SMS-first operations software for frontline teams that need cleaner intake, clearer routing, and retained knowledge.
          </p>
        </div>

        <div className="grid gap-8 text-[14px] text-[#55606A] md:grid-cols-3 md:gap-14">
          <div>
            <div className="mb-3 font-semibold text-[#171A1D]">Product</div>
            <div className="flex flex-col gap-2">
              <a href="#product" className="hover:text-[#171A1D]">Overview</a>
              <a href="#workflow" className="hover:text-[#171A1D]">Workflow</a>
              <a href="#knowledge" className="hover:text-[#171A1D]">Knowledge</a>
            </div>
          </div>
          <div>
            <div className="mb-3 font-semibold text-[#171A1D]">Company</div>
            <div className="flex flex-col gap-2">
              <a href="https://textsidekick.substack.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#171A1D]">Blog</a>
              <a href="mailto:hello@textsidekick.com" className="hover:text-[#171A1D]">hello@textsidekick.com</a>
            </div>
          </div>
          <div>
            <div className="mb-3 font-semibold text-[#171A1D]">Legal</div>
            <div className="flex flex-col gap-2">
              <a href="/privacy" className="hover:text-[#171A1D]">Privacy Policy</a>
              <a href="/terms" className="hover:text-[#171A1D]">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-[1280px] flex-col gap-2 border-t border-black/8 pt-5 text-[12px] text-[#6D7680] md:flex-row md:items-center md:justify-between">
        <div>© {new Date().getFullYear()} Sidekick HQ, Inc.</div>
        <div>Built in San Francisco</div>
      </div>
    </footer>
  );
}
