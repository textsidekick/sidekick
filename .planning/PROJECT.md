# Sidekick Manager Dashboard

## What This Is

A complete redesign of the Sidekick manager dashboard — a greenfield Next.js build that gives frontline managers a single place to monitor team usage, track and resolve safety alerts, build the AI knowledge base, and manage worker onboarding. Sidekick is a YC Spring 2026 company building an AI-powered SMS assistant for frontline workers. The dashboard is the central hub where team leaders review what's happening with their team and act on it.

## Core Value

A frontline manager who opens this dashboard at 7am before a shift must instantly understand: are there any alerts, how is the team doing, and what needs attention today — with zero ambiguity.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Layout shell (TopBar, SubHeader, TabNav) fully functional with dark mode toggle and company selector
- [ ] Analytics tab: usage metrics, questions chart with time range selector, recent questions feed, activity feed
- [ ] Alerts tab: 4 KPI cards, filtered issues table with segmented control — **highest priority tab**
- [ ] Documents tab: drag-and-drop upload zone, 4 neutral integration cards (Google Drive, Dropbox, Gusto, Microsoft 365), documents table
- [ ] AI Studio tab: video walkthrough upload (max-w-2xl), knowledge gaps section with Analyze Gaps CTA
- [ ] Workers tab: JOIN code display with copy + QR modal, worker roster table with verified badge
- [ ] Full dark mode support across all components and tabs
- [ ] Shared components (EmptyState, MetricCard, SectionHeader) used consistently across all tabs
- [ ] All empty states use the EmptyState component with icon + title + description + action
- [ ] Mock data on all tables/lists via `showMockData` prop (default false)
- [ ] Demo-ready with mock data for YC / investor presentations

### Out of Scope

- Real API calls or backend integration — mock data only for v1
- URL routing for tab state — useState only
- Mobile-native or responsive breakpoints beyond the defined grid — web-first
- Authentication / login flow — dashboard only
- Real-time data or WebSocket connections

## Context

- **Existing UI:** Has good structural bones but is visually flat. Key issues: no depth (cards blend into background), weak typography hierarchy (labels and values look the same weight), integration buttons are loud and colorful, empty states are bare icon + one grey line.
- **Design system:** Fully locked in CLAUDE.md — depth system, typography scale, card anatomy, button rules, empty state spec, spacing, dark mode tokens. CLAUDE.md is the single source of truth.
- **Tech scaffold:** Already bootstrapped — Next.js 16.1.6 with App Router, Tailwind v4, shadcn/ui (12 components added), lucide-react, recharts, next-themes. Workflow 00 complete.
- **Primary user:** Frontline manager at small-mid business (restaurant, warehouse, retail). Non-technical. Opens once a day. Needs to instantly parse team health.
- **Screenshots:** Will be shared tab-by-tab during execution to fill any gaps CLAUDE.md doesn't cover.
- **Build destination:** Demo-ready (YC/investors) → internal team review → production handoff to engineering.

## Constraints

- **Tech stack:** Next.js App Router, Tailwind v4, shadcn/ui, Lucide React, Recharts — no substitutions
- **Architecture:** Locked in CLAUDE.md — do not deviate without explicit instruction
- **Dark mode:** Every component must work in both light and dark mode before it is considered done
- **Integration buttons:** ALWAYS `variant="outline"` with neutral border — never brand colors
- **Upload zones:** Single-column zones must be `max-w-2xl` — non-negotiable
- **Empty states:** Always use the shared `EmptyState` component — never bare icon + text
- **TypeScript:** No `any` — define types or use `unknown` and narrow

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Alerts tab is first priority | Safety issues are what wake a manager up at night — highest business value | — Pending |
| Mock data via `showMockData` prop | Enables demo mode without API — makes real data swap-in a one-liner | — Pending |
| Tailwind v4 CSS-based config | Project scaffolded with v4 — no tailwind.config.ts, all tokens in globals.css | — Pending |
| shadcn/ui for all primitives | Consistency guarantee — never build button/dialog/badge from scratch | — Pending |
| Tab state via useState | No URL routing yet — keeps the build simple for demo phase | — Pending |

---
*Last updated: 2026-03-13 after initialization*
