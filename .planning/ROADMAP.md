# Roadmap: Sidekick Manager Dashboard

## Overview

This roadmap delivers a demo-ready manager dashboard for Sidekick -- a greenfield Next.js build with 5 tabs (Alerts, Analytics, Workers, Documents, AI Studio), full dark mode, and mock data throughout. The build follows the component dependency graph strictly: foundation verification first, then shared components that all tabs depend on, then the layout shell, then tabs in business-priority order (Alerts first), and finally a polish pass. Every phase delivers a coherent, verifiable capability. Design system compliance (DSN-*) requirements are cross-cutting -- they apply during every phase but are assigned to the phase where they are first enforced or most critically validated.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation Verification** - Confirm scaffold wiring, design tokens, and dashboard page shell render correctly
- [ ] **Phase 2: Shared Components** - Build EmptyState, MetricCard, and SectionHeader -- the building blocks every tab depends on
- [x] **Phase 3: Layout Shell** - Build TopBar, SubHeader, and TabNav with working dark mode toggle and tab switching (completed 2026-03-18)
- [ ] **Phase 4: Alerts Tab** - Build the highest-priority tab: 4 KPI cards, filtered issues table, segmented status control
- [x] **Phase 5: Analytics Tab** - Build usage metrics, Recharts questions chart, recent questions feed, and activity feed (completed 2026-03-18)
- [ ] **Phase 6: Workers Tab** - Build JOIN code display, QR code modal, and worker roster with verified badges
- [ ] **Phase 7: Documents Tab** - Build drag-and-drop upload zone, 4 neutral integration connectors, and documents table
- [ ] **Phase 8: AI Studio Tab** - Build video upload zone and knowledge gaps section with Analyze Gaps CTA
- [ ] **Phase 9: Polish and Verification** - Dark mode sweep, typography audit, responsive grid verification, showMockData validation

## Phase Details

