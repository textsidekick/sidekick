"use client";

import { SidekickLogo } from "@/components/landing/Brand";

export default function Nav() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ position: "fixed", top: 16, left: 0, right: 0, zIndex: 50, display: "flex", justifyContent: "center", padding: "0 16px", pointerEvents: "none" }}>
      <nav
        style={{
          pointerEvents: "auto",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          paddingLeft: 16,
          paddingRight: 8,
          paddingTop: 8,
          paddingBottom: 8,
          borderRadius: 9999,
          border: "1px solid rgba(28,26,22,0.1)",
          background: "rgba(247,243,236,0.85)",
          backdropFilter: "blur(16px) saturate(1.5)",
          boxShadow: "0 6px 24px -8px rgba(28,26,22,0.12), 0 2px 6px -2px rgba(28,26,22,0.06)",
          maxWidth: "100%",
        }}
      >
        <button onClick={scrollToTop} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: "none", border: "none", padding: 0 }}>
          <SidekickLogo size={28} />
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em", color: "#1C1A16", whiteSpace: "nowrap" }}>
            Sidekick
          </span>
        </button>

        {/* Desktop links - hidden on mobile via media query */}
        <div className="nav-desktop-links" style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 14, color: "rgba(28,26,22,0.7)", marginLeft: 16 }}>
          <a style={{ color: "inherit", textDecoration: "none" }} href="#product">Product</a>
          <a style={{ color: "inherit", textDecoration: "none" }} href="https://textsidekick.substack.com/" target="_blank" rel="noopener noreferrer">Blog</a>
          <a style={{ color: "inherit", textDecoration: "none" }} href="#pricing">Pricing</a>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 8 }}>
          <a
            href="/login"
            style={{ color: "#1C1A16", padding: "8px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap" }}
          >
            Login
          </a>
          <a
            href="#contact"
            style={{ background: "#1C1A16", color: "#F7F3EC", padding: "8px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap" }}
          >
            Book a demo →
          </a>
        </div>
      </nav>

      <style>{`
        @media (max-width: 640px) {
          .nav-desktop-links { display: none !important; }
        }
      `}</style>
    </div>
  );
}
