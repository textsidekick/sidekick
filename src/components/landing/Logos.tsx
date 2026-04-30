const LOGOS = [
  { name: "Halverson Mfg", mono: false },
  { name: "Ironwood Steel", mono: true },
  { name: "Westfield Foods", mono: false },
  { name: "Cascade Plastics", mono: true },
  { name: "Monarch Pallet", mono: false },
  { name: "Riverton Tool", mono: true },
];

export default function Logos() {
  return (
    <section className="px-14 pt-8 pb-16">
      <div className="text-center text-xs uppercase tracking-[0.12em] text-ink/50 mb-8">
        Trusted in manufacturing and industrial floors across North America
      </div>
      <div className="flex items-center justify-between max-w-[1040px] mx-auto gap-6 opacity-90">
        {LOGOS.map((l) => (
          <div
            key={l.name}
            className={
              l.mono
                ? "font-mono text-[22px] text-ink/55 tracking-wide"
                : "font-serif italic text-[22px] text-ink/55 tracking-tight"
            }
          >
            {l.name}
          </div>
        ))}
      </div>
    </section>
  );
}
