# Domain Pitfalls

**Domain:** Dashboard — Next.js 15/16 App Router + Tailwind v4 + shadcn/ui + Recharts v3 + next-themes
**Project:** Sidekick Manager Dashboard
**Researched:** 2026-03-13
**Confidence:** HIGH (based on direct inspection of installed package versions, globals.css, layout.tsx, and deep knowledge of each library's known failure modes)

---

## Exact Versions in This Project

| Package | Version | Notes |
|---------|---------|-------|
| next | 16.1.6 | App Router |
| react | 19.2.3 | React 19 |
| tailwindcss | ^4 | CSS-based config — NO tailwind.config.ts |
| recharts | ^3.8.0 | v3 — API differs from v2 |
| next-themes | ^0.4.6 | |
| shadcn | ^4.0.6 | CLI tooling |
| @tailwindcss/postcss | ^4 | PostCSS integration |

---

## Critical Pitfalls

Mistakes that cause rewrites, blank screens, or hard-to-trace runtime errors.

---

### Pitfall 1: Recharts Components Rendered in Server Components

**What goes wrong:** Recharts uses browser-only APIs (`window`, `ResizeObserver`, canvas). If a chart component is not a Client Component, Next.js will throw a runtime error during SSR: `window is not defined` or `ResizeObserver is not defined`. The error manifests at page load, not at build time, making it surprising.

**Why it happens:** Recharts v3 (like v2) does not ship with SSR guards. Any component that imports from `recharts` must be a Client Component. This is a hard requirement, not optional.

**Consequences:** Blank page or full-page crash. If the chart is deep inside a Server Component tree without `'use client'`, the error will implicate the wrong file in the stack trace.

**Prevention:**
- Every file that imports from `recharts` — `BarChart`, `AreaChart`, `ResponsiveContainer`, `XAxis`, `YAxis`, `Tooltip`, `Legend` — MUST begin with `'use client'`.
- This means `QuestionsChart.tsx` must be `'use client'`. Since `AnalyticsTab.tsx` assembles it, `AnalyticsTab.tsx` can be Server or Client, but it must not try to render Recharts directly.
- Do NOT use `dynamic(() => import('./QuestionsChart'), { ssr: false })` unless there is a specific rendering-order reason. Direct `'use client'` is simpler and preferred for this project.

**Detection:** Build succeeds but page throws at runtime. Error: `window is not defined`. Stack trace points into recharts internals.

**At-risk component:** `QuestionsChart.tsx` — the only chart component in this project.

---

### Pitfall 2: Tailwind v4 Dark Mode — `@custom-variant` vs `darkMode` Config

**What goes wrong:** Tailwind v4 eliminates `tailwind.config.ts` and the `darkMode: 'class'` config option. Dark mode must be declared via `@custom-variant` in CSS. This project already has:

```css
@custom-variant dark (&:is(.dark *));
```

The pitfall is writing `dark:` utility classes that work in Tailwind v3 syntax but silently do nothing in v4 if the `@custom-variant` is misconfigured or missing. This produces no build error — the dark classes are simply ignored.

**Why it happens:** Developers familiar with Tailwind v3 expect `darkMode: 'class'` in config. In v4, if `@custom-variant dark` is absent, `dark:` prefixes compile to dead CSS.

**Consequences:** Dark mode appears to work in Storybook or isolated testing but fails in the actual app. Cards render dark text on dark background. The depth system (page background vs card surface) collapses.

**Prevention:**
- `@custom-variant dark (&:is(.dark *));` is already correctly set in `globals.css` — do not remove or move it.
- If globals.css is regenerated (e.g., by running `shadcn init` again), verify this line survives.
- After adding any new component, do a quick dark mode toggle check before marking it done.
- The variant `(&:is(.dark *))` requires the `.dark` class on a **parent element** — `<html>` in this case. This aligns with `attribute="class"` in ThemeProvider. If the attribute were changed to `data-theme`, the variant would need to change to `[data-theme="dark"] &`. Do not change the ThemeProvider attribute.

**Detection:** Component looks fine in light mode, completely broken (invisible text, wrong backgrounds) in dark mode. No console errors.

**At-risk components:** All — but especially `MetricCard`, `TopBar`, and any component with explicit `bg-white` or `text-gray-900` that forgets the `dark:` counterpart.

---

### Pitfall 3: next-themes Hydration Mismatch — The Flash and the Error

**What goes wrong:** Two distinct failures are conflated by developers:
1. **FOUC (Flash of Unstyled Content):** Page briefly renders in light mode before JavaScript loads and applies the dark class. Visible as a white flash.
2. **React hydration mismatch error:** Server renders HTML without the `.dark` class. Client applies `.dark`. React compares the two trees and throws: `Error: Hydration failed because the server-rendered HTML didn't match the client.`

**Why it happens:** The server cannot know the user's theme preference (it's stored in localStorage or a cookie). next-themes resolves this by injecting a blocking inline script into `<head>` that reads localStorage before React hydrates. This prevents the hydration mismatch — but only if `suppressHydrationWarning` is on the `<html>` element.

