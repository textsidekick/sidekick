"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SidekickLogo } from "./Brand";

export default function Nav() {
  return (
    <div className="sticky top-4 z-50 flex justify-center px-6 pointer-events-none">
      <nav
        className="pointer-events-auto inline-flex items-center justify-between gap-8 pl-5 pr-2 py-2 rounded-full border border-ink/10 bg-cream/85 backdrop-blur-xl backdrop-saturate-150"
        style={{
          boxShadow:
            "0 6px 24px -8px rgba(28,26,22,0.12), 0 2px 6px -2px rgba(28,26,22,0.06)",
        }}
      >
        <div className="flex items-center gap-7">
          <Link href="/" className="flex items-center gap-2.5">
            <SidekickLogo size={30} />
            <span className="text-[17px] font-semibold tracking-tight">
              Sidekick
            </span>
          </Link>
          <div className="flex items-center gap-5 text-sm text-ink/70">
            <a href="#product" className="hover:text-ink">Product</a>
            <a href="#pricing" className="hover:text-ink">Pricing</a>
            <a
              href="https://textsidekick.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink"
            >
              Blog
            </a>
          </div>
        </div>
        <a href="#contact">
          <Button
            size="sm"
            className="rounded-full bg-ink text-cream hover:bg-ink/90"
          >
            Book a demo →
          </Button>
        </a>
      </nav>
    </div>
  );
}
