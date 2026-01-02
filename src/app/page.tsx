"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { 
  FileText, 
  Brain, 
  MessageSquare, 
  BarChart3, 
  ArrowRight, 
  Check,
  Zap,
  Shield,
  Globe,
  Clock,
  Factory,
  ShoppingCart,
  Wrench,
  Users,
  TrendingUp
} from "lucide-react";

export default function Home() {
  const calLink = "https://cal.com/justin-so-xnr0oc/sidekick-demo";
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const isInside = e.clientY < rect.bottom + 100;
        if (isInside) {
          setMousePosition({
            x: e.clientX,
            y: e.clientY - rect.top,
          });
        }
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 overflow-x-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fade-up 0.6s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; opacity: 0; }
        .delay-200 { animation-delay: 0.2s; opacity: 0; }
        .delay-300 { animation-delay: 0.3s; opacity: 0; }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-[#fafafa]/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white text-sm">S</span>
            </div>
            <span className="font-semibold text-zinc-900">Sidekick</span>
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/about" className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors">About</Link>
            <Link href="/contact" className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors">Contact</Link>
            <a 
              href={calLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Book Demo
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section 
        ref={heroRef}
        className="relative pt-28 pb-24 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #f0f7ff 0%, #fafafa 100%)' }}
      >
        {/* Cursor-following gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute transition-all duration-300 ease-out"
            style={{
              width: '800px',
              height: '800px',
              left: mousePosition.x - 400,
              top: mousePosition.y - 400,
              background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(59,130,246,0.1) 30%, transparent 60%)',
              borderRadius: '50%',
              filter: 'blur(60px)',
            }}
          />
          <div 
            className="absolute transition-all duration-500 ease-out"
            style={{
              width: '600px',
              height: '600px',
              left: mousePosition.x - 300 + 100,
              top: mousePosition.y - 300 - 80,
              background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.05) 40%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(60px)',
            }}
          />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-200/20 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className={`text-center max-w-3xl mx-auto mb-14 ${isLoaded ? 'fade-up' : 'opacity-0'}`}>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-zinc-200 px-4 py-2 rounded-full text-sm text-zinc-600 font-medium mb-6 shadow-sm">
              <Zap className="w-4 h-4 text-blue-600" />
              AI-Powered Onboarding Assistant
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
              Every question
              <br />
              <span className="text-blue-600">answered right.</span>
            </h1>
            
            <p className="text-xl text-zinc-500 mb-10 leading-relaxed max-w-xl mx-auto">
              Our AI reads your handbooks and answers worker questions instantly via SMS. No app. No training required.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <a 
                href={calLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20"
              >
                Book a Demo <ArrowRight className="w-4 h-4" />
              </a>
              <Link 
                href="/contact"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-medium bg-white border border-zinc-200 hover:border-zinc-300 transition-all shadow-sm"
              >
                Contact Sales
              </Link>
            </div>
          </div>

          {/* Product cards */}
          <div className={`grid md:grid-cols-2 gap-6 max-w-3xl mx-auto ${isLoaded ? 'fade-up delay-200' : 'opacity-0'}`}>
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-zinc-900 mb-2">SMS Q&A for Workers</h3>
              <p className="text-sm text-zinc-500 mb-4">Instant answers to policy questions via text message. No app download needed.</p>
              <a href="#demo" className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
                Learn more <ArrowRight className="w-3 h-3" />
              </a>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-zinc-900 mb-2">Analytics for Managers</h3>
              <p className="text-sm text-zinc-500 mb-4">Track common questions, identify training gaps, and measure onboarding ROI.</p>
              <a href="#features" className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
                Learn more <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Logos */}
      <section className="py-12 px-6 bg-[#fafafa]">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-zinc-400 text-xs font-medium uppercase tracking-wider mb-6">Trusted by leading companies</p>
          <div className="flex items-center justify-center gap-12 flex-wrap">
            {[
              { src: "/logos/eds.png", name: "EDS Manufacturing" },
              { src: "/logos/trinethra.png", name: "Trinethra" },
              { src: "/logos/jfm.png", name: "Jim Falk Motors" },
            ].map((logo, i) => (
              <div key={i} className="flex items-center gap-2 opacity-50 hover:opacity-80 transition-opacity">
                <Image src={logo.src} alt={logo.name} width={32} height={32} className="object-contain rounded" />
                <span className="text-zinc-500 font-medium text-sm">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DARK SECTION 1 - Demo */}
      <section id="demo" className="relative py-28 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80)' }}
        />
        <div className="absolute inset-0 bg-zinc-950/90" />
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `linear-gradient(rgba(59,130,246,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.07) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Instant answers for your workforce</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Workers text questions about policies, procedures, and safety—and get accurate answers in seconds.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              <div className="relative h-48">
                <Image
                  src="https://images.unsplash.com/photo-1504917595217-d4dc5ebb6122?w=800&q=80"
                  alt="Manufacturing"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur rounded-xl p-4 shadow-lg border border-zinc-100">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Incoming SMS
                  </div>
                  <p className="text-sm text-zinc-700">&quot;Where do I park on my first day?&quot;</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-zinc-900 mb-1">SMS Support</h3>
                <p className="text-sm text-zinc-500">Workers text questions and receive instant, accurate responses from your company docs.</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              <div className="relative h-48">
                <Image
                  src="https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&q=80"
                  alt="Warehouse"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur rounded-xl p-4 shadow-lg border border-zinc-100">
                  <div className="flex items-center gap-2 text-xs text-blue-600 mb-1">
                    <Check className="w-3 h-3" />
                    Answered in 2s
                  </div>
                  <p className="text-sm text-zinc-700">&quot;Park in Lot B. Your badge activates at 8am.&quot;</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-zinc-900 mb-1">AI Responses</h3>
                <p className="text-sm text-zinc-500">Powered by your handbooks, SOPs, and safety manuals. Always accurate.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-28 px-6 bg-[#fafafa]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">How it works</h2>
            <p className="text-zinc-500 max-w-lg mx-auto">Get started in minutes, not months. Simple setup with powerful results.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: FileText, num: '01', title: 'Upload documents', desc: 'Drop in handbooks, SOPs, safety manuals' },
              { icon: Brain, num: '02', title: 'AI processes', desc: 'Automatically classifies and indexes content' },
              { icon: MessageSquare, num: '03', title: 'Workers ask', desc: 'Text any question via SMS' },
              { icon: BarChart3, num: '04', title: 'Track insights', desc: 'Monitor usage and identify gaps' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-white border border-zinc-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <item.icon className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-xs text-blue-600 font-semibold mb-2">{item.num}</p>
                <h3 className="font-semibold text-zinc-900 mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DARK SECTION 2 - Stats & Industries */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-zinc-950" />
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
        {/* Abstract network SVG */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-96 opacity-20">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <circle cx="100" cy="100" r="4" fill="#3b82f6" />
            <circle cx="200" cy="150" r="4" fill="#3b82f6" />
            <circle cx="150" cy="250" r="4" fill="#3b82f6" />
            <circle cx="300" cy="200" r="4" fill="#3b82f6" />
            <circle cx="250" cy="300" r="4" fill="#3b82f6" />
            <circle cx="350" cy="100" r="3" fill="#3b82f6" />
            <circle cx="80" cy="320" r="3" fill="#3b82f6" />
            <line x1="100" y1="100" x2="200" y2="150" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
            <line x1="200" y1="150" x2="150" y2="250" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
            <line x1="200" y1="150" x2="300" y2="200" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
            <line x1="300" y1="200" x2="250" y2="300" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
            <line x1="150" y1="250" x2="250" y2="300" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
            <line x1="100" y1="100" x2="350" y2="100" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
            <line x1="150" y1="250" x2="80" y2="320" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
          </svg>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Built for frontline teams</h2>
              <p className="text-zinc-400 mb-10">
                80% of the global workforce doesn&apos;t sit at a desk. We built Sidekick for them—instant answers via SMS, no app required.
              </p>
              
              <div className="space-y-4">
                {[
                  { label: 'Faster onboarding', value: '70%' },
                  { label: 'Reduction in incidents', value: '50%' },
                  { label: 'Annual savings per site', value: '$15K' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-zinc-800">
                    <span className="text-zinc-400">{stat.label}</span>
                    <span className="text-3xl font-bold text-blue-400">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { icon: Factory, title: 'Manufacturing', desc: 'Safety protocols, equipment SOPs, quality control' },
                { icon: ShoppingCart, title: 'Retail', desc: 'Store policies, inventory, customer service' },
                { icon: Wrench, title: 'Automotive', desc: 'Repair procedures, parts lookup, compliance' },
              ].map((item, i) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 flex items-start gap-4 hover:border-zinc-700 transition-colors">
                  <div className="w-11 h-11 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                    <p className="text-sm text-zinc-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-28 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Platform your team will trust</h2>
            <p className="text-zinc-500 max-w-lg mx-auto">Enterprise-ready security and reliability without sacrificing ease of use.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'SOC 2 and privacy first', desc: 'Your data stays yours. Enterprise-grade security and compliance.' },
              { icon: Globe, title: 'Multi-language support', desc: 'English, Spanish, Chinese, and 10+ more languages supported.' },
              { icon: Zap, title: 'Instant setup', desc: 'Go live in under 5 minutes. No IT department required.' },
              { icon: Users, title: 'Unlimited users', desc: 'Scale to your entire workforce with no per-seat pricing.' },
              { icon: FileText, title: 'Document intelligence', desc: 'AI automatically classifies and indexes your content.' },
              { icon: TrendingUp, title: 'Insights & analytics', desc: 'Track questions, identify gaps, measure ROI.' },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all bg-white">
                <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-zinc-600" />
                </div>
                <h3 className="font-semibold text-zinc-900 mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-[#fafafa]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">What our customers say</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "Sidekick cut our onboarding time by 70%. New hires get answers instantly instead of hunting down supervisors.", name: "Plant Manager", company: "EDS Manufacturing", logo: "/logos/eds.png" },
              { quote: "With Sidekick, new employees feel confident from day one. Questions about store policies are answered in seconds.", name: "Store Director", company: "Trinethra Supermarket", logo: "/logos/trinethra.png" },
              { quote: "Our technicians text questions and get accurate answers immediately. Productivity is through the roof.", name: "Service Manager", company: "Jim Falk Motors", logo: "/logos/jfm.png" },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-xl bg-white border border-zinc-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <Image src={item.logo} alt={item.company} width={40} height={40} className="rounded" />
                  <div>
                    <p className="font-semibold text-zinc-900 text-sm">{item.name}</p>
                    <p className="text-zinc-500 text-xs">{item.company}</p>
                  </div>
                </div>
                <p className="text-zinc-600 text-sm leading-relaxed">&quot;{item.quote}&quot;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to transform your onboarding?</h2>
          <p className="text-zinc-400 mb-8">Join leading companies using Sidekick to train teams faster.</p>
          <a
            href={calLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white hover:bg-zinc-100 text-zinc-900 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Book a Demo <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-zinc-950">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-white text-sm">S</span>
                </div>
                <span className="font-semibold text-white">Sidekick</span>
              </Link>
              <p className="text-zinc-500 text-sm max-w-xs">AI-powered onboarding assistant for blue-collar teams.</p>
            </div>
            
            <div className="flex gap-16">
              <div>
                <h4 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-3">Company</h4>
                <ul className="space-y-2">
                  <li><Link href="/about" className="text-zinc-500 text-sm hover:text-white transition-colors">About</Link></li>
                  <li><Link href="/contact" className="text-zinc-500 text-sm hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-3">Resources</h4>
                <ul className="space-y-2">
                  <li><Link href="/privacy" className="text-zinc-500 text-sm hover:text-white transition-colors">Privacy</Link></li>
                  <li><Link href="/terms" className="text-zinc-500 text-sm hover:text-white transition-colors">Terms</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-zinc-800 mt-12 pt-8">
            <p className="text-zinc-600 text-xs text-center">© 2025 Sidekick AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
