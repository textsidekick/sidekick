"use client";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
const SidekickMarqueeSlider = ({ type }) => {
	const items = [
		"SMS Support",
		"Voice Memos",
		"10+ Languages",
		"Gap Detection",
		"24/7 Answers",
		"No App Required",
		"SMS Support",
		"Voice Memos",
		"10+ Languages",
		"Gap Detection",
		"24/7 Answers",
		"No App Required",
	];
	return (
		<Swiper
			slidesPerView="auto"
			spaceBetween={30}
			loop={true}
			speed={5000}
			allowTouchMove={false}
			autoplay={{
				delay: 1,
				disableOnInteraction: false,
			}}
			breakpoints={{
				768: {
					spaceBetween: 35,
				},
				1024: {
					spaceBetween: 50,
				},
			}}
			className="h5-maquee-slider"
			wrapperClass="h5-maquee-slider-wrapper"
			modules={[Autoplay]}
		>
			{items?.length
				? items?.map((title, idx) => (
						<SwiperSlide key={idx} className="h5-maquee-slider-item">
							<div className="marquee-box">
								<div className="marquee-icon-wrapper">
									<div className="marquee-icon">
										{type === 2 ? "//" : <i className="tji-star"></i>}
									</div>
								</div>
								<div className="marquee-title">
									<h4 className="title">{title}</h4>
								</div>
							</div>
						</SwiperSlide>
				  ))
				: ""}
		</Swiper>
	);
};
export default SidekickMarqueeSlider;