### Phase 1: Foundation Verification
**Goal**: The existing scaffold is confirmed working -- design tokens render, dark mode toggles, and the dashboard page shell exists as the mounting point for all future work
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01
**Success Criteria** (what must be TRUE):
  1. `app/dashboard/page.tsx` renders without errors and displays a visible page with the depth system background color (#f9fafb light, #0f1117 dark)
  2. CSS variables from globals.css (--page-bg, --card-bg, --card-shadow) are applied and inspectable in the browser
  3. A test div using the CLAUDE.md card anatomy class string (`rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] shadow-[var(--card-shadow)] p-5`) renders with visible depth separation from the page background in both light and dark mode
**Plans**: 1 plan

Plans:
- [x] 01-01-PLAN.md — Replace root redirect and create dashboard depth-system verification stub (COMPLETE 2026-03-16)

### Phase 2: Shared Components
**Goal**: The three shared building-block components (EmptyState, MetricCard, SectionHeader) are built, verified in both modes, and ready for use by all 5 tabs
**Depends on**: Phase 1
**Requirements**: FOUND-04, FOUND-05, FOUND-06, DSN-01, DSN-06
**Success Criteria** (what must be TRUE):
  1. EmptyState component renders all four required elements (48x48 icon container, bold title, description text, optional action button) and is visually correct in both light and dark mode
  2. MetricCard component renders a KPI value, label, icon, and optional subtext using the CLAUDE.md card anatomy class string (not the shadcn Card component) -- visually correct in both modes
  3. SectionHeader component renders a card heading with optional action button using the correct typography scale -- visually correct in both modes
  4. All three components use only Lucide React icons (no other icon library)
  5. All cards use raw divs with the exact CLAUDE.md class string -- the shadcn Card component is not imported anywhere in `components/dashboard/shared/`
**Plans**: 1 plan

Plans:
- [ ] 02-01-PLAN.md — Build EmptyState, MetricCard, SectionHeader components and visual showcase page

### Phase 3: Layout Shell
**Goal**: The dashboard has a fully navigable chrome -- TopBar with logo and dark mode toggle, SubHeader with company selector, and TabNav with 5 tabs -- and switching tabs works
**Depends on**: Phase 2
**Requirements**: FOUND-02, FOUND-03, DARK-03, DSN-05
**Success Criteria** (what must be TRUE):
  1. TopBar renders with logo, theme toggle (light/dark/system), home icon, and avatar dropdown -- theme toggle actually switches the page between light and dark mode
  2. SubHeader renders with tagline and a company selector dropdown
  3. TabNav renders 5 tabs (Analytics, Alerts, Documents, AI Studio, Workers) plus an "Invite Workers" button -- active tab uses a border-bottom underline indicator (not a filled pill)
  4. Clicking a tab in TabNav switches the visible content area via useState -- all 5 tabs are switchable
  5. The full layout shell (TopBar + SubHeader + TabNav) renders correctly in both light and dark mode with no invisible or unreadable elements
**Plans**: 2 plans

Plans:
- [ ] 03-01-PLAN.md — Build TopBar (logo, 3-state theme toggle, avatar dropdown) and SubHeader (tagline + company selector)
- [ ] 03-02-PLAN.md — Build TabNav (5 tabs, underline indicator, Invite Workers CTA) and rewire dashboard page for full tab switching

### Phase 4: Alerts Tab
**Goal**: A manager opening the dashboard sees the Alerts tab with 4 KPI summary cards and a filterable issues table -- the single highest-value view for morning check-ins
**Depends on**: Phase 3
**Requirements**: ALRT-01, ALRT-02, ALRT-03, ALRT-04
**Success Criteria** (what must be TRUE):
  1. Four KPI cards (Total Issues, Open, In Progress, Resolved) render in a row using the MetricCard component, each showing a numeric value, label, and icon
  2. Alerts table renders a list of safety issues with visible columns for issue description, worker name, severity, status, and date
  3. A segmented control above the table filters the visible rows by status (All / Open / In Progress / Resolved) -- clicking a segment immediately filters the table
  4. With `showMockData={true}`, the table populates with realistic mock safety issues (multiple severities, multiple statuses) and the KPI cards show corresponding counts; with `showMockData={false}`, the EmptyState component is displayed
  5. The entire Alerts tab (KPIs + table + filter) renders correctly in both light and dark mode
**Plans**: 2 plans

Plans:
- [ ] 04-01-PLAN.md — Add valueClassName to MetricCard and build AlertMetrics with 4 computed KPI cards
- [ ] 04-02-PLAN.md — Build AlertsTable with segmented control, wire AlertsTab assembly, and integrate into dashboard page

### Phase 5: Analytics Tab
**Goal**: A manager can review team usage at a glance -- 4 KPI cards, a questions-over-time chart with time range selection, recent questions, and an activity feed
**Depends on**: Phase 3
**Requirements**: ANLX-01, ANLX-02, ANLX-03, ANLX-04, ANLX-05, ANLX-06
**Success Criteria** (what must be TRUE):
  1. Four KPI metric cards (Total Questions, Active Workers, Avg Response Time, Resolution Rate) render using the MetricCard component with numeric values, labels, and icons
  2. QuestionsChart renders a Recharts bar or area chart that is visible (not 0px height) and has a working time range selector (7d / 30d / 90d) that changes the displayed data
  3. The chart parent has an explicit height and uses `ResponsiveContainer` -- the chart fills its container without collapsing
  4. Recent Questions feed card and Activity feed card each render a list of items with timestamps
  5. With `showMockData={true}`, all cards, chart, and feeds populate with realistic mock data; with `showMockData={false}`, empty states are shown where appropriate
  6. The entire Analytics tab renders correctly in both light and dark mode, including chart colors that are visible against the dark mode card background
**Plans**: 1 plan

Plans:
- [ ] 05-01-PLAN.md — Add showMockData prop to AnalyticsTab, populate feed cards with mock data, wire into dashboard page

### Phase 6: Workers Tab
**Goal**: A manager can see their team JOIN code, generate a QR code for it, and view the full worker roster with verification status
**Depends on**: Phase 3
**Requirements**: WORK-01, WORK-02, WORK-03, WORK-04, WORK-05
**Success Criteria** (what must be TRUE):
  1. RegistrationCard displays the team JOIN code in monospace font with a copy-to-clipboard button that copies the code when clicked
  2. "Show QR Code" button opens a modal dialog containing a scannable QR code and a download button
  3. WorkersTable renders a list of workers with columns for name, phone number, join date, and status
  4. Workers with verified status display a visible verified badge in the table
  5. With `showMockData={true}`, the table populates with realistic worker data (mix of verified and unverified); with `showMockData={false}`, the EmptyState component is displayed
**Plans**: 2 plans

Plans:
- [ ] 06-01-PLAN.md — Install qrcode.react, build RegistrationCard (JOIN code + copy) and QRCodeModal (QR display + download)
- [ ] 06-02-PLAN.md — Build WorkersTable (roster + verified badges), assemble WorkersTab, wire into dashboard page

### Phase 7: Documents Tab
**Goal**: A manager can see the document upload area, browse integration connectors with calm neutral buttons, and view uploaded documents
**Depends on**: Phase 3
**Requirements**: DOCS-01, DOCS-02, DOCS-03, DOCS-04, DSN-02, DSN-04
**Success Criteria** (what must be TRUE):
  1. UploadZone renders a drag-and-drop file upload area with dashed border, upload icon, helper text, and a visible hover state -- correctly styled in both light and dark mode
  2. IntegrationsRow renders 4 integration cards (Google Drive, Dropbox, Gusto, Microsoft 365) each with a `variant="outline"` connect button -- no brand-colored fills on any button
  3. DocumentsTable renders a list of documents with columns for name, type, size, and upload date
  4. With `showMockData={true}`, the documents table populates with mock document data; with `showMockData={false}`, the EmptyState component is displayed
  5. Single-column upload zones in the Documents tab respect layout constraints and all integration buttons are visually neutral (outline only, no blue/orange/purple fills)
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD
- [ ] 07-03: TBD

### Phase 8: AI Studio Tab
**Goal**: A manager can see the video walkthrough upload zone and knowledge gaps analysis section -- the flagship product differentiator
**Depends on**: Phase 3
**Requirements**: AIST-01, AIST-02, AIST-03
**Success Criteria** (what must be TRUE):
  1. VideoUpload renders a drag-and-drop video upload zone that is constrained to `max-w-2xl` (does not stretch full-width on wide monitors)
  2. KnowledgeGaps section renders the gap analysis area with an "Analyze Gaps" CTA button using amber styling (`bg-amber-500 hover:bg-amber-600 text-white`)
  3. With `showMockData={true}`, the knowledge gaps section populates with mock gap data; with `showMockData={false}`, the EmptyState component is displayed
  4. The entire AI Studio tab renders correctly in both light and dark mode
**Plans**: TBD

Plans:
- [ ] 08-01: TBD
- [ ] 08-02: TBD

### Phase 9: Polish and Verification
**Goal**: The complete dashboard passes a systematic quality audit -- dark mode is flawless, typography matches the CLAUDE.md scale, responsive grids collapse correctly, and all showMockData toggles work
**Depends on**: Phases 4, 5, 6, 7, 8
**Requirements**: DARK-01, DARK-02, DARK-04, DSN-03
**Success Criteria** (what must be TRUE):
  1. Every component renders correctly on the light mode page background (#f9fafb) with white card surfaces -- no washed-out or invisible elements
  2. Every component renders correctly on the dark mode page background (#0f1117) with #1a1d27 card surfaces -- no unreadable text, no invisible borders, no wrong-colored elements
  3. Every empty state across all 5 tabs uses the shared EmptyState component (icon container + title + description + optional action) -- no bare icon + text patterns remain
  4. Metric card grids collapse from 4 columns to 2 to 1 at the defined breakpoints (lg -> md -> sm)
  5. Running all 5 tabs with `showMockData={true}` and `showMockData={false}` produces correct populated and empty states respectively, with no missing data or broken layouts
**Plans**: TBD

Plans:
- [ ] 09-01: TBD
- [ ] 09-02: TBD
- [ ] 09-03: TBD

## Cross-Cutting Concerns

The following requirements apply continuously across all phases, not just the phase they are assigned to for traceability:

- **DSN-01** (Card anatomy): All cards must use the CLAUDE.md class string, never shadcn `<Card>`. Enforced starting Phase 2, validated in Phase 9.
- **DSN-03** (EmptyState usage): All empty states must use the shared EmptyState component. Enforced starting Phase 4, validated in Phase 9.
- **DSN-06** (Lucide icons only): No other icon libraries. Enforced from Phase 2 onward.
- **DARK-01/02/04** (Dark mode correctness): Every component must work in both modes. Built into each phase, systematically validated in Phase 9.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9
Note: Phases 4-8 depend on Phase 3 but are independent of each other. The recommended order is 4 -> 5 -> 6 -> 7 -> 8 (business priority), but they could theoretically be reordered.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation Verification | 1/1 | Complete | 2026-03-16 |
| 2. Shared Components | 0/1 | Planned | - |
| 3. Layout Shell | 2/2 | Complete   | 2026-03-18 |
| 4. Alerts Tab | 1/2 | In Progress|  |
| 5. Analytics Tab | 1/1 | Complete   | 2026-03-18 |
| 6. Workers Tab | 1/2 | In Progress | - |
| 7. Documents Tab | 0/3 | Not started | - |
| 8. AI Studio Tab | 0/2 | Not started | - |
| 9. Polish and Verification | 0/3 | Not started | - |
