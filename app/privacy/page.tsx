import LegalLayout from "@/components/sidekick/LegalLayout";

export const metadata = {
  title: "Privacy Policy · Sidekick",
};

const SUBPROCESSORS = [
  ["Twilio", "SMS message delivery (US)"],
  ["Anthropic", "Large language model inference (US)"],
  ["Supabase", "Database & authentication (US)"],
  ["Vercel", "Web hosting & edge runtime (US)"],
  ["Google Workspace", "Internal email & document collaboration (US)"],
];

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="April 29, 2026">
      <p>
        This Privacy Policy explains how Sidekick HQ, Inc. ("Sidekick," "we,"
        "us," or "our") collects, uses, shares, and protects information when
        you use our website and the Sidekick text-based assistant service
        (together, the "Service"). By using the Service, you agree to this
        Policy.
      </p>

      <h2>1. Information we collect</h2>
      <p>We collect:</p>
      <ul>
        <li>
          <strong>Account information.</strong> Name, work email, company,
          phone number, and similar contact details you provide when you
          request a demo, create an account, or correspond with us.
        </li>
        <li>
          <strong>Customer Content.</strong> Documents you upload (SOPs,
          schedules, policies, etc.) and the messages exchanged between
          Workers and the Service.
        </li>
        <li>
          <strong>Worker identifiers.</strong> Phone numbers and identifiers
          provided by you for the Workers authorized to use the Service.
        </li>
        <li>
          <strong>Usage data.</strong> Logs, device and browser information,
          IP address, timestamps, and product analytics that help us secure
          and improve the Service.
        </li>
      </ul>

      <h2>2. How we use information</h2>
      <p>We use information to:</p>
      <ul>
        <li>provide, maintain, and support the Service;</li>
        <li>respond to demo requests and other inquiries;</li>
        <li>generate answers to Worker questions, including by sending
        relevant context to AI subprocessors;</li>
        <li>secure the Service, prevent abuse, and comply with legal
        obligations;</li>
        <li>improve the Service (we do not use Customer Content to train
        third-party foundation models without your consent).</li>
      </ul>

      <h2>3. Sharing &amp; subprocessors</h2>
      <p>
        We share information only as needed to provide the Service. Our
        subprocessors today are:
      </p>
      <table className="legal-table">
        <thead>
          <tr>
            <th>Subprocessor</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          {SUBPROCESSORS.map(([name, purpose]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>{purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        We may also share information when required by law, to protect our
        rights or those of others, or in connection with a merger,
        acquisition, or sale of assets (with notice to affected customers).
      </p>

      <h2>4. PII redaction</h2>
      <p>
        Before we send Worker messages or document excerpts to AI
        subprocessors, we apply automated PII redaction to remove direct
        identifiers (such as government IDs, financial account numbers, and
        certain contact details) where practicable. Redaction is best-effort
        and not a substitute for limiting the sensitivity of content you
        upload.
      </p>

      <h2>5. Data retention</h2>
      <p>
        We retain Customer Content for as long as your account is active or
        as needed to provide the Service. After termination, we delete or
        anonymize Customer Content within a commercially reasonable period
        unless we are required by law to retain it. Logs and usage data may
        be retained for shorter or longer periods depending on their purpose.
      </p>

      <h2>6. Security</h2>
      <p>
        We use administrative, technical, and physical safeguards designed to
        protect information, including encryption in transit and at rest,
        access controls, and audit logging. We are working toward SOC 2
        Type II attestation. No system is perfectly secure; you should
        evaluate the Service in light of your own risk profile.
      </p>

      <h2>7. International transfers</h2>
      <p>
        Sidekick is operated from the United States. If you access the
        Service from outside the United States, your information will be
        transferred to and processed in the United States, where data
        protection laws may differ from those of your country.
      </p>

      <h2>8. Your rights</h2>
      <p>
        Depending on where you live, you may have rights to access, correct,
        delete, or restrict our use of your personal information, or to
        object to certain processing. To exercise these rights, email{" "}
        <a href="mailto:hello@textsidekick.com">hello@textsidekick.com</a>.
        We will respond consistent with applicable law. Customers acting as
        controllers should direct Worker requests to us; we will assist as
        the processor.
      </p>

      <h2>9. Children</h2>
      <p>
        The Service is not directed to children under 16, and we do not
        knowingly collect personal information from children. If you believe
        a child has provided us with personal information, please contact us
        and we will take steps to delete it.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may update this Policy from time to time. If we make material
        changes, we will provide reasonable notice (for example, by email or
        in-product notice). The "Last updated" date at the top of this
        Policy reflects the most recent revision.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions or concerns? Email{" "}
        <a href="mailto:hello@textsidekick.com">hello@textsidekick.com</a> or
        write to Sidekick HQ, Inc., 1011 Washington Street, San Francisco,
        CA.
      </p>
    </LegalLayout>
  );
}
