export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12">
          <h1 className="text-5xl font-bold text-white mb-6">Privacy Policy</h1>
          <p className="text-white/60 mb-8">Last Updated: December 30, 2024</p>
          
          <div className="space-y-6 text-white/80">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">1. Information We Collect</h2>
              <p>
                When you use Sidekick AI's SMS service, we collect:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Phone numbers of workers using the service</li>
                <li>Questions submitted via SMS</li>
                <li>Timestamp of each interaction</li>
                <li>Company documents uploaded by employers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
              <p>We use collected information to:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Provide instant answers to worker questions</li>
                <li>Improve our AI's accuracy and response quality</li>
                <li>Generate analytics for employers (aggregate data only)</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">3. Data Storage and Security</h2>
              <p>
                All data is stored securely on cloud servers with industry-standard encryption. 
                We implement appropriate technical and organizational measures to protect your 
                personal information against unauthorized access, alteration, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">4. Data Sharing</h2>
              <p>
                We do not sell your personal information. We may share data only with:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Your employer (questions you ask and analytics)</li>
                <li>Service providers necessary to operate our platform (e.g., Twilio for SMS)</li>
                <li>Law enforcement when required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">5. SMS Messaging</h2>
              <p>
                By texting our service, you consent to receive SMS messages. Message and data rates 
                may apply. You can opt out at any time by texting STOP. We use Twilio for SMS delivery, 
                and messages are subject to their privacy policy as well.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Access your personal data</li>
                <li>Request deletion of your data</li>
                <li>Opt out of our service at any time</li>
                <li>Lodge a complaint with a supervisory authority</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">7. Contact Us</h2>
              <p>
                For privacy-related questions or requests, contact us at:<br/>
                <strong className="text-white">privacy@sidekick-ai.com</strong>
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
