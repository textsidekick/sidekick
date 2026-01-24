"use client";

import Link from "next/link";
import Image from "next/image";

const Logo = ({ headerType, isStickyHeader }) => {
  return (
    <div className="site_logo">
      <Link className="logo" href="/" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
        <Image 
          src="/images/logo/sidekick-logo.png" 
          alt="Sidekick Logo" 
          width={40} 
          height={40}
          style={{objectFit: 'contain'}}
        />
        <span style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#1A1615'
        }}>Sidekick</span>
      </Link>
    </div>
  );
};

export default Logo;
