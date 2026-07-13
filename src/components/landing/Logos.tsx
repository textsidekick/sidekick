const CUSTOMERS = ["EDS Manufacturing", "IPI Plastics", "S&F Electropolishing", "3D Dynamics Manufacturing"];
const FACTS = [
  "Workers use plain-language text instead of another app",
  "Managers get structured, timestamped records",
  "Knowledge stays with the operation instead of one person",
];

export default function Logos() {
  return (
    <section className="border-b border-black/8 bg-white" id="product">
      <div className="mx-auto max-w-[1280px] px-5 py-8 md:px-8 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#69727B]">
              Used by manufacturing and industrial teams
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-[18px] font-semibold tracking-[-0.02em] text-[#171A1D] md:text-[21px]">
              {CUSTOMERS.map((name) => (
                <span key={name} className="text-[#2F3942]">{name}</span>
              ))}
            </div>
          </div>

          <div className="grid gap-2 border-t border-black/8 pt-4 lg:border-0 lg:pt-0">
            {FACTS.map((fact) => (
              <div key={fact} className="flex items-start gap-3 text-[14px] text-[#4E5760]">
                <span className="mt-[7px] block h-1.5 w-1.5 rounded-full bg-[#F05A28]" />
                <span>{fact}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
