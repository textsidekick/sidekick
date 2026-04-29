# Technology Stack

**Project:** Sidekick Manager Dashboard
**Researched:** 2026-03-13
**Confidence:** HIGH (all findings verified against actual installed packages and source files)

---

## Critical Discovery: This Is Not Standard shadcn/ui

Before reading anything else, understand this: the scaffold uses `style: "base-nova"` in `components.json`. This is **not** the Radix UI-based shadcn you find in most tutorials. The components wrap `@base-ui/react` (MUI Team's headless library, v1.3.0) instead of Radix UI. The API surface differs significantly from what most shadcn/ui documentation and blog posts describe. Every code example below reflects the actual installed components, not documentation assumptions.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 16.1.6 | App Router, SSR, routing | Already installed; App Router enables server components for layout layer |
| React | 19.2.3 | UI runtime | Already installed; concurrent features available |
| TypeScript | ^5 | Type safety | Required by CLAUDE.md ("no `any`") |

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | ^4 | Utility classes | Already installed; CSS-based config (no `tailwind.config.ts`) |
| @tailwindcss/postcss | ^4 | PostCSS integration | The v4 plugin replaces the old `tailwindcss` PostCSS plugin |
| tailwind-merge | ^3.5.0 | Class deduplication in `cn()` | Prevents conflicting Tailwind classes when composing components |
| clsx | ^2.1.1 | Conditional classes | Used inside `cn()` utility alongside tailwind-merge |
| tw-animate-css | ^1.4.0 | Animation keyframes | Provides `animate-in`, `fade-in-0`, `zoom-in-95` used throughout shadcn components |

### UI Primitives

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| shadcn (base-nova style) | ^4.0.6 | Component generator | Generates components that wrap @base-ui/react primitives |
| @base-ui/react | ^1.3.0 | Headless primitive layer | The actual runtime — what shadcn base-nova wraps instead of Radix UI |
| class-variance-authority | ^0.7.1 | Component variant system | Used in `buttonVariants`, `badgeVariants` for typed variant APIs |

### Dark Mode

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| next-themes | ^0.4.6 | Theme switching | Class-based dark mode toggle with SSR hydration handled |

### Charts

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| recharts | ^3.8.0 | Data visualization | Already installed; uses ResizeObserver for responsive containers |

### Icons

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| lucide-react | ^0.577.0 | Icon set | Already installed; declared in `components.json` as the icon library |

---

## Tailwind v4: What Changed, What It Means for This Project

### CSS-based Configuration (No tailwind.config.ts)

Tailwind v4 moves all configuration into CSS. This project already has this set up correctly.

**The pattern in this project (`app/globals.css`):**
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... maps CSS vars to Tailwind color tokens */
}

:root {
  --background: oklch(0.984 0 0);
  /* ... design token values */
}

.dark {
  --background: oklch(0.108 0.016 268);
  /* ... dark mode overrides */
}
```

**What `@theme inline` does:** Maps CSS custom properties to Tailwind's color/spacing system so you can use `bg-background`, `text-foreground`, etc. in class names. The `inline` keyword means the CSS variables are resolved at use-site rather than generating new variables.

**What `@custom-variant dark (&:is(.dark *))` does:** Defines how the `dark:` modifier works. This ties it to a `.dark` class on an ancestor element (the `<html>` tag), which is what `next-themes` adds when dark mode is active.

**Confidence:** HIGH — read directly from `app/globals.css` in this project.

### oklch() Colors

All design tokens use `oklch()` color format (e.g., `oklch(0.984 0 0)` for near-white). This is intentional for Tailwind v4. Requires modern browsers: Safari 16.4+, Chrome 111+, Firefox 128+. This is acceptable for a manager dashboard (no consumer-facing audience).

**Do not convert oklch values to hex.** The gradient/opacity features of oklch are used by shadcn components (e.g., `ring-foreground/10` creates 10% opacity).

### Arbitrary Value Syntax Change

**v3 (old):** `bg-[--brand-color]`
**v4 (correct):** `bg-(--brand-color)`

The project uses parentheses syntax for CSS variable references. Example from CLAUDE.md:
```html
shadow-[var(--card-shadow)]
bg-[var(--card-bg)]
```
Note: `shadow-[var(...)]` brackets work for arbitrary shadow values. `bg-(--var)` parentheses work for color references. Both syntaxes coexist in v4 for different property types.

### Custom Utilities

Define custom utilities with `@utility` not `@layer utilities`:
```css
/* Correct v4 pattern */
@utility tab-4 {
  tab-size: 4;
}

