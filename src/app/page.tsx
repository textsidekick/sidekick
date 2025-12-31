"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

function Logo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 8 Q4 4 8 4 L40 4 Q44 4 44 8 L44 32 Q44 36 40 36 L16 36 L8 44 L8 36 Q4 36 4 32 Z" fill="#0ea5e9"/>
      <rect x="20" y="16" width="8" height="3" rx="1.5" fill="white"/>
      <circle cx="15" cy="17" r="7" stroke="white" strokeWidth="3" fill="none"/>
      <circle cx="33" cy="17" r="7" stroke="white" strokeWidth="3" fill="none"/>
      <circle cx="15" cy="16" r="2.5" fill="#1e293b"/>
      <circle cx="33" cy="16" r="2.5" fill="#1e293b"/>
      <path d="M19 28 Q24 31 29 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    const elements = ref.current?.querySelectorAll(".scroll-animate");
    elements?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function Home() {
  const scrollRef = useScrollAnimation();

  return (
    <main ref={scrollRef} className="min-h-screen bg-slate-900 overflow-x-hidden">
      <style jsx global>{`
        .scroll-animate {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        .scroll-animate.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        .delay-1 { transition-delay: 0.1s; }
        .delay-2 { transition-delay: 0.2s; }
        .delay-3 { transition-delay: 0.3s; }
        .delay-4 { transition-delay: 0.4s; }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(14, 165, 233, 0.4); }
          50% { box-shadow: 0 0 40px rgba(14, 165, 233, 0.7); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 25px 50px rgba(0,0,0,0.25); }
      `}</style>

      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-24 py-4 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
            <Logo size={32} />
            <span className="text-white text-xl font-bold">Sidekick</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/about" className="text-white/70 hover:text-white text-sm transition-colors">About</Link>
            <Link href="/qa" className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-all hover:shadow-lg hover:shadow-sky-500/25">Try Demo</Link>
          </div>
        </div>
      </nav>

      {/* PARALLAX SECTION - Fixed background with scrolling content */}
      <div className="relative">
        {/* Fixed Background Image */}
        <div 
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900" />
        </div>

        {/* Scrolling Content Over Fixed Background */}
        <div className="relative z-10">
          
          {/* Hero Section - Transparent to show background */}
          <section className="min-h-screen flex items-center justify-center pt-20">
            <div className="text-center px-6 max-w-4xl">
              <div className="scroll-animate mb-8 flex justify-center">
                <div className="animate-float"><Logo size={100} /></div>
              </div>
              <h1 className="scroll-animate delay-1 text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Smart onboarding for <span className="text-sky-400">blue-collar teams</span>
              </h1>
              <p className="scroll-animate delay-2 text-xl md:text-2xl text-white/80 mb-10 max-w-2xl mx-auto">
                AI-powered document intelligence. Workers text questions, get instant answers.
              </p>
              <div className="scroll-animate delay-3 flex flex-wrap justify-center gap-4">
                <Link href="/qa" className="px-10 py-5 bg-sky-500 hover:bg-sky-600 text-white text-lg font-semibold rounded-xl transition-all hover:shadow-xl hover:shadow-sky-500/30 hover:-translate-y-1 animate-pulse-glow">
                  Try Demo
                </Link>
                <Link href="/contact" className="px-10 py-5 bg-white/10 backdrop-blur border border-white/30 text-white text-lg font-semibold rounded-xl hover:bg-white/20 transition-all hover:-translate-y-1">
                  Contact Us
                </Link>
              </div>
              <div className="scroll-animate delay-4 mt-16 animate-bounce">
                <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2 mx-auto">
                  <div className="w-1.5 h-3 bg-white/70 rounded-full" />
                </div>
                <p className="text-white/50 text-sm mt-2">Scroll to explore</p>
              </div>
            </div>
          </section>

          {/* Floating Cards Section - Cards scroll over the fixed background */}
          <section className="py-32 px-6 md:px-24">
            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
              {[
                { icon: "📄", title: "Upload Documents", desc: "Drop your handbooks, safety manuals, and procedures. We handle the rest." },
                { icon: "🤖", title: "AI Classifies", desc: "Our AI automatically organizes, indexes, and understands your content." },
                { icon: "💬", title: "Workers Ask", desc: "Team texts questions, gets instant accurate answers 24/7." }
              ].map((item, i) => (
                <div key={item.title} className={`scroll-animate delay-${i+1} bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover-lift`}>
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-white/70 text-lg">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Stats Cards - Floating over background */}
          <section className="py-24 px-6 md:px-24">
            <div className="max-w-4xl mx-auto">
              <div className="scroll-animate bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12">
                <h2 className="text-3xl font-bold text-white text-center mb-12">Real Results</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { v: "70%", l: "Faster Onboarding" },
                    { v: "50%", l: "Fewer Incidents" },
                    { v: "$15K", l: "Annual Savings" },
                    { v: "95%", l: "Accuracy Rate" }
                  ].map((s, i) => (
                    <div key={s.l} className={`scroll-animate delay-${i+1} text-center`}>
                      <div className="text-4xl md:text-5xl font-bold text-sky-400 mb-2">{s.v}</div>
                      <div className="text-white/70">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Industry Cards */}
          <section className="py-24 px-6 md:px-24">
            <div className="max-w-5xl mx-auto">
              <h2 className="scroll-animate text-4xl font-bold text-white text-center mb-12">Built for Every Industry</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: "🏭", t: "Manufacturing", d: "Safety protocols, equipment SOPs, quality control" },
                  { icon: "🛒", t: "Retail", d: "Store policies, inventory, customer service" },
                  { icon: "🔧", t: "Field Services", d: "Service manuals, troubleshooting guides" }
                ].map((item, i) => (
                  <div key={item.t} className={`scroll-animate delay-${i+1} bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover-lift text-center`}>
                    <div className="text-5xl mb-4">{item.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{item.t}</h3>
                    <p className="text-white/70">{item.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonial Card */}
          <section className="py-24 px-6 md:px-24">
            <div className="max-w-3xl mx-auto">
              <div className="scroll-animate bg-gradient-to-br from-sky-500/20 to-sky-600/20 backdrop-blur-xl border border-sky-500/30 rounded-3xl p-12 text-center">
                <div className="text-6xl mb-6">"</div>
                <p className="text-2xl text-white mb-6 leading-relaxed">
                  Sidekick cut our onboarding time in half. New hires get answers instantly instead of hunting down supervisors.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold">JD</div>
                  <div className="text-left">
                    <div className="text-white font-semibold">Plant Manager</div>
                    <div className="text-white/60 text-sm">EDS Manufacturing</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-32 px-6 md:px-24">
            <div className="max-w-3xl mx-auto">
              <div className="scroll-animate bg-sky-500 rounded-3xl p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2" />
                <div className="relative z-10">
                  <Logo size={64} />
                  <h2 className="text-4xl font-bold text-white mt-6 mb-4">Ready to transform onboarding?</h2>
                  <p className="text-sky-100 text-lg mb-8">Join companies who trust Sidekick to train their teams.</p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/qa" className="px-8 py-4 bg-white text-sky-600 font-semibold rounded-xl hover:bg-gray-100 transition-all hover:-translate-y-1">
                      Get Started Free
                    </Link>
                    <Link href="/contact" className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all hover:-translate-y-1">
                      Talk to Sales
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer - Solid background to cover the parallax */}
          <footer className="bg-slate-900 px-6 md:px-24 py-16 border-t border-white/10">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
                <div>
                  <div className="flex items-center gap-2 mb-4"><Logo size={32} /><span className="text-white font-bold text-xl">Sidekick</span></div>
                  <p className="text-white/60 max-w-xs">AI-powered onboarding for blue-collar teams. Faster training, fewer incidents.</p>
                </div>
                <div className="flex gap-16">
                  <div className="flex flex-col gap-3">
                    <span className="text-white font-semibold mb-2">Product</span>
                    <Link href="/qa" className="text-white/60 hover:text-white text-sm transition-colors">Demo</Link>
                    <Link href="/manager" className="text-white/60 hover:text-white text-sm transition-colors">Dashboard</Link>
                  </div>
                  <div className="flex flex-col gap-3">
                    <span className="text-white font-semibold mb-2">Company</span>
                    <Link href="/about" className="text-white/60 hover:text-white text-sm transition-colors">About</Link>
                    <Link href="/contact" className="text-white/60 hover:text-white text-sm transition-colors">Contact</Link>
                  </div>
                  <div className="flex flex-col gap-3">
                    <span className="text-white font-semibold mb-2">Legal</span>
                    <Link href="/privacy" className="text-white/60 hover:text-white text-sm transition-colors">Privacy</Link>
                    <Link href="/terms" className="text-white/60 hover:text-white text-sm transition-colors">Terms</Link>
                  </div>
                </div>
              </div>
              <div className="pt-8 border-t border-white/10 text-center text-white/50 text-sm">© 2025 Sidekick AI. All rights reserved.</div>
            </div>
          </footer>

        </div>
      </div>
    </main>
  );
}
