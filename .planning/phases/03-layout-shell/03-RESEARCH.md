# Phase 3: Layout Shell - Research

**Researched:** 2026-03-17
**Domain:** Next.js layout components, theme switching, tab navigation, shadcn base-nova dropdown/select/avatar
**Confidence:** HIGH

## Summary

Phase 3 builds the dashboard chrome: TopBar (logo, theme toggle, home icon, avatar dropdown), SubHeader (tagline + company selector), and TabNav (5 tabs + Invite Workers button). The existing `app/dashboard/page.tsx` has a minimal stub TopBar that will be replaced by three dedicated layout components in `components/dashboard/layout/`.

The stack is fully established from Phases 1-2. All required shadcn UI primitives (Button, DropdownMenu, Select, Avatar) are already installed with the **base-nova** style (uses `@base-ui/react`, NOT Radix). The critical implementation detail is that base-nova components use `render={}` prop instead of Radix's `asChild`. The `useTheme()` hook from `next-themes` requires a `mounted` guard pattern already proven in Phase 1.

**Primary recommendation:** Build TopBar first (it contains the theme toggle, the most technically complex piece), then SubHeader (simpler, uses Select for company picker), then TabNav (tab state management), and finally rewire page.tsx to compose all three with tab-switching logic.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- TopBar composition: MessageCircle logo + "Sidekick | Dashboard", theme toggle cycles Sun/Moon/Monitor (3 states), avatar top-right with dropdown (name, Settings, Sign Out), home icon ghost button, right-side order: Home, Theme Toggle, Avatar
- SubHeader: Static tagline "An overview of how your team is using Sidekick." (does NOT change per tab), Building icon + company dropdown right-aligned, 3 mock companies (Sunrise Cafe selected, Metro Warehouse, Downtown Retail), no border below SubHeader, shares card background with TopBar
- TabNav: Default active = Analytics, order: Analytics/Alerts/Documents/AI Studio/Workers, each tab has Lucide icon + text, Invite Workers button right-aligned same row, active = border-bottom-2 blue underline (NOT filled pill), full-width subtle bottom border baseline
- Shell stacking: TopBar sticky (position sticky, top-0, z-index), SubHeader and TabNav scroll with content, TopBar+SubHeader on card background (one elevated block), tab content on page background, unbuilt tabs use EmptyState with "Coming Soon"

### Claude's Discretion
- Company selector interactivity: whether selecting a different company updates displayed name or is purely visual
- Specific Lucide icon choices for each tab (suggestions: BarChart3, ShieldAlert, FileText, Sparkles, Users)
- Exact spacing between TopBar, SubHeader, and TabNav rows
- Avatar initial letter and color scheme
- Invite Workers button icon choice
- Transition animation on tab switch (if any)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUND-02 | Layout shell renders with TopBar (logo, theme toggle, avatar dropdown), SubHeader (company selector), and TabNav (5 tabs + Invite Workers button) | All shadcn primitives available (Button, DropdownMenu, Select, Avatar). Component structure defined in CONTEXT.md. |
| FOUND-03 | Tab navigation switches between Analytics, Alerts, Documents, AI Studio, and Workers tabs via useState (no URL routing) | Simple useState in page.tsx. AnalyticsTab already exists. Other tabs use EmptyState placeholders. |
| DARK-03 | Theme toggle in TopBar switches between light, dark, and system modes | next-themes already configured with `attribute="class"` and `enableSystem`. useTheme() provides setTheme(). Mounted guard pattern established. |
| DSN-05 | Active tab uses border-bottom underline indicator -- never a filled pill | Pure CSS: `border-b-2 border-blue-600` on active tab, with full-width subtle border baseline on the TabNav row. |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.1.6 | Framework + App Router | Project foundation |
| react | 19.2.3 | UI library | Current stable |
| next-themes | 0.4.6 | Theme switching (light/dark/system) | Proven pattern for Next.js class-based dark mode |
| @base-ui/react | ^1.3.0 | Headless UI primitives (shadcn base-nova) | Already installed, powers all shadcn components |
| lucide-react | ^0.577.0 | Icons | CLAUDE.md mandates Lucide only |

