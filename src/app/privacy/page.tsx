"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Privacy() {
  const [scrollY, setScrollY] = useState(0);
  const calLink = "https://cal.com/justin-so-xnr0oc/sidekick-demo";

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-[#fafafa]/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white text-sm">S</span>
            </div>
            <span className="font-semibold text-zinc-900">Sidekick</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/#how-it-works" className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors hidden md:block">How it works</Link>
            <Link href="/about" className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors hidden md:block">About</Link>
            <Link href="/contact" className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors hidden md:block">Contact</Link>
            <a 
              href={calLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Request Demo
            </a>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-28 pb-12 px-6 bg-white border-b border-zinc-100">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-zinc-500">Last updated: January 1, 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 md:p-10">
            <div className="prose prose-zinc max-w-none">
              <p className="text-zinc-600 leading-relaxed mb-8">
                Sidekick AI Inc. (&quot;Sidekick,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered onboarding assistant service.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">1. Information We Collect</h2>
              
              <h3 className="text-lg font-semibold text-zinc-900 mt-6 mb-3">Information You Provide</h3>
              <ul className="list-disc pl-6 text-zinc-600 space-y-2 mb-4">
                <li>Contact information (name, email, phone number)</li>
                <li>Company information (company name, size, industry)</li>
                <li>Questions and messages sent through our SMS or web chat service</li>
                <li>Documents uploaded to our platform (employee handbooks, SOPs, etc.)</li>
              </ul>

              <h3 className="text-lg font-semibold text-zinc-900 mt-6 mb-3">Information Collected Automatically</h3>
              <ul className="list-disc pl-6 text-zinc-600 space-y-2 mb-4">
                <li>Device information (device type, operating system)</li>
                <li>Usage data (questions asked, features used, interaction patterns)</li>
                <li>Log data (IP address, browser type, access times)</li>
              </ul>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">2. How We Use Your Information</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-zinc-600 space-y-2 mb-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process and respond to questions via SMS and web chat</li>
                <li>Generate AI-powered insights and recommendations</li>
                <li>Communicate with you about our services</li>
                <li>Analyze usage patterns to improve user experience</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">3. Information Sharing</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc pl-6 text-zinc-600 space-y-2 mb-4">
                <li><strong>Service Providers:</strong> Third parties who help us operate our services (cloud hosting, SMS providers, analytics)</li>
                <li><strong>Your Employer:</strong> If you use Sidekick through your employer, certain usage data may be shared with them</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              </ul>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">4. Data Security</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your information, including:
              </p>
              <ul className="list-disc pl-6 text-zinc-600 space-y-2 mb-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and audits</li>
                <li>Access controls and authentication measures</li>
                <li>SOC 2 Type II compliance (in progress)</li>
              </ul>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">5. Data Retention</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                We retain your information for as long as necessary to provide our services and fulfill the purposes described in this policy. When data is no longer needed, we securely delete or anonymize it.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">6. Your Rights</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">Depending on your location, you may have the right to:</p>
              <ul className="list-disc pl-6 text-zinc-600 space-y-2 mb-4">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt out of certain data processing activities</li>
                <li>Data portability</li>
              </ul>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">7. California Privacy Rights (CCPA)</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                California residents have additional rights under the CCPA, including the right to know what personal information we collect and how it&apos;s used, the right to delete personal information, and the right to opt-out of the sale of personal information (note: we do not sell personal information).
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">8. Children&apos;s Privacy</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">9. Changes to This Policy</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">10. Contact Us</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-zinc-600">
                <p><strong>Sidekick AI Inc.</strong></p>
                <p>Email: <a href="mailto:privacy@sidekick.ai" className="text-blue-600 hover:underline">privacy@sidekick.ai</a></p>
                <p>Santa Clara, CA</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-zinc-950">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-white text-sm">S</span>
                </div>
                <span className="font-semibold text-white">Sidekick</span>
              </Link>
              <p className="text-zinc-500 text-sm mb-4 max-w-xs">
                AI onboarding assistant for deskless workers. Reduce turnover, free up managers.
              </p>
            </div>
            
            <div>
              <h4 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-zinc-500 text-sm hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-zinc-500 text-sm hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-zinc-500 text-sm hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-zinc-500 text-sm hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/sms-terms" className="text-zinc-500 text-sm hover:text-white transition-colors">SMS Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-zinc-800 pt-8">
            <p className="text-zinc-600 text-xs text-center">© 2025 Sidekick AI Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
