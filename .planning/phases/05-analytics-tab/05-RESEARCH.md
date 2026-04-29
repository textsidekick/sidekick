# Phase 5: Analytics Tab - Research

**Researched:** 2026-03-17
**Domain:** Recharts charting, KPI cards, feed lists, showMockData prop pattern
**Confidence:** HIGH

## Summary

The Analytics tab is already substantially built. There are 8 components in `components/dashboard/analytics/` that were created during an earlier session (likely before GSD was initialized). The existing implementation is richer than the REQUIREMENTS.md spec -- it includes 5 rows of content (KPIs, QuestionsPerHour bar chart, 3-column insights row, 2-column deep charts, 2-column feeds) versus the requirements' simpler 3-section layout (KPIs, chart, feeds).

The primary work for Phase 5 is NOT building from scratch -- it is bringing the existing components into compliance with the requirements: adding the `showMockData` prop flow (ANLX-06), populating feed cards with mock data (ANLX-04, ANLX-05), and ensuring the KPI metrics and time ranges match what was specified. The existing Recharts patterns (ResponsiveContainer with explicit-height parent, mounted guard for theme, custom tooltips) are well-established and should be preserved.

**Primary recommendation:** Treat this as an enhancement/compliance pass on existing code, not a greenfield build. Add the `showMockData` prop to AnalyticsTab, wire mock data through all sub-components, and verify all 6 ANLX requirements are met.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ANLX-01 | Analytics tab renders 4 KPI metric cards (Total Questions, Active Workers, Avg Response Time, Resolution Rate) | PARTIALLY MET -- 4 KPI cards exist but with different labels (Questions Today, Answer Accuracy, Open Issues, Health Score). Need to decide: keep richer existing labels or align to requirement names. See Gap Analysis below. |
| ANLX-02 | QuestionsChart renders a Recharts bar/area chart with time range selector (7d / 30d / 90d) | PARTIALLY MET -- Two chart components exist: QuestionsPerHourChart (bar, hourly, 5 time ranges) and QuestionsChart (area, by category, 5 time ranges). Time ranges are 1D/1W/1M/3M/ALL, not 7d/30d/90d. |
| ANLX-03 | QuestionsChart uses ResponsiveContainer with explicit-height parent wrapper | MET -- Both chart components use `<div className="h-[240px]">` or `h-[280px]` wrapping `<ResponsiveContainer width="100%" height="100%">`. Pattern is correct. |
| ANLX-04 | Recent Questions feed card renders a list of latest worker questions | PARTIALLY MET -- FeedCard component exists with correct props interface, but AnalyticsTab passes `items={[]}` (empty array). Need mock question data. |
| ANLX-05 | Activity feed card renders recent team activity events | PARTIALLY MET -- Same as ANLX-04. FeedCard is used for Activity but with `items={[]}`. Need mock activity data. |
| ANLX-06 | Analytics tab accepts showMockData prop -- when true, all cards and chart populate with mock data | NOT MET -- AnalyticsTab has no `showMockData` prop. All data is currently hardcoded inline in each component. Need to add the prop and wire conditional rendering. |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| recharts | ^3.8.0 | All chart rendering (AreaChart, BarChart, PieChart) | Installed, working |
| lucide-react | ^0.577.0 | All icons (MessageSquare, Target, Activity, etc.) | Installed, working |
| next-themes | ^0.4.6 | Dark mode theme detection for chart colors | Installed, working |

### Supporting (Already Installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| @base-ui/react | ^1.3.0 | shadcn base-nova UI primitives | Installed |
| tailwind-merge | ^3.5.0 | Class merging utility | Installed |

**No new dependencies needed for Phase 5.**

## Architecture Patterns

### Existing Component Structure (Already Built)
```
components/dashboard/analytics/
├── AnalyticsTab.tsx           # Assembly component (needs showMockData prop)
├── QuestionsPerHourChart.tsx   # Bar chart, hourly data, 5 time ranges
├── QuestionsChart.tsx          # Area chart, by category, 5 time ranges
├── FeedCard.tsx                # Generic feed list (needs mock data)
├── HealthScoreCard.tsx         # Custom KPI with progress bar
├── CategorySummary.tsx         # Question categories list
├── AnswerSourcesChart.tsx      # Donut/pie chart with legend
├── TopGapsTable.tsx            # Unanswered topics table
└── ResolutionChart.tsx         # Stacked bar chart
```