### shadcn Components Used in This Phase
| Component | File | Purpose |
|-----------|------|---------|
| Button | `components/ui/button.tsx` | Ghost buttons (theme toggle, home), primary CTA (Invite Workers) |
| DropdownMenu | `components/ui/dropdown-menu.tsx` | Avatar dropdown menu |
| Select | `components/ui/select.tsx` | Company selector dropdown |
| Avatar | `components/ui/avatar.tsx` | User avatar with fallback initial |
| Separator | `components/ui/separator.tsx` | Visual dividers if needed |

### No New Dependencies Required
Everything needed is already installed. No `npm install` required for this phase.

## Architecture Patterns

### Component Structure
```
components/dashboard/layout/
  TopBar.tsx           # Logo, theme toggle, home icon, avatar + dropdown
  SubHeader.tsx        # Tagline + company selector dropdown
  TabNav.tsx           # 5 tabs + Invite Workers button

app/dashboard/page.tsx  # Composes all three + tab content switching
```

### Pattern 1: Mounted Guard for useTheme()
**What:** next-themes `useTheme()` returns undefined on server. Must guard with `mounted` state.
**When to use:** Any component that reads or displays theme state.
**Example:**
```typescript
// Proven pattern from Phase 1
const { theme, setTheme } = useTheme()
const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])

// In JSX: render theme-dependent UI only when mounted
{mounted && (
  <Button variant="ghost" size="icon" onClick={cycleTheme}>
    {theme === 'dark' ? <Sun /> : theme === 'light' ? <Moon /> : <Monitor />}
  </Button>
)}
```

### Pattern 2: Three-State Theme Cycling
**What:** Theme toggle cycles through light -> dark -> system (not just light/dark toggle).
**When to use:** TopBar theme toggle only.
**Example:**
```typescript
function cycleTheme() {
  if (theme === 'light') setTheme('dark')
  else if (theme === 'dark') setTheme('system')
  else setTheme('light') // system -> light
}
// Icon mapping:
// light -> Sun, dark -> Moon, system -> Monitor
```

### Pattern 3: Tab State in Page Component
**What:** Parent page owns `activeTab` state, passes to TabNav and conditionally renders content.
**When to use:** Dashboard page assembly.
**Example:**
```typescript
type TabId = 'analytics' | 'alerts' | 'documents' | 'ai-studio' | 'workers'

const [activeTab, setActiveTab] = useState<TabId>('analytics')

// In JSX:
<TabNav activeTab={activeTab} onTabChange={setActiveTab} />
{activeTab === 'analytics' && <AnalyticsTab />}
{activeTab === 'alerts' && <EmptyState icon={ShieldAlert} title="Coming Soon" ... />}
// etc.
```

### Pattern 4: Sticky TopBar, Scrolling SubHeader + TabNav
**What:** TopBar stays fixed at top. SubHeader and TabNav scroll with page content.
**When to use:** Page layout structure.
**Example:**
```typescript
// TopBar: sticky
<div className="sticky top-0 z-30 ...">
  <TopBar />
</div>
// SubHeader + TabNav: normal flow
<SubHeader />
<TabNav />
// Content area
<div className="max-w-7xl mx-auto px-6 py-6">
  {/* tab content */}
</div>
```

