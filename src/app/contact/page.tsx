"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Mail, MapPin, Calendar, MessageSquare } from "lucide-react";

export default function Contact() {
  const calLink = "https://cal.com/justin-so-xnr0oc/sidekick-demo";
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    employees: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 overflow-x-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fade-up 0.6s ease-out forwards; }
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
            <Link href="/contact" className="text-zinc-900 font-medium text-sm transition-colors hidden md:block">Contact</Link>
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

      {/* Hero */}
      <section className="pt-28 pb-16 px-6 bg-gradient-to-b from-blue-50/50 to-[#fafafa]">
        <div className={`max-w-4xl mx-auto text-center ${isLoaded ? 'fade-up' : 'opacity-0'}`}>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Let&apos;s talk
          </h1>
          <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
            Have questions about Sidekick? Want to see a demo? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-12 px-6 bg-white border-y border-zinc-100">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <a 
              href={calLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-50 border border-blue-100 rounded-xl p-6 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-zinc-900 mb-2">Book a Demo</h3>
              <p className="text-sm text-zinc-500 mb-3">See Sidekick in action with a personalized walkthrough.</p>
              <span className="text-sm text-blue-600 font-medium flex items-center gap-1">
                Schedule now <ArrowRight className="w-3 h-3" />
              </span>
            </a>
            
            <a 
              href="mailto:hello@sidekick.ai"
              className="bg-[#fafafa] border border-zinc-200 rounded-xl p-6 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-zinc-200 transition-colors">
                <Mail className="w-6 h-6 text-zinc-600" />
              </div>
              <h3 className="font-semibold text-zinc-900 mb-2">Email Us</h3>
              <p className="text-sm text-zinc-500 mb-3">Reach out directly and we&apos;ll respond within 24 hours.</p>
              <span className="text-sm text-zinc-600 font-medium">hello@sidekick.ai</span>
            </a>
            
            <div className="bg-[#fafafa] border border-zinc-200 rounded-xl p-6">
              <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-zinc-600" />
              </div>
              <h3 className="font-semibold text-zinc-900 mb-2">Location</h3>
              <p className="text-sm text-zinc-500 mb-3">We&apos;re based in the San Francisco Bay Area.</p>
              <span className="text-sm text-zinc-600 font-medium">Santa Clara, CA</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 px-6 bg-[#fafafa]">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 md:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">Send us a message</h2>
              <p className="text-zinc-500">Fill out the form below and we&apos;ll get back to you shortly.</p>
            </div>

            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-2">Message sent!</h3>
                <p className="text-zinc-500 mb-6">Thanks for reaching out. We&apos;ll be in touch soon.</p>
                <a
                  href={calLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Book a Demo <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Company</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Number of Employees</label>
                    <select
                      value={formData.employees}
                      onChange={(e) => setFormData({...formData, employees: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white"
                    >
                      <option value="">Select...</option>
                      <option value="1-50">1-50</option>
                      <option value="51-200">51-200</option>
                      <option value="201-500">201-500</option>
                      <option value="501-1000">501-1000</option>
                      <option value="1000+">1000+</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                    placeholder="How can we help?"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                  {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            )}
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
              <p className="text-zinc-500 text-sm">
                <a href="mailto:hello@sidekick.ai" className="hover:text-white transition-colors">hello@sidekick.ai</a>
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
