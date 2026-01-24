import Link from "next/link";
import Image from "next/image";

const MobileMenu = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
	const handleClick = () => {
		setIsMobileMenuOpen(false);
	};
	return (
		<>
			<div
				className={`body-overlay ${isMobileMenuOpen ? "opened" : ""}`}
				onClick={handleClick}
			></div>
			<div
				className={`hamburger-area d-lg-none ${
					isMobileMenuOpen ? "opened" : ""
				}`}
			>
				<div className="hamburger_bg"></div>
				<div className="hamburger_wrapper">
					<div className="hamburger_inner">
						<div className="hamburger_top d-flex align-items-center justify-content-between">
							<div className="hamburger_logo">
								<Link href="/" className="mobile_logo" onClick={handleClick}>
									<Image 
										src="/images/logo/sidekick-logo.png" 
										alt="Sidekick Logo" 
										width={32} 
										height={32}
									/>
								</Link>
							</div>
							<div className="hamburger_close">
								<button className="hamburger_close_btn" onClick={handleClick}>
									<i className="fa-thin fa-times"></i>
								</button>
							</div>
						</div>
						
						{/* Simple Navigation */}
						<nav className="mobile-nav" style={{ padding: '30px 0' }}>
							<ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
								<li style={{ marginBottom: '20px' }}>
									<a 
										href="/#how-it-works" 
										onClick={handleClick}
										style={{ fontSize: '18px', color: '#1A1615', textDecoration: 'none', fontWeight: '500' }}
									>
										How it works
									</a>
								</li>
								<li style={{ marginBottom: '20px' }}>
									<Link 
										href="/about" 
										onClick={handleClick}
										style={{ fontSize: '18px', color: '#1A1615', textDecoration: 'none', fontWeight: '500' }}
									>
										About
									</Link>
								</li>
								<li style={{ marginBottom: '20px' }}>
									<Link 
										href="/contact" 
										onClick={handleClick}
										style={{ fontSize: '18px', color: '#1A1615', textDecoration: 'none', fontWeight: '500' }}
									>
										Contact
									</Link>
								</li>
								<li style={{ marginBottom: '20px' }}>
									<Link 
										href="/privacy" 
										onClick={handleClick}
										style={{ fontSize: '18px', color: '#1A1615', textDecoration: 'none', fontWeight: '500' }}
									>
										Privacy Policy
									</Link>
								</li>
								<li style={{ marginBottom: '20px' }}>
									<Link 
										href="/terms" 
										onClick={handleClick}
										style={{ fontSize: '18px', color: '#1A1615', textDecoration: 'none', fontWeight: '500' }}
									>
										Terms of Service
									</Link>
								</li>
							</ul>
						</nav>

						<div className="hamburger-infos">
							<h5 className="hamburger-title">Contact Info</h5>
							<div className="contact-info">
								<div className="contact-item">
									<span className="subtitle">Phone</span>
									<Link className="contact-link" href="tel:+18887074659">
										+1 (888) 707-4659
									</Link>
								</div>
								<div className="contact-item">
									<span className="subtitle">Email</span>
									<Link className="contact-link" href="mailto:hello@textsidekick.com">
										hello@textsidekick.com
									</Link>
								</div>
								<div className="contact-item">
									<span className="subtitle">Location</span>
									<span className="contact-link">
										Santa Clara, CA
									</span>
								</div>
							</div>
						</div>
						
						{/* Book Demo Button */}
						<div style={{ padding: '20px 0' }}>
							<a 
								href="https://cal.com/justin-so-xnr0oc/sidekick-demo"
								target="_blank"
								style={{
									display: 'block',
									backgroundColor: '#1A1615',
									color: '#ffffff',
									padding: '16px 24px',
									borderRadius: '30px',
									fontWeight: '600',
									textAlign: 'center',
									textDecoration: 'none',
								}}
							>
								Book a Demo
							</a>
						</div>
					</div>
					<div className="hamburger-socials">
						<h5 className="hamburger-title">Follow Us</h5>
						<div className="social-links style-3">
							<ul>
								<li>
									<Link href="https://www.linkedin.com/" target="_blank">
										<i className="fa-brands fa-linkedin-in"></i>
									</Link>
								</li>
								<li>
									<Link href="https://x.com/" target="_blank">
										<i className="fa-brands fa-x-twitter"></i>
									</Link>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
export default MobileMenu;
