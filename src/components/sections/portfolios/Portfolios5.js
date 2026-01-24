import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import PortfolioCard5 from "@/components/shared/cards/PortfolioCard5";
import getPortfolio from "@/libs/getPortfolio";

const Portfolios5 = () => {
	const portfolio = getPortfolio()?.slice(0, 4);
	return (
		<section id="how-it-works" className="h5-project">
			<div className="tj-scroll-slider section-gap">
				<div className="container">
					<div className="row">
						<div className="col-12">
							<div className="sec-heading-wrap style-3">
								<span className="sub-title wow fadeInUp" data-wow-delay=".3s">
									<i className="tji-box"></i>How It Works
								</span>
								<div className="heading-wrap-content">
									<div className="sec-heading style-3">
										<h2 className="sec-title text-anim">
											Up and Running in Minutes.
										</h2>
									</div>
									<div className="btn-area wow fadeInUp" data-wow-delay=".8s">
										<ButtonPrimary text={"Book a Demo"} url={"https://cal.com/justin-so-xnr0oc/sidekick-demo"} />
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="row">
						<div className="col-12">
							<div className="project-wrapper h5-project-wrapper">
								{portfolio?.length
									? portfolio?.map((portfolioSingle, idx) => (
											<PortfolioCard5 key={idx} portfolio={portfolioSingle} />
									  ))
									: ""}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
export default Portfolios5;
