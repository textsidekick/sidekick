import Link from "next/link";
import Footer from "@/components/sidekick/Footer";
import Nav from "@/components/sidekick/Nav";

export default function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="light bg-cream text-ink">
      <main className="font-sans">
        <Nav />
        <article className="px-6 pt-16 pb-24">
          <div className="max-w-[760px] mx-auto">
            {/* Draft banner */}
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-[13.5px] text-amber-900 leading-[1.5]">
              <strong className="font-semibold">Draft.</strong>{" "}
              This document is provided as a placeholder and has not been
              reviewed by counsel. Please consult a lawyer before relying on it.
            </div>

            <div className="mt-10 text-[13px] uppercase tracking-[0.12em] text-ink/50 font-medium">
              <Link href="/" className="hover:text-ink">← Back to home</Link>
            </div>
            <h1 className="mt-3 font-serif font-normal text-[52px] lg:text-[64px] leading-[1.02] tracking-[-0.02em]">
              {title}
            </h1>
            <p className="mt-4 text-[14px] text-ink/55">Last updated {updated}</p>

            <div className="mt-12 legal-prose">{children}</div>
          </div>
        </article>
        <Footer />
      </main>
    </div>
  );
}
