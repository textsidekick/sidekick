"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const calLink = "https://cal.com/justin-so-xnr0oc/sidekick-demo";
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap');
        
        :root {
          --accent: #3b82f6;
          --accent-light: #60a5fa;
          --accent-dark: #2563eb;
        }
        
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59,130,246,0.4), 0 0 40px rgba(59,130,246,0.2); }
          50% { box-shadow: 0 0 40px rgba(59,130,246,0.6), 0 0 80px rgba(59,130,246,0.3); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-marquee { animation: marquee 30s linear infinite; }
        
        .slide-up { animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .scale-in { animation: scale-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-800 { animation-delay: 0.8s; }
        
        .opacity-0-start { opacity: 0; }
        
        .gradient-text {
          background: linear-gradient(135deg, #fff 0%, #3b82f6 50%, #60a5fa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .gradient-text-animated {
          background: linear-gradient(135deg, #fff, #3b82f6, #60a5fa, #fff);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 6s ease infinite;
        }
        
        .glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        .glass-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .glass-blue {
          background: linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.05) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        
        .grid-bg {
          background-image: 
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        
        .grid-bg-blue {
          background-image: 
            linear-gradient(rgba(59,130,246,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.08) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        
        .hover-lift {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(59, 130, 246, 0.4);
        }
        
        .btn-outline {
          border: 1px solid rgba(59, 130, 246, 0.5);
          transition: all 0.3s ease;
        }
        .btn-outline:hover {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.8);
        }
        
        .blue-glow {
          box-shadow: 0 0 60px rgba(59, 130, 246, 0.3), 0 0 120px rgba(59, 130, 246, 0.1);
        }
      `}</style>

      {/* Fixed Background Grid */}
      <div className="fixed inset-0 grid-bg opacity-60 pointer-events-none" />
      
      {/* Animated Background Orbs with Parallax */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)',
            top: '5%',
            left: '15%',
            transform: `translate(${scrollY * 0.05}px, ${scrollY * 0.02}px)`,
          }}
        />
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(96,165,250,0.5) 0%, transparent 70%)',
            top: '50%',
            right: '5%',
            transform: `translate(${-scrollY * 0.08}px, ${scrollY * 0.03}px)`,
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-10 blur-2xl"
          style={{
            background: 'radial-gradient(circle, rgba(37,99,235,0.6) 0%, transparent 70%)',
            bottom: '10%',
            left: '40%',
            transform: `translate(${scrollY * 0.1}px, ${-scrollY * 0.05}px)`,
          }}
        />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 glass rounded-full px-2 py-2 transition-all duration-500 ${scrollY > 100 ? 'bg-zinc-900/90 shadow-2xl shadow-blue-500/10' : ''} ${isLoaded ? 'slide-up' : 'opacity-0'}`}>
        <div className="flex items-center gap-1">
          <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="font-bold text-white text-sm font-display">S</span>
            </div>
            <span className="font-display font-semibold text-white hidden sm:block">Sidekick</span>
          </Link>
          <div className="hidden md:flex items-center">
            <Link href="/about" className="px-4 py-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium">About</Link>
            <Link href="/contact" className="px-4 py-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium">Contact</Link>
          </div>
          <a href={calLink} target="_blank" rel="noopener noreferrer" className="btn-primary px-5 py-2.5 rounded-full text-white font-semibold text-sm">
            Book Demo
          </a>
        </div>
      </nav>

      {/* Hero Section with Parallax Background */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-20 overflow-hidden">
        {/* Hero Background Image */}
        <div 
          className="absolute inset-0"
          style={{ transform: `translateY(${scrollY * 0.4}px)` }}
        >
          <Image
            src="https://images.unsplash.com/photo-1504917595217-d4dc5ebb6122?w=1920&q=80"
            alt="Industrial background"
            fill
            className="object-cover opacity-25"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/90 to-zinc-950" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 glass-blue px-4 py-2 rounded-full mb-8 ${isLoaded ? 'slide-up opacity-0-start' : 'opacity-0'}`}>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm text-blue-200 font-medium font-body">AI-Powered Onboarding for Blue-Collar Teams</span>
          </div>

          {/* Main Heading */}
          <h1 className={`font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-8 ${isLoaded ? 'slide-up delay-100 opacity-0-start' : 'opacity-0'}`}>
            <span className="block text-white">Every question</span>
            <span className="block gradient-text-animated">answered right.</span>
          </h1>

          {/* Subheading */}
          <p className={`font-body text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed ${isLoaded ? 'slide-up delay-200 opacity-0-start' : 'opacity-0'}`}>
            Our AI reads your handbooks, understands your policies, and answers worker questions instantly via SMS. <span className="text-blue-400">No app needed.</span>
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 ${isLoaded ? 'slide-up delay-300 opacity-0-start' : 'opacity-0'}`}>
            <a href={calLink} target="_blank" rel="noopener noreferrer" className="btn-primary px-8 py-4 rounded-xl text-white font-bold text-lg shadow-xl shadow-blue-500/25 flex items-center gap-2">
              Book a Demo
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
            <Link href="/contact" className="group px-8 py-4 rounded-xl text-zinc-300 font-semibold text-lg btn-outline flex items-center gap-2">
              Contact Sales <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {/* Hero Image - Browser Mockup with Parallax */}
          <div className={`relative mx-auto max-w-4xl ${isLoaded ? 'scale-in delay-400 opacity-0-start' : 'opacity-0'}`}>
            <div className="relative blue-glow rounded-2xl">
              <div className="relative glass-card rounded-2xl overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-zinc-900/50">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 bg-zinc-800 rounded-full text-xs text-zinc-500">sidekick-phi.vercel.app</div>
                  </div>
                </div>
                {/* Main image with parallax */}
                <div className="relative aspect-video overflow-hidden">
                  <Image 
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=90" 
                    alt="Manufacturing worker" 
                    fill 
                    className="object-cover" 
                    style={{ transform: `scale(1.1) translateY(${scrollY * 0.08}px)` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                  
                  {/* Floating Chat Bubbles */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="glass-blue p-4 rounded-xl animate-float blue-glow">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">💬</div>
                        <div>
                          <p className="text-sm text-blue-300 mb-1">New question from worker</p>
                          <p className="text-white font-medium">&quot;Where do I park on my first day?&quot;</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute top-6 right-6 max-w-xs animate-float-slow" style={{ animationDelay: '1s' }}>
                    <div className="glass p-3 rounded-xl">
                      <p className="text-sm text-zinc-300">✓ Answered in 2 seconds</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 ${isLoaded ? 'slide-up delay-800 opacity-0-start' : 'opacity-0'}`}>
          <div className="flex flex-col items-center gap-2 text-zinc-500">
            <span className="text-xs uppercase tracking-wider">Scroll</span>
            <div className="w-6 h-10 rounded-full border-2 border-blue-500/30 flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-blue-500 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-16 border-y border-zinc-800/50 overflow-hidden relative">
        <div className="absolute inset-0 grid-bg-blue opacity-30" />
        <div className="mb-8 text-center relative z-10">
          <p className="text-zinc-500 text-sm uppercase tracking-wider font-medium">Trusted by leading companies</p>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-20 animate-marquee">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-20">
                <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                  <Image src="/logos/eds.png" alt="EDS" width={48} height={48} className="object-contain rounded-lg" />
                  <span className="text-zinc-400 font-medium whitespace-nowrap">EDS Manufacturing</span>
                </div>
                <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                  <Image src="/logos/trinethra.png" alt="Trinethra" width={48} height={48} className="object-contain rounded-lg" />
                  <span className="text-zinc-400 font-medium whitespace-nowrap">Trinethra Supermarket</span>
                </div>
                <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                  <Image src="/logos/jfm.png" alt="JFM" width={48} height={48} className="object-contain rounded-lg" />
                  <span className="text-zinc-400 font-medium whitespace-nowrap">Jim Falk Motors</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works with Parallax Background */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ transform: `translateY(${(scrollY - 800) * 0.15}px)` }}
        >
          <Image
            src="https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1920&q=80"
            alt="Warehouse background"
            fill
            className="object-cover opacity-15"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-950" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <span className="text-blue-500 text-sm font-semibold uppercase tracking-wider mb-4 block">How It Works</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">Simple setup. <span className="text-zinc-500">Powerful results.</span></h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Upload", desc: "Drop in your handbooks, SOPs, and safety manuals.", icon: "📄" },
              { step: "02", title: "AI Learns", desc: "Our AI classifies and builds your knowledge base.", icon: "🧠" },
              { step: "03", title: "Workers Ask", desc: "Team texts questions via SMS. No app needed.", icon: "💬" },
              { step: "04", title: "Track ROI", desc: "Monitor usage and identify training gaps.", icon: "📊" },
            ].map((item, i) => (
              <div key={i} className="group glass-card rounded-2xl p-8 hover-lift hover:border-blue-500/30 transition-colors">
                <div className="text-5xl mb-6">{item.icon}</div>
                <div className="text-blue-500 text-xs font-bold uppercase tracking-wider mb-2">Step {item.step}</div>
                <h3 className="font-display text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed font-body">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats with Worker Background Images */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-blue-500/5 to-blue-600/10" />
        <div className="absolute inset-0 grid-bg-blue opacity-50" />
        
        {/* Parallax Side Images */}
        <div 
          className="absolute left-0 top-0 w-1/3 h-full opacity-20"
          style={{ transform: `translateY(${(scrollY - 1600) * 0.12}px)` }}
        >
          <Image
            src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80"
            alt="Worker"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-zinc-950" />
        </div>
        <div 
          className="absolute right-0 top-0 w-1/3 h-full opacity-20"
          style={{ transform: `translateY(${(scrollY - 1600) * 0.08}px)` }}
        >
          <Image
            src="https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=800&q=80"
            alt="Worker"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-zinc-950 via-zinc-950/80 to-zinc-950" />
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "70%", label: "Faster Onboarding" },
              { value: "50%", label: "Fewer Incidents" },
              { value: "$15K", label: "Annual Savings" },
              { value: "24/7", label: "Availability" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-5xl md:text-6xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-zinc-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries with Large Parallax Images */}
      <section className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-blue-500 text-sm font-semibold uppercase tracking-wider mb-4 block">Industries</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">Built for teams <span className="text-zinc-500">that build America.</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: "Manufacturing", 
                icon: "🏭", 
                items: ["Safety protocols", "Equipment SOPs", "Quality control"],
                image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop"
              },
              { 
                title: "Retail", 
                icon: "🛒", 
                items: ["Store policies", "Inventory management", "Customer service"],
                image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop"
              },
              { 
                title: "Automotive", 
                icon: "🔧", 
                items: ["Repair procedures", "Parts lookup", "Compliance docs"],
                image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop"
              },
            ].map((industry, index) => (
              <div key={index} className="group relative rounded-2xl overflow-hidden hover-lift">
                <div className="relative h-72">
                  <Image
                    src={industry.image}
                    alt={industry.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                  <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/20 transition-colors duration-300" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{industry.icon}</span>
                    <h3 className="font-display text-2xl font-bold text-white">{industry.title}</h3>
                  </div>
                  <ul className="space-y-1">
                    {industry.items.map((item, i) => (
                      <li key={i} className="text-zinc-400 text-sm flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-blue-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <span className="text-blue-500 text-sm font-semibold uppercase tracking-wider mb-4 block">Customer Success</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">Real teams. <span className="text-zinc-500">Real results.</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: "Sidekick cut our onboarding time by 70%. New hires get answers instantly.", name: "Plant Manager", company: "EDS Manufacturing", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop", logo: "/logos/eds.png" },
              { quote: "With Sidekick, new employees feel confident from day one. Complaints dropped 50%.", name: "Store Director", company: "Trinethra Supermarket", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop", logo: "/logos/trinethra.png" },
              { quote: "Technicians text and get answers in seconds. Productivity is through the roof.", name: "Service Manager", company: "Jim Falk Motors", image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop", logo: "/logos/jfm.png" },
            ].map((item, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden hover-lift hover:border-blue-500/20 transition-all">
                <div className="relative h-48">
                  <Image src={item.image} alt={item.company} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <Image src={item.logo} alt={item.company} width={40} height={40} className="rounded-lg bg-white p-1" />
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-zinc-300 mb-6 leading-relaxed font-body">&quot;{item.quote}&quot;</p>
                  <p className="text-white font-semibold">{item.name}</p>
                  <p className="text-zinc-500 text-sm">{item.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 grid-bg-blue opacity-30" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <span className="text-blue-500 text-sm font-semibold uppercase tracking-wider mb-4 block">Features</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">Everything you need.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "📚", title: "Document Intelligence", desc: "AI auto-classifies handbooks and SOPs" },
              { icon: "💬", title: "SMS Q&A", desc: "Workers text questions, get instant answers" },
              { icon: "🌍", title: "Multi-Language", desc: "English, Spanish, Chinese, and 10+ languages" },
              { icon: "📊", title: "Manager Dashboard", desc: "Track questions and measure ROI" },
              { icon: "🔒", title: "Enterprise Security", desc: "SOC 2 compliant, encrypted data" },
              { icon: "⚡", title: "Instant Setup", desc: "Get started in 5 minutes" },
            ].map((f, i) => (
              <div key={i} className="glass-card rounded-2xl p-8 hover-lift group hover:border-blue-500/30 transition-colors">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-display text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{f.title}</h3>
                <p className="text-zinc-400 font-body">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA with Parallax Background */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ transform: `translateY(${(scrollY - 4500) * 0.15}px)` }}
        >
          <Image
            src="https://images.unsplash.com/photo-1504917595217-d4dc5ebb6122?w=1920&q=80"
            alt="Industrial"
            fill
            className="object-cover opacity-30"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-blue-950/30 to-zinc-950" />
        <div className="absolute inset-0 grid-bg-blue opacity-50" />
        
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 60%)' }}
        />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">Ready to transform your onboarding?</h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto font-body">Join companies that trust Sidekick to train their teams faster and smarter.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={calLink} target="_blank" rel="noopener noreferrer" className="btn-primary px-10 py-5 rounded-xl text-white font-bold text-lg animate-pulse-glow flex items-center gap-2">
              Book a Demo
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
            <Link href="/contact" className="px-10 py-5 rounded-xl text-zinc-300 font-semibold text-lg btn-outline">Talk to Sales</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-16 px-6 relative">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <span className="font-bold text-white font-display">S</span>
                </div>
                <span className="font-display font-bold text-xl text-white">Sidekick</span>
              </Link>
              <p className="text-zinc-500 max-w-sm font-body leading-relaxed">AI-powered onboarding for blue-collar teams.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href={calLink} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-blue-400 transition-colors">Book Demo</a></li>
                <li><Link href="/about" className="text-zinc-500 hover:text-blue-400 transition-colors">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-zinc-500 hover:text-blue-400 transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="text-zinc-500 hover:text-blue-400 transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-800/50 pt-8 text-center">
            <p className="text-zinc-600 text-sm">© 2025 Sidekick AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
