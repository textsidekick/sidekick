---
phase: 03-layout-shell
verified: 2026-03-17T23:30:00Z
status: human_needed
score: 13/13 must-haves verified
human_verification:
  - test: "Theme toggle visual cycle"
    expected: "Clicking the moon/sun/monitor icon in TopBar cycles page theme: light -> dark -> system -> light. Each state shows the correct icon and applies the matching background."
    why_human: "useTheme mounted guard and cycleTheme logic are wired correctly in code, but visual rendering of dark mode (--page-bg, --card-bg) and icon switching cannot be confirmed without running the browser."
  - test: "Avatar dropdown renders and opens"
    expected: "Clicking the purple 'N' avatar opens a dropdown with 'Nate Manager' label, a separator, Settings item, another separator, and Sign Out item."
    why_human: "DropdownMenu uses base-nova render prop pattern. Functional correctness of the render prop trigger cannot be confirmed from static analysis."
  - test: "Active tab underline vs filled pill"
    expected: "The active tab shows a blue bottom border (border-b-2 border-blue-600, -mb-px overlap), not a filled background pill. Inactive tabs show no underline."
    why_human: "The class string is correct in code (-mb-px + border-b on container), but the visual outcome of the overlap trick must be confirmed in a real browser."
  - test: "TopBar + SubHeader seamless elevated block"
    expected: "TopBar and SubHeader appear as one continuous white card (light) / dark card (dark) with no visible border or gap between them. TabNav border-b sits below as a separator."
    why_human: "Both share bg-white dark:bg-[var(--card-bg)] with no border-bottom — visually they should merge — but rendering must be confirmed in browser."
  - test: "Company selector interactivity"
    expected: "Clicking the company selector shows 'Sunrise Cafe', 'Metro Warehouse', 'Downtown Retail'. Selecting a different company updates the displayed name immediately."
    why_human: "Controlled Select state is wired correctly in code, but base-nova Select rendering requires browser confirmation."
---

# Phase 3: Layout Shell Verification Report

**Phase Goal:** Build the persistent layout chrome — TopBar (logo, theme toggle, avatar), SubHeader (tagline, company selector), and TabNav (5 tabs with underline active indicator). Compose them in page.tsx with working tab switching.
**Verified:** 2026-03-17T23:30:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | TopBar renders logo (MessageCircle + Sidekick \| Dashboard), home icon, 3-state theme toggle, and avatar dropdown | ✓ VERIFIED | TopBar.tsx lines 41-88: MessageCircle icon, "Sidekick \| Dashboard" text, Home Button ghost, mounted-guarded theme toggle cycling light/dark/system, DropdownMenu with Avatar |
| 2 | Theme toggle cycles light -> dark -> system with correct icon (Moon -> Sun -> Monitor) | ✓ VERIFIED | TopBar.tsx lines 22-35: `cycleTheme` function with correct branch logic; `ThemeIcon` derived from theme state; toggle rendered only when `mounted === true` |
| 3 | Avatar dropdown opens with user name, Settings, and Sign Out items | ✓ VERIFIED | TopBar.tsx lines 69-88: DropdownMenuContent with DropdownMenuLabel "Nate Manager", two separators, DropdownMenuItem "Settings", DropdownMenuItem "Sign Out" |
| 4 | SubHeader renders static tagline and company selector with 3 mock companies | ✓ VERIFIED | SubHeader.tsx lines 17-47: static tagline text, controlled Select with MOCK_COMPANIES (sunrise-cafe, metro-warehouse, downtown-retail) |
| 5 | TopBar and SubHeader share card background, forming one elevated header block | ✓ VERIFIED | TopBar.tsx line 38 and SubHeader.tsx line 27 both use `bg-white dark:bg-[var(--card-bg)]` with no border-bottom on either |
| 6 | Both TopBar and SubHeader render correctly in light and dark mode | ✓ VERIFIED | Both use `dark:bg-[var(--card-bg)]`, `dark:text-white`, `dark:text-gray-400`, `dark:border-gray-700` throughout; mounted guard prevents hydration mismatch |
| 7 | TabNav renders 5 tabs (Analytics, Alerts, Documents, AI Studio, Workers) with Lucide icons | ✓ VERIFIED | TabNav.tsx lines 21-27: TABS constant with BarChart3, ShieldAlert, FileText, Sparkles, Users icons; all 5 rendered via map |
| 8 | Active tab shows border-bottom-2 blue underline indicator, NOT a filled pill | ✓ VERIFIED | TabNav.tsx lines 38-41: `border-b-2 -mb-px` on every tab button; active: `border-blue-600`; inactive: `border-transparent`; container has `border-b border-gray-200 dark:border-gray-800` |
| 9 | Clicking a tab switches the visible content area | ✓ VERIFIED | page.tsx lines 12, 25, 29-57: `useState<TabId>('analytics')`, passed to `<TabNav onTabChange={setActiveTab}>`, conditional renders on all 5 tab IDs |
| 10 | Default active tab on page load is Analytics | ✓ VERIFIED | page.tsx line 12: `useState<TabId>('analytics')` |
| 11 | Invite Workers button is right-aligned in the TabNav row | ✓ VERIFIED | TabNav.tsx lines 32, 51-54: `flex items-center justify-between` container; `<Button>` with LayoutGrid icon and "Invite Workers" text sits outside the tabs flex group on the right |
| 12 | Unbuilt tabs show EmptyState with Coming Soon placeholder | ✓ VERIFIED | page.tsx lines 30-57: alerts, documents, ai-studio, and workers tabs each render `<EmptyState>` with icon, "X Coming Soon" title, and contextual description |
| 13 | Full layout renders correctly in both light and dark mode | ✓ VERIFIED | page.tsx line 15: `bg-[var(--page-bg)]` wrapper; all layout components use paired `dark:` classes; TopBar mounted guard prevents hydration mismatch; build passes cleanly |

