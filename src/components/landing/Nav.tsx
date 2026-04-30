"use client";

import { SidekickLogo } from "@/components/landing/Brand";

export default function Nav() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="sticky top-4 z-50 flex justify-center px-6 pointer-events-none" style={{ position: "sticky", top: 16, zIndex: 50 }}>
      <nav
        className="pointer-events-auto inline-flex items-center justify-between gap-8 pl-5 pr-2 py-2 rounded-full border border-ink/10 bg-cream/85 backdrop-blur-xl backdrop-saturate-150"
        style={{
          boxShadow:
            "0 6px 24px -8px rgba(28,26,22,0.12), 0 2px 6px -2px rgba(28,26,22,0.06)",
        }}
      >
        <div className="flex items-center gap-7">
          <button onClick={scrollToTop} className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity">
            <SidekickLogo size={30} />
            <span className="text-[17px] font-semibold tracking-tight">
              Sidekick
            </span>
          </button>
          <div className="flex items-center gap-5 text-sm text-ink/70">
            <a className="hover:text-ink cursor-pointer" href="#product">Product</a>
            <a className="hover:text-ink cursor-pointer" href="https://textsidekick.substack.com/" target="_blank" rel="noopener noreferrer">Blog</a>
            <a className="hover:text-ink cursor-pointer" href="#pricing">Pricing</a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="text-ink px-4 py-[9px] rounded-full text-[13px] font-medium tracking-tight hover:bg-ink/5 transition-colors"
          >
            Login
          </a>
          <a
            href="#contact"
            className="bg-ink text-cream px-4 py-[9px] rounded-full text-[13px] font-medium tracking-tight"
          >
            Book a demo →
          </a>
        </div>
      </nav>
    </div>
  );
}
