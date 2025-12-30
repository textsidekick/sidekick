export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12">
          <h1 className="text-5xl font-bold text-white mb-6">About Sidekick AI</h1>
          
          <div className="space-y-6 text-white/80 text-lg">
            <p>
              Sidekick AI is an intelligent onboarding assistant designed specifically for hourly workers 
              in manufacturing, retail, and service industries. We help new employees get instant answers 
              to their questions without bothering their managers.
            </p>

            <h2 className="text-3xl font-semibold text-white mt-8 mb-4">What We Do</h2>
            <p>
              Our AI-powered platform allows workers to ask questions via SMS text message and receive 
              instant, accurate answers based on your company's handbooks, safety manuals, schedules, 
              and policies. No app download required - just text and get answers.
            </p>

            <h2 className="text-3xl font-semibold text-white mt-8 mb-4">How It Works</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Companies upload their employee handbooks and training materials</li>
              <li>Our AI analyzes and understands the content</li>
              <li>Workers text their questions to our phone number</li>
              <li>They receive instant, accurate answers with source citations</li>
            </ol>

            <h2 className="text-3xl font-semibold text-white mt-8 mb-4">Our Mission</h2>
            <p>
              We believe every worker deserves quick, reliable access to the information they need to 
              succeed in their role. By automating repetitive onboarding questions, we save managers 
              time and help workers feel confident and supported from day one.
            </p>

            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-white/60">
                <strong>Company:</strong> Sidekick AI<br/>
                <strong>Location:</strong> Menlo Park, CA<br/>
                <strong>Email:</strong> so.justin8@gmail.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