**Score:** 13/13 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `components/dashboard/layout/TopBar.tsx` | Dashboard top bar with logo, theme toggle, home icon, avatar dropdown | ✓ VERIFIED | 97 lines, substantive implementation; named exports `TopBar` + `TopBarProps`; `'use client'` directive present; no `any` types |
| `components/dashboard/layout/SubHeader.tsx` | Dashboard sub-header with tagline and company selector | ✓ VERIFIED | 55 lines, substantive implementation; named exports `SubHeader` + `SubHeaderProps`; controlled Select state with null guard |
| `components/dashboard/layout/TabNav.tsx` | Tab navigation with 5 tabs and Invite Workers button | ✓ VERIFIED | 62 lines, substantive implementation; named exports `TabNav`, `TabNavProps`, `TabId` |
| `app/dashboard/page.tsx` | Dashboard page composing full layout shell with tab switching | ✓ VERIFIED | 62 lines; imports and composes all 3 layout components + AnalyticsTab + EmptyState; useState tab switching |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `TopBar.tsx` | `next-themes` | `useTheme()` with mounted guard | ✓ WIRED | `useTheme` imported, `theme` and `setTheme` destructured, `mounted` useState + useEffect guard, toggle only rendered when `mounted === true` |
| `TopBar.tsx` | `components/ui/dropdown-menu.tsx` | Avatar dropdown menu | ✓ WIRED | DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem all imported and used |
| `SubHeader.tsx` | `components/ui/select.tsx` | Company selector | ✓ WIRED | Select, SelectTrigger, SelectValue, SelectContent, SelectItem imported and used; controlled via `useState` + `onValueChange` |
| `page.tsx` | `TopBar.tsx` | import and render | ✓ WIRED | `import { TopBar } from '@/components/dashboard/layout/TopBar'`; `<TopBar />` rendered inside sticky wrapper |
| `page.tsx` | `SubHeader.tsx` | import and render | ✓ WIRED | `import { SubHeader } from '@/components/dashboard/layout/SubHeader'`; `<SubHeader />` rendered below sticky wrapper |
| `page.tsx` | `TabNav.tsx` | activeTab state passed as prop | ✓ WIRED | `import { TabNav, type TabId }`; `<TabNav activeTab={activeTab} onTabChange={setActiveTab} />` |
| `TabNav.tsx` | `page.tsx` | onTabChange callback | ✓ WIRED | `onTabChange` in `TabNavProps` interface; each tab button's `onClick` calls `onTabChange(tab.id)` |
| `page.tsx` | `AnalyticsTab.tsx` | conditional render on activeTab | ✓ WIRED | `{activeTab === 'analytics' && <AnalyticsTab />}` |
| `page.tsx` | `EmptyState.tsx` | placeholder for unbuilt tabs | ✓ WIRED | EmptyState rendered for alerts, documents, ai-studio, and workers with "Coming Soon" title and contextual descriptions |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| FOUND-02 | 03-01, 03-02 | Layout shell renders with TopBar, SubHeader, and TabNav | ✓ SATISFIED | All 3 layout components exist, are substantive, and are composed in page.tsx |
| FOUND-03 | 03-02 | Tab navigation switches between 5 tabs via useState (no URL routing) | ✓ SATISFIED | page.tsx uses `useState<TabId>('analytics')` with conditional renders; TabNav callback wires to `setActiveTab` |
| DARK-03 | 03-01 | Theme toggle in TopBar switches between light, dark, and system modes | ✓ SATISFIED | TopBar.tsx `cycleTheme` function: light→dark→system→light; mounted guard prevents hydration mismatch |
| DSN-05 | 03-02 | Active tab uses border-bottom underline indicator — never a filled pill | ✓ SATISFIED | TabNav.tsx: `border-b-2 border-blue-600 -mb-px` active style; `border-transparent` inactive; container `border-b` creates overlap |

