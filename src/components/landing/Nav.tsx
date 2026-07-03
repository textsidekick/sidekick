"use client";

import { useEffect, useState } from "react";
import { SidekickLogo } from "@/components/landing/Brand";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-0 inset-x-0 z-50">
      <nav
        className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4 md:px-10"
        style={{
          background: scrolled ? "rgba(6,8,15,0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
          transition: "background 0.3s ease, border-color 0.3s ease",
        }}
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex cursor-pointer items-center gap-2.5 border-none bg-transparent p-0"
        >
          <SidekickLogo size={26} />
          <span className="whitespace-nowrap text-[15px] font-semibold tracking-[-0.01em] text-white">
            Sidekick
          </span>
        </button>

        <div className="nav-desktop-links flex items-center gap-8 text-[14px]">
          {[
            { label: "Product", href: "#product" },
            { label: "Contact", href: "#contact" },
            { label: "Blog", href: "https://textsidekick.substack.com/", external: true },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="link-quiet whitespace-nowrap text-[rgba(255,255,255,0.5)] no-underline hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="btn whitespace-nowrap rounded-lg px-4 py-2 text-[13px] font-medium text-[rgba(255,255,255,0.7)] no-underline hover:text-white"
          >
            Log in
          </a>
          <a
            href="/login"
            className="btn whitespace-nowrap rounded-lg bg-accent px-4 py-2.5 text-[13px] font-semibold text-white no-underline hover:bg-[#0052cc]"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.2), 0 0 20px rgba(0,96,240,0.15)" }}
          >
            Get started
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
