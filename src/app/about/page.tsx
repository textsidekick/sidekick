"use client";

import Link from "next/link";

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

const team = [
  {
    name: "Justin Kim",
    role: "Co-founder & CEO",
    bio: "Former product lead with deep experience in AI and blue-collar workforce tools.",
    image: "JK",
  },
  {
    name: "Alex Chen",
    role: "Co-founder & CTO",
    bio: "Full-stack engineer passionate about making AI accessible to frontline workers.",
    image: "AC",
  },
];

const values = [
  {
    icon: "🎯",
    title: "Simplicity First",
    desc: "If a worker can't use it without training, we haven't done our job. Every feature must be intuitive.",
  },
  {
    icon: "💪",
    title: "Built for the Frontline",
    desc: "We design for workers on the floor, not executives in offices. SMS-first, no apps required.",
  },
  {
    icon: "📈",
    title: "Measurable Impact",
    desc: "Every customer should see clear ROI. If we can't prove value, we don't deserve the business.",
  },
  {
    icon: "🤝",
    title: "Partners, Not Vendors",
    desc: "We succeed when our customers succeed. We're invested in their long-term outcomes.",
  },
];

const milestones = [
  { date: "Oct 2024", event: "Idea conceived after seeing onboarding chaos at family manufacturing plant" },
  { date: "Nov 2024", event: "First prototype built - simple document Q&A" },
  { date: "Dec 2024", event: "Pilot launched with 3 companies" },
  { date: "Jan 2025", event: "1,000+ questions answered" },
  { date: "Feb 2025", event: "Applying to Y Combinator S25" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="px-6 md:px-24 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-gray-900 text-xl font-bold">Sidekick</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 text-sm">Pricing</Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 text-sm">Contact</Link>
            <Link href="/qa" className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-all">Try Demo</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-6 md:px-24 bg-gradient-to-b from-sky-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Every worker deserves<br />instant answers
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're building AI that empowers blue-collar workers to get the information they need, when they need it, without hunting down a supervisor.
          </p>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 px-6 md:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">The problem we're solving</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Every day, millions of blue-collar workers have simple questions: "What are the break times?" "How do I report an incident?" "What PPE do I need for this task?"
                </p>
                <p>
                  Today, they have two options: hunt down a supervisor (wasting both people's time) or guess (risking safety and compliance).
                </p>
                <p>
                  The answers exist — buried in handbooks, SOPs, and safety manuals that nobody reads. We make that knowledge instantly accessible via a simple text message.
                </p>
              </div>
            </div>
            <div className="bg-gray-100 rounded-2xl p-8">
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-gray-500 text-sm mb-1">Average time to find a supervisor</p>
                  <p className="text-3xl font-bold text-red-500">8-12 minutes</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-gray-500 text-sm mb-1">Average time with Sidekick</p>
                  <p className="text-3xl font-bold text-green-500">2.3 seconds</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-gray-500 text-sm mb-1">Questions per worker per week</p>
                  <p className="text-3xl font-bold text-sky-500">15-20</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 md:px-24 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What we believe</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="text-3xl mb-4">{value.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-6 md:px-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet the team</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {team.map((member) => (
              <div key={member.name} className="flex gap-6 items-start">
                <div className="w-20 h-20 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600 text-2xl font-bold flex-shrink-0">
                  {member.image}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{member.name}</h3>
                  <p className="text-sky-500 text-sm mb-2">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-6 md:px-24 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our journey</h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-8">
              {milestones.map((milestone, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center flex-shrink-0 z-10">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200 flex-1">
                    <p className="text-sky-500 text-sm font-medium mb-1">{milestone.date}</p>
                    <p className="text-gray-700">{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-24 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to empower your workforce?
          </h2>
          <p className="text-xl text-white/70 mb-8">
            Join the companies transforming their onboarding with AI.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/onboarding"
              className="px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-all"
            >
              Start Free Trial
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 px-6 md:px-24 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="text-white font-bold">Sidekick</span>
          </div>
          <div className="flex gap-8 text-white/60 text-sm">
            <Link href="/about" className="hover:text-white">About</Link>
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
          <p className="text-white/40 text-sm">© 2025 Sidekick AI</p>
        </div>
      </footer>
    </div>
  );
}
