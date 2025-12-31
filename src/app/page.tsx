import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation - Clean and minimal */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-sm font-bold">
              S
            </div>
            <span className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              Sidekick
            </span>
          </Link>
          
          <div className="flex items-center gap-8">
            <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Contact
            </Link>
            <Link 
              href="/manager" 
              className="text-sm px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero - More breathing room */}
      <section className="pt-32 pb-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-8">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-sm font-medium text-blue-700">AI-Powered Onboarding</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-6xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6">
              Instant answers for
              <br />
              hourly workers
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl text-gray-600 leading-relaxed mb-10">
              AI assistant that answers employee questions via text message.
              No app downloads, no training required.
            </p>
            
            {/* CTA */}
            <div className="flex items-center gap-4">
              <Link 
                href="/qa"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors group"
              >
                Try Demo
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link 
                href="/contact"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                Book a Call
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Preview - Show actual product */}
      <section className="pb-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8 shadow-xl shadow-gray-200/50 overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 pointer-events-none" />
            
            {/* Mock screenshot */}
            <div className="relative bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                </div>
                <div className="flex-1 text-center text-sm text-gray-500">sidekick-phi.vercel.app</div>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-[70%]">
                    Where do I park?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm max-w-[70%]">
                    Employees park in Lot B behind the building. Visitor parking is in front.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Clean and minimal */}
      <section className="py-20 px-8 border-y border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">90%</div>
              <div className="text-sm text-gray-600">Questions answered instantly</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">5 min</div>
              <div className="text-sm text-gray-600">Manager time saved per worker</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">24/7</div>
              <div className="text-sm text-gray-600">Always available</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - Clean cards */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-lg text-gray-600">
              Three simple steps to transform your onboarding process
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload Documents",
                desc: "Add employee handbooks, safety manuals, and training materials. Our AI automatically organizes everything."
              },
              {
                step: "02",
                title: "Workers Text Questions",
                desc: "New hires text their questions to a simple phone number. No app needed. Works on any phone."
              },
              {
                step: "03",
                title: "Instant AI Answers",
                desc: "AI searches your documents and responds in seconds with accurate, helpful answers."
              }
            ].map((item) => (
              <div key={item.step} className="group">
                <div className="mb-6 text-sm font-bold text-blue-600">{item.step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-8 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to streamline your onboarding?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join manufacturing and retail companies using Sidekick to onboard faster.
          </p>
          <Link 
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 text-base font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Get Started
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-sm font-bold">
                  S
                </div>
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
