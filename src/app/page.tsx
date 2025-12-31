import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="w-full px-6 md:px-16 lg:px-24 py-4 bg-white flex justify-between items-center sticky top-0 z-50 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#4CAF4F] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Sidekick</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#home" className="text-gray-600 hover:text-[#4CAF4F] transition">Home</Link>
          <Link href="#features" className="text-gray-600 hover:text-[#4CAF4F] transition">Features</Link>
          <Link href="#demo" className="text-gray-600 hover:text-[#4CAF4F] transition">Demo</Link>
          <Link href="#contact" className="text-gray-600 hover:text-[#4CAF4F] transition">Contact</Link>
          <Link href="/qa" className="px-6 py-2.5 bg-[#4CAF4F] text-white rounded-md hover:bg-[#45a047] transition font-medium">
            Try Demo →
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="px-6 md:px-16 lg:px-24 py-16 md:py-24 bg-[#F5F7FA] flex flex-col md:flex-row justify-between items-center gap-12">
        <div className="flex-1 max-w-xl">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight mb-4">
            Smart onboarding for <span className="text-[#4CAF4F]">blue-collar teams</span>
          </h1>
          <p className="text-gray-500 text-lg mb-8">
            AI-powered document intelligence that understands your workplace procedures. Workers text questions, get instant answers from company handbooks.
          </p>
          <Link href="/qa" className="inline-block px-8 py-3.5 bg-[#4CAF4F] text-white rounded-md hover:bg-[#45a047] transition font-medium">
            Request Demo →
          </Link>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="w-80 h-80 md:w-96 md:h-96 bg-gradient-to-br from-[#4CAF4F]/10 to-[#4CAF4F]/5 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <div className="bg-white rounded-xl shadow-lg p-4 max-w-xs">
                <div className="text-sm text-gray-500 mb-2">Worker asks:</div>
                <div className="text-gray-900 font-medium">"Where do I park?"</div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-sm text-[#4CAF4F] mb-1">Sidekick responds:</div>
                  <div className="text-gray-700 text-sm">Employees park in Lot B behind the building.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="px-6 md:px-16 lg:px-24 py-12 bg-white">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">Our Clients</h2>
          <p className="text-gray-500">Trusted by leading manufacturers and retailers</p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          <div className="text-xl font-bold text-gray-400">EDS Manufacturing</div>
          <div className="text-xl font-bold text-gray-400">Trinethra Supermarket</div>
          <div className="text-xl font-bold text-gray-300 border-2 border-dashed border-gray-200 px-4 py-2 rounded">Your Company</div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="px-6 md:px-16 lg:px-24 py-16 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            Manage your entire onboarding <span className="text-[#4CAF4F]">in a single system</span>
          </h2>
          <p className="text-gray-500 text-lg">
            Every workplace has different documents - safety protocols, equipment manuals, shift procedures. Traditional onboarding cannot handle this complexity.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-6 md:px-16 lg:px-24 py-16 bg-[#F5F7FA]">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-lg p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="w-16 h-16 bg-[#4CAF4F]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📄</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Auto-Classification</h3>
            <p className="text-gray-500">Upload any workplace document and AI automatically classifies it - safety, equipment, schedules, and more.</p>
          </div>
          <div className="bg-white rounded-lg p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="w-16 h-16 bg-[#4CAF4F]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">💬</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Q&A Routing</h3>
            <p className="text-gray-500">Workers ask questions in plain language. Sidekick finds the right document and provides accurate answers.</p>
          </div>
          <div className="bg-white rounded-lg p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="w-16 h-16 bg-[#4CAF4F]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📱</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">SMS Integration</h3>
            <p className="text-gray-500">No app downloads needed. Workers text questions and get instant answers - perfect for the shop floor.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 md:px-16 lg:px-24 py-16 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-[#4CAF4F] mb-2">70%</div>
            <div className="text-gray-600 font-medium">Faster Onboarding</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-[#4CAF4F] mb-2">50%</div>
            <div className="text-gray-600 font-medium">Fewer Incidents</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-[#4CAF4F] mb-2">$15K</div>
            <div className="text-gray-600 font-medium">Annual Savings</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-[#4CAF4F] mb-2">95%</div>
            <div className="text-gray-600 font-medium">Accuracy</div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="px-6 md:px-16 lg:px-24 py-16 bg-[#F5F7FA]">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">Built for Real Workplaces</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-20 h-20 bg-[#4CAF4F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏭</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Manufacturing</h3>
            <p className="text-gray-500 text-sm">Safety protocols, equipment SOPs, quality control</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-[#4CAF4F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🛒</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Retail</h3>
            <p className="text-gray-500 text-sm">Store policies, inventory procedures, customer service</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-[#4CAF4F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🔧</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Field Services</h3>
            <p className="text-gray-500 text-sm">Service manuals, safety guidelines, client protocols</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="demo" className="px-6 md:px-16 lg:px-24 py-16 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">Get Started in 3 Steps</h2>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#4CAF4F] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Upload Documents</h3>
            <p className="text-gray-500">Drop your handbooks, manuals, and procedures</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-[#4CAF4F] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">AI Classifies</h3>
            <p className="text-gray-500">Our AI automatically organizes everything</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-[#4CAF4F] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Workers Ask</h3>
            <p className="text-gray-500">Team texts questions, gets instant answers</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="px-6 md:px-16 lg:px-24 py-20 bg-[#F5F7FA]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6">Ready to transform your onboarding?</h2>
          <p className="text-gray-500 text-lg mb-8">Join companies solving the document heterogeneity problem with AI.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/qa" className="px-8 py-4 bg-[#4CAF4F] text-white rounded-md font-semibold hover:bg-[#45a047] transition">Try the Demo →</Link>
            <Link href="/contact" className="px-8 py-4 border-2 border-[#4CAF4F] text-[#4CAF4F] rounded-md font-semibold hover:bg-[#4CAF4F]/5 transition">Contact Sales</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-16 lg:px-24 py-12 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#4CAF4F] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-xl font-bold">Sidekick</span>
              </div>
              <p className="text-gray-400 text-sm">AI-powered onboarding for blue-collar teams.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <Link href="/qa" className="block hover:text-white transition">Demo</Link>
                <Link href="/manager" className="block hover:text-white transition">Dashboard</Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <Link href="/about" className="block hover:text-white transition">About</Link>
                <Link href="/contact" className="block hover:text-white transition">Contact</Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <Link href="/privacy" className="block hover:text-white transition">Privacy Policy</Link>
                <Link href="/terms" className="block hover:text-white transition">Terms of Service</Link>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">© 2025 Sidekick AI. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}
