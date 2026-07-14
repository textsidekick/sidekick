import { LINKS } from "./links";

export default function Footer() {
  return (
    <footer style={{ background: "#F1ECDF", borderTop: "1px solid #E3DDCB", padding: "72px 36px 32px" }}>
      <div style={{ maxWidth: 1020, margin: "0 auto", display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr", gap: 64 }}>
        <div>
          <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 9, color: "#1D6BF3", fontFamily: "var(--font-quicksand), sans-serif", fontSize: 19, fontWeight: 700, marginBottom: 16 }}>
            <img src="/landing/sidekick-logo.png" alt="Sidekick" style={{ display: "block", width: 27, height: 27, objectFit: "contain" }} />
            Sidekick
          </a>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#6E6A5D", margin: "0 0 20px", maxWidth: 300, textWrap: "pretty" }}>
            Built in San Francisco for the 80% of American workers without a desk.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 500, lineHeight: 1, color: "#9B9788" }}>Backed by</span>
            <img src="/landing/yc-logo.png" alt="Y Combinator" style={{ display: "block", height: 21.5, objectFit: "contain", marginLeft: -3, transform: "translateY(1px)" }} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9B9788", marginBottom: 4 }}>Company</span>
          <a className="lp-footer-link" href={LINKS.blog} target="_blank" rel="noopener noreferrer">Blog</a>
          <a className="lp-footer-link" href="#contact">Contact</a>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9B9788", marginBottom: 4 }}>Legal</span>
          <a className="lp-footer-link" href={LINKS.privacy}>Privacy Policy</a>
          <a className="lp-footer-link" href={LINKS.terms}>Terms of Service</a>
        </div>
      </div>
      <div style={{ maxWidth: 1020, margin: "56px auto 0", paddingTop: 20, borderTop: "1px solid #E3DDCB", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#9B9788" }}>
        <span>© 2026 Sidekick HQ, Inc.</span>
        <a href={LINKS.contactEmail} style={{ color: "#9B9788" }}>hello@textsidekick.com</a>
      </div>
    </footer>
  );
}
