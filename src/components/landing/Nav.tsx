"use client";

import { SidekickLogo } from "@/components/landing/Brand";

export default function Nav() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#F3F4F1]/92 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-3 md:px-8 lg:px-12">
        <button
          onClick={scrollToTop}
          className="flex items-center gap-3 bg-transparent p-0 text-left"
          style={{ border: "none", cursor: "pointer" }}
        >
          <SidekickLogo size={30} />
          <span className="text-[18px] font-semibold tracking-tight text-[#171A1D]">Sidekick</span>
        </button>

        <nav className="hidden items-center gap-7 text-[14px] text-[#4E5760] md:flex">
          <a href="#product" className="hover:text-[#171A1D]">Product</a>
          <a href="#workflow" className="hover:text-[#171A1D]">Workflow</a>
          <a href="#knowledge" className="hover:text-[#171A1D]">Knowledge</a>
          <a href="#faq" className="hover:text-[#171A1D]">FAQ</a>
        </nav>

        <div className="flex items-center gap-3">
          <a href="/login" className="hidden text-[14px] font-medium text-[#171A1D] md:inline-flex">
            Login
          </a>
          <a
            href="https://calendly.com/justin-textsidekick"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-[8px] bg-[#171A1D] px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-black"
          >
            Book a demo
          </a>
        </div>
      </div>
    </header>
  );
}
