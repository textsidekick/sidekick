import Image from "next/image";

export function SidekickLogo({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/sidekick-logo.png"
      alt="Sidekick"
      width={size}
      height={size}
      priority
      className="block"
    />
  );
}

export function YCBadge({ height = 32, dark = false }: { height?: number; dark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-[13px] ${
      dark
        ? "border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.6)]"
        : "border-[rgba(17,24,39,0.08)] text-[rgba(17,24,39,0.5)]"
    }`}>
      <span className="font-medium">Backed by</span>
      <Image
        src="/yc-wordmark.png"
        alt="Y Combinator"
        width={height * 4}
        height={height}
        style={{ height, width: "auto", filter: dark ? "brightness(2)" : undefined }}
        className="block"
      />
    </span>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.08em] font-medium text-ink/55">
      <span className="block w-1.5 h-1.5 rounded-full bg-accent" />
      {children}
    </div>
  );
}

/**
 * Italicises and accent-colours any word that contains "sidekick".
 * Used in headlines so we can edit copy without losing the visual treatment.
 */
export function HeadlineWithSidekick({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => {
        const stripped = word.toLowerCase().replace(/[^a-z]/g, "");
        if (stripped === "sidekick") {
          return (
            <span key={i} className="text-accent font-bold">
              {word}{" "}
            </span>
          );
        }
        return <span key={i}>{word} </span>;
      })}
    </>
  );
}
