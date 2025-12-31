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
      { threshold: 0.15, rootMargin: "0px 0px -100px 0px" }
    );
    const elements = ref.current?.querySelectorAll(".scroll-animate");
    elements?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return ref;
}

function FloatingPillsTop() {
  const pills = [
    { text: '"Where do I clock in?"', icon: "💬" },
    { text: "95% accuracy rate achieved", icon: "🎯" },
    { text: '"What PPE do I need?"', icon: "💬" },
    { text: "Question answered in 2.3s", icon: "⚡" },
    { text: '"What are the break times?"', icon: "💬" },
  ];
  return (
    <div className="flex gap-6 animate-marquee-slow">
      {[...pills, ...pills].map((pill, i) => (
        <div key={i} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg border border-gray-100">
          <span>{pill.icon}</span>
          <span className="text-gray-700 text-sm whitespace-nowrap">{pill.text}</span>
        </div>
      ))}
    </div>
  );
}

function FloatingPillsBottom() {
  const pills = [
    { text: "New hire completed safety training", icon: "✅" },
    { text: '"How do I report an incident?"', icon: "💬" },
    { text: "Manager viewed analytics", icon: "📊" },
    { text: '"Who is my supervisor?"', icon: "💬" },
    { text: "Onboarding time reduced 70%", icon: "📈" },
  ];
  return (
    <div className="flex gap-6 animate-marquee-reverse">
      {[...pills, ...pills].map((pill, i) => (
        <div key={i} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg border border-gray-100">
          <span>{pill.icon}</span>
          <span className="text-gray-700 text-sm whitespace-nowrap">{pill.text}</span>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const scrollRef = useScrollAnimation();

  return (
    <main ref={scrollRef} className="bg-white overflow-x-hidden">
      <style jsx global>{`
        .scroll-animate { opacity: 0; transition: opacity 0.8s ease-out, transform 0.8s ease-out; }
        .scroll-animate.animate-in { opacity: 1; transform: translate(0, 0) !important; }
        .from-bottom { transform: translateY(60px); }
        .from-left { transform: translateX(-80px); }
        .from-right { transform: translateX(80px); }
        .from-scale { transform: scale(0.9); }
        .delay-1 { transition-delay: 0.1s; }
        .delay-2 { transition-delay: 0.2s; }
        .delay-3 { transition-delay: 0.3s; }
        .delay-4 { transition-delay: 0.4s; }
        .delay-5 { transition-delay: 0.5s; }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(14, 165, 233, 0.4); } 50% { box-shadow: 0 0 40px rgba(14, 165, 233, 0.7); } }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes marquee-reverse { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-marquee-slow { animation: marquee 35s linear infinite; }
        .animate-marquee-reverse { animation: marquee-reverse 40s linear infinite; }
        .parallax-section { background-attachment: fixed; background-size: cover; background-position: center; }
        @media (max-width: 768px) { .parallax-section { background-attachment: scroll; } }
        .testimonial-scroll::-webkit-scrollbar { display: none; }
        .testimonial-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-24 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
            <Logo size={32} />
            <span className="text-gray-900 text-xl font-bold">Sidekick</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/about" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">About</Link>
            <Link href="/qa" className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-all hover:shadow-lg hover:shadow-sky-500/25">Try Demo</Link>
          </div>
        </div>
      </nav>

      <section className="parallax-section min-h-screen flex items-center relative" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920)" }}>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/50" />
        <div className="relative z-10 px-6 md:px-24 py-32 max-w-7xl mx-auto w-full">
          <div className="max-w-2xl">
            <div className="scroll-animate from-left mb-6">
              <div className="animate-float inline-block"><Logo size={80} /></div>
            </div>
            <h1 className="scroll-animate from-left delay-1 text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Every question answered.<br/><span className="text-sky-400">The right way.</span>
            </h1>
            <p className="scroll-animate from-left delay-2 text-xl text-white/80 mb-10">
              Our AI assistant seamlessly answers worker questions from your handbooks, simulates countless scenarios, and delivers the best response.
            </p>
            <div className="scroll-animate from-left delay-3 flex flex-wrap gap-4">
              <Link href="/qa" className="px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-all hover:-translate-y-1 animate-pulse-glow">Try Demo</Link>
              <Link href="/contact" className="px-8 py-4 bg-white/10 backdrop-blur border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all hover:-translate-y-1">Contact Sales</Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/70 rounded-full" />
          </div>
        </div>
      </section>

      <section className="bg-white py-32 px-6 md:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="scroll-animate from-bottom text-sky-500 font-semibold mb-4">HOW IT WORKS</p>
            <h2 className="scroll-animate from-bottom delay-1 text-4xl md:text-5xl font-bold text-gray-900">Simple setup,<br/>powerful results.</h2>
          </div>
          <div className="scroll-animate from-scale delay-2 mb-20 rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200" alt="Dashboard Preview" className="w-full h-auto" />
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "Step 1", title: "Upload Documents", desc: "Connect your handbooks, SOPs, and safety manuals. We process any format." },
              { step: "Step 2", title: "AI Processes", desc: "Our AI classifies, indexes, and understands your entire document library." },
              { step: "Step 3", title: "Workers Ask", desc: "Team texts questions via SMS. No app needed, works on any phone." },
              { step: "Step 4", title: "Track Results", desc: "Monitor usage, see time saved, and measure ROI in your dashboard." }
            ].map((item, i) => (
              <div key={item.step} className={`scroll-animate from-bottom delay-${i+1}`}>
                <p className="text-sky-500 text-sm font-semibold mb-2">{item.step}</p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-32 px-6 md:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="scroll-animate from-bottom text-sky-500 font-semibold mb-4">CUSTOMER SUCCESS</p>
            <h2 className="scroll-animate from-bottom delay-1 text-4xl md:text-5xl font-bold text-gray-900">The best teams use Sidekick</h2>
            <p className="scroll-animate from-bottom delay-2 text-gray-600 mt-4 max-w-2xl mx-auto">See how companies transformed their onboarding and reduced incidents with Sidekick</p>
          </div>
          <div className="scroll-animate from-bottom delay-3 -mx-6 md:-mx-24">
            <div className="flex gap-6 overflow-x-auto testimonial-scroll px-6 md:px-24 pb-4">
              <div className="flex-shrink-0 w-[500px] h-[380px] rounded-2xl overflow-hidden relative group cursor-pointer">
                <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800" alt="EDS Manufacturing" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/95 via-cyan-900/60 to-cyan-900/20" />
                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                  <div className="bg-white rounded-lg px-4 py-3 inline-flex items-center gap-3 self-start shadow-lg">
                    <img src="/logos/eds.png" alt="EDS Korea" className="h-12 w-auto" />
                  </div>
                  <div>
                    <p className="text-white/90 text-lg leading-relaxed mb-4">"Sidekick cut our onboarding time by 70%. New hires get answers instantly instead of hunting down supervisors. It's been a game-changer for our floor operations."</p>
                    <p className="text-cyan-300 font-semibold">— Plant Manager, Santa Clara</p>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 w-[500px] h-[380px] rounded-2xl overflow-hidden relative group cursor-pointer">
                <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800" alt="Trinethra Supermarket" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/95 via-green-900/60 to-green-900/20" />
                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                  <div className="bg-white rounded-lg px-4 py-3 inline-flex items-center gap-3 self-start shadow-lg">
                    <img src="/logos/trinethra.png" alt="Trinethra" className="h-12 w-auto" />
                  </div>
                  <div>
                    <p className="text-white/90 text-lg leading-relaxed mb-4">"Our staff turnover was killing us. With Sidekick, new employees feel confident from day one. Customer complaints about untrained staff dropped 50%."</p>
                    <p className="text-green-300 font-semibold">— Store Director</p>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 w-[500px] h-[380px] rounded-2xl overflow-hidden relative group cursor-pointer">
                <img src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800" alt="Jim Falk Motors" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/95 via-blue-900/60 to-blue-900/20" />
                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                  <div className="bg-white rounded-lg px-4 py-3 inline-flex items-center gap-3 self-start shadow-lg">
                    <img src="/logos/jfm.png" alt="Jim Falk Motors" className="h-12 w-auto" />
                  </div>
                  <div>
                    <p className="text-white/90 text-lg leading-relaxed mb-4">"Service technicians used to waste 20 minutes finding repair procedures. Now they text Sidekick and get answers in seconds. Productivity is through the roof."</p>
                    <p className="text-blue-300 font-semibold">— Service Manager</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-32 px-6 md:px-24 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <p className="scroll-animate from-bottom text-sky-500 font-semibold mb-4">REAL-TIME INTELLIGENCE</p>
          <h2 className="scroll-animate from-bottom delay-1 text-4xl md:text-5xl font-bold text-gray-900 mb-6">AI that knows your workforce</h2>
          <p className="scroll-animate from-bottom delay-2 text-gray-600 text-lg max-w-2xl mx-auto">Answer questions instantly. Track what workers are asking. Identify training gaps before they become incidents.</p>
        </div>
        <div className="mb-8 -mx-6 md:-mx-24 overflow-hidden"><FloatingPillsTop /></div>
        <div className="-mx-6 md:-mx-24 overflow-hidden"><FloatingPillsBottom /></div>
      </section>

      <section className="bg-white py-32 px-6 md:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="scroll-animate from-left text-sky-500 font-semibold mb-4">CORE CAPABILITIES</p>
              <h2 className="scroll-animate from-left delay-1 text-4xl font-bold text-gray-900 mb-12">Every tool, one<br/>centralized platform</h2>
              <div className="space-y-6">
                {[
                  { title: "Document Intelligence", desc: "AI automatically classifies and indexes handbooks, safety manuals, SOPs, and more." },
                  { title: "SMS Q&A", desc: "Workers text questions, get instant answers. No app download required." },
                  { title: "Manager Dashboard", desc: "Track usage, monitor questions, and measure training effectiveness." },
                  { title: "AI Sidekick", desc: "24/7 assistant that knows your company policies inside and out." }
                ].map((item, i) => (
                  <div key={item.title} className={`scroll-animate from-left delay-${i+2} border-b border-gray-200 pb-6`}>
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      <span className="text-sky-500">+</span>
                    </div>
                    <p className="text-gray-600 mt-2">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="scroll-animate from-right delay-2">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800" alt="Analytics Dashboard" className="rounded-lg w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="parallax-section py-32 px-6 md:px-24 relative" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920)" }}>
        <div className="absolute inset-0 bg-gradient-to-r from-sky-600/90 to-sky-500/80" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="scroll-animate from-bottom bg-white/10 backdrop-blur-xl rounded-3xl p-12 md:p-16 border border-white/20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="scroll-animate from-left delay-1 text-4xl md:text-5xl font-bold text-white mb-4">ROI guarantees.<br/>Constant innovation.</h2>
                <p className="scroll-animate from-left delay-2 text-white/80 text-lg mb-6">See measurable results within 30 days or your money back.</p>
                <Link href="/qa" className="scroll-animate from-left delay-3 inline-block px-8 py-4 bg-white text-sky-600 font-semibold rounded-xl hover:bg-gray-100 transition-all hover:-translate-y-1">Get a demo</Link>
              </div>
              <div className="scroll-animate from-right delay-2 grid grid-cols-2 gap-4">
                {[{ v: "70%", l: "Faster onboarding" }, { v: "50%", l: "Fewer incidents" }, { v: "$15K", l: "Annual savings" }, { v: "24/7", l: "Availability" }].map(s => (
                  <div key={s.l} className="bg-white/10 backdrop-blur rounded-xl p-4 text-center border border-white/20">
                    <div className="text-3xl font-bold text-white">{s.v}</div>
                    <div className="text-white/70 text-sm">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-32 px-6 md:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="scroll-animate from-bottom text-sky-500 font-semibold mb-4">INDUSTRIES</p>
            <h2 className="scroll-animate from-bottom delay-1 text-4xl md:text-5xl font-bold text-gray-900">Built for teams that<br/>build America.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600", icon: "🏭", t: "Manufacturing", d: "Safety protocols, equipment SOPs, quality control procedures" },
              { img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600", icon: "🛒", t: "Retail", d: "Store policies, inventory management, customer service" },
              { img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600", icon: "🔧", t: "Construction", d: "Safety guidelines, equipment manuals, compliance docs" }
            ].map((item, i) => (
              <div key={item.t} className={`scroll-animate from-bottom delay-${i+1} group cursor-pointer`}>
                <div className="relative h-64 rounded-2xl overflow-hidden mb-4">
                  <img src={item.img} alt={item.t} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-4xl">{item.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.t}</h3>
                <p className="text-gray-600">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900 py-32 px-6 md:px-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="scroll-animate from-scale mb-8"><Logo size={80} /></div>
          <h2 className="scroll-animate from-bottom delay-1 text-4xl md:text-5xl font-bold text-white mb-6">Ready to transform<br/>your onboarding?</h2>
          <p className="scroll-animate from-bottom delay-2 text-xl text-white/70 mb-10 max-w-2xl mx-auto">Join companies who trust Sidekick to train their teams faster and safer.</p>
          <div className="scroll-animate from-bottom delay-3 flex flex-wrap justify-center gap-4">
            <Link href="/qa" className="px-10 py-5 bg-sky-500 hover:bg-sky-600 text-white text-lg font-semibold rounded-xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/30">Get Started Free</Link>
            <Link href="/contact" className="px-10 py-5 border-2 border-white/30 text-white text-lg font-semibold rounded-xl hover:bg-white/10 transition-all hover:-translate-y-1">Talk to Sales</Link>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 px-6 md:px-24 py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
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
    </main>
  );
}
