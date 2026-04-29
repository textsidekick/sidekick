# Phase 1: Foundation Verification - Research

**Researched:** 2026-03-14
**Domain:** Next.js 16 App Router, Tailwind v4 CSS variables, next-themes dark mode
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- `app/page.tsx` redirects to `/dashboard` using Next.js server-side `redirect()` from `next/navigation` — no client-side redirect
- Dashboard lives at `app/dashboard/page.tsx` as locked in CLAUDE.md
- `app/dashboard/page.tsx` is a **pure verification stub** — just enough to confirm the depth system renders
- Page wrapper uses `bg-[var(--page-bg)]` and `min-h-screen`
- One test card div using the exact CLAUDE.md card anatomy class string: `rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] shadow-[var(--card-shadow)] p-5`
- Card contains: "Sidekick Dashboard" heading (section heading typography) + one line of body text to confirm hierarchy renders
- `app/dashboard/page.tsx` uses `'use client'` from the start

### Claude's Discretion
- Exact wording of the body text in the test card
- Whether to center the test card on screen or align top-left
- Whether to add a dark mode theme toggle button for manual verification or rely on system preference

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope. Functional spec details (tab layout, specific component content) are context for Phases 3–8.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUND-01 | Design tokens and CSS variables are defined in globals.css — depth system (--page-bg, --card-bg, --card-shadow), dark mode tokens, and shadcn primary color override to blue *(already complete in workflow 00)* | CSS variables confirmed present in globals.css; depth system vars verified for both :root and .dark scopes; research confirms the bg-[var(--page-bg)] Tailwind v4 syntax is the correct consumption pattern |
</phase_requirements>

---

## Summary

Phase 1 is a confirmation phase, not a construction phase. The hard infrastructure work (CSS variables, ThemeProvider wiring, shadcn installation) was already completed in Workflow 00. What remains is two surgical file edits: replace the default Next.js starter at `app/page.tsx` with a server-side redirect to `/dashboard`, and create `app/dashboard/page.tsx` as a client component stub that proves the depth system renders correctly in browser.

The existing `app/globals.css` already contains all six CSS depth-system variables (`--page-bg`, `--card-bg`, `--card-shadow`, `--card-shadow-hover`, `--border-subtle`, `--border-default`) for both light (`:root`) and dark (`.dark`) contexts. The existing `app/layout.tsx` already has `ThemeProvider` with `attribute="class"` and `suppressHydrationWarning` correctly set. No changes to either file are needed.

The one non-obvious risk in this phase is the `useTheme()` hydration mismatch pattern from next-themes. Because the theme is determined client-side, any component that reads `resolvedTheme` on first render will get `undefined` on the server and the actual theme on the client, causing a hydration mismatch. The dashboard stub does not need to call `useTheme()` at all — the CSS variable approach and Tailwind dark: prefix handle theming purely via class presence on `<html>`, which ThemeProvider manages automatically.

**Primary recommendation:** Two file writes — replace `app/page.tsx` with a server redirect component, create `app/dashboard/page.tsx` as a `'use client'` stub using the exact card anatomy class string and depth-system page background.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 (installed) | App Router, server components, file-based routing | Locked in CLAUDE.md; already installed |
| Tailwind CSS | v4 (installed) | Utility-first styling; `@theme inline` token system | Locked in CLAUDE.md; already installed |
| next-themes | 0.4.6 (installed) | Dark/light mode via class on `<html>` | Already wired in layout.tsx |
| shadcn base-nova | Latest (installed) | UI primitives built on `@base-ui/react` | Already installed; 12 components present |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@base-ui/react` | ^1.3.0 (installed) | Headless primitives underlying shadcn base-nova | Used implicitly through shadcn components — do not import directly |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Server redirect in `app/page.tsx` | Client-side `useRouter().replace('/dashboard')` | Server redirect is zero-JS, no flash, instant — locked decision, no alternative |
| CSS var bg-[var(--page-bg)] | Hardcoded `bg-gray-50` | CSS var automatically switches in dark mode; hardcoded class does not — must use CSS var syntax |

**Installation:** Nothing to install — all dependencies are present in `node_modules`.

---

## Architecture Patterns

### Recommended File Structure (this phase only)

```
app/
├── page.tsx             # REPLACE: server component, calls redirect('/dashboard')
├── dashboard/
│   └── page.tsx         # CREATE: 'use client' stub, depth system verification
├── layout.tsx           # NO CHANGE: ThemeProvider + TooltipProvider already correct
└── globals.css          # NO CHANGE: all depth system vars already defined
```

### Pattern 1: Server-Side Redirect (Root Route)

**What:** Replace the default Next.js starter page with a pure server component that immediately redirects to `/dashboard`.

**When to use:** When a route exists only as a redirect alias — no need for a client bundle, no need for a loading state.

**Example:**
```typescript
// app/page.tsx
// Source: Next.js App Router docs — redirect() from next/navigation
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/dashboard')
}
```

Key facts:
- `redirect()` from `next/navigation` is for server components — it throws a special Next.js error that the framework catches to send a 307/308 HTTP response
- No `'use client'` directive on this file — it must remain a server component for `redirect()` to work
- No return value needed after `redirect()` — execution stops at that call

### Pattern 2: Dashboard Verification Stub (Client Component)

**What:** Minimal client component that exercises the depth system without importing any dashboard business logic.

**When to use:** When proving infrastructure works before building on top of it.

**Example:**
```typescript
// app/dashboard/page.tsx
'use client'

