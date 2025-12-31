import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <span className="text-xl font-bold text-gray-900">Sidekick</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/qa" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Demo</Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 text-sm font-medium">About</Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Contact</Link>
            <Link href="/manager" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          AI-Powered Onboarding<br/>for Blue-Collar Teams
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Sidekick uses AI to answer worker questions instantly via SMS—no app downloads, no training time.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/qa" className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700">
            Try Demo
          </Link>
          <Link href="/contact" className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg text-lg font-semibold hover:border-gray-400">
            Contact Sales
          </Link>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-gray-600 mb-8 font-medium">Trusted by leading manufacturers and retailers</p>
          <div className="flex justify-center items-center gap-12">
            <div className="px-8 py-4 bg-white rounded-lg shadow-sm">
              <p className="text-xl font-bold text-gray-900">EDS Manufacturing</p>
            </div>
            <div className="px-8 py-4 bg-white rounded-lg shadow-sm">
              <p className="text-xl font-bold text-gray-900">Trinethra Supermarket</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Documents</h3>
            <p className="text-gray-600">Add employee handbooks, safety manuals, and procedures</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Classifies</h3>
            <p className="text-gray-600">Automatic categorization and intelligent search</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Workers Text Questions</h3>
            <p className="text-gray-600">Instant answers via SMS—no app needed</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">70%</div>
              <p className="text-blue-100">Faster Onboarding</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50%</div>
              <p className="text-blue-100">Fewer Safety Incidents</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$15K</div>
              <p className="text-blue-100">Saved per Worker</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <p className="text-blue-100">Answer Accuracy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🤖</span>
                <span className="text-lg font-bold">Sidekick</span>
              </div>
              <p className="text-sm text-gray-600">AI-powered onboarding</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <div className="space-y-2 text-sm">
                <Link href="/qa" className="block text-gray-600 hover:text-gray-900">Demo</Link>
                <Link href="/manager" className="block text-gray-600 hover:text-gray-900">Dashboard</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <div className="space-y-2 text-sm">
                <Link href="/about" className="block text-gray-600 hover:text-gray-900">About</Link>
                <Link href="/contact" className="block text-gray-600 hover:text-gray-900">Contact</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <div className="space-y-2 text-sm">
                <Link href="/privacy" className="block text-gray-600 hover:text-gray-900">Privacy</Link>
                <Link href="/terms" className="block text-gray-600 hover:text-gray-900">Terms</Link>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
            © 2025 Sidekick AI. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
