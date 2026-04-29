# Phase 4: Alerts Tab - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the highest-priority tab: 4 KPI summary cards showing alert counts, a filterable issues table with severity and status columns, and a segmented status control. This is the first thing a manager sees at 7am — clarity and scannability are paramount. The tab accepts `showMockData?: boolean` to toggle between populated and empty states.

</domain>

<decisions>
## Implementation Decisions

### KPI card definitions
- Four cards in order: Open Issues, High Priority, Resolved, Total Reported (screenshot set, not roadmap set)
- Colored icon accents via MetricCard's `iconClassName` prop:
  - Open Issues: Clock icon in amber-500
  - High Priority: AlertTriangle icon in red-500
  - Resolved: CheckCircle2 icon in emerald-500
  - Total Reported: Wrench icon in blue-500
- High Priority card: value text also in red-500 (not default gray-900) — draws immediate attention
- No trend indicators (+/-% badges) — just value + subtext (e.g., "2 this week"). Absolute numbers matter more than deltas for safety.
- KPI values are computed from the mock data array, not hardcoded — changing mock data auto-updates KPIs

### Segmented control & filtering
- 3 segments: Open / Resolved / All (matches screenshot, simpler than 4-segment roadmap version)
- Default selected: Open — manager sees actionable issues first
- Pill/toggle style: rounded segments with gray-100 background container, active segment gets white fill + shadow. Visually distinct from TabNav's underline
- Dark mode: container bg-gray-800, active segment bg-gray-700 or similar elevated surface

### Table section layout
- SectionHeader component with title "Issues" and ghost refresh icon button as action prop
- Segmented control sits below the SectionHeader, above the table
- shadcn Table component (Table/TableHeader/TableBody/TableRow/TableCell) — semantic HTML, reusable pattern for Workers and Documents tabs

### Table row design
- Columns: Issue (primary text), Worker (secondary text), Severity (badge), Status (dot + text), Date (secondary text)
- Severity: colored badge pills using shadcn Badge — High (red-100/red-700, dark: red-950/red-400), Medium (amber-100/amber-700), Low (gray-100/gray-600)
- Status: small colored dot + text — Open (amber dot + gray text), Resolved (green dot + gray text)
- Row hover: subtle bg-gray-50 dark:bg-gray-800/50 highlight
- No click behavior in v1 — detail drawers are v2 (v2-01 requirement)

### Mock data shape
- Restaurant-focused alerts matching "Sunrise Cafe" demo company from Phase 3
- Alert types: walk-in cooler temp violation, wet floor hazard, expired ingredients, minor burn injury, equipment malfunction, missing safety signage
- 6-8 rows with a good mix: ~3 Open (1 High, 1 Medium, 1 Low), ~1 In Progress (groups with Open in filter), ~4 Resolved (various severities)
- Real-sounding worker names with last initial only: "Maria G.", "James T.", "Carlos R.", "Sarah K."
- Dates spread across recent days for realism

### Empty state (showMockData={false})
- Use shared EmptyState component inside the table card
- Appropriate icon (ShieldAlert or similar), title, description explaining what will appear when alerts exist

### Claude's Discretion
- Exact subtext wording for each KPI card (e.g., "2 this week", "0 this week")
- Exact dark mode colors for the segmented control active state
- Date format in the table (relative like "2 hours ago" vs absolute like "Mar 15")
- Whether the segmented control should show counts per segment (e.g., "Open (3)")
- Exact mock data values and descriptions
- Animation/transition on segment switch and filter change

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/dashboard/shared/MetricCard.tsx`: Ready to use — supports `iconClassName` for colored accents, `subtext` for secondary info. Does NOT need trend badges for this phase.
- `components/dashboard/shared/EmptyState.tsx`: Ready for empty table state — icon container + title + description + optional action button
- `components/dashboard/shared/SectionHeader.tsx`: Ready for table section header — title + ReactNode action prop (for refresh button)
- `components/ui/table.tsx`: shadcn Table component installed
- `components/ui/badge.tsx`: shadcn Badge component installed — use for severity pills
- `components/ui/button.tsx`: shadcn Button for refresh ghost button

### Established Patterns
- `'use client'` on every dashboard component
- Named exports with named `Props` interfaces
- `[box-shadow:var(--card-shadow)]` for card shadows
- `showMockData?: boolean` prop pattern (default false)
- Mock data as `SCREAMING_SNAKE` constants at top of component files
- MetricCard grid: `grid grid-cols-4 gap-4` → responsive breakpoints

### Integration Points
- `app/dashboard/page.tsx`: TabNav passes `activeTab` state — when "alerts" is active, render `<AlertsTab showMockData={true} />`
- `components/dashboard/alerts/`: Directory does not exist yet — needs creation for AlertsTab.tsx, AlertMetrics.tsx, AlertsTable.tsx
- Tab placeholder: Currently renders EmptyState "Coming Soon" — will be replaced by AlertsTab component

</code_context>

<specifics>
## Specific Ideas

- The segmented control must be visually distinct from TabNav — pill/toggle style vs underline. Two underline-style controls on the same page would cause visual confusion.
- KPI values computed from mock data (not hardcoded) sets the right pattern for when real API data replaces mocks — swap is a one-liner per CLAUDE.md mandate.
- Restaurant-focused mock data ("Sunrise Cafe") creates a cohesive demo story across the entire dashboard.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-alerts-tab*
*Context gathered: 2026-03-17*
