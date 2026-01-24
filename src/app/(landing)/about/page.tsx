import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";
import Image from "next/image";

export const metadata = {
  title: "About | Sidekick",
  description: "Learn about Sidekick - the AI SMS assistant for frontline workers",
};

export default function About() {
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
                  About Sidekick
                </h1>
                <p style={{ color: '#1A1615aa', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
                  We're on a mission to help every frontline worker get the answers they need, when they need them.
                </p>
              </div>

              <div style={{
                background: '#fff',
                borderRadius: '24px',
                padding: '48px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid #eee',
                marginBottom: '32px',
              }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginBottom: '20px' }}>Our Story</h2>
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', marginBottom: '24px' }}>
                  Sidekick was born from a simple observation: 80% of the workforce doesn't sit at a desk, yet most workplace tools are built for office workers. Frontline workers in manufacturing, retail, and logistics are constantly interrupting managers with the same questions. Paper handbooks get lost. Training videos get skipped. And turnover keeps climbing.
                </p>
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8', marginBottom: '24px' }}>
                  We built Sidekick to change that. Our AI-powered SMS assistant lets workers text their questions and get instant, accurate answers from company documents—in any language, 24/7. No app downloads, no training required.
                </p>
              </div>

              <div style={{
                background: '#fff',
                borderRadius: '24px',
                padding: '48px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid #eee',
                marginBottom: '32px',
              }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1615', marginBottom: '20px' }}>Our Mission</h2>
                <p style={{ color: '#1A1615cc', fontSize: '16px', lineHeight: '1.8' }}>
                  To empower every frontline worker with instant access to the knowledge they need to succeed—regardless of language, location, or technical ability.
                </p>
              </div>

              <div style={{
                background: 'linear-gradient(180deg, #8BB8E0 0%, #B8D0E8 50%, #F2E6D9 100%)',
                borderRadius: '24px',
                padding: '48px',
                textAlign: 'center',
              }}>
                <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1A1615', marginBottom: '16px', fontFamily: 'var(--tj-ff-heading)' }}>
                  Ready to see Sidekick in action?
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
