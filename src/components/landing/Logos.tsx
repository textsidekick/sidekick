import Reveal from "@/components/landing/Reveal";

const LOGOS = [
  "EDS Manufacturing",
  "IPI Plastics",
  "S&F Electropolishing",
  "3D Dynamics",
];

export default function Logos() {
  return (
    <section className="px-6 py-16 md:px-10">
      <Reveal>
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-center md:justify-between">
            <div className="text-[12px] font-medium uppercase tracking-[0.14em] text-[rgba(17,24,39,0.35)]">
              Trusted on the floor
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 md:gap-x-16">
              {LOGOS.map((name) => (
                <span
                  key={name}
                  className="whitespace-nowrap text-[15px] font-semibold tracking-[0.01em] text-[rgba(17,24,39,0.25)] transition-colors duration-300 hover:text-[rgba(17,24,39,0.6)]"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