export default function DashboardPage() {
  return (
    <div
      className="min-h-screen bg-[var(--page-bg)]"
      style={{ backgroundColor: 'var(--page-bg)' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] shadow-[var(--card-shadow)] p-5">
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">
            Sidekick Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Foundation verified — design tokens active.
          </p>
        </div>
      </div>
    </div>
  )
}
```

Note: `bg-[var(--page-bg)]` is the correct Tailwind v4 arbitrary-value syntax for CSS variable references. This works because Tailwind v4 does not require CSS variables to be registered in `@theme inline` for arbitrary-value usage — they are passed through directly.

### Pattern 3: Tailwind v4 CSS Variable Consumption

**What:** How to reference the depth system CSS variables in className strings.

**The rule:**
- For custom CSS variables NOT in Tailwind's `@theme inline`: use arbitrary-value syntax `bg-[var(--page-bg)]`
- For Tailwind-registered colors (e.g., `--color-primary`): use standard utility classes like `bg-primary`
- The depth system vars (`--page-bg`, `--card-bg`, `--card-shadow`) are NOT registered in `@theme inline` — they require the `[var(...)]` syntax

```typescript
// Correct — depth system vars
className="bg-[var(--page-bg)]"
className="shadow-[var(--card-shadow)]"
className="bg-white dark:bg-[var(--card-bg)]"

// Incorrect — these vars don't exist in @theme inline
className="bg-page-bg"         // ❌ class won't resolve
className="shadow-card-shadow" // ❌ class won't resolve
```

### Anti-Patterns to Avoid

- **Server `redirect()` in a client component:** `redirect()` from `next/navigation` only works in server components. In a client component, use `useRouter().push()` instead. This stub must NOT have `'use client'` on `app/page.tsx`.
- **Returning anything after `redirect()`:** TypeScript may flag the unreachable code. The idiomatic pattern is a bare `redirect('/dashboard')` call with no return statement.
- **Using `shadow-lg` or `shadow-xl` on the test card:** CLAUDE.md mandates `shadow-[var(--card-shadow)]` — the arbitrary value shadow syntax. Even in this stub, the pattern must be established correctly.
- **Reading `useTheme()` in the verification stub:** Not needed — the `.dark` class on `<html>` drives all dark: prefix utilities automatically. Calling `useTheme()` without a `mounted` guard causes hydration mismatch.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark mode class toggling | Custom theme state + `document.documentElement.classList.toggle('dark')` | `next-themes` `ThemeProvider` (already installed) | next-themes handles SSR hydration mismatch, system preference detection, localStorage persistence — already wired in `app/layout.tsx` |
| Route redirect | `<meta http-equiv="refresh">` or JS redirect | Next.js `redirect()` from `next/navigation` | Server-side, zero JS, respects RSC execution model |

---

## Common Pitfalls

### Pitfall 1: `redirect()` Called in a Client Component
**What goes wrong:** The function throws at runtime with a confusing error, or TypeScript complains that it's undefined.
**Why it happens:** `redirect()` from `next/navigation` is a server-only function — it has no client-side implementation.
**How to avoid:** `app/page.tsx` must have NO `'use client'` directive. It stays a server component.
**Warning signs:** TypeScript error "redirect is not a function" or runtime error in browser console.

### Pitfall 2: CSS Variable Depth Class Not Rendering
**What goes wrong:** Page background appears white (or default browser background) instead of `#f9fafb`, and the card shows no visual depth separation.
**Why it happens:** `bg-page-bg` is not a valid Tailwind class — the CSS variable is not registered in `@theme inline`. The correct syntax is `bg-[var(--page-bg)]`.
**How to avoid:** Always use the bracket-var syntax for depth system variables. Verify in browser DevTools that the computed background-color matches `#f9fafb` (light) or `#0f1117` (dark).
**Warning signs:** Page appears identical to a plain white page; card has no visible lift.

### Pitfall 3: Hydration Mismatch from Theme Reading
**What goes wrong:** React hydration error in console: "Hydration failed because the initial UI does not match what was rendered on the server."
**Why it happens:** Server renders without knowing the user's theme; client re-renders with `.dark` class active; any component that conditionally renders based on `resolvedTheme` causes a mismatch.
**How to avoid:** This stub does NOT call `useTheme()` at all. Dark mode styling uses only Tailwind `dark:` prefixed classes, which apply when `.dark` is on `<html>`. ThemeProvider handles this automatically.
**Warning signs:** Console error mentioning "hydration" or "server HTML"; flash of unstyled content on load.

### Pitfall 4: `app/dashboard/` Route Not Created Correctly
**What goes wrong:** Navigating to `/dashboard` returns a 404.
**Why it happens:** Next.js App Router requires the route to be at `app/dashboard/page.tsx` (not `app/dashboard.tsx` — that would also work, but the directory form is the standard and is what CLAUDE.md specifies).
**How to avoid:** Create the file at `app/dashboard/page.tsx` (directory + page.tsx pattern).
**Warning signs:** 404 page at `/dashboard` after starting `next dev`.

---

## Code Examples

Verified patterns from the project's own globals.css and layout.tsx:

### Exact Card Anatomy Class String (from CLAUDE.md)
```typescript
// This exact string is the locked card pattern — use it verbatim
className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] shadow-[var(--card-shadow)] p-5"
```

### Typography Scale — Used in Verification Stub
```typescript
// Section / card heading (from CLAUDE.md typography scale)
className="text-base font-semibold text-gray-900 dark:text-white"

// Body text / description (from CLAUDE.md typography scale)
className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed"
```

### Page Background Wrapper Pattern
```typescript
// Page-level wrapper — always min-h-screen + depth system background
className="min-h-screen bg-[var(--page-bg)]"
```

### Dark Mode Custom Variant (from globals.css)
```css
/* Already in globals.css — explains why 'dark:' prefix works */
@custom-variant dark (&:is(.dark *));
```
This means any element inside `.dark` ancestor matches the `dark:` variant. ThemeProvider puts `.dark` on `<html>`, so all elements in the document tree get dark mode.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.ts` for token definition | `@theme inline` in `globals.css` | Tailwind v4 | No config file needed — already reflected in project |
| Radix UI primitives under shadcn | `@base-ui/react` primitives (base-nova style) | shadcn base-nova style | `render={}` prop replaces `asChild` — affects Phase 3+ when composing shadcn components |
| CSS modules / styled-components for dark mode | `next-themes` + Tailwind `dark:` class strategy | Established pattern | Already wired; no migration needed |

**Deprecated/outdated:**
- `next/router` (Pages Router): All routing uses App Router `next/navigation`. `redirect()`, `useRouter()`, `usePathname()` all from `next/navigation`.

---

## Open Questions

1. **Dark mode toggle in verification stub**
   - What we know: `useTheme()` from `next-themes` provides `setTheme()` to toggle; needs `mounted` guard
   - What's unclear: CONTEXT.md leaves it to Claude's discretion — a toggle button aids manual verification but adds a dependency on `useTheme()` and `mounted` guard pattern
   - Recommendation: Include a minimal toggle button using `useTheme()` with proper `mounted` guard — it proves next-themes is working correctly, which is part of the phase's success criteria (dark mode toggles correctly), and the `mounted` pattern is needed in Phase 3 anyway

2. **Test card centering vs top-left**
   - What we know: CONTEXT.md leaves placement to Claude's discretion
   - What's unclear: Centered gives cleaner visual verification; top-left mirrors real dashboard alignment (max-w-7xl mx-auto px-6 py-6)
   - Recommendation: Use `max-w-7xl mx-auto px-6 py-6` page padding (matches CLAUDE.md spacing spec) and a single card top-left within that container — this establishes the real layout pattern the planner will reuse in Phase 3

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no test runner installed |
| Config file | None — Wave 0 must create |
| Quick run command | N/A — see Wave 0 Gaps |
| Full suite command | N/A — see Wave 0 Gaps |

**Note:** `nyquist_validation` is `true` in `.planning/config.json`. However, Phase 1 is a two-file write of static markup — no logic branches, no state, no event handlers. The meaningful validation for this phase is manual browser inspection (does the page render at `/dashboard`? does the background match `#f9fafb`? does dark mode toggle apply `#0f1117`?). Automated test infrastructure is a Wave 0 setup concern for future phases, not Phase 1.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-01 | CSS variables defined in globals.css, depth system vars present, `app/dashboard/page.tsx` renders with correct backgrounds | manual-only | N/A — visual inspection in browser DevTools | N/A |

**Why manual-only:** FOUND-01 is verified by: (a) `next dev` starts without error, (b) browser shows `/dashboard` at path, (c) DevTools computed styles confirm `--page-bg: #f9fafb` in light mode and `--page-bg: #0f1117` in dark mode, (d) the card div shows visual depth separation from the page background. No test runner can substitute for this visual rendering check in a CSS-variable-based design system.

### Sampling Rate
- **Per task commit:** Manual: `npm run dev` and verify `/dashboard` renders
- **Per wave merge:** Manual: toggle dark mode, verify both states
- **Phase gate:** Both `app/page.tsx` redirect and `app/dashboard/page.tsx` render correctly before marking phase complete

### Wave 0 Gaps

No test infrastructure setup needed for Phase 1 specifically. When a future phase introduces testable logic (event handlers, state transitions, computed values), Wave 0 test setup for that phase should include:
- `npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom`
- `jest.config.ts` at project root
- `jest.setup.ts` with `@testing-library/jest-dom` import

*(Phase 1 does not require this — file it as context for Phase 2 or 3 planning.)*

---

## Sources

### Primary (HIGH confidence)
- Direct file inspection: `app/globals.css` — confirmed all 6 depth system CSS variables present in both `:root` and `.dark` scopes
- Direct file inspection: `app/layout.tsx` — confirmed `ThemeProvider attribute="class"` and `suppressHydrationWarning` correctly set
- Direct file inspection: `package.json` — confirmed Next.js 16.1.6, next-themes 0.4.6, @base-ui/react ^1.3.0, Tailwind v4 installed
- Direct file inspection: `components.json` — confirmed `style: "base-nova"`, uses `@base-ui/react` not Radix UI
- Direct file inspection: `app/page.tsx` — confirmed current file is the default Next.js starter, needs replacement
- Direct file inspection: `components/ui/button.tsx` — confirmed base-nova Button uses `ButtonPrimitive` from `@base-ui/react/button`

### Secondary (MEDIUM confidence)
- Session memory (MEMORY.md): confirms `@custom-variant dark (&:is(.dark *))` is the dark mode mechanism; confirmed by direct globals.css inspection
- CONTEXT.md: locked decisions extracted verbatim from user discussion session

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions confirmed from installed `node_modules` and `package.json`
- Architecture: HIGH — patterns derived from existing files in the project, not from external research
- Pitfalls: HIGH — derived from actual code inspection (current `app/page.tsx` is still the default starter) and from well-understood Next.js/Tailwind v4 gotchas confirmed in project files

**Research date:** 2026-03-14
**Valid until:** Stable — Next.js 16, Tailwind v4, and next-themes 0.4.6 are locked in package.json. No risk of drift unless dependencies are upgraded.
