# Architecture Patterns

**Domain:** Multi-tab manager dashboard (Next.js App Router, Tailwind v4, shadcn/ui)
**Researched:** 2026-03-13
**Confidence:** HIGH — Based on locked project decisions in CLAUDE.md, confirmed scaffold state, and established Next.js App Router patterns.

---

## Recommended Architecture

### High-Level Structure

```
app/
  layout.tsx                    # ThemeProvider + TooltipProvider (already implemented)
  page.tsx                      # Redirect or home page (currently default scaffold)
  dashboard/
    page.tsx                    # Dashboard shell — owns activeTab useState, renders layout + TabContent

components/dashboard/
  layout/                       # Shell components (Server-safe where possible, Client where hooks needed)
  shared/                       # Reusable across ALL tabs — must be built first
  analytics/                    # Tab-scoped components
  alerts/                       # Tab-scoped components
  documents/                    # Tab-scoped components
  ai-studio/                    # Tab-scoped components
  workers/                      # Tab-scoped components
```

### Routing Decision (Locked)

Tab state lives in `useState` at `app/dashboard/page.tsx`. No URL params for tabs. This is intentional for the demo phase — keeps the build simple and avoids URL sync complexity during YC presentation prep.

```typescript
// app/dashboard/page.tsx
'use client'

type Tab = 'analytics' | 'alerts' | 'documents' | 'ai-studio' | 'workers'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('alerts')  // Alerts is highest priority
  // ...
}
```

The `defaultTab` should be `'alerts'` because Alerts is the highest business priority — a manager opening the dashboard should land on the most critical information immediately.

---

## Component Dependency Graph

The dependency graph determines build order. A component cannot be built until all its dependencies are complete.

```
Level 0 — Foundation (no dependencies):
  globals.css (design tokens already defined)
  shadcn/ui primitives (already installed: card, button, badge, table, dialog, avatar,
                       dropdown-menu, select, separator, skeleton, tooltip, progress)

Level 1 — Shared Components (depend only on Level 0):
  EmptyState        → depends on: Button (shadcn), Lucide icon
  MetricCard        → depends on: shadcn card anatomy, Lucide icon
  SectionHeader     → depends on: Button (shadcn), Lucide icon

Level 2 — Layout Shell (depends on Level 0, some Level 1):
  TopBar            → depends on: Avatar (shadcn), DropdownMenu (shadcn), Lucide icons
  SubHeader         → depends on: Select (shadcn)
  TabNav            → depends on: Button (shadcn), Lucide icons
  DashboardPage     → depends on: TopBar, SubHeader, TabNav, all tab assemblies (shell only)

Level 3 — Tab Leaf Components (depend on Level 1 shared components):
  AlertMetrics      → depends on: MetricCard (Level 1)
  AlertsTable       → depends on: SectionHeader (Level 1), EmptyState (Level 1), Table (shadcn), Badge (shadcn), Select (shadcn)
  QuestionsChart    → depends on: SectionHeader (Level 1), Recharts, Select (shadcn)
  FeedCard          → depends on: SectionHeader (Level 1), EmptyState (Level 1)
  UploadZone        → depends on: EmptyState pattern (Level 1), Button (shadcn)
  IntegrationsRow   → depends on: Button (shadcn), Lucide icons (or integration SVGs)
  DocumentsTable    → depends on: SectionHeader (Level 1), EmptyState (Level 1), Table (shadcn), Badge (shadcn)
  VideoUpload       → depends on: EmptyState pattern (Level 1), Button (shadcn)
  KnowledgeGaps     → depends on: SectionHeader (Level 1), EmptyState (Level 1), Button (shadcn)
  RegistrationCard  → depends on: Button (shadcn), Dialog (shadcn), Tooltip (shadcn)
  QRCodeModal       → depends on: Dialog (shadcn), Button (shadcn)
  WorkersTable      → depends on: SectionHeader (Level 1), EmptyState (Level 1), Table (shadcn), Badge (shadcn)

Level 4 — Tab Assemblies (depend on Level 3 leaf components):
  AlertsTab         → depends on: AlertMetrics, AlertsTable
  AnalyticsTab      → depends on: MetricCard (Level 1), QuestionsChart, FeedCard
  DocumentsTab      → depends on: UploadZone, IntegrationsRow, DocumentsTable
  AIStudioTab       → depends on: VideoUpload, KnowledgeGaps
  WorkersTab        → depends on: RegistrationCard, QRCodeModal, WorkersTable
```

### Critical Dependency: Shared Components Are a Blocker

