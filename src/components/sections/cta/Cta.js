const Cta = () => {
  return (
    <section className="tj-cta-section section-gap" style={{
      background: 'transparent',
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12">
            <div style={{
              background: 'linear-gradient(180deg, #8BB8E0 0%, #A8C8E8 20%, #B8D0E8 40%, #D0DCE4 60%, #E4E0DC 80%, #F2E6D9 100%)',
              borderRadius: '32px',
              padding: '80px 40px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <h2 style={{
                color: '#1A1615',
                fontSize: '48px',
                fontWeight: '700',
                marginBottom: '20px',
                fontFamily: 'var(--tj-ff-heading)',
              }}>
                Ready to transform your onboarding?
              </h2>
              <p style={{color: '#1A1615cc', marginBottom: '30px', fontSize: '18px'}}>
                Book a 15-minute demo and see Sidekick in action.
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
                  transition: 'all 0.3s ease'
                }}
              >
                Book a Demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Cta;
