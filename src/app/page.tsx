import Link from "next/link";

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
      <section className="px-6 md:px-24 py-16 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-12">
        <div className="flex-1 flex flex-col justify-start items-start gap-6 max-w-lg">
          <h1 className="text-4xl md:text-5xl font-semibold font-['Inter'] leading-tight">
            <span className="text-neutral-600">Smart onboarding for </span>
            <span className="text-green-500">blue-collar teams</span>
          </h1>
          <p className="text-neutral-500 text-base font-normal font-['Inter'] leading-6">
            AI-powered document intelligence that understands your workplace procedures. Workers text questions, get instant answers from company handbooks.
          </p>
          <Link href="/qa" className="px-8 py-3 bg-green-500 rounded flex justify-center items-center gap-2 hover:bg-green-600 transition">
            <span className="text-white text-sm font-medium font-['Inter']">Request Demo</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
        {/* Hero Illustration - Storyset style */}
        <div className="flex-1 max-w-md">
          <img 
            src="https://illustrations.popsy.co/green/developer-activity.svg" 
            alt="Developer working on documents"
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* Clients Section */}
      <section className="px-6 md:px-24 py-8 flex flex-col justify-start items-center gap-4">
        <div className="flex flex-col justify-start items-center gap-2">
          <h2 className="text-center text-neutral-600 text-2xl font-semibold font-['Inter']">Our Clients</h2>
          <p className="text-center text-neutral-500 text-sm font-normal font-['Inter']">Trusted by leading manufacturers and retailers</p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 py-4">
          <span className="text-xl font-bold text-gray-400 font-['Inter']">EDS Manufacturing</span>
          <span className="text-xl font-bold text-gray-400 font-['Inter']">Trinethra Supermarket</span>
          <span className="text-xl font-bold text-gray-300 border-2 border-dashed border-gray-200 px-6 py-3 rounded font-['Inter']">Your Company</span>
        </div>
      </section>

      {/* Value Prop */}
      <section className="px-6 md:px-24 py-10 flex flex-col justify-start items-center gap-4">
        <h2 className="max-w-xl text-center text-neutral-600 text-3xl font-semibold font-['Inter'] leading-10">
          Manage your entire onboarding <span className="text-green-500">in a single system</span>
        </h2>
        <p className="text-center text-neutral-500 text-base font-normal font-['Inter']">Who is Sidekick suitable for?</p>
      </section>

      {/* Features Cards */}
      <section id="features" className="px-6 md:px-24 py-6 flex flex-wrap justify-center gap-8">
        {[
          { icon: "🏭", title: "Manufacturing", desc: "Safety protocols, equipment SOPs, quality control procedures" },
          { icon: "🛒", title: "Retail", desc: "Store policies, inventory procedures, customer service guides" },
          { icon: "🔧", title: "Field Services", desc: "Service manuals, safety guidelines, client protocols" },
        ].map((item) => (
          <div key={item.title} className="w-64 px-8 py-6 bg-white rounded-lg shadow-[0px_2px_4px_0px_rgba(171,190,209,0.30)] flex flex-col items-center gap-3 hover:shadow-[0px_4px_8px_0px_rgba(171,190,209,0.40)] transition">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-3xl">
              {item.icon}
            </div>
            <h3 className="text-center text-neutral-600 text-xl font-bold font-['Inter']">{item.title}</h3>
            <p className="text-center text-neutral-500 text-sm font-normal font-['Inter'] leading-5">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Feature Section 1 - with illustration */}
      <section className="px-6 md:px-24 py-16 flex flex-col md:flex-row justify-between items-center gap-12">
        <div className="flex-1 max-w-md">
          <img 
            src="https://illustrations.popsy.co/green/work-from-home.svg" 
            alt="Document intelligence"
            className="w-full h-auto"
          />
        </div>
        <div className="flex-1 flex flex-col justify-start items-start gap-6 max-w-md">
          <h2 className="text-neutral-600 text-3xl font-semibold font-['Inter'] leading-10">
            Document intelligence that <span className="text-green-500">actually works</span>
          </h2>
          <p className="text-neutral-500 text-base font-normal font-['Inter'] leading-6">
            Upload any workplace document - safety manuals, equipment guides, HR policies. Our AI automatically classifies, indexes, and makes everything searchable via simple text questions.
          </p>
          <Link href="/qa" className="px-6 py-2.5 bg-green-500 rounded flex items-center gap-2 hover:bg-green-600 transition">
            <span className="text-white text-sm font-medium font-['Inter']">Learn More</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 md:px-24 py-12 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex flex-col justify-start items-start gap-3 max-w-md">
          <h2 className="text-3xl font-semibold font-['Inter'] leading-10">
            <span className="text-neutral-600">Helping businesses </span>
            <span className="text-green-500">reinvent onboarding</span>
          </h2>
          <p className="text-neutral-500 text-base font-normal font-['Inter']">We reached here with our hard work and dedication</p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {[
            { value: "70%", label: "Faster Onboarding", icon: "📈" },
            { value: "50%", label: "Fewer Incidents", icon: "🛡️" },
            { value: "$15K", label: "Annual Savings", icon: "💰" },
            { value: "95%", label: "Accuracy Rate", icon: "✅" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                {stat.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-neutral-600 text-2xl font-bold font-['Inter']">{stat.value}</span>
                <span className="text-neutral-500 text-sm font-normal font-['Inter']">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Section 2 - SMS */}
      <section className="px-6 md:px-24 py-16 flex flex-col-reverse md:flex-row justify-between items-center gap-12">
        <div className="flex-1 flex flex-col justify-start items-start gap-6 max-w-md">
          <h2 className="text-neutral-600 text-3xl font-semibold font-['Inter'] leading-10">
            SMS-first for the <span className="text-green-500">frontline workforce</span>
          </h2>
          <p className="text-neutral-500 text-base font-normal font-['Inter'] leading-6">
            No app downloads, no training needed. Workers simply text their questions and get instant, accurate answers pulled directly from your company documents.
          </p>
          <Link href="/qa" className="px-6 py-2.5 bg-green-500 rounded flex items-center gap-2 hover:bg-green-600 transition">
            <span className="text-white text-sm font-medium font-['Inter']">Learn More</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
        <div className="flex-1 max-w-md">
          <img 
            src="https://illustrations.popsy.co/green/remote-work.svg" 
            alt="SMS messaging for workers"
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* How It Works */}
      <section id="demo" className="px-6 md:px-24 py-12 bg-slate-50 flex flex-col items-center gap-10">
        <h2 className="text-center text-neutral-600 text-3xl font-semibold font-['Inter']">Get Started in 3 Steps</h2>
        <div className="flex flex-col md:flex-row justify-center gap-10">
          {[
            { num: "1", title: "Upload Documents", desc: "Drop your handbooks, manuals, and procedures" },
            { num: "2", title: "AI Classifies", desc: "Our AI automatically organizes everything" },
            { num: "3", title: "Workers Ask", desc: "Team texts questions, gets instant answers" },
          ].map((step) => (
            <div key={step.num} className="flex flex-col items-center text-center max-w-xs">
              <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mb-5">
                <span className="text-white text-2xl font-bold font-['Inter']">{step.num}</span>
              </div>
              <h3 className="text-neutral-600 text-xl font-bold font-['Inter'] mb-2">{step.title}</h3>
              <p className="text-neutral-500 text-sm font-normal font-['Inter'] leading-5">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-24 py-16 flex flex-col items-center gap-6">
        <h2 className="text-center text-gray-800 text-3xl md:text-4xl font-semibold font-['Inter'] leading-tight max-w-2xl">Ready to transform your onboarding?</h2>
        <Link href="/qa" className="px-8 py-3 bg-green-500 rounded flex items-center gap-2 hover:bg-green-600 transition">
          <span className="text-white text-base font-medium font-['Inter']">Get a Demo</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-28 py-12 bg-gray-800 flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-5 relative">
              <div className="w-3 h-2.5 absolute left-[2.71px] top-[10.59px] bg-white" />
              <div className="w-3 h-2.5 absolute left-[18.35px] top-0 bg-white" />
              <div className="w-2.5 h-2 absolute left-0 top-0 bg-green-500" />
              <div className="w-2.5 h-2 absolute left-[6.34px] top-[0.78px] bg-green-500" />
              <div className="w-2.5 h-2.5 absolute left-[12.61px] top-[11.56px] bg-green-500" />
              <div className="w-2.5 h-2 absolute left-[19.16px] top-[11.01px] bg-green-500" />
            </div>
            <span className="text-white text-xl font-bold font-['Inter']">Sidekick</span>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-slate-300 text-sm font-normal font-['Inter']">Copyright © 2025 Sidekick AI.</p>
            <p className="text-slate-300 text-sm font-normal font-['Inter']">All rights reserved</p>
          </div>
        </div>
        <div className="flex gap-16">
          <div className="flex flex-col gap-4">
            <h3 className="text-white text-base font-semibold font-['Inter']">Company</h3>
            <div className="flex flex-col gap-3">
              <Link href="/about" className="text-slate-300 text-sm font-normal font-['Inter'] hover:text-white">About us</Link>
              <Link href="/contact" className="text-slate-300 text-sm font-normal font-['Inter'] hover:text-white">Contact us</Link>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-white text-base font-semibold font-['Inter']">Support</h3>
            <div className="flex flex-col gap-3">
              <Link href="/terms" className="text-slate-300 text-sm font-normal font-['Inter'] hover:text-white">Terms of service</Link>
              <Link href="/privacy" className="text-slate-300 text-sm font-normal font-['Inter'] hover:text-white">Privacy policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
