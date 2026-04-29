export default function Logos() {
  const logos = [
    "HALVERSON MFG",
    "MERIDIAN FOODS",
    "BLUEROCK LOGISTICS",
    "NORTHWIND PACKAGING",
    "CASCADE STEEL",
    "PARK & MAIN HOTELS",
  ];
  return (
    <section className="px-6 py-16 border-y border-ink/8 bg-cream2/60">
      <div className="max-w-[1240px] mx-auto">
        <p className="text-center text-xs uppercase tracking-[0.14em] text-ink/45 font-medium">
          Frontline teams using Sidekick
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-5">
          {logos.map((logo) => (
            <span
              key={logo}
              className="text-[13px] tracking-[0.18em] font-semibold text-ink/35"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
