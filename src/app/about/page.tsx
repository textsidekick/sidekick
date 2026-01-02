"use client";

import Link from "next/link";
import Image from "next/image";

export default function About() {
  const calLink = "https://cal.com/justin-so-xnr0oc/sidekick-demo";

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
    <div className="min-h-screen bg-zinc-950 text-white">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
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
          background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .btn-primary {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(249, 115, 22, 0.4);
        }
        .hover-lift {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass rounded-full px-2 py-2">
        <div className="flex items-center gap-1">
          <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
              <span className="font-bold text-white text-sm font-display">S</span>
            </div>
            <span className="font-display font-semibold text-white hidden sm:block">Sidekick</span>
          </Link>
          <div className="hidden md:flex items-center">
            <Link href="/about" className="px-4 py-2 text-white transition-colors text-sm font-medium">About</Link>
            <Link href="/contact" className="px-4 py-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium">Contact</Link>
          </div>
          <a href={calLink} target="_blank" rel="noopener noreferrer" className="btn-primary px-5 py-2.5 rounded-full text-white font-semibold text-sm">Book Demo</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%)' }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-wider mb-4 block">About Us</span>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-6">
            Built by operators, <span className="gradient-text">for operators.</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-body leading-relaxed">
            We&apos;ve seen firsthand how hard it is to onboard blue-collar workers. That&apos;s why we built Sidekick.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-orange-500 text-sm font-semibold uppercase tracking-wider mb-4 block">Our Mission</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">Empowering the workforce that powers America</h2>
              <p className="text-zinc-400 font-body leading-relaxed mb-6">
                80% of the American workforce doesn&apos;t sit at a desk. They work in factories, warehouses, retail stores, and auto shops. Yet most workplace technology is built for office workers.
              </p>
              <p className="text-zinc-400 font-body leading-relaxed mb-6">
                We&apos;re changing that. Sidekick puts AI directly in the hands of frontline workers—no apps to download, no logins to remember. Just text a question and get an answer.
              </p>
            </div>
            <div className="relative">
              <div className="glass-card rounded-2xl overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop" alt="Manufacturing" width={600} height={400} className="object-cover" />
              </div>
              <div className="absolute -bottom-6 -right-6 glass-card rounded-xl p-4 max-w-[200px]">
                <div className="text-3xl font-display font-bold text-orange-500 mb-1">80%</div>
                <div className="text-sm text-zinc-400">of workers don&apos;t sit at a desk</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-orange-500 text-sm font-semibold uppercase tracking-wider mb-4 block">Our Team</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Meet the founders</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto font-body">
              We&apos;re builders from top tech companies and universities, united by a mission to transform workplace training.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <div key={i} className="glass-card rounded-2xl p-8 text-center hover-lift group">
                <div className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden ring-4 ring-zinc-800 group-hover:ring-orange-500/50 transition-all">
                  <Image src={member.image} alt={member.name} fill className="object-cover" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-1">{member.name}</h3>
                <p className="text-orange-500 font-medium text-sm mb-3">{member.role}</p>
                <div className="space-y-2">
                  <p className="text-zinc-400 text-sm flex items-center justify-center gap-2">
                    <span className="text-zinc-600">💼</span> {member.company}
                  </p>
                  <p className="text-zinc-500 text-sm flex items-center justify-center gap-2">
                    <span className="text-zinc-600">🎓</span> {member.university}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="text-orange-500 text-sm font-semibold uppercase tracking-wider mb-4 block">Our Values</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">What drives us</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "🎯", title: "Worker-First", desc: "Every feature starts with: does this make a worker's life easier?" },
              { icon: "⚡", title: "Speed Matters", desc: "In manufacturing and retail, time is money. We optimize for instant answers." },
              { icon: "🤝", title: "Trust & Safety", desc: "Workers trust us with their questions. We take privacy seriously." },
            ].map((v, i) => (
              <div key={i} className="glass-card rounded-2xl p-8 hover-lift">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-display text-xl font-bold text-white mb-3">{v.title}</h3>
                <p className="text-zinc-400 font-body">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">Ready to see Sidekick in action?</h2>
          <p className="text-xl text-zinc-400 mb-8 font-body">Book a demo and see how we can transform your team&apos;s onboarding.</p>
          <a href={calLink} target="_blank" rel="noopener noreferrer" className="btn-primary px-8 py-4 rounded-xl text-white font-bold text-lg inline-flex items-center gap-2">
            Book a Demo
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </a>
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
              <p className="text-zinc-500 max-w-sm font-body">AI-powered onboarding for blue-collar teams.</p>
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
