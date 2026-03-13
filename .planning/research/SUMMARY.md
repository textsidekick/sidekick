# Project Research Summary

**Project:** Sidekick Manager Dashboard
**Domain:** Multi-tab manager dashboard for frontline/deskless worker teams (restaurant, warehouse, retail)
**Researched:** 2026-03-13
**Confidence:** HIGH

## Executive Summary

The Sidekick Manager Dashboard is a control plane for frontline managers who use an AI-powered SMS assistant (Sidekick) to communicate with their deskless teams. The scaffold already has a fully working foundation: Next.js 16.1.6 with App Router, React 19, Tailwind v4 with CSS-based config, shadcn/ui using the non-standard `base-nova` style (which wraps `@base-ui/react` instead of Radix UI), Recharts 3.8, and next-themes. No new packages need to be installed. The architecture is well-defined in CLAUDE.md and is intentionally simple for a demo/YC-presentation phase: tab state lives in `useState`, data is mock-only, and every dashboard component is a client component.

The recommended approach is a strict bottom-up build order: shared components first (`SectionHeader`, `MetricCard`, `EmptyState`), then the layout shell (`TopBar`, `SubHeader`, `TabNav`), then tabs in business-priority order (Alerts first, then Analytics, Workers, Documents, AI Studio). The AI Studio tab — specifically the Knowledge Gap analysis — is the single strongest product differentiator for this market segment and must be treated as the flagship feature. The table stakes features (alerts, analytics, worker roster, document management) follow well-established patterns from competitors like Beekeeper and Connecteam.

The key risks cluster around three areas: Recharts SSR failures (charts must be client components with explicit parent heights), Tailwind v4 dark mode breakage (the `@custom-variant dark` declaration in globals.css must never be removed or reordered), and next-themes hydration mismatches (the `mounted` guard pattern is mandatory in any component that reads `useTheme()`). A secondary risk is the non-standard `base-nova` shadcn style — all AI-generated or tutorial-based code that uses `asChild` or Radix-style APIs will fail silently; the `render={}` prop pattern from `@base-ui/react` must be used instead.

---

## Key Findings

### Recommended Stack

The entire stack is already installed and correctly configured — no setup work is required. The critical non-obvious fact is that the scaffold uses `style: "base-nova"` in `components.json`, which makes shadcn components wrap `@base-ui/react` (from the MUI team) instead of the Radix UI primitives that all standard shadcn documentation describes. This changes dialog, tooltip, and interactive component APIs in significant ways. Tailwind v4's CSS-based configuration (no `tailwind.config.ts`) is in place and working; dark mode is driven by `@custom-variant dark (&:is(.dark *))` in globals.css, not by the v3 `darkMode: 'class'` config option. Card anatomy in CLAUDE.md conflicts with the installed shadcn `Card` component's defaults — dashboard cards must use raw `<div>` elements with the exact class string from CLAUDE.md, not `<Card>` from shadcn.

**Core technologies:**
- Next.js 16.1.6 (App Router): Routing and SSR shell — already installed, Tab state via `useState` (no URL params for demo phase)
- React 19.2.3: UI runtime — `forwardRef` deprecation warnings from shadcn components are cosmetic, not functional
- Tailwind v4 + `@tailwindcss/postcss`: Utility styling — CSS-first config, no `tailwind.config.ts`, arbitrary bracket syntax for depth system CSS variables
- shadcn base-nova + `@base-ui/react` 1.3.0: Headless component primitives — uses `render={}` prop, not `asChild`; `data-open:` not `data-[state=open]:`
- Recharts 3.8.0: Charts — requires `'use client'`, explicit parent height, CSS variables for stroke/fill (no Tailwind classes on SVG props)
- next-themes 0.4.6: Dark mode — already wired in layout.tsx; `suppressHydrationWarning` on `<html>` must never be removed
- lucide-react 0.577.0: Icons — use `LucideIcon` type, not `any`; icons inherit `currentColor` so no dark mode classes needed

### Expected Features

The frontline manager persona is the most important design constraint. This manager is on the floor most of the day, opens the dashboard once per shift under time pressure, and manages 10–50 workers accessible via SMS. The dashboard competes with a text message for attention. Every feature decision must answer: does this help the manager act faster, or does it add complexity they will ignore?

