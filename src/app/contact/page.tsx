"use client";

import Link from "next/link";
import { useState } from "react";

function Logo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 8 Q4 4 8 4 L40 4 Q44 4 44 8 L44 32 Q44 36 40 36 L16 36 L8 44 L8 36 Q4 36 4 32 Z" fill="#0ea5e9"/>
      <rect x="20" y="16" width="8" height="3" rx="1.5" fill="white"/>
      <circle cx="15" cy="17" r="7" stroke="white" strokeWidth="3" fill="none"/>
      <circle cx="33" cy="17" r="7" stroke="white" strokeWidth="3" fill="none"/>
      <circle cx="15" cy="16" r="2.5" fill="#1e293b"/>
      <circle cx="33" cy="16" r="2.5" fill="#1e293b"/>
      <path d="M19 28 Q24 31 29 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

const industries = [
  "Manufacturing",
  "Retail & Grocery",
  "Automotive",
  "Construction",
  "Warehouse & Logistics",
  "Hospitality",
  "Healthcare",
  "Other",
];

const companySizes = [
  "1-50 employees",
  "51-200 employees",
  "201-500 employees",
  "500+ employees",
];

const interests = [
  "Schedule a demo",
  "Get pricing info",
  "Enterprise inquiry",
  "Partnership opportunity",
  "General question",
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    industry: "",
    size: "",
    interest: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setLoading(false);
    setSubmitted(true);
  };

  const isValid = formData.firstName && formData.lastName && formData.email && formData.company && formData.interest;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 md:px-24 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-gray-900 text-xl font-bold">Sidekick</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 text-sm">Pricing</Link>
            <Link href="/qa" className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-all">Try Demo</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 md:px-24 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left Side - Info */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Let's talk about your<br />onboarding challenges
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              Whether you're looking for a demo, have questions about pricing, or want to explore enterprise solutions, we're here to help.
            </p>

            {/* Benefits */}
            <div className="space-y-6 mb-12">
              {[
                {
                  icon: "🚀",
                  title: "Quick setup",
                  desc: "Get started in less than 15 minutes. Upload docs and your team can start asking questions immediately.",
                },
                {
                  icon: "💰",
                  title: "Proven ROI",
                  desc: "Our customers save an average of 4.5 minutes per question. That adds up to thousands in savings.",
                },
                {
                  icon: "🔒",
                  title: "Enterprise ready",
                  desc: "SOC 2 compliant, SSO support, and dedicated success managers for large deployments.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="text-2xl">{item.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Other ways to reach us</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">📧</span>
                  <a href="mailto:hello@sidekick.ai" className="text-sky-500 hover:underline">hello@sidekick.ai</a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">📞</span>
                  <a href="tel:+15551234567" className="text-sky-500 hover:underline">+1 (555) 123-4567</a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">📍</span>
                  <span className="text-gray-600">San Francisco, CA</span>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="mt-8 bg-sky-50 rounded-xl p-6 border border-sky-100">
              <p className="text-gray-700 italic mb-4">
                "Sidekick cut our onboarding time by 70%. The team was incredibly responsive and helped us get set up in no time."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-200 rounded-full flex items-center justify-center text-sky-700 font-medium">MG</div>
                <div>
                  <p className="font-medium text-gray-900">Maria Garcia</p>
                  <p className="text-sm text-gray-600">Plant Manager, EDS Manufacturing</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div>
            {submitted ? (
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">✓</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Thanks for reaching out!</h2>
                <p className="text-gray-600 mb-8">
                  We've received your message and will get back to you within 24 hours. In the meantime, feel free to explore our demo.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/qa"
                    className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium transition-colors"
                  >
                    Try the Demo
                  </Link>
                  <Link
                    href="/"
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Get in touch</h2>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First name *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last name *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Work email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="john@company.com"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company name *</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Acme Inc."
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white"
                    >
                      <option value="">Select industry</option>
                      {industries.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company size</label>
                    <select
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white"
                    >
                      <option value="">Select size</option>
                      {companySizes.map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">What are you interested in? *</label>
                  <select
                    value={formData.interest}
                    onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select an option</option>
                    {interests.map((int) => (
                      <option key={int} value={int}>{int}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                    placeholder="Tell us about your onboarding challenges or questions..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={!isValid || loading}
                  className="w-full py-4 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>

                <p className="text-center text-gray-500 text-sm mt-4">
                  By submitting, you agree to our{" "}
                  <Link href="/privacy" className="text-sky-500 hover:underline">Privacy Policy</Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 md:px-24 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="text-gray-900 font-bold">Sidekick</span>
          </div>
          <p className="text-gray-500 text-sm">© 2025 Sidekick AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
