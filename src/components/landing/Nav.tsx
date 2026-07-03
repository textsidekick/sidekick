"use client";

import { useEffect, useState } from "react";
import { SidekickLogo } from "@/components/landing/Brand";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav
        className="pointer-events-auto inline-flex max-w-full items-center gap-1 rounded-full border py-1.5 pl-4 pr-1.5"
        style={{
          borderColor: scrolled ? "rgba(28,26,22,0.08)" : "rgba(28,26,22,0.05)",
          background: scrolled ? "rgba(247,243,236,0.82)" : "rgba(247,243,236,0.5)",
          backdropFilter: "blur(20px) saturate(1.4)",
          WebkitBackdropFilter: "blur(20px) saturate(1.4)",
          boxShadow: scrolled
            ? "0 1px 2px rgba(28,26,22,0.04), 0 12px 32px -16px rgba(28,26,22,0.18)"
            : "none",
          transition: "background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
        }}
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex cursor-pointer items-center gap-2 border-none bg-transparent p-0"
        >
          <SidekickLogo size={26} />
          <span className="whitespace-nowrap text-[15px] font-semibold tracking-[-0.01em] text-ink">
            Sidekick
          </span>
        </button>

        <div className="nav-desktop-links ml-5 mr-2 flex items-center gap-5 text-[14px] font-medium">
          {[
            { label: "Contact", href: "#contact" },
            { label: "Blog", href: "https://textsidekick.substack.com/", external: true },
            {
              label: "Book a demo",
              href: "https://calendly.com/justin-textsidekick",
              external: true,
            },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="link-quiet whitespace-nowrap text-[rgba(28,26,22,0.55)] no-underline hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <a
            href="/login"
            className="btn whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-medium text-ink no-underline hover:bg-[rgba(28,26,22,0.06)]"
          >
            Log in
          </a>
          <a
            href="/login"
            className="btn whitespace-nowrap rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-cream no-underline hover:bg-[#33302a]"
          >
            Try Sidekick
          </a>
        </div>

        <style>{`
          @media (max-width: 680px) {
            .nav-desktop-links { display: none !important; }
          }
        `}</style>
      </nav>
    </div>
  );
}
