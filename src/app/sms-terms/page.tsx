"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageSquare, Shield, Phone, HelpCircle } from "lucide-react";

export default function SMSTerms() {
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
          <h1 className="text-4xl font-bold mb-4">SMS Terms & Conditions</h1>
          <p className="text-zinc-500">Last updated: January 1, 2026</p>
        </div>
      </section>

      {/* Quick Info Cards */}
      <section className="py-8 px-6 bg-[#fafafa]">
        <div className="max-w-3xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-semibold text-zinc-900">To Stop Messages</h3>
              </div>
              <p className="text-zinc-600 text-sm">Reply <strong>STOP</strong> to any message to unsubscribe from all Sidekick SMS communications.</p>
            </div>
            
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="font-semibold text-zinc-900">Need Help?</h3>
              </div>
              <p className="text-zinc-600 text-sm">Reply <strong>HELP</strong> to any message for assistance or contact <a href="mailto:support@sidekick.ai" className="text-blue-600 hover:underline">support@sidekick.ai</a></p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 md:p-10">
            <div className="prose prose-zinc max-w-none">
              <p className="text-zinc-600 leading-relaxed mb-8">
                These SMS Terms & Conditions (&quot;SMS Terms&quot;) govern your receipt of text messages from Sidekick AI Inc. (&quot;Sidekick&quot;). By opting in to receive SMS messages from us, you agree to these SMS Terms in addition to our general <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">1. Program Description</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                Sidekick&apos;s SMS service allows workers to receive instant answers to workplace questions by texting our service. Messages may include:
              </p>
              <ul className="list-disc pl-6 text-zinc-600 space-y-2 mb-4">
                <li>Responses to your workplace questions</li>
                <li>Information from your company&apos;s employee handbook, SOPs, and policies</li>
                <li>Onboarding assistance and guidance</li>
                <li>Service-related notifications</li>
              </ul>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">2. Consent & Opt-In</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                By providing your phone number and opting in, you consent to receive text messages from Sidekick. Consent is not a condition of employment or purchase of any goods or services. You can opt out at any time.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">3. Message Frequency</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                Message frequency varies based on your usage. You will receive messages when you text questions to Sidekick and may receive occasional service updates. We typically send 1-10 messages per interaction depending on the complexity of your question.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">4. Message & Data Rates</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-amber-800 font-medium">
                  ⚠️ Message and data rates may apply. Check with your mobile carrier for details about your text messaging plan.
                </p>
              </div>
              <p className="text-zinc-600 leading-relaxed mb-4">
                Sidekick does not charge for SMS messages, but your mobile carrier&apos;s standard messaging rates will apply. Contact your carrier for pricing information.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">5. How to Opt Out</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                You can stop receiving SMS messages at any time by:
              </p>
              <ul className="list-disc pl-6 text-zinc-600 space-y-2 mb-4">
                <li>Replying <strong>STOP</strong> to any message from Sidekick</li>
                <li>Emailing <a href="mailto:support@sidekick.ai" className="text-blue-600 hover:underline">support@sidekick.ai</a> with your phone number</li>
                <li>Contacting your employer&apos;s HR department</li>
              </ul>
              <p className="text-zinc-600 leading-relaxed mb-4">
                After opting out, you will receive a confirmation message. You will no longer receive messages from Sidekick unless you opt in again.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">6. How to Get Help</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                For assistance with our SMS service:
              </p>
              <ul className="list-disc pl-6 text-zinc-600 space-y-2 mb-4">
                <li>Reply <strong>HELP</strong> to any message</li>
                <li>Email <a href="mailto:support@sidekick.ai" className="text-blue-600 hover:underline">support@sidekick.ai</a></li>
                <li>Visit our <Link href="/contact" className="text-blue-600 hover:underline">Contact page</Link></li>
              </ul>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">7. Supported Carriers</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                Our SMS service is supported on all major US carriers including AT&T, Verizon, T-Mobile, Sprint, and most regional carriers. Some carriers may not support all message types.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">8. Privacy</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                Your phone number and message content are protected in accordance with our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>. We do not sell, rent, or share your phone number with third parties for marketing purposes. Your employer may have access to aggregate usage data through the Sidekick dashboard.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">9. Disclaimer</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                Sidekick provides information based on documents uploaded by your employer. While we strive for accuracy, AI-generated responses may contain errors. For critical safety or legal matters, always verify information with your supervisor or HR department.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">10. Changes to SMS Terms</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                We may update these SMS Terms from time to time. Continued use of our SMS service after changes constitutes acceptance of the updated terms.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">11. Contact Information</h2>
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-zinc-600">
                <p><strong>Sidekick AI Inc.</strong></p>
                <p>Email: <a href="mailto:support@sidekick.ai" className="text-blue-600 hover:underline">support@sidekick.ai</a></p>
                <p>Santa Clara, CA</p>
              </div>
            </div>
          </div>

          {/* Quick Reference */}
          <div className="mt-8 bg-zinc-900 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-4">Quick Reference</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-white mb-1">STOP</div>
                <p className="text-zinc-400 text-sm">to unsubscribe</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-zinc-700" />
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-white mb-1">HELP</div>
                <p className="text-zinc-400 text-sm">for assistance</p>
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
          
          <div className="border-t border-zinc-800 pt-8 mb-8">
            <p className="text-zinc-600 text-xs text-center">
              SMS: Reply STOP to unsubscribe. Reply HELP for help. Msg & data rates may apply.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-zinc-600 text-xs">© 2026 Sidekick AI Inc. All rights reserved.</p>
            <p className="text-zinc-700 text-xs">Santa Clara, CA</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
