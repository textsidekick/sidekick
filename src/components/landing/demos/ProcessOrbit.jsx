"use client";

/* ProcessOrbit, scroll-pinned process dial (adapted from Framer component; framer deps removed) */
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const ANGLE_STEP = 20;
const RADIUS_FACTOR = 0.78;
const DOT_X = 0.3;
const CONTENT_GAP = 48;
const INNER_GAP = 56;
const CONTENT_MAX = 460;
const EASE = 0.1;
const NUM_INSET = 1.5;
const TILT_DAMP = 0.5;
const SNAP_THRESHOLD = 0.34;

function smoothstep(e0, e1, x) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

function buildArcRange(cx, cy, R, d0, d1) {
  let d = "";
  let first = true;
  for (let deg = d0; deg <= d1 + 0.001; deg += 2) {
    const a = (deg * Math.PI) / 180;
    const x = (cx + R * Math.cos(a)).toFixed(1);
    const y = (cy + R * Math.sin(a)).toFixed(1);
    d += (first ? "M" : "L") + x + " " + y + " ";
    first = false;
  }
  return d;
}

function buildTicks(cx, cy, R, compact, d0, d1) {
  const minL = compact ? 1.5 : 2;
  const medL = compact ? 4 : 6;
  const majL = compact ? 8 : 12;
  let d = "";
  for (let deg = d0; deg <= d1 + 0.001; deg += 0.5) {
    const m10 = Math.abs(deg % 10) < 0.001;
    const m5 = Math.abs(deg % 5) < 0.001;
    const len = m10 ? majL : m5 ? medL : minL;
    const a = (deg * Math.PI) / 180;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const x0 = (cx + R * ca).toFixed(1);
    const y0 = (cy + R * sa).toFixed(1);
    const x1 = (cx + (R + len) * ca).toFixed(1);
    const y1 = (cy + (R + len) * sa).toFixed(1);
    d += `M${x0} ${y0}L${x1} ${y1} `;
  }
  return d;
}

function buildBrackets(cx, cy, R) {
  let d = "";
  for (const ad of [-10, 10]) {
    const a = (ad * Math.PI) / 180;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const inX = cx + R * ca;
    const inY = cy + R * sa;
    const outX = cx + (R + 16) * ca;
    const outY = cy + (R + 16) * sa;
    const sign = ad < 0 ? 1 : -1;
    const capX = outX + sign * 9 * -sa;
    const capY = outY + sign * 9 * ca;
    d += `M${inX.toFixed(1)} ${inY.toFixed(1)}L${outX.toFixed(1)} ${outY.toFixed(1)}L${capX.toFixed(1)} ${capY.toFixed(1)} `;
  }
  return d;
}

const LABEL_ANGLES = [-125, -100, -75, -50, -25, 25, 50, 75, 100, 125];

const REVEAL_DUR = 760;
const REVEAL_STAGGER = 90;
const REVEAL_EASE_CSS = "cubic-bezier(0.08,0.78,0.56,1)";
const REVEAL_TRANSITION = `transform ${REVEAL_DUR}ms ${REVEAL_EASE_CSS}, opacity ${REVEAL_DUR}ms ${REVEAL_EASE_CSS}`;

function tint(hex, a) {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex || "").trim());
  if (!m) return `rgba(17,19,21,${a})`;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function splitIntoLines(el) {
  const text = (el.getAttribute("data-text") || el.textContent || "").trim();
  el.setAttribute("data-text", text);
  if (!text) {
    el.textContent = "";
    return [];
  }
  const words = text.split(/\s+/);
  el.textContent = "";
  const probes = [];
  words.forEach((w, idx) => {
    if (idx > 0) el.appendChild(document.createTextNode(" "));
    const s = document.createElement("span");
    s.textContent = w;
    el.appendChild(s);
    probes.push(s);
  });
  const lines = [];
  let top = null;
  for (const s of probes) {
    const t = s.offsetTop;
    if (top === null || Math.abs(t - top) > 1) {
      lines.push([]);
      top = t;
    }
    lines[lines.length - 1].push(s.textContent || "");
  }
  el.textContent = "";
  const inners = [];
  for (const ln of lines) {
    const mask = document.createElement("span");
    mask.style.display = "block";
    mask.style.overflow = "hidden";
    const inner = document.createElement("span");
    inner.style.display = "block";
    inner.style.willChange = "transform";
    inner.style.transform = "translateY(110%)";
    inner.textContent = ln.join(" ");
    mask.appendChild(inner);
    el.appendChild(mask);
    inners.push(inner);
  }
  return inners;
}

