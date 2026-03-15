# Sidekick Dashboard — Agent Instructions

You are redesigning the **Sidekick manager dashboard** — a greenfield Next.js + Tailwind CSS build based on screenshots of the existing UI. There is no existing codebase to reference. You build everything from scratch.

Sidekick is a YC Spring 2026 company. It is an AI-powered SMS assistant for frontline workers. The manager dashboard is the central hub where team leaders review analytics, manage safety alerts, upload training documents, and monitor worker onboarding.

> **Read this entire file at the start of every session before writing a single line of code. Update the Build State table at the end of every session.**

---

## The WAT Framework

This project operates inside the **WAT framework** (Workflows, Agents, Tools). The separation of concerns is what keeps the build reliable and maintainable.

**Layer 1: Workflows (The Instructions)**
- Markdown SOPs stored in `workflows/`
- Each workflow defines: objective, which components to build, design constraints, expected output, and how to handle edge cases
- Examples: `workflows/build_analytics_tab.md`, `workflows/build_shell.md`
- Written in plain language — the same way you'd brief a senior frontend engineer

**Layer 2: Agents (The Decision-Maker — Your Role)**
- You are responsible for intelligent orchestration across the dashboard modules
- Read the relevant workflow, execute in the correct sequence, handle failures gracefully, ask clarifying questions when inputs are ambiguous
- You connect design intent to code execution — you do not improvise on design decisions that are already locked
- Example: If you need to build the Documents tab, don't freestyle it. Read `workflows/build_documents_tab.md`, confirm the design constraints, then build `UploadZone` → `IntegrationsRow` → `DocumentsTable` in sequence

**Layer 3: Tools (The Execution)**
- React components in `components/dashboard/`
- shadcn/ui primitives as the base layer
- Tailwind CSS for styling
- These components are isolated, testable, and composable

**Why this matters for this project specifically:** The dashboard has 5 tabs, 15+ components, a shared design system, and both light and dark modes. If design decisions are made loosely per component, you get drift — slightly different shadows here, different empty state patterns there, integration buttons that are sometimes colored and sometimes neutral. By locking decisions in this file and executing against them consistently, the output is cohesive.

---

## Product Context

Hold this context at all times. Refer back to it when making any design or implementation decision.

**What the dashboard does:**
Gives frontline managers a single place to: monitor how their team uses Sidekick (Analytics) → track and resolve safety issues (Alerts) → build the AI knowledge base (Documents + AI Studio) → onboard and manage workers (Workers).

**The primary user:**
A frontline manager at a small-to-mid business (restaurant, warehouse, retail). They are not technical. They open this dashboard maybe once a day. They need to instantly understand what's happening with their team. Trust and clarity are the product.

**The design mandate:**
The existing UI has good structural bones but is visually flat and underdeveloped. The redesign must:
1. Create depth — subtle page background vs elevated white cards with shadow
2. Fix typography hierarchy — labels and values must look different, not the same weight
3. Neutralize the integration buttons — they are currently loud and colorful, they need to be calm and neutral
4. Elevate empty states — they are currently an icon + one grey line, they need to be helpful mini-onboarding moments
5. Constrain upload zones — they currently stretch uncomfortably wide on large monitors
6. Support full dark mode from day one

---

## Architecture — Never Deviate Without Asking

These decisions are locked. Do not refactor, replace, or work around them without explicit instruction.

**Framework & Routing**
- Next.js 15 with App Router
- Dashboard lives at `app/dashboard/page.tsx`
- Tab state is managed with `useState` in the page component — no URL routing for tabs yet
- All dashboard components are Client Components (`'use client'`) — they use hooks and event handlers

**Styling**
- Tailwind CSS exclusively — no CSS modules, no styled-components, no inline style objects except for CSS variable references
- shadcn/ui for all UI primitives — never build a button, dialog, badge, or table from scratch
- Lucide React for all icons — never mix in Heroicons, Feather, or any other icon library
- Dark mode via `next-themes` with `attribute="class"` strategy

**Components**
- All dashboard components live in `components/dashboard/` — see the full structure below
- Every component must have a named TypeScript `Props` interface — no inline prop types on function signatures
- No `<form>` HTML tags anywhere — use `onClick` / `onChange` event handlers
- No `any` in TypeScript — use `unknown` and narrow, or define the type

**Charts**
- Recharts only — `ResponsiveContainer` wrapping every chart so it fills its container correctly

