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
    <main ref={scrollRef} className="min-h-screen bg-white overflow-x-hidden">
      <style jsx global>{`
        .scroll-animate {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .scroll-animate.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        .scroll-animate-delay-1 { transition-delay: 0.1s; }
        .scroll-animate-delay-2 { transition-delay: 0.2s; }
        .scroll-animate-delay-3 { transition-delay: 0.3s; }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(14, 165, 233, 0.3); }
          50% { box-shadow: 0 0 40px rgba(14, 165, 233, 0.6); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
        .gradient-text { background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      <nav className="px-6 md:px-24 py-4 bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
          <Logo size={32} />
          <span className="text-gray-800 text-xl font-bold">Sidekick</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/about" className="text-gray-600 hover:text-sky-500 text-sm transition-colors">About</Link>
          <Link href="/qa" className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-all hover:shadow-lg hover:shadow-sky-500/25">Try Demo</Link>
        </div>
      </nav>

      <section className="relative min-h-[700px] flex items-center overflow-hidden" style={{backgroundImage: "url(https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920)", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed"}}>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent" />
        <div className="relative z-10 px-6 md:px-24 py-20 max-w-2xl">
          <div className="mb-6 animate-float"><Logo size={80} /></div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Smart onboarding for <span className="gradient-text">blue-collar teams</span>
          </h1>
          <p className="text-gray-300 text-xl mb-8 leading-relaxed">AI-powered document intelligence. Workers text questions, get instant answers from company handbooks.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/qa" className="px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-all hover:shadow-xl hover:shadow-sky-500/30 hover:-translate-y-1 animate-pulse-glow">Try Demo</Link>
            <Link href="/contact" className="px-8 py-4 bg-white/10 backdrop-blur border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all hover:-translate-y-1">Contact Us</Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/70 rounded-full" />
          </div>
        </div>
      </section>

      <section className="px-6 md:px-24 py-20 text-center bg-gradient-to-b from-white to-gray-50">
        <p className="scroll-animate text-gray-500 text-sm mb-8 tracking-widest">TRUSTED BY INDUSTRY LEADERS</p>
        <div className="scroll-animate scroll-animate-delay-1 flex justify-center gap-16 flex-wrap">
          <span className="text-2xl font-bold text-gray-300 hover:text-sky-500 transition-colors cursor-default">EDS Manufacturing</span>
          <span className="text-2xl font-bold text-gray-300 hover:text-sky-500 transition-colors cursor-default">Trinethra Supermarket</span>
        </div>
      </section>

      <section className="px-6 md:px-24 py-24 bg-gray-50">
        <h2 className="scroll-animate text-4xl font-bold text-center text-gray-800 mb-4">How It Works</h2>
        <p className="scroll-animate scroll-animate-delay-1 text-gray-600 text-center mb-16 text-lg">Get started in three simple steps</p>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {n:"1", t:"Upload Documents", d:"Drop your handbooks, safety manuals, and procedures", icon:"📄"},
            {n:"2", t:"AI Classifies", d:"Our AI automatically organizes and indexes everything", icon:"🤖"},
            {n:"3", t:"Workers Ask", d:"Team texts questions, gets instant accurate answers", icon:"💬"}
          ].map((s, i) => (
            <div key={s.n} className={`scroll-animate scroll-animate-delay-${i+1} bg-white rounded-2xl p-8 shadow-lg hover-lift text-center border border-gray-100`}>
              <div className="w-16 h-16 bg-sky-500 text-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg shadow-sky-500/30">{s.icon}</div>
              <div className="text-sky-500 text-sm font-bold mb-2">STEP {s.n}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{s.t}</h3>
              <p className="text-gray-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-24 py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}} />
        <h2 className="scroll-animate text-4xl font-bold text-white mb-4 relative z-10">Real Results</h2>
        <p className="scroll-animate scroll-animate-delay-1 text-sky-200 mb-16 text-lg relative z-10">Measurable impact from day one</p>
        <div className="scroll-animate scroll-animate-delay-2 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto relative z-10">
          {[
            {v:"70%", l:"Faster Onboarding"},
            {v:"50%", l:"Fewer Incidents"},
            {v:"$15K", l:"Annual Savings"},
            {v:"95%", l:"Accuracy Rate"}
          ].map(s => (
            <div key={s.l} className="hover-lift p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{s.v}</div>
              <div className="text-sky-200 text-sm">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-24 py-24 bg-white">
        <h2 className="scroll-animate text-4xl font-bold text-center text-gray-800 mb-4">Built for Every Industry</h2>
        <p className="scroll-animate scroll-animate-delay-1 text-gray-600 text-center mb-16 text-lg">From factories to retail floors</p>
        <div className="scroll-animate scroll-animate-delay-2 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {icon:"🏭", t:"Manufacturing", d:"Safety protocols, equipment SOPs, quality control procedures"},
            {icon:"🛒", t:"Retail", d:"Store policies, inventory management, customer service guidelines"},
            {icon:"🔧", t:"Field Services", d:"Service manuals, safety guidelines, troubleshooting guides"}
          ].map(item => (
            <div key={item.t} className="hover-lift bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200">
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{item.t}</h3>
              <p className="text-gray-600">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-24 py-24 bg-gradient-to-r from-sky-500 to-sky-600 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2" />
        <div className="relative z-10">
          <div className="scroll-animate mb-6"><Logo size={64} /></div>
          <h2 className="scroll-animate scroll-animate-delay-1 text-4xl md:text-5xl font-bold text-white mb-6">Ready to transform onboarding?</h2>
          <p className="scroll-animate scroll-animate-delay-2 text-sky-100 text-lg mb-8 max-w-xl mx-auto">Join leading companies who trust Sidekick to train their teams faster and safer.</p>
          <div className="scroll-animate scroll-animate-delay-3 flex flex-wrap justify-center gap-4">
            <Link href="/qa" className="px-8 py-4 bg-white text-sky-600 font-semibold rounded-xl hover:bg-gray-100 transition-all hover:-translate-y-1 hover:shadow-xl">Get Started Free</Link>
            <Link href="/contact" className="px-8 py-4 bg-sky-600 border-2 border-white text-white font-semibold rounded-xl hover:bg-sky-700 transition-all hover:-translate-y-1">Talk to Sales</Link>
          </div>
        </div>
      </section>

      <footer className="px-6 md:px-24 py-16 bg-gray-900">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4"><Logo size={32} /><span className="text-white font-bold text-xl">Sidekick</span></div>
            <p className="text-gray-400 max-w-xs">AI-powered onboarding for blue-collar teams. Faster training, fewer incidents.</p>
          </div>
          <div className="flex gap-16">
            <div className="flex flex-col gap-3">
              <span className="text-white font-semibold mb-2">Product</span>
              <Link href="/qa" className="text-gray-400 hover:text-white text-sm transition-colors">Demo</Link>
              <Link href="/manager" className="text-gray-400 hover:text-white text-sm transition-colors">Dashboard</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-white font-semibold mb-2">Company</span>
              <Link href="/about" className="text-gray-400 hover:text-white text-sm transition-colors">About</Link>
              <Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-white font-semibold mb-2">Legal</span>
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms</Link>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">© 2025 Sidekick AI. All rights reserved.</div>
      </footer>
    </main>
  );
}