**Current state of this project:** `layout.tsx` already has `<html lang="en" suppressHydrationWarning>` and `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>`. This is correctly configured. The risk is in future modifications.

**Consequences:**
- Missing `suppressHydrationWarning`: React throws a hydration error on every page load in dark mode. App may partially render or crash.
- Missing `attribute="class"`: ThemeProvider defaults to `data-theme` attribute. The `@custom-variant dark` selector targets `.dark` class, so no dark styles apply at all.

**Prevention:**
- Never remove `suppressHydrationWarning` from `<html>` in `layout.tsx`.
- Never change `attribute="class"` on `ThemeProvider`.
- If a component needs to know the current theme (e.g., to pass a color to Recharts), use `useTheme()` from `next-themes` — but guard with `mounted` state:

```tsx
const { theme, resolvedTheme } = useTheme()
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return null // or a skeleton
```

Without the `mounted` guard, `theme` is `undefined` on first render, causing a secondary hydration mismatch.

**Detection:**
- FOUC: Visible flash on hard reload. Usually only in dark mode preference.
- Hydration mismatch: Console error in development: `Error: Hydration failed...` with a diff showing `class=""` vs `class="dark"`.

**At-risk components:** Any component that reads `useTheme()` directly — e.g., a theme toggle button or a chart that needs to pass `stroke` colors programmatically.

---

### Pitfall 4: Recharts ResponsiveContainer Requires a Parent with Explicit Height

**What goes wrong:** `ResponsiveContainer` reads the dimensions of its parent DOM element. If the parent has `height: auto` or no explicit height, `ResponsiveContainer` renders at 0px height and the chart is invisible — no error, no warning.

**Why it happens:** Recharts relies on `ResizeObserver` to measure the parent. If the parent is flexbox without a defined height, or the parent is `display: contents`, the measurement returns 0.

**Consequences:** Chart renders but is invisible. The chart container takes up space (because of padding/margin), but the actual SVG is 0px tall. Extremely confusing because `QuestionsChart` shows up in the DOM inspector with correct HTML.

**Prevention:**
- Always wrap `ResponsiveContainer` in a div with an explicit height:

```tsx
// Correct
<div className="h-64 w-full">
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>...</BarChart>
  </ResponsiveContainer>
</div>

// Wrong — height: auto, chart will be 0px
<div className="w-full">
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>...</BarChart>
  </ResponsiveContainer>
</div>
```

- Use `height="100%"` on `ResponsiveContainer` (not a fixed pixel value) so it fills whatever the parent div defines. This makes it easy to change chart height by only changing the parent div class.

**Detection:** Chart area is empty. DevTools shows the SVG exists with `height="0"`. `ResponsiveContainer` in DevTools shows `height: 0`.

**At-risk component:** `QuestionsChart.tsx`.

---

### Pitfall 5: shadcn CSS Variables Collision with Custom Depth System Variables

