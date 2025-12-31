import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse pointer-events-none" />
      
      {/* Navigation */}
      <nav className="relative backdrop-blur-md bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-3xl animate-bounce">🤖</div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Sidekick
            </span>
          </div>
          <div className="flex items-center gap-8">
            <Link href="/about" className="text-white/80 hover:text-white transition">About</Link>
            <Link href="/contact" className="text-white/80 hover:text-white transition">Contact</Link>
            <Link 
              href="/manager" 
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:scale-105 transition-transform font-semibold shadow-lg shadow-blue-500/50"
            >
              Dashboard →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-32">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-blue-500/10 border border-blue-400/20 rounded-full text-blue-300 text-sm font-semibold backdrop-blur-sm">
            ✨ AI-Powered Onboarding
          </div>
          
          <h1 className="text-7xl font-bold text-white leading-tight mb-8">
            Give Your Workers
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              Instant Answers
            </span>
          </h1>
          
          <p className="text-2xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed">
            Sidekick is the AI assistant that answers employee questions via text message.
            No app downloads. No training. Just instant, accurate answers.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link 
              href="/qa"
              className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:scale-105 transition-all font-semibold text-lg shadow-2xl shadow-blue-500/50 flex items-center gap-2"
            >
              Try Demo
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link 
              href="/contact"
              className="px-8 py-4 backdrop-blur-md bg-white/10 border border-white/20 text-white rounded-full hover:bg-white/20 transition font-semibold text-lg"
            >
              Book a Call
            </Link>
          </div>
        </div>

        {/* Floating animation cards */}
        <div className="absolute top-20 right-20 animate-float">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 shadow-2xl">
            <div className="text-4xl mb-2">💬</div>
            <div className="text-white text-sm font-semibold">Questions Answered</div>
            <div className="text-3xl font-bold text-blue-400">1,234</div>
          </div>
        </div>

        <div className="absolute bottom-20 left-20 animate-float-delay">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 shadow-2xl">
            <div className="text-4xl mb-2">⚡</div>
            <div className="text-white text-sm font-semibold">Avg Response Time</div>
            <div className="text-3xl font-bold text-purple-400">2.3s</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-white mb-6">
              How it works
            </h2>
            <p className="text-xl text-white/60">
              Three simple steps to transform your onboarding
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "📄", title: "Upload Documents", desc: "Add handbooks, safety manuals, and training materials. AI organizes everything automatically." },
              { icon: "💬", title: "Workers Text Questions", desc: "New hires text their questions. No app needed. Works on any phone, anywhere." },
              { icon: "⚡", title: "Instant AI Answers", desc: "AI searches your documents and responds in seconds with accurate, helpful answers." }
            ].map((item, i) => (
              <div 
                key={i}
                className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20"
              >
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-white/70 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-3xl p-16">
            <div className="grid md:grid-cols-3 gap-16 text-center">
              <div className="group">
                <div className="text-7xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform">
                  90%
                </div>
                <div className="text-white/80 text-lg">Questions answered instantly</div>
              </div>
              <div className="group">
                <div className="text-7xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform">
                  5min
                </div>
                <div className="text-white/80 text-lg">Manager time saved per worker</div>
              </div>
              <div className="group">
                <div className="text-7xl font-bold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform">
                  24/7
                </div>
                <div className="text-white/80 text-lg">Always available support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-3xl" />
        
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-6xl font-bold text-white mb-8">
            Ready to streamline
            <br />
            your onboarding?
          </h2>
          <p className="text-2xl text-white/70 mb-12">
            Join manufacturing and retail companies using Sidekick to onboard faster.
          </p>
          <Link 
            href="/contact"
            className="inline-block px-12 py-5 bg-white text-blue-600 rounded-full hover:scale-105 transition-transform font-bold text-xl shadow-2xl"
          >
            Get Started Today →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 backdrop-blur-md bg-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="text-3xl">🤖</div>
                <span className="text-2xl font-bold text-white">Sidekick</span>
              </div>
              <p className="text-white/60">
                AI-powered onboarding for hourly workers.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Product</h3>
              <div className="space-y-3">
                <Link href="/qa" className="block text-white/60 hover:text-white transition">Demo</Link>
                <Link href="/manager" className="block text-white/60 hover:text-white transition">Dashboard</Link>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Company</h3>
              <div className="space-y-3">
                <Link href="/about" className="block text-white/60 hover:text-white transition">About</Link>
                <Link href="/contact" className="block text-white/60 hover:text-white transition">Contact</Link>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Legal</h3>
              <div className="space-y-3">
                <Link href="/privacy" className="block text-white/60 hover:text-white transition">Privacy</Link>
                <Link href="/terms" className="block text-white/60 hover:text-white transition">Terms</Link>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-white/60">
            © 2025 Sidekick AI. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
