# Phase 6: Workers Tab - Research

**Researched:** 2026-03-18
**Domain:** React components — QR code generation, clipboard API, modal dialogs, data tables
**Confidence:** HIGH

## Summary

The Workers Tab consists of three components: RegistrationCard (JOIN code display + copy + QR trigger), QRCodeModal (dialog with QR code + download), and WorkersTable (worker roster with verified badges). The tab follows the same `showMockData` pattern established in Phases 4 and 5.

The only new dependency is `qrcode.react` (v4.2.0), which explicitly supports React 19 in its peerDependencies. All other patterns — Dialog, Table, Badge, EmptyState, SectionHeader, Button — are already established in the codebase from prior phases. The clipboard copy uses the browser `navigator.clipboard.writeText()` API (no library needed). QR download uses canvas `toDataURL()`.

**Primary recommendation:** Install `qrcode.react`, use `QRCodeSVG` for display and `QRCodeCanvas` (hidden) for PNG download. Follow the AlertsTab/AlertsTable pattern exactly for tab assembly and table structure.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| WORK-01 | RegistrationCard displays JOIN code in monospace font with copy-to-clipboard button | Monospace typography from CLAUDE.md design system; `navigator.clipboard.writeText()` API; Copy icon from lucide-react |
| WORK-02 | "Show QR Code" button opens QRCodeModal dialog with scannable QR code and download button | `qrcode.react` QRCodeSVG for display; QRCodeCanvas for download via `toDataURL()`; base-nova Dialog component already in codebase |
| WORK-03 | WorkersTable renders workers with name, phone, join date, status columns | shadcn Table component (already used in AlertsTable); same column pattern |
| WORK-04 | Verified workers display a verified badge | shadcn Badge component with green styling; BadgeCheck or ShieldCheck icon from lucide-react |
| WORK-05 | showMockData prop controls table population vs EmptyState | Same pattern as AlertsTab/AnalyticsTab — mock data constant, conditional rendering |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| qrcode.react | 4.2.0 | QR code generation (SVG + Canvas) | Most popular React QR library; 2M+ weekly downloads; React 19 peerDep support verified |

### Already Installed (no action needed)
| Library | Purpose | Used In |
|---------|---------|---------|
| @base-ui/react Dialog | Modal overlay | `components/ui/dialog.tsx` — already built |
| shadcn Table | Data table | `components/ui/table.tsx` — used in AlertsTable |
| shadcn Badge | Status badges | `components/ui/badge.tsx` — used in AlertsTable |
| shadcn Button | All buttons | Used everywhere |
| lucide-react | Icons (Copy, QrCode, Users, BadgeCheck, Download) | Used everywhere |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| qrcode.react | react-qr-code | react-qr-code is SVG-only (no canvas for download); qrcode.react supports both SVG and Canvas |
| navigator.clipboard | A clipboard library | Clipboard API is built-in, well-supported, no library needed |

**Installation:**
```bash
npm install qrcode.react
```

## Architecture Patterns

### Component Structure
```
components/dashboard/workers/
├── WorkersTab.tsx         # Assembly — same pattern as AlertsTab
├── RegistrationCard.tsx   # JOIN code display + copy + QR trigger
├── QRCodeModal.tsx        # Dialog with QR code + download
└── WorkersTable.tsx       # Worker roster table with badges
```

### Pattern 1: Tab Assembly (from AlertsTab)
**What:** Parent tab component owns mock data, passes to children
**When to use:** Every tab follows this pattern
**Example:**
```typescript
// Source: components/dashboard/alerts/AlertsTab.tsx (existing pattern)
'use client'

import { RegistrationCard } from './RegistrationCard'
import { WorkersTable, MOCK_WORKERS } from './WorkersTable'

interface WorkersTabProps {
  showMockData?: boolean
}

function WorkersTab({ showMockData = false }: WorkersTabProps) {
  const workers = showMockData ? MOCK_WORKERS : []

  return (
    <div className="space-y-6">
      <RegistrationCard />
      <WorkersTable workers={workers} />
    </div>
  )
}
```

### Pattern 2: QR Code with Dual Render (SVG display + Canvas download)
**What:** Show QRCodeSVG for crisp display, use hidden QRCodeCanvas for PNG export
**When to use:** When QR must be both displayed and downloadable
**Example:**
```typescript
// Source: qrcode.react docs (https://github.com/zpao/qrcode.react)
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react'

// Display — use SVG for crisp rendering at any size
<QRCodeSVG value="JOIN ABC123" size={200} level="M" />

// Download — use Canvas ref, call toDataURL
const canvasRef = useRef<HTMLCanvasElement>(null)
<QRCodeCanvas ref={canvasRef} value="JOIN ABC123" size={200} level="M" style={{ display: 'none' }} />

function handleDownload() {
  const canvas = canvasRef.current
  if (!canvas) return
  const url = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.download = 'sidekick-qr-code.png'
  link.href = url
  link.click()
}
```