**Mock Data**
- No API calls yet — all data is static mock data defined at the top of each component
- Tables and lists that need a populated-state demo use a `showMockData?: boolean` prop (default `false`)
- Prop names must mirror backend API field names exactly — this makes real data swap-in a one-liner

---

## Design System — The Single Source of Truth

Every visual decision in this project traces back to one of these rules. When in doubt, come back here.

### The Depth System
This is the core visual upgrade. Everything else builds on it.

```
Light mode:  page background = #f9fafb (gray-50)
             card surface    = #ffffff (white) + shadow
Dark mode:   page background = #0f1117
             card surface    = #1a1d27 + shadow
```

CSS variables (defined in `app/globals.css`):
```css
:root {
  --page-bg: #f9fafb;
  --card-bg: #ffffff;
  --card-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06);
  --card-shadow-hover: 0 4px 12px 0 rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06);
  --border-subtle: #f0f0f0;
  --border-default: #e5e7eb;
}
.dark {
  --page-bg: #0f1117;
  --card-bg: #1a1d27;
  --card-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.3);
  --card-shadow-hover: 0 4px 12px 0 rgb(0 0 0 / 0.4);
  --border-subtle: #2a2d3a;
  --border-default: #2f3347;
}
```

### Typography Scale
Do not deviate from these. Apply them exactly.

| Element | Tailwind Classes |
|---|---|
| Card section labels | `text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide` |
| KPI values (big numbers) | `text-3xl font-bold text-gray-900 dark:text-white leading-none` |
| Section / card headings | `text-base font-semibold text-gray-900 dark:text-white` |
| Body text / descriptions | `text-sm text-gray-500 dark:text-gray-400 leading-relaxed` |
| Table cell — primary | `text-sm font-medium text-gray-900 dark:text-white` |
| Table cell — secondary | `text-sm text-gray-500 dark:text-gray-400` |
| Monospace code (JOIN code) | `font-mono text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-wider` |
| Muted helper text | `text-xs text-gray-400 dark:text-gray-500` |

### Card Anatomy
Apply this class string to every card. No exceptions.

```
rounded-xl border border-gray-200 dark:border-gray-800
bg-white dark:bg-[var(--card-bg)]
[box-shadow:var(--card-shadow)]
p-5
```

Hover-interactive cards additionally get:
```
hover:[box-shadow:var(--card-shadow-hover)] transition-shadow duration-150 cursor-pointer
```

### Button Rules
| Context | Variant | Notes |
|---|---|---|
| Primary CTA (Invite Workers, Show QR Code) | `default` | shadcn blue fill |
| Analyze Gaps | custom | `bg-amber-500 hover:bg-amber-600 text-white` |
| Integration connect buttons | `outline` | **Neutral border only — no brand colors** |
| Icon-only utility (refresh, copy, close) | `ghost` | 32x32px, rounded-md |
| Destructive actions | `destructive` | shadcn red |

> ⚠️ THE INTEGRATION BUTTON RULE — This is the single most important visual fix in the redesign. Google Drive, Dropbox, Gusto, and Microsoft 365 connect buttons must ALWAYS use `variant="outline"` with neutral `border-gray-200` styling. Never use blue, orange, or purple fills. The service logo provides brand recognition. The button must be calm and neutral. If you ever find yourself writing `bg-blue-600` or `bg-orange-500` on a connect button, stop.

### Tab Active State
Active tab = `border-b-2 border-blue-600 text-gray-900 dark:text-white font-medium`
NOT a filled background pill. The underline is the indicator.

### Upload Zones
```
border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl
bg-white dark:bg-[var(--card-bg)]
hover:border-blue-300 hover:bg-blue-50/30 dark:hover:border-blue-700
transition-colors duration-150 cursor-pointer
min-h-[160px] flex flex-col items-center justify-center gap-3
```

Single-column upload zones (AI Studio video walkthrough) must be wrapped in `max-w-2xl`. This prevents uncomfortable stretching on wide monitors. This is non-negotiable.

### Empty States
The existing UI has weak empty states — just a grey icon and one line of text. Every empty state in this redesign uses the shared `EmptyState` component and must have all four of these elements:

1. **Icon container**: 48x48px, `rounded-xl bg-gray-100 dark:bg-gray-800`, icon at 24px
2. **Title**: bold, dark — `text-sm font-semibold text-gray-900 dark:text-white`
3. **Description**: 1-2 sentences explaining why it's empty and what will appear — `text-sm text-gray-500 max-w-xs`
4. **Action button** (where applicable): `variant="outline" size="sm"` with icon

