"use client";

const SidekickTestimonials = () => {
	const testimonials = [
		{
			quote: "Sidekick cut our onboarding time in half. New hires used to interrupt managers constantly with the same questions—now they just text and get instant answers. It's been a game-changer for productivity.",
			name: "Chris Kim",
			title: "Owner, EDS Manufacturing",
			logo: "/images/testimonial/eds-logo.png"
		},
		{
			quote: "Our employees speak five different languages. Before Sidekick, training was a nightmare—we'd have to translate everything or find bilingual supervisors. Now everyone just texts in their own language and gets help instantly.",
			name: "Kishore Muvva",
			title: "Owner, Trinethra Supermarket",
			logo: "/images/testimonial/trinethra-logo.png"
		},
		{
			quote: "The gap detection feature is incredible. Sidekick showed us that 40% of questions were about our PTO policy—turns out our handbook was confusing. We fixed it in a day and those questions dropped to near zero.",
			name: "Jim Falk",
			title: "Owner, Jim Falk Motors",
			logo: "/images/testimonial/jfm-logo.png"
		}
	];

	return (
		<section className="section-gap">
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-12">
						<div className="sec-heading style-3 sec-heading-centered" style={{ marginBottom: '50px' }}>
							<span className="sub-title wow fadeInUp" data-wow-delay=".3s" style={{ color: '#1A1615' }}>
								<i className="tji-box" style={{ color: '#1A1615' }}></i>What Our Customers Say
							</span>
							<h2 className="sec-title title-anim" style={{ color: '#1A1615' }}>
								Trusted by Frontline Teams Everywhere.
							</h2>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-12">
						<div
							style={{
								display: 'grid',
								gridTemplateColumns: 'repeat(3, 1fr)',
								gap: '30px',
							}}
						>
							{testimonials.map((testimonial, idx) => (
								<div key={idx} style={{
									background: '#fff',
									borderRadius: '20px',
									padding: '40px',
									border: '1px solid #eee',
									display: 'flex',
									flexDirection: 'column',
									minHeight: '350px',
								}}>
									{/* Quote icon */}
									<div style={{ marginBottom: '24px' }}>
										<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M11 7H7C5.89543 7 5 7.89543 5 9V13C5 14.1046 5.89543 15 7 15H9C9 16.6569 7.65685 18 6 18V20C8.76142 20 11 17.7614 11 15V7Z" fill="#3B82F6"/>
											<path d="M20 7H16C14.8954 7 14 7.89543 14 9V13C14 14.1046 14.8954 15 16 15H18C18 16.6569 16.6569 18 15 18V20C17.7614 20 20 17.7614 20 15V7Z" fill="#3B82F6"/>
										</svg>
									</div>
									
									{/* Quote */}
									<p style={{ 
										color: '#1A1615', 
										fontSize: '17px', 
										lineHeight: '1.8',
										marginBottom: '30px',
										flex: 1,
									}}>
										"{testimonial.quote}"
									</p>
									
									{/* Divider */}
									<div style={{ borderTop: '1px solid #eee', paddingTop: '24px' }}>
										<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
											{/* Logo */}
											<div style={{
												width: '60px',
												height: '60px',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
											}}>
												<img
													src={testimonial.logo}
													alt={testimonial.name}
													style={{ 
														maxWidth: '100%', 
														maxHeight: '100%', 
														objectFit: 'contain' 
													}}
												/>
											</div>
											{/* Author info */}
											<div>
												<h5 style={{ 
													color: '#1A1615', 
													fontWeight: '600', 
													margin: '0 0 4px 0', 
													fontSize: '18px' 
												}}>
													{testimonial.name}
												</h5>
												<span style={{ color: '#1A1615aa', fontSize: '15px' }}>
													{testimonial.title}
												</span>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
export default SidekickTestimonials;