/* Wrong — do not use this in v4 */
@layer utilities {
  .tab-4 { tab-size: 4; }
}
```

**Confidence:** HIGH — from Tailwind v4 official upgrade guide.

### Hover on Touch Devices

v4 wraps hover in `@media (hover: hover)`. Interactive states like `hover:shadow-[var(--card-shadow-hover)]` will only apply on devices with a real pointer, not on mobile touchscreens. This is the correct behavior for a desktop manager dashboard.

---

## shadcn/ui base-nova: What It Is and How It Differs

### The Underlying Primitive Layer Is @base-ui/react, Not Radix UI

The `components.json` `style: "base-nova"` configuration generates components that import from `@base-ui/react/*` instead of `@radix-ui/react-*`. This is a fundamentally different API.

| Concept | Radix UI (shadcn default) | @base-ui/react (base-nova) |
|---------|--------------------------|---------------------------|
| Dialog trigger | `<DialogTrigger asChild>` | `<DialogTrigger>` (native render prop) |
| Render override | `asChild` prop | `render={}` prop |
| State variants | `data-[state=open]:` | `data-open:` (via custom variant) |
| Positioning | Uses portals + fixed positioning | `Positioner` + `Portal` composition |
| Checkbox state | `data-[state=checked]:` | `data-checked:` |

**The `data-open`, `data-closed`, `data-checked`, etc. variants** are defined in `shadcn/tailwind.css` as `@custom-variant` rules and imported in `globals.css`. They map `[data-state="open"]` and `[data-open]:not([data-open="false"])` to the same variant. Do not remove the `@import "shadcn/tailwind.css"` line — it provides these variants.

**The render prop pattern:**
```tsx
// Correct for base-nova Dialog
<DialogPrimitive.Close
  render={
    <Button variant="ghost" size="icon-sm" />
  }
>
  <XIcon />
</DialogPrimitive.Close>

// Wrong — asChild does not exist in @base-ui/react
<DialogClose asChild>
  <Button />
</DialogClose>
```

**Confidence:** HIGH — read directly from installed component source files.

### "use client" Placement Rules

Based on the actual installed components:

**Components that have `"use client"` at the top (interactive, use hooks):**
- `button.tsx` — uses @base-ui/react ButtonPrimitive
- `dialog.tsx` — animated overlay, event handlers
- `dropdown-menu.tsx` — uses @base-ui Menu with state
- `select.tsx` — uses @base-ui Select with state
- `avatar.tsx` — uses @base-ui Avatar (fallback detection)
- `tooltip.tsx` — uses @base-ui Tooltip (hover state)
- `table.tsx` — uses `React.ComponentProps` (technically could be server, marked client)

**Components without `"use client"` (can be imported from server components):**
- `card.tsx` — pure layout divs, no hooks
- `badge.tsx` — uses `useRender` from @base-ui but no state
- `separator.tsx`, `skeleton.tsx`, `progress.tsx` — static

**The rule for dashboard components:** All components in `components/dashboard/` must have `'use client'` at the top because they use `useState`, `onClick`, and other client-side hooks. This is already established in CLAUDE.md.

**Safe pattern:**
```tsx
// Every file in components/dashboard/
'use client'

import { Card, CardContent } from '@/components/ui/card'
// Card is server-safe but importing it from a client component is fine
```

**Confidence:** HIGH — read from actual installed component files.

### Props Interface Pattern for Dashboard Components

CLAUDE.md mandates named `Props` interfaces, no `any`. The actual shadcn components show two patterns — follow the first:

```tsx
// Pattern 1: Named interface (REQUIRED by CLAUDE.md)
interface MetricCardProps {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  subtext?: string
  trend?: 'up' | 'down' | 'neutral'
}

export function MetricCard({ label, value, icon: Icon, subtext, trend }: MetricCardProps) {
  // ...
}

// Pattern 2: Inline ComponentProps extension (used in shadcn source, OK for ui/ layer)
function Card({ className, size = "default", ...props }: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  // ...
}
```

For `components/dashboard/`, always use Pattern 1 (named interface).

**Typing Lucide icons without `any`:**
```tsx
// Correct — use the LucideIcon type
import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  icon: LucideIcon
}

// Usage
function MetricCard({ icon: Icon }: MetricCardProps) {
  return <Icon className="size-5 text-blue-600" />
}
```

**Confidence:** HIGH — from CLAUDE.md constraints and lucide-react type exports.

---

## next-themes: Dark Mode Setup

### Current Setup (Already Correct)

```tsx
// app/layout.tsx — already configured correctly
<html lang="en" suppressHydrationWarning>
  <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </ThemeProvider>
  </body>
</html>
```

### Why suppressHydrationWarning Is Required

`next-themes` reads the stored theme preference from localStorage on the client side. During SSR, Next.js renders with the default theme. When the client hydrates, it may switch to a different theme (the stored preference). Without `suppressHydrationWarning` on `<html>`, React throws a hydration mismatch error because the server-rendered HTML has no `class="dark"` but the client adds it. This prop tells React to ignore the mismatch on this specific element.

**Do not remove `suppressHydrationWarning` from `<html>`.**

### Theme Toggle Component Pattern

```tsx
'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

**Confidence:** HIGH — from actual layout.tsx and next-themes 0.4.6 docs pattern.

### Dark Mode Tailwind Classes

The `@custom-variant dark (&:is(.dark *))` in globals.css means `dark:` classes respond to `.dark` class on any ancestor element. The standard pattern for this project:

```tsx
// Correct — dark: classes work because .dark is on <html>
<div className="bg-white dark:bg-[var(--card-bg)]">
<p className="text-gray-900 dark:text-white">
<div className="border-gray-200 dark:border-gray-800">
```

**Always pair light and dark variants.** CLAUDE.md states a component is not done until it works in dark mode.

---

## Recharts: SSR Gotchas and Patterns

### The ResponsiveContainer Hydration Problem

`ResponsiveContainer` uses the `ResizeObserver` API to measure its parent container. This API is browser-only — it does not exist on the server. In Next.js App Router, if a chart component renders on the server, `ResponsiveContainer` will fail or render with incorrect dimensions.

**Solution:** All chart components must be client components (`'use client'`) with a defined height on the parent container.

```tsx
'use client'

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

interface QuestionsChartProps {
  data: Array<{ date: string; questions: number }>
  timeRange: '7d' | '30d' | '90d'
}

export function QuestionsChart({ data, timeRange }: QuestionsChartProps) {
  return (
    {/* Parent MUST have an explicit height — not just min-height */}
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="questions"
            stroke="var(--color-primary)"
            fill="var(--color-primary)"
            fillOpacity={0.1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
```

**Why `h-[240px]` not `min-h-[240px]`:** `ResponsiveContainer` with `height="100%"` reads the parent's computed height. `min-height` does not set a computed height — `height` does. Without an explicit height, `ResponsiveContainer` renders at 0px tall.

**Confidence:** HIGH — from recharts v3.8.0 `ResponsiveContainer.d.ts` which documents ResizeObserver dependency, and from known App Router SSR behavior.

### Recharts + Tailwind CSS Variables

Recharts accepts `stroke`, `fill`, and other SVG properties as strings. CSS variables work:

```tsx
// Pass CSS variables as stroke/fill values
<Area stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.1} />
<CartesianGrid stroke="var(--border-subtle)" />
```

However, Tailwind classes do NOT work on SVG props — they are not HTML attributes:

```tsx
// Wrong — className does not apply to recharts data props
<Area stroke={undefined} className="stroke-blue-600" />

