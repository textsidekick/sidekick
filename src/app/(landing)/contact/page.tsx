import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";

export const metadata = {
  title: "Contact | Sidekick",
  description: "Get in touch with the Sidekick team",
};

export default function Contact() {
  return (
    <div>
      <Header headerType={10} />
      <Header headerType={10} isStickyHeader={true} />
      
      <main style={{ paddingTop: '120px', paddingBottom: '60px', minHeight: '100vh', background: 'linear-gradient(180deg, #F5F3F0 0%, #ffffff 100%)' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '48px', fontWeight: '700', color: '#1A1615', marginBottom: '16px', fontFamily: 'var(--tj-ff-heading)' }}>
                  Contact Us
                </h1>
                <p style={{ color: '#1A1615aa', fontSize: '18px' }}>
                  Have questions? We'd love to hear from you.
                </p>
              </div>

              <div className="row">
                <div className="col-md-6" style={{ marginBottom: '24px' }}>
                  <div style={{
                    background: '#fff',
                    borderRadius: '24px',
                    padding: '32px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    border: '1px solid #eee',
                    height: '100%',
                  }}>
                    <div style={{ 
                      width: '56px', 
                      height: '56px', 
                      backgroundColor: '#EFF6FF', 
                      borderRadius: '16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      marginBottom: '16px' 
                    }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1A1615', marginBottom: '8px' }}>Email Us</h3>
                    <p style={{ color: '#1A1615cc', fontSize: '16px', marginBottom: '16px' }}>
                      For general inquiries and support
                    </p>
                    <a href="mailto:hello@textsidekick.com" style={{ color: '#3B82F6', fontWeight: '500' }}>
                      hello@textsidekick.com
                    </a>
                  </div>
                </div>
                
                <div className="col-md-6" style={{ marginBottom: '24px' }}>
                  <div style={{
                    background: '#fff',
                    borderRadius: '24px',
                    padding: '32px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    border: '1px solid #eee',
                    height: '100%',
                  }}>
                    <div style={{ 
                      width: '56px', 
                      height: '56px', 
                      backgroundColor: '#EFF6FF', 
                      borderRadius: '16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      marginBottom: '16px' 
                    }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1A1615', marginBottom: '8px' }}>Book a Demo</h3>
                    <p style={{ color: '#1A1615cc', fontSize: '16px', marginBottom: '16px' }}>
                      See Sidekick in action
                    </p>
                    <a href="https://cal.com/justin-so-xnr0oc/sidekick-demo" target="_blank" style={{ color: '#3B82F6', fontWeight: '500' }}>
                      Schedule a call →
                    </a>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(180deg, #8BB8E0 0%, #B8D0E8 50%, #F2E6D9 100%)',
                borderRadius: '24px',
                padding: '48px',
                textAlign: 'center',
                marginTop: '24px',
              }}>
                <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1A1615', marginBottom: '16px', fontFamily: 'var(--tj-ff-heading)' }}>
                  Ready to get started?
                </h2>
                <p style={{ color: '#1A1615cc', fontSize: '16px', marginBottom: '24px' }}>
                  Book a 15-minute demo and see how Sidekick can transform your onboarding.
                </p>
                <a 
                  href="https://cal.com/justin-so-xnr0oc/sidekick-demo" 
                  target="_blank"
                  style={{
                    backgroundColor: '#1A1615',
                    color: '#ffffff',
                    padding: '16px 32px',
                    borderRadius: '32px',
                    fontWeight: '600',
                    display: 'inline-block',
                    textDecoration: 'none',
                  }}
                >
                  Book a Demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
