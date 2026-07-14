import KnowledgeBaseDemo from "./demos/KnowledgeBaseDemo";
import ReportsDemo from "./demos/ReportsDemo";

const serif = "var(--font-instrument-serif), Georgia, serif";
const ACCENT = "#1D6BF3";

export default function KnowledgeSection() {
  return (
    <section id="usecases" style={{ padding: "110px 36px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, marginBottom: 18 }}>The knowledge base</span>
          <h2 style={{ fontFamily: serif, fontWeight: 400, fontSize: 44, lineHeight: 1.12, margin: "0 0 18px", textWrap: "balance" }}>Tribal knowledge, safe from retirement.</h2>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: "#6E6A5D", margin: "0 auto", maxWidth: 540, textWrap: "pretty" }}>
            Every fix, workaround, and answer is captured into a searchable plant history your company owns, and turned into documents on demand. When a veteran retires, their know-how stays.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "stretch" }}>
          <div>
            <div style={{ height: 480 }}>
              <KnowledgeBaseDemo accent={ACCENT} />
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "#6E6A5D", margin: "14px 8px 0", textWrap: "pretty" }}>
              <span style={{ fontWeight: 600, color: "#26251E" }}>Searchable plant history.</span> Ask what worked last time and get the exact fix, who did it, and when, with the source cited.
            </p>
          </div>
          <div>
            <div style={{ height: 480 }}>
              <ReportsDemo accent={ACCENT} />
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "#6E6A5D", margin: "14px 8px 0", textWrap: "pretty" }}>
              <span style={{ fontWeight: 600, color: "#26251E" }}>AI-generated documents.</span> Turn captured knowledge into handbooks, safety procedures, and FAQs on demand.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
