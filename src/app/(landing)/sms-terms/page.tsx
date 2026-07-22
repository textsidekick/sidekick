
export const metadata = {
  title: "SMS Terms | Sidekick",
  description: "SMS Terms and Conditions for Sidekick AI SMS Assistant",
};

export default function SMSTerms() {
  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 50, padding: "16px 24px", borderBottom: "1px solid rgba(28,26,22,0.06)", background: "rgba(247,243,236,0.95)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", gap: 10 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "#1C1A16" }}><span style={{ fontSize: 16, fontWeight: 600 }}>← Sidekick</span></a></div>
      
      <main style={{ paddingTop: '80px', paddingBottom: '60px', minHeight: '100vh', background: '#F7F3EC' }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
          <div>
            <div>
              <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '48px', fontWeight: '700', color: '#1A1615', marginBottom: '16px', fontFamily: 'var(--tj-ff-heading)' }}>
                  SMS Terms & Conditions
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
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', marginBottom: '32px' }}>
                  These SMS Terms and Conditions govern your use of Sidekick's SMS messaging service.
                </p>

                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginTop: '40px', marginBottom: '20px' }}>1. SMS Service Description</h2>
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
                  Sidekick provides an SMS-based Q&A service that allows employees to text questions and receive AI-powered answers from their company's knowledge base.
                </p>

                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginTop: '40px', marginBottom: '20px' }}>2. Message Frequency</h2>
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
                  Message frequency varies based on your usage. You will receive responses to your questions and occasional service updates.
                </p>

                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginTop: '40px', marginBottom: '20px' }}>3. Message and Data Rates</h2>
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
                  Message and data rates may apply. Please contact your wireless carrier for details about your messaging plan.
                </p>

                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginTop: '40px', marginBottom: '20px' }}>4. Opt-Out Instructions</h2>
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
                  You can opt out of SMS messages at any time by texting STOP to our number. You will receive a confirmation message and no further messages will be sent.
                </p>

                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginTop: '40px', marginBottom: '20px' }}>5. Help</h2>
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
                  For help, text HELP to our number or contact us at hello@textsidekick.com.
                </p>

                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginTop: '40px', marginBottom: '20px' }}>6. Supported Carriers</h2>
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
                  Our SMS service is supported on all major US carriers including AT&T, Verizon, T-Mobile, and Sprint.
                </p>

                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginTop: '40px', marginBottom: '20px' }}>7. Privacy</h2>
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
                  Your privacy is important to us. Please review our <a href="/privacy" style={{ color: '#0060F0' }}>Privacy Policy</a> for information on how we handle your data.
                </p>

                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginTop: '40px', marginBottom: '20px' }}>8. Contact Us</h2>
                <div style={{
                  background: '#F5F3F0',
                  borderRadius: '16px',
                  padding: '24px',
                  color: '#1A1615cc',
                  fontSize: '16px',
                  lineHeight: '1.8',
                }}>
                  <p style={{ margin: 0 }}><strong>Sidekick AI Inc.</strong></p>
                  <p style={{ margin: '8px 0' }}>Email: <a href="mailto:hello@textsidekick.com" style={{ color: '#0060F0' }}>hello@textsidekick.com</a></p>
                  <p style={{ margin: 0 }}>SMS Support: Text HELP to +1 (888) 707-4659</p>
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
