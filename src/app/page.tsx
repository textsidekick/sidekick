import Link from "next/link";

// Logo Component
function Logo({ className = "", size = 48 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Chat bubble */}
      <path d="M4 8 Q4 4 8 4 L40 4 Q44 4 44 8 L44 32 Q44 36 40 36 L16 36 L8 44 L8 36 Q4 36 4 32 Z" fill="#0ea5e9"/>
      {/* Glasses bridge */}
      <rect x="20" y="16" width="8" height="3" rx="1.5" fill="white"/>
      {/* Left lens */}
      <circle cx="15" cy="17" r="7" stroke="white" strokeWidth="3" fill="none"/>
      {/* Right lens */}
      <circle cx="33" cy="17" r="7" stroke="white" strokeWidth="3" fill="none"/>
      {/* Eyes */}
      <circle cx="15" cy="16" r="2.5" fill="#1e293b"/>
      <circle cx="33" cy="16" r="2.5" fill="#1e293b"/>
      {/* Eye shine */}
      <circle cx="16" cy="15" r="1" fill="white"/>
      <circle cx="34" cy="15" r="1" fill="white"/>
      {/* Smile */}
      <path d="M19 28 Q24 31 29 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

// Logo for dark backgrounds (footer)
function LogoWhite({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 8 Q4 4 8 4 L40 4 Q44 4 44 8 L44 32 Q44 36 40 36 L16 36 L8 44 L8 36 Q4 36 4 32 Z" fill="#0ea5e9"/>
      <rect x="20" y="16" width="8" height="3" rx="1.5" fill="white"/>
      <circle cx="15" cy="17" r="7" stroke="white" strokeWidth="3" fill="none"/>
      <circle cx="33" cy="17" r="7" stroke="white" strokeWidth="3" fill="none"/>
      <circle cx="15" cy="16" r="2.5" fill="#1e293b"/>
      <circle cx="33" cy="16" r="2.5" fill="#1e293b"/>
      <circle cx="16" cy="15" r="1" fill="white"/>
      <circle cx="34" cy="15" r="1" fill="white"/>
      <path d="M19 28 Q24 31 29 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-fade-in-left {
          animation: fadeInLeft 0.8s ease-out forwards;
        }
        
        .animate-fade-in-right {
          animation: fadeInRight 0.8s ease-out forwards;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse 3s ease-in-out infinite;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.6s ease-out forwards;
        }
        
        .animate-slide-in {
          animation: slideInFromBottom 0.8s ease-out forwards;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        }
        
        .hover-scale {
          transition: transform 0.3s ease;
        }
        
        .hover-scale:hover {
          transform: scale(1.05);
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Navigation */}
      <nav className="w-full px-6 md:px-24 py-3 bg-white/80 backdrop-blur-md shadow-[0px_4px_8px_0px_rgba(171,190,209,0.40)] flex justify-center items-center gap-11 sticky top-0 z-50 animate-fade-in-up">
        <Link href="/" className="flex items-center gap-2 hover-scale">
          <Logo size={32} />
          <span className="text-gray-800 text-xl font-bold font-['Inter']">Sidekick</span>
        </Link>
        <div className="flex-1 flex justify-end items-center gap-6">
          <div className="hidden md:flex items-start gap-6">
            <Link href="#features" className="text-neutral-600 text-sm font-medium font-['Inter'] hover:text-sky-500 transition-colors duration-300">Features</Link>
            <Link href="#demo" className="text-neutral-600 text-sm font-medium font-['Inter'] hover:text-sky-500 transition-colors duration-300">Demo</Link>
            <Link href="#pricing" className="text-neutral-600 text-sm font-medium font-['Inter'] hover:text-sky-500 transition-colors duration-300">Pricing</Link>
            <Link href="/about" className="text-neutral-600 text-sm font-medium font-['Inter'] hover:text-sky-500 transition-colors duration-300">About</Link>
          </div>
          <Link href="/qa" className="px-6 py-2.5 bg-sky-500 rounded-lg flex justify-center items-center gap-1.5 hover:bg-sky-600 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/25">
            <span className="text-white text-sm font-medium font-['Inter']">Try Demo</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/85 via-gray-900/70 to-gray-900/50" />
        </div>
        
        <div className="relative z-10 px-6 md:px-24 py-20 max-w-2xl">
          <div className="animate-float mb-6">
            <Logo size={80} className="drop-shadow-2xl" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-['Inter'] leading-tight mb-6 animate-fade-in-up">
            <span className="text-white">Smart onboarding for </span>
            <span className="text-sky-400">blue-collar teams</span>
          </h1>
          <p className="text-gray-200 text-lg md:text-xl font-normal font-['Inter'] leading-7 mb-8 animate-fade-in-up delay-200 opacity-0" style={{ animationFillMode: 'forwards' }}>
            AI-powered document intelligence that understands your workplace procedures. Workers text questions, get instant answers from company handbooks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300 opacity-0" style={{ animationFillMode: 'forwards' }}>
            <Link href="/qa" className="px-8 py-4 bg-sky-500 rounded-lg flex justify-center items-center gap-2 hover:bg-sky-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-sky-500/25 hover:-translate-y-1">
              <span className="text-white text-base font-semibold font-['Inter']">Request Demo</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link href="#demo" className="px-8 py-4 bg-white/10 backdrop-blur border border-white/30 rounded-lg flex justify-center items-center gap-2 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
              <span className="text-white text-base font-semibold font-['Inter']">Watch Demo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="px-6 md:px-24 py-16 bg-white flex flex-col justify-start items-center gap-6">
        <p className="text-center text-neutral-500 text-sm font-medium font-['Inter'] uppercase tracking-wider animate-fade-in-up">Trusted by industry leaders</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {["EDS Manufacturing", "Trinethra Supermarket"].map((name, i) => (
            <span key={name} className={`text-2xl font-bold text-gray-300 font-['Inter'] animate-fade-in-up delay-${(i + 1) * 100} opacity-0 hover:text-gray-400 transition-colors duration-300`} style={{ animationFillMode: 'forwards' }}>
              {name}
            </span>
          ))}
          <span className="text-2xl font-bold text-gray-200 border-2 border-dashed border-gray-200 px-6 py-3 rounded-lg font-['Inter'] animate-fade-in-up delay-300 opacity-0 hover:border-sky-300 hover:text-sky-400 transition-all duration-300 cursor-pointer" style={{ animationFillMode: 'forwards' }}>
            Your Company
          </span>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative">
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
            <h2 className="text-3xl md:text-4xl font-semibold font-['Inter'] text-neutral-800 mb-4 animate-fade-in-up">
              One platform for <span className="gradient-text">every industry</span>
            </h2>
            <p className="text-neutral-600 text-lg font-normal font-['Inter'] animate-fade-in-up delay-100 opacity-0" style={{ animationFillMode: 'forwards' }}>Who is Sidekick suitable for?</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { icon: "🏭", title: "Manufacturing", desc: "Safety protocols, equipment SOPs, quality control procedures", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80" },
              { icon: "🛒", title: "Retail", desc: "Store policies, inventory procedures, customer service guides", image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&q=80" },
              { icon: "🔧", title: "Field Services", desc: "Service manuals, safety guidelines, client protocols", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80" },
            ].map((item, i) => (
              <div key={item.title} className={`w-80 bg-white rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.08)] overflow-hidden hover-lift group animate-fade-in-up delay-${(i + 1) * 100} opacity-0`} style={{ animationFillMode: 'forwards' }}>
                <div className="h-40 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center text-2xl mb-4 -mt-12 relative z-10 shadow-md group-hover:scale-110 transition-transform duration-300">
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

      {/* Stats Section */}
      <section className="relative py-20 overflow-hidden">
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
            <h2 className="text-3xl md:text-4xl font-semibold font-['Inter'] text-white mb-4 animate-fade-in-up">
              Helping businesses reinvent onboarding
            </h2>
            <p className="text-sky-200 text-lg font-normal font-['Inter'] animate-fade-in-up delay-100 opacity-0" style={{ animationFillMode: 'forwards' }}>Real results from real customers</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: "70%", label: "Faster Onboarding" },
              { value: "50%", label: "Fewer Incidents" },
              { value: "$15K", label: "Annual Savings" },
              { value: "95%", label: "Accuracy Rate" },
            ].map((stat, i) => (
              <div key={stat.label} className={`text-center animate-scale-in delay-${(i + 1) * 100} opacity-0 hover-scale`} style={{ animationFillMode: 'forwards' }}>
                <div className="text-4xl md:text-5xl font-bold text-white font-['Inter'] mb-2">{stat.value}</div>
                <div className="text-sky-200 text-sm font-medium font-['Inter']">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature: Document Intelligence */}
      <section className="px-6 md:px-24 py-20 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 animate-fade-in-left">
          <div className="rounded-2xl overflow-hidden shadow-2xl hover-lift">
            <img 
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80" 
              alt="Document management"
              className="w-full h-auto"
            />
          </div>
        </div>
        <div className="flex-1 max-w-lg">
          <div className="inline-block px-4 py-1 bg-sky-100 text-sky-700 text-sm font-medium rounded-full mb-4 animate-fade-in-right">Document Intelligence</div>
          <h2 className="text-neutral-800 text-3xl md:text-4xl font-semibold font-['Inter'] leading-tight mb-6 animate-fade-in-right delay-100 opacity-0" style={{ animationFillMode: 'forwards' }}>
            Upload once, <span className="gradient-text">answer forever</span>
          </h2>
          <p className="text-neutral-600 text-lg font-normal font-['Inter'] leading-7 mb-6 animate-fade-in-right delay-200 opacity-0" style={{ animationFillMode: 'forwards' }}>
            Upload any workplace document - safety manuals, equipment guides, HR policies. Our AI automatically classifies, indexes, and makes everything searchable via simple text questions.
          </p>
          <ul className="space-y-3 mb-8">
            {["Auto-classification of document types", "Smart extraction of procedures", "Instant search across all docs"].map((item, i) => (
              <li key={item} className={`flex items-center gap-3 animate-fade-in-right delay-${(i + 3) * 100} opacity-0`} style={{ animationFillMode: 'forwards' }}>
                <div className="w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center animate-pulse-slow">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M5 12l5 5L20 7"/>
                  </svg>
                </div>
                <span className="text-neutral-600 font-['Inter']">{item}</span>
              </li>
            ))}
          </ul>
          <Link href="/qa" className="px-6 py-3 bg-sky-500 rounded-lg inline-flex items-center gap-2 hover:bg-sky-600 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/25 hover:-translate-y-1 animate-fade-in-right delay-500 opacity-0" style={{ animationFillMode: 'forwards' }}>
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
          <div className="inline-block px-4 py-1 bg-sky-100 text-sky-700 text-sm font-medium rounded-full mb-4 animate-fade-in-left">SMS-First Design</div>
          <h2 className="text-neutral-800 text-3xl md:text-4xl font-semibold font-['Inter'] leading-tight mb-6 animate-fade-in-left delay-100 opacity-0" style={{ animationFillMode: 'forwards' }}>
            No app needed. <span className="gradient-text">Just text.</span>
          </h2>
          <p className="text-neutral-600 text-lg font-normal font-['Inter'] leading-7 mb-6 animate-fade-in-left delay-200 opacity-0" style={{ animationFillMode: 'forwards' }}>
            Your frontline workers don't need to download anything. They simply text their questions and get instant, accurate answers pulled directly from your company documents.
          </p>
          <ul className="space-y-3 mb-8">
            {["Works on any phone", "No training required", "Answers in seconds"].map((item, i) => (
              <li key={item} className={`flex items-center gap-3 animate-fade-in-left delay-${(i + 3) * 100} opacity-0`} style={{ animationFillMode: 'forwards' }}>
                <div className="w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center animate-pulse-slow">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M5 12l5 5L20 7"/>
                  </svg>
                </div>
                <span className="text-neutral-600 font-['Inter']">{item}</span>
              </li>
            ))}
          </ul>
          <Link href="/qa" className="px-6 py-3 bg-sky-500 rounded-lg inline-flex items-center gap-2 hover:bg-sky-600 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/25 hover:-translate-y-1 animate-fade-in-left delay-500 opacity-0" style={{ animationFillMode: 'forwards' }}>
            <span className="text-white font-semibold font-['Inter']">See Demo</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
        <div className="flex-1 animate-fade-in-right">
          <div className="rounded-2xl overflow-hidden shadow-2xl hover-lift">
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
          <h2 className="text-3xl md:text-4xl font-semibold font-['Inter'] text-neutral-800 mb-4 animate-fade-in-up">
            Get started in <span className="gradient-text">3 simple steps</span>
          </h2>
        </div>
        
        <div className="flex flex-col md:flex-row justify-center gap-8 max-w-4xl mx-auto">
          {[
            { num: "1", title: "Upload Documents", desc: "Drop your handbooks, manuals, and procedures into Sidekick", icon: "📄" },
            { num: "2", title: "AI Classifies", desc: "Our AI automatically organizes and indexes everything", icon: "🤖" },
            { num: "3", title: "Workers Ask", desc: "Team texts questions, gets instant accurate answers", icon: "💬" },
          ].map((step, i) => (
            <div key={step.num} className="flex-1 relative">
              <div className={`bg-white rounded-xl p-8 shadow-lg border border-gray-100 h-full hover-lift animate-slide-in delay-${(i + 1) * 100} opacity-0`} style={{ animationFillMode: 'forwards' }}>
                <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                  <span className="text-3xl">{step.icon}</span>
                </div>
                <div className="text-sky-500 text-sm font-bold font-['Inter'] mb-2">STEP {step.num}</div>
                <h3 className="text-neutral-800 text-xl font-bold font-['Inter'] mb-3">{step.title}</h3>
                <p className="text-neutral-500 text-base font-normal font-['Inter'] leading-6">{step.desc}</p>
              </div>
              {i < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-sky-300 text-2xl animate-pulse-slow">→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1920&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/70" />
        </div>
        
        <div className="relative z-10 px-6 md:px-24 text-center">
          <div className="animate-float mb-8">
            <Logo size={64} className="mx-auto drop-shadow-2xl" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-['Inter'] text-white mb-6 max-w-3xl mx-auto animate-fade-in-up">
            Ready to transform your team's onboarding?
          </h2>
          <p className="text-gray-300 text-lg font-normal font-['Inter'] mb-8 max-w-xl mx-auto animate-fade-in-up delay-100 opacity-0" style={{ animationFillMode: 'forwards' }}>
            Join leading manufacturers and retailers who trust Sidekick to train their frontline workers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-200 opacity-0" style={{ animationFillMode: 'forwards' }}>
            <Link href="/qa" className="px-8 py-4 bg-sky-500 rounded-lg flex justify-center items-center gap-2 hover:bg-sky-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-sky-500/25 hover:-translate-y-1">
              <span className="text-white text-lg font-semibold font-['Inter']">Get Started Free</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link href="/contact" className="px-8 py-4 bg-white/10 backdrop-blur border border-white/30 rounded-lg flex justify-center items-center gap-2 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
              <span className="text-white text-lg font-semibold font-['Inter']">Talk to Sales</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-24 py-16 bg-gray-900">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-4 hover-scale">
              <LogoWhite size={40} />
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
                <Link href="#features" className="text-gray-400 text-sm font-normal font-['Inter'] hover:text-white transition-colors duration-300">Features</Link>
                <Link href="#pricing" className="text-gray-400 text-sm font-normal font-['Inter'] hover:text-white transition-colors duration-300">Pricing</Link>
                <Link href="#demo" className="text-gray-400 text-sm font-normal font-['Inter'] hover:text-white transition-colors duration-300">Demo</Link>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-white text-base font-semibold font-['Inter']">Company</h3>
              <div className="flex flex-col gap-3">
                <Link href="/about" className="text-gray-400 text-sm font-normal font-['Inter'] hover:text-white transition-colors duration-300">About</Link>
                <Link href="/contact" className="text-gray-400 text-sm font-normal font-['Inter'] hover:text-white transition-colors duration-300">Contact</Link>
                <Link href="/careers" className="text-gray-400 text-sm font-normal font-['Inter'] hover:text-white transition-colors duration-300">Careers</Link>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-white text-base font-semibold font-['Inter']">Legal</h3>
              <div className="flex flex-col gap-3">
                <Link href="/terms" className="text-gray-400 text-sm font-normal font-['Inter'] hover:text-white transition-colors duration-300">Terms</Link>
                <Link href="/privacy" className="text-gray-400 text-sm font-normal font-['Inter'] hover:text-white transition-colors duration-300">Privacy</Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm font-normal font-['Inter']">© 2025 Sidekick AI. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 hover-scale">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 hover-scale">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
