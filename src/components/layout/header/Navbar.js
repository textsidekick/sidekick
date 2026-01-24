import Link from "next/link";

const Navbar = ({ headerType, isStickyHeader }) => {
	return (
		<div className="menu-area d-none d-lg-inline-flex align-items-center">
			<nav id="mobile-menu" className="mainmenu">
				<ul>
					<li>
						<a href="/#how-it-works">How it works</a>
					</li>
					<li>
						<Link href="/about">About</Link>
					</li>
					<li>
						<Link href="/contact">Contact</Link>
					</li>
				</ul>
			</nav>
		</div>
	);
};

export default Navbar;
