import { LINKS } from "./links";

export default function Nav() {
  return (
    <nav style={{ position: "fixed", top: 16, left: 0, right: 0, zIndex: 50, display: "flex", justifyContent: "center", padding: "0 24px", pointerEvents: "none" }}>
      <div style={{ pointerEvents: "auto", display: "inline-flex", alignItems: "center", gap: 32, padding: "8px 8px 8px 20px", borderRadius: 999, border: "1px solid rgba(38,37,30,0.1)", background: "rgba(250,248,241,0.85)", backdropFilter: "blur(20px) saturate(1.5)", boxShadow: "0 6px 24px -8px rgba(28,26,22,0.12), 0 2px 6px -2px rgba(28,26,22,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, color: "#1D6BF3", fontFamily: "var(--font-quicksand), sans-serif", fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" }}>
            <img src="/landing/sidekick-logo.png" alt="Sidekick" style={{ display: "block", width: 30, height: 30, objectFit: "contain" }} />
            Sidekick
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 14 }}>
            <a className="lp-navlink" href="#how">Product</a>
            <a className="lp-navlink" href={LINKS.blog} target="_blank" rel="noopener noreferrer">Blog</a>
            <a className="lp-navlink" href="#faq">FAQ</a>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a className="lp-login" href={LINKS.login} style={{ color: "#26251E", fontSize: 13, fontWeight: 500, padding: "9px 16px", borderRadius: 999 }}>Login</a>
          <a className="lp-btn-dark" href={LINKS.bookDemo} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 500, padding: "9px 16px", borderRadius: 999 }}>Book a demo →</a>
        </div>
      </div>
    </nav>
  );
}
