---
phase: 1
slug: foundation-verification
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test runner installed; Phase 1 is manual-only |
| **Config file** | none — no Wave 0 install required for this phase |
| **Quick run command** | `npm run dev` then open `http://localhost:3000/dashboard` |
| **Full suite command** | Manual: toggle dark mode, verify both states |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run dev` and verify `/dashboard` renders
- **After every plan wave:** Manual: toggle dark mode, verify both states
- **Before `/gsd:verify-work`:** Both redirect and dashboard page render correctly
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | FOUND-01 | manual | `npm run dev` + browser inspect | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | FOUND-01 | manual | browser DevTools computed styles | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

No test infrastructure setup needed for Phase 1. All verification is manual browser inspection.

*Existing infrastructure covers all phase requirements (manual-only).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `/dashboard` route renders without 404 | FOUND-01 | Server redirect + page rendering requires browser | Open `http://localhost:3000`, confirm redirect to `/dashboard` succeeds |
| Page background is `#f9fafb` in light mode | FOUND-01 | CSS variable rendering is visual/browser-only | DevTools → Elements → computed styles → `background-color: rgb(249, 250, 251)` |
| Page background is `#0f1117` in dark mode | FOUND-01 | CSS variable rendering is visual/browser-only | Toggle dark mode → DevTools → computed background `rgb(15, 17, 23)` |
| Card div shows depth separation from page | FOUND-01 | Visual contrast requires human inspection | Card should appear as elevated white/near-black surface against gray/dark background |
| Dark mode toggle works | FOUND-01 | next-themes requires browser interaction | Toggle theme; page background + card surface must switch; no hydration errors in console |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