### Pattern 5: base-nova DropdownMenu Usage
**What:** The shadcn base-nova style uses `@base-ui/react`, not Radix. API is similar but not identical.
**When to use:** Avatar dropdown, and potentially company selector.
**Critical detail:** Use `render={}` prop instead of `asChild` for custom trigger elements.
**Example:**
```typescript
<DropdownMenu>
  <DropdownMenuTrigger
    render={<Button variant="ghost" size="icon" className="rounded-full" />}
  >
    <Avatar>
      <AvatarFallback>N</AvatarFallback>
    </Avatar>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" sideOffset={8}>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Sign Out</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Pattern 6: base-nova Select for Company Selector
**What:** The Select component uses `@base-ui/react/select` with `render={}` prop pattern.
**When to use:** Company selector in SubHeader.
**Example:**
```typescript
<Select defaultValue="sunrise-cafe">
  <SelectTrigger className="...">
    <Building className="h-4 w-4 text-gray-500" />
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="sunrise-cafe">Sunrise Cafe</SelectItem>
    <SelectItem value="metro-warehouse">Metro Warehouse</SelectItem>
    <SelectItem value="downtown-retail">Downtown Retail</SelectItem>
  </SelectContent>
</Select>
```

### Pattern 7: Tab Underline Indicator (DSN-05)
**What:** Active tab uses bottom border, not filled pill. GitHub/Linear style.
**When to use:** TabNav active state.
**Example:**
```typescript
// TabNav row has full-width subtle bottom border
<div className="border-b border-gray-200 dark:border-gray-800">
  <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
    <div className="flex gap-0">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
            activeTab === tab.id
              ? "border-blue-600 text-gray-900 dark:text-white"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          )}
          onClick={() => onTabChange(tab.id)}
        >
          <tab.icon className="h-4 w-4" />
          {tab.label}
        </button>
      ))}
    </div>
    <Button>Invite Workers</Button>
  </div>
