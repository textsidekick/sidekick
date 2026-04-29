# Phase 4: Alerts Tab - Research

**Researched:** 2026-03-17
**Domain:** React component composition, data table rendering, segmented controls, mock data patterns
**Confidence:** HIGH

## Summary

Phase 4 builds the Alerts tab -- the highest-priority tab for morning manager check-ins. It composes three new components (AlertsTab, AlertMetrics, AlertsTable) from existing shared primitives (MetricCard, EmptyState, SectionHeader) and shadcn UI components (Table, Badge, Button). The CONTEXT.md is highly specific: 4 KPI cards with colored icon accents, a 3-segment pill-style filter control, and a 5-column table with severity badges and status dots.

All building blocks are already installed and proven in prior phases. The primary technical risks are (1) MetricCard lacks a `valueClassName` prop needed for the red High Priority value, and (2) the segmented control is a new UI pattern not covered by any existing shadcn component -- it must be hand-built with careful dark mode styling. The Badge component uses base-nova's `useRender` pattern but accepts a `className` override, enabling custom severity colors.

**Primary recommendation:** Build AlertMetrics first (extends MetricCard with a minor prop addition), then the segmented control + AlertsTable, then AlertsTab assembly. Compute KPI values from mock data array, not hardcoded numbers.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Four KPI cards in order: Open Issues, High Priority, Resolved, Total Reported (screenshot set)
- Colored icon accents: Clock/amber-500, AlertTriangle/red-500, CheckCircle2/emerald-500, Wrench/blue-500
- High Priority card: value text in red-500 (not default gray-900)
- No trend indicators -- just value + subtext. Absolute numbers for safety.
- KPI values computed from mock data array, not hardcoded
- 3 segments: Open / Resolved / All (matches screenshot)
- Default selected: Open
- Pill/toggle style for segmented control: rounded segments, gray-100 container, active = white fill + shadow. Visually distinct from TabNav underline.
- Dark mode segmented: container bg-gray-800, active segment bg-gray-700 or elevated surface
- SectionHeader with title "Issues" and ghost refresh icon button
- Segmented control below SectionHeader, above table
- shadcn Table component for semantic HTML
- Columns: Issue (primary), Worker (secondary), Severity (badge), Status (dot + text), Date (secondary)
- Severity badges: High (red-100/red-700, dark: red-950/red-400), Medium (amber-100/amber-700), Low (gray-100/gray-600)
- Status dots: Open = amber dot, Resolved = green dot
- Row hover: bg-gray-50 dark:bg-gray-800/50
- No click behavior in v1
- Restaurant-focused mock data ("Sunrise Cafe"), 6-8 rows, mixed severities/statuses
- Worker names with last initial: "Maria G.", "James T.", etc.
- Empty state uses EmptyState component with ShieldAlert or similar icon

### Claude's Discretion
- Exact subtext wording for each KPI card
- Exact dark mode colors for segmented control active state
- Date format in table (relative vs absolute)
- Whether segmented control shows counts per segment
- Exact mock data values and descriptions
- Animation/transition on segment switch and filter change

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ALRT-01 | Alerts tab renders 4 KPI cards using MetricCard | MetricCard component exists and supports iconClassName; needs valueClassName addition for red High Priority value |
| ALRT-02 | Alerts table renders safety issues with columns for issue, worker, severity, status, date | shadcn Table component installed; Badge component available for severity; custom status dot pattern needed |
| ALRT-03 | Segmented control filters issues by status | Custom segmented control component needed (no shadcn equivalent); useState filter logic |
| ALRT-04 | showMockData prop toggles between populated table and EmptyState | EmptyState component ready; mock data array with computed KPI values pattern |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.3 | Component framework | Project standard |
| shadcn/ui (base-nova) | 4.0.6 | Table, Badge, Button primitives | Project standard -- uses @base-ui/react, NOT Radix |
| Tailwind CSS | 4.2.1 | Styling | Project standard -- v4, no config file, @theme inline |
| lucide-react | 0.577.0 | Icons (Clock, AlertTriangle, CheckCircle2, Wrench, RefreshCw, ShieldAlert) | Project standard -- only icon library allowed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| class-variance-authority | 0.7.1 | Badge variants | Already used by Badge component |
| tailwind-merge | 3.5.0 | Merging className strings | Via cn() utility |

