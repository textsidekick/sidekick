---
phase: 3
slug: layout-shell
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None installed (UI-focused greenfield) |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx next build` |
| **Full suite command** | `npx next build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx next build`
- **After every plan wave:** Run `npx next build` + visual inspection (light + dark mode)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | FOUND-02 | smoke | `npx next build` | N/A | ⬜ pending |
| 03-01-02 | 01 | 1 | DARK-03 | manual | Visual: click toggle, verify 3 states | N/A | ⬜ pending |
| 03-02-01 | 02 | 1 | FOUND-02 | smoke | `npx next build` | N/A | ⬜ pending |
| 03-03-01 | 03 | 1 | FOUND-03, DSN-05 | smoke | `npx next build` | N/A | ⬜ pending |
| 03-03-02 | 03 | 1 | FOUND-03 | manual | Visual: click each tab, verify content switches | N/A | ⬜ pending |
| 03-03-03 | 03 | 1 | DSN-05 | manual | Visual: verify underline indicator, not filled pill | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `components/dashboard/layout/` directory — create for shell components
- [ ] No unit/integration test framework installed (acceptable — `next build` is the automated check for this UI-focused project)

*Existing infrastructure covers compilation and type-check requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Theme toggle cycles light/dark/system | DARK-03 | Visual correctness — no headless browser setup | Click toggle 3 times, verify Sun→Moon→Monitor icons and page theme changes |
| Tab switching shows correct content | FOUND-03 | Visual correctness — need to verify UI renders | Click each of 5 tabs, verify content area changes |
| Active tab uses underline not pill | DSN-05 | Design verification — CSS visual check | Inspect active tab, confirm border-b-2 blue underline, no filled background |
| Shell renders in both modes | FOUND-02 | Visual correctness — light and dark modes | Toggle theme, verify all text readable, no invisible elements |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
