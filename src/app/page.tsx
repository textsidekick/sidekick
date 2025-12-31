import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="w-full px-6 md:px-36 py-4 bg-white flex justify-between items-center sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-xl font-bold text-neutral-600 font-['Inter']">Sidekick</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#home" className="text-neutral-600 hover:text-green-500 transition font-['Inter']">Home</Link>
          <Link href="#features" className="text-neutral-600 hover:text-green-500 transition font-['Inter']">Features</Link>
          <Link href="#demo" className="text-neutral-600 hover:text-green-500 transition font-['Inter']">Demo</Link>
          <Link href="#contact" className="text-neutral-600 hover:text-green-500 transition font-['Inter']">Contact</Link>
          <Link href="/qa" className="px-8 py-3.5 bg-green-500 rounded text-white text-base font-medium font-['Inter'] hover:bg-green-600 transition">
            Try Demo →
          </Link>
        </div>
      </nav>

      {/* Hero Section - Matching Figma exactly */}
      <section id="home" className="px-6 md:px-36 py-24 bg-slate-50 flex flex-col md:flex-row justify-start items-center gap-24">
        <div className="flex-1 flex flex-col justify-start items-start gap-8">
          <div className="flex flex-col justify-start items-start gap-4">
            <div className="text-4xl md:text-6xl font-semibold font-['Inter'] leading-tight md:leading-[76px]">
              <span className="text-neutral-600">Smart onboarding for </span>
              <span className="text-green-500">blue-collar teams</span>
            </div>
            <div className="text-neutral-500 text-base font-normal font-['Inter'] leading-6">
              AI-powered document intelligence that understands your workplace procedures. Workers text questions, get instant answers.
            </div>
          </div>
          <Link href="/qa" className="px-8 py-3.5 bg-green-500 rounded inline-flex justify-center items-center gap-2.5 hover:bg-green-600 transition">
            <span className="text-center text-white text-base font-medium font-['Inter'] leading-6">Request Demo</span>
          </Link>
        </div>
        <div className="w-80 h-80 md:w-96 md:h-96 relative bg-gradient-to-br from-green-500/10 to-slate-100 rounded-2xl flex items-center justify-center">
          <div className="text-center p-4">
            <div className="text-6xl mb-4">💬</div>
            <div className="bg-white rounded-xl shadow-lg p-4 max-w-xs">
              <div className="text-sm text-neutral-500 mb-2 font-['Inter']">Worker asks:</div>
              <div className="text-neutral-600 font-medium font-['Inter']">"Where do I park?"</div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-sm text-green-500 mb-1 font-['Inter']">Sidekick responds:</div>
                <div className="text-neutral-600 text-sm font-['Inter']">Employees park in Lot B behind the building.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="px-6 md:px-36 py-8 bg-white">
        <div className="text-center mb-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-neutral-600 font-['Inter']">Our Clients</h2>
          <p className="text-neutral-500 font-['Inter']">Trusted by leading manufacturers and retailers</p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 py-4">
          <div className="text-xl font-bold text-neutral-400 font-['Inter']">EDS Manufacturing</div>
          <div className="text-xl font-bold text-neutral-400 font-['Inter']">Trinethra Supermarket</div>
          <div className="text-xl font-bold text-neutral-300 border-2 border-dashed border-neutral-200 px-4 py-2 rounded font-['Inter']">Your Company</div>
        </div>
      </section>

      {/* Value Prop Section */}
      <section className="px-6 md:px-36 py-16 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold font-['Inter'] leading-tight mb-4">
            <span className="text-neutral-600">Manage your entire onboarding </span>
            <span className="text-green-500">in a single system</span>
          </h2>
          <p className="text-neutral-500 text-base font-normal font-['Inter'] leading-6">
            Every workplace has different documents - safety protocols, equipment manuals, shift procedures. Traditional onboarding cannot handle this complexity.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-6 md:px-36 py-16 bg-slate-50">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-lg p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📄</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-600 mb-3 font-['Inter']">Auto-Classification</h3>
            <p className="text-neutral-500 font-['Inter']">Upload any workplace document and AI automatically classifies it - safety, equipment, schedules.</p>
          </div>
          <div className="bg-white rounded-lg p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">💬</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-600 mb-3 font-['Inter']">Smart Q&A Routing</h3>
            <p className="text-neutral-500 font-['Inter']">Workers ask questions in plain language. Sidekick finds the right document and provides accurate answers.</p>
          </div>
          <div className="bg-white rounded-lg p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📱</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-600 mb-3 font-['Inter']">SMS Integration</h3>
            <p className="text-neutral-500 font-['Inter']">No app downloads needed. Workers text questions and get instant answers - perfect for the shop floor.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 md:px-36 py-16 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-green-500 mb-2 font-['Inter']">70%</div>
            <div className="text-neutral-600 font-medium font-['Inter']">Faster Onboarding</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-green-500 mb-2 font-['Inter']">50%</div>
            <div className="text-neutral-600 font-medium font-['Inter']">Fewer Incidents</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-green-500 mb-2 font-['Inter']">$15K</div>
            <div className="text-neutral-600 font-medium font-['Inter']">Annual Savings</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-green-500 mb-2 font-['Inter']">95%</div>
            <div className="text-neutral-600 font-medium font-['Inter']">Accuracy</div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="px-6 md:px-36 py-16 bg-slate-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-neutral-600 mb-4 font-['Inter']">Built for Real Workplaces</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏭</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-600 mb-2 font-['Inter']">Manufacturing</h3>
            <p className="text-neutral-500 text-sm font-['Inter']">Safety protocols, equipment SOPs, quality control</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🛒</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-600 mb-2 font-['Inter']">Retail</h3>
            <p className="text-neutral-500 text-sm font-['Inter']">Store policies, inventory procedures, customer service</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🔧</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-600 mb-2 font-['Inter']">Field Services</h3>
            <p className="text-neutral-500 text-sm font-['Inter']">Service manuals, safety guidelines, client protocols</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="demo" className="px-6 md:px-36 py-16 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-neutral-600 mb-4 font-['Inter']">Get Started in 3 Steps</h2>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold font-['Inter']">1</div>
            <h3 className="text-lg font-bold text-neutral-600 mb-2 font-['Inter']">Upload Documents</h3>
            <p className="text-neutral-500 font-['Inter']">Drop your handbooks, manuals, and procedures</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold font-['Inter']">2</div>
            <h3 className="text-lg font-bold text-neutral-600 mb-2 font-['Inter']">AI Classifies</h3>
            <p className="text-neutral-500 font-['Inter']">Our AI automatically organizes everything</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold font-['Inter']">3</div>
            <h3 className="text-lg font-bold text-neutral-600 mb-2 font-['Inter']">Workers Ask</h3>
            <p className="text-neutral-500 font-['Inter']">Team texts questions, gets instant answers</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="px-6 md:px-36 py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-neutral-600 mb-6 font-['Inter']">Ready to transform your onboarding?</h2>
          <p className="text-neutral-500 text-lg mb-8 font-['Inter']">Join companies solving the document heterogeneity problem with AI.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/qa" className="px-8 py-3.5 bg-green-500 text-white rounded font-medium hover:bg-green-600 transition font-['Inter']">Try the Demo →</Link>
            <Link href="/contact" className="px-8 py-3.5 border-2 border-green-500 text-green-500 rounded font-medium hover:bg-green-50 transition font-['Inter']">Contact Sales</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-36 py-12 bg-neutral-800 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-xl font-bold font-['Inter']">Sidekick</span>
              </div>
              <p className="text-neutral-400 text-sm font-['Inter']">AI-powered onboarding for blue-collar teams.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 font-['Inter']">Product</h3>
              <div className="space-y-2 text-sm text-neutral-400">
                <Link href="/qa" className="block hover:text-white transition font-['Inter']">Demo</Link>
                <Link href="/manager" className="block hover:text-white transition font-['Inter']">Dashboard</Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4 font-['Inter']">Company</h3>
              <div className="space-y-2 text-sm text-neutral-400">
                <Link href="/about" className="block hover:text-white transition font-['Inter']">About</Link>
                <Link href="/contact" className="block hover:text-white transition font-['Inter']">Contact</Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4 font-['Inter']">Legal</h3>
              <div className="space-y-2 text-sm text-neutral-400">
                <Link href="/privacy" className="block hover:text-white transition font-['Inter']">Privacy Policy</Link>
                <Link href="/terms" className="block hover:text-white transition font-['Inter']">Terms of Service</Link>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-700 text-center text-neutral-400 text-sm font-['Inter']">© 2025 Sidekick AI. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}
