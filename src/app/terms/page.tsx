export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12">
          <h1 className="text-5xl font-bold text-white mb-6">Terms of Service</h1>
          <p className="text-white/60 mb-8">Last Updated: December 30, 2024</p>
          
          <div className="space-y-6 text-white/80">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
              <p>
                By using Sidekick AI's services, you agree to these Terms of Service. If you do not 
                agree, please do not use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">2. Service Description</h2>
              <p>
                Sidekick AI provides an SMS-based AI assistant that answers employee questions using 
                company-provided documentation. The service is intended for onboarding and training 
                support for hourly workers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">3. User Responsibilities</h2>
              <p>Users agree to:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Provide accurate information</li>
                <li>Use the service only for legitimate business purposes</li>
                <li>Not attempt to compromise the security of the platform</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">4. SMS Messaging Terms</h2>
              <p>
                By using our SMS service, you acknowledge that:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Standard message and data rates may apply</li>
                <li>You can opt out by texting STOP at any time</li>
                <li>Message frequency varies based on usage</li>
                <li>We use Twilio for SMS delivery</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">5. Disclaimer of Warranties</h2>
              <p>
                Sidekick AI is provided "as is" without warranties of any kind. While we strive for 
                accuracy, we do not guarantee that AI-generated responses will always be correct or 
                complete. Users should verify critical information with supervisors or official 
                company policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">6. Limitation of Liability</h2>
              <p>
                Sidekick AI shall not be liable for any indirect, incidental, special, or consequential 
                damages arising from use of the service. Our total liability shall not exceed the fees 
                paid for the service in the preceding 12 months.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">7. Termination</h2>
              <p>
                We reserve the right to terminate or suspend access to our service at any time, 
                with or without cause, with or without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">8. Changes to Terms</h2>
              <p>
                We may modify these terms at any time. Continued use of the service after changes 
                constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">9. Contact Information</h2>
              <p>
                For questions about these terms, contact:<br/>
                <strong className="text-white">legal@sidekick-ai.com</strong>
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
