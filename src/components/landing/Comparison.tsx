import { Eyebrow } from "@/components/landing/Brand";

const OLD_STEPS = [
  "Open app",
  "Find asset in dropdown",
  "Select category",
  "Set priority",
  "Type description",
  "Submit",
  "Wait for supervisor",
];

export default function Comparison() {
  return (
    <section className="px-14 py-24 border-t border-ink/10">
      <div className="max-w-[1180px] mx-auto">
        <Eyebrow>The difference</Eyebrow>
        <h2
          className="font-serif font-normal mt-5 mb-14 max-w-[720px]"
          style={{ fontSize: 56, lineHeight: 1, letterSpacing: "-0.02em" }}
        >
          20 seconds vs. 5 minutes.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Old way */}
          <div
            className="rounded-[24px] p-8 border border-ink/10"
            style={{ background: "rgba(28,26,22,0.04)" }}
          >
            <div className="text-xs uppercase tracking-widest text-ink/40 font-mono mb-6">
              The old way
            </div>
            <div className="flex flex-col gap-3 mb-8">
              {OLD_STEPS.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold"
                    style={{ background: "rgba(28,26,22,0.08)", color: "rgba(28,26,22,0.4)" }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-[15px] text-ink/60">{step}</span>
                </div>
              ))}
            </div>
            <div
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold"
              style={{ background: "rgba(28,26,22,0.08)", color: "rgba(28,26,22,0.5)" }}
            >
              ⏱ 3–5 minutes
            </div>
          </div>

          {/* Sidekick way */}
          <div
            className="rounded-[24px] p-8 border border-accent/30 relative overflow-hidden"
            style={{ background: "rgba(201,100,66,0.06)" }}
          >
            <div
              className="absolute inset-0 rounded-[24px] pointer-events-none"
              style={{
                background:
                  "radial-gradient(60% 60% at 30% 30%, rgba(201,100,66,0.12), transparent 70%)",
              }}
            />
            <div className="relative">
              <div className="text-xs uppercase tracking-widest text-accent/70 font-mono mb-6">
                With Sidekick
              </div>
              <div className="flex items-center gap-3 mb-8">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold bg-accent text-cream"
                >
                  1
                </div>
                <span
                  className="text-[22px] font-serif font-normal"
                  style={{ color: "#1C1A16" }}
                >
                  Text a photo.
                </span>
              </div>
              <p className="text-[15px] text-ink/65 leading-relaxed mb-8 max-w-[340px]">
                Work order created, technician assigned, parts checked — before the worker puts their phone away.
              </p>
              <div
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white"
                style={{ background: "#C96442" }}
              >
                ⚡ 20 seconds
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