</div>
```
**Key CSS trick:** `-mb-px` on each tab button makes the active tab's `border-b-2` overlap the container's `border-b`, creating the clean underline-on-baseline effect.

### Anti-Patterns to Avoid
- **Using shadcn `<Tabs>` component:** Do NOT use the shadcn Tabs primitive for TabNav. It would impose its own state management and styling. Use plain buttons with the underline pattern above.
- **Filled pill for active tab:** CLAUDE.md explicitly forbids this. Active = border-bottom underline only.
- **Using `asChild` prop:** base-nova uses `render={}`, not Radix's `asChild`. This will cause runtime errors.
- **Reading `theme` without mounted guard:** Causes hydration mismatch. Always check `mounted` before rendering theme-dependent UI.
- **Using `<form>` tags:** CLAUDE.md forbids. Use onClick/onChange only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme switching | Custom theme context | `next-themes` useTheme() | Already configured, handles system preference, localStorage, class attribute |
| Dropdown menus | Custom popover/portal logic | shadcn DropdownMenu (base-ui Menu) | Handles positioning, focus management, keyboard nav, portal, animations |
| Select/combobox | Custom select dropdown | shadcn Select (base-ui Select) | Same reasons -- accessible, positioned, keyboard-navigable |
| Avatar with fallback | Custom div with initial | shadcn Avatar (base-ui Avatar) | Handles image loading states, fallback logic |

**Key insight:** All interactive dropdown/popover behaviors are already solved by the installed shadcn base-nova components. The layout components in this phase are mostly composition and styling.

## Common Pitfalls

### Pitfall 1: Hydration Mismatch on Theme Toggle
**What goes wrong:** Server renders one theme state, client hydrates with another. React throws hydration error.
**Why it happens:** `useTheme()` returns `undefined` on server; actual theme resolves on client.
**How to avoid:** Always use the `mounted` guard pattern. Render a placeholder (same size) or nothing until mounted.
**Warning signs:** Console errors about hydration mismatch, theme icon flickering on page load.

### Pitfall 2: DropdownMenu Trigger with render= Prop
**What goes wrong:** Wrapping Avatar in DropdownMenuTrigger without `render=` creates a nested button (trigger is a button by default, Avatar is inline).
**Why it happens:** base-nova DropdownMenuTrigger renders as a button. If you want a custom element as trigger, use `render=`.
**How to avoid:** Use `render={<button className="..." />}` or compose carefully. Check the base-nova API.
**Warning signs:** Double button nesting in DOM, unexpected click behavior.

### Pitfall 3: z-index Stacking for Sticky TopBar
**What goes wrong:** Sticky TopBar gets overlapped by dropdown portals or card shadows.
**Why it happens:** Dropdowns use `z-50` by default (see DropdownMenuContent). TopBar needs appropriate z-index.
**How to avoid:** TopBar: `z-30` or `z-40`. Dropdown portals already use `z-50` and `isolate`, so they'll render above. The key is TopBar must be above regular content but below portals.
**Warning signs:** Dropdowns appearing behind the TopBar, or content scrolling over the TopBar.

### Pitfall 4: Tab Underline Not Aligning with Container Border
**What goes wrong:** The active tab's blue underline doesn't visually sit on the container's bottom border -- there's a gap or double line.
**Why it happens:** The tab button's border-bottom and the container's border-bottom are at different vertical positions.
**How to avoid:** Use `-mb-px` on each tab button to pull it down 1px so its bottom border overlaps the container border. The container uses `border-b` (1px), the active tab uses `border-b-2` (2px), creating a clean overlap.
**Warning signs:** Visible double line at the bottom of tabs, or gap between tab underline and content area.

### Pitfall 5: Select Component Default Value
**What goes wrong:** Company selector shows blank or placeholder instead of "Sunrise Cafe" on load.
**Why it happens:** base-ui Select requires `defaultValue` to match one of the `SelectItem` value props exactly.
**How to avoid:** Ensure `defaultValue="sunrise-cafe"` matches `<SelectItem value="sunrise-cafe">` exactly. Use the same string constant.
**Warning signs:** Empty select trigger on initial render.

### Pitfall 6: TopBar + SubHeader Visual Separation
**What goes wrong:** TopBar and SubHeader look like separate blocks instead of one continuous elevated header.
**Why it happens:** Adding a border-bottom to TopBar or different backgrounds creates visual separation.
**How to avoid:** Both share `bg-white dark:bg-[var(--card-bg)]`. Only add border-bottom to the last element before TabNav (or to TabNav container itself). The TopBar can have a very subtle `border-b border-gray-100 dark:border-gray-800/50` or no border at all.
**Warning signs:** Two distinct white boxes stacked instead of one cohesive header.

## Code Examples

### TopBar Component Shell
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { MessageCircle, Sun, Moon, Monitor, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

interface TopBarProps {
  // No props needed for now -- self-contained
}

function TopBar({}: TopBarProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  const themeIcon = theme === 'dark' ? Sun : theme === 'light' ? Moon : Monitor

  return (
    <div className="bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)]">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="text-base font-semibold text-gray-900 dark:text-white">Sidekick</span>
          <span className="text-sm text-gray-400 dark:text-gray-500">|</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">Dashboard</span>
        </div>
        {/* Right: Home, Theme Toggle, Avatar */}
        <div className="flex items-center gap-1">
          {/* ... buttons ... */}
        </div>
      </div>
    </div>
  )
}

export { TopBar }
export type { TopBarProps }
```

