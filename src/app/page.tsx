import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Navigation Bar */}
      <nav className="border-b border-white/10 bg-black/20">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🤖</div>
            <h1 className="text-2xl font-bold text-white">Sidekick AI</h1>
          </div>
          <div className="flex gap-6">
            <Link href="/about" className="text-white/70 hover:text-white transition">About</Link>
            <Link href="/contact" className="text-white/70 hover:text-white transition">Contact</Link>
            <Link href="/privacy" className="text-white/70 hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="text-white/70 hover:text-white transition">Terms</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-8 pt-20 pb-16 text-center">
        <h1 className="text-6xl font-bold text-white mb-6">
          AI-Powered Onboarding<br/>for Hourly Workers
        </h1>
        <p className="text-2xl text-white/70 mb-12 max-w-3xl mx-auto">
          Instant answers to employee questions via SMS. Save managers time, 
          help workers succeed from day one.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link 
            href="/qa"
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white text-lg font-semibold rounded-xl transition"
          >
            Try Demo →
          </Link>
          <Link 
            href="/contact"
            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white text-lg font-semibold rounded-xl transition"
          >
            Contact Sales
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        <h2 className="text-4xl font-bold text-white text-center mb-12">How It Works</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="text-5xl mb-4">📄</div>
            <h3 className="text-2xl font-semibold text-white mb-3">1. Upload Documents</h3>
            <p className="text-white/70">
              Upload your handbooks, safety manuals, schedules, and policies. Our AI automatically 
              classifies and understands them.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-2xl font-semibold text-white mb-3">2. Workers Ask Questions</h3>
            <p className="text-white/70">
              Employees text their questions to your dedicated phone number. No app download required - 
              just simple SMS.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-2xl font-semibold text-white mb-3">3. Get Instant Answers</h3>
            <p className="text-white/70">
              AI searches your documents and provides accurate answers with source citations. 
              Managers save hours every week.
            </p>
          </div>
        </div>
      </div>

      {/* Demo/Manager Links Section */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        <h2 className="text-4xl font-bold text-white text-center mb-12">Quick Links</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Link 
            href="/qa"
            className="bg-blue-500/20 border border-blue-400/25 rounded-2xl p-8 hover:bg-blue-500/30 transition group"
          >
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-blue-300 transition">
              Worker Q&A Demo
            </h3>
            <p className="text-white/70">
              See how workers interact with Sidekick - ask questions and get instant answers
            </p>
          </Link>

          <Link 
            href="/manager"
            className="bg-emerald-500/20 border border-emerald-400/25 rounded-2xl p-8 hover:bg-emerald-500/30 transition group"
          >
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-emerald-300 transition">
              Manager Dashboard
            </h3>
            <p className="text-white/70">
              Upload documents, view analytics, and manage your Sidekick deployment
            </p>
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-white/10 rounded-2xl p-12">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Why Sidekick?</h2>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-emerald-400 mb-2">5 min</div>
              <p className="text-white/70">Average time saved per question</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-blue-400 mb-2">24/7</div>
              <p className="text-white/70">Always available for workers</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-purple-400 mb-2">90%+</div>
              <p className="text-white/70">Question accuracy rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-3">Product</h3>
              <div className="space-y-2">
                <Link href="/qa" className="block text-white/60 hover:text-white transition">Demo</Link>
                <Link href="/manager" className="block text-white/60 hover:text-white transition">Dashboard</Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-3">Company</h3>
              <div className="space-y-2">
                <Link href="/about" className="block text-white/60 hover:text-white transition">About</Link>
                <Link href="/contact" className="block text-white/60 hover:text-white transition">Contact</Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-3">Legal</h3>
              <div className="space-y-2">
                <Link href="/privacy" className="block text-white/60 hover:text-white transition">Privacy Policy</Link>
                <Link href="/terms" className="block text-white/60 hover:text-white transition">Terms of Service</Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-3">Contact</h3>
              <div className="space-y-2">
                <a href="mailto:support@sidekick-ai.com" className="block text-white/60 hover:text-white transition">
                  support@sidekick-ai.com
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/60">
            © 2024 Sidekick AI. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
