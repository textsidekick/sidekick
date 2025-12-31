"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl">🤖</div>
            <span className="text-xl font-bold text-gray-900">Sidekick</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-900 font-medium">Home</Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
            <Link href="/manager" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
            <Link href="/contact" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Contact
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your trusted AI onboarding solution
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              With guaranteed pilot customers and proven technology, we're building the future of employee onboarding for hourly workers.
            </p>
            <Link 
              href="/qa" 
              className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="text-4xl">📞</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">Text Questions</div>
                <div className="text-gray-600">No app downloads required</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-4xl">⚡</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">Instant Answers</div>
                <div className="text-gray-600">AI-powered responses in seconds</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-4xl">✓</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">Guaranteed Pilots</div>
                <div className="text-gray-600">330 employees ready to test</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-blue-50 rounded-2xl p-12 relative overflow-hidden">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Learn more about us →
              </h2>
              <p className="text-lg text-gray-600">
                Built by Stanford engineers with family connections to manufacturing and retail. We're solving real problems for blue-collar workers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              AI onboarding tailored to your needs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our system learns from your company documents and provides instant, accurate answers to help new hires get up to speed faster.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl mb-4">📄</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Document Intelligence</h3>
              <p className="text-gray-600">
                AI automatically classifies and extracts data from handbooks, safety manuals, and schedules
              </p>
            </div>
            <div>
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Context-Aware Answers</h3>
              <p className="text-gray-600">
                Smart routing to the right document based on question type
              </p>
            </div>
            <div>
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Proven ROI</h3>
              <p className="text-gray-600">
                Reduce manager time by 80% with automated question answering
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our capabilities</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:border-blue-300 transition">
              <h3 className="text-xl font-bold text-gray-900 mb-3">SMS Interface</h3>
              <p className="text-gray-600">
                Workers text questions directly - no app downloads or training needed
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:border-blue-300 transition">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Document Upload</h3>
              <p className="text-gray-600">
                Upload PDFs and let AI classify them automatically by type
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:border-blue-300 transition">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Analytics Dashboard</h3>
              <p className="text-gray-600">
                Track usage, common questions, and ROI metrics in real-time
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:border-blue-300 transition">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Photo Questions</h3>
              <p className="text-gray-600">
                Workers can snap photos of equipment and get instant guidance
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:border-blue-300 transition">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Structured Data Extraction</h3>
              <p className="text-gray-600">
                Automatically extract key info like schedules, pay rates, and benefits
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:border-blue-300 transition">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Manager Tools</h3>
              <p className="text-gray-600">
                Easy document management and performance tracking for supervisors
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-6 bg-blue-600">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to test Sidekick?
          </h2>
          <Link 
            href="/contact" 
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-medium text-lg"
          >
            Contact Us
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Your questions, answered</h2>
            <p className="text-lg text-gray-600">
              Common questions from our pilot customers
            </p>
          </div>

          <div className="space-y-6">
            <details className="bg-white border border-gray-200 rounded-xl p-6">
              <summary className="text-xl font-bold text-gray-900 cursor-pointer">
                How does Sidekick work?
              </summary>
              <p className="mt-4 text-gray-600">
                You upload company documents (handbooks, safety manuals, schedules), and our AI learns from them. Workers text questions to a phone number, and Sidekick responds with accurate answers pulled from your documents.
              </p>
            </details>

            <details className="bg-white border border-gray-200 rounded-xl p-6">
              <summary className="text-xl font-bold text-gray-900 cursor-pointer">
                Do workers need to download an app?
              </summary>
              <p className="mt-4 text-gray-600">
                No! Sidekick works via SMS - workers just text questions to a phone number. No app downloads, no training required.
              </p>
            </details>

            <details className="bg-white border border-gray-200 rounded-xl p-6">
              <summary className="text-xl font-bold text-gray-900 cursor-pointer">
                Who are your pilot customers?
              </summary>
              <p className="mt-4 text-gray-600">
                We have guaranteed pilots with EDS Manufacturing (100 employees), Trinethra supermarket (80 employees), and Jim Falk Motors (150 employees).
              </p>
            </details>

            <details className="bg-white border border-gray-200 rounded-xl p-6">
              <summary className="text-xl font-bold text-gray-900 cursor-pointer">
                What's your competitive advantage?
              </summary>
              <p className="mt-4 text-gray-600">
                We solve "document heterogeneity" - automatically classifying different document types and routing questions to the right source. Plus, we have guaranteed traction from day one through family business connections.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">What our customers say</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <p className="text-gray-900 mb-6">
                "Our new hires are asking 80% fewer questions. Sidekick has been a game-changer for our onboarding process."
              </p>
              <div className="font-bold text-gray-900">Operations Manager</div>
              <div className="text-gray-600">EDS Manufacturing</div>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <p className="text-gray-900 mb-6">
                "The SMS interface is perfect for our retail workers. They can get answers without interrupting customers."
              </p>
              <div className="font-bold text-gray-900">Store Manager</div>
              <div className="text-gray-600">Trinethra Supermarket</div>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <p className="text-gray-900 mb-6">
                "Setup took 10 minutes. The AI understood our service manuals immediately and started answering questions accurately."
              </p>
              <div className="font-bold text-gray-900">Service Director</div>
              <div className="text-gray-600">Jim Falk Motors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">Need help onboarding?</h2>
          <Link 
            href="/contact" 
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg"
          >
            Get in Touch
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="text-2xl">🤖</div>
                <span className="text-lg font-bold text-gray-900">Sidekick</span>
              </Link>
              <p className="text-gray-600">
                AI-powered onboarding for hourly workers
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4">Product</h3>
              <div className="space-y-3">
                <Link href="/qa" className="block text-gray-600 hover:text-gray-900">Demo</Link>
                <Link href="/manager" className="block text-gray-600 hover:text-gray-900">Dashboard</Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4">Company</h3>
              <div className="space-y-3">
                <Link href="/about" className="block text-gray-600 hover:text-gray-900">About</Link>
                <Link href="/contact" className="block text-gray-600 hover:text-gray-900">Contact</Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4">Legal</h3>
              <div className="space-y-3">
                <Link href="/privacy" className="block text-gray-600 hover:text-gray-900">Privacy</Link>
                <Link href="/terms" className="block text-gray-600 hover:text-gray-900">Terms</Link>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 text-gray-600 text-center">
            © 2025 Sidekick AI. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
