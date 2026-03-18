# Phase 9: Polish and Verification - Research

**Researched:** 2026-03-18
**Domain:** Visual quality audit (dark mode, typography, responsive, design system compliance)
**Confidence:** HIGH

## Summary

Phase 9 is a systematic quality audit across 32 existing dashboard component files. No new features are built -- the goal is zero visual defects across dark mode, typography scale, responsive behavior, empty state compliance, and card anatomy. The phase touches every file in `components/dashboard/` but changes are corrective, not structural.

The codebase is in strong shape. A preliminary scan reveals: no `shadow-[var(...)]` misuse (all use correct `[box-shadow:var(...)]`), no shadcn `<Card>` imports, no TypeScript `any` usage, and EmptyState is used in 5 components. Key issues to fix: StorageSidebar has a bare empty state (not using EmptyState), ContentCards grid lacks responsive breakpoints, three table components lack `overflow-x-auto`, and TabNav needs overflow handling at tablet widths. Chart colors are handled via isDark conditionals and should be visually verified against the dark card background.

**Primary recommendation:** Organize the audit as category-based sweeps (dark mode pass, typography pass, responsive pass, cleanup pass) rather than file-by-file, committing fixes per category for clean git history.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Full file-by-file sweep of every component (~30 files in components/dashboard/)
- Strict CLAUDE.md token compliance -- every fix must use exact CSS variables and Tailwind dark: classes from the design system
- Light mode page background stays warm cream (#f7f5f0) -- intentional departure from CLAUDE.md's #f9fafb, already in globals.css
- Dedicated chart color audit -- verify Recharts bars/lines/areas are visible against #1a1d27 card background, adjust chart-1 through chart-5 tokens if needed
- Exact CLAUDE.md typography scale enforcement -- no drift allowed
- Every text element must match the table: KPI values = `text-3xl font-bold text-gray-900 dark:text-white leading-none`, card labels = `text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide`, etc.
- Audit covers ALL components including extras beyond CLAUDE.md spec (ContentCards, StorageSidebar, plus extra analytics components)
- Card anatomy check (DSN-01) bundled into same pass -- verify every card uses exact CLAUDE.md class string, no shadcn Card usage
- Audit untracked/unexpected files (ContentCards.tsx, StorageSidebar.tsx in ai-studio/) -- check if imported/used, remove if orphaned, audit for compliance if used
- Verify at: full desktop (1280px+), laptop (1024px), tablet (768px) -- mobile (< 768px) is out of scope
- Charts must resize gracefully via ResponsiveContainer -- no horizontal scroll on chart containers
- TabNav: horizontal scroll on overflow at tablet width (overflow-x-auto)
- Tables: horizontal scroll via overflow-x-auto container -- all columns visible via scrolling, no column hiding
- Metric card grids: verify 4->2->1 column collapse at defined breakpoints
- Every tab tested with showMockData={true} (populated) AND showMockData={false} (empty states)
- Populated state: all mock data renders, no missing values, no broken layouts
- Empty state: EmptyState component used everywhere -- no bare icon + text patterns (DSN-03)
- Zero visual issues -- every component must pass all checks
- Fix silently, commit per category (dark mode fixes, typography fixes, responsive fixes, cleanup)
- Git history serves as the audit trail -- clear commit messages describing what was fixed
- Update CLAUDE.md Build State table to reflect final status of every component

### Claude's Discretion
- Order of audit (which tab/component to check first)
- Whether to batch small fixes or commit per file
- Exact responsive overflow handling on edge cases
- Whether chart token adjustments are needed (depends on actual contrast check)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DARK-01 | Every component renders correctly in light mode (page bg #f7f5f0, card bg #ffffff) | Light mode audit checklist; warm cream background intentionally kept; CSS variables verified in globals.css |
| DARK-02 | Every component renders correctly in dark mode (page bg #0f1117, card bg #1a1d27) | Dark mode sweep across all 32 files; chart colors need contrast verification against #1a1d27; depth system variables confirmed |
| DARK-04 | No text element is unreadable or invisible in either mode | Typography audit with dark: class verification on every text element; known pattern is `text-gray-900 dark:text-white` for primary, `text-gray-500 dark:text-gray-400` for secondary |
| DSN-03 | All empty states use the shared EmptyState component -- never bare icon + text | EmptyState currently used in 5 components; StorageSidebar has a bare empty state that must be fixed; all showMockData={false} paths must be verified |
</phase_requirements>

## Standard Stack

### Core
No new libraries needed. This phase uses the existing stack exclusively.

| Library | Version | Purpose | Relevant to Audit |
|---------|---------|---------|-------------------|
| Next.js | 16.1.6 | Framework | App Router, `'use client'` on all components |
| React | 19.2.3 | UI library | Hooks, event handlers |
| Tailwind CSS | 4.2.1 | Styling | `@theme inline`, `@custom-variant dark`, arbitrary properties |
| next-themes | 0.4.6 | Dark mode | `useTheme()` + mounted guard pattern |
| Recharts | 3.8.0 | Charts | `ResponsiveContainer`, dark mode color switching |
| lucide-react | 0.577.0 | Icons | Verify no other icon libs crept in |

### Installation
No new packages needed.

## Architecture Patterns

### Audit Scope -- All 32 Files

```
components/dashboard/
├── layout/          (3 files: TopBar, SubHeader, TabNav)
├── shared/          (3 files: EmptyState, MetricCard, SectionHeader)
├── analytics/       (8 files: AnalyticsTab, QuestionsChart, QuestionsPerHourChart,
│                     FeedCard, CategorySummary, AnswerSourcesChart,
│                     HealthScoreCard, TopGapsTable, ResolutionChart)
├── alerts/          (4 files: AlertsTab, AlertMetrics, AlertsTable, AlertCharts)
├── documents/       (4 files: DocumentsTab, UploadZone, IntegrationsRow, DocumentsTable)
├── ai-studio/       (5 files: AIStudioTab, VideoUpload, KnowledgeGaps,
│                     ContentCards*, StorageSidebar*)
└── workers/         (4 files: WorkersTab, RegistrationCard, QRCodeModal, WorkersTable)
```
*ContentCards and StorageSidebar are NOT orphaned -- they are imported by AIStudioTab.

### Pattern 1: Category-Based Sweep Order

**What:** Audit in themed passes rather than file-by-file
**Why:** Consistent mental model per pass; cleaner commits; easier to catch drift

Recommended order:
1. **File cleanup** -- Verify ContentCards.tsx and StorageSidebar.tsx are used (they are). Audit them for compliance.
2. **Dark mode sweep** -- Every file checked for dark: class coverage on all visual elements
3. **Typography audit + card anatomy** -- Every text element matched against CLAUDE.md scale; every card div matched against card class string
4. **Responsive verification** -- Grid breakpoints, overflow-x-auto on tables/TabNav, chart container resilience
5. **showMockData validation** -- Toggle both states per tab, verify populated + empty rendering
6. **CLAUDE.md Build State update** -- Mark all components as complete

### Pattern 2: The Card Anatomy Class String
Every card MUST use exactly:
```
rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5
```
Hover-interactive cards add:
```
hover:[box-shadow:var(--card-shadow-hover)] transition-shadow duration-150 cursor-pointer
```

### Pattern 3: Typography Scale Reference
| Element | Exact Tailwind Classes |
|---------|----------------------|
| Card section labels | `text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide` |
| KPI values | `text-3xl font-bold text-gray-900 dark:text-white leading-none` |
| Section headings | `text-base font-semibold text-gray-900 dark:text-white` |
| Body text | `text-sm text-gray-500 dark:text-gray-400 leading-relaxed` |
| Table cell primary | `text-sm font-medium text-gray-900 dark:text-white` |
| Table cell secondary | `text-sm text-gray-500 dark:text-gray-400` |
| Monospace JOIN code | `font-mono text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-wider` |
| Muted helper text | `text-xs text-gray-400 dark:text-gray-500` |

### Anti-Patterns to Avoid
- **Fixing warm cream to #f9fafb:** The light background is intentionally #f7f5f0. Do NOT "correct" it.
- **Adding shadcn Card imports:** Use raw divs with the card class string. Never introduce `<Card>`.
- **Using `shadow-[var(--card-shadow)]`:** Must be `[box-shadow:var(--card-shadow)]` (Tailwind v4 arbitrary CSS property syntax).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Empty states | Bare icon + text inline | `EmptyState` component | Consistency (DSN-03), all 4 elements required |
| Card containers | shadcn `<Card>` or custom wrapper | Raw div + exact class string | CLAUDE.md mandate (DSN-01) |
| Dark mode toggling | Manual className conditionals for bg | CSS variables + Tailwind `dark:` prefix | Already wired via next-themes class strategy |

## Common Pitfalls

### Pitfall 1: StorageSidebar Bare Empty State
**What goes wrong:** StorageSidebar line 147-150 renders "No recent activity" as a bare `<p>` tag, violating DSN-03.
**How to fix:** Replace with EmptyState component. Add import and render with icon, title, description.
**Confidence:** HIGH -- verified by reading the file.

### Pitfall 2: ContentCards Non-Responsive Grid
**What goes wrong:** ContentCards.tsx uses `grid grid-cols-3 gap-4` with no responsive breakpoints. At tablet width (768px), three columns will be cramped.
**How to fix:** Change to `grid grid-cols-1 sm:grid-cols-3 gap-4` or `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`.
**Confidence:** HIGH -- verified by reading the file.

### Pitfall 3: Tables Missing overflow-x-auto
**What goes wrong:** AlertsTable, DocumentsTable, and WorkersTable lack `overflow-x-auto` wrappers. At tablet width, wide tables may break layout.
**How to fix:** Wrap each `<Table>` in a `<div className="overflow-x-auto">`. TopGapsTable already has this pattern.
**Confidence:** HIGH -- verified by grep.

### Pitfall 4: TabNav Missing Overflow Handling
**What goes wrong:** TabNav has no `overflow-x-auto` on the tab container. At tablet width with 5 tabs + Invite Workers button, tabs may wrap or overflow.
**How to fix:** Add `overflow-x-auto` to the tab row container.
**Confidence:** HIGH -- verified by grep.

### Pitfall 5: Chart Colors Not Using CSS Variables
**What goes wrong:** Charts use hardcoded hex colors (#3b82f6, #6366f1, etc.) rather than var(--chart-*) tokens. This is functionally OK but inconsistent with the token system.
**Assessment:** Most chart components already handle dark mode via `isDark` conditionals with explicit dark colors. The blue-500 (#3b82f6) in AlertCharts is visible against both backgrounds. This is a LOW priority fix -- the current approach works.
**Confidence:** MEDIUM -- visual contrast needs browser verification.

### Pitfall 6: Hydration Mismatch on Theme-Dependent Rendering
**What goes wrong:** Components using `useTheme()` without a mounted guard cause hydration mismatch in SSR.
**Prevention:** Every component using `useTheme()` must have the `useState(false) + useEffect(() => setMounted(true))` guard. Verify during audit.
**Confidence:** HIGH -- established pattern in codebase.

## Code Examples

### EmptyState Fix for StorageSidebar
```typescript
// Current (WRONG -- bare text):
{activityData.length === 0 ? (
  <p className="text-sm text-gray-500 dark:text-gray-400">
    No recent activity
  </p>
) : ( ... )}

// Fixed (correct -- uses EmptyState):
import { EmptyState } from '../shared/EmptyState'
import { Clock } from 'lucide-react'
// ...
{activityData.length === 0 ? (
  <EmptyState
    icon={Clock}
    title="No recent activity"
    description="Activity from uploads, policy generation, and gap analysis will appear here"
  />
) : ( ... )}
```

### Table Overflow Wrapper
```typescript
// Add around every <Table> in AlertsTable, DocumentsTable, WorkersTable:
<div className="overflow-x-auto">
  <Table>
    {/* ... existing table content ... */}
  </Table>
</div>
```

### Responsive Grid Fix for ContentCards
```typescript
// Current:
<div className="grid grid-cols-3 gap-4">

// Fixed:
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
```

### TabNav Overflow
```typescript
// Add to the tab container div in TabNav:
className="overflow-x-auto"
```

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `shadow-[var(...)]` | `[box-shadow:var(...)]` | Tailwind v4 requires explicit CSS property syntax for multi-value shadows |
| Radix UI (shadcn) | base-nova / @base-ui/react | `render={}` prop replaces `asChild`; affects any shadcn component customization |
| tailwind.config.ts | `@theme inline` in globals.css | All tokens defined in CSS, not JS config |

## Known Issues Found During Research

| File | Issue | Category | Severity |
|------|-------|----------|----------|
| ai-studio/StorageSidebar.tsx:147-150 | Bare "No recent activity" text, not using EmptyState | DSN-03 | Must fix |
| ai-studio/ContentCards.tsx:50 | `grid-cols-3` with no responsive breakpoints | Responsive | Must fix |
| alerts/AlertsTable.tsx | No `overflow-x-auto` wrapper on Table | Responsive | Must fix |
| documents/DocumentsTable.tsx | No `overflow-x-auto` wrapper on Table | Responsive | Must fix |
| workers/WorkersTable.tsx | No `overflow-x-auto` wrapper on Table | Responsive | Must fix |
| layout/TabNav.tsx | No `overflow-x-auto` on tab container | Responsive | Must fix |
| alerts/AlertCharts.tsx:174 | Hardcoded `fill="#3b82f6"` without dark mode check | Dark mode | Low (blue-500 is visible on both backgrounds) |

## Open Questions

1. **Chart contrast on actual dark background**
   - What we know: Charts use isDark conditionals for most colors, AlertCharts has one hardcoded blue-500
   - What's unclear: Whether oklch chart tokens produce sufficient contrast against #1a1d27 in actual rendering
   - Recommendation: Visual browser check during implementation; fix only if contrast fails

2. **ContentCards and StorageSidebar compliance depth**
   - What we know: These files exist, are imported by AIStudioTab, and follow basic patterns
   - What's unclear: Whether they fully comply with all CLAUDE.md rules (they are "extras" not in the original spec)
   - Recommendation: Full audit during implementation -- treat them as first-class components

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed |
| Config file | none |
| Quick run command | `npx next build` (type check + build verification) |
| Full suite command | `npx next build && npx next start` (build + visual inspection) |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DARK-01 | Light mode renders correctly | manual | Visual inspection at localhost:3000 | N/A |
| DARK-02 | Dark mode renders correctly | manual | Visual inspection with dark class toggle | N/A |
| DARK-04 | No unreadable text in either mode | manual | Visual inspection both modes all tabs | N/A |
| DSN-03 | All empty states use EmptyState | smoke | `npx next build` (ensures no import errors) | N/A |

### Sampling Rate
- **Per task commit:** `npx next build` -- confirms no TypeScript or import errors
- **Per wave merge:** Visual inspection of all 5 tabs in both light and dark mode
- **Phase gate:** Full build succeeds + all tabs visually verified at 1280px, 1024px, and 768px widths in both modes

### Wave 0 Gaps
None -- this phase has no automated test requirements. Verification is visual inspection + successful build. The `npx next build` command serves as the smoke test for correctness.

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection of all 32 component files
- globals.css CSS variable definitions (depth system, chart tokens)
- CLAUDE.md design system specification (typography scale, card anatomy, button rules)
- package.json dependency versions

### Secondary (MEDIUM confidence)
- Tailwind v4 arbitrary property syntax (`[box-shadow:var(...)]`) -- verified working in codebase
- base-nova shadcn pattern (`render={}` prop) -- established in layout components

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, verified versions from package.json
- Architecture: HIGH -- audit scope and patterns directly derived from file inspection
- Pitfalls: HIGH -- all 7 issues verified by reading source files and grep results

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable -- no moving targets, all issues are in existing code)