### Alternatives Considered
None -- all tools are already installed and locked by CLAUDE.md.

## Architecture Patterns

### Component Structure
```
components/dashboard/alerts/
  AlertsTab.tsx        # Assembly component -- composes AlertMetrics + AlertsTable
  AlertMetrics.tsx     # 4 MetricCard instances in a grid, values computed from data
  AlertsTable.tsx      # Segmented control + Table + EmptyState, filter logic
```

### Pattern 1: Assembly Component (AlertsTab)
**What:** Top-level tab component that composes sub-components and passes showMockData down
**When to use:** Every tab follows this pattern (see AnalyticsTab)
**Example:**
```typescript
// Follows established AnalyticsTab pattern
interface AlertsTabProps {
  showMockData?: boolean
}

function AlertsTab({ showMockData = false }: AlertsTabProps) {
  return (
    <div className="space-y-6">
      <AlertMetrics alerts={showMockData ? MOCK_ALERTS : []} />
      <AlertsTable alerts={showMockData ? MOCK_ALERTS : []} />
    </div>
  )
}
```

### Pattern 2: Computed KPI Values from Data Array
**What:** KPI card values are derived from the mock data array via .filter().length, not hardcoded
**When to use:** When KPI cards summarize data shown elsewhere on the page
**Why:** Ensures consistency between KPIs and table; makes real API swap trivial
**Example:**
```typescript
const openCount = alerts.filter(a => a.status === 'open').length
const highCount = alerts.filter(a => a.severity === 'high').length
```

### Pattern 3: Custom Segmented Control
**What:** A pill-style toggle control for filtering, visually distinct from TabNav underline
**When to use:** Sub-page filtering where tabs would create confusion
**Key styling:**
```typescript
// Container
"inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1"
// Segment button
"rounded-md px-3 py-1.5 text-sm font-medium transition-all"
// Active segment
"bg-white dark:bg-gray-700 text-gray-900 dark:text-white [box-shadow:var(--card-shadow)]"
// Inactive segment
"text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
```

### Pattern 4: Severity Badge with Custom Colors
**What:** Badge component with className override for severity-specific colors
**When to use:** Severity indicators in tables
**Example:**
```typescript
// The base-nova Badge accepts className for color override
const SEVERITY_STYLES: Record<Severity, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}
// Usage: <Badge className={SEVERITY_STYLES[severity]}>{severity}</Badge>
```

