"use client";
import { useRef, useState, useEffect } from "react";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import MockupTimeMoneySaved from "@/components/mockups/MockupTimeMoneySaved";

const About1 = () => {
  const wrapperRef = useRef(null);
  const mockupRef = useRef(null);
  const [dimensions, setDimensions] = useState({ scale: 1, height: 'auto' });
  const MOCKUP_WIDTH = 620;

  useEffect(() => {
    const updateDimensions = () => {
      if (wrapperRef.current && mockupRef.current) {
        const wrapperWidth = wrapperRef.current.offsetWidth;
        const newScale = Math.min(1, wrapperWidth / MOCKUP_WIDTH);
        const mockupActualHeight = mockupRef.current.scrollHeight;
        
        setDimensions({
          scale: newScale,
          height: mockupActualHeight * newScale,
        });
      }
    };

    // Initial calculation after render
    const timer = setTimeout(updateDimensions, 50);
    
    window.addEventListener('resize', updateDimensions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  return (
    <section className="tj-about-section section-gap">
      <div className="container">
        <div className="row" style={{alignItems: "flex-start"}}>
          <div className="col-xl-6 col-lg-6 order-lg-1 order-2">
            <div
              className="about-img-area wow fadeInLeft"
              data-wow-delay=".2s"
              style={{
                background: 'linear-gradient(180deg, #8BB8E0 0%, #A8C8E8 30%, #C8D8E8 50%, #DCD8D4 70%, #E8E0D8 85%, #F2E6D9 100%)',
                borderRadius: '24px',
                padding: '30px',
              }}
            >
              <div ref={wrapperRef} style={{ width: '100%' }}>
                <div
                  style={{
                    height: typeof dimensions.height === 'number' ? `${dimensions.height}px` : dimensions.height,
                    overflow: 'hidden',
                    borderRadius: '16px',
                  }}
                >
                  <div 
                    ref={mockupRef}
                    style={{
                      transform: `scale(${dimensions.scale})`,
                      transformOrigin: 'top left',
                      width: MOCKUP_WIDTH,
                    }}
                  >
                    <MockupTimeMoneySaved />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-6 col-lg-6 order-lg-2 order-1">
            <div
              className="about-content-area style-1 wow fadeInLeft"
              data-wow-delay=".2s"
            >
              <div className="sec-heading">
                <span className="sub-title wow fadeInUp" data-wow-delay=".3s" style={{color: '#1A1615', borderColor: '#1A161530'}}>
                  <i className="tji-box" style={{color: '#1A1615'}}></i>The Problem We Solve
                </span>
                <h2 className="sec-title title-anim" style={{color: '#1A1615'}}>
                  80% of workers don't sit at a desk. Onboarding them shouldn't be <span style={{color: '#1A1615'}}>this hard.</span>
                </h2>
              </div>
              <p style={{color: '#1A1615cc', marginBottom: '20px', fontSize: '16px', lineHeight: '1.7'}}>
                Frontline workers in manufacturing, retail, and logistics are constantly interrupting managers with the same questions. Paper handbooks get lost. Training videos get skipped. And turnover keeps climbing.
              </p>
              <p style={{color: '#1A1615cc', marginBottom: '30px', fontSize: '16px', lineHeight: '1.7'}}>
                Sidekick changes that. Workers simply text their questions and get instant, accurate answers from your company documents—in any language, 24/7.
              </p>
              <div className="wow fadeInUp" data-wow-delay=".5s">
                <ButtonPrimary
                  text={"See How It Works"}
                  url={"/#how-it-works"}
                  isTextBtn={true}
                />
              </div>
            </div>
            <div className="about-bottom-area" style={{background: 'transparent'}}>
              <div
                className="wow fadeInUp"
                data-wow-delay=".7s"
                style={{
                  backgroundColor: 'rgba(245, 243, 240, 0.9)',
                  borderRadius: '24px',
                  padding: '32px',
                }}
              >
                <div style={{display: 'flex', gap: '4px', marginBottom: '16px'}}>
                  {[1,2,3,4,5].map(i => (
                    <span key={i} style={{color: '#facc15', fontSize: '20px'}}>★</span>
                  ))}
                </div>
                <p style={{color: '#1A1615', fontSize: '15px', lineHeight: '1.7', marginBottom: '20px'}}>
                  "Sidekick cut our onboarding time in half. New hires used to interrupt managers constantly—now they just text and get instant answers."
                </p>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <h6 style={{color: '#1A1615', fontWeight: '600', margin: '0 0 4px 0'}}>Chris Kim</h6>
                    <span style={{color: '#1A1615aa', fontSize: '14px'}}>Owner, EDS Manufacturing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About1;
