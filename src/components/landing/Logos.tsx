import Reveal from "@/components/landing/Reveal";

const LOGOS = [
  "EDS Manufacturing",
  "IPI Plastics",
  "S&F Electropolishing",
  "3D Dynamics",
];

export default function Logos() {
  return (
    <section className="px-6 pb-24 pt-4 md:px-10">
      <Reveal>
        <div className="mx-auto max-w-[1120px] border-t border-[rgba(28,26,22,0.07)] pt-10">
          <div className="flex flex-col items-center gap-7 md:flex-row md:items-center md:justify-between">
            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-[rgba(28,26,22,0.4)]">
              Trusted on the floor at
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 md:gap-x-14">
              {LOGOS.map((name) => (
                <span
                  key={name}
                  className="whitespace-nowrap text-[15px] font-medium tracking-[0.01em] text-[rgba(28,26,22,0.35)] transition-colors duration-300 hover:text-[rgba(28,26,22,0.7)]"
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
