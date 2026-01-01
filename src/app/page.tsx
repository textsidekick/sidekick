import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const calLink = "https://cal.com/justin-so-xnr0oc/sidekick-demo";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-semibold text-slate-900">Sidekick</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/about" className="text-slate-600 hover:text-slate-900 transition-colors">
              About
            </Link>
            <Link href="/pricing" className="text-slate-600 hover:text-slate-900 transition-colors">
              Pricing
            </Link>
            <a
              href={calLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Book a Demo
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            AI-Powered Onboarding for Blue-Collar Teams
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
            Every question answered.
            <br />
            <span className="text-blue-600">The right way.</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Our AI assistant seamlessly answers worker questions from your handbooks,
            simulates countless scenarios, and delivers the best response—via SMS.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={calLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-600/25"
            >
              Book a Demo
            </a>
            <Link
              href="/contact"
              className="text-slate-700 px-8 py-4 rounded-xl font-semibold text-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider text-center mb-3">
            HOW IT WORKS
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-16">
            Simple setup, powerful results.
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Upload Documents",
                desc: "Connect your handbooks, SOPs, and safety manuals. We process any format.",
              },
              {
                step: "2",
                title: "AI Processes",
                desc: "Our AI classifies, indexes, and understands your entire document library.",
              },
              {
                step: "3",
                title: "Workers Ask",
                desc: "Team texts questions via SMS. No app needed, works on any phone.",
              },
              {
                step: "4",
                title: "Track Results",
                desc: "Monitor usage, see time saved, and measure ROI in your dashboard.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider text-center mb-3">
            TRUSTED BY
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-16">
            The best teams use Sidekick
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                logo: "/logos/eds.png",
                name: "EDS Manufacturing",
                quote:
                  "Sidekick cut our onboarding time by 70%. New hires get answers instantly instead of hunting down supervisors.",
                role: "Plant Manager, Santa Clara",
                image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800",
              },
              {
                logo: "/logos/trinethra.png",
                name: "Trinethra Supermarket",
                quote:
                  "Our staff turnover was killing us. With Sidekick, new employees feel confident from day one.",
                role: "Store Director",
                image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
              },
              {
                logo: "/logos/jfm.png",
                name: "Jim Falk Motors",
                quote:
                  "Service technicians used to waste 20 minutes finding repair procedures. Now they text Sidekick and get answers in seconds.",
                role: "Service Manager",
                image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800",
              },
            ].map((item) => (
              <div
                key={item.name}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-40 relative">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="p-6">
                  <Image
                    src={item.logo}
                    alt={item.name}
                    width={120}
                    height={40}
                    className="h-8 w-auto mb-4"
                  />
                  <p className="text-slate-600 mb-4">&quot;{item.quote}&quot;</p>
                  <p className="text-sm text-slate-500">— {item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-wider text-center mb-3">
            CORE CAPABILITIES
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Every tool, one centralized platform
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "📄",
                title: "Document Intelligence",
                desc: "AI automatically classifies and indexes handbooks, safety manuals, SOPs, and more.",
              },
              {
                icon: "💬",
                title: "SMS Q&A",
                desc: "Workers text questions, get instant answers. No app download required.",
              },
              {
                icon: "📊",
                title: "Manager Dashboard",
                desc: "Track usage, monitor questions, and measure training effectiveness.",
              },
              {
                icon: "🤖",
                title: "AI Sidekick",
                desc: "24/7 assistant that knows your company policies inside and out.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-colors"
              >
                <span className="text-3xl mb-4 block">{item.icon}</span>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">ROI guarantees. Constant innovation.</h2>
            <p className="text-blue-100 mb-10">
              See measurable results within 30 days or your money back.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
              {[
                { value: "70%", label: "Faster onboarding" },
                { value: "50%", label: "Fewer incidents" },
                { value: "$15K", label: "Annual savings" },
                { value: "24/7", label: "Availability" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-4xl font-bold mb-1">{stat.value}</div>
                  <div className="text-blue-200 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            <a
              href={calLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Book a Demo
            </a>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider text-center mb-3">
            INDUSTRIES
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-16">
            Built for teams that build America.
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🏭",
                title: "Manufacturing",
                desc: "Safety protocols, equipment SOPs, quality control procedures",
                image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600",
              },
              {
                icon: "🛒",
                title: "Retail",
                desc: "Store policies, inventory management, customer service",
                image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600",
              },
              {
                icon: "🔧",
                title: "Construction",
                desc: "Safety guidelines, equipment manuals, compliance docs",
                image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="relative rounded-2xl overflow-hidden group h-64"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="text-2xl mb-2 block">{item.icon}</span>
                  <h3 className="text-xl font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-slate-300 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Ready to transform your onboarding?
          </h2>
          <p className="text-xl text-slate-600 mb-10">
            Join companies who trust Sidekick to train their teams faster and safer.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={calLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-600/25"
            >
              Book a Demo
            </a>
            <Link
              href="/contact"
              className="text-slate-700 px-8 py-4 rounded-xl font-semibold text-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="font-semibold">Sidekick</span>
              </div>
              <p className="text-slate-400 text-sm">
                AI-powered onboarding for blue-collar teams. Faster training, fewer incidents.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <a href={calLink} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    Book a Demo
                  </a>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
            © 2025 Sidekick AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
