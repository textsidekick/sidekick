"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { 
  ArrowRight, 
  Target,
  Zap,
  Globe,
  Linkedin
} from "lucide-react";

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
        
        .slide-up { animation: slide-up 0.6s ease-out forwards; }
        
        .delay-100 { animation-delay: 0.1s; opacity: 0; }
        .delay-200 { animation-delay: 0.2s; opacity: 0; }
        .delay-300 { animation-delay: 0.3s; opacity: 0; }
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
            <Link href="/about" className="text-white text-sm font-semibold uppercase tracking-wider transition-colors">
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
      <section className="relative pt-32 pb-20 px-6">
        <div 
          className="absolute inset-0 z-0"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <Image
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&q=80"
            alt="Team"
            fill
            className="object-cover opacity-15"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/90 to-zinc-950" />
        </div>

        <div className={`relative z-10 max-w-4xl mx-auto text-center ${isLoaded ? 'slide-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border-2 border-blue-600/30 px-4 py-2 rounded-md text-sm text-blue-400 font-semibold uppercase tracking-wider mb-8">
            About Us
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-[0.95]">
            EMPOWERING THE
            <br />
            <span className="text-blue-500">WORKFORCE</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            We&apos;re building AI tools that help blue-collar workers get instant answers to their questions—no app download, no login, just text.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 relative z-10 border-t-2 border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-blue-500 text-sm font-bold uppercase tracking-wider mb-4">Our Mission</p>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6">
                Knowledge Should Be
                <br />
                <span className="text-zinc-500">Accessible To Everyone</span>
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-6">
                80% of the global workforce doesn&apos;t sit at a desk. They&apos;re on factory floors, in warehouses, behind retail counters. Yet enterprise software ignores them.
              </p>
              <p className="text-zinc-400 leading-relaxed">
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
                <div key={i} className="bg-zinc-900/80 border-2 border-zinc-800 rounded-md p-5 text-center hover:border-blue-600/50 transition-colors">
                  <div className="text-3xl font-black text-blue-500 mb-1">{stat.value}</div>
                  <div className="text-zinc-500 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6 relative z-10 border-t-2 border-zinc-800">
        <div 
          className="absolute inset-0 z-0"
          style={{ transform: `translateY(${(scrollY - 600) * 0.08}px)` }}
        >
          <Image
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80"
            alt="Team collaboration"
            fill
            className="object-cover opacity-8"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/98 to-zinc-950" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-blue-500 text-sm font-bold uppercase tracking-wider mb-2">Leadership</p>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4">Meet The Founders</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              A team from top tech companies, united by a mission to democratize workplace knowledge.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <div key={index} className="group bg-zinc-900/80 border-2 border-zinc-800 rounded-md overflow-hidden hover:border-blue-600 transition-all">
                <div className="relative h-64">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-1 uppercase tracking-wide">{member.name}</h3>
                  <p className="text-blue-500 font-semibold text-sm mb-4">{member.role}</p>
                  <div className="space-y-2 text-sm">
                    <p className="text-zinc-400 flex items-center gap-2">
                      <div className="w-1 h-1 bg-blue-500" />
                      {member.company}
                    </p>
                    <p className="text-zinc-500 flex items-center gap-2">
                      <div className="w-1 h-1 bg-zinc-600" />
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
      <section className="py-20 px-6 relative z-10 border-t-2 border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-16">
            <div>
              <p className="text-blue-500 text-sm font-bold uppercase tracking-wider mb-2">Principles</p>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Our Values</h2>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="h-0.5 w-32 bg-zinc-800" />
              <span className="text-zinc-600 font-mono text-sm">3 CORE</span>
            </div>
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
              <div key={i} className="group bg-zinc-900/80 border-2 border-zinc-800 rounded-md p-8 hover:border-blue-600 transition-colors">
                <div className="w-14 h-14 bg-zinc-800 border-2 border-zinc-700 group-hover:border-blue-600 rounded-md flex items-center justify-center mb-6 transition-colors">
                  <value.icon className="w-7 h-7 text-blue-500" />
                </div>
                <h3 className="font-bold text-white text-xl mb-3 uppercase tracking-wide">{value.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative z-10 border-t-2 border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-blue-950/10 to-zinc-950" />
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6">
            Ready To Empower
            <br />
            <span className="text-blue-500">Your Workforce?</span>
          </h2>
          <p className="text-zinc-400 mb-10">
            Join leading companies using Sidekick to train teams faster and smarter.
          </p>
          <a
            href={calLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-md font-bold uppercase tracking-wider transition-colors"
          >
            Book a Demo <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-zinc-800 py-12 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="font-black text-lg">S</span>
              </div>
              <span className="font-bold text-lg tracking-tight">SIDEKICK</span>
            </Link>
            <div className="flex items-center gap-8 text-sm">
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
