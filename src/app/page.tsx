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
            <div className="w-2 h-2 left-0 top-0 absolute bg-sky-500" />
            <div className="w-2 h-2 left-[5.13px] top-[0.63px] absolute bg-sky-500" />
            <div className="w-2 h-2 left-[10.20px] top-[9.35px] absolute bg-sky-500" />
            <div className="w-2 h-2 left-[15.50px] top-[8.91px] absolute bg-sky-500" />
          </div>
          <span className="text-gray-800 text-lg font-bold font-['Inter']">Sidekick</span>
        </Link>
        <div className="flex-1 flex justify-end items-center gap-6">
          <div className="hidden md:flex items-start gap-4">
            <Link href="#features" className="text-neutral-600 text-sm font-medium font-['Inter'] leading-4 hover:text-sky-500">Features</Link>
            <Link href="#demo" className="text-neutral-600 text-sm font-medium font-['Inter'] leading-4 hover:text-sky-500">Demo</Link>
            <Link href="#pricing" className="text-neutral-600 text-sm font-medium font-['Inter'] leading-4 hover:text-sky-500">Pricing</Link>
            <Link href="/about" className="text-neutral-600 text-sm font-medium font-['Inter'] leading-4 hover:text-sky-500">About</Link>
          </div>
          <Link href="/qa" className="px-6 py-2.5 bg-sky-500 rounded-sm flex justify-center items-center gap-1.5 hover:bg-sky-600 transition">
            <span className="text-white text-sm font-medium font-['Inter'] leading-4">Try Demo</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section - Full width photo background */}
      <section className="relative min-h-[600px] flex items-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80')`,
          }}
        >
          {/* Blue/dark overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/60 to-transparent" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 px-6 md:px-24 py-20 max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-['Inter'] leading-tight mb-6">
            <span className="text-white">Smart onboarding for </span>
            <span className="text-sky-400">blue-collar teams</span>
          </h1>
          <p className="text-gray-200 text-lg md:text-xl font-normal font-['Inter'] leading-7 mb-8">
            AI-powered document intelligence that understands your workplace procedures. Workers text questions, get instant answers from company handbooks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/qa" className="px-8 py-4 bg-sky-500 rounded-lg flex justify-center items-center gap-2 hover:bg-sky-600 transition shadow-lg">
              <span className="text-white text-base font-semibold font-['Inter']">Request Demo</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link href="#demo" className="px-8 py-4 bg-white/10 backdrop-blur border border-white/30 rounded-lg flex justify-center items-center gap-2 hover:bg-white/20 transition">
              <span className="text-white text-base font-semibold font-['Inter']">Watch Demo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="px-6 md:px-24 py-12 bg-white flex flex-col justify-start items-center gap-6">
        <p className="text-center text-neutral-500 text-sm font-medium font-['Inter'] uppercase tracking-wider">Trusted by industry leaders</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          <span className="text-2xl font-bold text-gray-300 font-['Inter']">EDS Manufacturing</span>
          <span className="text-2xl font-bold text-gray-300 font-['Inter']">Trinethra Supermarket</span>
          <span className="text-2xl font-bold text-gray-200 border-2 border-dashed border-gray-200 px-6 py-3 rounded-lg font-['Inter']">Your Company</span>
        </div>
      </section>

      {/* Features Section with Photo */}
      <section id="features" className="relative">
        {/* Background Image - Warehouse/Retail */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-white/90" />
        </div>
        
        <div className="relative z-10 px-6 md:px-24 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold font-['Inter'] text-neutral-800 mb-4">
              One platform for <span className="text-sky-500">every industry</span>
            </h2>
            <p className="text-neutral-600 text-lg font-normal font-['Inter']">Who is Sidekick suitable for?</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { icon: "🏭", title: "Manufacturing", desc: "Safety protocols, equipment SOPs, quality control procedures", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80" },
              { icon: "🛒", title: "Retail", desc: "Store policies, inventory procedures, customer service guides", image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&q=80" },
              { icon: "🔧", title: "Field Services", desc: "Service manuals, safety guidelines, client protocols", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80" },
            ].map((item) => (
              <div key={item.title} className="w-80 bg-white rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.08)] overflow-hidden hover:shadow-[0px_8px_30px_0px_rgba(0,0,0,0.12)] transition group">
                <div className="h-40 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center text-2xl mb-4 -mt-12 relative z-10 shadow-md">
                    {item.icon}
                  </div>
                  <h3 className="text-neutral-800 text-xl font-bold font-['Inter'] mb-2">{item.title}</h3>
                  <p className="text-neutral-500 text-sm font-normal font-['Inter'] leading-6">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section with Background */}
      <section className="relative py-20">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1920&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-sky-900/85" />
        </div>
        
        <div className="relative z-10 px-6 md:px-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold font-['Inter'] text-white mb-4">
              Helping businesses reinvent onboarding
            </h2>
            <p className="text-sky-200 text-lg font-normal font-['Inter']">Real results from real customers</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: "70%", label: "Faster Onboarding" },
              { value: "50%", label: "Fewer Incidents" },
              { value: "$15K", label: "Annual Savings" },
              { value: "95%", label: "Accuracy Rate" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white font-['Inter'] mb-2">{stat.value}</div>
                <div className="text-sky-200 text-sm font-medium font-['Inter']">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature: Document Intelligence */}
      <section className="px-6 md:px-24 py-20 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80" 
              alt="Document management"
              className="w-full h-auto"
            />
          </div>
        </div>
        <div className="flex-1 max-w-lg">
          <div className="inline-block px-4 py-1 bg-sky-100 text-sky-700 text-sm font-medium rounded-full mb-4">Document Intelligence</div>
          <h2 className="text-neutral-800 text-3xl md:text-4xl font-semibold font-['Inter'] leading-tight mb-6">
            Upload once, <span className="text-sky-500">answer forever</span>
          </h2>
          <p className="text-neutral-600 text-lg font-normal font-['Inter'] leading-7 mb-6">
            Upload any workplace document - safety manuals, equipment guides, HR policies. Our AI automatically classifies, indexes, and makes everything searchable via simple text questions.
          </p>
          <ul className="space-y-3 mb-8">
            {["Auto-classification of document types", "Smart extraction of procedures", "Instant search across all docs"].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M5 12l5 5L20 7"/>
                  </svg>
                </div>
                <span className="text-neutral-600 font-['Inter']">{item}</span>
              </li>
            ))}
          </ul>
          <Link href="/qa" className="px-6 py-3 bg-sky-500 rounded-lg inline-flex items-center gap-2 hover:bg-sky-600 transition">
            <span className="text-white font-semibold font-['Inter']">Try It Now</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* Feature: SMS First */}
      <section className="px-6 md:px-24 py-20 bg-slate-50 flex flex-col-reverse md:flex-row items-center gap-12">
        <div className="flex-1 max-w-lg">
          <div className="inline-block px-4 py-1 bg-sky-100 text-sky-700 text-sm font-medium rounded-full mb-4">SMS-First Design</div>
          <h2 className="text-neutral-800 text-3xl md:text-4xl font-semibold font-['Inter'] leading-tight mb-6">
            No app needed. <span className="text-sky-500">Just text.</span>
          </h2>
          <p className="text-neutral-600 text-lg font-normal font-['Inter'] leading-7 mb-6">
            Your frontline workers don't need to download anything. They simply text their questions and get instant, accurate answers pulled directly from your company documents.
          </p>
          <ul className="space-y-3 mb-8">
            {["Works on any phone", "No training required", "Answers in seconds"].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M5 12l5 5L20 7"/>
                  </svg>
                </div>
                <span className="text-neutral-600 font-['Inter']">{item}</span>
              </li>
            ))}
          </ul>
          <Link href="/qa" className="px-6 py-3 bg-sky-500 rounded-lg inline-flex items-center gap-2 hover:bg-sky-600 transition">
            <span className="text-white font-semibold font-['Inter']">See Demo</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
        <div className="flex-1">
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80" 
              alt="Worker using phone"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="demo" className="px-6 md:px-24 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold font-['Inter'] text-neutral-800 mb-4">
            Get started in <span className="text-sky-500">3 simple steps</span>
          </h2>
        </div>
        
        <div className="flex flex-col md:flex-row justify-center gap-8 max-w-4xl mx-auto">
          {[
            { num: "1", title: "Upload Documents", desc: "Drop your handbooks, manuals, and procedures into Sidekick", icon: "📄" },
            { num: "2", title: "AI Classifies", desc: "Our AI automatically organizes and indexes everything", icon: "🤖" },
            { num: "3", title: "Workers Ask", desc: "Team texts questions, gets instant accurate answers", icon: "💬" },
          ].map((step, i) => (
            <div key={step.num} className="flex-1 relative">
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 h-full">
                <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-3xl">{step.icon}</span>
                </div>
                <div className="text-sky-500 text-sm font-bold font-['Inter'] mb-2">STEP {step.num}</div>
                <h3 className="text-neutral-800 text-xl font-bold font-['Inter'] mb-3">{step.title}</h3>
                <p className="text-neutral-500 text-base font-normal font-['Inter'] leading-6">{step.desc}</p>
              </div>
              {i < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-gray-300 text-2xl">→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section with Background */}
      <section className="relative py-24">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1920&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/70" />
        </div>
        
        <div className="relative z-10 px-6 md:px-24 text-center">
          <h2 className="text-3xl md:text-5xl font-bold font-['Inter'] text-white mb-6 max-w-3xl mx-auto">
            Ready to transform your team's onboarding?
          </h2>
          <p className="text-gray-300 text-lg font-normal font-['Inter'] mb-8 max-w-xl mx-auto">
            Join leading manufacturers and retailers who trust Sidekick to train their frontline workers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/qa" className="px-8 py-4 bg-sky-500 rounded-lg flex justify-center items-center gap-2 hover:bg-sky-600 transition shadow-lg">
              <span className="text-white text-lg font-semibold font-['Inter']">Get Started Free</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link href="/contact" className="px-8 py-4 bg-white/10 backdrop-blur border border-white/30 rounded-lg flex justify-center items-center gap-2 hover:bg-white/20 transition">
              <span className="text-white text-lg font-semibold font-['Inter']">Talk to Sales</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-24 py-16 bg-gray-900">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-5 relative">
                <div className="w-3 h-2.5 absolute left-[2.71px] top-[10.59px] bg-white" />
                <div className="w-3 h-2.5 absolute left-[18.35px] top-0 bg-white" />
                <div className="w-2.5 h-2 absolute left-0 top-0 bg-sky-500" />
                <div className="w-2.5 h-2 absolute left-[6.34px] top-[0.78px] bg-sky-500" />
                <div className="w-2.5 h-2.5 absolute left-[12.61px] top-[11.56px] bg-sky-500" />
                <div className="w-2.5 h-2 absolute left-[19.16px] top-[11.01px] bg-sky-500" />
              </div>
              <span className="text-white text-xl font-bold font-['Inter']">Sidekick</span>
            </div>
            <p className="text-gray-400 text-sm font-normal font-['Inter'] leading-6">
              AI-powered onboarding for blue-collar teams. Upload your documents, let workers text questions, get instant answers.
            </p>
          </div>
          
          <div className="flex gap-16">
            <div className="flex flex-col gap-4">
              <h3 className="text-white text-base font-semibold font-['Inter']">Product</h3>
              <div className="flex flex-col gap-3">
                <Link href="#features" className="text-gray-400 text-sm font-normal font-['Inter'] hover:text-white transition">Features</Link>
                <Link href="#pricing" className="text-gray-400 text-sm font-normal font-['Inter'] hover:text-white transition">Pricing</Link>
                <Link href="#demo" className="text-gray-400 text-sm font-normal font-['Inter'] hover:text-white transition">Demo</Link>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-white text-base font-semibold font-['Inter']">Company</h3>
              <div className="flex flex-col gap-3">
                <Link href="/about" className="text-gray-400 text-sm font-normal font-['Inter'] hover:text-white transition">About</Link>
                <Link href="/contact" className="text-gray-400 text-sm font-normal font-['Inter'] hover:text-white transition">Contact</Link>
                <Link href="/careers" className="text-gray-400 text-sm font-normal font-['Inter'] hover:text-white transition">Careers</Link>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-white text-base font-semibold font-['Inter']">Legal</h3>
              <div className="flex flex-col gap-3">
                <Link href="/terms" className="text-gray-400 text-sm font-normal font-['Inter'] hover:text-white transition">Terms</Link>
                <Link href="/privacy" className="text-gray-400 text-sm font-normal font-['Inter'] hover:text-white transition">Privacy</Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm font-normal font-['Inter']">© 2025 Sidekick AI. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-white transition">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
