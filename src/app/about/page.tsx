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

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900">
      <nav className="px-6 md:px-24 py-4 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo size={32} />
          <span className="text-white text-xl font-bold">Sidekick</span>
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto p-6 md:p-12">
        <div className="text-center mb-12">
          <Logo size={80} />
          <h1 className="text-4xl font-bold text-white mt-6 mb-4">About Sidekick</h1>
          <p className="text-xl text-sky-200">AI-powered onboarding for the workforce that builds America</p>
        </div>

        <div className="space-y-12">
          <section className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Our Mission</h2>
            <p className="text-white/80 text-lg leading-relaxed">We believe every worker deserves instant access to the information they need to do their job safely and effectively. Sidekick uses AI to turn complex handbooks into simple, conversational answers.</p>
          </section>

          <section className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">The Problem</h2>
            <p className="text-white/80 text-lg leading-relaxed">Blue-collar workers often struggle with lengthy onboarding processes and dense documentation. They need answers fast but have to dig through hundreds of pages or wait for a manager.</p>
          </section>

          <section className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Our Solution</h2>
            <p className="text-white/80 text-lg leading-relaxed">Sidekick lets workers text questions and get instant, accurate answers from company documents. No app download required, works on any phone, available 24/7.</p>
          </section>

          <section className="bg-sky-500/20 border border-sky-500/30 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">Interested in Sidekick?</h2>
            <p className="text-white/80 mb-6">We are looking for pilot customers and partners.</p>
            <a href="mailto:so.justin8@gmail.com" className="inline-block px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-all">Contact Us</a>
          </section>
        </div>
      </div>
    </main>
  );
}