// Correct — use direct SVG attributes or CSS variables
<Area stroke="#2563eb" />
<Area stroke="var(--color-primary)" />
```

**Confidence:** HIGH — recharts renders SVG elements that use SVG attributes, not CSS classes.

### TypeScript Types for Recharts

Recharts v3.8.0 exports types. Use them instead of `any`:

```tsx
import type { TooltipProps } from 'recharts'
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'

interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  // additional props
}
```

**Confidence:** MEDIUM — from recharts `types/index.d.ts` exports. Custom tooltip typing can be finicky; verify at implementation time.

---

## Card Anatomy: shadcn Card vs Custom Card

The installed `Card` component from shadcn base-nova has specific defaults that conflict with the design system in CLAUDE.md:

**Installed Card defaults:**
```
rounded-xl bg-card py-4 text-sm text-card-foreground ring-1 ring-foreground/10
```

**CLAUDE.md card spec:**
```
rounded-xl border border-gray-200 dark:border-gray-800
bg-white dark:bg-[var(--card-bg)]
shadow-[var(--card-shadow)]
p-5
```

**Resolution:** Do not use `<Card>` from `components/ui/card.tsx` for dashboard content cards. The shadcn Card uses `ring-1 ring-foreground/10` (a ring, not a border) and `py-4` padding (not uniform `p-5`). Instead, build dashboard cards as raw `<div>` elements with the CLAUDE.md class string. Reserve the shadcn `Card` for any future uses where its API surface is needed.

```tsx
{/* Correct — matches CLAUDE.md card anatomy exactly */}
<div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] shadow-[var(--card-shadow)] p-5">
  {/* content */}
