export const metadata = {
  title: "Terms of Service | Sidekick",
  description: "Terms of Service for Sidekick AI manufacturing operations platform",
};

export default function Terms() {
  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#F8F9FC", minHeight: "100vh" }}>
      {/* Nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, padding: "16px 24px", borderBottom: "1px solid rgba(28,26,22,0.08)", background: "rgba(247,243,236,0.96)", backdropFilter: "blur(12px)" }}>
        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", color: "#111827", fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", opacity: 0.85, transition: "opacity 0.15s" }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>←</span> Sidekick
        </a>
      </div>

      <main style={{ paddingTop: "72px", paddingBottom: "80px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
          {/* Header */}
          <div style={{ marginBottom: "48px" }}>
            <h1 style={{ fontSize: "clamp(36px, 5vw, 52px)", fontWeight: 700, color: "#111827", marginBottom: "12px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Terms of Service
            </h1>
            <p style={{ color: "rgba(28,26,22,0.5)", fontSize: "15px", margin: 0 }}>Last updated: January 1, 2026</p>
          </div>

          {/* Body */}
          <div style={{ color: "rgba(28,26,22,0.7)", fontSize: "16px", lineHeight: "1.8" }}>
            <p style={{ marginBottom: "32px" }}>
              Welcome to Sidekick. These Terms of Service ("Terms") govern your use of the Sidekick AI-powered manufacturing operations platform operated by Sidekick AI Inc. ("Sidekick," "we," "us," or "our").
            </p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "48px", marginBottom: "16px", letterSpacing: "-0.02em" }}>1. Acceptance of Terms</h2>
            <p>
              By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
            </p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "48px", marginBottom: "16px", letterSpacing: "-0.02em" }}>2. Description of Service</h2>
            <p style={{ marginBottom: "12px" }}>
              Sidekick provides an AI-powered manufacturing operations platform that helps frontline workers and managers streamline operations, access instant answers, and improve productivity. Our service includes:
            </p>
            <ul style={{ paddingLeft: "22px", marginBottom: "16px" }}>
              <li>SMS and voice memo Q&amp;A functionality</li>
              <li>Multi-language support</li>
              <li>Manager analytics dashboard</li>
              <li>Document processing and knowledge base management</li>
            </ul>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "48px", marginBottom: "16px", letterSpacing: "-0.02em" }}>3. User Accounts</h2>
            <p>
              When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding your account and for all activities that occur under your account.
            </p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "48px", marginBottom: "16px", letterSpacing: "-0.02em" }}>4. Acceptable Use</h2>
            <p style={{ marginBottom: "12px" }}>You agree not to:</p>
            <ul style={{ paddingLeft: "22px", marginBottom: "16px" }}>
              <li>Use the service for any unlawful purpose</li>
              <li>Upload malicious content or attempt to compromise our systems</li>
              <li>Impersonate others or provide false information</li>
              <li>Interfere with or disrupt the service</li>
              <li>Attempt to reverse engineer our AI systems</li>
            </ul>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "48px", marginBottom: "16px", letterSpacing: "-0.02em" }}>5. Intellectual Property</h2>
            <p>
              The service and its original content, features, and functionality are owned by Sidekick AI Inc. and are protected by international copyright, trademark, and other intellectual property laws.
            </p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "48px", marginBottom: "16px", letterSpacing: "-0.02em" }}>6. User Content</h2>
            <p>
              You retain ownership of content you upload to Sidekick. By uploading content, you grant us a license to use, process, and analyze it solely for the purpose of providing our services to you.
            </p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "48px", marginBottom: "16px", letterSpacing: "-0.02em" }}>7. Limitation of Liability</h2>
            <p>
              Sidekick AI Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.
            </p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "48px", marginBottom: "16px", letterSpacing: "-0.02em" }}>8. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice, for any reason, including breach of these Terms.
            </p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "48px", marginBottom: "16px", letterSpacing: "-0.02em" }}>9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any changes by updating the "Last updated" date.
            </p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "48px", marginBottom: "16px", letterSpacing: "-0.02em" }}>10. Contact Us</h2>
            <p style={{ marginBottom: "16px" }}>If you have any questions about these Terms, please contact us at:</p>
            <div style={{ borderLeft: "3px solid #0060F0", paddingLeft: "20px", marginTop: "16px" }}>
              <p style={{ margin: 0, fontWeight: 600, color: "#111827" }}>Sidekick AI Inc.</p>
              <p style={{ margin: "6px 0 0" }}>Email: <a href="mailto:hello@textsidekick.com" style={{ color: "#0060F0", textDecoration: "none" }}>hello@textsidekick.com</a></p>
              <p style={{ margin: "4px 0 0" }}>San Francisco, CA</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "32px 20px", borderTop: "1px solid rgba(28,26,22,0.08)" }}>
        <a href="/" style={{ color: "#0060F0", textDecoration: "none", fontWeight: 500, fontSize: "15px" }}>← Back to Sidekick</a>
        <p style={{ color: "rgba(28,26,22,0.4)", fontSize: "13px", margin: "12px 0 0" }}>© 2026 Sidekick AI Inc.</p>
      </div>
    </div>
  );
}
