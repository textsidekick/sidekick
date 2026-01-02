"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Terms() {
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
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-zinc-500">Last updated: January 1, 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 md:p-10">
            <div className="prose prose-zinc max-w-none">
              <p className="text-zinc-600 leading-relaxed mb-8">
                Welcome to Sidekick. These Terms of Service (&quot;Terms&quot;) govern your use of our AI-powered onboarding assistant platform and related services (collectively, the &quot;Service&quot;) provided by Sidekick AI Inc. (&quot;Sidekick,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access the Service. If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">2. Description of Service</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                Sidekick provides an AI-powered platform that enables organizations to deliver instant answers to their workforce via SMS and web chat. Our Service includes:
              </p>
              <ul className="list-disc pl-6 text-zinc-600 space-y-2 mb-4">
                <li>AI-powered question answering based on uploaded company documents</li>
                <li>SMS and web chat interfaces for workers</li>
                <li>Manager dashboard and analytics</li>
                <li>Document processing and intelligence features</li>
              </ul>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">3. User Accounts</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                To use certain features of the Service, you may need to create an account. You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-zinc-600 space-y-2 mb-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Ensuring that your account information is accurate and up-to-date</li>
              </ul>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">4. Acceptable Use</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 text-zinc-600 space-y-2 mb-4">
                <li>Use the Service for any unlawful purpose</li>
                <li>Upload malicious content or documents</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Use the Service to send spam or unsolicited messages</li>
                <li>Reverse engineer or attempt to extract source code from the Service</li>
                <li>Use the Service in any way that could harm minors</li>
              </ul>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">5. Content and Data</h2>
              
              <h3 className="text-lg font-semibold text-zinc-900 mt-6 mb-3">Your Content</h3>
              <p className="text-zinc-600 leading-relaxed mb-4">
                You retain ownership of any documents, data, or content you upload to the Service (&quot;Your Content&quot;). By uploading Your Content, you grant us a limited license to process, store, and use it solely to provide the Service to you.
              </p>

              <h3 className="text-lg font-semibold text-zinc-900 mt-6 mb-3">AI-Generated Responses</h3>
              <p className="text-zinc-600 leading-relaxed mb-4">
                Our Service uses artificial intelligence to generate responses based on Your Content. While we strive for accuracy, AI-generated responses may contain errors. You are responsible for reviewing and verifying any information provided by the Service before relying on it.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">6. Payment Terms</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                If you subscribe to a paid plan, you agree to pay all applicable fees. Fees are non-refundable except as required by law or as explicitly stated in our refund policy. We may change our pricing with 30 days&apos; notice.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">7. Intellectual Property</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                The Service, including its original content, features, and functionality, is owned by Sidekick and is protected by intellectual property laws. Our trademarks may not be used without our prior written consent.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">8. Disclaimer of Warranties</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE. AI-GENERATED CONTENT MAY CONTAIN INACCURACIES.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">9. Limitation of Liability</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, SIDEKICK SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES, ARISING FROM YOUR USE OF THE SERVICE.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">10. Indemnification</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                You agree to indemnify and hold Sidekick harmless from any claims, damages, or expenses arising from your use of the Service, your violation of these Terms, or your violation of any rights of another party.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">11. Termination</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                We may terminate or suspend your access to the Service immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the Service will cease immediately.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">12. Changes to Terms</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the new Terms on this page and updating the &quot;Last updated&quot; date. Your continued use of the Service after changes constitutes acceptance of the new Terms.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">13. Governing Law</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                These Terms shall be governed by the laws of the State of California, without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of Santa Clara County, California.
              </p>

              <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">14. Contact Us</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-zinc-600">
                <p><strong>Sidekick AI Inc.</strong></p>
                <p>Email: <a href="mailto:legal@sidekick.ai" className="text-blue-600 hover:underline">legal@sidekick.ai</a></p>
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
