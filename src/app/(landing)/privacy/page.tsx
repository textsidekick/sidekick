export const metadata = {
  title: "Privacy Policy | Sidekick",
  description: "Privacy Policy for Sidekick AI manufacturing operations platform",
};

export default function Privacy() {
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
              Privacy Policy
            </h1>
            <p style={{ color: "rgba(28,26,22,0.5)", fontSize: "15px", margin: 0 }}>Last updated: January 1, 2026</p>
          </div>

          {/* Body */}
          <div style={{ color: "rgba(28,26,22,0.7)", fontSize: "16px", lineHeight: "1.8" }}>
            <p style={{ marginBottom: "32px" }}>
              Sidekick AI Inc. ("Sidekick," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered manufacturing operations platform.
            </p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "48px", marginBottom: "16px", letterSpacing: "-0.02em" }}>1. Information We Collect</h2>

            <h3 style={{ fontSize: "17px", fontWeight: 600, color: "#111827", marginTop: "24px", marginBottom: "10px" }}>Information You Provide</h3>
            <ul style={{ paddingLeft: "22px", marginBottom: "16px" }}>
              <li>Contact information (name, email, phone number)</li>
              <li>Company information (company name, size, industry)</li>
              <li>Questions and messages sent through our SMS or web chat service</li>
              <li>Documents uploaded to our platform (employee handbooks, SOPs, etc.)</li>
            </ul>

            <h3 style={{ fontSize: "17px", fontWeight: 600, color: "#111827", marginTop: "24px", marginBottom: "10px" }}>Information Collected Automatically</h3>
            <ul style={{ paddingLeft: "22px", marginBottom: "16px" }}>
              <li>Device information (device type, operating system)</li>
              <li>Usage data (questions asked, features used, interaction patterns)</li>
              <li>Log data (IP address, browser type, access times)</li>
            </ul>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "48px", marginBottom: "16px", letterSpacing: "-0.02em" }}>2. How We Use Your Information</h2>
            <p style={{ marginBottom: "12px" }}>We use the information we collect to:</p>
            <ul style={{ paddingLeft: "22px", marginBottom: "16px" }}>
              <li>Provide, maintain, and improve our services</li>
              <li>Process and respond to questions via SMS and web chat</li>
              <li>Generate AI-powered insights and recommendations</li>
              <li>Communicate with you about our services</li>
              <li>Analyze usage patterns to improve user experience</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "48px", marginBottom: "16px", letterSpacing: "-0.02em" }}>3. Information Sharing</h2>
            <p style={{ marginBottom: "12px" }}>We do not sell your personal information. We may share your information with:</p>
            <ul style={{ paddingLeft: "22px", marginBottom: "16px" }}>
              <li><strong style={{ color: "#111827", fontWeight: 600 }}>Service Providers:</strong> Third parties who help us operate our services (cloud hosting, SMS providers, analytics)</li>
              <li><strong style={{ color: "#111827", fontWeight: 600 }}>Your Employer:</strong> If you use Sidekick through your employer, certain usage data may be shared with them</li>
              <li><strong style={{ color: "#111827", fontWeight: 600 }}>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "48px", marginBottom: "16px", letterSpacing: "-0.02em" }}>4. Data Security</h2>
            <p style={{ marginBottom: "12px" }}>We implement industry-standard security measures to protect your information, including:</p>
            <ul style={{ paddingLeft: "22px", marginBottom: "16px" }}>
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and audits</li>
              <li>Access controls and authentication measures</li>
              <li>SOC 2 Type II compliance (in progress)</li>
            </ul>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "48px", marginBottom: "16px", letterSpacing: "-0.02em" }}>5. Data Retention</h2>
            <p>
              We retain your information for as long as necessary to provide our services and fulfill the purposes described in this policy. When data is no longer needed, we securely delete or anonymize it.
            </p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "48px", marginBottom: "16px", letterSpacing: "-0.02em" }}>6. Your Rights</h2>
            <p style={{ marginBottom: "12px" }}>Depending on your location, you may have the right to:</p>
            <ul style={{ paddingLeft: "22px", marginBottom: "16px" }}>
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt out of certain data processing activities</li>
              <li>Data portability</li>
            </ul>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "48px", marginBottom: "16px", letterSpacing: "-0.02em" }}>7. California Privacy Rights (CCPA)</h2>
            <p>
              California residents have additional rights under the CCPA, including the right to know what personal information we collect and how it's used, the right to delete personal information, and the right to opt-out of the sale of personal information (note: we do not sell personal information).
            </p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "48px", marginBottom: "16px", letterSpacing: "-0.02em" }}>8. Children's Privacy</h2>
            <p>
              Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.
            </p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "48px", marginBottom: "16px", letterSpacing: "-0.02em" }}>9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "48px", marginBottom: "16px", letterSpacing: "-0.02em" }}>10. Contact Us</h2>
            <p style={{ marginBottom: "16px" }}>If you have any questions about this Privacy Policy, please contact us at:</p>
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
