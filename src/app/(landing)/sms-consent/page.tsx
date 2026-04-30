
export const metadata = {
  title: "SMS Consent | Sidekick",
  description: "SMS Consent Information for Sidekick AI SMS Assistant",
};

export default function SMSConsent() {
  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 50, padding: "16px 24px", borderBottom: "1px solid rgba(28,26,22,0.06)", background: "rgba(247,243,236,0.95)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", gap: 10 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "#1C1A16" }}><span style={{ fontSize: 16, fontWeight: 600 }}>← Sidekick</span></a></div>
      
      <main style={{ paddingTop: '120px', paddingBottom: '60px', minHeight: '100vh', background: '#F7F3EC' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '48px', fontWeight: '700', color: '#1A1615', marginBottom: '16px', fontFamily: 'var(--tj-ff-heading)' }}>
                  SMS Consent
                </h1>
                <p style={{ color: '#1A1615aa', fontSize: '16px' }}>Last updated: January 1, 2026</p>
              </div>

              <div style={{
                background: '#fff',
                borderRadius: '24px',
                padding: '48px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid #eee',
              }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginTop: '0', marginBottom: '20px' }}>Your Consent to Receive SMS Messages</h2>
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', marginBottom: '24px' }}>
                  By providing your phone number and opting in to Sidekick's SMS service, you consent to receive text messages from Sidekick AI Inc. related to:
                </p>
                <ul style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', paddingLeft: '24px', marginBottom: '24px' }}>
                  <li>Responses to your workplace questions</li>
                  <li>Service notifications and updates</li>
                  <li>Account-related information</li>
                </ul>

                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginTop: '40px', marginBottom: '20px' }}>How to Opt In</h2>
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
                  You can opt in to receive SMS messages by:
                </p>
                <ul style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', paddingLeft: '24px', marginBottom: '24px' }}>
                  <li>Texting your first question to our Sidekick number</li>
                  <li>Being enrolled by your employer through our platform</li>
                  <li>Signing up through our website</li>
                </ul>

                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginTop: '40px', marginBottom: '20px' }}>How to Opt Out</h2>
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
                  You can opt out at any time by texting <strong>STOP</strong> to our number. You will receive a confirmation message and will no longer receive SMS messages from Sidekick.
                </p>

                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginTop: '40px', marginBottom: '20px' }}>Message Frequency & Rates</h2>
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
                  Message frequency varies based on your usage. Standard message and data rates may apply according to your wireless carrier's plan.
                </p>

                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginTop: '40px', marginBottom: '20px' }}>Privacy</h2>
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
                  We respect your privacy. Your phone number and message content will be handled according to our <a href="/privacy" style={{ color: '#C96442' }}>Privacy Policy</a>. We do not sell your information to third parties.
                </p>

                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginTop: '40px', marginBottom: '20px' }}>Contact Us</h2>
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
                  <p style={{ margin: 0 }}>For SMS help, text HELP to +1 (888) 707-4659</p>
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
