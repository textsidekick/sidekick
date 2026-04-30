import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import Logos from "@/components/landing/Logos";
import HowItWorks from "@/components/landing/HowItWorks";
import UseCases from "@/components/landing/UseCases";
import KnowledgeLayer from "@/components/landing/KnowledgeLayer";
import CTA from "@/components/landing/CTA";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";

export default function Page() {
  return (
    <main className="overflow-hidden" style={{ background: "#F7F3EC", color: "#1C1A16" }}>
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
  );
}
