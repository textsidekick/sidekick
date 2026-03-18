---
phase: 4
slug: alerts-tab
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None installed — no test runner in project |
| **Config file** | none — Wave 0 deferred |
| **Quick run command** | `npx next build` |
| **Full suite command** | `npx next build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx next build`
- **After every plan wave:** Run `npx next build` + manual browser check in light/dark mode
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | ALRT-01 | build | `npx next build` | ✅ | ⬜ pending |
| 04-02-01 | 02 | 1 | ALRT-02 | build | `npx next build` | ✅ | ⬜ pending |
| 04-02-02 | 02 | 1 | ALRT-03 | build | `npx next build` | ✅ | ⬜ pending |
| 04-03-01 | 03 | 2 | ALRT-04 | build | `npx next build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. No test framework installation needed for build-level validation.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 4 KPI cards render with correct icons, colors, values | ALRT-01 | Visual correctness (color, layout, spacing) | Open /dashboard, switch to Alerts tab, verify 4 cards with correct icons and colored accents in both light/dark mode |
| Table renders 5 columns with mock data | ALRT-02 | Visual inspection of table layout | Set showMockData={true}, verify columns: description, worker, severity badge, status dot, date |
| Segmented control filters table rows | ALRT-03 | Interactive behavior | Click Open/Resolved/All segments, verify table rows filter correctly |
| showMockData toggle shows populated vs empty state | ALRT-04 | Prop toggle visual check | Toggle showMockData prop, verify EmptyState renders when false |
| Dark mode rendering | ALL | Visual correctness | Toggle dark mode, verify all elements render correctly on dark background |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
