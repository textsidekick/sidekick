# Phase 2: Shared Components - Research

**Researched:** 2026-03-17
**Domain:** React component design (EmptyState, MetricCard, SectionHeader)
**Confidence:** HIGH

## Summary

Phase 2 builds three shared building-block components that all 5 dashboard tabs depend on: EmptyState, MetricCard, and SectionHeader. These components live in `components/dashboard/shared/` and are pure presentational components with no state management or API calls.

CLAUDE.md is extremely prescriptive about the exact class strings, typography scale, and card anatomy for these components. The research focus is on confirming the technical environment (shadcn base-nova style, Tailwind v4, LucideIcon typing) and identifying implementation details that CLAUDE.md doesn't spell out but the planner needs.

**Primary recommendation:** Build all three as simple functional components with named Props interfaces, using `LucideIcon` type from `lucide-react` for icon props, raw divs with the exact CLAUDE.md card class string (never shadcn `<Card>`), and `'use client'` directive on each file.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUND-04 | Shared EmptyState component renders icon container + title + description + optional action button | EmptyState anatomy fully specified in CLAUDE.md Design System section; icon container is 48x48 rounded-xl bg-gray-100 dark:bg-gray-800 with 24px icon |
| FOUND-05 | Shared MetricCard component renders KPI value + label + icon + optional subtext | Typography scale in CLAUDE.md: value = text-3xl font-bold, label = text-xs font-medium uppercase tracking-wide; card anatomy class string is locked |
| FOUND-06 | Shared SectionHeader component renders card heading + optional action button | Typography: text-base font-semibold text-gray-900 dark:text-white; action button placement is right-aligned |
| DSN-01 | All cards use exact CLAUDE.md card anatomy class string — never shadcn Card | Card class: `rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5` |
| DSN-06 | All icons are from Lucide React — no other icon libraries | Use `LucideIcon` type from `lucide-react` for icon props; lucide-react v0.577.0 installed |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 19.2.3 | Component framework | Project standard |
| lucide-react | 0.577.0 | Icon library (exclusively) | CLAUDE.md mandates Lucide only |
| tailwindcss | 4.2.1 | Styling | Project standard, v4 syntax |
| class-variance-authority | 0.7.1 | Variant-based className composition | Already used by shadcn components |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @/lib/utils (cn) | n/a | Tailwind class merging (clsx + tailwind-merge) | Every className that accepts external overrides |
| shadcn Button | n/a | Action buttons in EmptyState and SectionHeader | Only for buttons, never for card wrappers |

### Not Used in This Phase
| Library | Reason |
|---------|--------|
| shadcn Card (`components/ui/card.tsx`) | CLAUDE.md explicitly bans it for dashboard cards. Use raw `<div>` with exact class string |
| @base-ui/react | No base-ui primitives needed for these three components; they are simple presentational divs |
| recharts | Not relevant to shared components |

## Architecture Patterns

### Project Structure
```
components/dashboard/shared/
  EmptyState.tsx       # Empty state with icon, title, description, optional action
  MetricCard.tsx       # KPI card with value, label, icon, optional subtext
  SectionHeader.tsx    # Card header row with title and optional action button
```

### Pattern 1: Named Props Interface with LucideIcon Type
**What:** Every component exports a named `XProps` interface using the `LucideIcon` type for icon props.
**When to use:** All three components.
**Example:**
```typescript
// Source: CLAUDE.md naming conventions + lucide-react types
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionIcon?: LucideIcon
  onAction?: () => void
}
```

### Pattern 2: Card Anatomy as Constant
**What:** The exact CLAUDE.md card class string should be defined as a reusable constant or applied consistently as documented.
**When to use:** MetricCard wraps its content in a card div. SectionHeader does NOT — it is a header row INSIDE a card, not a card itself.
**Card class string (verbatim from CLAUDE.md):**
```
rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5
```

### Pattern 3: 'use client' Directive
**What:** Every dashboard component file must start with `'use client'`.
**Why:** Components use event handlers (onClick for buttons). Even if a specific component doesn't use hooks, the directive is required by project convention since parent components use hooks.

