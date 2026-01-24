"use client";
import SidekickMarqueeSlider from "@/components/shared/marquee/SidekickMarqueeSlider";
const SidekickMarquee = () => {
	return (
		<section className="h5-maquee z-2">
			<div className="h5-maquee-inner">
				<SidekickMarqueeSlider />
			</div>
			<div dir="rtl" className="h5-maquee-inner h5-maquee-inner-rtl">
				<SidekickMarqueeSlider isRtl={true} />
			</div>
		</section>
	);
};
export default SidekickMarquee;
