"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
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
  ChevronDown
} from "lucide-react";

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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        body { font-family: 'Inter', sans-serif; }
        
        .grid-bg {
          background-image: 
            linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .slide-up { animation: slide-up 0.6s ease-out forwards; }
        .fade-in { animation: fade-in 0.8s ease-out forwards; }
        
        .delay-100 { animation-delay: 0.1s; opacity: 0; }
        .delay-200 { animation-delay: 0.2s; opacity: 0; }
        .delay-300 { animation-delay: 0.3s; opacity: 0; }
        .delay-400 { animation-delay: 0.4s; opacity: 0; }
      `}</style>

      {/* Fixed Grid Background */}
      <div className="fixed inset-0 grid-bg opacity-60 pointer-events-none" />

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-zinc-950/95 backdrop-blur-sm' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between border-b-2 border-zinc-800">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="font-black text-lg">S</span>
            </div>
            <span className="font-bold text-lg tracking-tight">SIDEKICK</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/about" className="text-zinc-400 hover:text-white text-sm font-semibold uppercase tracking-wider transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-zinc-400 hover:text-white text-sm font-semibold uppercase tracking-wider transition-colors">
              Contact
            </Link>
            <a 
              href={calLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-md text-sm font-bold uppercase tracking-wider transition-colors"
            >
              Book Demo
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-6 pt-20">
        {/* Background Image with Parallax */}
        <div 
          className="absolute inset-0 z-0"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <Image
            src="https://images.unsplash.com/photo-1504917595217-d4dc5ebb6122?w=1920&q=80"
            alt="Industrial background"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 via-zinc-950/80 to-zinc-950" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className={isLoaded ? 'slide-up' : 'opacity-0'}>
              <div className="inline-flex items-center gap-2 bg-blue-600/10 border-2 border-blue-600/30 px-4 py-2 rounded-md text-sm text-blue-400 font-semibold uppercase tracking-wider mb-8">
                <Zap className="w-4 h-4" />
                AI-Powered Onboarding
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[0.9]">
                EVERY
                <br />
                QUESTION
                <br />
                <span className="text-blue-500">ANSWERED.</span>
              </h1>
              
              <p className="text-lg text-zinc-400 mb-10 leading-relaxed max-w-lg">
                Our AI reads your handbooks and answers worker questions instantly via SMS. No app download. No training required.
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <a 
                  href={calLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-4 rounded-md font-bold uppercase tracking-wider transition-colors"
                >
                  Book a Demo <ArrowRight className="w-5 h-5" />
                </a>
                <Link 
                  href="/contact" 
                  className="flex items-center gap-2 px-6 py-4 rounded-md font-bold uppercase tracking-wider border-2 border-zinc-700 hover:border-blue-600 hover:text-blue-400 transition-colors"
                >
                  Contact Sales
                </Link>
              </div>
            </div>

            {/* Right Column - Stats */}
            <div className={`space-y-4 ${isLoaded ? 'slide-up delay-200' : 'opacity-0'}`}>
              {[
                { value: "70%", label: "Faster Onboarding" },
                { value: "50%", label: "Fewer Incidents" },
                { value: "$15K", label: "Annual Savings" },
                { value: "24/7", label: "Availability" },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className="bg-zinc-900/80 border-2 border-zinc-800 rounded-md p-5 flex items-center justify-between hover:border-blue-600/50 transition-colors"
                >
                  <span className="text-zinc-400 font-semibold uppercase tracking-wider">{stat.label}</span>
                  <span className="text-4xl font-black text-blue-500">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 ${isLoaded ? 'fade-in delay-400' : 'opacity-0'}`}>
            <span className="text-xs text-zinc-600 uppercase tracking-wider">Scroll</span>
            <ChevronDown className="w-5 h-5 text-zinc-600 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-12 border-y-2 border-zinc-800 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-zinc-600 text-sm font-semibold uppercase tracking-wider mb-8">Trusted By</p>
          <div className="flex items-center justify-center gap-16 flex-wrap">
            {[
              { src: "/logos/eds.png", name: "EDS Manufacturing" },
              { src: "/logos/trinethra.png", name: "Trinethra Supermarket" },
              { src: "/logos/jfm.png", name: "Jim Falk Motors" },
            ].map((logo, i) => (
              <div key={i} className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                <Image src={logo.src} alt={logo.name} width={40} height={40} className="object-contain rounded" />
                <span className="text-zinc-500 font-medium">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 relative z-10">
        <div 
          className="absolute inset-0 z-0"
          style={{ transform: `translateY(${(scrollY - 800) * 0.1}px)` }}
        >
          <Image
            src="https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1920&q=80"
            alt="Warehouse"
            fill
            className="object-cover opacity-10"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-950" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-16">
            <div>
              <p className="text-blue-500 text-sm font-bold uppercase tracking-wider mb-2">Process</p>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">How It Works</h2>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="h-0.5 w-32 bg-zinc-800" />
              <span className="text-zinc-600 font-mono text-sm">4 STEPS</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: FileText, num: "01", title: "Upload", desc: "Drop in handbooks, SOPs, and safety manuals" },
              { icon: Brain, num: "02", title: "Process", desc: "AI classifies and indexes your documents" },
              { icon: MessageSquare, num: "03", title: "Ask", desc: "Workers text questions via SMS" },
              { icon: BarChart3, num: "04", title: "Track", desc: "Monitor usage and identify gaps" },
            ].map((item, i) => (
              <div key={i} className="group bg-zinc-900/80 border-2 border-zinc-800 rounded-md p-6 hover:border-blue-600 transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-zinc-800 border-2 border-zinc-700 group-hover:border-blue-600 rounded-md flex items-center justify-center transition-colors">
                    <item.icon className="w-7 h-7 text-blue-500" />
                  </div>
                  <span className="text-3xl font-black text-zinc-800 group-hover:text-blue-600 transition-colors">{item.num}</span>
                </div>
                <h3 className="font-bold text-white text-lg mb-2 uppercase tracking-wide">{item.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-500 text-sm font-bold uppercase tracking-wider mb-2">Live Demo</p>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">See It In Action</h2>
          </div>
          
          <div className="bg-zinc-900 border-2 border-zinc-800 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b-2 border-zinc-800 bg-zinc-900">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="px-4 py-1 bg-zinc-800 rounded text-xs text-zinc-400 font-mono uppercase">SMS Interface</div>
              <div className="w-16" />
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-zinc-800 border-2 border-zinc-700 rounded-md flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-zinc-500" />
                </div>
                <div className="bg-zinc-800 border-2 border-zinc-700 px-4 py-3 rounded-md">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Worker Question</p>
                  <p className="text-white font-medium">&quot;Where do I park on my first day?&quot;</p>
                </div>
              </div>
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-blue-600/10 border-2 border-blue-600/30 px-4 py-3 rounded-md max-w-md">
                  <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">Sidekick Response</p>
                  <p className="text-white font-medium">&quot;Park in Lot B behind the main building. Your badge will activate at 8am. See Section 3.2 of the Employee Handbook for full parking policies.&quot;</p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5" />
                </div>
              </div>
              <div className="text-center pt-2">
                <span className="inline-flex items-center gap-2 text-xs text-zinc-600 uppercase tracking-wider">
                  <Clock className="w-3 h-3" />
                  Response time: 2 seconds
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-24 px-6 relative z-10 border-t-2 border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-500 text-sm font-bold uppercase tracking-wider mb-2">Industries</p>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Built For Teams That Build America</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                icon: Factory,
                title: "Manufacturing", 
                items: ["Safety protocols", "Equipment SOPs", "Quality control"],
                image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop"
              },
              { 
                icon: ShoppingCart,
                title: "Retail", 
                items: ["Store policies", "Inventory management", "Customer service"],
                image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop"
              },
              { 
                icon: Wrench,
                title: "Automotive", 
                items: ["Repair procedures", "Parts lookup", "Compliance docs"],
                image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop"
              },
            ].map((industry, index) => (
              <div key={index} className="group relative rounded-lg overflow-hidden border-2 border-zinc-800 hover:border-blue-600 transition-all">
                <div className="relative h-48">
                  <Image
                    src={industry.image}
                    alt={industry.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
                </div>
                <div className="relative p-6 bg-zinc-900">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-zinc-800 border-2 border-zinc-700 rounded-md flex items-center justify-center">
                      <industry.icon className="w-5 h-5 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold uppercase tracking-wide">{industry.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {industry.items.map((item, i) => (
                      <li key={i} className="text-zinc-400 text-sm flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-500" />
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

      {/* Features */}
      <section className="py-24 px-6 relative z-10 border-t-2 border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-16">
            <div>
              <p className="text-blue-500 text-sm font-bold uppercase tracking-wider mb-2">Capabilities</p>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Features</h2>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="h-0.5 w-32 bg-zinc-800" />
              <span className="text-zinc-600 font-mono text-sm">6 TOOLS</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: FileText, title: "Document Intelligence", desc: "AI auto-classifies handbooks and SOPs" },
              { icon: MessageSquare, title: "SMS Q&A", desc: "Workers text questions, get instant answers" },
              { icon: Globe, title: "Multi-Language", desc: "English, Spanish, Chinese, and 10+ more" },
              { icon: BarChart3, title: "Manager Dashboard", desc: "Track questions and measure ROI" },
              { icon: Shield, title: "Enterprise Security", desc: "SOC 2 compliant, encrypted data" },
              { icon: Zap, title: "Instant Setup", desc: "Get started in under 5 minutes" },
            ].map((f, i) => (
              <div key={i} className="group bg-zinc-900/80 border-2 border-zinc-800 rounded-md p-6 hover:border-blue-600 transition-colors">
                <div className="w-12 h-12 bg-zinc-800 border-2 border-zinc-700 group-hover:border-blue-600 rounded-md flex items-center justify-center mb-4 transition-colors">
                  <f.icon className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-bold text-white mb-2 uppercase tracking-wide">{f.title}</h3>
                <p className="text-sm text-zinc-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 relative z-10 border-t-2 border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-500 text-sm font-bold uppercase tracking-wider mb-2">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Real Results</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "Sidekick cut our onboarding time by 70%. New hires get answers instantly instead of hunting down supervisors.", name: "Plant Manager", company: "EDS Manufacturing", logo: "/logos/eds.png" },
              { quote: "With Sidekick, new employees feel confident from day one. Questions about store policies are answered in seconds.", name: "Store Director", company: "Trinethra Supermarket", logo: "/logos/trinethra.png" },
              { quote: "Our technicians text questions and get accurate answers immediately. Productivity is through the roof.", name: "Service Manager", company: "Jim Falk Motors", logo: "/logos/jfm.png" },
            ].map((item, i) => (
              <div key={i} className="bg-zinc-900/80 border-2 border-zinc-800 rounded-md p-6 hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-3 mb-6">
                  <Image src={item.logo} alt={item.company} width={40} height={40} className="rounded bg-white p-1" />
                  <div>
                    <p className="font-bold text-white text-sm">{item.name}</p>
                    <p className="text-zinc-500 text-xs">{item.company}</p>
                  </div>
                </div>
                <p className="text-zinc-400 leading-relaxed">&quot;{item.quote}&quot;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative z-10 border-t-2 border-zinc-800">
        <div 
          className="absolute inset-0 z-0"
          style={{ transform: `translateY(${(scrollY - 4000) * 0.1}px)` }}
        >
          <Image
            src="https://images.unsplash.com/photo-1504917595217-d4dc5ebb6122?w=1920&q=80"
            alt="Industrial"
            fill
            className="object-cover opacity-15"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-zinc-950" />
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6">
            Ready To Transform
            <br />
            <span className="text-blue-500">Your Onboarding?</span>
          </h2>
          <p className="text-lg text-zinc-400 mb-10">
            Join leading companies using Sidekick to train teams faster and smarter.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a 
              href={calLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-md font-bold uppercase tracking-wider transition-colors"
            >
              Book a Demo <ArrowRight className="w-5 h-5" />
            </a>
            <Link 
              href="/contact" 
              className="flex items-center gap-2 px-8 py-4 rounded-md font-bold uppercase tracking-wider border-2 border-zinc-700 hover:border-blue-600 hover:text-blue-400 transition-colors"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-zinc-800 py-12 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center">
                  <span className="font-black text-lg">S</span>
                </div>
                <span className="font-bold text-lg tracking-tight">SIDEKICK</span>
              </Link>
              <p className="text-zinc-500 max-w-sm">AI-powered onboarding for blue-collar teams.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-sm">Product</h4>
              <ul className="space-y-3">
                <li><a href={calLink} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-blue-400 transition-colors">Book Demo</a></li>
                <li><Link href="/about" className="text-zinc-500 hover:text-blue-400 transition-colors">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-sm">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-zinc-500 hover:text-blue-400 transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="text-zinc-500 hover:text-blue-400 transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t-2 border-zinc-800 pt-8 text-center">
            <p className="text-zinc-600 text-sm">© 2025 Sidekick AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