### Anti-Patterns to Avoid
- **Importing shadcn Card:** The `components/ui/card.tsx` file exists but MUST NOT be imported in `components/dashboard/shared/`. Use raw `<div>` with the exact class string.
- **Using shadow-[var(--card-shadow)]:** Tailwind v4 intercepts shadow utilities and breaks multi-value CSS vars. Must use `[box-shadow:var(--card-shadow)]` (arbitrary CSS property syntax).
- **Inline prop types:** Never `function EmptyState({ icon }: { icon: LucideIcon })`. Always a named interface.
- **Using `any`:** Use `LucideIcon` for icon props, `() => void` for callbacks, `string` for text.
- **Hardcoded hex values in className:** Use Tailwind classes (`text-gray-500`) or CSS variables (`bg-[var(--card-bg)]`).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Buttons | Custom button elements | shadcn `Button` component | Already styled with variants (outline, ghost, default, sm size) |
| Class merging | String concatenation | `cn()` from `@/lib/utils` | Handles Tailwind class conflicts correctly |
| Icon rendering | SVG elements | Lucide React components via `LucideIcon` type | Type-safe, consistent sizing, CLAUDE.md mandated |

## Common Pitfalls

### Pitfall 1: MetricCard Wraps in Card, SectionHeader Does Not
**What goes wrong:** Treating SectionHeader as a standalone card when it is actually a header ROW inside a card built by the parent component.
**Why it happens:** All three are "shared components" so they seem equivalent.
**How to avoid:** MetricCard IS a card (renders its own card div with the full anatomy class). SectionHeader is a flex row (title left, optional action right) that goes INSIDE a card. EmptyState is a centered content block that goes INSIDE a card.
**Warning signs:** SectionHeader rendering with border/shadow means it is incorrectly wrapping itself in a card.

### Pitfall 2: EmptyState Icon Container Specifics
**What goes wrong:** Getting the icon container dimensions wrong.
**Why it happens:** CLAUDE.md specifies exact values that are easy to miss.
**How to avoid:** Icon container: 48x48px (`w-12 h-12`), `rounded-xl bg-gray-100 dark:bg-gray-800`, icon at 24px (`w-6 h-6`). Center the icon within the container using flex.

### Pitfall 3: Typography Scale Mismatch
**What goes wrong:** Using wrong font weights or sizes for labels vs values.
**Why it happens:** Many similar-looking text styles in the typography scale.
**How to avoid:** Reference the exact CLAUDE.md typography table:
- KPI values: `text-3xl font-bold text-gray-900 dark:text-white leading-none`
- Card section labels: `text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide`
- Section headings: `text-base font-semibold text-gray-900 dark:text-white`
- Body/descriptions: `text-sm text-gray-500 dark:text-gray-400 leading-relaxed`

### Pitfall 4: Dark Mode Text Readability
**What goes wrong:** Text invisible or too faint in dark mode.
**Why it happens:** Forgetting dark: variants on text colors.
**How to avoid:** Every text element needs both light and dark mode classes. The CLAUDE.md typography table includes both (e.g., `text-gray-500 dark:text-gray-400`).

### Pitfall 5: shadcn base-nova Button API
**What goes wrong:** Using Radix-style `asChild` prop or assuming Radix-based shadcn patterns.
**Why it happens:** This project uses shadcn base-nova style which is built on `@base-ui/react`, not Radix.
**How to avoid:** The Button component uses `@base-ui/react/button` primitive. It accepts standard props plus `variant` and `size`. Use `render={}` prop (not `asChild`) if you need to change the rendered element. For this phase, standard Button usage with variant/size is sufficient.

## Code Examples

Verified patterns from the existing codebase and CLAUDE.md:

### Card Anatomy (from dashboard/page.tsx, verified working)
```typescript
// Source: app/dashboard/page.tsx line 35
<div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5">
  {/* card content */}
</div>
```

### EmptyState Component Structure
```typescript
// Source: CLAUDE.md Empty States section
'use client'

import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionIcon?: LucideIcon
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionIcon: ActionIcon, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {/* 1. Icon container: 48x48, rounded-xl, gray bg */}
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 mb-3">
        <Icon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
      </div>
      {/* 2. Title: bold, dark */}
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      {/* 3. Description: 1-2 sentences */}
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mt-1">
        {description}
      </p>
      {/* 4. Optional action button */}
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="mt-4">
          {ActionIcon && <ActionIcon className="w-4 h-4 mr-1.5" />}
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
```

