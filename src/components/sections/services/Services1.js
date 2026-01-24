import ServicesSlider1 from "@/components/shared/services/ServicesSlider1";

const Services1 = () => {
  return (
    <section className="tj-service-section overflow-hidden section-gap section-gap-x">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="sec-heading text-center">
              <span
                className="sub-title wow fadeInUp"
                data-wow-delay=".3s"
                style={{color: '#1A1615', borderColor: '#1A161530'}}
              >
                <i className="tji-box" style={{color: '#1A1615'}}></i>How It Works
              </span>
              <h2 className="sec-title title-anim" style={{color: '#1A1615'}}>
                Three Steps to <span style={{color: '#1A1615'}}>Smarter Onboarding.</span>
              </h2>
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid p-0">
        <div className="row">
          <div className="col-12">
            <div className="service-wrapper wow fadeInUp" data-wow-delay=".4s">
              <ServicesSlider1 />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services1;
