---
phase: 7
slug: documents-tab
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — visual-only UI components |
| **Config file** | none |
| **Quick run command** | `npx next build` |
| **Full suite command** | `npx next build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx next build`
- **After every plan wave:** Run `npx next build` + visual inspection (light + dark mode)
- **Before `/gsd:verify-work`:** Full build must succeed + visual verification
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 7-01-01 | 01 | 1 | DOCS-01 | build | `npx next build` | N/A | ⬜ pending |
| 7-02-01 | 02 | 1 | DOCS-02, DSN-02 | build | `npx next build` | N/A | ⬜ pending |
| 7-03-01 | 03 | 1 | DOCS-03, DOCS-04 | build | `npx next build` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. No test framework installation needed — all validation is build verification + visual inspection, consistent with Phases 4-6.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| UploadZone renders dashed border, icon, helper text, hover state in light+dark | DOCS-01 | Visual styling verification | Toggle theme, inspect border style, hover state |
| IntegrationsRow shows 4 cards with neutral outline buttons, no brand colors | DOCS-02, DSN-02 | Visual styling — ensure no bg-blue/orange/purple | Inspect all 4 buttons, verify `variant="outline"` |
| DocumentsTable columns: name, type, size, upload date | DOCS-03 | Table layout verification | Set showMockData=true, check columns |
| showMockData toggles mock data vs EmptyState | DOCS-04 | Prop behavior verification | Toggle prop, verify both states render |
| Upload zone is full-width (not constrained) | DSN-04 | Layout constraint | Inspect on wide viewport, confirm no max-w-2xl |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
