"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function About() {
  const calLink = "https://cal.com/justin-so-xnr0oc/sidekick-demo";
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
      university: "University of California, Berkeley",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
    },
    {
      name: "Aayush Bandopadhyay",
      role: "Co-Founder & CPO",
      company: "Associate Product Manager @ Google",
      university: "University of Illinois Urbana-Champaign",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap');
        
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .slide-up { animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .fade-in { animation: fade-in 1s ease forwards; }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        
        .opacity-0-start { opacity: 0; }
        
        .gradient-text {
          background: linear-gradient(135deg, #fff 0%, #3b82f6 50%, #60a5fa 100%);
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
        
        .blue-glow {
          box-shadow: 0 0 60px rgba(59, 130, 246, 0.2), 0 0 120px rgba(59, 130, 246, 0.1);
        }
      `}</style>

      {/* Fixed Background Grid */}
      <div className="fixed inset-0 grid-bg opacity-60 pointer-events-none" />
      
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)',
            top: '20%',
            right: '10%',
            transform: `translateY(${scrollY * 0.03}px)`,
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-10 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(96,165,250,0.5) 0%, transparent 70%)',
            bottom: '20%',
            left: '10%',
            transform: `translateY(${-scrollY * 0.02}px)`,
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
            <Link href="/about" className="px-4 py-2 text-white transition-colors text-sm font-medium">About</Link>
            <Link href="/contact" className="px-4 py-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium">Contact</Link>
          </div>
          <a href={calLink} target="_blank" rel="noopener noreferrer" className="btn-primary px-5 py-2.5 rounded-full text-white font-semibold text-sm">
            Book Demo
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <Image
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&q=80"
            alt="Team working"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/90 to-zinc-950" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className={`inline-flex items-center gap-2 glass-blue px-4 py-2 rounded-full mb-6 ${isLoaded ? 'slide-up opacity-0-start' : 'opacity-0'}`}>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm text-blue-200 font-medium">About Sidekick</span>
          </div>
          <h1 className={`font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 ${isLoaded ? 'slide-up delay-100 opacity-0-start' : 'opacity-0'}`}>
            <span className="text-white">Empowering the workforce </span>
            <span className="gradient-text">that builds America.</span>
          </h1>
          <p className={`font-body text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed ${isLoaded ? 'slide-up delay-200 opacity-0-start' : 'opacity-0'}`}>
            We&apos;re building AI tools that help blue-collar workers get instant answers to their questions—no app download, no login, just text.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 relative">
        <div className="absolute inset-0 grid-bg-blue opacity-20" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-blue-500 text-sm font-semibold uppercase tracking-wider mb-4 block">Our Mission</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
                Knowledge should be <span className="text-zinc-500">accessible to everyone.</span>
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-6 font-body">
                80% of the global workforce doesn&apos;t sit at a desk. They&apos;re on factory floors, in warehouses, behind retail counters. Yet enterprise software ignores them.
              </p>
              <p className="text-zinc-400 leading-relaxed font-body">
                Sidekick changes that. We meet workers where they are—on their phones, via SMS—delivering instant answers from company handbooks, safety manuals, and SOPs.
              </p>
            </div>
            <div className="relative">
              <div className="glass-card rounded-2xl p-8 blue-glow">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { value: "80%", label: "of workforce is deskless" },
                    { value: "2.7B", label: "frontline workers globally" },
                    { value: "70%", label: "feel undertrained" },
                    { value: "5min", label: "avg time to find info" },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="font-display text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                      <div className="text-zinc-500 text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ transform: `translateY(${(scrollY - 600) * 0.1}px)` }}
        >
          <Image
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80"
            alt="Team collaboration"
            fill
            className="object-cover opacity-10"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-950" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="text-blue-500 text-sm font-semibold uppercase tracking-wider mb-4 block">Our Team</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Meet the founders.
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto font-body">
              We&apos;re a team of builders from top tech companies, united by a mission to democratize workplace knowledge.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="glass-card rounded-2xl overflow-hidden hover-lift group hover:border-blue-500/20 transition-all">
                <div className="relative h-72">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                </div>
                <div className="p-6 relative">
                  <h3 className="font-display text-xl font-bold text-white mb-1">{member.name}</h3>
                  <p className="text-blue-400 font-medium text-sm mb-3">{member.role}</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-zinc-400 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-500" />
                      {member.company}
                    </p>
                    <p className="text-zinc-500 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-zinc-600" />
                      {member.university}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 relative">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="text-blue-500 text-sm font-semibold uppercase tracking-wider mb-4 block">Our Values</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              What drives us.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🎯",
                title: "Worker-First",
                desc: "Every feature we build starts with the frontline worker. If it doesn't help them, we don't ship it."
              },
              {
                icon: "⚡",
                title: "Instant Value",
                desc: "No lengthy onboarding, no training required. Workers should get answers in seconds, not hours."
              },
              {
                icon: "🌍",
                title: "Universal Access",
                desc: "Language, device, or tech literacy shouldn't be barriers. We build for everyone."
              },
            ].map((value, i) => (
              <div key={i} className="glass-card rounded-2xl p-8 hover-lift group hover:border-blue-500/20">
                <div className="text-5xl mb-6">{value.icon}</div>
                <h3 className="font-display text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{value.title}</h3>
                <p className="text-zinc-400 leading-relaxed font-body">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-blue-950/20 to-zinc-950" />
        <div className="absolute inset-0 grid-bg-blue opacity-40" />
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 60%)' }}
        />
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to empower your workforce?
          </h2>
          <p className="text-zinc-400 mb-8 font-body">
            Join leading companies using Sidekick to train teams faster and smarter.
          </p>
          <a
            href={calLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-lg"
          >
            Book a Demo
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-12 px-6 relative">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="font-bold text-white text-sm font-display">S</span>
              </div>
              <span className="font-display font-semibold text-white">Sidekick</span>
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-zinc-500 hover:text-blue-400 transition-colors">Privacy</Link>
              <Link href="/terms" className="text-zinc-500 hover:text-blue-400 transition-colors">Terms</Link>
              <Link href="/contact" className="text-zinc-500 hover:text-blue-400 transition-colors">Contact</Link>
            </div>
            <p className="text-zinc-600 text-sm">© 2025 Sidekick AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
