
export const metadata = {
  title: "Privacy Policy | Sidekick",
  description: "Privacy Policy for Sidekick AI SMS Assistant",
};

export default function Privacy() {
  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 50, padding: "16px 24px", borderBottom: "1px solid rgba(28,26,22,0.06)", background: "rgba(247,243,236,0.95)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", gap: 10 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "#1C1A16" }}><span style={{ fontSize: 16, fontWeight: 600 }}>← Sidekick</span></a></div>
      
      <main style={{ paddingTop: '120px', paddingBottom: '60px', minHeight: '100vh', background: '#F7F3EC' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              {/* Header */}
              <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '48px', fontWeight: '700', color: '#1A1615', marginBottom: '16px', fontFamily: 'var(--tj-ff-heading)' }}>
                  Privacy Policy
                </h1>
                <p style={{ color: '#1A1615aa', fontSize: '16px' }}>Last updated: January 1, 2026</p>
              </div>

              {/* Content Card */}
              <div style={{
                background: '#fff',
                borderRadius: '24px',
                padding: '48px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid #eee',
              }}>
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', marginBottom: '32px' }}>
                  Sidekick AI Inc. ("Sidekick," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered onboarding assistant service.
                </p>

                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginTop: '40px', marginBottom: '20px' }}>1. Information We Collect</h2>
                
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1A1615', marginTop: '24px', marginBottom: '12px' }}>Information You Provide</h3>
                <ul style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', paddingLeft: '24px', marginBottom: '16px' }}>
                  <li>Contact information (name, email, phone number)</li>
                  <li>Company information (company name, size, industry)</li>
                  <li>Questions and messages sent through our SMS or web chat service</li>
                  <li>Documents uploaded to our platform (employee handbooks, SOPs, etc.)</li>
                </ul>

                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1A1615', marginTop: '24px', marginBottom: '12px' }}>Information Collected Automatically</h3>
                <ul style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', paddingLeft: '24px', marginBottom: '16px' }}>
                  <li>Device information (device type, operating system)</li>
                  <li>Usage data (questions asked, features used, interaction patterns)</li>
                  <li>Log data (IP address, browser type, access times)</li>
                </ul>

                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginTop: '40px', marginBottom: '20px' }}>2. How We Use Your Information</h2>
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>We use the information we collect to:</p>
                <ul style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', paddingLeft: '24px', marginBottom: '16px' }}>
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process and respond to questions via SMS and web chat</li>
                  <li>Generate AI-powered insights and recommendations</li>
                  <li>Communicate with you about our services</li>
                  <li>Analyze usage patterns to improve user experience</li>
                  <li>Comply with legal obligations</li>
                </ul>

                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginTop: '40px', marginBottom: '20px' }}>3. Information Sharing</h2>
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
                  We do not sell your personal information. We may share your information with:
                </p>
                <ul style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', paddingLeft: '24px', marginBottom: '16px' }}>
                  <li><strong>Service Providers:</strong> Third parties who help us operate our services (cloud hosting, SMS providers, analytics)</li>
                  <li><strong>Your Employer:</strong> If you use Sidekick through your employer, certain usage data may be shared with them</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                </ul>

                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginTop: '40px', marginBottom: '20px' }}>4. Data Security</h2>
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
                  We implement industry-standard security measures to protect your information, including:
                </p>
                <ul style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', paddingLeft: '24px', marginBottom: '16px' }}>
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and audits</li>
                  <li>Access controls and authentication measures</li>
                  <li>SOC 2 Type II compliance (in progress)</li>
                </ul>

                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginTop: '40px', marginBottom: '20px' }}>5. Data Retention</h2>
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
                  We retain your information for as long as necessary to provide our services and fulfill the purposes described in this policy. When data is no longer needed, we securely delete or anonymize it.
                </p>

                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginTop: '40px', marginBottom: '20px' }}>6. Your Rights</h2>
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>Depending on your location, you may have the right to:</p>
                <ul style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', paddingLeft: '24px', marginBottom: '16px' }}>
                  <li>Access the personal information we hold about you</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Opt out of certain data processing activities</li>
                  <li>Data portability</li>
                </ul>

                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginTop: '40px', marginBottom: '20px' }}>7. California Privacy Rights (CCPA)</h2>
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
                  California residents have additional rights under the CCPA, including the right to know what personal information we collect and how it's used, the right to delete personal information, and the right to opt-out of the sale of personal information (note: we do not sell personal information).
                </p>

                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginTop: '40px', marginBottom: '20px' }}>8. Children's Privacy</h2>
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
                  Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.
                </p>

                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginTop: '40px', marginBottom: '20px' }}>9. Changes to This Policy</h2>
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
                </p>

                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginTop: '40px', marginBottom: '20px' }}>10. Contact Us</h2>
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <div style={{
                  background: '#F5F3F0',
                  borderRadius: '16px',
                  padding: '24px',
                  color: '#1A1615cc',
                  fontSize: '16px',
                  lineHeight: '1.8',
                }}>
                  <p style={{ margin: 0 }}><strong>Sidekick AI Inc.</strong></p>
                  <p style={{ margin: '8px 0' }}>Email: <a href="mailto:hello@textsidekick.com" style={{ color: '#C96442' }}>hello@textsidekick.com</a></p>
                  <p style={{ margin: 0 }}>Santa Clara, CA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div style={{ textAlign: "center", padding: "40px 20px", borderTop: "1px solid rgba(28,26,22,0.1)" }}><a href="/" style={{ color: "#C96442", textDecoration: "none", fontWeight: 500 }}>← Back to Sidekick</a></div>
    </div>
  );
}
