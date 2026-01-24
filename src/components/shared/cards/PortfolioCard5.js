"use client";
import { useRef, useState, useEffect } from "react";
import MockupKnowledgeBase from "@/components/mockups/MockupKnowledgeBase";
import MockupLocationCode from "@/components/mockups/MockupLocationCode";
import MockupQuestionsList from "@/components/mockups/MockupQuestionsList";
import MockupDashboard from "@/components/mockups/MockupDashboard";

const PortfolioCard5 = ({ portfolio }) => {
	const {
		title = "Step Title",
		img = "/images/project/h5-project-1.webp",
		img5,
		shortDesc,
		step = "01",
		id,
		dataFilter,
		category = "Setup",
	} = portfolio ? portfolio : {};
	
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

	// Get the right mockup component based on step
	const getMockupComponent = () => {
		switch(step) {
			case "01": return <MockupKnowledgeBase />;
			case "02": return <MockupLocationCode />;
			case "03": return <MockupQuestionsList />;
			case "04": return <MockupDashboard />;
			default: return null;
		}
	};
	
	// Color based on category
	const getCategoryColor = () => {
		switch(category) {
			case "Setup": return "#3B82F6";
			case "Worker": return "#EAB308";
			case "Manager": return "#22C55E";
			default: return "#3B82F6";
		}
	};
	
	return (
		<div className="h5-project-item-wrapper tj-scroll-slider-item">
			<div className="project-item h4-project-item h5-project-item" style={{ display: 'flex', gap: '24px', flexDirection: 'row-reverse', alignItems: 'center' }}>
				{/* Image container */}
				<div className="project-img" style={{ overflow: 'hidden', borderRadius: '16px', flex: '4', background: 'linear-gradient(180deg, #8BB8E0, #A8C8E8, #C8D8E8, #DCD8D4, #E8E0D8, #F2E6D9)', padding: '12px' }}>
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
								{getMockupComponent()}
							</div>
						</div>
					</div>
				</div>
				
				<div className="project-content" style={{ flex: '1', minWidth: '280px' }}>
					{/* Badge + Category inline */}
					<div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
						<div style={{
							width: '48px',
							height: '48px',
							borderRadius: '50%',
							backgroundColor: getCategoryColor(),
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: '#fff',
							fontSize: '18px',
							fontWeight: '700',
							flexShrink: 0,
						}}>
							{step}
						</div>
						<span style={{
							backgroundColor: getCategoryColor(),
							color: '#fff',
							padding: "6px 16px",
							borderRadius: "20px",
							fontSize: "12px",
							fontWeight: "600",
							display: "inline-block",
							textTransform: 'uppercase',
							letterSpacing: '0.5px',
						}}>
							{category}
						</span>
					</div>
					<div className="project-text">
						<h3 className="title">
							{title}
						</h3>
					</div>
					<p className="desc">
						{shortDesc}
					</p>
				</div>
			</div>
		</div>
	);
};

export default PortfolioCard5;