`EmptyState`, `MetricCard`, and `SectionHeader` are used by EVERY tab. Building any tab component before these three are complete creates rework risk. They must be finished and verified in both light and dark mode before any Level 3 work begins.

---

## Component Boundaries and Responsibilities

| Component | Layer | Responsibility | Communicates With |
|-----------|-------|---------------|-------------------|
| `app/dashboard/page.tsx` | Page | Owns `activeTab` state, renders shell + active tab | All tab assemblies via props/conditional render |
| `TopBar` | Layout | Logo, dark mode toggle, home icon, avatar dropdown | none (self-contained) |
| `SubHeader` | Layout | Tagline, company selector | none (self-contained with local state) |
| `TabNav` | Layout | Renders 5 tabs + Invite Workers button, emits tab change | `onTabChange` callback up to page |
| `EmptyState` | Shared | Renders icon + title + description + optional action | Used by any tab component needing empty state |
| `MetricCard` | Shared | Renders a single KPI — value, label, icon, subtext | Used by AlertMetrics, AnalyticsTab |
| `SectionHeader` | Shared | Card header with title and optional action button | Used by chart cards, feed cards, table cards |
| `AlertsTab` | Tab assembly | Composes AlertMetrics + AlertsTable | `AlertMetrics`, `AlertsTable` |
| `AlertMetrics` | Leaf | Renders row of 4 KPI MetricCards | `MetricCard` |
| `AlertsTable` | Leaf | Filtered issue table with segmented control | `SectionHeader`, `EmptyState`, shadcn Table |
| `AnalyticsTab` | Tab assembly | Composes metric row + QuestionsChart + FeedCard | `MetricCard`, `QuestionsChart`, `FeedCard` |
| `QuestionsChart` | Leaf | Recharts bar/area with time range selector | `SectionHeader`, Recharts |
| `FeedCard` | Leaf | Recent Questions + Activity feeds | `SectionHeader`, `EmptyState` |
| `DocumentsTab` | Tab assembly | Composes UploadZone + IntegrationsRow + DocumentsTable | all three leaf components |
| `UploadZone` | Leaf | Drag-and-drop file upload area | `Button` (shadcn) |
| `IntegrationsRow` | Leaf | 4 integration cards with neutral connect buttons | `Button` (shadcn) |
| `DocumentsTable` | Leaf | Uploaded documents list | `SectionHeader`, `EmptyState`, shadcn Table |
| `AIStudioTab` | Tab assembly | Composes VideoUpload + KnowledgeGaps | both leaf components |
| `VideoUpload` | Leaf | Video walkthrough upload (constrained max-w-2xl) | `Button` (shadcn) |
| `KnowledgeGaps` | Leaf | Gap analysis section with Analyze Gaps CTA | `SectionHeader`, `EmptyState`, amber Button |
| `WorkersTab` | Tab assembly | Composes RegistrationCard + QRCodeModal + WorkersTable | all three leaf components |
| `RegistrationCard` | Leaf | JOIN code display, copy action, QR trigger | `Button`, `Tooltip`, triggers QRCodeModal |
| `QRCodeModal` | Leaf | Dialog with QR code display + download | `Dialog` (shadcn) |
| `WorkersTable` | Leaf | Worker roster with verified badge | `SectionHeader`, `EmptyState`, `Badge`, shadcn Table |

---

## Data Flow

```
app/dashboard/page.tsx
  │
  ├── activeTab: Tab  (useState)
  │     │
  │     └── passed as prop → TabNav (for active styling)
  │
  └── conditional render based on activeTab:
        'alerts'    → <AlertsTab showMockData={true} />
        'analytics' → <AnalyticsTab showMockData={true} />
        'documents' → <DocumentsTab showMockData={true} />
        'ai-studio' → <AIStudioTab showMockData={true} />
        'workers'   → <WorkersTab showMockData={true} />

Each tab assembly:
  └── owns its own mock data constants (MOCK_ALERTS, MOCK_WORKERS, etc.)
  └── passes data down to leaf components as typed props
  └── no cross-tab state, no global store, no context for data

Dark mode signal:
  app/layout.tsx → ThemeProvider (attribute="class") → .dark class on <html>
  All components read dark mode via Tailwind dark: variant — no JS theme reads in components
```

### Mock Data Pattern

Every tab assembly defines its mock data at the file's top level:

