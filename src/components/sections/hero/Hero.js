"use client";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import SMSDemo from "@/components/shared/SMSDemo";
const Hero = () => {
  return (
    <section className="tj-banner-section-2 h10-hero section-gap-x" style={{
      position: 'relative',
      paddingTop: '60px', 
      paddingBottom: '80px',
      minHeight: '100vh',
      overflow: 'hidden',
    }}>
      {/* Background Image */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url(/images/hero/hero-bg-new.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 60%',
        backgroundRepeat: 'no-repeat',
        zIndex: 0,
      }} />
      
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="row align-items-center" style={{gap: '40px 0'}}>
          <div className="col-lg-6">
            <div className="banner-content-2">
              <h1 className="banner-title text-anim" style={{marginBottom: '24px'}}>
                <em>Onboard</em> Faster.<br/>
                Answer Instantly.
              </h1>
              <p className="wow fadeInUp" data-wow-delay=".4s" style={{
                color: '#1A1615aa',
                fontSize: '18px',
                lineHeight: '1.6',
                marginBottom: '32px',
                maxWidth: '480px',
              }}>
                The AI SMS assistant that lets frontline workers get instant answers via text or voice memo in any language—while detecting training gaps and saving managers hours each week.
              </p>
              <div
                className="banner-desc-area wow fadeInUp"
                data-wow-delay=".5s"
              >
                <ButtonPrimary text={"Book a Demo"} url={"https://cal.com/justin-so-xnr0oc/sidekick-demo"} />
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="wow fadeInRight" data-wow-delay=".5s" style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}>
              <SMSDemo />
              
              {/* Feature Pills */}
              <div style={{
                position: 'absolute',
                right: '-20px',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}>
                {/* Voice Memo Pill */}
                <div className="wow fadeInRight" data-wow-delay=".7s" style={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '16px',
                  padding: '14px 18px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  maxWidth: '180px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" y1="19" x2="12" y2="23"></line>
                      <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: '#1A1615' }}>Voice Memos</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#1A1615aa', margin: 0, lineHeight: '1.4' }}>
                    Speak questions instead of typing
                  </p>
                </div>

                {/* Multi-language Pill */}
                <div className="wow fadeInRight" data-wow-delay=".8s" style={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '16px',
                  padding: '14px 18px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  maxWidth: '180px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: '#1A1615' }}>10+ Languages</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#1A1615aa', margin: 0, lineHeight: '1.4' }}>
                    Spanish, Korean, Mandarin & more
                  </p>
                </div>

                {/* Learns Over Time Pill */}
                <div className="wow fadeInRight" data-wow-delay=".9s" style={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '16px',
                  padding: '14px 18px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  maxWidth: '180px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: '#1A1615' }}>Learns Over Time</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#1A1615aa', margin: 0, lineHeight: '1.4' }}>
                    From docs, voice memos & manager answers
                  </p>
                </div>

                {/* No App Required Pill */}
                <div className="wow fadeInRight" data-wow-delay="1s" style={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '16px',
                  padding: '14px 18px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  maxWidth: '180px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                      <line x1="12" y1="18" x2="12.01" y2="18"></line>
                    </svg>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: '#1A1615' }}>No App Needed</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#1A1615aa', margin: 0, lineHeight: '1.4' }}>
                    Works via SMS on any phone
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Hero;