### MetricCard Component Structure
```typescript
// Source: CLAUDE.md Typography Scale + Card Anatomy
'use client'

import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  subtext?: string
  // Optional: icon container color variants for different KPI types
  iconClassName?: string
}

export function MetricCard({ label, value, icon: Icon, subtext, iconClassName }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </p>
        <Icon className={iconClassName ?? "w-5 h-5 text-gray-400 dark:text-gray-500"} />
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none mt-2">
        {value}
      </p>
      {subtext && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {subtext}
        </p>
      )}
    </div>
  )
}
```

### SectionHeader Component Structure
```typescript
// Source: CLAUDE.md Typography Scale
'use client'

import type { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| shadcn Card component | Raw div with CLAUDE.md class string | Project decision | Prevents shadcn Card's extra markup and styles from conflicting with depth system |
| shadow-[var()] Tailwind shorthand | [box-shadow:var()] arbitrary property | Tailwind v4 | Multi-value CSS vars break with shadow utility; arbitrary CSS property syntax required |
| Radix-based shadcn (asChild) | base-nova shadcn (render={}) | shadcn v4 base-nova | Project uses @base-ui/react, not Radix. render={} replaces asChild |

## Open Questions

1. **MetricCard icon color variants**
   - What we know: Different tabs use different accent colors for metric card icons (yellow for alerts, red for high priority, green for resolved, blue for total). Screenshots confirm colored icon treatments.
   - What's unclear: Whether to use a predefined variant enum or pass className directly.
   - Recommendation: Accept an optional `iconClassName` prop (string) for flexibility. Each tab decides its own colors. This avoids coupling MetricCard to tab-specific color logic.

2. **SectionHeader action slot**
   - What we know: Different tabs pass different action elements (refresh button, "View all" link, etc.)
   - What's unclear: Whether to accept ReactNode or structured props.
   - Recommendation: Accept `action?: ReactNode` for maximum flexibility. The parent component constructs the button/link.

3. **EmptyState vertical spacing**
   - What we know: CLAUDE.md specifies the four required elements but not exact vertical spacing between them.
   - What's unclear: Exact gap/margin values.
   - Recommendation: Use `py-12` for overall padding, `mb-3` after icon container, `mt-1` after title, `mt-4` before action button. These values match common shadcn empty state patterns.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected (no test config, no test dependencies) |
| Config file | none -- see Wave 0 |
| Quick run command | `npx next build` (type-check + build verification) |
| Full suite command | `npx next build` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-04 | EmptyState renders 4 elements | manual | Visual inspection in browser (both modes) | N/A |
| FOUND-05 | MetricCard renders KPI + label + icon + subtext | manual | Visual inspection in browser (both modes) | N/A |
| FOUND-06 | SectionHeader renders heading + optional action | manual | Visual inspection in browser (both modes) | N/A |
| DSN-01 | Cards use raw div, not shadcn Card | static analysis | `grep -r "from.*components/ui/card" components/dashboard/shared/` should return empty | N/A |
| DSN-06 | All icons from Lucide React only | static analysis | `grep -r "from.*heroicons\|from.*feather" components/dashboard/shared/` should return empty | N/A |

### Sampling Rate
- **Per task commit:** `npx next build` (catches TypeScript errors and import issues)
- **Per wave merge:** `npx next build` + visual inspection in dev server
- **Phase gate:** Build passes + visual verification in both light and dark mode

### Wave 0 Gaps
- No test framework installed (no jest, vitest, or playwright). For this phase, build verification + static analysis is sufficient since components are purely presentational.
- Visual verification requires running `npm run dev` and manually inspecting in browser.

## Sources

### Primary (HIGH confidence)
- CLAUDE.md - Design System section (card anatomy, typography scale, empty states, button rules)
- CLAUDE.md - Component Structure section (file locations, naming conventions)
- CLAUDE.md - Architecture section (no shadcn Card, no any, no form tags)
- app/dashboard/page.tsx - Verified working card class string with [box-shadow:var(--card-shadow)]
- app/globals.css - Depth system CSS variables confirmed present
- components/ui/button.tsx - shadcn base-nova Button API confirmed (variant, size props)
- package.json - Exact versions: lucide-react 0.577.0, react 19.2.3, tailwindcss 4.2.1

### Secondary (MEDIUM confidence)
- lucide-react type exports - LucideIcon type available from main package export

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries installed and verified in package.json
- Architecture: HIGH - CLAUDE.md is extremely prescriptive; Phase 1 verified the patterns work
- Pitfalls: HIGH - key pitfalls (shadow syntax, shadcn Card ban) already discovered and verified in Phase 1

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (stable - no fast-moving dependencies)
