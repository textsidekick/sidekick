---
phase: 2
slug: shared-components
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None (build verification + static analysis) |
| **Config file** | none — no test framework installed |
| **Quick run command** | `npx next build` |
| **Full suite command** | `npx next build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx next build`
- **After every plan wave:** Run `npx next build` + visual inspection in dev server
- **Before `/gsd:verify-work`:** Full build must pass + visual verification in both light and dark mode
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | FOUND-04 | manual + build | `npx next build` | N/A | ⬜ pending |
| 02-02-01 | 02 | 1 | FOUND-05 | manual + build | `npx next build` | N/A | ⬜ pending |
| 02-03-01 | 03 | 1 | FOUND-06 | manual + build | `npx next build` | N/A | ⬜ pending |
| 02-xx-xx | all | all | DSN-01 | static analysis | `grep -r "from.*components/ui/card" components/dashboard/shared/` (should be empty) | N/A | ⬜ pending |
| 02-xx-xx | all | all | DSN-06 | static analysis | `grep -r "from.*heroicons\|from.*feather" components/dashboard/shared/` (should be empty) | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements. No test framework needed — components are purely presentational, verified via build + visual inspection + static analysis.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| EmptyState renders 4 elements (icon container, title, description, action button) in both modes | FOUND-04 | Visual/presentational — no test framework | Run `npm run dev`, inspect EmptyState in light and dark mode |
| MetricCard renders KPI value, label, icon, subtext with correct card anatomy | FOUND-05 | Visual/presentational | Run `npm run dev`, inspect MetricCard in both modes |
| SectionHeader renders heading + optional action with correct typography | FOUND-06 | Visual/presentational | Run `npm run dev`, inspect SectionHeader in both modes |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