### TabNav Tab Definition Pattern
```typescript
import type { LucideIcon } from 'lucide-react'
import { BarChart3, ShieldAlert, FileText, Sparkles, Users } from 'lucide-react'

type TabId = 'analytics' | 'alerts' | 'documents' | 'ai-studio' | 'workers'

interface TabDefinition {
  id: TabId
  label: string
  icon: LucideIcon
}

const TABS: TabDefinition[] = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'alerts', label: 'Alerts', icon: ShieldAlert },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'ai-studio', label: 'AI Studio', icon: Sparkles },
  { id: 'workers', label: 'Workers', icon: Users },
]
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Radix UI primitives (shadcn default) | base-ui/react primitives (shadcn base-nova) | shadcn v4 (2025) | `render={}` replaces `asChild`, different component APIs |
| tailwind.config.ts | @theme inline in globals.css | Tailwind v4 (2025) | No config file, all tokens in CSS |
| `shadow-[var(...)]` | `[box-shadow:var(--card-shadow)]` | Tailwind v4 | Shadow utility intercepts multi-value vars, must use explicit CSS property syntax |

**Deprecated/outdated:**
- `asChild` prop: Does NOT work in base-nova. Use `render={}`.
- `tailwind.config.ts`: Does not exist in this project. Tokens in `globals.css` via `@theme inline`.

## Open Questions

1. **DropdownMenuTrigger render prop for Avatar**
   - What we know: base-nova uses `render={}` instead of `asChild`. The DropdownMenuTrigger renders as a button by default.
   - What's unclear: Exact syntax for wrapping Avatar in the trigger without double-button nesting.
   - Recommendation: Test `render={<button className="rounded-full" />}` pattern, or place Avatar as a child of the default trigger button. Verify no nested button warning in console.

2. **Select component for company selector vs DropdownMenu**
   - What we know: Select is semantically correct for choosing from a list. DropdownMenu is for action menus.
   - What's unclear: Whether Select styling gives the right visual for a compact company picker with a Building icon prefix.
   - Recommendation: Use Select (semantically correct). The Building icon can go inside SelectTrigger before SelectValue. If styling is awkward, DropdownMenu with RadioItems is the fallback.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed |
| Config file | none -- see Wave 0 |
| Quick run command | `npx next build` (type-check + build) |
| Full suite command | `npx next build` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-02 | Shell renders TopBar + SubHeader + TabNav | smoke | `npx next build` (compilation check) | N/A |
| FOUND-03 | Tab switching via useState | manual-only | Visual: click each tab, verify content switches | N/A |
| DARK-03 | Theme toggle cycles light/dark/system | manual-only | Visual: click toggle, verify page theme changes | N/A |
| DSN-05 | Active tab uses border-bottom underline | manual-only | Visual: verify underline indicator, not filled pill | N/A |

**Justification for manual-only:** This is a UI-only greenfield project with no test framework installed. The primary validation is visual correctness (does the shell look right, do tabs switch, does dark mode work). `next build` provides TypeScript type-checking and compilation verification. Visual verification against the design spec is the primary quality gate.

### Sampling Rate
- **Per task commit:** `npx next build` (ensures no type errors or build breaks)
- **Per wave merge:** Visual inspection in browser (both light + dark mode)
- **Phase gate:** All 5 tabs clickable, theme toggle works through all 3 states, shell renders correctly in both modes

### Wave 0 Gaps
- [ ] `components/dashboard/layout/` directory -- needs creation
- [ ] No unit/integration test framework installed (acceptable for this UI-focused project; `next build` is the automated check)

## Sources

### Primary (HIGH confidence)
- Project codebase: `app/dashboard/page.tsx`, `app/globals.css`, `app/layout.tsx` -- current implementation state
- Project codebase: `components/ui/button.tsx`, `dropdown-menu.tsx`, `select.tsx`, `avatar.tsx` -- actual shadcn base-nova API
- `CLAUDE.md` -- design system rules, component conventions, architecture decisions
- `03-CONTEXT.md` -- user decisions for this phase
- `package.json` -- verified dependency versions

### Secondary (MEDIUM confidence)
- next-themes v0.4.x behavior -- based on established project patterns (mounted guard already proven in Phase 1)

### Tertiary (LOW confidence)
- None -- all findings are based on actual project code and locked decisions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- everything is already installed and verified working from Phases 1-2
- Architecture: HIGH -- component structure is defined in CLAUDE.md, patterns proven in existing code
- Pitfalls: HIGH -- hydration guard and shadow syntax pitfalls already encountered and solved in prior phases; base-nova API pitfalls derived from reading actual component source code

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (stable -- no dependency changes expected)
