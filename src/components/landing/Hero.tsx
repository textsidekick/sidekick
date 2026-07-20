import { LINKS } from "./links";
import VideoLoop from "./VideoLoop";
import PhoneDemo from "./PhoneDemo";

export default function Hero() {
  return (
    <header className="lp-hero" style={{ position: "relative", minHeight: "max(720px, 100svh)", overflow: "hidden" }}>
      <VideoLoop src="/landing/hero.mp4" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.28) 1px, transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
      <div className="lp-hero-overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,18,12,0.45) 0%, rgba(20,18,12,0.28) 40%, rgba(20,18,12,0.05) 100%)", pointerEvents: "none" }} />

      <div className="lp-hero-grid" style={{ position: "relative", zIndex: 2, maxWidth: 1020, margin: "120px auto 0", minHeight: "calc(100svh - 120px)", padding: "0 24px 56px", display: "grid", gridTemplateColumns: "minmax(0, 1fr) 272px", gap: 48, alignItems: "center", pointerEvents: "none" }}>
        <div className="lp-hero-copy" style={{ maxWidth: 560 }}>
          <div className="lp-hero-copy-panel" style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", maxWidth: 540, padding: "12px 14px", borderRadius: 22, background: "radial-gradient(120% 140% at 0% 0%, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 26%, transparent 50%), linear-gradient(180deg, rgba(38,38,35,0.11) 0%, rgba(28,28,26,0.06) 100%)", border: "1px solid rgba(255,255,255,0.025)", backdropFilter: "blur(7px) saturate(1.0)", boxShadow: "0 6px 24px -24px rgba(0,0,0,0.18)" }}>
            <div className="lp-hero-badge" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 14.5, fontWeight: 500, lineHeight: 1, color: "rgba(255,255,255,0.85)" }}>Backed by</span>
              <img src="/landing/yc-logo.png" alt="Y Combinator" style={{ display: "block", height: 26, objectFit: "contain", marginLeft: -3, transform: "translateY(1.5px)" }} />
            </div>
            <h1 className="lp-hero-title" style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif", fontWeight: 400, fontSize: 64, lineHeight: 1.05, color: "#FFFFFF", margin: "0 0 16px", textWrap: "pretty", maxWidth: 640 }}>
              <span className="lp-hero-line1">Your workers text.</span>{" "}<span className="lp-hero-line2"><span style={{ color: "#4D8DFF" }}>Sidekick</span> handles the rest.</span>
            </h1>
            <p className="lp-hero-body" style={{ fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,0.88)", margin: 0, maxWidth: 460, textWrap: "pretty" }}>
              Workers report issues by text. Sidekick creates the work order, routes the right person, and turns every fix into searchable knowledge. No app, no login, any phone.
            </p>
          </div>
          <div className="lp-hero-actions" style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
            <a className="lp-btn-blue lp-hero-cta" href={LINKS.bookDemo} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", fontSize: 14, fontWeight: 500, padding: "13px 26px", borderRadius: 999 }}>
              Get a demo
            </a>
            <a className="lp-pill-outline lp-hero-login" href={LINKS.login} style={{ display: "inline-block", fontSize: 14, fontWeight: 500, padding: "13px 26px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.28)", color: "#FFFFFF", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)" }}>
              Login
            </a>
          </div>
        </div>
        <div className="lp-hero-phone" style={{ justifySelf: "end", width: 272, position: "relative" }}>
          <PhoneDemo />
        </div>
      </div>
    </header>
  );
}
