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

export function YCBadge({ height = 22 }: { height?: number }) {
  return (
    <span className="inline-flex items-center gap-3 text-sm text-ink/75">
      <span className="font-medium">Backed by</span>
      <Image
        src="/yc-wordmark.png"
        alt="Y Combinator"
        width={height * 4}
        height={height}
        style={{ height, width: "auto" }}
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
            <span key={i} className="italic text-accent">
              {word}{" "}
            </span>
          );
        }
        return <span key={i}>{word} </span>;
      })}
    </>
  );
}
