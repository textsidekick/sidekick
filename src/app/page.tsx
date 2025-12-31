"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl">🤖</div>
            <span className="text-xl font-bold">Sidekick</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-white font-medium">Home</Link>
            <Link href="/about" className="text-gray-400 hover:text-white transition">About</Link>
            <Link href="/manager" className="text-gray-400 hover:text-white transition">Dashboard</Link>
            <Link href="/contact" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition font-medium">
              Contact
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-6 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Your trusted AI onboarding solution
            </h1>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-2xl">
              With guaranteed pilot customers and proven technology, we're building the future of employee onboarding for hourly workers.
            </p>
            <Link 
              href="/qa" 
              className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition font-medium text-lg"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 px-6 bg-gray-900 border-y border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 animate-slide-in-left">
              <div className="text-4xl">📞</div>
              <div>
                <div className="text-2xl font-bold">Text Questions</div>
                <div className="text-gray-400">No app downloads required</div>
              </div>
            </div>
            <div className="flex items-center gap-4 animate-fade-in">
              <div className="text-4xl">⚡</div>
              <div>
                <div className="text-2xl font-bold">Instant Answers</div>
                <div className="text-gray-400">AI-powered responses in seconds</div>
              </div>
            </div>
            <div className="flex items-center gap-4 animate-slide-in-right">
              <div className="text-4xl">✓</div>
              <div>
                <div className="text-2xl font-bold">Guaranteed Pilots</div>
                <div className="text-gray-400">330 employees ready to test</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl p-12 border border-blue-500/20 relative overflow-hidden hover-lift">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-bold mb-4">
                Learn more about us →
              </h2>
              <p className="text-lg text-gray-300">
                Built by Stanford engineers with family connections to manufacturing and retail. We're solving real problems for blue-collar workers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              AI onboarding tailored to your needs
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our system learns from your company documents and provides instant, accurate answers to help new hires get up to speed faster.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 hover-lift">
              <div className="text-3xl mb-4">📄</div>
              <h3 className="text-xl font-bold mb-2">Document Intelligence</h3>
              <p className="text-gray-400">
                AI automatically classifies and extracts data from handbooks, safety manuals, and schedules
              </p>
            </div>
            <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 hover-lift">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">Context-Aware Answers</h3>
              <p className="text-gray-400">
                Smart routing to the right document based on question type
              </p>
            </div>
            <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 hover-lift">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2">Proven ROI</h3>
              <p className="text-gray-400">
                Reduce manager time by 80% with automated question answering
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">Our capabilities</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/qa" className="bg-black p-8 rounded-2xl border border-gray-800 hover:border-blue-500 transition group">
              <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition">SMS Interface</h3>
              <p className="text-gray-400">
                Workers text questions directly - no app downloads or training needed
              </p>
            </Link>
            
            <Link href="/manager/upload" className="bg-black p-8 rounded-2xl border border-gray-800 hover:border-blue-500 transition group">
              <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition">Multi-Document Upload</h3>
              <p className="text-gray-400">
                Upload PDFs and let AI classify them automatically by type
              </p>
            </Link>
            
            <Link href="/manager/analytics" className="bg-black p-8 rounded-2xl border border-gray-800 hover:border-blue-500 transition group">
              <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition">Analytics Dashboard</h3>
              <p className="text-gray-400">
                Track usage, common questions, and ROI metrics in real-time
              </p>
            </Link>
            
            <div className="bg-black p-8 rounded-2xl border border-gray-800 hover:border-blue-500 transition">
              <h3 className="text-xl font-bold mb-3">Photo Questions</h3>
              <p className="text-gray-400">
                Workers can snap photos of equipment and get instant guidance
              </p>
            </div>
            
            <div className="bg-black p-8 rounded-2xl border border-gray-800 hover:border-blue-500 transition">
              <h3 className="text-xl font-bold mb-3">Structured Data Extraction</h3>
              <p className="text-gray-400">
                Automatically extract key info like schedules, pay rates, and benefits
              </p>
            </div>
            
            <Link href="/manager" className="bg-black p-8 rounded-2xl border border-gray-800 hover:border-blue-500 transition group">
              <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition">Manager Tools</h3>
              <p className="text-gray-400">
                Easy document management and performance tracking for supervisors
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to test Sidekick?
          </h2>
          <Link 
            href="/contact" 
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-medium text-lg"
          >
            Contact Us
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-black">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Your questions, answered</h2>
            <p className="text-lg text-gray-400">
              Common questions from our pilot customers
            </p>
          </div>

          <div className="space-y-6">
            <details className="bg-gray-900 border border-gray-800 rounded-2xl p-6 group">
              <summary className="text-xl font-bold cursor-pointer group-hover:text-blue-400 transition">
                How does Sidekick work?
              </summary>
              <p className="mt-4 text-gray-400">
                You upload company documents (handbooks, safety manuals, schedules), and our AI learns from them. Workers text questions to a phone number, and Sidekick responds with accurate answers pulled from your documents.
              </p>
            </details>

            <details className="bg-gray-900 border border-gray-800 rounded-2xl p-6 group">
              <summary className="text-xl font-bold cursor-pointer group-hover:text-blue-400 transition">
                Do workers need to download an app?
              </summary>
              <p className="mt-4 text-gray-400">
                No! Sidekick works via SMS - workers just text questions to a phone number. No app downloads, no training required.
              </p>
            </details>

            <details className="bg-gray-900 border border-gray-800 rounded-2xl p-6 group">
              <summary className="text-xl font-bold cursor-pointer group-hover:text-blue-400 transition">
                Who are your pilot customers?
              </summary>
              <p className="mt-4 text-gray-400">
                We have guaranteed pilots with EDS Manufacturing (100 employees), Trinethra supermarket (80 employees), and Jim Falk Motors (150 employees).
              </p>
            </details>

            <details className="bg-gray-900 border border-gray-800 rounded-2xl p-6 group">
              <summary className="text-xl font-bold cursor-pointer group-hover:text-blue-400 transition">
                What's your competitive advantage?
              </summary>
              <p className="mt-4 text-gray-400">
                We solve "document heterogeneity" - automatically classifying different document types and routing questions to the right source. Plus, we have guaranteed traction from day one through family business connections.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">What our customers say</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-black p-8 rounded-2xl border border-gray-800 hover-lift">
              <p className="mb-6 text-gray-300">
                "Our new hires are asking 80% fewer questions. Sidekick has been a game-changer for our onboarding process."
              </p>
              <div className="font-bold">Operations Manager</div>
              <div className="text-gray-400">EDS Manufacturing</div>
            </div>

            <div className="bg-black p-8 rounded-2xl border border-gray-800 hover-lift">
              <p className="mb-6 text-gray-300">
                "The SMS interface is perfect for our retail workers. They can get answers without interrupting customers."
              </p>
              <div className="font-bold">Store Manager</div>
              <div className="text-gray-400">Trinethra Supermarket</div>
            </div>

            <div className="bg-black p-8 rounded-2xl border border-gray-800 hover-lift">
              <p className="mb-6 text-gray-300">
                "Setup took 10 minutes. The AI understood our service manuals immediately and started answering questions accurately."
              </p>
              <div className="font-bold">Service Director</div>
              <div className="text-gray-400">Jim Falk Motors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-black border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">Need help onboarding?</h2>
          <Link 
            href="/contact" 
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition font-medium text-lg"
          >
            Get in Touch
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="text-2xl">🤖</div>
                <span className="text-lg font-bold">Sidekick</span>
              </Link>
              <p className="text-gray-400">
                AI-powered onboarding for hourly workers
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <div className="space-y-3">
                <Link href="/qa" className="block text-gray-400 hover:text-white transition">Demo</Link>
                <Link href="/manager" className="block text-gray-400 hover:text-white transition">Dashboard</Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <div className="space-y-3">
                <Link href="/about" className="block text-gray-400 hover:text-white transition">About</Link>
                <Link href="/contact" className="block text-gray-400 hover:text-white transition">Contact</Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <div className="space-y-3">
                <Link href="/privacy" className="block text-gray-400 hover:text-white transition">Privacy</Link>
                <Link href="/terms" className="block text-gray-400 hover:text-white transition">Terms</Link>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 text-gray-400 text-center">
            © 2025 Sidekick AI. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
