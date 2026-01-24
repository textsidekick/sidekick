import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <footer style={{
      padding: '60px 0 30px',
      marginTop: '60px',
    }}>
      <div className="container">
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          borderRadius: '32px',
          padding: '50px',
          marginBottom: '30px',
          backdropFilter: 'blur(10px)',
        }}>
          <div className="row">
            <div className="col-lg-3 col-md-6" style={{marginBottom: '30px'}}>
              <Link href="/" style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', textDecoration: 'none'}}>
                <Image 
                  src="/images/logo/sidekick-logo.png" 
                  alt="Sidekick Logo" 
                  width={32} 
                  height={32}
                  style={{objectFit: 'contain'}}
                />
                <span style={{fontSize: '20px', fontWeight: '600', color: '#1A1615'}}>Sidekick</span>
              </Link>
              <p style={{color: '#1A1615aa', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px', maxWidth: '250px'}}>
                The AI SMS assistant that helps frontline workers get instant answers in any language.
              </p>
              <div style={{display: 'flex', gap: '10px'}}>
                <a href="https://www.linkedin.com/" target="_blank" style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#1A1615',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  textDecoration: 'none',
                }}>
                  <i className="fa-brands fa-linkedin-in" style={{fontSize: '14px'}}></i>
                </a>
                <a href="https://x.com/" target="_blank" style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#1A1615',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  textDecoration: 'none',
                }}>
                  <i className="fa-brands fa-x-twitter" style={{fontSize: '14px'}}></i>
                </a>
              </div>
            </div>

            <div className="col-lg-2 col-md-3 col-6" style={{marginBottom: '30px'}}>
              <h6 style={{color: '#1A1615', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px'}}>Pages</h6>
              <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                <li style={{marginBottom: '12px'}}>
                  <Link href="/" style={{color: '#1A1615aa', textDecoration: 'none', fontSize: '14px'}}>Home</Link>
                </li>
                <li style={{marginBottom: '12px'}}>
                  <Link href="/about" style={{color: '#1A1615aa', textDecoration: 'none', fontSize: '14px'}}>About</Link>
                </li>
                <li style={{marginBottom: '12px'}}>
                  <Link href="/contact" style={{color: '#1A1615aa', textDecoration: 'none', fontSize: '14px'}}>Contact</Link>
                </li>
              </ul>
            </div>

            <div className="col-lg-2 col-md-3 col-6" style={{marginBottom: '30px'}}>
              <h6 style={{color: '#1A1615', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px'}}>Legal</h6>
              <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                <li style={{marginBottom: '12px'}}>
                  <Link href="/privacy" style={{color: '#1A1615aa', textDecoration: 'none', fontSize: '14px'}}>Privacy Policy</Link>
                </li>
                <li style={{marginBottom: '12px'}}>
                  <Link href="/terms" style={{color: '#1A1615aa', textDecoration: 'none', fontSize: '14px'}}>Terms of Service</Link>
                </li>
                <li style={{marginBottom: '12px'}}>
                  <Link href="/sms-terms" style={{color: '#1A1615aa', textDecoration: 'none', fontSize: '14px'}}>SMS Terms</Link>
                </li>
                <li style={{marginBottom: '12px'}}>
                  <Link href="/sms-consent" style={{color: '#1A1615aa', textDecoration: 'none', fontSize: '14px'}}>SMS Consent</Link>
                </li>
              </ul>
            </div>

            <div className="col-lg-2 col-md-3 col-6" style={{marginBottom: '30px'}}>
              <h6 style={{color: '#1A1615', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px'}}>Product</h6>
              <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                <li style={{marginBottom: '12px'}}>
                  <a href="/manager" style={{color: '#1A1615aa', textDecoration: 'none', fontSize: '14px'}}>Manager Portal</a>
                </li>
                <li style={{marginBottom: '12px'}}>
                  <a href="/onboarding" style={{color: '#1A1615aa', textDecoration: 'none', fontSize: '14px'}}>Onboarding</a>
                </li>
              </ul>
            </div>

            <div className="col-lg-3 col-md-6" style={{marginBottom: '30px'}}>
              <h6 style={{color: '#1A1615', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px'}}>Get Started</h6>
              <p style={{color: '#1A1615aa', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px'}}>
                Book a 15-minute demo and see Sidekick in action.
              </p>
              <a 
                href="https://cal.com/justin-so-xnr0oc/sidekick-demo" 
                target="_blank"
                style={{
                  backgroundColor: '#1A1615',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '24px',
                  fontWeight: '500',
                  fontSize: '14px',
                  display: 'inline-block',
                  textDecoration: 'none'
                }}
              >
                Book a Demo
              </a>
            </div>
          </div>

          <div style={{borderTop: '1px solid rgba(26, 22, 21, 0.1)', marginTop: '20px', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
            <p style={{color: '#1A1615aa', fontSize: '13px', margin: 0}}>
              © 2025 Sidekick. All rights reserved.
            </p>
            <p style={{color: '#1A1615aa', fontSize: '13px', margin: 0}}>
              hello@textsidekick.com
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
