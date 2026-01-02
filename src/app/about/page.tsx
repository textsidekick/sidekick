"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, Target, Zap, Globe, Users, Linkedin, Twitter } from "lucide-react";

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
      bio: "Previously Strategic Analyst at Arm. Passionate about bringing technology to underserved workforces.",
      school: "University of Pennsylvania",
      image: "/team/justin.jpg",
      linkedin: "#",
    },
    {
      name: "Aadip Khanal",
      role: "Co-Founder & CTO",
      bio: "Former Software Engineer at Amazon. Expert in scalable systems and AI infrastructure.",
      school: "UC Berkeley",
      image: "/team/aadip.jpg",
      linkedin: "#",
    },
    {
      name: "Aayush Bandopadhyay",
      role: "Co-Founder & CPO",
      bio: "Previously Associate PM at Google. Focused on building products that solve real problems.",
      school: "UIUC",
      image: "/team/aayush.jpg",
      linkedin: "#",
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
          <div className="flex items-center gap-6">
            <Link href="/#how-it-works" className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors hidden md:block">How it works</Link>
            <Link href="/about" className="text-zinc-900 font-medium text-sm transition-colors hidden md:block">About</Link>
            <Link href="/contact" className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors hidden md:block">Contact</Link>
            <a 
              href={calLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Request Demo
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 px-6 bg-gradient-to-b from-blue-50/50 to-[#fafafa]">
        <div className={`max-w-4xl mx-auto text-center ${isLoaded ? 'fade-up' : 'opacity-0'}`}>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Empowering the workforce
            <br />
            <span className="text-blue-600">that builds America.</span>
          </h1>
          <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
            We&apos;re building AI tools that help deskless workers get instant answers—no app, no login, just text.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-blue-600 text-sm font-semibold mb-3">Our Mission</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Knowledge should be accessible to everyone.
              </h2>
              <p className="text-zinc-600 leading-relaxed mb-6">
                80% of the global workforce doesn&apos;t sit at a desk. They&apos;re on factory floors, in warehouses, behind retail counters. Yet enterprise software ignores them completely.
              </p>
              <p className="text-zinc-600 leading-relaxed">
                Sidekick changes that. We meet workers where they are—on their phones, via SMS—delivering instant answers from company handbooks, safety manuals, and SOPs. No app downloads. No training required.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "80%", label: "of workforce is deskless" },
                { value: "2.7B", label: "frontline workers globally" },
                { value: "70%", label: "feel undertrained at work" },
                { value: "5 min", label: "avg time to find info" },
              ].map((stat, i) => (
                <div key={i} className="bg-[#fafafa] border border-zinc-200 rounded-xl p-5 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">{stat.value}</div>
                  <div className="text-zinc-500 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why We Started */}
      <section className="py-20 px-6 bg-[#fafafa]">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-10 border border-zinc-200">
            <p className="text-blue-600 text-sm font-semibold mb-4">Why We Started</p>
            <p className="text-xl md:text-2xl text-zinc-700 leading-relaxed mb-8 italic">
              &quot;We interviewed dozens of manufacturing and retail operators to understand their biggest challenges. The same problem kept coming up: new hires ask the same questions over and over, and managers lose hours answering them. We built Sidekick so workers get instant answers and managers get their time back.&quot;
            </p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-zinc-200 rounded-full overflow-hidden">
                <Image 
                  src="/team/justin.jpg" 
                  alt="Justin So"
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Justin So</p>
                <p className="text-zinc-500 text-sm">Co-founder & CEO</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-600 text-sm font-semibold mb-2">Our Team</p>
            <h2 className="text-3xl md:text-4xl font-bold">Meet the founders</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-[#fafafa] border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                <div className="aspect-square bg-zinc-200 relative">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900">{member.name}</h3>
                      <p className="text-blue-600 text-sm font-medium">{member.role}</p>
                    </div>
                    <a href={member.linkedin} className="text-zinc-400 hover:text-blue-600 transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </div>
                  <p className="text-zinc-500 text-sm mb-3">{member.bio}</p>
                  <p className="text-zinc-400 text-xs">{member.school}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-[#fafafa]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-600 text-sm font-semibold mb-2">Our Values</p>
            <h2 className="text-3xl md:text-4xl font-bold">What drives us</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: "Worker-First",
                desc: "Every feature starts with the frontline worker. If it doesn't help them, we don't ship it."
              },
              {
                icon: Zap,
                title: "Instant Value",
                desc: "No lengthy onboarding or training required. Workers should get answers in seconds, not hours."
              },
              {
                icon: Globe,
                title: "Universal Access",
                desc: "Language, device, or tech literacy shouldn't be barriers. We build for everyone."
              },
            ].map((value, i) => (
              <div key={i} className="bg-white border border-zinc-200 rounded-xl p-8 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-5">
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
      <section className="py-20 px-6 bg-zinc-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to empower your workforce?</h2>
          <p className="text-zinc-400 mb-8">Join leading companies using Sidekick to train teams faster.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={calLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white hover:bg-zinc-100 text-zinc-900 px-6 py-3.5 rounded-xl font-medium transition-colors w-full sm:w-auto justify-center"
            >
              Request a Demo <ArrowRight className="w-4 h-4" />
            </a>
            <Link 
              href="/contact"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-medium border border-zinc-700 text-white hover:bg-zinc-800 transition-colors w-full sm:w-auto justify-center"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-zinc-950">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-white text-sm">S</span>
                </div>
                <span className="font-semibold text-white">Sidekick</span>
              </Link>
              <p className="text-zinc-500 text-sm mb-4 max-w-xs">
                AI onboarding assistant for deskless workers. Reduce turnover, free up managers.
              </p>
              <p className="text-zinc-500 text-sm">
                <a href="mailto:hello@sidekick.ai" className="hover:text-white transition-colors">hello@sidekick.ai</a>
              </p>
            </div>
            
            <div>
              <h4 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-zinc-500 text-sm hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-zinc-500 text-sm hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-zinc-500 text-sm hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-zinc-500 text-sm hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/sms-terms" className="text-zinc-500 text-sm hover:text-white transition-colors">SMS Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-zinc-800 pt-8 mb-8">
            <p className="text-zinc-600 text-xs text-center">
              SMS: Reply STOP to unsubscribe. Reply HELP for help. Msg & data rates may apply.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-zinc-600 text-xs">© 2026 Sidekick AI Inc. All rights reserved.</p>
            <p className="text-zinc-700 text-xs">Santa Clara, CA</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