### Pattern 5: Status Dot Indicator
**What:** Small colored circle + text label for status display
**When to use:** Status columns where a badge would be too heavy
**Example:**
```typescript
const STATUS_DOT_COLORS: Record<AlertStatus, string> = {
  open: 'bg-amber-400',
  resolved: 'bg-emerald-400',
}
// <span className={`inline-block h-2 w-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
```

### Anti-Patterns to Avoid
- **Hardcoded KPI values:** Never write `value={7}` -- compute from data array
- **Shadcn Card wrapper on dashboard cards:** Use raw `<div>` with exact card class string from CLAUDE.md
- **Brand colors on any buttons:** All buttons in this tab are ghost (refresh) or part of the segmented control
- **TabNav-style underline for segmented control:** Must be pill/toggle style to avoid visual confusion with the actual TabNav above

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Table structure | Custom divs/grids | shadcn Table components | Semantic HTML, accessibility, consistent styling |
| Badge pills | Custom spans with manual styling | shadcn Badge + className override | Consistent sizing, font, padding |
| Refresh button | Custom icon wrapper | shadcn Button variant="ghost" | Consistent focus/hover states |
| Empty state | Bare icon + text | EmptyState component | Project-wide consistency mandate |
| KPI cards | Custom card divs | MetricCard component | Already built and proven |

**Key insight:** This phase has zero new UI primitives to build. The segmented control is the only net-new visual element, and it's simple enough (3 buttons in a container) that a custom implementation is cleaner than importing a library.

## Common Pitfalls

### Pitfall 1: MetricCard Value Color Override
**What goes wrong:** The CONTEXT requires High Priority card value text in red-500, but MetricCard hardcodes `text-gray-900 dark:text-white` on the value.
**Why it happens:** MetricCard was designed for the Analytics tab where all values are neutral-colored.
**How to avoid:** Add an optional `valueClassName` prop to MetricCard that overrides the default value text color. This is a minimal, backward-compatible change.
**Warning signs:** If High Priority card shows a gray number instead of red, this prop is missing.

### Pitfall 2: Badge className Override with base-nova
**What goes wrong:** The Badge component uses `useRender` from @base-ui/react with `cn()` merging. Custom background/text colors must fully override the default variant styles.
**Why it happens:** The default Badge variant applies `bg-primary text-primary-foreground` -- custom severity colors need to completely replace these.
**How to avoid:** Pass severity badges WITHOUT a variant prop (or use variant="secondary" as a neutral base), then override with className. Alternatively, pass no variant and let className do all the work. Test that the custom colors actually win over the defaults.
**Warning signs:** Badges showing blue/primary color instead of red/amber/gray.

### Pitfall 3: Segmented Control Dark Mode
**What goes wrong:** Active segment looks invisible or too similar to container in dark mode.
**Why it happens:** Insufficient contrast between container (gray-800) and active segment.
**How to avoid:** Use `bg-gray-700` for active segment in dark mode + add `[box-shadow:var(--card-shadow)]` for depth separation. Test both modes visually.
**Warning signs:** Active segment indistinguishable from inactive in dark mode.

### Pitfall 4: Table Border Colors in Dark Mode
**What goes wrong:** shadcn Table uses `border-b` on rows which defaults to the theme's border color. In dark mode this may not match the card's border styling.
**Why it happens:** shadcn's default border colors may not align with the project's `--border-subtle` and `--border-default` CSS variables.
**How to avoid:** Check that TableRow borders are visible but subtle in dark mode. Override with `border-gray-800 dark:border-gray-700` if needed.
**Warning signs:** Table row borders invisible in dark mode, or too harsh in light mode.

### Pitfall 5: Subtext Rendering in MetricCard
**What goes wrong:** MetricCard only renders `subtext` when `previousValue` is NOT provided (see line 84 conditional). If both are passed, subtext is hidden.
**Why it happens:** MetricCard was designed with mutually exclusive display modes: either previousValue or subtext.
**How to avoid:** For this phase, use ONLY `subtext` prop (no `previousValue`). The CONTEXT confirms no trend indicators are needed.
**Warning signs:** Missing subtext under KPI values.

## Code Examples

### Mock Data Type Definition
```typescript
type Severity = 'high' | 'medium' | 'low'
type AlertStatus = 'open' | 'resolved'

interface AlertItem {
  id: string
  issue: string
  worker: string
  severity: Severity
  status: AlertStatus
  date: string  // ISO date string for sorting/formatting
}

const MOCK_ALERTS: AlertItem[] = [
  {
    id: '1',
    issue: 'Walk-in cooler temperature above threshold',
    worker: 'Maria G.',
    severity: 'high',
    status: 'open',
    date: '2026-03-17T08:30:00Z',
  },
  // ... 6-8 total rows
]
```

### Page Integration Point
```typescript
// In app/dashboard/page.tsx, replace the EmptyState placeholder:
{activeTab === 'alerts' && <AlertsTab showMockData={true} />}
```

### Card Wrapper for Table Section
```typescript
// Table section wrapped in standard card anatomy
<div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5">
  <SectionHeader title="Issues" action={<Button variant="ghost" size="icon" ...><RefreshCw /></Button>} />
  {/* Segmented control */}
  {/* Table or EmptyState */}
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Radix UI primitives | @base-ui/react (base-nova) | shadcn v4 | Badge uses useRender + mergeProps, not Radix Slot |
| tailwind.config.ts | @theme inline in globals.css | Tailwind v4 | No config file; CSS variables for tokens |
| shadow-[var(...)] | [box-shadow:var(...)] | Tailwind v4 | Multi-value shadow vars break shorthand syntax |

