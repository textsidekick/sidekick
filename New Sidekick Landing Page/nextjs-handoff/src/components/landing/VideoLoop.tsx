"use client";

import { useEffect, useRef } from "react";

/**
 * <video> wrapper that guarantees muted/loop/inline autoplay
 * (React SSR drops the `muted` attribute; this re-asserts it and retries play).
 */
export default function VideoLoop({
  src,
  style,
}: {
  src: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    const tryPlay = () => {
      if (v.paused) v.play().catch(() => {});
    };
    tryPlay();
    const t = setInterval(tryPlay, 1000);
    return () => clearInterval(t);
  }, []);

  return <video ref={ref} autoPlay muted loop playsInline src={src} style={style} />;
}