### Pattern 1: showMockData Prop Flow (from AlertsTab)
**What:** Parent tab component accepts `showMockData?: boolean`, creates mock data conditionally, passes to children.
**Established in:** AlertsTab.tsx
**Example:**
```typescript
// AlertsTab pattern -- replicate for AnalyticsTab
interface AlertsTabProps {
  showMockData?: boolean
}

function AlertsTab({ showMockData = false }: AlertsTabProps) {
  const alerts = showMockData ? MOCK_ALERTS : []
  return (
    <div className="space-y-6">
      <AlertMetrics alerts={alerts} />
      <AlertCharts alerts={alerts} />
      <AlertsTable alerts={alerts} />
    </div>
  )
}
```

### Pattern 2: Recharts Dark Mode (Established)
**What:** Use `useTheme()` + mounted guard, switch colors based on `isDark`.
**Example (from QuestionsPerHourChart):**
```typescript
const { resolvedTheme } = useTheme()
const [mounted, setMounted] = useState(false)
useEffect(() => { setMounted(true) }, [])
const isDark = mounted && resolvedTheme === 'dark'

// Then use isDark for: stroke, fill, CartesianGrid stroke, XAxis/YAxis tick fill
```

### Pattern 3: Custom Tooltip (Established)
**What:** Custom tooltip component with card-like styling for dark mode support.
**Used in:** QuestionsChart, QuestionsPerHourChart, AnswerSourcesChart, ResolutionChart.

### Pattern 4: Card Anatomy (Established)
**What:** Every card uses the exact class string, never shadcn Card component.
```
rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5
```

### Anti-Patterns to Avoid
- **Duplicating MetricCard logic in HealthScoreCard:** HealthScoreCard is a specialized variant that doesn't use MetricCard. This is acceptable because it has a progress bar that MetricCard doesn't support. Do NOT try to refactor it into MetricCard.
- **Removing existing charts:** The existing tab is richer than the requirements. Do NOT remove CategorySummary, AnswerSourcesChart, TopGapsTable, or ResolutionChart just because requirements only mention "a chart." Keep the richer implementation.

## Gap Analysis: Existing Code vs Requirements

### Gap 1: AnalyticsTab lacks showMockData prop (ANLX-06)
**Current state:** AnalyticsTab has no props. All sub-components have inline hardcoded mock data.
**Required:** `showMockData?: boolean` prop that controls all data display.
**Approach options:**
- **Option A (Minimal):** Add `showMockData` to AnalyticsTab, pass to children. Each child either renders its hardcoded data or empty state. This is the AlertsTab pattern.
- **Option B (Full refactor):** Lift all mock data to AnalyticsTab, pass as props to children. This is cleaner but more invasive.
**Recommendation:** Option A -- minimal and consistent with AlertsTab pattern. Keep hardcoded data in children but add a `showMockData` prop that controls whether data renders or empty state shows.

### Gap 2: FeedCard has no mock data (ANLX-04, ANLX-05)
**Current state:** Both FeedCard instances in AnalyticsTab pass `items={[]}`.
**Required:** Realistic mock data for Recent Questions and Activity feeds.
**Fix:** Define `MOCK_RECENT_QUESTIONS` and `MOCK_ACTIVITY` arrays with `FeedItem[]` type, pass when `showMockData` is true.

### Gap 3: KPI card labels differ from requirements (ANLX-01)
**Current state:** Questions Today, Answer Accuracy, Open Issues, Health Score (with progress bar).
**Required:** Total Questions, Active Workers, Avg Response Time, Resolution Rate.
**Decision needed:** The current KPIs match the screenshot observations in MEMORY.md more closely. The requirement labels may have been written generically. The planner should decide whether to:
- Keep existing KPIs (they match screenshots and are more product-appropriate)
- Swap to requirement KPIs (strict compliance)
**Recommendation:** Keep existing KPIs since they match the actual product screenshots and are richer (HealthScoreCard with progress bar). The requirements used generic names; the implementation is an improvement.

