# Phase 9: Polish and Verification - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Systematic quality audit across the entire dashboard — dark mode sweep, typography audit, responsive grid verification, showMockData validation, and card anatomy compliance check. No new features. The output is a demo-ready dashboard with zero known visual issues.

</domain>

<decisions>
## Implementation Decisions

### Dark mode audit
- Full file-by-file sweep of every component (~30 files in components/dashboard/)
- Strict CLAUDE.md token compliance — every fix must use exact CSS variables and Tailwind dark: classes from the design system
- Light mode page background stays warm cream (#f7f5f0) — intentional departure from CLAUDE.md's #f9fafb, already in globals.css
- Dedicated chart color audit — verify Recharts bars/lines/areas are visible against #1a1d27 card background, adjust chart-1 through chart-5 tokens if needed

### Typography audit
- Exact CLAUDE.md typography scale enforcement — no drift allowed
- Every text element must match the table: KPI values = `text-3xl font-bold text-gray-900 dark:text-white leading-none`, card labels = `text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide`, etc.
- Audit covers ALL components including extras beyond CLAUDE.md spec (Analytics tab has CategorySummary, AnswerSourcesChart, TopGapsTable, ResolutionChart, HealthScoreCard, QuestionsPerHourChart)
- Card anatomy check (DSN-01) bundled into the same pass — verify every card uses the exact CLAUDE.md class string, no shadcn `<Card>` usage

### File cleanup
- Audit untracked/unexpected files (ContentCards.tsx, StorageSidebar.tsx in ai-studio/)
- Check if imported/used — remove if orphaned, audit for compliance if used

### Responsive behavior
- Verify at: full desktop (1280px+), laptop (1024px), tablet (768px)
- Mobile (< 768px) is out of scope — web-first per CLAUDE.md
- Charts must resize gracefully via ResponsiveContainer — no horizontal scroll on chart containers
- TabNav: horizontal scroll on overflow at tablet width (overflow-x-auto)
- Tables (Alerts, Documents, Workers): horizontal scroll via overflow-x-auto container — all columns visible via scrolling, no column hiding
- Metric card grids: verify 4→2→1 column collapse at defined breakpoints

### showMockData validation
- Every tab tested with showMockData={true} (populated) AND showMockData={false} (empty states)
- Populated state: all mock data renders, no missing values, no broken layouts
- Empty state: EmptyState component used everywhere — no bare icon + text patterns (DSN-03)

### Demo readiness bar
- Zero visual issues — every component must pass dark mode, typography, responsive, and showMockData checks
- No known visual bugs left after this phase

### Deliverables
- Fix silently, commit per category (dark mode fixes, typography fixes, responsive fixes, cleanup)
- Git history serves as the audit trail — clear commit messages describing what was fixed
- Update CLAUDE.md Build State table to reflect final status of every component

### Claude's Discretion
- Order of audit (which tab/component to check first)
- Whether to batch small fixes or commit per file
- Exact responsive overflow handling on edge cases
- Whether chart token adjustments are needed (depends on actual contrast check)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/dashboard/shared/EmptyState.tsx`: Must be used by all empty states — audit confirms DSN-03
- `components/dashboard/shared/MetricCard.tsx`: Has `iconClassName`, `valueClassName`, `accentColor` props — audit confirms consistent usage
- `components/dashboard/shared/SectionHeader.tsx`: ReactNode action prop — audit confirms consistent usage
- `app/globals.css`: Depth system CSS variables (--page-bg, --card-bg, --card-shadow, --border-subtle, --border-default) + chart tokens (--chart-1 through --chart-5)

### Established Patterns
- `'use client'` on every dashboard component
- Named exports with named `Props` interfaces
- `[box-shadow:var(--card-shadow)]` for card shadows (not `shadow-[var(...)]`)
- `showMockData?: boolean` prop pattern (default false)
- Mock data as `SCREAMING_SNAKE` constants at top of files
- `useTheme()` with mounted guard for hydration safety

### Integration Points
- `app/dashboard/page.tsx`: All 5 tabs wired with `showMockData={true}` — need to verify toggle works
- All 5 tab directories: analytics/, alerts/, documents/, ai-studio/, workers/
- Extra analytics components: CategorySummary, AnswerSourcesChart, TopGapsTable, ResolutionChart, HealthScoreCard, QuestionsPerHourChart
- Untracked files: ai-studio/ContentCards.tsx, ai-studio/StorageSidebar.tsx — audit and clean up

</code_context>

<specifics>
## Specific Ideas

- The audit is a comprehensive, zero-tolerance pass — this is the last phase before the dashboard is demo-ready for YC/investor presentations
- Warm cream (#f7f5f0) light background is intentional and should NOT be "fixed" to #f9fafb
- Charts are a known risk area for dark mode — oklch tokens may look different than expected against #1a1d27
- The CLAUDE.md Build State table update serves as the project's final status record

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-polish-and-verification*
*Context gathered: 2026-03-18*