### Pattern 3: Clipboard Copy with Feedback
**What:** Copy text to clipboard, show brief visual feedback
**Example:**
```typescript
const [copied, setCopied] = useState(false)

async function handleCopy() {
  await navigator.clipboard.writeText('JOIN ABC123')
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
}

// Button shows Check icon briefly after copy, then reverts to Copy icon
```

### Pattern 4: Dialog (base-nova style from existing codebase)
**What:** base-nova Dialog uses `render={}` prop, not `asChild`
**Example:**
```typescript
// Source: components/ui/dialog.tsx (already in codebase)
import {
  Dialog, DialogTrigger, DialogContent,
  DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger render={<Button />}>Show QR Code</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Team QR Code</DialogTitle>
      <DialogDescription>Workers scan this to join your team</DialogDescription>
    </DialogHeader>
    {/* QR code content */}
    <DialogFooter>
      <Button onClick={handleDownload}>
        <Download className="mr-1.5 h-4 w-4" />
        Download PNG
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Anti-Patterns to Avoid
- **Using QRCodeCanvas for display:** SVG is sharper at all sizes and responsive. Canvas is only for the download path.
- **Using `document.execCommand('copy')`:** Deprecated. Use `navigator.clipboard.writeText()`.
- **Building a custom modal:** The Dialog component already exists in `components/ui/dialog.tsx`.
- **Using Radix `asChild` pattern:** This project uses base-nova shadcn which uses `render={}` prop instead.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| QR code generation | Canvas drawing / SVG path math | `qrcode.react` QRCodeSVG | QR encoding is complex with error correction levels, masking patterns |
| Modal dialog | Custom overlay + portal | shadcn Dialog (already built) | Accessibility, focus trapping, ESC handling, backdrop click |
| Data table | Custom div-based table | shadcn Table (already built) | Accessibility, consistent styling with AlertsTable |
| Clipboard copy | `document.execCommand` | `navigator.clipboard.writeText()` | Modern API, returns promise, works in all modern browsers |

**Key insight:** Everything except QR generation already exists in the codebase from prior phases. The only new dependency is `qrcode.react`.

## Common Pitfalls

### Pitfall 1: QRCodeCanvas ref is null on first render in Dialog
**What goes wrong:** Dialog content mounts lazily; canvas ref may be null when download is clicked immediately
**Why it happens:** base-nova Dialog portals content; initial render may not have canvas mounted
**How to avoid:** Use a callback ref or check `canvasRef.current` before calling `toDataURL()`. Alternatively, render the hidden canvas inside the dialog content (not outside).
**Warning signs:** Download button does nothing on first click

### Pitfall 2: Clipboard API requires secure context
**What goes wrong:** `navigator.clipboard.writeText()` fails silently in HTTP (non-HTTPS)
**Why it happens:** Clipboard API requires secure context (HTTPS or localhost)
**How to avoid:** Dev server on localhost is fine. Add try/catch for production safety.
**Warning signs:** Copy button doesn't work in deployed environments without HTTPS

### Pitfall 3: QR code value encoding
**What goes wrong:** QR code scans to wrong text if not formatted correctly
**Why it happens:** The value prop is the raw string; for SMS "JOIN" codes, it should be the full text workers send
**How to avoid:** Use the exact string format: `"JOIN XXXXXX"` as the QR value, or encode as `sms:+18887074659?body=JOIN%20XXXXXX` for direct SMS linking
**Warning signs:** QR code scans but doesn't trigger the right action

### Pitfall 4: Dialog max-width too small for QR code
**What goes wrong:** QR code is cramped or overflows the dialog
**Why it happens:** Default shadcn Dialog `sm:max-w-sm` may be tight for QR + text
**How to avoid:** Override with `className="sm:max-w-md"` on DialogContent if needed
**Warning signs:** QR code looks squished or dialog has horizontal scroll

## Code Examples

### Mock Data Shape (mirrors backend API field names)
```typescript
// Source: CLAUDE.md convention — prop names mirror backend API fields
type WorkerStatus = 'verified' | 'pending'

interface WorkerItem {
  id: string
  name: string
  phone: string
  joinDate: string        // ISO date string
  status: WorkerStatus
}

const MOCK_WORKERS: WorkerItem[] = [
  { id: 'w-001', name: 'Maria Garcia', phone: '+1 (555) 234-5678', joinDate: '2026-03-01', status: 'verified' },
  { id: 'w-002', name: 'James Wilson', phone: '+1 (555) 345-6789', joinDate: '2026-03-05', status: 'verified' },
  { id: 'w-003', name: 'Chen Wei', phone: '+1 (555) 456-7890', joinDate: '2026-03-10', status: 'pending' },
  // ... 6-8 total for balanced demo (mix of verified/pending)
]

const TEAM_JOIN_CODE = 'ABC123'
const TEAM_SMS_NUMBER = '+1 (888) 707-4659'
```

### RegistrationCard Layout
```typescript
// Source: CLAUDE.md screenshot observations — Workers Tab
// Card with: "Workers text this to join:" label, "JOIN XXXXXX" monospace code,
// "Send to: +1 (888) 707-4659" below, Copy ghost button, "Show QR Code" primary CTA

