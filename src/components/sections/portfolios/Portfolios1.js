import PortfolioCard1 from "@/components/shared/cards/PortfolioCard1";
import getPortfolio from "@/libs/getPortfolio";

const Portfolios1 = () => {
  const portfolio = getPortfolio()?.slice(0, 2);
  return (
    <section className="tj-project-section section-gap" style={{
      background: 'linear-gradient(180deg, #8BB8E0 0%, #A8C8E8 20%, #B8D0E8 40%, #D0DCE4 60%, #E4E0DC 80%, #F2E6D9 100%)',
      borderRadius: '32px',
      margin: '0 20px',
      padding: '80px 0',
    }}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="sec-heading-wrap">
              <span className="sub-title wow fadeInUp" data-wow-delay=".3s" style={{color: '#1A1615', borderColor: '#1A161530'}}>
                <i className="tji-box" style={{color: '#1A1615'}}></i>See It In Action
              </span>
              <div className="heading-wrap-content">
                <div className="sec-heading">
                  <h2 className="sec-title title-anim" style={{color: '#1A1615'}}>
                    Two Views. One <span style={{color: '#1A1615'}}>Platform.</span>
                  </h2>
                </div>
                <p className="desc wow fadeInUp" data-wow-delay=".5s" style={{color: '#1A1615cc'}}>
                  Workers get instant answers via text. Managers get insights and analytics to improve onboarding.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="project-area tj-arrange-container">
              {portfolio?.length
                ? portfolio?.map((portfolioSingle, idx) => (
                    <PortfolioCard1 key={idx} portfolio={portfolioSingle} index={idx} />
                  ))
                : ""}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Portfolios1;
