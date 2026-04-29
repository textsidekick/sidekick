---
phase: 9
slug: polish-and-verification
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None (visual audit phase) |
| **Config file** | none |
| **Quick run command** | `npx next build` |
| **Full suite command** | `npx next build && npx next start` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx next build`
- **After every plan wave:** Visual inspection of all 5 tabs in both light and dark mode
- **Before `/gsd:verify-work`:** Full build succeeds + all tabs visually verified at 1280px, 1024px, 768px in both modes
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 09-01-XX | 01 | 1 | DARK-01, DARK-02, DARK-04 | manual + build | `npx next build` | N/A | ⬜ pending |
| 09-02-XX | 02 | 1 | DSN-03 | manual + build | `npx next build` | N/A | ⬜ pending |
| 09-03-XX | 03 | 2 | DARK-01, DARK-02 | manual + build | `npx next build` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework installation needed — this phase is a visual quality audit verified by successful builds and manual inspection.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Light mode renders correctly across all tabs | DARK-01 | Visual appearance cannot be automated without visual regression tool | Open each tab at localhost:3000, verify no washed-out or invisible elements on #f7f5f0 background |
| Dark mode renders correctly across all tabs | DARK-02 | Visual appearance requires human judgment | Toggle dark mode, verify all text readable, borders visible, card surfaces correct on #0f1117 background |
| No unreadable text in either mode | DARK-04 | Contrast issues require visual inspection | Check every text element in both modes — focus on gray-400/500 text on dark backgrounds |
| All empty states use EmptyState component | DSN-03 | Component usage pattern requires code review | Grep for bare empty states, verify showMockData={false} renders EmptyState in all tabs |
| Responsive grids collapse correctly | DSN-03 | Layout behavior requires browser resize | Resize viewport to 1280px, 1024px, 768px — verify metric grids 4→2→1, tables scroll horizontally |
| showMockData toggle works for all tabs | N/A | State toggle behavior requires manual test | Toggle showMockData in page.tsx, verify populated and empty states render correctly |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
