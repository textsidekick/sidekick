---
phase: 6
slug: workers-tab
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — manual/visual + `npm run build` |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build` + manual browser check (light + dark mode)
- **Before `/gsd:verify-work`:** Full build must be green + visual review
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | WORK-01 | manual | `npm run build` | N/A | ⬜ pending |
| 06-01-02 | 01 | 1 | WORK-02 | manual | `npm run build` | N/A | ⬜ pending |
| 06-02-01 | 02 | 1 | WORK-03 | manual | `npm run build` | N/A | ⬜ pending |
| 06-02-02 | 02 | 1 | WORK-04 | manual | `npm run build` | N/A | ⬜ pending |
| 06-03-01 | 03 | 1 | WORK-05 | manual | `npm run build` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. No test framework — validation is manual/visual + TypeScript build check.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| JOIN code renders in monospace font | WORK-01 | Visual styling check | Inspect RegistrationCard, verify `font-mono` class renders correctly |
| Copy button copies code to clipboard | WORK-01 | Clipboard API requires browser | Click copy button, paste elsewhere, verify "JOIN XXXXXX" |
| QR code modal opens with scannable QR | WORK-02 | QR scanning requires camera/device | Click "Show QR Code", scan with phone camera |
| QR download produces valid PNG | WORK-02 | File download requires browser | Click download, open PNG, verify QR is readable |
| Worker table columns render correctly | WORK-03 | Visual layout check | With showMockData=true, verify name/phone/date/status columns |
| Verified badge visible | WORK-04 | Visual check | Verify green badge on verified workers, gray on pending |
| Empty state vs populated toggle | WORK-05 | Visual check | Toggle showMockData, verify EmptyState vs table |
| Dark mode renders correctly | ALL | Visual check | Toggle theme, verify all components readable |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