function CornerMarks({ color }) {
  const leg = 14;
  const inset = 28;
  const base = { position: "absolute", width: leg, height: leg, pointerEvents: "none" };
  return (
    <div aria-hidden="true">
      <div style={{ ...base, top: inset, left: inset, borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <div style={{ ...base, top: inset, right: inset, borderTop: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
      <div style={{ ...base, bottom: inset, left: inset, borderBottom: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <div style={{ ...base, bottom: inset, right: inset, borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
    </div>
  );
}

const DEFAULTS = {
  steps: [
    { number: "01", title: "Discovery", description: "Mapping the problem space and constraints" },
    { number: "02", title: "Strategy", description: "Shaping direction before a pixel is drawn" },
    { number: "03", title: "Design", description: "Form, rhythm and the system behind it" }
  ],
  background: "#f4f4f3",
  imageZoom: 1.08,
  imageOverlay: "rgba(0,0,0,0)",
  colors: {
    ink: "#111315",
    ghost: "rgba(17,19,21,0.16)",
    muted: "rgba(17,19,21,0.45)",
    guide: "rgba(17,19,21,0.14)"
  },
  numberFont: { fontFamily: "Inter", fontWeight: 600, fontSize: 60, letterSpacing: "-0.01em", lineHeight: "1" },
  titleFont: { fontFamily: "Inter", fontWeight: 500, fontSize: 46, letterSpacing: "-0.015em", lineHeight: "1" },
  descFont: { fontFamily: "Inter", fontWeight: 400, fontSize: 13, letterSpacing: "0.01em", lineHeight: "1.4" },
  monoFont: { fontFamily: "Space Mono", fontWeight: 400, fontSize: 12, letterSpacing: "0.1em", lineHeight: "1" },
  wheelNumberSize: 54,
  showGuide: true,
  showMarks: true,
  snap: true,
  stepLength: 100
};

function ProcessOrbit(rawProps) {
  const props = Object.assign({}, DEFAULTS, rawProps);
  props.colors = Object.assign({}, DEFAULTS.colors, rawProps && rawProps.colors);
  const {
    steps, background, backgroundImage, imageZoom, imageOverlay, colors,
    numberFont, titleFont, descFont, monoFont, wheelNumberSize,
    showGuide, showMarks, snap, stepLength, style
  } = props;

  const [compact, setCompact] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  const uidRef = useRef("po" + Math.random().toString(36).slice(2, 9));
  const uid = uidRef.current;

  const outerRef = useRef(null);
  const panelRef = useRef(null);
  const dotRef = useRef(null);
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const ticksRef = useRef(null);
  const ticksActiveRef = useRef(null);
  const bracketsRef = useRef(null);
  const dialGroupRef = useRef(null);
  const bgImgRef = useRef(null);
  const labelRefs = useRef([]);
  const pathFillRef = useRef(null);
  const wheelRefs = useRef([]);
  const stageRefs = useRef([]);
  const metaRefs = useRef([]);
  const titleRefs = useRef([]);
  const descRefs = useRef([]);
  const revealRef = useRef([]);
  const focusRef = useRef(-1);
  const reelMaskRef = useRef(null);
  const reelColRef = useRef(null);
  const textWrapRef = useRef(null);

  const N = steps.length;
  const stepsKey = steps.map((s) => `${s.title}\u0001${s.description}`).join("\u0002");
  const runwayVh = compact ? Math.max(84, Math.max(1, N - 1) * 10 + 58) : Math.max(1, N - 1) * stepLength + 100;
  const panelHeight = compact ? "52svh" : "100svh";

  const numSizeRaw = typeof numberFont.fontSize === "number" ? numberFont.fontSize : parseFloat(String(numberFont.fontSize)) || 60;
  const titleSizeRaw = typeof titleFont.fontSize === "number" ? titleFont.fontSize : parseFloat(String(titleFont.fontSize)) || 46;

  const MOBILE_FS = 0.6;
  const numSizeMobile = +(numSizeRaw * MOBILE_FS).toFixed(2);
  const titleSizeMobile = +(titleSizeRaw * MOBILE_FS).toFixed(2);
  const numberFontRest = Object.assign({}, numberFont);
  delete numberFontRest.fontSize;
  const titleFontRest = Object.assign({}, titleFont);
  delete titleFontRest.fontSize;

  const FS = compact ? 0.6 : 1;
  const numSize = numSizeRaw * FS;
  const titleSize = titleSizeRaw * FS;
  const ghostSize = wheelNumberSize * (compact ? 0.55 : 1);
  const DOTX = compact ? 0.12 : DOT_X;
  const GAP = compact ? 24 : CONTENT_GAP;

  const SLOT = numSize * 2.2;
  const REEL_W = numSize * 2.0;
  const REEL_MASK = "linear-gradient(to bottom, transparent 0%, #000 16%, #000 84%, transparent 100%)";

  const pillStyle = Object.assign({}, monoFont, {
    display: "inline-flex",
    alignItems: "center",
    background: tint(colors.ink, 0.06),
    color: colors.ink,
    borderRadius: 8,
    padding: "6px 12px",
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums"
  });

  const renderMeta = (i) => (
    <div style={{ marginBottom: 16 }}>
      <span style={pillStyle}>{i + 1} / {N}</span>
    </div>
  );

  useEffect(() => {
    const el = outerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = e.contentRect.width;
        if (w > 0) setCompact(w < 640);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const panel = panelRef.current;
    if (!outer || !panel) return;

    const angleRad = (ANGLE_STEP * Math.PI) / 180;
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cx = 0, cy = 0, R = 0, dotX = 0;
    let active = 0;
    let raf = 0;

    function setStageHidden(i) {
      const r = revealRef.current[i];
      if (!r) return;
      if (r.meta) {
        r.meta.style.transitionDelay = "0ms";
        r.meta.style.transform = "translateY(14px)";
        r.meta.style.opacity = "0";
      }
      for (const ln of r.lines) {
        ln.style.transitionDelay = "0ms";
        ln.style.transform = "translateY(110%)";
      }
    }
    function setStageExit(i) {
      const r = revealRef.current[i];
      if (!r) return;
      const els = [r.meta].concat(r.lines).filter(Boolean);
      els.forEach((e) => (e.style.transition = "none"));
      if (r.meta) {
        r.meta.style.transform = "translateY(14px)";
        r.meta.style.opacity = "0";
      }
      for (const ln of r.lines) ln.style.transform = "translateY(110%)";
      void document.body.offsetHeight;
      els.forEach((e) => (e.style.transition = REVEAL_TRANSITION));
    }
    function setStageShown(i, animate) {
      const r = revealRef.current[i];
      if (!r) return;
      const els = [r.meta].concat(r.lines).filter(Boolean);
      if (!animate || reduce) {
        els.forEach((e) => (e.style.transition = "none"));
        if (r.meta) {
          r.meta.style.transform = "translateY(0)";
          r.meta.style.opacity = "1";
        }
        r.lines.forEach((ln) => (ln.style.transform = "translateY(0)"));
        void document.body.offsetHeight;
        els.forEach((e) => (e.style.transition = REVEAL_TRANSITION));
        return;
      }
      els.forEach((e) => (e.style.transition = "none"));
      if (r.meta) {
        r.meta.style.transform = "translateY(14px)";
        r.meta.style.opacity = "0";
      }
      r.lines.forEach((ln) => (ln.style.transform = "translateY(110%)"));
      void document.body.offsetHeight;
      els.forEach((e) => (e.style.transition = REVEAL_TRANSITION));
      if (r.meta) {
        r.meta.style.transitionDelay = "0ms";
        r.meta.style.transform = "translateY(0)";
        r.meta.style.opacity = "1";
      }
      r.lines.forEach((ln, k) => {
        ln.style.transitionDelay = (k + 1) * REVEAL_STAGGER + "ms";
        ln.style.transform = "translateY(0)";
      });
    }

    function progress() {
      const rect = outer.getBoundingClientRect();
      const total = Math.max(1, outer.offsetHeight - panel.clientHeight);
      return Math.max(0, Math.min(1, -rect.top / total));
    }

    function measure() {
      const ph = panel.clientHeight;
      const pw = panel.clientWidth;
      dotX = pw * DOTX;
      const dotY = ph * 0.5;
      R = ph * RADIUS_FACTOR;
      cx = dotX - R;
      cy = dotY;
      if (dotRef.current) {
        dotRef.current.style.left = dotX + "px";
        dotRef.current.style.top = dotY + "px";
      }
      const slotEl = reelColRef.current ? reelColRef.current.firstElementChild : null;
      const slotH = slotEl ? slotEl.offsetHeight : SLOT;
      const slotW = slotEl ? slotEl.offsetWidth : REEL_W;
      const reelW = Math.max(slotW, REEL_W);
      if (reelMaskRef.current) {
        reelMaskRef.current.style.left = dotX + GAP + "px";
        reelMaskRef.current.style.height = slotH + "px";
        reelMaskRef.current.style.width = reelW + "px";
      }
      const textLeft = compact ? dotX + GAP : dotX + GAP + reelW + INNER_GAP;
      if (textWrapRef.current) {
        textWrapRef.current.style.left = textLeft + "px";
      }
      const textW = pw - textLeft - 24;
      for (let i = 0; i < stageRefs.current.length; i++) {
        const st = stageRefs.current[i];
        if (!st) continue;
        st.style.width = (compact ? textW : CONTENT_MAX) + "px";
        st.style.opacity = "1";
        st.style.transform = compact ? `translateY(${(slotH / 2 + 14).toFixed(1)}px)` : "translateY(-50%)";
      }
      for (let i = 0; i < N; i++) {
        const meta = metaRefs.current[i];
        const lines = [];
        const tEl = titleRefs.current[i];
        const dEl = descRefs.current[i];
        if (tEl) lines.push.apply(lines, splitIntoLines(tEl));
        if (dEl) lines.push.apply(lines, splitIntoLines(dEl));
        if (meta) {
          meta.style.transform = "translateY(14px)";
          meta.style.opacity = "0";
          meta.style.willChange = "transform, opacity";
          meta.style.transition = REVEAL_TRANSITION;
        }
        for (const ln of lines) ln.style.transition = REVEAL_TRANSITION;
        revealRef.current[i] = { meta, lines };
      }
      const f0 = Math.max(0, Math.min(N - 1, Math.round(progress() * Math.max(1, N - 1))));
      focusRef.current = f0;
      for (let i = 0; i < N; i++) {
        if (i === f0) setStageShown(i, false);
        else setStageHidden(i);
      }
      if (svgRef.current && pathRef.current) {
        svgRef.current.setAttribute("viewBox", `0 0 ${pw} ${ph}`);
        pathRef.current.setAttribute("d", buildArcRange(cx, cy, R, -180, 180));
        if (ticksRef.current) {
          ticksRef.current.setAttribute("d", buildTicks(cx, cy, R, compact, -180, 180));
        }
        if (bracketsRef.current) {
          bracketsRef.current.setAttribute("d", buildBrackets(cx, cy, R));
        }
      }
      const lr = R + (compact ? 14 : 24);
      LABEL_ANGLES.forEach((deg, i) => {
        const el = labelRefs.current[i];
        if (!el) return;
        el.style.display = compact ? "none" : "";
        const a = (deg * Math.PI) / 180;
        el.setAttribute("x", (cx + lr * Math.cos(a)).toFixed(1));
        el.setAttribute("y", (cy + lr * Math.sin(a)).toFixed(1));
      });
    }

    function tick() {
      const target = progress() * Math.max(1, N - 1);
      active += reduce ? target - active : (target - active) * EASE;

      if (bgImgRef.current) {
        const p = target / Math.max(1, N - 1);
        const z = reduce ? 1 : 1 + (imageZoom - 1) * p;
        bgImgRef.current.style.transform = `scale(${z.toFixed(4)})`;
      }

      for (let i = 0; i < N; i++) {
        const ang = (i - active) * angleRad;
        const deg = (ang * 180) / Math.PI;
        const dist = Math.abs(i - active);
        const w = wheelRefs.current[i];
        if (w) {
          const rNum = R - ghostSize * NUM_INSET;
          const nx = cx + rNum * Math.cos(ang);
          const ny = cy + rNum * Math.sin(ang);
          w.style.transform = `translate(${nx}px,${ny}px) rotate(${deg * TILT_DAMP}deg) translate(-50%,-50%)`;
          const near = smoothstep(0, 0.9, dist);
          const edge = 1 - smoothstep(N * 0.55, N * 0.95, dist);
          w.style.opacity = (near * edge * 0.5).toFixed(3);
        }
      }

      const focus = Math.max(0, Math.min(N - 1, Math.round(active)));
      if (focus !== focusRef.current) {
        if (focusRef.current >= 0) setStageExit(focusRef.current);
        setStageShown(focus, true);
        focusRef.current = focus;
      }

      if (reelColRef.current) {
        const firstSlot = reelColRef.current.firstElementChild;
        const slotH = firstSlot ? firstSlot.offsetHeight : SLOT;
        reelColRef.current.style.transform = `translateY(${(-active * slotH).toFixed(2)}px)`;
      }

      if (dialGroupRef.current) {
        dialGroupRef.current.setAttribute("transform", `rotate(${(-active * ANGLE_STEP).toFixed(3)} ${cx} ${cy})`);
      }
      const lrl = R + (compact ? 14 : 24);
      const upright = (active * ANGLE_STEP).toFixed(2);
      for (let i = 0; i < LABEL_ANGLES.length; i++) {
        const el = labelRefs.current[i];
        if (!el) continue;
        const a = (LABEL_ANGLES[i] * Math.PI) / 180;
        const lx = (cx + lrl * Math.cos(a)).toFixed(1);
        const ly = (cy + lrl * Math.sin(a)).toFixed(1);
        el.setAttribute("transform", `rotate(${upright} ${lx} ${ly})`);
      }
      const travel = Math.min(88, active * ANGLE_STEP);
      if (pathFillRef.current) {
        pathFillRef.current.setAttribute("d", buildArcRange(cx, cy, R, 0, travel));
      }
      if (ticksActiveRef.current) {
        ticksActiveRef.current.setAttribute("d", buildTicks(cx, cy, R, compact, 0, travel));
      }
      raf = requestAnimationFrame(tick);
    }

    let snapTimer;
    let programmatic = false;
    function trySnap() {
      if (!snap || programmatic || N < 2) return;
      const rect = outer.getBoundingClientRect();
      const total = outer.offsetHeight - panel.clientHeight;
      if (total <= 0) return;
      const p = -rect.top / total;
      if (p <= 0 || p >= 1) return;
      const f = p * (N - 1);
      const nearest = Math.round(f);
      if (Math.abs(f - nearest) >= SNAP_THRESHOLD) return;
      const outerTopAbs = window.scrollY + rect.top;
      const targetY = outerTopAbs + (nearest / (N - 1)) * total;
      if (Math.abs(targetY - window.scrollY) < 1) return;
      programmatic = true;
      window.scrollTo({ top: targetY, behavior: reduce ? "auto" : "smooth" });
      window.setTimeout(() => { programmatic = false; }, reduce ? 60 : 700);
    }
    function onScroll() {
      if (!snap || programmatic) return;
      if (snapTimer) clearTimeout(snapTimer);
      snapTimer = setTimeout(trySnap, 140);
    }

    measure();
    active = progress() * Math.max(1, N - 1);
    focusRef.current = Math.max(0, Math.min(N - 1, Math.round(active)));
    const ro = new ResizeObserver(measure);
    ro.observe(panel);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);

    let alive = true;
    const remeasure = () => { if (alive) measure(); };
    const reRaf = requestAnimationFrame(remeasure);
    const t1 = setTimeout(remeasure, 150);
    const t2 = setTimeout(remeasure, 500);
    const fonts = document.fonts;
    if (fonts && fonts.ready) fonts.ready.then(remeasure);
    window.addEventListener("load", remeasure);

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      cancelAnimationFrame(reRaf);
      clearTimeout(t1);
      clearTimeout(t2);
      if (snapTimer) clearTimeout(snapTimer);
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("load", remeasure);
    };
  }, [N, snap, compact, numSize, ghostSize, titleSize, stepsKey, imageZoom]);

  return (
    <div
      ref={outerRef}
      className={uid}
      style={Object.assign({ width: "100%" }, style, {
        position: "relative",
        overflow: "visible",
        background,
        height: `${runwayVh}svh`
      })}
      role="region"
      aria-label="Process steps"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
.${uid} .${uid}-num{font-size:${numSizeRaw}px}
.${uid} .${uid}-title{font-size:${titleSizeRaw}px}
@media (max-width:639px){
.${uid} .${uid}-num{font-size:${numSizeMobile}px}
.${uid} .${uid}-title{font-size:${titleSizeMobile}px}
}`
        }}
      />
      <div
        ref={panelRef}
        style={{ position: "sticky", top: 0, width: "100%", height: panelHeight, overflow: "hidden" }}
      >
        {backgroundImage && backgroundImage.src && (
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
            <img
              ref={bgImgRef}
              src={backgroundImage.src}
              srcSet={backgroundImage.srcSet}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: `${backgroundImage.positionX || "center"} ${backgroundImage.positionY || "center"}`,
                transformOrigin: "center",
                willChange: "transform"
              }}
            />
            {imageOverlay && <div style={{ position: "absolute", inset: 0, background: imageOverlay }} />}
          </div>
        )}
        {showGuide && (
          <svg
            ref={svgRef}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <g ref={dialGroupRef}>
              <path ref={pathRef} d="" fill="none" stroke={colors.guide} strokeWidth={1} />
              <path ref={ticksRef} d="" fill="none" stroke={colors.guide} strokeWidth={1} />
              <path ref={ticksActiveRef} d="" fill="none" stroke={colors.muted} strokeWidth={1} />
              <path ref={pathFillRef} d="" fill="none" stroke={colors.muted} strokeWidth={1.25} strokeLinecap="round" />
              {LABEL_ANGLES.map((deg, i) => (
                <text
                  key={i}
                  ref={(el) => { labelRefs.current[i] = el; }}
                  textAnchor="start"
                  dominantBaseline="central"
                  style={{
                    fontFamily: monoFont.fontFamily,
                    fontWeight: monoFont.fontWeight,
                    fontSize: 11,
                    letterSpacing: monoFont.letterSpacing,
                    fill: colors.muted,
                    opacity: 0.65
                  }}
                >
                  {Math.abs(deg)}°
                </text>
              ))}
            </g>
            <path ref={bracketsRef} d="" fill="none" stroke={colors.muted} strokeWidth={1.25} />
          </svg>
        )}

        {showMarks && <CornerMarks color={colors.guide} />}

        <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {steps.map((s, i) => (
            <div
              key={i}
              ref={(el) => { wheelRefs.current[i] = el; }}
              style={Object.assign({
                position: "absolute",
                top: 0,
                left: 0,
                whiteSpace: "nowrap",
                color: colors.ghost,
                opacity: 0
              }, numberFont, { fontSize: ghostSize, willChange: "transform, opacity" })}
            >
              {s.number}
            </div>
          ))}
        </div>

        <div
          ref={dotRef}
          aria-hidden="true"
          style={{ position: "absolute", width: 9, height: 9, borderRadius: "50%", background: colors.ink, transform: "translate(-50%,-50%)" }}
        />

        <div
          ref={reelMaskRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            transform: "translateY(-50%)",
            height: SLOT,
            width: REEL_W,
            overflow: "hidden",
            pointerEvents: "none",
            WebkitMaskImage: REEL_MASK,
            maskImage: REEL_MASK
          }}
        >
          <div ref={reelColRef} style={{ willChange: "transform" }}>
            {steps.map((s, i) => (
              <div
                key={i}
                className={`${uid}-num`}
                style={Object.assign({ height: "2.2em", display: "flex", alignItems: "center" }, numberFontRest, { color: colors.ink })}
              >
                {s.number}
              </div>
            ))}
          </div>
        </div>

        <div
          ref={textWrapRef}
          aria-hidden="true"
          style={{ position: "absolute", top: 0, left: 0, height: "100%", pointerEvents: "none" }}
        >
          {steps.map((s, i) => (
            <div
              key={i}
              ref={(el) => { stageRefs.current[i] = el; }}
              style={{ position: "absolute", left: 0, top: "50%", whiteSpace: "normal", opacity: 0 }}
            >
              <div ref={(el) => { metaRefs.current[i] = el; }}>{renderMeta(i)}</div>
              <div
                data-text={s.title}
                className={`${uid}-title`}
                ref={(el) => { titleRefs.current[i] = el; }}
                style={Object.assign({}, titleFontRest, { color: colors.ink })}
              />
              <div
                data-text={s.description}
                ref={(el) => { descRefs.current[i] = el; }}
                style={Object.assign({}, descFont, { color: colors.muted, marginTop: 12 })}
              />
            </div>
          ))}
        </div>
      </div>

      <ol style={{ position: "absolute", width: 1, height: 1, margin: -1, padding: 0, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 }}>
        {steps.map((s, i) => (
          <li key={i}>{s.number}, {s.title}: {s.description}</li>
        ))}
      </ol>
    </div>
  );
}

export default ProcessOrbit;
