import VideoLoop from "./VideoLoop";

const serif = "var(--font-instrument-serif), Georgia, serif";
const mask = "radial-gradient(closest-side, #000 55%, transparent 96%)";

const STEPS = [
  {
    video: "/landing/how-text.mp4",
    tile: "#FCF6EE",
    title: "Text like you already do",
    body: "Plain SMS on any phone: texts, photos, voice memos. Nothing to install, no password to forget.",
  },
  {
    video: "/landing/how-reach.mp4",
    tile: "#F7F3ED",
    title: "Reach the whole floor",
    body: "Sidekick handles questions and alerts on its own, and escalates to the right manager the moment it should.",
  },
  {
    video: "/landing/how-knowledge.mp4",
    tile: "#F5F1EB",
    title: "Save tribal knowledge",
    body: "Sidekick records the know-how in your veterans' heads and learns from every fix, so nothing retires when they do.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" style={{ padding: "84px 36px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", background: "#F1ECDF", borderRadius: 20, padding: "56px 56px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 style={{ fontFamily: serif, fontWeight: 400, fontSize: 30, margin: "0 0 16px" }}>How Sidekick works</h2>
          <a className="lp-pill-outline" href="#contact" style={{ display: "inline-block", fontSize: 12.5, fontWeight: 500, padding: "8px 16px", borderRadius: 999, border: "1px solid #26251E", color: "#26251E" }}>
            See it in action
          </a>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 48 }}>
          {STEPS.map((s) => (
            <div key={s.title} style={{ textAlign: "center" }}>
              <div style={{ width: 124, height: 124, margin: "0 auto 18px", background: s.tile, borderRadius: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <VideoLoop src={s.video} style={{ width: 116, height: 116, objectFit: "cover", WebkitMaskImage: mask, maskImage: mask }} />
              </div>
              <h3 style={{ fontSize: 14.5, fontWeight: 600, margin: "0 0 10px" }}>{s.title}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "#6E6A5D", margin: 0, textWrap: "pretty" }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