<div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5">
  <SectionHeader title="Worker Registration" action={
    <Dialog>
      <DialogTrigger render={<Button />}>
        <QrCode className="mr-1.5 h-4 w-4" />
        Show QR Code
      </DialogTrigger>
      <DialogContent>
        {/* QRCodeModal content */}
      </DialogContent>
    </Dialog>
  } />

  {/* JOIN code display */}
  <div className="flex items-center gap-3">
    <div>
      <p className="text-xs text-gray-400 dark:text-gray-500">Workers text this to join:</p>
      <p className="font-mono text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-wider">
        JOIN {TEAM_JOIN_CODE}
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500">Send to: {TEAM_SMS_NUMBER}</p>
    </div>
    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={handleCopy}>
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  </div>
</div>
```

### Verified Badge Pattern
```typescript
// Source: CLAUDE.md — Badge component with green verified styling
import { Badge } from '@/components/ui/badge'
import { BadgeCheck } from 'lucide-react'

// In table cell:
{worker.status === 'verified' ? (
  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-transparent">
    <BadgeCheck className="mr-1 h-3 w-3" />
    Verified
  </Badge>
) : (
  <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-transparent">
    Pending
  </Badge>
)}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `document.execCommand('copy')` | `navigator.clipboard.writeText()` | 2020+ | Async, promise-based, modern |
| qrcode.react v3 (QRCode default export) | qrcode.react v4 (QRCodeSVG / QRCodeCanvas named exports) | v4.0.0 | Must use named imports |
| Radix Dialog + `asChild` | base-nova Dialog + `render={}` | shadcn base-nova style | Project-specific: this codebase uses `render={}` |

**Deprecated/outdated:**
- `QRCode` default export from qrcode.react is removed in v4 — use `QRCodeSVG` or `QRCodeCanvas`
- `document.execCommand('copy')` is deprecated — use Clipboard API

## Open Questions

1. **QR code value format: plain text vs SMS deep link**
   - What we know: Screenshots show "JOIN XXXXXX" code and SMS number "+1 (888) 707-4659"
   - What's unclear: Should QR encode plain "JOIN ABC123" or an SMS URI `sms:+18887074659?body=JOIN%20ABC123`?
   - Recommendation: Encode plain "JOIN ABC123" for simplicity. SMS deep linking has inconsistent behavior across devices. The card already shows the phone number.

2. **Worker count display in SectionHeader**
   - What we know: Screenshot shows "0 Workers" heading left, "0 verified" green text right
   - What's unclear: Whether this is a SectionHeader with custom action or a separate heading row
   - Recommendation: Use SectionHeader with title="X Workers" and action showing verified count in green text

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None currently installed |
| Config file | none -- see Wave 0 |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WORK-01 | JOIN code renders monospace, copy button copies to clipboard | unit | N/A -- no test framework | No (Wave 0) |
| WORK-02 | Show QR Code opens modal with QR code, download button works | integration | N/A -- no test framework | No (Wave 0) |
| WORK-03 | Table renders worker columns (name, phone, date, status) | unit | N/A -- no test framework | No (Wave 0) |
| WORK-04 | Verified badge visible on verified workers | unit | N/A -- no test framework | No (Wave 0) |
| WORK-05 | showMockData toggles between data and EmptyState | unit | N/A -- no test framework | No (Wave 0) |

### Sampling Rate
- **Per task commit:** Manual browser verification (dev server)
- **Per wave merge:** Visual review of both light/dark modes
- **Phase gate:** `npm run build` passes without errors

### Wave 0 Gaps
- No test framework installed -- all validation is manual/visual for this project
- `npm run build` serves as the automated quality gate (TypeScript + ESLint)

## Sources

### Primary (HIGH confidence)
- [qrcode.react GitHub](https://github.com/zpao/qrcode.react) - API docs, React 19 peerDep verified in package.json
- Existing codebase: `components/ui/dialog.tsx`, `components/dashboard/alerts/AlertsTable.tsx`, `components/dashboard/alerts/AlertsTab.tsx` - established patterns
- CLAUDE.md - design system, component structure, typography scale, screenshot observations

### Secondary (MEDIUM confidence)
- [npm qrcode.react](https://www.npmjs.com/package/qrcode.react) - version 4.2.0 confirmed
- [qrcode.react download issues](https://github.com/zpao/qrcode.react/issues/37) - canvas toDataURL pattern for download

### Tertiary (LOW confidence)
- QR SMS URI deep linking behavior across devices (not verified, hence recommendation to use plain text)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - qrcode.react is the clear choice, React 19 peerDep verified
- Architecture: HIGH - all patterns directly copied from existing AlertsTab/AlertsTable code
- Pitfalls: MEDIUM - dialog lazy mounting + canvas ref timing needs testing in practice

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable domain, no fast-moving APIs)
