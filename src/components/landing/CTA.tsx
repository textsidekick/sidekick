import { ArrowIcon } from "@/components/landing/icons";

export default function CTA() {
  return (
    <section style={{ padding: "96px 24px 72px" }}>
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          color: "#F7F3EC",
          borderRadius: 32,
          padding: "80px 64px",
          background: "linear-gradient(135deg, #C96442 0%, #A74D30 100%)",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 48,
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-instrument), Georgia, serif",
              fontWeight: 400,
              fontSize: 56,
              lineHeight: 0.98,
              letterSpacing: "-0.025em",
              margin: "0 0 20px",
              color: "#F7F3EC",
            }}
          >
            Give your team a <em style={{ fontStyle: "italic" }}>Sidekick.</em>
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.5, margin: "0 auto 36px", maxWidth: 520, color: "rgba(247,243,236,0.9)" }}>
            Set up in 90 seconds. No app, no training, no per-seat pricing.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "#F7F3EC",
                color: "#1C1A16",
                padding: "16px 28px",
                borderRadius: 9999,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Get Started <ArrowIcon size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