**Must have (table stakes):**
- Alerts tab: Alert count KPI, severity classification (3 tiers max), status management (open/resolved), filter by status, full alert text, worker attribution with timestamp
- Analytics tab: 4 KPI cards (questions, active users, response rate, messages sent), questions-over-time chart with time range selector (7d/30d/90d), recent questions feed, activity feed
- Documents tab: Drag-and-drop upload zone, uploaded documents list, delete with confirmation, 4 integration connectors (Google Drive, Dropbox, etc.) — integrations are table stakes, not differentiators, because managers' SOPs already live there
- Workers tab: JOIN code display (prominent, copyable), QR code modal for poster printing, worker roster with verified badge, worker count KPI
- AI Studio tab: Video upload zone, knowledge gap analysis section with "Analyze Gaps" CTA

**Should have (differentiators):**
- Comparison delta badges on every KPI card ("up 23% from last month") — low complexity, high perceived value
- Onboarding completion percentage on Workers tab
- Per-worker engagement summary (drill-down view)
- Resolution time tracking on Alerts KPI row
- Preview before upload in Documents

**Defer (v2+):**
- Per-worker question breakdown in Analytics (requires backend per-user event tracking)
- Document coverage scores and document-to-question mapping (requires AI analysis pass)
- AI-suggested response on alerts (requires incident pattern matching)
- Bulk CSV invite (only valuable at 20+ worker onboarding)
- Usage by shift/time of day heatmap
- Bulk resolve on alerts

