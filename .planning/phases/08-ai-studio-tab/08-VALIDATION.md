---
phase: 8
slug: ai-studio-tab
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual visual verification (no automated test framework configured) |
| **Config file** | none |
| **Quick run command** | `npx next build` |
| **Full suite command** | `npx next build` + manual visual review in browser |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx next build`
- **After every plan wave:** Run `npx next build` + visual review in browser (both light and dark mode)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | AIST-01 | manual | `npx next build` | N/A | ⬜ pending |
| 08-01-02 | 01 | 1 | AIST-01 | manual | `npx next build` | N/A | ⬜ pending |
| 08-02-01 | 02 | 1 | AIST-02, AIST-03 | manual | `npx next build` | N/A | ⬜ pending |
| 08-02-02 | 02 | 1 | AIST-03 | manual | `npx next build` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No automated test framework exists in this project; validation is compile check + manual visual review, consistent with all prior phases.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| VideoUpload renders with max-w-2xl constraint | AIST-01 | Visual layout constraint | Open AI Studio tab on wide monitor, verify upload zone does not stretch beyond ~672px |
| KnowledgeGaps renders amber Analyze Gaps button | AIST-02 | Visual color verification | Open AI Studio tab, verify button is amber (not blue), hover state darkens |
| showMockData toggles data vs EmptyState | AIST-03 | Behavioral toggle | Set prop to true/false, verify gap list appears/disappears |
| Light and dark mode rendering | All | Visual theme verification | Toggle theme, verify all elements readable in both modes |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