### Gap 4: Time range options differ from requirements (ANLX-02)
**Current state:** QuestionsPerHourChart uses `1 day | 1 week | 1 month | 1 year | All Time`. QuestionsChart uses `1D | 1W | 1M | 3M | ALL`.
**Required:** `7d / 30d / 90d`
**Decision needed:** The current time ranges match the screenshots (5 options including daily/weekly/monthly/yearly/all). Requirements specified a simpler 3-option set.
**Recommendation:** Keep existing time ranges -- they are more feature-complete and match the product screenshots.

### Gap 5: Dashboard page.tsx doesn't pass showMockData to AnalyticsTab
**Current state:** `{activeTab === 'analytics' && <AnalyticsTab />}` -- no props passed.
**Fix:** Update to `<AnalyticsTab showMockData={true} />` to match AlertsTab pattern.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chart rendering | Custom SVG/Canvas charts | Recharts AreaChart/BarChart/PieChart | Already working, responsive, dark mode compatible |
| Tooltips | Browser title attributes | Recharts custom Tooltip component | Already styled for both light/dark modes |
| KPI display | Custom card divs per metric | MetricCard shared component | Already built with trend indicators, accent colors |
| Empty state | Bare icon + text | EmptyState shared component | CLAUDE.md mandates this |
| Feed lists | Custom list rendering | FeedCard component | Already built with empty state support |

## Common Pitfalls

### Pitfall 1: ResponsiveContainer Height Collapse
**What goes wrong:** Chart renders at 0px height because parent has no explicit height.
**Why it happens:** ResponsiveContainer needs a sized parent; `min-height` doesn't work.
**How to avoid:** Always wrap ResponsiveContainer in a div with explicit height class like `h-[240px]` or `h-[280px]`.
**Status:** Already handled correctly in all existing chart components.

### Pitfall 2: Hydration Mismatch with useTheme
**What goes wrong:** Server renders light theme, client detects dark, React hydration error.
**Why it happens:** useTheme() returns undefined on server.
**How to avoid:** Use mounted guard pattern: `const isDark = mounted && resolvedTheme === 'dark'`.
**Status:** Already handled correctly in all existing chart components.

### Pitfall 3: Recharts v3 Build Warnings
**What goes wrong:** Build output shows width(-1)/height(-1) warnings from Recharts.
**Why it happens:** During static page generation, container dimensions aren't available.
**How to avoid:** These are cosmetic warnings during SSG. They don't affect runtime. The charts render correctly in the browser.
**Status:** Already present in build output -- harmless.

### Pitfall 4: showMockData Default Value
**What goes wrong:** Components show empty state when developer expects data.
**Why it happens:** `showMockData` defaults to `false` per convention.
**How to avoid:** In dashboard page.tsx, explicitly pass `showMockData={true}` for demo/development. This is already done for AlertsTab.

### Pitfall 5: Tailwind v4 Shadow Syntax
**What goes wrong:** `shadow-[var(--card-shadow)]` breaks with multi-value CSS vars in Tailwind v4.
**Why it happens:** Tailwind v4 tries to decompose shadow utilities.
**How to avoid:** Use `[box-shadow:var(--card-shadow)]` explicit property syntax.
**Status:** All existing components already use the correct syntax.

## Code Examples

### Mock Data for Feed Cards (needed)
```typescript
// Source: FeedCard component interface + AlertsTab mock data pattern
const MOCK_RECENT_QUESTIONS: FeedItem[] = [
  {
    id: '1',
    text: 'How do I report a safety hazard in the warehouse?',
    timestamp: '2 min ago',
    category: 'Safety',
  },
  {
    id: '2',
    text: 'What is the overtime policy for weekends?',
    timestamp: '15 min ago',
    category: 'HR',
  },
  // ... 5-8 items total
]

const MOCK_ACTIVITY: FeedItem[] = [
  {
    id: '1',
    text: 'Maria Garcia uploaded "Safety Training Manual"',
    timestamp: '10 min ago',
  },
  {
    id: '2',
    text: 'New worker registered: James Wilson',
    timestamp: '1 hour ago',
  },
  // ... 5-8 items total
]
```