**Anti-features (do not build):**
- Real-time WebSocket updates (refresh on tab load is sufficient)
- Complex filter/facet systems (segmented control + single search field is enough for 10–50 rows)
- Scheduling, payroll, or hours tracking (out of scope; competes with tools managers already use)
- Role-based permissions (SMB = one manager per location)
- Custom report builder or data export
- Dashboard chat interface (product is SMS; don't create a second communication channel)

### Architecture Approach

The architecture is intentionally minimal for the demo phase. `app/dashboard/page.tsx` owns `activeTab` state (defaulting to `'alerts'`) and conditionally renders tab assemblies. Each tab assembly owns its own mock data constants and passes typed props to leaf components. No global store, no Context for data, no cross-tab state. The `showMockData?: boolean` prop on assemblies is the single demo/production toggle — when real APIs arrive, only the assembly's data source changes, never the leaf components. All files in `components/dashboard/` are client components (`'use client'`). Dark mode is read exclusively via Tailwind `dark:` classes; only `TopBar` reads `useTheme()` directly.

**Component dependency levels (must build in order):**
1. Level 0 — Foundation: `globals.css` design tokens + 12 installed shadcn primitives (already done)
2. Level 1 — Shared: `SectionHeader`, `MetricCard`, `EmptyState` — these are blockers for all tab work
3. Level 2 — Layout shell: `TopBar`, `SubHeader`, `TabNav`, `DashboardPage` scaffold
4. Level 3 — Tab leaf components: `AlertMetrics`, `AlertsTable`, `QuestionsChart`, `FeedCard`, `UploadZone`, `IntegrationsRow`, `DocumentsTable`, `VideoUpload`, `KnowledgeGaps`, `RegistrationCard`, `QRCodeModal`, `WorkersTable`
5. Level 4 — Tab assemblies: `AlertsTab`, `AnalyticsTab`, `DocumentsTab`, `AIStudioTab`, `WorkersTab`

**Key architectural constraints (non-negotiable):**
- Card anatomy: raw `<div>` with CLAUDE.md class string — never the shadcn `<Card>` component for dashboard content
- Single-column upload zones: always wrapped in `max-w-2xl`
- Integration buttons: always `variant="outline"` with neutral border — no brand colors
- Mock data field names use snake_case to mirror future API response shape
- No `<form>` tags anywhere — use `onClick`/`onChange` handlers only

### Critical Pitfalls

1. **Recharts rendered in a Server Component** — Will crash at runtime with `window is not defined`. Every file importing from `recharts` must start with `'use client'`. The parent div of `ResponsiveContainer` must have an explicit `height` class (e.g., `h-64`), not `min-height` — without it the chart renders at 0px with no error.

2. **`useTheme()` without a mounted guard** — `useTheme()` returns `undefined` on first render during SSR/hydration. Any component that reads `theme` or `resolvedTheme` must gate rendering behind `const [mounted, setMounted] = useState(false)` + `useEffect(() => setMounted(true), [])` and return a skeleton if `!mounted`. Applies to `TopBar` (theme toggle) and `QuestionsChart` (chart colors). Missing this causes a hydration mismatch error or wrong icon state on first paint.

3. **Tailwind v4 dark mode misconfiguration** — `@custom-variant dark (&:is(.dark *))` in `globals.css` must never be removed, moved, or appear after the `:root` block is overridden by a shadcn reinstall. The CSS import order in `globals.css` is load-bearing: imports first, then `:root`/`.dark` overrides. Reordering causes shadcn defaults to win over the custom OKLCH depth system, making dark mode invisible or wrong.

4. **Using `bg-card` or `shadow-sm` instead of CLAUDE.md card anatomy** — `bg-card` (shadcn shorthand) and `bg-[var(--card-bg)]` (depth system) look identical in light mode but diverge in edge cases. More critically, `shadow-sm` uses Tailwind's built-in shadow scale, not the custom `--card-shadow` variable that changes per mode. The CLAUDE.md card anatomy class string is the single source of truth and must be used verbatim.

5. **`@base-ui/react` vs Radix UI API confusion** — The `base-nova` shadcn style wraps `@base-ui/react`, not Radix. Any code that uses `asChild`, `data-[state=open]:`, or other Radix-specific patterns will fail silently or produce wrong behavior. Use `render={}` prop instead of `asChild`, and `data-open:` / `data-checked:` custom variants (from `shadcn/tailwind.css`) instead of `data-[state=...]`.

---

## Implications for Roadmap

Based on research, the build should follow 9 phases. The architecture's dependency graph is definitive — shared components block all tab work. Business priority (Alerts first) governs tab ordering. The demo must be completable in a single focused session.

### Phase 1: Foundation Verification
**Rationale:** The scaffold exists but has never been exercised end-to-end as a dashboard. Verifying the existing wiring (ThemeProvider, dark mode toggle, depth system tokens) before building anything prevents discovering broken foundations at Phase 4.
**Delivers:** Confirmed working `app/dashboard/page.tsx` shell with `activeTab` state, confirmed dark mode toggle, confirmed design token application.
**Addresses:** Prerequisite for all phases.
**Avoids:** Pitfalls 2 and 3 (Tailwind v4 dark mode, next-themes hydration).

### Phase 2: Shared Components
**Rationale:** `EmptyState`, `MetricCard`, and `SectionHeader` are used by every tab. Building any tab component before these three are verified is guaranteed rework. This is the highest-leverage phase — getting these right once eliminates duplication in all 5 tabs.
**Delivers:** Three verified, dark-mode-complete shared components that serve as building blocks for Phases 3–8.
**Implements:** Level 1 of the component dependency graph.
**Avoids:** Anti-Pattern 1 (building tab components before shared components), Pitfall 4 (CSS variable collision on card shadows).

### Phase 3: Layout Shell
**Rationale:** The chrome (TopBar, SubHeader, TabNav) must exist before any tab content is meaningful — tabs can't be switched without TabNav, and the dark mode toggle lives in TopBar. Building this before tab content means every subsequent phase is tested inside the real layout.
**Delivers:** Fully navigable dashboard shell with working dark mode toggle and tab switching.
**Implements:** Level 2 of the component dependency graph.
**Avoids:** Pitfall 9 (`useTheme()` mounted guard required in TopBar).

### Phase 4: Alerts Tab
**Rationale:** Alerts is the highest-business-value tab — it's what a manager checks every morning. It's also the most legally critical feature (OSHA implications). Shipping this first means the product is demonstrable for its most important use case after Phase 4. A manager opening the dashboard should land here by default.
**Delivers:** `AlertMetrics` (4 KPI cards) + `AlertsTable` (filtered list with severity badges, resolve action) + `AlertsTab` assembly with mock data. Dashboard is demo-ready for the primary use case.
**Addresses:** All Alerts table stakes from FEATURES.md (alert count KPI, severity, status filter, resolve, worker attribution, timestamps).
**Avoids:** Pitfall 12 (no `<form>` tags on filter controls).

### Phase 5: Analytics Tab
**Rationale:** Analytics is the second most-viewed tab — managers review it when things are going well. `QuestionsChart` is the only Recharts component in the project and is the highest-risk component technically. Building it as a dedicated phase allows focused attention on the SSR and dark mode gotchas.
**Delivers:** 4 KPI metric cards + Recharts area/bar chart with time range selector + recent questions feed + activity feed.
**Addresses:** All Analytics table stakes from FEATURES.md plus comparison delta badges (differentiator, low complexity).
**Avoids:** Pitfall 1 (Recharts SSR crash), Pitfall 4 (ResponsiveContainer zero height), Pitfall 8 (dark mode chart colors), Pitfall 9 (mounted guard for theme colors).

### Phase 6: Workers Tab
**Rationale:** Workers is the operational prerequisite for everything else — a manager's first session is always Workers → Documents → wait → Analytics/Alerts. Building it early ensures the empty states in other tabs ("invite your team first") have a functional destination. QRCodeModal is the most complex UI interaction in this tab and must be built before RegistrationCard since it depends on it.
**Delivers:** JOIN code display + QR code modal + worker roster with verified badge + worker count KPI.
**Addresses:** All Workers table stakes from FEATURES.md plus onboarding completion percentage (differentiator, low complexity).
**Avoids:** Pitfall 7 (React 19 forwardRef warnings on Dialog — acceptable for demo phase).

### Phase 7: Documents Tab
**Rationale:** Documents is the knowledge base input layer — it must exist before AI Studio can show meaningful gaps. The integration connectors are table stakes (not differentiators) for this market segment. The critical constraint is neutral outline-only buttons on integration cards — brand colors here are the most visually damaging mistake in the redesign.
**Delivers:** Drag-and-drop upload zone + 4 integration connectors + uploaded documents list.
**Addresses:** All Documents table stakes from FEATURES.md.
**Avoids:** Anti-Pattern 2 (brand colors on integration buttons), Pitfall 15 (dark:invert on multicolor brand logos).

### Phase 8: AI Studio Tab
**Rationale:** AI Studio is the flagship differentiator — Knowledge Gap analysis is the feature that distinguishes Sidekick from every competitor in this market segment. It must ship in MVP. Building it last ensures the Documents tab (knowledge base input) is complete and the shared EmptyState component handles the empty-gaps state correctly.
**Delivers:** Video walkthrough upload zone (max-w-2xl constrained) + knowledge gap analysis section with "Analyze Gaps" CTA (amber button) + `AIStudioTab` assembly.
**Addresses:** AI Studio features from FEATURES.md. This is the single strongest differentiator to ship in MVP.
**Avoids:** Anti-Pattern 4 (full-width single-column upload zones).

### Phase 9: Polish and Verification
**Rationale:** A systematic pass catches accumulated technical debt and ensures the dashboard holds up under demo conditions (dark mode, wide monitors, tab navigation edge cases).
**Delivers:** Typography audit against CLAUDE.md scale, dark mode sweep across all components on `#0f1117` background, responsive grid collapse verification (`grid-cols-4` → `grid-cols-2` → `grid-cols-1` for metric cards), `showMockData={true}` verification on all table components.
**Avoids:** Pitfall 2 (dark mode silent failures), Pitfall 5 (CSS variable collision), Pitfall 13 (showMockData prop correctness), Pitfall 14 (Lucide icon size defaults).

### Phase Ordering Rationale

- **Dependency graph drives order:** Shared components (Phase 2) are non-negotiable prerequisites. Any deviation produces rework.
- **Business priority drives tab order:** Alerts (Phase 4) ships first because it has the highest operational urgency for managers. Analytics (Phase 5) second because it's reviewed most frequently. Workers (Phase 6) third because it has dependency implications for other tabs.
- **Risk concentration:** The only Recharts component (`QuestionsChart`) gets its own phase (Phase 5) with explicit pitfall mitigation. All known failure modes are documented and preventable.
- **Differentiator preserved:** AI Studio (Phase 8) ships in MVP despite being last in the build order. It is not deferred.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 5 (Analytics):** `QuestionsChart` has the highest technical risk surface — Recharts SSR, dark mode chart colors, mounted guard pattern. Recommend treating this as the "hardest" component even though the phase is short.
- **Phase 6 (Workers):** QR code generation library not yet identified — the project has no QR library installed. This needs a library decision (`qrcode.react` or similar) before Phase 6 starts.
- **Phase 7 (Documents):** The 4 integration connectors (Google Drive, Dropbox, etc.) require brand-accurate SVG logos in monochrome format to avoid the dark:invert anti-pattern. Logo assets are not yet sourced.

Phases with standard patterns (skip research-phase):
- **Phase 2 (Shared components):** `SectionHeader`, `MetricCard`, `EmptyState` are standard patterns with no external dependencies. Well-documented in CLAUDE.md.
- **Phase 3 (Layout shell):** TopBar, SubHeader, TabNav follow locked decisions from CLAUDE.md. No ambiguity.
- **Phase 4 (Alerts):** Table + filter segmented control + badge pattern is straightforward. Mock data types are specified in ARCHITECTURE.md.
- **Phase 9 (Polish):** Checklist-driven work, no research needed.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All packages inspected directly in the repo; versions confirmed; actual component source files read |
| Features | HIGH (table stakes) / MEDIUM (differentiators) | Table stakes grounded in mature market with consistent cross-platform patterns; AI-specific differentiator features are newer category without post-Aug 2025 competitive validation |
| Architecture | HIGH | Architecture is locked in CLAUDE.md; component dependency graph derived from direct inspection of installed components; no speculative decisions |
| Pitfalls | HIGH (critical) / MEDIUM (version-specific) | Critical pitfalls verified against actual installed files; Tailwind v4 and React 19 pitfalls are medium confidence due to training cutoff proximity |

**Overall confidence:** HIGH

### Gaps to Address

- **QR code library:** No QR generation library is installed. `qrcode.react` is the standard choice for React, but a library decision must be made before Phase 6 (Workers Tab). Validate it works with React 19 before adoption.
- **Integration SVG logos:** The Documents tab integration connectors need monochrome or dark-mode-safe brand logos for Google Drive, Dropbox, and two others. Source or create these assets before Phase 7.
- **Recharts custom tooltip typing:** The `TooltipProps<ValueType, NameType>` pattern is documented but noted as "finicky" — validate at implementation time, particularly for the `QuestionsChart` dark mode tooltip (Pitfall 8).
- **Competitive AI feature landscape post-Aug 2025:** The differentiator assessment assumes no competitor has shipped SMS-native AI knowledge base features since August 2025. Validate before making competitive claims in demos.
- **`showMockData` default behavior:** Teams should explicitly test both `showMockData={true}` (populated) and `showMockData={false}` (empty state) for every table component before marking it complete.

---

## Sources

### Primary (HIGH confidence)
- `/Users/arnavsinghal/DashboardSidekick/sidekick-dashboard/CLAUDE.md` — Architecture decisions, design system, component structure, anti-patterns
- `/Users/arnavsinghal/DashboardSidekick/sidekick-dashboard/.planning/PROJECT.md` — Requirements, constraints, key decisions
- `/Users/arnavsinghal/DashboardSidekick/sidekick-dashboard/app/globals.css` — Tailwind v4 CSS config, OKLCH variables, `@custom-variant dark`
- `/Users/arnavsinghal/DashboardSidekick/sidekick-dashboard/app/layout.tsx` — ThemeProvider, suppressHydrationWarning
- `/Users/arnavsinghal/DashboardSidekick/sidekick-dashboard/components.json` — Confirms `style: "base-nova"`
- `/Users/arnavsinghal/DashboardSidekick/sidekick-dashboard/components/ui/*.tsx` — All 12 installed shadcn components (base-nova / @base-ui/react)
- `/Users/arnavsinghal/DashboardSidekick/sidekick-dashboard/package.json` — Confirmed exact package versions
- `/Users/arnavsinghal/DashboardSidekick/sidekick-dashboard/node_modules/recharts/types/component/ResponsiveContainer.d.ts` — ResizeObserver dependency
- Tailwind CSS v4 Upgrade Guide — CSS-based config, `@custom-variant`, `@utility` patterns

### Secondary (MEDIUM confidence)
- Training knowledge: Beekeeper, Deputy, Homebase, 7shifts, Connecteam, WorkJam product feature sets (through August 2025) — features research
- Training knowledge: Recharts v2/v3 SSR failure modes — well-documented, frequently cited
- Training knowledge: next-themes `mounted` guard pattern — canonical solution from next-themes README
- Training knowledge: React 19 `forwardRef` deprecation — confirmed by React 19 release notes

### Tertiary (LOW confidence)
- Competitive AI feature claims post-August 2025 — needs validation before demo competitive positioning

---

*Research completed: 2026-03-13*
*Ready for roadmap: yes*
