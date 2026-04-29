# Phase 3: Layout Shell - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the dashboard chrome — TopBar with logo and dark mode toggle, SubHeader with company selector, and TabNav with 5 tabs — with working tab switching via useState. This phase replaces the existing minimal top bar stub in `app/dashboard/page.tsx` with proper layout components in `components/dashboard/layout/`.

</domain>

<decisions>
## Implementation Decisions

### TopBar composition
- Logo: Sidekick chat bubble icon (MessageCircle from Lucide) + "Sidekick" + "|" separator + "Dashboard" text — matches existing stub
- Theme toggle: Icon-only cycle button (ghost, 32x32) that cycles Sun (light) → Moon (dark) → Monitor (system). Three states, not two
- Avatar: Top-right in TopBar (standard SaaS placement), not bottom-left as in screenshot
- Avatar dropdown: User name, Settings link (non-functional), Sign Out option — mock content for demo
- Home icon: Ghost button that links to `/dashboard` (effectively page refresh)
- Right side order: Home icon, theme toggle, avatar — left to right

### SubHeader & company selector
- Tagline: Static text "An overview of how your team is using Sidekick." — does NOT change per tab
- Company selector: Building icon + dropdown, right-aligned
- Mock companies: 3 total — "Sunrise Cafe" (selected), "Metro Warehouse", "Downtown Retail"
- No border below SubHeader — spacing only between SubHeader and TabNav
- SubHeader shares same card background (white/dark card-bg) as TopBar — they feel like one elevated header block

### Claude's Discretion — company selector interactivity
- Whether selecting a different company updates the displayed name or is purely visual — Claude picks the right level of interactivity for demo purposes

### TabNav interaction & layout
- Default active tab on load: Analytics
- Tab order: Analytics → Alerts → Documents → AI Studio → Workers (matches screenshot)
- Each tab has a Lucide icon + text label
- "Invite Workers" button: right-aligned in the same row as tabs (tabs left, button far right)
- Active tab indicator: border-bottom-2 blue underline (DSN-05) — NOT a filled pill
- Full-width subtle bottom border on the TabNav row — active tab's blue underline sits on it (like GitHub, Linear)

### Overall shell stacking
- TopBar: sticky at top on scroll (position sticky, top-0, z-index)
- SubHeader and TabNav: scroll with page content
- TopBar and SubHeader: both on card background (white light / card-bg dark) — one elevated header block
- Tab content: below TabNav, on page background (gray-50 light / #0f1117 dark)
- Unbuilt tabs (Alerts, Documents, AI Studio, Workers): render shared EmptyState component with relevant icon, "Coming Soon" title, and description — polished for demo

### Claude's Discretion
- Specific Lucide icon choices for each tab (suggestions: BarChart3 for Analytics, ShieldAlert for Alerts, FileText for Documents, Sparkles for AI Studio, Users for Workers)
- Exact spacing between TopBar, SubHeader, and TabNav rows
- Avatar initial letter and color scheme
- Invite Workers button icon choice
- Transition animation on tab switch (if any)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/dashboard/shared/EmptyState.tsx`: Use for placeholder tab content on unbuilt tabs
- `components/dashboard/shared/MetricCard.tsx`: Not needed in this phase but pattern (named export, Props interface) should be followed
- `components/dashboard/shared/SectionHeader.tsx`: Same — follow the pattern
- `components/dashboard/analytics/AnalyticsTab.tsx`: Already exists — will be the content for the Analytics tab
- `components/ui/button.tsx`: shadcn Button for ghost/icon buttons (theme toggle, home, avatar)
- `components/ui/dropdown-menu.tsx`: shadcn DropdownMenu for avatar dropdown and company selector

### Established Patterns
- `'use client'` on every dashboard component
- `mounted` guard (useState + useEffect) required for any component using `useTheme()`
- Named exports with named `Props` interfaces
- `[box-shadow:var(--card-shadow)]` for card shadows (not `shadow-[var(...)]`)
- `bg-[var(--page-bg)]` for page background, `bg-white dark:bg-[var(--card-bg)]` for elevated surfaces

### Integration Points
- `app/dashboard/page.tsx`: Currently has minimal top bar + AnalyticsTab — will be restructured to compose TopBar + SubHeader + TabNav + tab content area
- `components/dashboard/layout/`: Directory does not exist yet — needs creation for TopBar.tsx, SubHeader.tsx, TabNav.tsx
- Tab switching: page.tsx manages `activeTab` state via useState, passes to TabNav and conditionally renders tab content

</code_context>

<specifics>
## Specific Ideas

- TopBar + SubHeader should feel like one continuous elevated header block (shared card background, no border between them)
- TabNav bottom border creates a clean baseline that the active tab's blue underline overlaps — similar to GitHub's tab pattern
- Company selector with 3 mock companies makes the demo feel like a real multi-location business dashboard
- EmptyState placeholders on unbuilt tabs prevent the demo from feeling broken when clicking through tabs

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-layout-shell*
*Context gathered: 2026-03-17*
