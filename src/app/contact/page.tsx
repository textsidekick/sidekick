export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12">
          <h1 className="text-5xl font-bold text-white mb-6">Contact Us</h1>
          
          <div className="space-y-8 text-white/80 text-lg">
            <p>
              Have questions or need support? We're here to help!
            </p>

            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-white mb-4">📧 Email Support</h2>
                <p className="mb-2">General Inquiries:</p>
                <a href="mailto:so.justin8@gmail.com" className="text-emerald-400 hover:text-emerald-300">
                  so.justin8@gmail.com
                </a>
                
                <p className="mt-4 mb-2">Sales & Partnerships:</p>
                <a href="mailto:so.justin8@gmail.com" className="text-emerald-400 hover:text-emerald-300">
                  so.justin8@gmail.com
                </a>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-white mb-4">🏢 Company Info</h2>
                <p>
                  <strong>Sidekick AI</strong><br/>
                  Menlo Park, CA 94025<br/>
                  United States
                </p>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-xl p-6 mt-8">
              <h2 className="text-2xl font-semibold text-emerald-400 mb-3">🚀 Interested in Sidekick for your business?</h2>
              <p className="mb-4">
                We're currently working with select manufacturing and retail partners to pilot our 
                SMS-based onboarding assistant. Email us at so.justin8@gmail.com to learn more!
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Response Time</h3>
              <p className="text-white/60">
                We typically respond to all inquiries within 1-2 business days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
