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
          --accent: #f97316;
          --accent-glow: rgba(249, 115, 22, 0.4);
        }
        
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px var(--accent-glow), 0 0 40px var(--accent-glow); }
          50% { box-shadow: 0 0 40px var(--accent-glow), 0 0 80px var(--accent-glow); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-marquee { animation: marquee 30s linear infinite; }
        
        .slide-up { animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .fade-in { animation: fade-in 1s ease forwards; }
        .scale-in { animation: scale-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-800 { animation-delay: 0.8s; }
        
        .opacity-0-start { opacity: 0; }
        
        .gradient-text {
          background: linear-gradient(135deg, #fff 0%, #f97316 50%, #fb923c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
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
        
        .grid-bg {
          background-image: 
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
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
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(249, 115, 22, 0.4);
        }
        
        .testimonial-card {
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .testimonial-card:hover {
          transform: scale(1.02) translateY(-5px);
          border-color: rgba(249, 115, 22, 0.3);
        }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 glass rounded-full px-2 py-2 transition-all duration-500 ${scrollY > 100 ? 'bg-zinc-900/90 shadow-2xl' : ''} ${isLoaded ? 'slide-up' : 'opacity-0'}`}>
        <div className="flex items-center gap-1">
          <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
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

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%)', transform: `translate(${scrollY * 0.1}px, ${scrollY * 0.05}px)` }} />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className={`inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8 ${isLoaded ? 'slide-up opacity-0-start' : 'opacity-0'}`}>
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-sm text-zinc-300 font-medium font-body">AI-Powered Onboarding for Blue-Collar Teams</span>
          </div>

          <h1 className={`font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-8 ${isLoaded ? 'slide-up delay-100 opacity-0-start' : 'opacity-0'}`}>
            <span className="block text-white">Every question</span>
            <span className="block gradient-text">answered right.</span>
          </h1>

          <p className={`font-body text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed ${isLoaded ? 'slide-up delay-200 opacity-0-start' : 'opacity-0'}`}>
            Our AI reads your handbooks, understands your policies, and answers worker questions instantly via SMS. <span className="text-zinc-300">No app needed.</span>
          </p>

          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 ${isLoaded ? 'slide-up delay-300 opacity-0-start' : 'opacity-0'}`}>
            <a href={calLink} target="_blank" rel="noopener noreferrer" className="btn-primary px-8 py-4 rounded-xl text-white font-bold text-lg shadow-xl flex items-center gap-2">
              Book a Demo
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
            <Link href="/contact" className="group px-8 py-4 rounded-xl text-zinc-300 font-semibold text-lg border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/50 transition-all flex items-center gap-2">
              Contact Sales <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className={`relative mx-auto max-w-4xl ${isLoaded ? 'scale-in delay-400 opacity-0-start' : 'opacity-0'}`}>
            <div className="relative glass-card rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-zinc-800 rounded-full text-xs text-zinc-500">sidekick-phi.vercel.app</div>
                </div>
              </div>
              <div className="relative aspect-video">
                <Image src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=90" alt="Sidekick Dashboard" fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="glass p-4 rounded-xl animate-float">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">💬</div>
                      <div>
                        <p className="text-sm text-zinc-300 mb-1">New question from worker</p>
                        <p className="text-white font-medium">&quot;Where do I park on my first day?&quot;</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 ${isLoaded ? 'fade-in delay-800 opacity-0-start' : 'opacity-0'}`}>
          <div className="flex flex-col items-center gap-2 text-zinc-500">
            <span className="text-xs uppercase tracking-wider">Scroll</span>
            <div className="w-6 h-10 rounded-full border-2 border-zinc-700 flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-zinc-500 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Logos */}
      <section className="py-16 border-y border-zinc-800/50 overflow-hidden">
        <div className="mb-8 text-center">
          <p className="text-zinc-500 text-sm uppercase tracking-wider font-medium">Trusted by leading companies</p>
        </div>
        <div className="relative">
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

      {/* How It Works */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-orange-500 text-sm font-semibold uppercase tracking-wider mb-4 block">How It Works</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">Simple setup. <span className="text-zinc-500">Powerful results.</span></h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Upload", desc: "Drop in your handbooks, SOPs, and safety manuals.", icon: "📄" },
              { step: "02", title: "AI Learns", desc: "Our AI classifies and builds your knowledge base.", icon: "🧠" },
              { step: "03", title: "Workers Ask", desc: "Team texts questions via SMS. No app needed.", icon: "💬" },
              { step: "04", title: "Track ROI", desc: "Monitor usage and identify training gaps.", icon: "📊" },
            ].map((item, i) => (
              <div key={i} className="group glass-card rounded-2xl p-8 hover-lift">
                <div className="text-5xl mb-6">{item.icon}</div>
                <div className="text-orange-500 text-xs font-bold uppercase tracking-wider mb-2">Step {item.step}</div>
                <h3 className="font-display text-xl font-bold text-white mb-3 group-hover:text-orange-500 transition-colors">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed font-body">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent" />
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

      {/* Testimonials */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-orange-500 text-sm font-semibold uppercase tracking-wider mb-4 block">Customer Success</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">Real teams. <span className="text-zinc-500">Real results.</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: "Sidekick cut our onboarding time by 70%. New hires get answers instantly.", name: "Plant Manager", company: "EDS Manufacturing", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop", logo: "/logos/eds.png" },
              { quote: "With Sidekick, new employees feel confident from day one. Complaints dropped 50%.", name: "Store Director", company: "Trinethra Supermarket", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop", logo: "/logos/trinethra.png" },
              { quote: "Technicians text and get answers in seconds. Productivity is through the roof.", name: "Service Manager", company: "Jim Falk Motors", image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop", logo: "/logos/jfm.png" },
            ].map((item, i) => (
              <div key={i} className="testimonial-card glass-card rounded-2xl overflow-hidden">
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

      {/* Features */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <span className="text-orange-500 text-sm font-semibold uppercase tracking-wider mb-4 block">Features</span>
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
              <div key={i} className="glass-card rounded-2xl p-8 hover-lift group">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-display text-xl font-bold text-white mb-2 group-hover:text-orange-500 transition-colors">{f.title}</h3>
                <p className="text-zinc-400 font-body">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-orange-500/10 to-zinc-950" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">Ready to transform your onboarding?</h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto font-body">Join companies that trust Sidekick to train their teams faster and smarter.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={calLink} target="_blank" rel="noopener noreferrer" className="btn-primary px-10 py-5 rounded-xl text-white font-bold text-lg animate-pulse-glow flex items-center gap-2">
              Book a Demo
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
            <Link href="/contact" className="px-10 py-5 rounded-xl text-zinc-300 font-semibold text-lg border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/50 transition-all">Talk to Sales</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <span className="font-bold text-white font-display">S</span>
                </div>
                <span className="font-display font-bold text-xl text-white">Sidekick</span>
              </Link>
              <p className="text-zinc-500 max-w-sm font-body leading-relaxed">AI-powered onboarding for blue-collar teams.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href={calLink} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">Book Demo</a></li>
                <li><Link href="/about" className="text-zinc-500 hover:text-white transition-colors">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-zinc-500 hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="text-zinc-500 hover:text-white transition-colors">Terms</Link></li>
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
