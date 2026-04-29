// app/page.tsx — replaces existing placeholder.
// The wrapper class `light` forces light theme on the landing page only,
// regardless of next-themes setting. Dashboard routes still respect the toggle.

import Nav from "@/components/sidekick/Nav";
import Hero from "@/components/sidekick/Hero";
import Logos from "@/components/sidekick/Logos";
import HowItWorks from "@/components/sidekick/HowItWorks";
import UseCases from "@/components/sidekick/UseCases";
import KnowledgeLayer from "@/components/sidekick/KnowledgeLayer";
import CTA from "@/components/sidekick/CTA";
import Contact from "@/components/sidekick/Contact";
import Footer from "@/components/sidekick/Footer";

export default function Page() {
  return (
    <div className="light bg-cream text-ink">
      <main className="overflow-hidden font-sans">
        <Nav />
        <Hero />
        <Logos />
        <HowItWorks />
        <UseCases />
        <KnowledgeLayer />
        <CTA />
        <Contact />
        <Footer />
      </main>
    </div>
  );
}
