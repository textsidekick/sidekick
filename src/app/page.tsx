import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import Logos from "@/components/landing/Logos";
import HowItWorks from "@/components/landing/HowItWorks";
import Comparison from "@/components/landing/Comparison";
import KnowledgeLayer from "@/components/landing/KnowledgeLayer";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Page() {
  return (
    <main className="overflow-hidden bg-[#F3F4F1] text-[#171A1D]">
      <Nav />
      <Hero />
      <Logos />
      <HowItWorks />
      <Comparison />
      <KnowledgeLayer />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