Never render a bare icon + one grey sentence. Always use the `EmptyState` component.

### Spacing & Layout
- Page content area: `max-w-7xl mx-auto px-6 py-6`
- Gap between major sections: `gap-6`
- Gap between metric cards: `gap-4`
- Padding inside cards: `p-5` (uniform)
- Metric card grid: `grid grid-cols-4 gap-4` → `grid-cols-2` at md → `grid-cols-1` at sm

---

## Component Structure

```
components/dashboard/
├── layout/
│   ├── TopBar.tsx           # Logo, theme toggle, home icon, avatar + dropdown
│   ├── SubHeader.tsx        # Tagline + company selector dropdown
│   └── TabNav.tsx           # 5 tabs + Invite Workers button
├── shared/
│   ├── EmptyState.tsx       # Single source of truth for all empty states
│   ├── MetricCard.tsx       # Reusable KPI card (value + label + icon + subtext)
│   └── SectionHeader.tsx    # Reusable card header with optional action button
├── analytics/
│   ├── AnalyticsTab.tsx     # Assembles the full analytics view
│   ├── QuestionsChart.tsx   # Recharts bar/area + time range selector
│   └── FeedCard.tsx         # Recent Questions + Activity cards
├── alerts/
│   ├── AlertsTab.tsx        # Assembles the full alerts view
│   ├── AlertMetrics.tsx     # 4 KPI cards row
│   └── AlertsTable.tsx      # Filtered issue list + segmented control
├── documents/
│   ├── DocumentsTab.tsx     # Assembles the full documents view
│   ├── UploadZone.tsx       # Drag-and-drop file upload area
│   ├── IntegrationsRow.tsx  # 4 integration cards with neutral connect buttons
│   └── DocumentsTable.tsx  # Uploaded documents list
├── ai-studio/
│   ├── AIStudioTab.tsx      # Assembles the full AI Studio view
│   ├── VideoUpload.tsx      # Video walkthrough upload zone (max-w-2xl)
│   └── KnowledgeGaps.tsx   # Gap analysis section + Analyze Gaps button
└── workers/
    ├── WorkersTab.tsx       # Assembles the full workers view
    ├── RegistrationCard.tsx # JOIN code display + copy + QR button
    ├── QRCodeModal.tsx      # Dialog with QR code + download
    └── WorkersTable.tsx     # Worker list table with verified badge
```

**Naming conventions:**
| Context | Convention | Example |
|---|---|---|
| React components | PascalCase | `MetricCard.tsx` |
| Props interfaces | PascalCase + Props suffix | `MetricCardProps` |
| Mock data constants | SCREAMING_SNAKE | `MOCK_WORKERS` |
| Event handler props | on + PascalCase | `onTabChange`, `onInviteWorkers` |
| Boolean props | is/show prefix | `showMockData`, `isLoading` |

---

## Workflows

Before building any tab, read the corresponding workflow file. If it doesn't exist yet, create it first using the template below.

```
workflows/
├── 00_setup.md              # Token system, dependencies, globals.css
├── 01_shell.md              # TopBar, SubHeader, TabNav, page assembly
├── 02_shared_components.md  # EmptyState, MetricCard, SectionHeader
├── 03_analytics_tab.md      # Full analytics tab build sequence
├── 04_alerts_tab.md         # Full alerts tab build sequence
├── 05_documents_tab.md      # Full documents tab build sequence
├── 06_ai_studio_tab.md      # Full AI Studio tab build sequence
├── 07_workers_tab.md        # Full workers tab build sequence
└── 08_polish.md             # Typography audit, dark mode sweep, responsive
```

Each workflow follows this template:
```
## Objective
## Components to build (in order)
## Design constraints (specific rules for this tab)
## Mock data shape
## Expected output
## Edge cases and error states
```

---

## How to Operate

**1. Read before you build**
At the start of every session, read this file. Then read the relevant workflow for what you're about to build. Only then write code.

**2. Build shared components before tab components**
`EmptyState` and `MetricCard` are used across multiple tabs. Build and verify them first. Never duplicate their logic inside a tab component.

**3. Check the design system before every style decision**
Before writing any className string, ask: does this decision exist in the Design System section above? If yes, use it exactly. If no, ask before inventing something new.

