import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation - matching Figma nav pattern */}
      <nav className="w-full px-36 py-4 bg-white shadow-[0px_4px_8px_0px_rgba(171,190,209,0.40)] flex justify-center items-center gap-16 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 relative">
            <div className="w-2.5 h-2 absolute left-[4.56px] top-[8.57px] bg-gray-800" />
            <div className="w-2.5 h-2 absolute left-[14.84px] top-0 bg-gray-800" />
            <div className="w-2 h-2 absolute left-0 top-0 bg-green-500" />
            <div className="w-2 h-2 absolute left-[5.13px] top-[0.63px] bg-green-500" />
            <div className="w-2 h-2 absolute left-[10.20px] top-[9.35px] bg-green-500" />
            <div className="w-2 h-2 absolute left-[15.50px] top-[8.91px] bg-green-500" />
          </div>
          <span className="text-xl font-semibold text-gray-800 font-['Inter']">Sidekick</span>
        </Link>
        <div className="flex-1 flex justify-end items-center gap-8">
          <div className="hidden md:flex items-start gap-6">
            <Link href="#features" className="text-neutral-600 text-base font-medium font-['Inter'] leading-6 hover:text-green-500 transition">Features</Link>
            <Link href="#demo" className="text-neutral-600 text-base font-medium font-['Inter'] leading-6 hover:text-green-500 transition">Demo</Link>
            <Link href="#pricing" className="text-neutral-600 text-base font-medium font-['Inter'] leading-6 hover:text-green-500 transition">Pricing</Link>
            <Link href="/about" className="text-neutral-600 text-base font-medium font-['Inter'] leading-6 hover:text-green-500 transition">About</Link>
          </div>
          <Link href="/qa" className="px-8 py-3.5 bg-green-500 rounded flex justify-center items-center gap-2 hover:bg-green-600 transition">
            <span className="text-center text-white text-base font-medium font-['Inter'] leading-6">Get a Demo</span>
            <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 16 16">
              <path d="M6 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </nav>

      {/* Hero Section - Figma style */}
      <section className="px-6 md:px-24 py-16 bg-slate-50 flex flex-col md:flex-row justify-start items-center gap-20">
        <div className="flex-1 flex flex-col justify-start items-start gap-6">
          <div className="flex flex-col justify-start items-start gap-3">
            <h1 className="text-4xl md:text-6xl font-semibold font-['Inter'] leading-tight md:leading-[76px]">
              <span className="text-neutral-600">Smart onboarding for </span>
              <span className="text-green-500">blue-collar teams</span>
            </h1>
            <p className="text-neutral-500 text-base font-normal font-['Inter'] leading-6">
              AI-powered document intelligence that understands your workplace procedures. Workers text questions, get instant answers from company handbooks.
            </p>
          </div>
          <Link href="/qa" className="px-8 py-3.5 bg-green-500 rounded inline-flex justify-center items-center gap-2.5 hover:bg-green-600 transition">
            <span className="text-center text-white text-base font-medium font-['Inter'] leading-6">Request Demo</span>
          </Link>
        </div>
        <div className="w-72 h-72 md:w-96 md:h-96 relative">
          {/* Illustration placeholder matching Figma style */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-slate-100 rounded-2xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white rounded-xl shadow-[0px_8px_16px_0px_rgba(171,190,209,0.40)] p-6 max-w-xs">
              <div className="text-sm text-neutral-500 mb-2 font-['Inter']">Worker asks:</div>
              <div className="text-neutral-600 font-medium font-['Inter'] text-lg">"Where do I park?"</div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm text-green-500 mb-1 font-['Inter'] font-semibold">Sidekick responds:</div>
                <div className="text-neutral-500 text-sm font-['Inter']">Employees park in Lot B behind the building. See Section 2.3 of the handbook.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="px-6 md:px-24 py-6 bg-white">
        <div className="flex flex-col justify-start items-center gap-3">
          <div className="flex flex-col justify-start items-center gap-1.5">
            <h2 className="text-center text-neutral-600 text-2xl font-semibold font-['Inter'] leading-8">Our Clients</h2>
            <p className="text-center text-neutral-500 text-base font-normal font-['Inter'] leading-6">Trusted by leading manufacturers and retailers</p>
          </div>
          <div className="h-16 flex justify-between items-center gap-12">
            <div className="text-xl font-bold text-gray-400 font-['Inter']">EDS Manufacturing</div>
            <div className="text-xl font-bold text-gray-400 font-['Inter']">Trinethra Supermarket</div>
            <div className="text-xl font-bold text-gray-300 border-2 border-dashed border-gray-200 px-6 py-2 rounded font-['Inter']">Your Company</div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="px-6 md:px-24 py-12 bg-white">
        <div className="flex flex-col justify-start items-center gap-3">
          <h2 className="w-full max-w-lg text-center text-2xl font-semibold font-['Inter'] leading-8">
            <span className="text-neutral-600">Manage your entire onboarding </span>
            <span className="text-green-500">in a single system</span>
          </h2>
          <p className="text-center text-neutral-500 text-base font-normal font-['Inter'] leading-6">
            Who is Sidekick suitable for?
          </p>
        </div>
      </section>

      {/* Features Grid - Card style from Figma */}
      <section id="features" className="px-6 md:px-24 py-8 bg-white">
        <div className="flex flex-wrap justify-center gap-8">
          {/* Card 1 */}
          <div className="w-52 px-6 py-4 bg-white rounded-md shadow-[0px_2px_4px_0px_rgba(171,190,209,0.20)] flex flex-col justify-start items-center gap-1.5">
            <div className="flex flex-col justify-start items-center gap-3">
              <div className="w-11 h-10 relative">
                <div className="w-9 h-9 absolute right-0 bottom-0 bg-green-100 rounded-tl-xl rounded-tr rounded-bl rounded-br-md" />
                <div className="w-8 h-8 absolute left-0 top-0 flex items-center justify-center">
                  <span className="text-2xl">🏭</span>
                </div>
              </div>
              <h3 className="text-center text-neutral-600 text-xl font-bold font-['Inter'] leading-6">Manufacturing</h3>
            </div>
            <p className="w-44 text-center text-neutral-500 text-sm font-normal font-['Inter'] leading-5">Safety protocols, equipment SOPs, quality control procedures</p>
          </div>

          {/* Card 2 */}
          <div className="w-52 px-6 py-4 bg-white rounded-md shadow-[0px_2px_4px_0px_rgba(171,190,209,0.20)] flex flex-col justify-start items-center gap-1.5">
            <div className="flex flex-col justify-start items-center gap-3">
              <div className="w-11 h-10 relative">
                <div className="w-9 h-9 absolute right-0 bottom-0 bg-green-100 rounded-tl-xl rounded-tr rounded-bl rounded-br-md" />
                <div className="w-8 h-8 absolute left-0 top-0 flex items-center justify-center">
                  <span className="text-2xl">🛒</span>
                </div>
              </div>
              <h3 className="text-center text-neutral-600 text-xl font-bold font-['Inter'] leading-6">Retail</h3>
            </div>
            <p className="w-44 text-center text-neutral-500 text-sm font-normal font-['Inter'] leading-5">Store policies, inventory procedures, customer service guides</p>
          </div>

          {/* Card 3 */}
          <div className="w-52 px-6 py-4 bg-white rounded-md shadow-[0px_2px_4px_0px_rgba(171,190,209,0.20)] flex flex-col justify-start items-center gap-1.5">
            <div className="flex flex-col justify-start items-center gap-3">
              <div className="w-11 h-10 relative">
                <div className="w-9 h-9 absolute right-0 bottom-0 bg-green-100 rounded-tl-xl rounded-tr rounded-bl rounded-br-md" />
                <div className="w-8 h-8 absolute left-0 top-0 flex items-center justify-center">
                  <span className="text-2xl">🔧</span>
                </div>
              </div>
              <h3 className="text-center text-neutral-600 text-xl font-bold font-['Inter'] leading-6">Field Services</h3>
            </div>
            <p className="w-44 text-center text-neutral-500 text-sm font-normal font-['Inter'] leading-5">Service manuals, safety guidelines, client protocols</p>
          </div>
        </div>
      </section>

      {/* Stats Section - Figma style */}
      <section className="px-6 md:px-24 py-11 bg-slate-50">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col justify-start items-start gap-1.5">
            <h2 className="text-2xl font-semibold font-['Inter'] leading-8">
              <span className="text-neutral-600">Helping businesses </span>
              <span className="text-green-500">reinvent onboarding</span>
            </h2>
            <p className="text-zinc-900 text-base font-normal font-['Inter'] leading-6">We reached here with our hard work and dedication</p>
          </div>
          <div className="flex flex-col gap-7">
            <div className="flex justify-start items-center gap-5">
              <div className="flex justify-start items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg className="w-8 h-5" viewBox="0 0 32 20" fill="none">
                    <rect x="0.5" y="5.7" width="31" height="14" rx="2" stroke="#4CAF4F" strokeWidth="1.4"/>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-neutral-600 text-xl font-bold font-['Inter'] leading-6">70%</span>
                  <span className="text-neutral-500 text-sm font-normal font-['Inter'] leading-5">Faster Onboarding</span>
                </div>
              </div>
              <div className="flex justify-start items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="10" r="4" stroke="#4CAF4F" strokeWidth="1.4"/>
                    <circle cx="8" cy="22" r="4" stroke="#4CAF4F" strokeWidth="1.4"/>
                    <circle cx="24" cy="22" r="4" stroke="#4CAF4F" strokeWidth="1.4"/>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-neutral-600 text-xl font-bold font-['Inter'] leading-6">50%</span>
                  <span className="text-neutral-500 text-sm font-normal font-['Inter'] leading-5">Fewer Incidents</span>
                </div>
              </div>
            </div>
            <div className="flex justify-start items-center gap-5">
              <div className="flex justify-start items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <rect x="5.5" y="4" width="13" height="16" rx="2" stroke="#4CAF4F" strokeWidth="1.4"/>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-neutral-600 text-xl font-bold font-['Inter'] leading-6">$15K</span>
                  <span className="text-neutral-500 text-sm font-normal font-['Inter'] leading-5">Annual Savings</span>
                </div>
              </div>
              <div className="flex justify-start items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg className="w-7 h-6" viewBox="0 0 28 24" fill="none">
                    <rect x="2" y="5" width="24" height="14" rx="2" stroke="#4CAF4F" strokeWidth="1.4"/>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-neutral-600 text-xl font-bold font-['Inter'] leading-6">95%</span>
                  <span className="text-neutral-500 text-sm font-normal font-['Inter'] leading-5">Accuracy Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="demo" className="px-6 md:px-24 py-16 bg-white">
        <div className="flex flex-col justify-start items-center gap-6 mb-12">
          <h2 className="text-center text-neutral-600 text-2xl font-semibold font-['Inter'] leading-8">How It Works</h2>
        </div>
        <div className="flex flex-col md:flex-row justify-center gap-8">
          <div className="flex flex-col items-center text-center max-w-xs">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-xl font-bold font-['Inter']">1</span>
            </div>
            <h3 className="text-neutral-600 text-lg font-bold font-['Inter'] leading-6 mb-2">Upload Documents</h3>
            <p className="text-neutral-500 text-sm font-normal font-['Inter'] leading-5">Drop your handbooks, manuals, and procedures</p>
          </div>
          <div className="flex flex-col items-center text-center max-w-xs">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-xl font-bold font-['Inter']">2</span>
            </div>
            <h3 className="text-neutral-600 text-lg font-bold font-['Inter'] leading-6 mb-2">AI Classifies</h3>
            <p className="text-neutral-500 text-sm font-normal font-['Inter'] leading-5">Our AI automatically organizes and indexes everything</p>
          </div>
          <div className="flex flex-col items-center text-center max-w-xs">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-xl font-bold font-['Inter']">3</span>
            </div>
            <h3 className="text-neutral-600 text-lg font-bold font-['Inter'] leading-6 mb-2">Workers Ask</h3>
            <p className="text-neutral-500 text-sm font-normal font-['Inter'] leading-5">Team texts questions, gets instant accurate answers</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-6 bg-slate-50 flex flex-col justify-start items-center gap-6">
        <h2 className="text-center text-gray-800 text-4xl md:text-5xl font-semibold font-['Inter'] leading-tight">Ready to transform your onboarding?</h2>
        <Link href="/qa" className="px-8 py-3.5 bg-green-500 rounded inline-flex justify-center items-center gap-2.5 hover:bg-green-600 transition">
          <span className="text-center text-white text-base font-medium font-['Inter'] leading-6">Get a Demo</span>
          <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 16 16">
            <path d="M6 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </section>

      {/* Footer - Figma style */}
      <footer className="px-28 py-11 bg-gray-800 flex flex-col md:flex-row justify-start items-start gap-20">
        <div className="flex flex-col justify-start items-start gap-7">
          <div className="flex items-center gap-2">
            <div className="w-8 h-5 relative">
              <div className="w-3 h-2.5 absolute left-[2.71px] top-[10.59px] bg-white" />
              <div className="w-3 h-2.5 absolute left-[18.35px] top-0 bg-white" />
              <div className="w-2.5 h-2 absolute left-0 top-0 bg-green-500" />
              <div className="w-2.5 h-2 absolute left-[6.34px] top-[0.78px] bg-green-500" />
              <div className="w-2.5 h-2.5 absolute left-[12.61px] top-[11.56px] bg-green-500" />
              <div className="w-2.5 h-2 absolute left-[19.16px] top-[11.01px] bg-green-500" />
            </div>
            <span className="text-white text-xl font-bold font-['Inter']">Sidekick</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-slate-50 text-sm font-normal font-['Inter'] leading-5">Copyright © 2025 Sidekick AI.</p>
            <p className="text-slate-50 text-sm font-normal font-['Inter'] leading-5">All rights reserved</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center">
              <span className="text-white text-xs">in</span>
            </div>
            <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center">
              <span className="text-white text-xs">X</span>
            </div>
          </div>
        </div>
        <div className="flex gap-20">
          <div className="flex flex-col gap-4">
            <h3 className="text-white text-sm font-semibold font-['Inter'] leading-5">Company</h3>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-slate-50 text-sm font-normal font-['Inter'] leading-5 hover:text-white">About us</Link>
              <Link href="/contact" className="text-slate-50 text-sm font-normal font-['Inter'] leading-5 hover:text-white">Contact us</Link>
              <Link href="#pricing" className="text-slate-50 text-sm font-normal font-['Inter'] leading-5 hover:text-white">Pricing</Link>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-white text-sm font-semibold font-['Inter'] leading-5">Support</h3>
            <div className="flex flex-col gap-2">
              <Link href="/terms" className="text-slate-50 text-sm font-normal font-['Inter'] leading-5 hover:text-white">Terms of service</Link>
              <Link href="/privacy" className="text-slate-50 text-sm font-normal font-['Inter'] leading-5 hover:text-white">Privacy policy</Link>
              <Link href="/sms-consent" className="text-slate-50 text-sm font-normal font-['Inter'] leading-5 hover:text-white">SMS Consent</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
