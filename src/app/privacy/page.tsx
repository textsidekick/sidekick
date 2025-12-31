import Link from "next/link";

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

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900">
      <nav className="px-6 md:px-24 py-4 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo size={32} />
          <span className="text-white text-xl font-bold">Sidekick</span>
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto p-6 md:p-12">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-white/80">
          <p className="text-sky-200">Last updated: January 1, 2025</p>
          
          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Information We Collect</h2>
            <p>Sidekick AI collects information you provide directly, including company documents uploaded to our platform, questions asked through our Q&A interface, and account information for managers.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. How We Use Information</h2>
            <p>We use collected information to provide and improve our AI-powered onboarding services, answer employee questions accurately, and generate analytics for managers.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Data Security</h2>
            <p>We implement industry-standard security measures to protect your data, including encryption in transit and at rest, regular security audits, and access controls.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Contact Us</h2>
            <p>For privacy-related questions, contact us at: <a href="mailto:so.justin8@gmail.com" className="text-sky-400 hover:text-sky-300">so.justin8@gmail.com</a></p>
          </section>
        </div>
      </div>
    </main>
  );
}
