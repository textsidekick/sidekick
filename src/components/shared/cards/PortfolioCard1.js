"use client";
import { useRef, useState, useEffect } from "react";
import MockupConversation from "@/components/mockups/MockupConversation";
import MockupVoiceMemo from "@/components/mockups/MockupVoiceMemo";
import MockupDashboard from "@/components/mockups/MockupDashboard";
import MockupAISuggestions from "@/components/mockups/MockupAISuggestions";

const PortfolioCard1 = ({ portfolio, index }) => {
  const wrapperRef = useRef(null);
  const mockupRef = useRef(null);
  const [dimensions, setDimensions] = useState({ scale: 1, height: 'auto' });
  const MOCKUP_WIDTH = 870;

  useEffect(() => {
    const updateDimensions = () => {
      if (wrapperRef.current && mockupRef.current) {
        const wrapperWidth = wrapperRef.current.offsetWidth;
        const newScale = Math.min(1, wrapperWidth / MOCKUP_WIDTH);
        const mockupActualHeight = mockupRef.current.scrollHeight;
        
        setDimensions({
          scale: newScale,
          height: Math.ceil(mockupActualHeight * newScale),
        });
      }
    };
    const timer = setTimeout(updateDimensions, 50);
    window.addEventListener('resize', updateDimensions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const getMockupComponent = () => {
    switch(index) {
      case 0: return <MockupVoiceMemo />;
      case 1: return <MockupAISuggestions />;
      case 2: return <MockupDashboard />;
      case 3: return <MockupAISuggestions />;
      default: return <MockupVoiceMemo />;
    }
  };

  const isWorker = index === 0;
  const viewLabel = isWorker ? "Worker View" : "Manager View";
  
  // Custom titles and descriptions for each card
  const cardContent = {
    0: {
      title: "Text or Talk to Get Answers",
      desc: "Workers simply text their questions in any language—or send a voice memo. Sidekick responds instantly, 24/7."
    },
    1: {
      title: "AI-Powered Insights",
      desc: "See knowledge gaps, trending questions, and AI-generated suggestions to improve your training materials automatically."
    }
  };

  const title = cardContent[index]?.title || "Feature";
  const shortDesc = cardContent[index]?.desc || "";
  
  return (
    <div className="project-item tj-arrange-item" style={{ overflow: 'hidden', borderRadius: '16px' }}>
      <div style={{ 
        background: 'linear-gradient(180deg, #8BB8E0, #A8C8E8, #C8D8E8, #DCD8D4, #E8E0D8, #F2E6D9)', 
        padding: '12px',
        borderRadius: '16px',
      }}>
        <div ref={wrapperRef} style={{ width: '100%' }}>
          <div
            style={{
              height: typeof dimensions.height === 'number' ? `${dimensions.height}px` : dimensions.height,
              overflow: 'hidden',
              borderRadius: '12px',
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
              {getMockupComponent()}
            </div>
          </div>
        </div>
      </div>
      <div className="project-content" style={{ position: 'static',
        padding: '20px',
        background: 'rgba(255,255,255,0.9)',
        borderRadius: '0 0 16px 16px',
      }}>
        <span style={{
          backgroundColor: isWorker ? '#EAB308' : '#22C55E',
          color: '#ffffff',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {viewLabel}
        </span>
        <div className="project-text" style={{ marginTop: '12px' }}>
          <h4 className="title" style={{ color: '#1a1a1a', fontSize: '20px', fontWeight: '600' }}>
            {title}
          </h4>
          {shortDesc && (
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px', lineHeight: '1.5' }}>
              {shortDesc}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
export default PortfolioCard1;
