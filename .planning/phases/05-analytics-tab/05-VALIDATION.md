---
phase: 5
slug: analytics-tab
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None (build check only) |
| **Config file** | none |
| **Quick run command** | `npx next build` |
| **Full suite command** | `npx next build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx next build`
- **After every plan wave:** Run `npx next build` + visual inspection (light + dark)
- **Before `/gsd:verify-work`:** Full build must pass + visual verification of all 6 requirements
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | ANLX-01 | build | `npx next build` | N/A | ⬜ pending |
| 05-01-02 | 01 | 1 | ANLX-02 | build | `npx next build` | N/A | ⬜ pending |
| 05-01-03 | 01 | 1 | ANLX-03 | build | `npx next build` | N/A | ⬜ pending |
| 05-01-04 | 01 | 1 | ANLX-04 | build | `npx next build` | N/A | ⬜ pending |
| 05-01-05 | 01 | 1 | ANLX-05 | build | `npx next build` | N/A | ⬜ pending |
| 05-01-06 | 01 | 1 | ANLX-06 | build | `npx next build` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework needed — all validation is via build checks and manual visual inspection. This is appropriate for a greenfield UI project in demo phase.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 4 KPI cards render with MetricCard | ANLX-01 | Visual UI component | Inspect browser: 4 cards with values, labels, icons |
| QuestionsChart with time range selector | ANLX-02 | Interactive chart | Click each time range option, verify chart updates |
| ResponsiveContainer fills parent | ANLX-03 | Layout/sizing | Dev tools: verify chart container has explicit height, not 0px |
| Recent Questions feed items | ANLX-04 | Visual list rendering | With showMockData={true}, verify list items with timestamps |
| Activity feed items | ANLX-05 | Visual list rendering | With showMockData={true}, verify list items with timestamps |
| showMockData toggles all data | ANLX-06 | Prop behavior | Toggle prop, verify empty vs populated states |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
