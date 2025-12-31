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

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="px-6 md:px-24 py-4 bg-white shadow-sm flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={32} />
          <span className="text-gray-800 text-xl font-bold">Sidekick</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/about" className="text-gray-600 hover:text-sky-500 text-sm">About</Link>
          <Link href="/qa" className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium">Try Demo</Link>
        </div>
      </nav>

      <section className="relative min-h-[600px] flex items-center" style={{backgroundImage: "url(https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920)", backgroundSize: "cover", backgroundPosition: "center"}}>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/60" />
        <div className="relative z-10 px-6 md:px-24 py-20 max-w-2xl">
          <div className="mb-6"><Logo size={80} /></div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Smart onboarding for <span className="text-sky-400">blue-collar teams</span></h1>
          <p className="text-gray-200 text-lg mb-8">AI-powered document intelligence. Workers text questions, get instant answers from company handbooks.</p>
          <div className="flex gap-4">
            <Link href="/qa" className="px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg">Try Demo</Link>
            <Link href="/contact" className="px-8 py-4 bg-white/10 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/20">Contact Us</Link>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-24 py-16 text-center">
        <p className="text-gray-500 text-sm mb-6">TRUSTED BY</p>
        <div className="flex justify-center gap-12 flex-wrap">
          <span className="text-2xl font-bold text-gray-300">EDS Manufacturing</span>
          <span className="text-2xl font-bold text-gray-300">Trinethra Supermarket</span>
        </div>
      </section>

      <section className="px-6 md:px-24 py-20 bg-gray-50">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[{n:"1",t:"Upload Documents",d:"Drop your handbooks and manuals"},{n:"2",t:"AI Classifies",d:"Our AI organizes everything"},{n:"3",t:"Workers Ask",d:"Team texts questions, gets answers"}].map(s=>(
            <div key={s.n} className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="w-12 h-12 bg-sky-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">{s.n}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{s.t}</h3>
              <p className="text-gray-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-24 py-20 bg-sky-500 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">Ready to transform onboarding?</h2>
        <Link href="/qa" className="inline-block px-8 py-4 bg-white text-sky-500 font-semibold rounded-lg hover:bg-gray-100">Get Started</Link>
      </section>

      <footer className="px-6 md:px-24 py-12 bg-gray-900">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex items-center gap-2"><Logo size={32} /><span className="text-white font-bold">Sidekick</span></div>
          <div className="flex gap-8">
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-gray-400 hover:text-white text-sm">About</Link>
              <Link href="/contact" className="text-gray-400 hover:text-white text-sm">Contact</Link>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm">Privacy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm">Terms</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">© 2025 Sidekick AI</div>
      </footer>
    </main>
  );
}
