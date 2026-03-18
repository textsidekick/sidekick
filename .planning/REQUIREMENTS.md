# Requirements: Sidekick Manager Dashboard

**Defined:** 2026-03-13
**Core Value:** A frontline manager who opens this dashboard at 7am must instantly understand: are there any alerts, how is the team doing, and what needs attention today.

## v1 Requirements

### Foundation

- [x] **FOUND-01**: Design tokens and CSS variables are defined in globals.css — depth system (--page-bg, --card-bg, --card-shadow), dark mode tokens, and shadcn primary color override to blue *(already complete in workflow 00)*
- [x] **FOUND-02**: Layout shell renders with TopBar (logo, theme toggle, avatar dropdown), SubHeader (company selector), and TabNav (5 tabs + Invite Workers button)
- [x] **FOUND-03**: Tab navigation switches between Analytics, Alerts, Documents, AI Studio, and Workers tabs via useState (no URL routing)
- [ ] **FOUND-04**: Shared EmptyState component renders icon container + title + description + optional action button — used across all tabs
- [ ] **FOUND-05**: Shared MetricCard component renders KPI value + label + icon + optional subtext
- [ ] **FOUND-06**: Shared SectionHeader component renders card heading + optional action button

### Dark / Light Mode

- [ ] **DARK-01**: Every component renders correctly in light mode (page bg #f9fafb, card bg #ffffff)
- [ ] **DARK-02**: Every component renders correctly in dark mode (page bg #0f1117, card bg #1a1d27)
- [x] **DARK-03**: Theme toggle in TopBar switches between light, dark, and system modes
- [ ] **DARK-04**: No text element is unreadable or invisible in either mode

### Alerts Tab

- [x] **ALRT-01**: Alerts tab renders 4 KPI cards (Total Issues, Open, In Progress, Resolved) using MetricCard
- [x] **ALRT-02**: Alerts table renders a list of safety issues with columns for issue, worker, severity, status, and date
- [x] **ALRT-03**: Segmented control above the table filters issues by status (All / Open / In Progress / Resolved)
- [x] **ALRT-04**: Alerts tab accepts `showMockData?: boolean` prop — when true, table populates with realistic mock safety issues

### Analytics Tab

- [x] **ANLX-01**: Analytics tab renders 4 KPI metric cards (Total Questions, Active Workers, Avg Response Time, Resolution Rate)
- [x] **ANLX-02**: QuestionsChart renders a Recharts bar/area chart with time range selector (7d / 30d / 90d)
- [x] **ANLX-03**: QuestionsChart uses `ResponsiveContainer` with an explicit-height parent wrapper
- [x] **ANLX-04**: Recent Questions feed card renders a list of the latest worker questions
- [x] **ANLX-05**: Activity feed card renders recent team activity events
- [x] **ANLX-06**: Analytics tab accepts `showMockData?: boolean` prop — when true, all cards and chart populate with mock data

### Workers Tab

- [x] **WORK-01**: RegistrationCard displays the team JOIN code in monospace font with a copy-to-clipboard button
- [x] **WORK-02**: "Show QR Code" button opens a QRCodeModal dialog with a scannable QR code and download button
- [x] **WORK-03**: WorkersTable renders a list of workers with columns for name, phone number, join date, and status
- [x] **WORK-04**: Verified workers display a verified badge in the table
- [x] **WORK-05**: Workers tab accepts `showMockData?: boolean` prop — when true, table populates with realistic mock worker data

### Documents Tab

- [x] **DOCS-01**: UploadZone renders a drag-and-drop file upload area with dashed border, upload icon, helper text, and hover state
- [x] **DOCS-02**: IntegrationsRow renders 4 integration cards (Google Drive, Dropbox, Gusto, Microsoft 365) each with a neutral `variant="outline"` connect button — no brand colors
- [x] **DOCS-03**: DocumentsTable renders a list of uploaded documents with columns for name, type, size, and upload date
- [x] **DOCS-04**: Documents tab accepts `showMockData?: boolean` prop — when true, table populates with mock document data

### AI Studio Tab

- [x] **AIST-01**: VideoUpload renders a drag-and-drop video upload zone constrained to `max-w-2xl` (never full-width)
- [x] **AIST-02**: KnowledgeGaps section renders the gap analysis area with an "Analyze Gaps" CTA button using amber styling (`bg-amber-500`)
- [x] **AIST-03**: AI Studio tab accepts `showMockData?: boolean` prop — when true, knowledge gaps section populates with mock gap data

### Design System Compliance

- [ ] **DSN-01**: All cards use the exact card anatomy class string from CLAUDE.md (rounded-xl, border, bg-white dark:bg-[var(--card-bg)], shadow-[var(--card-shadow)], p-5) — never shadcn `<Card>` component
- [x] **DSN-02**: All integration connect buttons use `variant="outline"` with neutral border — never brand colors
- [ ] **DSN-03**: All empty states use the shared EmptyState component — never bare icon + text
- [x] **DSN-04**: Single-column upload zones are constrained with `max-w-2xl`
- [x] **DSN-05**: Active tab uses border-bottom underline indicator — never a filled pill
- [ ] **DSN-06**: All icons are from Lucide React — no other icon libraries

## v2 Requirements

### Interactivity

- **v2-01**: Alert rows are clickable and open a detail drawer with full issue context
- **v2-02**: UploadZone handles actual file input and shows upload progress
- **v2-03**: Integration connect buttons trigger an OAuth flow
- **v2-04**: Workers table has search and filter controls

### Data

- **v2-01**: All tabs connect to real API endpoints (prop names in mock data mirror backend field names)
- **v2-02**: Analytics chart supports custom date range picker beyond 7d/30d/90d

## Out of Scope

| Feature | Reason |
|---------|--------|
| Authentication / login | Dashboard only — no auth flow in v1 |
| URL routing for tabs | useState is sufficient for demo phase |
| Real API calls | Mock data only — real data swap is a one-liner after v1 |
| Mobile-native layout | Web-first; responsive grid handles tablet but not mobile-native |
| Role-based permissions | Single manager persona for v1 |
| Real-time WebSocket updates | Static mock data for demo |
| Custom report builder | Anti-feature for non-technical manager persona |
| Payroll/HR data from Gusto | Integration is document-source only, not HR data |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 3 | Complete |
| FOUND-03 | Phase 3 | Complete |
| FOUND-04 | Phase 2 | Pending |
| FOUND-05 | Phase 2 | Pending |
| FOUND-06 | Phase 2 | Pending |
| DARK-01 | Phase 9 | Pending |
| DARK-02 | Phase 9 | Pending |
| DARK-03 | Phase 3 | Complete |
| DARK-04 | Phase 9 | Pending |
| ALRT-01 | Phase 4 | Complete |
| ALRT-02 | Phase 4 | Complete |
| ALRT-03 | Phase 4 | Complete |
| ALRT-04 | Phase 4 | Complete |
| ANLX-01 | Phase 5 | Complete |
| ANLX-02 | Phase 5 | Complete |
| ANLX-03 | Phase 5 | Complete |
| ANLX-04 | Phase 5 | Complete |
| ANLX-05 | Phase 5 | Complete |
| ANLX-06 | Phase 5 | Complete |
| WORK-01 | Phase 6 | Complete |
| WORK-02 | Phase 6 | Complete |
| WORK-03 | Phase 6 | Complete |
| WORK-04 | Phase 6 | Complete |
| WORK-05 | Phase 6 | Complete |
| DOCS-01 | Phase 7 | Complete |
| DOCS-02 | Phase 7 | Complete |
| DOCS-03 | Phase 7 | Complete |
| DOCS-04 | Phase 7 | Complete |
| AIST-01 | Phase 8 | Complete |
| AIST-02 | Phase 8 | Complete |
| AIST-03 | Phase 8 | Complete |
| DSN-01 | Phase 2 (cross-cutting) | Pending |
| DSN-02 | Phase 7 (cross-cutting) | Complete |
| DSN-03 | Phase 9 (cross-cutting) | Pending |
| DSN-04 | Phase 7 (cross-cutting) | Complete |
| DSN-05 | Phase 3 | Complete |
| DSN-06 | Phase 2 (cross-cutting) | Pending |

**Coverage:**
- v1 requirements: 38 total
- Mapped to phases: 38
- Unmapped: 0

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 after roadmap creation*
