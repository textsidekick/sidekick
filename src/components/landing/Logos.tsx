const LOGOS = [
  { name: "EDS Manufacturing", mono: false },
  { name: "IPI Plastics", mono: true },
  { name: "S&F Electropolishing", mono: false },
  { name: "3D Dynamics Manufacturing", mono: true },
];

export default function Logos() {
  return (
    <section className="px-14 pt-8 pb-16">
      <div className="text-center text-xs uppercase tracking-[0.12em] text-ink/50 mb-8">
        Trusted by teams across industries
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