### showMockData Prop Pattern (to add to AnalyticsTab)
```typescript
// Source: AlertsTab.tsx established pattern
interface AnalyticsTabProps {
  showMockData?: boolean
}

function AnalyticsTab({ showMockData = false }: AnalyticsTabProps) {
  return (
    <div className="space-y-6">
      {/* KPI cards -- always show (data is hardcoded in MetricCard instances) */}
      {/* Charts -- always show (data is hardcoded in chart components) */}
      {/* Feeds -- conditional data */}
      <FeedCard items={showMockData ? MOCK_RECENT_QUESTIONS : []} ... />
      <FeedCard items={showMockData ? MOCK_ACTIVITY : []} ... />
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Recharts v2 API | Recharts v3 API | 2024-2025 | v3 is used in this project; API is mostly backward-compatible. Import paths unchanged. |
| shadow-[var(...)] | [box-shadow:var(...)] | Tailwind v4 | Must use explicit property syntax for multi-value shadows |
| Radix UI primitives | @base-ui/react primitives | shadcn base-nova | render={} prop replaces asChild |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None configured (no test framework installed) |
| Config file | None |
| Quick run command | `npx next build` (build check) |
| Full suite command | `npx next build` (build check) |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ANLX-01 | 4 KPI cards render with MetricCard | manual | Visual inspection in browser | N/A |
| ANLX-02 | QuestionsChart with time range selector | manual | Visual inspection -- click time ranges | N/A |
| ANLX-03 | ResponsiveContainer with explicit-height parent | manual | Dev tools inspect chart container height | N/A |
| ANLX-04 | Recent Questions feed with items | manual | Visual with showMockData={true} | N/A |
| ANLX-05 | Activity feed with items | manual | Visual with showMockData={true} | N/A |
| ANLX-06 | showMockData prop controls all data | manual | Toggle prop, verify empty vs populated | N/A |

### Sampling Rate
- **Per task commit:** `npx next build` (verifies no TypeScript/build errors)
- **Per wave merge:** Visual inspection in browser (both light and dark mode)
- **Phase gate:** Build passes + visual verification of all 6 requirements

### Wave 0 Gaps
No test framework is configured for this project. All validation is via build checks and manual visual inspection. This is appropriate for a greenfield UI project in demo phase.

## Open Questions

1. **KPI card labels: keep existing or align to requirements?**
   - What we know: Existing labels (Questions Today, Answer Accuracy, Open Issues, Health Score) match product screenshots. Requirement labels (Total Questions, Active Workers, Avg Response Time, Resolution Rate) are different.
   - What's unclear: Whether the requirement labels were intentionally different or just written generically before implementation.
   - Recommendation: Keep existing labels -- they are product-accurate and richer (HealthScoreCard has a progress bar). The planner should confirm this decision.

2. **Time range options: keep existing or change to 7d/30d/90d?**
   - What we know: Existing has 5 options matching screenshots. Requirements specify 3 options.
   - Recommendation: Keep existing 5 options -- they're more feature-complete.

3. **How deep should showMockData flow?**
   - What we know: Chart components (QuestionsChart, QuestionsPerHourChart, etc.) have hardcoded mock data. Adding showMockData to each would require significant refactoring.
   - Recommendation: For charts, always show data (they look odd empty). For feed cards, use showMockData to toggle. For KPI cards, always show values. This matches the AlertsTab approach where metrics always show but tables toggle.

## Sources

### Primary (HIGH confidence)
- Existing codebase: 8 analytics components already built and working
- AlertsTab.tsx: Established showMockData pattern
- package.json: recharts ^3.8.0, lucide-react ^0.577.0 confirmed
- Build output: `npx next build` passes successfully

### Secondary (MEDIUM confidence)
- CLAUDE.md: Design system rules, card anatomy, typography scale
- MEMORY.md: Screenshot observations for Analytics tab layout

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and working in existing components
- Architecture: HIGH -- patterns fully established in AlertsTab and existing analytics components
- Pitfalls: HIGH -- all major pitfalls already encountered and solved in existing code

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (stable -- no external dependencies to research)