No orphaned requirements found — all 4 IDs declared in plan frontmatter map to verified implementations.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `TabNav.tsx` | 51 | `<Button>` with no explicit `variant="default"` | ℹ️ Info | Renders as default (blue fill) which matches CLAUDE.md primary CTA spec. No functional impact — shadcn Button defaults to `variant="default"`. Explicit variant would improve readability. |

No blockers or warnings found. No `any` types. No `TODO`/`FIXME` comments. No bare empty states. No inline style objects. No brand colors on integration buttons (N/A this phase). No `<form>` tags.

---

### Human Verification Required

#### 1. Theme Toggle Visual Cycle

**Test:** Run `npm run dev`, open http://localhost:3000/dashboard, click the icon button to the left of the avatar in TopBar repeatedly.
**Expected:** Starts with Moon icon (light mode). First click switches to dark mode with Sun icon and dark backgrounds (#0f1117 page, #1a1d27 cards). Second click switches to system mode with Monitor icon. Third click returns to light mode with Moon icon.
**Why human:** useTheme and cycleTheme logic are correct in code, but the actual visual theme switching and correct icon display per state must be confirmed in a running browser.

#### 2. Avatar Dropdown Interaction

**Test:** Click the purple "N" avatar circle in TopBar.
**Expected:** A dropdown opens below with "Nate Manager" as a label, a divider, "Settings" item, another divider, and "Sign Out" item. Clicking outside dismisses it.
**Why human:** The base-nova `render={}` prop pattern for DropdownMenuTrigger is unconventional — visual and interactive correctness must be confirmed in a browser.

#### 3. Active Tab Underline Indicator

**Test:** Load the dashboard. Observe the Analytics tab. Click each of the 5 tabs in turn.
**Expected:** The active tab has a continuous blue line at its bottom edge that merges with the container border — not a background color fill or pill shape. Inactive tabs show no bottom line.
**Why human:** The `-mb-px` overlap trick produces correct CSS in static analysis, but the rendered visual outcome must be confirmed to match the GitHub-style underline per DSN-05.

#### 4. TopBar + SubHeader Seamless Block

**Test:** Look at the header area of the dashboard in both light and dark mode.
**Expected:** TopBar and SubHeader appear as a single unbroken elevated block (white in light, dark card in dark). No visible seam, gap, or border between them. A clear visual separation exists below SubHeader before the TabNav border.
**Why human:** Both components share the same background CSS variable with no border-bottom — the seamless appearance depends on rendering context.

#### 5. Company Selector Interaction

**Test:** Click the company selector (shows "Sunrise Cafe" by default) in SubHeader.
**Expected:** A dropdown opens showing three options: Sunrise Cafe, Metro Warehouse, Downtown Retail. Selecting Metro Warehouse updates the displayed text in the trigger immediately.
**Why human:** base-nova Select rendering and controlled state update must be confirmed visually in browser.

---

### Gaps Summary

No gaps found. All 13 observable truths verified against actual source code. All 4 artifacts are substantive and wired. All 9 key links confirmed. All 4 requirement IDs satisfied. Build passes cleanly (`/dashboard` prerendered as static). The only outstanding items are the 5 human verification checks above, which require a running browser to confirm visual and interactive behavior.

---

_Verified: 2026-03-17T23:30:00Z_
_Verifier: Claude (gsd-verifier)_
