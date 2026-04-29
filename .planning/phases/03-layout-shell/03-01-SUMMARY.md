---
phase: 03-layout-shell
plan: 01
subsystem: ui
tags: [next-themes, dropdown-menu, select, avatar, dark-mode, layout]

# Dependency graph
requires:
  - phase: 01-foundation-verification
    provides: Design tokens (CSS variables), ThemeProvider, shadcn components
provides:
  - TopBar component with logo, 3-state theme toggle, home icon, avatar dropdown
  - SubHeader component with static tagline and controlled company selector
affects: [03-layout-shell plan 02 (TabNav + page assembly), all tab phases]

# Tech tracking
tech-stack:
  added: []
  patterns: [base-nova DropdownMenuTrigger render prop, base-nova Select controlled state with null guard]

key-files:
  created:
    - components/dashboard/layout/TopBar.tsx
    - components/dashboard/layout/SubHeader.tsx
  modified: []

key-decisions:
  - "DropdownMenuTrigger uses render prop with raw button element to avoid nested button warning"
  - "Company selector is controlled (useState) so selecting a company updates the display immediately"
  - "Select onValueChange needs null guard because base-nova passes string | null"

patterns-established:
  - "base-nova DropdownMenuTrigger render prop: render={<button className='...' />} for custom triggers"
  - "base-nova Select null guard: onValueChange={(value) => { if (value) setState(value) }}"

requirements-completed: [FOUND-02, DARK-03]

# Metrics
duration: 2min
completed: 2026-03-17
---

# Phase 3 Plan 1: TopBar and SubHeader Summary

**TopBar with 3-state theme toggle (light/dark/system) and avatar dropdown, SubHeader with controlled company selector (3 mock locations)**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-17T22:58:05Z
- **Completed:** 2026-03-17T22:59:22Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- TopBar renders logo (MessageCircle + Sidekick | Dashboard), home icon, 3-state theme cycle, and avatar dropdown with Settings/Sign Out
- SubHeader renders static tagline and working company selector with 3 mock companies (Sunrise Cafe default)
- Both components share card background forming one seamless elevated header block (no border-bottom on either)

## Task Commits

Each task was committed atomically:

1. **Task 1: Build TopBar component** - `c2747af` (feat)
2. **Task 2: Build SubHeader component** - `e298ad8` (feat)

## Files Created/Modified
- `components/dashboard/layout/TopBar.tsx` - Dashboard top bar with logo, 3-state theme toggle, home icon, avatar dropdown
- `components/dashboard/layout/SubHeader.tsx` - Dashboard sub-header with tagline and controlled company selector

## Decisions Made
- DropdownMenuTrigger uses `render={<button />}` prop pattern to create a custom rounded trigger without nested button elements
- Company selector uses controlled state (useState + onValueChange) for responsive demo feel
- Select onValueChange requires null guard since base-nova Select passes `string | null` to the callback

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Select onValueChange type mismatch**
- **Found during:** Task 2 (SubHeader)
- **Issue:** base-nova Select's `onValueChange` passes `string | null`, incompatible with `Dispatch<SetStateAction<string>>`
- **Fix:** Wrapped in arrow function with null guard: `(value) => { if (value) setCompany(value) }`
- **Files modified:** components/dashboard/layout/SubHeader.tsx
- **Verification:** `npx next build` passes with no type errors
- **Committed in:** e298ad8 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Type-level fix required for correctness. No scope creep.

## Issues Encountered
None beyond the auto-fixed type mismatch.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- TopBar and SubHeader ready to compose in page.tsx
- Plan 02 (TabNav + page assembly) can proceed immediately
- Layout directory established at `components/dashboard/layout/`

---
*Phase: 03-layout-shell*
*Completed: 2026-03-17*
