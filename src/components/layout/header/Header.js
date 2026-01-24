"use client";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import useIsSticky from "@/hooks/useIsSticky";
import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import Navbar from "./Navbar";

const Header = ({
	headerType = 1,
	isHeaderTop = false,
	topbarType = 1,
	isStickyHeader = false,
}) => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const isSticky = useIsSticky(isStickyHeader);

	const handleMobileTogglerClick = () => {
		setIsMobileMenuOpen(true);
	};

	return (
		<>
			{/* Mobile Menu */}
			<MobileMenu
				isMobileMenuOpen={isMobileMenuOpen}
				setIsMobileMenuOpen={setIsMobileMenuOpen}
			/>

			<header
				className={`header-area ${
					headerType === 10
						? "header-3 h10-header"
						: headerType === 9
						? isStickyHeader
							? "header-3"
							: "h9-header"
						: headerType === 8
						? "header-1 h8-header"
						: headerType === 7
						? "header-2 h7-header"
						: headerType === 6
						? "header-1 h6-header"
						: headerType === 5
						? `header-2 ${isStickyHeader ? "" : "header-5"}`
						: headerType === 3
						? "header-3"
						: headerType === 2
						? "header-2"
						: "header-1"
				} section-gap-x ${
					isStickyHeader
						? `header-duplicate header-sticky ${isSticky ? "sticky" : ""}`
						: "header-absolute"
				} `}
			>
				<div className="container-fluid">
					<div className="row">
						<div className="col-12">
							<div className="header-wrapper">
								{/* Site Logo */}
								<Logo headerType={headerType} isStickyHeader={isStickyHeader} />

								{/* Navigation */}
								<Navbar />

								{/* Header Right - Request Demo Button */}
								<div className="header-right-item d-none d-lg-inline-flex">
									<div className="header-button">
										<ButtonPrimary 
											text={"Request Demo"} 
											url={"https://cal.com/justin-so-xnr0oc/sidekick-demo"} 
										/>
									</div>
								</div>

								{/* Mobile Menu Toggle */}
								<div
									className="menu_bar mobile_menu_bar d-lg-none"
									onClick={handleMobileTogglerClick}
								>
									<span></span>
									<span></span>
									<span></span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</header>
		</>
	);
};

export default Header;
