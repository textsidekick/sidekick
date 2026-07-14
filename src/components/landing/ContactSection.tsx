import ContactForm from "./ContactForm";
import { LINKS } from "./links";

const serif = "var(--font-instrument-serif), Georgia, serif";
const ACCENT = "#1D6BF3";

const rowLabel: React.CSSProperties = {
  width: 60,
  flex: "none",
  fontSize: 10.5,
  fontWeight: 600,
  letterSpacing: "0.1em",
  color: "#9B9788",
};

export default function ContactSection() {
  return (
    <section id="contact" style={{ padding: "0 36px 120px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: 64, alignItems: "start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: ACCENT }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A857A" }}>Get in touch</span>
          </div>
          <h2 style={{ fontFamily: serif, fontWeight: 400, fontSize: 44, lineHeight: 1.1, margin: "0 0 20px", textWrap: "balance" }}>
            Talk to a real human about <span style={{ fontStyle: "italic", color: ACCENT }}>your</span> operation.
          </h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "#6E6A5D", margin: "0 0 32px", maxWidth: 420, textWrap: "pretty" }}>
            Tell us a little about your operation and we&rsquo;ll set up a short call to see whether Sidekick can help with issue reporting, workflow routing, and knowledge capture.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
              <span style={rowLabel}>EMAIL</span>
              <a href={LINKS.contactEmail} style={{ fontSize: 14.5, color: "#26251E" }}>hello@textsidekick.com</a>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
              <span style={rowLabel}>PHONE</span>
              <span style={{ fontSize: 14.5, color: "#26251E" }}>+1 (408) 828-5979</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
              <span style={rowLabel}>OFFICE</span>
              <span style={{ fontSize: 14.5, color: "#26251E" }}>San Francisco, CA</span>
            </div>
          </div>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
