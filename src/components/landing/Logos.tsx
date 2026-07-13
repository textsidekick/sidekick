const LOGOS = [
  { name: "EDS Manufacturing", mono: false },
  { name: "IPI Plastics", mono: true },
  { name: "S&F Electropolishing", mono: false },
  { name: "3D Dynamics Manufacturing", mono: true },
];

export default function Logos() {
  return (
    <section id="proof" className="px-6 md:px-10 lg:px-14 pt-8 pb-16 scroll-mt-24">
      <div className="text-center text-xs uppercase tracking-[0.12em] text-ink/50 mb-4">
        Trusted by teams across manufacturing and industrial operations
      </div>
      <div className="text-center text-[14px] text-ink/60 mb-8 max-w-[720px] mx-auto">
        Sidekick helps teams capture frontline issues faster, route work clearly, and keep critical know-how from living in one person&apos;s head.
      </div>
      <div className="flex items-center justify-center flex-wrap max-w-[1040px] mx-auto gap-x-8 gap-y-4 opacity-90">
        {LOGOS.map((l) => (
          <div
            key={l.name}
            className={
              l.mono
                ? "font-mono text-[18px] md:text-[22px] text-ink/55 tracking-wide whitespace-nowrap"
                : "font-serif italic text-[18px] md:text-[22px] text-ink/55 tracking-tight whitespace-nowrap"
            }
          >
            {l.name}
          </div>
        ))}
      </div>
    </section>
  );
}
