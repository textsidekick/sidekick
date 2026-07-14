import VideoLoop from "./VideoLoop";

const serif = "var(--font-instrument-serif), Georgia, serif";

/** Full-bleed video band with a single serif line. */
export default function VideoSliver({
  src,
  plain,
  italic,
  objectPosition,
}: {
  src: string;
  plain: string;
  italic: string;
  objectPosition?: string;
}) {
  return (
    <section style={{ position: "relative", height: 320, overflow: "hidden" }}>
      <VideoLoop src={src} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(20,18,12,0.45)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px", pointerEvents: "none" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap", justifyContent: "center", textAlign: "center" }}>
          <span style={{ fontFamily: serif, fontSize: 46, color: "#FFFFFF" }}>{plain}</span>
          <span style={{ fontFamily: serif, fontStyle: "italic", fontSize: 46, color: "#FFFFFF" }}>{italic}</span>
        </div>
      </div>
    </section>
  );
}
