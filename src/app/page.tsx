import type { Metadata } from "next";
import { instrumentSerif, jakarta, quicksand } from "@/components/landing/fonts";
import "@/components/landing/landing.css";
import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import OrbitSection from "@/components/landing/OrbitSection";
import KnowledgeSection from "@/components/landing/KnowledgeSection";
import VideoSliver from "@/components/landing/VideoSliver";
import Spotlights from "@/components/landing/Spotlights";
import Faq from "@/components/landing/Faq";
import ContactSection from "@/components/landing/ContactSection";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Sidekick — Your workers text. Sidekick handles the rest.",
  description:
    "Workers report issues by text. Sidekick creates the work order, routes the right person, and turns every fix into searchable knowledge. No app, no login, any phone.",
};

export default function Page() {
  return (
    <div className={`lp ${jakarta.variable} ${instrumentSerif.variable} ${quicksand.variable}`}>
      <Nav />
      <Hero />
      <HowItWorks />
      <OrbitSection />
      <KnowledgeSection />
      <VideoSliver src="/landing/sliver-text.mp4" plain="Text Sidekick:" italic="photos, videos, voice memos in any language" />
      <Spotlights />
      <VideoSliver src="/landing/sliver-knowledge.mp4" plain="Every fix," italic="remembered." objectPosition="50% 100%" />
      <Faq />
      <ContactSection />
      <Footer />
    </div>
  );
}