**Deprecated/outdated:**
- shadcn `<Card>` component: Do NOT use for dashboard cards. Use raw div with exact class string.
- `asChild` prop: Replaced by `render={}` in base-nova shadcn style.

## Open Questions

1. **Badge variant override behavior**
   - What we know: Badge uses `cn()` to merge variant classes with custom className. The `cn()` uses `tailwind-merge` which should handle conflicting utility classes.
   - What's unclear: Whether `tailwind-merge` in Tailwind v4 correctly resolves `bg-primary` vs `bg-red-100` conflicts. May need to use a variant that doesn't set bg/text colors (like "outline" stripped) or pass no variant.
   - Recommendation: Test Badge with className override in the first implementation. If default variant colors bleed through, remove the variant prop entirely and rely solely on className.

2. **Date format preference**
   - What we know: Claude's discretion per CONTEXT.md. Relative ("2 hours ago") is more scannable for recent items; absolute ("Mar 15") is better for older items.
   - Recommendation: Use relative format for dates within 24 hours, absolute "Mar DD" format for older dates. This matches the morning-check-in use case where recent alerts need temporal urgency.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed -- no test runner in project |
| Config file | none -- see Wave 0 |
| Quick run command | `npx next build` (type-check + build verification) |
| Full suite command | `npx next build` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ALRT-01 | 4 KPI cards render with correct icons/values | manual-only | Visual inspection in browser | N/A |
| ALRT-02 | Table renders 5 columns with mock data | manual-only | Visual inspection in browser | N/A |
| ALRT-03 | Segmented control filters table rows | manual-only | Click test in browser | N/A |
| ALRT-04 | showMockData toggles populated vs empty state | manual-only | Toggle prop in code, visual check | N/A |

**Justification for manual-only:** This is a greenfield UI project with no test framework installed. All components are client-side React with static mock data. The build command (`next build`) provides TypeScript type-checking and compilation verification. Visual correctness (colors, layout, dark mode) requires browser inspection. Installing a test framework (Jest/Vitest + React Testing Library) is out of scope for this phase.

### Sampling Rate
- **Per task commit:** `npx next build` (catches type errors and import issues)
- **Per wave merge:** `npx next build` + manual browser check in light/dark mode
- **Phase gate:** Build passes + visual inspection of all 4 requirements in both modes

### Wave 0 Gaps
- No test framework installed -- would need Vitest + @testing-library/react for unit tests
- No test scripts in package.json
- Visual testing (Storybook, Chromatic) not in scope for v1

*(Test framework installation deferred -- current validation is build + visual inspection)*

## Sources

### Primary (HIGH confidence)
- Project codebase -- MetricCard.tsx, EmptyState.tsx, SectionHeader.tsx, Badge.tsx, Table.tsx (direct file reads)
- CLAUDE.md -- all design system rules, card anatomy, typography scale
- 04-CONTEXT.md -- locked decisions from user discussion

### Secondary (MEDIUM confidence)
- AnalyticsTab.tsx -- established assembly pattern for tab components

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed and proven in prior phases
- Architecture: HIGH - follows exact same patterns as AnalyticsTab (Phase 5, built ahead of schedule)
- Pitfalls: HIGH - identified from direct code inspection of existing components
- Segmented control: MEDIUM - custom component, but simple enough that implementation risk is low

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (stable -- all dependencies locked, no external API dependencies)