**What goes wrong:** shadcn/ui uses a specific set of CSS variable names (`--card`, `--background`, `--foreground`, `--border`, etc.) that it maps in `globals.css` via the `@theme inline` block. This project ALSO defines custom depth system variables (`--page-bg`, `--card-bg`, `--card-shadow`). The collision risk is using `bg-card` (shadcn's class) when you mean `bg-[var(--card-bg)]` (the custom depth system), or vice versa.

**Specific trap in this project:** The shadcn `--card` variable is mapped to `var(--color-card)` in the Tailwind v4 `@theme inline`. So `bg-card` in Tailwind will use shadcn's card color. The custom `--card-bg` variable used in the CLAUDE.md design system is a separate variable. Both exist, both are valid for dark mode, but they are NOT the same value.

**Why it happens:** The project correctly defined both systems, but a developer writing `bg-card` (shadcn shorthand) gets a different color than `bg-[var(--card-bg)]` (depth system). In light mode they're both white — the bug is invisible. In dark mode, `--card` resolves to `#1a1d27` (also correctly set in the dark block) so they actually agree. The real risk is forgetting to use `shadow-[var(--card-shadow)]` and using `shadow-sm` instead — which uses Tailwind's built-in shadow scale, not the custom shadow values.

**Prevention:**
- Always use `shadow-[var(--card-shadow)]` — never `shadow-sm`, `shadow-md`, `shadow-lg`.
- For card backgrounds: prefer `bg-white dark:bg-[var(--card-bg)]` as specified in CLAUDE.md card anatomy.
- Never use the bare `bg-card` Tailwind class unless you have confirmed it resolves to the same value as `--card-bg` in both modes.
- The card anatomy class string from CLAUDE.md is the single source of truth:
  ```
  rounded-xl border border-gray-200 dark:border-gray-800
  bg-white dark:bg-[var(--card-bg)]
  shadow-[var(--card-shadow)]
  p-5
  ```

**Detection:** Cards look correct in light mode but have wrong shadows or wrong background in dark mode. Shadow appears to use a standard Tailwind shadow (sharper, lighter) instead of the custom depth system shadow.

**At-risk components:** `MetricCard`, `FeedCard`, `AlertMetrics`, any card-shaped component.

---

### Pitfall 6: Tailwind v4 `@theme inline` — Arbitrary Values and CSS Variables

**What goes wrong:** In Tailwind v4, CSS variables are NOT automatically available as utility classes unless they are registered in the `@theme inline` block. The custom variables `--page-bg`, `--card-bg`, `--card-shadow`, `--border-subtle`, `--border-default` are defined in `:root` and `.dark` but are NOT in the `@theme inline` block. This means:

- `bg-page-bg` will NOT work (no such utility class)
- `bg-[var(--page-bg)]` WILL work (arbitrary value)
- `shadow-card-shadow` will NOT work
- `shadow-[var(--card-shadow)]` WILL work

**Why it happens:** This is a Tailwind v4 design decision. Only variables in `@theme inline` get automatic utility class generation.

**Prevention:**
- For the depth system variables, ALWAYS use the arbitrary value bracket syntax:
  - `bg-[var(--page-bg)]` not `bg-page-bg`
  - `shadow-[var(--card-shadow)]` not `shadow-card-shadow`
  - `border-[var(--border-default)]` not `border-border-default`
- This is already the pattern in CLAUDE.md. Follow it exactly.
- Do NOT add depth system variables to `@theme inline` — it would conflict with shadcn's color system.

**Detection:** Class doesn't apply. DevTools shows no matching CSS rule. No error from Tailwind.

**At-risk components:** All card-shaped components, page layout wrapper.

---

### Pitfall 7: React 19 + shadcn/ui Compatibility — `ref` Forwarding Changes

**What goes wrong:** React 19 changes how `ref` works — refs are now passed as a regular prop, not via `forwardRef`. shadcn/ui components (which are built on Radix UI primitives) were written using `React.forwardRef`. In React 19, this still works, but there may be console warnings: `Warning: Function components cannot be given refs`. These are noisy and can obscure real errors.

**Why it happens:** The shadcn CLI (v4.0.6) generates components that use `React.forwardRef`. React 19 deprecated `forwardRef` in favor of accepting `ref` as a direct prop. The generated components may trigger deprecation warnings.

**Consequences:** No functional breakage — the warnings are cosmetic. BUT: they flood the console, making it harder to spot real errors. In a dashboard with multiple shadcn components (Button, Dialog, Table, Tooltip, etc.), this can produce dozens of warnings per render.

**Prevention:**
- If warnings appear, the fix is to update shadcn component files to remove `forwardRef` wrapping and accept `ref` directly. This is a one-time manual fix per component.
- Alternatively, accept the warnings for the demo phase and fix before production handoff.
- Do not suppress all console warnings to mask this — that hides real errors.

**Detection:** Console in dev mode shows `Warning: Function components cannot be given refs` on multiple components. Usually first appears when `Dialog` or `Tooltip` are used.

**At-risk components:** `QRCodeModal.tsx` (uses Dialog), any component using Tooltip.

---

## Moderate Pitfalls

---

### Pitfall 8: Dark Mode Chart Colors — Recharts Tooltip and Axis Don't Respect CSS Variables

**What goes wrong:** Recharts chart elements — `Tooltip`, `XAxis`, `YAxis`, tick labels, legend text — use hardcoded inline styles. They do NOT read Tailwind classes or CSS variables. In dark mode, the default tooltip renders a white box with dark text on a dark page background — which looks terrible or is completely unreadable.

**Prevention:**
- Pass explicit color props to chart elements using the `resolvedTheme` from `useTheme()`:

```tsx
const { resolvedTheme } = useTheme()
const isDark = resolvedTheme === 'dark'

<Tooltip
  contentStyle={{
    backgroundColor: isDark ? '#1a1d27' : '#ffffff',
    border: `1px solid ${isDark ? '#2f3347' : '#e5e7eb'}`,
    borderRadius: '8px',
  }}
  labelStyle={{ color: isDark ? '#ffffff' : '#111827' }}
  itemStyle={{ color: isDark ? '#d1d5db' : '#6b7280' }}
/>
<XAxis tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} />
<YAxis tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} />
```

- Use the `mounted` guard (see Pitfall 3) before rendering these colors. Render a skeleton instead of the chart until mounted.

**Detection:** Chart renders fine in light mode. In dark mode: white tooltip box, white axis tick text invisible against white background, or dark text on dark card.

**At-risk component:** `QuestionsChart.tsx`.

---

### Pitfall 9: `useTheme()` Called Without Mounted Guard — Mismatch on First Render

**What goes wrong:** `useTheme()` returns `{ theme: undefined, resolvedTheme: undefined }` on the first render during SSR/hydration. Any component that reads `theme` or `resolvedTheme` and uses it to conditionally render will produce a hydration mismatch or show the wrong state on first paint.

**Prevention:**
Always use this pattern in any component that reads the theme:

```tsx
const { resolvedTheme } = useTheme()
const [mounted, setMounted] = useState(false)
useEffect(() => { setMounted(true) }, [])

if (!mounted) {
  // Return a skeleton or null, NOT a default value like 'light'
  return <div className="h-8 w-8 rounded animate-pulse bg-gray-200" />
}

// Now resolvedTheme is safe to use
const isDark = resolvedTheme === 'dark'
```

**Detection:** Theme toggle button shows wrong icon on initial load and flips after hydration. Or: console hydration mismatch error referencing the theme-reading component.

**At-risk components:** `TopBar.tsx` (theme toggle button), `QuestionsChart.tsx` (chart colors).

---

### Pitfall 10: Tailwind v4 PostCSS Config — Missing `@tailwindcss/postcss`

**What goes wrong:** Tailwind v4 is NOT a PostCSS plugin in the traditional sense — it uses `@tailwindcss/postcss` as the integration layer, not the old `tailwindcss` PostCSS plugin. If the `postcss.config.mjs` is incorrect, Tailwind classes compile but CSS variables from `@theme inline` are NOT generated.

**Current state:** This is correctly configured in the project (evidenced by `@tailwindcss/postcss: "^4"` in devDependencies). The risk is regenerating this file.

**Prevention:**
- `postcss.config.mjs` must use `@tailwindcss/postcss`:

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

- NOT the old:
```js
// WRONG for Tailwind v4
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Detection:** `@theme inline` color variables don't work. Tailwind utility classes work (because the CSS import compiles), but mapped variables like `bg-primary` or `text-foreground` resolve to nothing.

**At-risk phase:** Initial setup / if postcss.config.mjs is ever regenerated.

---

### Pitfall 11: shadcn `@import "shadcn/tailwind.css"` Must Appear Before Custom Variables

**What goes wrong:** `globals.css` currently has:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@custom-variant dark (&:is(.dark *));
@theme inline { ... }
:root { ... }
.dark { ... }
```

If the import order changes — specifically if the `:root` or `.dark` blocks appear BEFORE `@import "shadcn/tailwind.css"` — shadcn's default variable values will OVERRIDE the project's custom values, because CSS cascade applies later declarations over earlier ones.

**Prevention:**
- Keep the import order exactly as it is. Do not reorder the CSS imports.
- The custom `:root` and `.dark` blocks MUST come after all `@import` statements.
- If a new `@import` is added (unlikely), add it before the `:root` block, not after.

**Detection:** Custom depth system colors disappear. Cards use shadcn's default background colors instead of the custom OKLCH values. Dark mode uses default gray instead of `#0f1117` and `#1a1d27`.

**At-risk phase:** Any modification to `globals.css`.

---

### Pitfall 12: `<form>` Tags Causing Navigation or Submission

**What goes wrong:** CLAUDE.md explicitly forbids `<form>` tags. Using a `<form>` wrapping any button will cause default browser form submission behavior if the button has `type="button"` omitted. In a Next.js App Router context, this can cause a page navigation or a silent no-op that breaks the UX.

**Why it matters:** shadcn's `Button` component renders a `<button>` element. If it's inside a `<form>`, clicking it will trigger form submission unless `type="button"` is explicitly set. This is especially insidious because shadcn's Button component doesn't add `type="button"` by default.

**Prevention:**
- No `<form>` tags anywhere. Use `onClick` handlers.
- If you need to group inputs, use a `<div>` with `role="group"` or just a plain `<div>`.
- All filter controls (AlertsTable segmented control), search fields, and action buttons use `onChange` and `onClick` handlers only.

**Detection:** Clicking a button causes a page reload. URL briefly shows `?` params appended. Network tab shows an unexpected GET or POST request.

**At-risk components:** `AlertsTable.tsx` (filter controls), `UploadZone.tsx`, `WorkersTable.tsx`.

---

### Pitfall 13: `showMockData` Prop Default and TypeScript Strictness

**What goes wrong:** The `showMockData?: boolean` prop pattern defaults to `false`, meaning components render empty states by default. If a component is built but tested with the default prop value, the developer sees only the empty state and assumes the component is broken — then tries to "fix" it by hardcoding mock data or removing the prop pattern.

**Why it matters:** This pattern is deliberately designed for demo mode. Destroying it makes real data swap-in require per-component surgery instead of a single prop change.

**Prevention:**
- Always test both states during development: `showMockData={false}` (empty state) AND `showMockData={true}` (populated state).
- The EmptyState component must be the only thing rendered when `showMockData={false}` and no real data exists.
- Never inline mock data as a fallback — keep it behind the prop.
- TypeScript: the prop MUST be optional (`showMockData?: boolean`) — not required — so parent assemblies don't need to pass it for production use.

**Detection:** Developer sees empty state, doesn't realize `showMockData={true}` is needed, removes the prop pattern.

**At-risk components:** `AlertsTable.tsx`, `DocumentsTable.tsx`, `WorkersTable.tsx`.

---

## Minor Pitfalls

---

### Pitfall 14: Lucide React Icon Size Defaults

**What goes wrong:** Lucide icons default to `size={24}`. The design system uses specific sizes: 24px for icons in empty state containers, 16px for button icons and table cell icons. Forgetting to set `size` results in oversized icons in compact UI contexts.

**Prevention:** Always set `size` explicitly. Never rely on the default. Common values in this project: `size={16}` for inline/button icons, `size={24}` for empty state icons.

---

### Pitfall 15: `dark:invert` on SVG Images

**What goes wrong:** The scaffold's `app/page.tsx` uses `className="dark:invert"` on the Next.js logo SVG. This pattern ONLY works for black-on-white SVGs where inverting the colors produces a white-on-black result. It does NOT work for multicolor SVGs (like integration service logos in `IntegrationsRow.tsx`). Applying `dark:invert` to the Google Drive or Dropbox logos will produce wrong/ugly colors.

**Prevention:** Use integration logo SVGs that have their own dark variants, or use neutral monochrome logos that tolerate inversion. Never apply `dark:invert` to multicolor brand assets.

**At-risk component:** `IntegrationsRow.tsx`.

---

### Pitfall 16: Tab State in `useState` vs URL Routing

**What goes wrong:** Tab state is managed with `useState` in `app/dashboard/page.tsx`. This means navigating away from the dashboard (if any external link is added later) and returning resets the active tab to the default. Additionally, the browser back button won't restore tab state.

**Why it matters for the demo phase:** In a YC/investor demo, the presenter clicking "back" while on the Alerts tab will jump back to Analytics. This is visually jarring and unprofessional.

**Prevention (for demo phase):** Be aware of this limitation. If demo reliability requires stable tab state, add `?tab=alerts` URL param handling before the demo — but CLAUDE.md says this is out of scope. At minimum, make the default tab `Analytics` (or whichever tab opens the strongest first impression) and plan the demo flow to not require browser navigation.

---

### Pitfall 17: `max-w-7xl` Container and Recharts on Wide Monitors

**What goes wrong:** `QuestionsChart` inside its card inside the `max-w-7xl` container will be constrained to ~1280px. `ResponsiveContainer width="100%"` will fill the card correctly. But on ultra-wide monitors (>1440px), the content stops at max-width while the page background extends — this is intentional and correct. The pitfall is a developer overriding `max-w-7xl` to `max-w-full` to "fix" the appearance on their wide monitor, which then causes the chart to stretch awkwardly and upload zones to go unbounded.

**Prevention:** Never change `max-w-7xl` on the page content wrapper. Never remove `max-w-2xl` from single-column upload zones. These are load-bearing design constraints.

---

## Phase-Specific Warnings

| Phase / Component | Likely Pitfall | Mitigation |
|-------------------|---------------|------------|
| `app/layout.tsx` (setup) | Removing `suppressHydrationWarning` when editing | Leave `<html suppressHydrationWarning>` permanently |
| `QuestionsChart.tsx` | Missing `'use client'` → SSR crash | First line of file must be `'use client'` |
| `QuestionsChart.tsx` | No mounted guard for theme colors | Use `useState(false)` + `useEffect` pattern |
| `QuestionsChart.tsx` | Parent div has no explicit height | Wrap in `<div className="h-64 w-full">` |
| `TopBar.tsx` (theme toggle) | `useTheme()` without mounted guard | Show skeleton until `mounted === true` |
| Any card component | Using `shadow-sm` instead of `shadow-[var(--card-shadow)]` | Always use the CLAUDE.md card anatomy string verbatim |
| Any card component | Using `bg-card` (shadcn class) instead of `bg-white dark:bg-[var(--card-bg)]` | Follow CLAUDE.md card anatomy exactly |
| `IntegrationsRow.tsx` | Dark:invert on multicolor logos | Use monochrome or variant-specific logos |
| `AlertsTable.tsx` | Wrapping filters in `<form>` | Use `<div>` + `onClick`/`onChange` handlers only |
| `globals.css` | Reordering CSS imports | Imports must precede `:root` and `.dark` blocks |
| Any table component | Using `any` for row data type | Define row type interface or use `unknown` + narrowing |
| All tabs | Forgot `dark:` counterpart for a color class | Run dark mode toggle check before marking component done |

---

## Sources

This document is based on:
- Direct inspection of the installed package versions (`package.json`)
- Direct inspection of `globals.css` (Tailwind v4 CSS config, OKLCH variables, `@custom-variant dark`)
- Direct inspection of `app/layout.tsx` (ThemeProvider configuration, suppressHydrationWarning)
- CLAUDE.md design system constraints
- Training knowledge of Recharts v2/v3 SSR behavior (HIGH confidence — this is a documented, well-known issue)
- Training knowledge of next-themes hydration patterns (HIGH confidence — the `mounted` guard pattern is the canonical solution from next-themes README)
- Training knowledge of Tailwind v4 `@theme inline` and `@custom-variant` (MEDIUM confidence — v4 is post-training-cutoff but the CSS in globals.css confirms the behavior)
- Training knowledge of React 19 `forwardRef` deprecation (MEDIUM confidence — confirmed by React 19 release notes)
