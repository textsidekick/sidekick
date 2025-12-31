import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="w-full px-6 md:px-24 py-3 bg-white shadow-[0px_4px_8px_0px_rgba(171,190,209,0.40)] flex justify-center items-center gap-11 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-1.5">
          <div className="w-6 h-4 relative">
            <div className="w-2.5 h-2 left-[4.56px] top-[8.57px] absolute bg-gray-800" />
            <div className="w-2.5 h-2 left-[14.84px] top-0 absolute bg-gray-800" />
            <div className="w-2 h-2 left-0 top-0 absolute bg-green-500" />
            <div className="w-2 h-2 left-[5.13px] top-[0.63px] absolute bg-green-500" />
            <div className="w-2 h-2 left-[10.20px] top-[9.35px] absolute bg-green-500" />
            <div className="w-2 h-2 left-[15.50px] top-[8.91px] absolute bg-green-500" />
          </div>
          <span className="text-gray-800 text-lg font-bold font-['Inter']">Sidekick</span>
        </Link>
        <div className="flex-1 flex justify-end items-center gap-6">
          <div className="hidden md:flex items-start gap-4">
            <Link href="#features" className="text-neutral-600 text-sm font-medium font-['Inter'] leading-4 hover:text-green-500">Features</Link>
            <Link href="#demo" className="text-neutral-600 text-sm font-medium font-['Inter'] leading-4 hover:text-green-500">Demo</Link>
            <Link href="#pricing" className="text-neutral-600 text-sm font-medium font-['Inter'] leading-4 hover:text-green-500">Pricing</Link>
            <Link href="/about" className="text-neutral-600 text-sm font-medium font-['Inter'] leading-4 hover:text-green-500">About</Link>
          </div>
          <Link href="/qa" className="px-6 py-2.5 bg-green-500 rounded-sm flex justify-center items-center gap-1.5 hover:bg-green-600 transition">
            <span className="text-white text-sm font-medium font-['Inter'] leading-4">Try Demo</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 md:px-24 py-16 bg-slate-50 flex flex-col md:flex-row justify-start items-center gap-20">
        <div className="flex-1 flex flex-col justify-start items-start gap-6">
          <div className="flex flex-col justify-start items-start gap-3">
            <h1 className="text-3xl md:text-5xl font-semibold font-['Inter'] leading-tight md:leading-[53px]">
              <span className="text-neutral-600">Smart onboarding for </span>
              <span className="text-green-500">blue-collar teams</span>
            </h1>
            <p className="text-neutral-500 text-sm font-normal font-['Inter'] leading-5">
              AI-powered document intelligence that understands your workplace procedures. Workers text questions, get instant answers from company handbooks.
            </p>
          </div>
          <Link href="/qa" className="px-6 py-2.5 bg-green-500 rounded-sm inline-flex justify-center items-center gap-1.5 hover:bg-green-600 transition">
            <span className="text-white text-sm font-medium font-['Inter'] leading-4">Request Demo</span>
          </Link>
        </div>
        {/* Hero Illustration - Using Storyset/unDraw style */}
        <div className="w-72 h-72 md:w-96 md:h-96 relative">
          <img 
            src="https://storyset.com/illustration/mobile-login/rafiki" 
            alt="Worker using mobile app"
            className="w-full h-full object-contain"
          />
          {/* Fallback SVG illustration */}
          <svg className="w-full h-full" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Phone */}
            <rect x="140" y="60" width="120" height="220" rx="12" fill="#3B82F6" stroke="#1E40AF" strokeWidth="4"/>
            <rect x="150" y="80" width="100" height="180" rx="4" fill="white"/>
            
            {/* Screen content */}
            <circle cx="200" cy="110" r="15" fill="#E5E7EB"/>
            <rect x="170" y="140" width="60" height="8" rx="4" fill="#22C55E"/>
            <rect x="170" y="160" width="60" height="8" rx="4" fill="#E5E7EB"/>
            <rect x="170" y="180" width="60" height="8" rx="4" fill="#E5E7EB"/>
            <rect x="180" y="210" width="40" height="20" rx="4" fill="#22C55E"/>
            
            {/* Person */}
            <ellipse cx="280" cy="350" rx="40" ry="10" fill="#E5E7EB"/>
            {/* Body */}
            <path d="M260 280 L260 340 L270 340 L270 290 L290 290 L290 340 L300 340 L300 280 Z" fill="#1F2937"/>
            {/* Torso */}
            <rect x="255" y="220" width="50" height="65" rx="4" fill="#22C55E"/>
            {/* Head */}
            <circle cx="280" cy="195" r="25" fill="#FCD34D"/>
            {/* Hair */}
            <path d="M255 190 Q280 160 305 190" fill="#1F2937"/>
            {/* Arm pointing */}
            <path d="M255 240 L200 180" stroke="#FCD34D" strokeWidth="12" strokeLinecap="round"/>
            <circle cx="195" cy="175" r="8" fill="#FCD34D"/>
            
            {/* Lock icon */}
            <rect x="300" y="100" width="40" height="35" rx="4" fill="#22C55E"/>
            <rect x="310" y="85" width="20" height="20" rx="10" stroke="#22C55E" strokeWidth="4" fill="none"/>
            <circle cx="320" cy="115" r="5" fill="white"/>
            
            {/* Thumbs up bubble */}
            <ellipse cx="100" cy="200" rx="30" ry="25" fill="white" stroke="#E5E7EB" strokeWidth="2"/>
            <path d="M90 210 L90 195 L100 195 L100 185 L110 200 L100 200 L100 210 Z" fill="#22C55E"/>
            
            {/* Plants */}
            <ellipse cx="340" cy="320" rx="8" ry="40" fill="#22C55E"/>
            <ellipse cx="355" cy="330" rx="6" ry="30" fill="#16A34A"/>
            <ellipse cx="325" cy="335" rx="5" ry="25" fill="#4ADE80"/>
          </svg>
        </div>
      </section>

      {/* Clients Section */}
      <section className="px-6 md:px-24 py-6 flex flex-col justify-start items-center gap-3">
        <div className="flex flex-col justify-start items-center gap-1.5">
          <h2 className="text-center text-neutral-600 text-2xl font-semibold font-['Inter'] leading-8">Our Clients</h2>
          <p className="text-center text-neutral-500 text-sm font-normal font-['Inter'] leading-4">Trusted by leading manufacturers and retailers</p>
        </div>
        <div className="h-16 flex flex-wrap justify-center items-center gap-8 md:gap-16">
          <span className="text-lg font-bold text-gray-400 font-['Inter']">EDS Manufacturing</span>
          <span className="text-lg font-bold text-gray-400 font-['Inter']">Trinethra Supermarket</span>
          <span className="text-lg font-bold text-gray-300 border-2 border-dashed border-gray-200 px-4 py-2 rounded font-['Inter']">Your Company</span>
        </div>
      </section>

      {/* Value Prop */}
      <section className="px-6 md:px-24 py-8 flex flex-col justify-start items-center gap-3">
        <h2 className="max-w-md text-center text-neutral-600 text-2xl font-semibold font-['Inter'] leading-8">
          Manage your entire onboarding <span className="text-green-500">in a single system</span>
        </h2>
        <p className="text-center text-neutral-500 text-sm font-normal font-['Inter'] leading-4">Who is Sidekick suitable for?</p>
      </section>

      {/* Features Cards */}
      <section id="features" className="px-6 md:px-24 py-4 flex flex-wrap justify-center gap-6">
        {[
          { icon: "🏭", title: "Manufacturing", desc: "Safety protocols, equipment SOPs, quality control procedures" },
          { icon: "🛒", title: "Retail", desc: "Store policies, inventory procedures, customer service guides" },
          { icon: "🔧", title: "Field Services", desc: "Service manuals, safety guidelines, client protocols" },
        ].map((item) => (
          <div key={item.title} className="w-52 px-6 py-4 bg-white rounded-md shadow-[0px_1.4px_2.8px_0px_rgba(171,190,209,0.20)] flex flex-col justify-start items-center gap-1.5">
            <div className="flex flex-col justify-start items-center gap-3">
              <div className="w-11 h-10 relative">
                <div className="w-9 h-9 absolute right-0 bottom-0 bg-green-100 rounded-tl-xl rounded-tr rounded-bl rounded-br-md" />
                <div className="w-8 h-8 absolute left-0 top-0 flex items-center justify-center text-2xl">{item.icon}</div>
              </div>
              <h3 className="text-center text-neutral-600 text-xl font-bold font-['Inter'] leading-6">{item.title}</h3>
            </div>
            <p className="w-44 text-center text-neutral-500 text-[10px] font-normal font-['Inter'] leading-3">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Feature Section with Illustration */}
      <section className="px-6 md:px-24 py-12 flex flex-col md:flex-row justify-between items-center gap-12">
        {/* Illustration - Person with computer */}
        <div className="w-80 h-72 relative">
          <svg className="w-full h-full" viewBox="0 0 400 350" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Monitor */}
            <rect x="40" y="40" width="180" height="140" rx="8" fill="#1F2937"/>
            <rect x="50" y="50" width="160" height="110" rx="4" fill="#22C55E"/>
            <rect x="50" y="50" width="160" height="110" rx="4" fill="white" fillOpacity="0.9"/>
            
            {/* Screen content - flowchart */}
            <rect x="70" y="70" width="50" height="20" rx="2" fill="#22C55E" fillOpacity="0.3"/>
            <rect x="70" y="100" width="30" height="15" rx="2" fill="#22C55E"/>
            <rect x="70" y="125" width="30" height="15" rx="2" fill="#22C55E"/>
            <line x1="100" y1="107" x2="120" y2="107" stroke="#22C55E" strokeWidth="2"/>
            <line x1="100" y1="132" x2="120" y2="132" stroke="#22C55E" strokeWidth="2"/>
            
            {/* Code panel */}
            <rect x="130" y="70" width="70" height="80" rx="2" fill="#1F2937"/>
            <rect x="140" y="80" width="40" height="4" rx="1" fill="#22C55E"/>
            <rect x="140" y="90" width="50" height="4" rx="1" fill="#4ADE80"/>
            <rect x="140" y="100" width="35" height="4" rx="1" fill="#86EFAC"/>
            <rect x="140" y="110" width="45" height="4" rx="1" fill="#22C55E"/>
            <rect x="140" y="120" width="30" height="4" rx="1" fill="#4ADE80"/>
            
            {/* Code symbol */}
            <rect x="60" y="130" width="35" height="25" rx="2" fill="#22C55E"/>
            <text x="67" y="148" fill="white" fontSize="14" fontFamily="monospace">&lt;/&gt;</text>
            
            {/* Monitor stand */}
            <rect x="115" y="180" width="40" height="10" fill="#374151"/>
            <rect x="100" y="190" width="70" height="8" rx="2" fill="#4B5563"/>
            
            {/* Person */}
            <ellipse cx="300" cy="310" rx="35" ry="8" fill="#E5E7EB"/>
            
            {/* Legs */}
            <rect x="275" y="250" width="15" height="60" fill="#1F2937"/>
            <rect x="300" y="250" width="15" height="60" fill="#374151"/>
            
            {/* Body/Shirt */}
            <path d="M265 180 Q290 170 315 180 L320 250 L260 250 Z" fill="#22C55E"/>
            
            {/* Laptop */}
            <rect x="250" y="200" width="60" height="40" rx="2" fill="#4ADE80"/>
            <rect x="255" y="205" width="50" height="30" rx="1" fill="#DCFCE7"/>
            
            {/* Arms */}
            <rect x="245" y="190" width="12" height="35" rx="6" fill="#FCD34D"/>
            <rect x="303" y="190" width="12" height="35" rx="6" fill="#FCD34D"/>
            
            {/* Head */}
            <circle cx="290" cy="150" r="28" fill="#FCD34D"/>
            
            {/* Hair */}
            <path d="M262 145 Q270 115 290 120 Q310 115 318 145" fill="#1F2937"/>
            <path d="M265 140 Q290 125 315 140" fill="#1F2937"/>
            
            {/* Face */}
            <circle cx="280" cy="148" r="3" fill="#1F2937"/>
            <circle cx="300" cy="148" r="3" fill="#1F2937"/>
            <path d="M283 160 Q290 165 297 160" stroke="#1F2937" strokeWidth="2" fill="none"/>
            
            {/* X icon floating */}
            <rect x="230" y="80" width="30" height="30" rx="4" fill="#374151"/>
            <line x1="238" y1="88" x2="252" y2="102" stroke="white" strokeWidth="2"/>
            <line x1="252" y1="88" x2="238" y2="102" stroke="white" strokeWidth="2"/>
            
            {/* Gear */}
            <circle cx="130" cy="290" r="25" fill="#E5E7EB"/>
            <circle cx="130" cy="290" r="12" fill="#F3F4F6"/>
            <rect x="125" y="262" width="10" height="15" fill="#E5E7EB"/>
            <rect x="125" y="303" width="10" height="15" fill="#E5E7EB"/>
            <rect x="102" y="285" width="15" height="10" fill="#E5E7EB"/>
            <rect x="143" y="285" width="15" height="10" fill="#E5E7EB"/>
          </svg>
        </div>
        
        <div className="flex-1 flex flex-col justify-start items-start gap-6 max-w-md">
          <h2 className="text-neutral-600 text-2xl font-semibold font-['Inter'] leading-8">
            Document intelligence that actually works
          </h2>
          <p className="text-neutral-500 text-sm font-normal font-['Inter'] leading-5">
            Upload any workplace document - safety manuals, equipment guides, HR policies. Our AI automatically classifies, indexes, and makes everything searchable via simple text questions.
          </p>
          <Link href="/qa" className="px-6 py-2.5 bg-green-500 rounded-sm inline-flex justify-center items-center gap-1.5 hover:bg-green-600 transition">
            <span className="text-white text-sm font-medium font-['Inter'] leading-4">Learn More</span>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 md:px-24 py-11 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col justify-start items-start gap-1.5">
          <h2 className="text-2xl font-semibold font-['Inter'] leading-8">
            <span className="text-neutral-600">Helping businesses </span>
            <span className="text-green-500">reinvent onboarding</span>
          </h2>
          <p className="text-zinc-900 text-sm font-normal font-['Inter'] leading-4">We reached here with our hard work and dedication</p>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {[
            { value: "70%", label: "Faster Onboarding" },
            { value: "50%", label: "Fewer Incidents" },
            { value: "$15K", label: "Annual Savings" },
            { value: "95%", label: "Accuracy Rate" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/10 rounded flex items-center justify-center">
                <div className="w-4 h-3 border-2 border-green-500 rounded-sm" />
              </div>
              <div className="flex flex-col">
                <span className="text-neutral-600 text-xl font-bold font-['Inter'] leading-6">{stat.value}</span>
                <span className="text-neutral-500 text-sm font-normal font-['Inter'] leading-4">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Second Feature Section */}
      <section className="px-6 md:px-24 py-12 flex flex-col-reverse md:flex-row justify-between items-center gap-12">
        <div className="flex-1 flex flex-col justify-start items-start gap-6 max-w-md">
          <h2 className="text-neutral-600 text-2xl font-semibold font-['Inter'] leading-8">
            SMS-first for the frontline
          </h2>
          <p className="text-neutral-500 text-sm font-normal font-['Inter'] leading-5">
            No app downloads, no training needed. Workers simply text their questions and get instant, accurate answers pulled directly from your company documents.
          </p>
          <Link href="/qa" className="px-6 py-2.5 bg-green-500 rounded-sm inline-flex justify-center items-center gap-1.5 hover:bg-green-600 transition">
            <span className="text-white text-sm font-medium font-['Inter'] leading-4">Learn More</span>
          </Link>
        </div>
        
        {/* Phone illustration */}
        <div className="w-80 h-72 relative">
          <svg className="w-full h-full" viewBox="0 0 400 350" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Phone */}
            <rect x="130" y="30" width="140" height="260" rx="16" fill="#3B82F6"/>
            <rect x="140" y="50" width="120" height="220" rx="8" fill="white"/>
            
            {/* Screen content */}
            <circle cx="200" cy="85" r="20" fill="#E5E7EB"/>
            <circle cx="200" cy="85" r="12" fill="#22C55E" fillOpacity="0.3"/>
            
            <rect x="160" y="120" width="80" height="10" rx="5" fill="#22C55E"/>
            <rect x="160" y="140" width="80" height="8" rx="4" fill="#E5E7EB"/>
            <rect x="160" y="158" width="80" height="8" rx="4" fill="#E5E7EB"/>
            <rect x="160" y="176" width="60" height="8" rx="4" fill="#E5E7EB"/>
            
            {/* Password dots */}
            <rect x="160" y="200" width="80" height="12" rx="2" stroke="#E5E7EB" strokeWidth="2" fill="white"/>
            <circle cx="175" cy="206" r="3" fill="#22C55E"/>
            <circle cx="188" cy="206" r="3" fill="#22C55E"/>
            <circle cx="201" cy="206" r="3" fill="#22C55E"/>
            <circle cx="214" cy="206" r="3" fill="#22C55E"/>
            <circle cx="227" cy="206" r="3" fill="#22C55E"/>
            
            {/* Sign up button */}
            <rect x="170" y="230" width="60" height="24" rx="4" fill="#22C55E"/>
            <text x="182" y="246" fill="white" fontSize="10" fontFamily="Inter">SIGN UP</text>
            
            {/* Lock icon */}
            <rect x="290" y="70" width="50" height="45" rx="6" fill="#22C55E"/>
            <rect x="302" y="50" width="26" height="25" rx="13" stroke="#22C55E" strokeWidth="5" fill="none"/>
            <circle cx="315" cy="90" r="6" fill="white"/>
            <rect x="313" y="90" width="4" height="10" fill="white"/>
            
            {/* Person */}
            <ellipse cx="90" cy="310" rx="30" ry="6" fill="#E5E7EB"/>
            
            {/* Body */}
            <rect x="70" y="230" width="12" height="80" fill="#1F2937"/>
            <rect x="88" y="230" width="12" height="80" fill="#374151"/>
            
            {/* Torso */}
            <rect x="60" y="170" width="60" height="65" rx="4" fill="#22C55E"/>
            
            {/* Arm pointing */}
            <rect x="108" y="175" width="50" height="12" rx="6" fill="#FCD34D"/>
            <circle cx="160" cy="181" r="8" fill="#FCD34D"/>
            
            {/* Other arm */}
            <rect x="50" y="185" width="15" height="40" rx="6" fill="#FCD34D"/>
            
            {/* Head */}
            <circle cx="90" cy="140" r="30" fill="#FCD34D"/>
            
            {/* Hair */}
            <ellipse cx="90" cy="120" rx="28" ry="15" fill="#1F2937"/>
            <rect x="62" y="115" width="56" height="20" fill="#1F2937"/>
            
            {/* Face */}
            <circle cx="80" cy="140" r="3" fill="#1F2937"/>
            <circle cx="100" cy="140" r="3" fill="#1F2937"/>
            
            {/* Thumbs up speech bubble */}
            <ellipse cx="40" cy="120" rx="25" ry="20" fill="white" stroke="#E5E7EB" strokeWidth="2"/>
            <path d="M35 130 L35 118 L42 118 L42 112 L50 122 L42 122 L42 130 Z" fill="#22C55E"/>
            
            {/* Plants */}
            <path d="M330 320 Q340 280 335 250" stroke="#22C55E" strokeWidth="8" fill="none"/>
            <ellipse cx="335" cy="250" rx="15" ry="25" fill="#22C55E"/>
            <path d="M340 320 Q355 290 345 260" stroke="#16A34A" strokeWidth="6" fill="none"/>
            <ellipse cx="345" cy="260" rx="12" ry="20" fill="#16A34A"/>
            <path d="M335 320 Q320 295 330 270" stroke="#4ADE80" strokeWidth="5" fill="none"/>
            <ellipse cx="330" cy="270" rx="10" ry="18" fill="#4ADE80"/>
            
            {/* Vector badge */}
            <rect x="165" y="0" width="70" height="28" rx="6" fill="#3B82F6"/>
            <rect x="175" y="7" width="14" height="14" rx="2" fill="white"/>
            <text x="195" y="18" fill="white" fontSize="11" fontFamily="Inter">Vector</text>
          </svg>
        </div>
      </section>

      {/* How It Works */}
      <section id="demo" className="px-6 md:px-24 py-12 flex flex-col items-center gap-8">
        <h2 className="text-center text-neutral-600 text-2xl font-semibold font-['Inter'] leading-8">Get Started in 3 Steps</h2>
        <div className="flex flex-col md:flex-row justify-center gap-8">
          {[
            { num: "1", title: "Upload Documents", desc: "Drop your handbooks, manuals, and procedures" },
            { num: "2", title: "AI Classifies", desc: "Our AI automatically organizes everything" },
            { num: "3", title: "Workers Ask", desc: "Team texts questions, gets instant answers" },
          ].map((step) => (
            <div key={step.num} className="flex flex-col items-center text-center max-w-xs">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-xl font-bold font-['Inter']">{step.num}</span>
              </div>
              <h3 className="text-neutral-600 text-lg font-bold font-['Inter'] leading-6 mb-2">{step.title}</h3>
              <p className="text-neutral-500 text-sm font-normal font-['Inter'] leading-4">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-6 bg-slate-50 flex flex-col justify-start items-center gap-6">
        <h2 className="text-center text-gray-800 text-3xl md:text-5xl font-semibold font-['Inter'] leading-tight">Ready to transform your onboarding?</h2>
        <Link href="/qa" className="px-6 py-2.5 bg-green-500 rounded-sm inline-flex justify-center items-center gap-1.5 hover:bg-green-600 transition">
          <span className="text-white text-sm font-medium font-['Inter'] leading-4">Get a Demo</span>
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-28 py-11 bg-gray-800 flex flex-col md:flex-row justify-start items-start gap-20">
        <div className="flex flex-col justify-start items-start gap-7">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-5 relative">
              <div className="w-3 h-2.5 absolute left-[2.71px] top-[10.59px] bg-white" />
              <div className="w-3 h-2.5 absolute left-[18.35px] top-0 bg-white" />
              <div className="w-2.5 h-2 absolute left-0 top-0 bg-green-500" />
              <div className="w-2.5 h-2 absolute left-[6.34px] top-[0.78px] bg-green-500" />
              <div className="w-2.5 h-2.5 absolute left-[12.61px] top-[11.56px] bg-green-500" />
              <div className="w-2.5 h-2 absolute left-[19.16px] top-[11.01px] bg-green-500" />
            </div>
            <span className="text-white text-lg font-bold font-['Inter']">Sidekick</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-slate-50 text-[10px] font-normal font-['Inter'] leading-3">Copyright © 2025 Sidekick AI.</p>
            <p className="text-slate-50 text-[10px] font-normal font-['Inter'] leading-3">All rights reserved</p>
          </div>
        </div>
        <div className="flex gap-5">
          <div className="flex flex-col gap-4">
            <h3 className="text-white text-sm font-semibold font-['Inter'] leading-5">Company</h3>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-slate-50 text-[10px] font-normal font-['Inter'] leading-3 hover:text-white">About us</Link>
              <Link href="/contact" className="text-slate-50 text-[10px] font-normal font-['Inter'] leading-3 hover:text-white">Contact us</Link>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-white text-sm font-semibold font-['Inter'] leading-5">Support</h3>
            <div className="flex flex-col gap-2">
              <Link href="/terms" className="text-slate-50 text-[10px] font-normal font-['Inter'] leading-3 hover:text-white">Terms of service</Link>
              <Link href="/privacy" className="text-slate-50 text-[10px] font-normal font-['Inter'] leading-3 hover:text-white">Privacy policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