</div>

{/* Wrong — uses shadcn Card which has ring-1, wrong padding, py-4 */}
<Card>
  <CardContent>
    {/* content */}
  </CardContent>
</Card>
```

**Confidence:** HIGH — read directly from `components/ui/card.tsx` and CLAUDE.md.

---

## Supporting Libraries

### @base-ui/react Patterns That Appear in Dashboard Components

The `@base-ui/react` `render` prop is used when you need a semantic element override. This appears in dialogs and may appear in future components:

```tsx
// Providing a custom render element via render prop
<DialogPrimitive.Close
  render={<Button variant="ghost" size="icon-sm" />}
>
  <XIcon />
  <span className="sr-only">Close</span>
</DialogPrimitive.Close>
```

This is different from Radix's `asChild`. The `render` prop receives the primitive's props (like `onClick`, `aria-label`) and merges them onto the provided element.

### class-variance-authority (CVA) Usage

Used in `buttonVariants` and `badgeVariants`. If adding new variant-based components in `components/dashboard/`, follow this pattern:

```tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      severity: {
        critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      },
    },
    defaultVariants: {
      severity: 'info',
    },
  }
)

interface AlertBadgeProps extends VariantProps<typeof alertBadgeVariants> {
  className?: string
  children: React.ReactNode
}
```

---

## Installation (Already Complete)

All packages are installed. For reference:

```bash
# Already in dependencies
next@16.1.6, react@19.2.3, tailwindcss@^4, @base-ui/react@^1.3.0
recharts@^3.8.0, next-themes@^0.4.6, lucide-react@^0.577.0
class-variance-authority@^0.7.1, clsx@^2.1.1, tailwind-merge@^3.5.0

# Adding new shadcn components
npx shadcn add [component-name]
```

---

## Alternatives Considered

| Category | In Use | Alternative | Why Not |
|----------|--------|-------------|---------|
| Primitives | @base-ui/react (via shadcn base-nova) | Radix UI (shadcn default) | Already installed as base-nova; switching would require regenerating all components |
| Charts | Recharts 3.8 | Tremor, Victory, Nivo | Recharts already installed; good TypeScript support; sufficient for bar/area charts needed |
| Dark mode | next-themes | Custom context | next-themes handles hydration edge cases correctly; simpler than rolling custom |
| Styling | Tailwind v4 | v3 | Already installed; v4 CSS-first config is cleaner; can't downgrade without scaffold rebuild |
| Animations | tw-animate-css | Framer Motion | tw-animate-css already installed; CSS-only animations adequate for this dashboard |

---

## Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| Tailwind v4 config | HIGH | Read `globals.css`, `postcss.config.mjs`, Tailwind v4 upgrade guide |
| shadcn base-nova / @base-ui/react | HIGH | Read all 12 component source files; read `components.json` |
| next-themes setup | HIGH | Read `layout.tsx`; ThemeProvider correctly configured |
| Recharts SSR behavior | HIGH | Read `ResponsiveContainer.d.ts`; documents ResizeObserver dependency |
| Card implementation strategy | HIGH | Read `components/ui/card.tsx` vs CLAUDE.md spec — conflict confirmed |
| Recharts TypeScript types | MEDIUM | Exports verified; complex type usage needs runtime validation |

---

## Sources

- `/Users/arnavsinghal/DashboardSidekick/sidekick-dashboard/app/globals.css` — Actual Tailwind v4 CSS config
- `/Users/arnavsinghal/DashboardSidekick/sidekick-dashboard/components.json` — Confirms `style: "base-nova"`
- `/Users/arnavsinghal/DashboardSidekick/sidekick-dashboard/components/ui/*.tsx` — All 12 installed shadcn components
- `/Users/arnavsinghal/DashboardSidekick/sidekick-dashboard/app/layout.tsx` — ThemeProvider setup
- `/Users/arnavsinghal/DashboardSidekick/sidekick-dashboard/node_modules/recharts/types/component/ResponsiveContainer.d.ts` — ResizeObserver documentation
- `/Users/arnavsinghal/DashboardSidekick/sidekick-dashboard/node_modules/shadcn/dist/tailwind.css` — @custom-variant definitions
- `/Users/arnavsinghal/DashboardSidekick/sidekick-dashboard/CLAUDE.md` — Design system and architecture spec
- Tailwind CSS v4 Upgrade Guide — https://tailwindcss.com/docs/upgrade-guide
