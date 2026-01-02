"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { ArrowRight, Target, Zap, Globe } from "lucide-react";

export default function About() {
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

  const team = [
    {
      name: "Justin So",
      role: "Co-Founder & CEO",
      company: "Strategic Analyst @ Arm",
      university: "University of Pennsylvania",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    },
    {
      name: "Aadip Khanal",
      role: "Co-Founder & CTO",
      company: "Software Engineer @ Amazon",
      university: "UC Berkeley",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
    },
    {
      name: "Aayush Bandopadhyay",
      role: "Co-Founder & CPO",
      company: "Associate PM @ Google",
      university: "UIUC",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    },
  ];

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
            <Link href="/about" className="text-zinc-900 text-sm font-medium transition-colors">About</Link>
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
        className="relative pt-28 pb-20 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #f0f7ff 0%, #fafafa 100%)' }}
      >
        {/* Cursor-following gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute transition-all duration-300 ease-out"
            style={{
              width: '700px',
              height: '700px',
              left: mousePosition.x - 350,
              top: mousePosition.y - 350,
              background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0.08) 30%, transparent 60%)',
              borderRadius: '50%',
              filter: 'blur(60px)',
            }}
          />
          <div 
            className="absolute transition-all duration-500 ease-out"
            style={{
              width: '500px',
              height: '500px',
              left: mousePosition.x - 250 + 80,
              top: mousePosition.y - 250 - 60,
              background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.05) 40%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(60px)',
            }}
          />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-200/30 rounded-full blur-[100px]" />
        </div>

        <div className={`relative z-10 max-w-4xl mx-auto px-6 text-center ${isLoaded ? 'fade-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-zinc-200 px-4 py-2 rounded-full text-sm text-zinc-600 font-medium mb-6 shadow-sm">
            About Us
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
            Empowering the workforce
            <br />
            <span className="text-blue-600">that builds America.</span>
          </h1>
          <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            We&apos;re building AI tools that help blue-collar workers get instant answers—no app, no login, just text.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 px-6 bg-[#fafafa]">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-blue-600 text-sm font-semibold mb-4">Our Mission</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Knowledge should be accessible to everyone.
              </h2>
              <p className="text-zinc-600 leading-relaxed mb-6">
                80% of the global workforce doesn&apos;t sit at a desk. They&apos;re on factory floors, in warehouses, behind retail counters. Yet enterprise software ignores them.
              </p>
              <p className="text-zinc-600 leading-relaxed">
                Sidekick changes that. We meet workers where they are—on their phones, via SMS—delivering instant answers from company handbooks, safety manuals, and SOPs.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "80%", label: "of workforce is deskless" },
                { value: "2.7B", label: "frontline workers globally" },
                { value: "70%", label: "feel undertrained" },
                { value: "5min", label: "avg time to find info" },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-zinc-200 rounded-xl p-5 text-center shadow-sm">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">{stat.value}</div>
                  <div className="text-zinc-500 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team - Dark Section */}
      <section className="relative py-28 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80)' }}
        />
        <div className="absolute inset-0 bg-zinc-950/92" />
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(rgba(59,130,246,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.08) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-blue-400 text-sm font-semibold mb-2">Our Team</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Meet the founders.</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              A team from top tech companies, united by a mission to democratize workplace knowledge.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                <div className="relative h-64">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
                </div>
                <div className="p-6 -mt-8 relative">
                  <h3 className="text-xl font-bold text-zinc-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium text-sm mb-3">{member.role}</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-zinc-600">{member.company}</p>
                    <p className="text-zinc-500">{member.university}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 text-sm font-semibold mb-2">Our Values</p>
            <h2 className="text-3xl md:text-4xl font-bold">What drives us.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: "Worker-First",
                desc: "Every feature we build starts with the frontline worker. If it doesn't help them, we don't ship it."
              },
              {
                icon: Zap,
                title: "Instant Value",
                desc: "No lengthy onboarding, no training required. Workers should get answers in seconds, not hours."
              },
              {
                icon: Globe,
                title: "Universal Access",
                desc: "Language, device, or tech literacy shouldn't be barriers. We build for everyone."
              },
            ].map((value, i) => (
              <div key={i} className="p-8 rounded-xl bg-[#fafafa] hover:bg-zinc-100 transition-all">
                <div className="w-12 h-12 bg-white border border-zinc-200 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                  <value.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-zinc-900 text-xl mb-3">{value.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-zinc-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to empower your workforce?</h2>
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
