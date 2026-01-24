import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import FeatureCard from "@/components/shared/cards/FeatureCard";

const Features = ({ type }) => {
  const features = [
    {
      title: "SMS & Voice Support",
      desc: "Workers text or send voice memos in any language. No app downloads, no training required—just instant answers via SMS.",
      icon: "tji-support",
    },
    {
      title: "10+ Languages",
      desc: "Sidekick understands and responds in Spanish, Korean, Mandarin, Vietnamese, and more. Every worker gets help in their preferred language.",
      icon: "tji-innovative",
    },
    {
      title: "Gap Detection & Insights",
      desc: "AI identifies training gaps, trending questions, and suggests improvements—helping managers take action before small issues become big problems.",
      icon: "tji-award",
    },
  ];

  return (
    <section id="choose" className="tj-choose-section section-gap">
      <div className="container">
        <div className="row">
          <div className="col-12">
            {type == 2 ? (
              <div className="sec-heading-wrap">
                <span className="sub-title wow fadeInUp" data-wow-delay=".3s" style={{color: '#1A1615', borderColor: '#1A161530'}}>
                  <i className="tji-box" style={{color: '#1A1615'}}></i>Why Sidekick
                </span>
                <div className="heading-wrap-content">
                  <div className="sec-heading">
                    <h2 className="sec-title title-anim" style={{color: '#1A1615'}}>
                      Built for <span style={{color: '#1A1615'}}>Frontline Teams.</span>
                    </h2>
                  </div>
                  <div className="btn-wrap wow fadeInUp" data-wow-delay=".6s">
                    <ButtonPrimary text="Book a Demo" url="https://cal.com/justin-so-xnr0oc/sidekick-demo" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="sec-heading text-center">
                <span className="sub-title wow fadeInUp" data-wow-delay=".3s" style={{color: '#1A1615', borderColor: '#1A161530'}}>
                  <i className="tji-box" style={{color: '#1A1615'}}></i>Why Sidekick
                </span>
                <h2 className="sec-title title-anim" style={{color: '#1A1615'}}>
                  Built for <span style={{color: '#1A1615'}}>Frontline Teams.</span>
                </h2>
              </div>
            )}
          </div>
        </div>
        <div className="row row-gap-4 rightSwipeWrap">
          {features.map((feature, idx) => (
            <div key={idx} className="col-lg-4">
              <FeatureCard feature={feature} idx={idx} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
