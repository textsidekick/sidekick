"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl">🤖</div>
            <span className="text-xl font-bold text-gray-900">Sidekick</span>
          </Link>
          <nav className="flex items-center gap-8">
            <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            <Link href="/qa" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Try Demo
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6">
        {/* Hero */}
        <section className="py-20 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Onboarding for<br />Hourly Workers
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Instant answers to workplace questions via SMS. No app downloads, no training required.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/qa" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Try Demo
            </Link>
            <Link href="/contact" className="px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 font-medium">
              Contact Sales
            </Link>
          </div>
        </section>

        {/* Trusted By */}
        <section className="py-16 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500 mb-8">TRUSTED BY</p>
          <div className="flex justify-center items-center gap-12">
            <div className="text-2xl font-bold text-gray-700">EDS Manufacturing</div>
            <div className="text-2xl font-bold text-gray-700">Trinethra</div>
            <div className="text-2xl font-bold text-gray-700">Jim Falk Motors</div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Documents</h3>
              <p className="text-gray-600">
                Upload your handbooks, safety manuals, and schedules
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Workers Text Questions</h3>
              <p className="text-gray-600">
                Employees text questions from their phones
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant AI Answers</h3>
              <p className="text-gray-600">
                Get accurate answers in seconds from company documents
              </p>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-16 bg-gray-50 -mx-6 px-6 rounded-2xl">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xl text-gray-900 mb-6">
              "Sidekick reduced onboarding questions by 80%. Our new hires are productive faster, and managers can focus on actual work instead of answering the same questions repeatedly."
            </p>
            <p className="font-semibold text-gray-900">Operations Manager, EDS Manufacturing</p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to transform your onboarding?</h2>
          <p className="text-xl text-gray-600 mb-8">Join manufacturing and retail leaders using Sidekick</p>
          <Link href="/contact" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Get Started
          </Link>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="text-2xl">🤖</div>
                <span className="text-lg font-semibold text-gray-900">Sidekick</span>
              </Link>
              <p className="text-sm text-gray-600">
                AI-powered onboarding for hourly workers
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Product</h3>
              <div className="space-y-2">
                <Link href="/qa" className="block text-sm text-gray-600 hover:text-gray-900">Demo</Link>
                <Link href="/manager" className="block text-sm text-gray-600 hover:text-gray-900">Dashboard</Link>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Company</h3>
              <div className="space-y-2">
                <Link href="/about" className="block text-sm text-gray-600 hover:text-gray-900">About</Link>
                <Link href="/contact" className="block text-sm text-gray-600 hover:text-gray-900">Contact</Link>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Legal</h3>
              <div className="space-y-2">
                <Link href="/privacy" className="block text-sm text-gray-600 hover:text-gray-900">Privacy</Link>
                <Link href="/terms" className="block text-sm text-gray-600 hover:text-gray-900">Terms</Link>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 text-sm text-gray-600 text-center">
            © 2025 Sidekick AI. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
