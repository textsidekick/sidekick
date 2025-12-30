export default function SMSConsentPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12">
          <h1 className="text-5xl font-bold text-white mb-6">SMS Opt-in Consent Process</h1>
          <p className="text-white/60 mb-8">How workers consent to receive SMS messages from Sidekick AI</p>
          
          <div className="space-y-8 text-white/80">
            <section>
              <h2 className="text-3xl font-semibold text-white mb-4">Opt-in Process</h2>
              <p className="mb-4">
                Workers receive the Sidekick AI phone number from their employer during onboarding. 
                The opt-in process works as follows:
              </p>
              
              <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6 space-y-4">
                <div>
                  <p className="text-emerald-400 font-semibold mb-2">Step 1: Employer Provides Number</p>
                  <p className="text-white/70">
                    During new hire orientation, the manager gives workers the Sidekick phone number 
                    and explains it's a text-based assistant for onboarding questions.
                  </p>
                </div>

                <div>
                  <p className="text-emerald-400 font-semibold mb-2">Step 2: Worker Initiates Contact</p>
                  <p className="text-white/70">
                    Worker sends their first text message to the Sidekick number (e.g., "Where do I park?")
                  </p>
                </div>

                <div>
                  <p className="text-emerald-400 font-semibold mb-2">Step 3: Welcome Message & Consent</p>
                  <p className="text-white/70 mb-3">
                    Sidekick responds with a welcome message explaining the service:
                  </p>
                  <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-4">
                    <p className="text-white font-mono text-sm">
                      "Welcome to Sidekick! 🤖 I'm your AI onboarding assistant. Ask me questions about 
                      your new job and I'll answer based on your company's handbooks and policies. 
                      By continuing to text, you consent to receive automated SMS responses. Message & data 
                      rates may apply. Reply STOP to opt out anytime. Reply HELP for assistance."
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-emerald-400 font-semibold mb-2">Step 4: Continued Use = Consent</p>
                  <p className="text-white/70">
                    By continuing to send messages after receiving the welcome message, workers provide 
                    ongoing consent to receive SMS responses.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-white mb-4">Opt-out Process</h2>
              <p className="mb-4">Workers can opt out at any time by:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Texting <strong className="text-white">STOP</strong> to the Sidekick number</li>
                <li>Texting <strong className="text-white">UNSUBSCRIBE</strong> to the Sidekick number</li>
                <li>Contacting their employer to request removal</li>
              </ul>
              
              <div className="bg-red-500/10 border border-red-400/20 rounded-lg p-4 mt-4">
                <p className="text-white font-mono text-sm">
                  Automatic response when worker texts STOP:<br/>
                  "You've been unsubscribed from Sidekick AI. You won't receive any more messages. 
                  Text START to resubscribe or contact your manager for help."
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-white mb-4">Help Process</h2>
              <p className="mb-4">Workers can get help by texting HELP:</p>
              
              <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-4">
                <p className="text-white font-mono text-sm">
                  Automatic response when worker texts HELP:<br/>
                  "Sidekick AI helps answer your onboarding questions. Just text any question about 
                  your job! Msg&data rates may apply. Text STOP to opt out. 
                  Need human help? Contact: so.justin8@gmail.com"
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-white mb-4">Message Frequency</h2>
              <p>
                Message frequency varies based on how many questions the worker asks. Typical usage:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>First week: 5-10 messages as workers learn their role</li>
                <li>Ongoing: 1-3 messages per week for clarification questions</li>
                <li>Workers only receive responses to questions they initiate</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-white mb-4">Data & Privacy</h2>
              <p>
                Standard message and data rates apply based on the worker's mobile carrier plan. 
                Sidekick AI does not charge any fees for SMS messages. All data handling complies 
                with our <a href="/privacy" className="text-emerald-400 hover:text-emerald-300 underline">Privacy Policy</a>.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-white mb-4">Contact Information</h2>
              <p>
                For questions about SMS consent or to request opt-out:<br/>
                <strong className="text-white">Email:</strong> so.justin8@gmail.com<br/>
                <strong className="text-white">Phone:</strong> Toll-free number (pending approval)
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