```typescript
// components/dashboard/alerts/AlertsTab.tsx
const MOCK_ALERTS: Alert[] = [
  { id: '1', worker: 'Maria G.', issue: 'Temperature above threshold', severity: 'high', ... },
  // ...
]

interface AlertsTabProps {
  showMockData?: boolean  // default false — demo mode toggle
}
```

The `showMockData` prop is the single toggle for all demo data. When real APIs exist, swap at the assembly level — leaf components never need to change.

---

## Dark Mode Architecture

### Mechanism (Locked)

- **Strategy:** `next-themes` with `attribute="class"` — adds `.dark` class to `<html>`
- **Detection in components:** Tailwind `dark:` variant only — no `useTheme()` hook in leaf components
- **Token layer:** CSS custom properties in `globals.css` under `:root` and `.dark` selectors
- **Tailwind v4 integration:** `@custom-variant dark (&:is(.dark *))` defined in globals.css — this replaces the `darkMode: 'class'` config from Tailwind v3

### The `@custom-variant` Pattern (Tailwind v4 Specific)

In Tailwind v4, dark mode is configured differently from v3. The project already has this in globals.css:

```css
@custom-variant dark (&:is(.dark *));
```

This means the standard `dark:` prefix in Tailwind classes continues to work as expected. No additional configuration is needed. The `ThemeProvider` in `app/layout.tsx` sets `attribute="class"` which places the `.dark` class on `<html>` — Tailwind's custom variant selector picks it up through the DOM hierarchy.

### Two-Layer Token System

The project uses a deliberate two-layer system:

**Layer 1 — shadcn semantic tokens** (in `:root` / `.dark`):
```css
--card: oklch(1 0 0);        /* white in light */
--card: oklch(0.155 0.02 268); /* #1a1d27 in dark */
```
Used by shadcn/ui components internally.

**Layer 2 — Depth system tokens** (in `:root` / `.dark`):
```css
--page-bg: #f9fafb;          /* gray-50 in light */
--page-bg: #0f1117;          /* near-black in dark */
--card-bg: #ffffff;
--card-bg: #1a1d27;
--card-shadow: ...;
--card-shadow-hover: ...;
--border-subtle: ...;
--border-default: ...;
```
Used directly in component classNames as `bg-[var(--page-bg)]`, `shadow-[var(--card-shadow)]`, etc.

### Per-Component Dark Mode Checklist

Every component must pass this mental model before being considered done:

1. **Background elements** — Does `bg-white` have a `dark:bg-[var(--card-bg)]` pair?
2. **Text elements** — Does `text-gray-900` have a `dark:text-white` pair? Does `text-gray-500` have `dark:text-gray-400`?
3. **Borders** — Does `border-gray-200` have `dark:border-gray-800`?
4. **Icons** — Lucide icons inherit `currentColor` — they follow text color automatically, no extra dark classes needed
5. **Shadows** — Always `shadow-[var(--card-shadow)]`, never `shadow-lg`. The CSS variable changes per mode.
6. **Charts** — Recharts colors should use the `--chart-1` through `--chart-5` CSS variables, which are defined identically in both `:root` and `.dark` (blue palette)

### Dark Mode Toggle Wiring

`TopBar` owns the theme toggle button. Pattern:

```typescript
'use client'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

// Inside TopBar component:
const { theme, setTheme } = useTheme()
// Toggle: setTheme(theme === 'dark' ? 'light' : 'dark')
```

Only `TopBar` needs `useTheme()`. All other components are theme-agnostic — they use Tailwind `dark:` classes and the ThemeProvider handles the class toggle on `<html>`.

---

## Build Order Recommendation

Build order follows two constraints: (1) the dependency graph above, and (2) business priority (Alerts first).

### Phase 1: Foundation Verification (0.5 hours)
Verify what's already working from the scaffold:
- Confirm `ThemeProvider` + dark mode toggle works end-to-end
- Confirm `globals.css` depth system tokens are applied
- Create `app/dashboard/page.tsx` with shell structure and `activeTab` state
- Verify page renders without errors

**Do not build components yet.** Just establish the page scaffold.

### Phase 2: Shared Components (2-3 hours)
Build in this exact order — each is a dependency for Phase 3+:

1. **`SectionHeader`** — Simplest, foundational. Used in every card with a header.
2. **`MetricCard`** — Used in 2 tabs. Establish KPI number/label/icon pattern here.
3. **`EmptyState`** — Most complex of the three. Used in every tab with empty lists. Get the icon container + title + description + action button pattern right once.

Verify each in both light and dark mode before moving on.

### Phase 3: Layout Shell (1-2 hours)
Build the chrome that wraps all tabs:

4. **`TopBar`** — Logo, dark mode toggle (using `useTheme`), home icon, avatar + dropdown
5. **`SubHeader`** — Tagline + company selector using shadcn Select
6. **`TabNav`** — 5 tabs with underline active state + Invite Workers button

Wire `TabNav` → `app/dashboard/page.tsx` so tab switching works. The default tab should be `'alerts'`.

### Phase 4: Alerts Tab (HIGHEST PRIORITY, 2-3 hours)
Build the highest-business-value tab first:

7. **`AlertMetrics`** — Row of 4 `MetricCard` instances. Define the `Alert` TypeScript types here.
8. **`AlertsTable`** — The main content: segmented filter control + table rows with severity badges.
9. **`AlertsTab`** — Assembly component. Wire `MOCK_ALERTS` data, `showMockData` prop.

After this phase the product is demonstrable for its most critical use case.

### Phase 5: Analytics Tab (1-2 hours)
10. **`QuestionsChart`** — Recharts implementation with `ResponsiveContainer` + time range selector.
11. **`FeedCard`** — Recent Questions and Activity feeds.
12. **`AnalyticsTab`** — Assembly with 4 top MetricCards + chart + feeds.

### Phase 6: Workers Tab (1-2 hours)
13. **`QRCodeModal`** — shadcn Dialog with QR display. Build before `RegistrationCard` since `RegistrationCard` triggers it.
14. **`RegistrationCard`** — JOIN code + copy + QR trigger button. Wire modal open state here.
15. **`WorkersTable`** — Roster with verified badge column.
16. **`WorkersTab`** — Assembly.

### Phase 7: Documents Tab (1-2 hours)
17. **`UploadZone`** — Drag-and-drop zone with correct constraint classes.
18. **`IntegrationsRow`** — 4 integration cards. CRITICAL: outline-only neutral buttons. No brand colors.
19. **`DocumentsTable`** — Document list.
20. **`DocumentsTab`** — Assembly.

### Phase 8: AI Studio Tab (1 hour)
21. **`VideoUpload`** — Constrained to `max-w-2xl`. This constraint is non-negotiable.
22. **`KnowledgeGaps`** — Gap analysis section with amber Analyze Gaps button.
23. **`AIStudioTab`** — Assembly.

### Phase 9: Polish (1-2 hours)
24. Typography audit — verify every text element uses the locked typography scale from CLAUDE.md
25. Dark mode sweep — every component in dark mode, check contrast on `#0f1117` background
26. Responsive breakpoints — metric card grid collapse: `grid-cols-4` → `grid-cols-2` → `grid-cols-1`

---

## Patterns to Follow

### Pattern 1: Assembly Component Pattern

Tab assemblies are thin orchestrators. They own mock data and compose leaf components. They contain no business logic.

```typescript
// components/dashboard/alerts/AlertsTab.tsx
'use client'

import { AlertMetrics } from './AlertMetrics'
import { AlertsTable } from './AlertsTable'

const MOCK_ALERTS: Alert[] = [ /* ... */ ]

interface AlertsTabProps {
  showMockData?: boolean
}

export function AlertsTab({ showMockData = false }: AlertsTabProps) {
  const alerts = showMockData ? MOCK_ALERTS : []

  return (
    <div className="space-y-6">
      <AlertMetrics alerts={alerts} />
      <AlertsTable alerts={alerts} />
    </div>
  )
}
```

### Pattern 2: Typed Props Interface (Required on Every Component)

```typescript
// Named interface, not inline — matches CLAUDE.md naming convention
interface MetricCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  subtext?: string
  trend?: 'up' | 'down' | 'neutral'
}

export function MetricCard({ label, value, icon: Icon, subtext, trend }: MetricCardProps) {
  // ...
}
```

### Pattern 3: Card Anatomy (Apply Exactly — No Exceptions)

```typescript
<div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] shadow-[var(--card-shadow)] p-5">
  {/* card content */}
</div>
```

Interactive cards add: `hover:shadow-[var(--card-shadow-hover)] transition-shadow duration-150 cursor-pointer`

### Pattern 4: EmptyState Usage

Never render bare icon + text. Always use the shared component:

```typescript
<EmptyState
  icon={AlertTriangle}
  title="No active alerts"
  description="When safety issues are flagged by your team, they'll appear here."
  action={{ label: "Learn about alerts", onClick: () => {} }}
/>
```

### Pattern 5: Mock Data Field Names Mirror API

