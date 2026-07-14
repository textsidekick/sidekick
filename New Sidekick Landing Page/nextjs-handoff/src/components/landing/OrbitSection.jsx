"use client";

import ProcessOrbit from "./demos/ProcessOrbit";

const orbitProps = {
  steps: [
    { number: "01", title: "A worker texts the issue", description: "Equipment problems, safety hazards, supply needs, all described in plain language from any phone." },
    { number: "02", title: "Sidekick structures the work", description: "It identifies the asset, sets priority, creates the work order, and routes the right person with context." },
    { number: "03", title: "The fix becomes knowledge", description: "The loop closes by text. The resolution is saved as searchable history, so the next problem gets solved faster." },
  ],
  background: "#F1ECDF",
  colors: {
    ink: "#26251E",
    ghost: "rgba(38,37,30,0.16)",
    muted: "rgba(38,37,30,0.5)",
    guide: "rgba(38,37,30,0.14)",
  },
  numberFont: { fontFamily: "var(--font-instrument-serif), Georgia, serif", fontWeight: 400, fontSize: 68, letterSpacing: "-0.01em", lineHeight: "1" },
  titleFont: { fontFamily: "var(--font-instrument-serif), Georgia, serif", fontWeight: 400, fontSize: 42, letterSpacing: "-0.01em", lineHeight: "1.05" },
  descFont: { fontFamily: "var(--font-jakarta), 'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 400, fontSize: 14, letterSpacing: "0.01em", lineHeight: "1.55" },
  monoFont: { fontFamily: "'SF Mono', Menlo, monospace", fontWeight: 400, fontSize: 11, letterSpacing: "0.1em", lineHeight: "1" },
  wheelNumberSize: 50,
  showGuide: true,
  showMarks: true,
  snap: false,
  stepLength: 100,
};

export default function OrbitSection() {
  return (
    <section style={{ position: "relative" }}>
      <ProcessOrbit {...orbitProps} />
    </section>
  );
}
