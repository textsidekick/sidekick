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

export default function ContactPage() {
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
          <h1 className="text-4xl font-bold text-white mb-4">Get in Touch</h1>
          <p className="text-xl text-sky-200">We would love to hear from you</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
            <div className="text-4xl mb-4">📧</div>
            <h2 className="text-xl font-semibold text-white mb-2">Email Us</h2>
            <p className="text-white/70 mb-4">For partnerships, demos, or questions</p>
            <a href="mailto:so.justin8@gmail.com" className="text-sky-400 hover:text-sky-300 font-medium">so.justin8@gmail.com</a>
          </div>

          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
            <div className="text-4xl mb-4">🚀</div>
            <h2 className="text-xl font-semibold text-white mb-2">Request a Demo</h2>
            <p className="text-white/70 mb-4">See Sidekick in action for your industry</p>
            <Link href="/qa" className="text-sky-400 hover:text-sky-300 font-medium">Try the Demo →</Link>
          </div>

          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
            <div className="text-4xl mb-4">🤝</div>
            <h2 className="text-xl font-semibold text-white mb-2">Partnerships</h2>
            <p className="text-white/70 mb-4">Interested in piloting Sidekick at your company?</p>
            <a href="mailto:so.justin8@gmail.com?subject=Sidekick Partnership" className="text-sky-400 hover:text-sky-300 font-medium">Become a Partner</a>
          </div>

          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
            <div className="text-4xl mb-4">💼</div>
            <h2 className="text-xl font-semibold text-white mb-2">Investors</h2>
            <p className="text-white/70 mb-4">We are raising our seed round</p>
            <a href="mailto:so.justin8@gmail.com?subject=Sidekick Investment" className="text-sky-400 hover:text-sky-300 font-medium">Learn More</a>
          </div>
        </div>
      </div>
    </main>
  );
}