**4. The self-improvement loop**
When you discover a constraint or edge case not covered by this file:
1. Fix it in the component
2. Document it in the relevant workflow file
3. If it's a global rule, add it to the Design System section of this file
4. Move on with a stronger system

**5. Dark mode is not optional**
Every component must work in both light and dark mode. Before considering any component done, mentally verify: if the background were near-black (#0f1117), would every text element still be readable? If not, fix it before moving on.

**6. When in doubt, ask**
If a design decision isn't covered by this file and you're not sure what to do — ask. Do not invent. This is especially true for: new color choices, new component patterns not in the structure above, anything that would affect multiple tabs.

---

## What to Never Do

- **Never use brand colors on integration connect buttons** — outline only, neutral border
- **Never use `<form>` HTML tags** — onClick/onChange handlers only
- **Never use `any` in TypeScript** — define the type or use unknown and narrow
- **Never hardcode hex values in JSX classNames** — use Tailwind classes or CSS variables
- **Never use shadow-lg or shadow-xl on cards** — always `[box-shadow:var(--card-shadow)]` (Tailwind v4 arbitrary CSS property syntax — `shadow-[var(...)]` breaks with multi-value shadows)
- **Never mix icon libraries** — Lucide React only, always
- **Never build a bare empty state** — always use the EmptyState component
- **Never let single-column upload zones go full width** — max-w-2xl
- **Never use a filled pill for the tab active state** — it's a border-bottom underline
- **Never start a new session without reading this file first**
- **Never end a session without updating the Build State table below**

---

## Current Build State

> This is the first thing to read at the start of any new session.
> Update it at the end of every session. Be specific in the Notes column — "done" is not enough. Write what was built, what decisions were made, and what still needs attention.

| Component | Status | Notes |
|---|---|---|
| **Foundation** | | |
| Next.js project created | 🔲 Not started | |
| Design tokens (tailwind.config + globals.css) | 🔲 Not started | |
| Dependencies installed | 🔲 Not started | shadcn, next-themes, lucide-react, recharts |
| shadcn components added | 🔲 Not started | card, button, badge, table, tabs, dialog, avatar, dropdown-menu, select, separator, skeleton, tooltip, progress |
| **Layout Shell** | | |
| TopBar | 🔲 Not started | |
| SubHeader + CompanySelector | 🔲 Not started | |
| TabNav | 🔲 Not started | |
| Dashboard page assembly | 🔲 Not started | |
| **Shared Components** | | |
| EmptyState | 🔲 Not started | |
| MetricCard | 🔲 Not started | |
| SectionHeader | 🔲 Not started | |
| **Analytics Tab** | | |
| AnalyticsTab (assembly) | 🔲 Not started | |
| QuestionsChart | 🔲 Not started | |
| FeedCard | 🔲 Not started | |
| **Alerts Tab** | | |
| AlertsTab (assembly) | 🔲 Not started | |
| AlertMetrics | 🔲 Not started | |
| AlertsTable | 🔲 Not started | |
| **Documents Tab** | | |
| DocumentsTab (assembly) | 🔲 Not started | |
| UploadZone | 🔲 Not started | |
| IntegrationsRow | 🔲 Not started | |
| DocumentsTable | 🔲 Not started | |
| **AI Studio Tab** | | |
| AIStudioTab (assembly) | 🔲 Not started | |
| VideoUpload | 🔲 Not started | |
| KnowledgeGaps | 🔲 Not started | |
| **Workers Tab** | | |
| WorkersTab (assembly) | 🔲 Not started | |
| RegistrationCard | 🔲 Not started | |
| QRCodeModal | 🔲 Not started | |
| WorkersTable | 🔲 Not started | |
| **Polish** | | |
| Typography audit | 🔲 Not started | |
| Dark mode sweep | 🔲 Not started | |
| Responsive breakpoints | 🔲 Not started | |

---

## Bottom Line

You are building a dashboard where **clarity is the core feature**. A frontline manager who opens this at 7am before a shift needs to instantly understand: are there any alerts? How is the team doing? What needs attention today?

Every design decision — the depth system, the typography hierarchy, the elevated empty states — serves that goal. A flat card that blends into the page slows comprehension. A weak empty state leaves the manager confused about what to do next. An integration button that screams blue draws the eye to the wrong thing.

Stay design-disciplined. Stay consistent. Keep the system honest.