```typescript
// Props named to match future API response shape
interface Alert {
  id: string
  worker_name: string        // not "workerName" — mirrors backend snake_case
  issue_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  created_at: string         // ISO timestamp
  resolved_at: string | null
  status: 'open' | 'resolved'
}
```

When real data arrives, the component interface doesn't change — only the data source does.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Building Tab Components Before Shared Components

**What:** Building `AlertsTable` before `EmptyState` is complete, then adding an ad-hoc empty state inline.
**Why bad:** Creates two competing empty state patterns. Requires rework when the real `EmptyState` is done.
**Instead:** Finish `EmptyState`, `MetricCard`, `SectionHeader` in Phase 2 before touching any tab component.

### Anti-Pattern 2: Brand Colors on Integration Buttons

**What:** Using `bg-blue-600` or `bg-orange-500` for Google Drive / Dropbox connect buttons.
**Why bad:** Violates the most critical design fix of the redesign. Makes the UI look cluttered.
**Instead:** Always `variant="outline"` with default neutral border. The integration logo provides brand recognition.

### Anti-Pattern 3: Hardcoded Hex Values in JSX

**What:** `className="bg-[#1a1d27]"` inside a component.
**Why bad:** Duplicates the design token. If the token changes, these hardcoded values drift.
**Instead:** Use `bg-[var(--card-bg)]` to reference the CSS variable.

### Anti-Pattern 4: Full-Width Single-Column Upload Zones

**What:** `VideoUpload` rendered without `max-w-2xl` wrapper.
**Why bad:** Stretches uncomfortably to full container width on large monitors. Non-negotiable constraint.
**Instead:** Always wrap single-column upload zones in `<div className="max-w-2xl">`.

### Anti-Pattern 5: `any` in TypeScript

**What:** `(event: any) => ...` or untyped mock data arrays.
**Why bad:** Undermines type safety. Errors that TypeScript would catch get deferred to runtime.
**Instead:** Define the interface. Use `unknown` and narrow if shape is truly uncertain.

### Anti-Pattern 6: Server Components for Dashboard Components

**What:** Accidentally leaving out `'use client'` on a component that uses hooks or event handlers.
**Why bad:** The entire dashboard uses hooks (`useState`, `useTheme`) and event handlers. All components must be Client Components.
**Instead:** `'use client'` directive at the top of every file in `components/dashboard/`.

### Anti-Pattern 7: Global State for Tab Data

**What:** Reaching for Zustand, Context, or Redux to share data between tabs.
**Why bad:** Over-engineered for this demo. Each tab is independent with its own mock data.
**Instead:** Keep data local to each tab assembly via `useState` + mock data constants. No cross-tab data sharing needed.

---

## Scalability Considerations

This is a demo-phase build. The architecture is intentionally simple. These are the evolution points when real data arrives:

| Concern | Demo Phase (now) | Post-Demo (real API) |
|---------|-----------------|---------------------|
| Data fetching | Mock data constants in assembly | Replace constants with `fetch()` or React Query in assembly |
| Tab routing | `useState` in `app/dashboard/page.tsx` | Add `?tab=alerts` URL param with `useSearchParams` |
| Auth | Not in scope | `app/dashboard/layout.tsx` server-side auth check |
| Loading states | `showMockData` prop | `isLoading` prop + Skeleton components (already installed) |
| Error states | Not needed yet | Add to `EmptyState` via `variant="error"` prop |
| Cross-tab state | Not needed | Could promote to `app/dashboard/page.tsx` state |

The key architectural choice that makes this easy: **all data lives in assembly components**. When APIs exist, the leaf components never change — only the assembly's data source changes from a constant to an async fetch.

---

## Sources

- CLAUDE.md (project root) — Architecture decisions, design system, component structure — HIGH confidence
- .planning/PROJECT.md — Requirements, constraints, key decisions — HIGH confidence
- `app/layout.tsx` (inspected) — Confirms ThemeProvider with `attribute="class"`, TooltipProvider already wired — HIGH confidence
- `app/globals.css` (inspected) — Confirms Tailwind v4 `@custom-variant dark` pattern, both depth system layers implemented — HIGH confidence
- `package.json` (inspected) — Confirms exact versions: Next.js 16.1.6, Tailwind v4, next-themes 0.4.6, recharts 3.8.0, lucide-react 0.577.0 — HIGH confidence
- `components/ui/` (inspected) — Confirms available shadcn components: avatar, badge, button, card, dialog, dropdown-menu, progress, select, separator, skeleton, table, tooltip — HIGH confidence
