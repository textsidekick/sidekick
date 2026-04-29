# Phase 7: Documents Tab - Research

**Researched:** 2026-03-18
**Domain:** React UI components — file upload zone, integration cards, document table
**Confidence:** HIGH

## Summary

Phase 7 builds the Documents tab with three components: UploadZone (drag-and-drop file upload area), IntegrationsRow (4 integration connector cards with neutral outline buttons), and DocumentsTable (uploaded documents list with mock data toggle). This phase also satisfies two cross-cutting design system requirements: DSN-02 (neutral integration buttons) and DSN-04 (upload zone width constraints).

The codebase has strong established patterns from Phases 4-6. The AlertsTable and WorkersTable provide exact templates for DocumentsTable structure, and the tab assembly pattern (WorkersTab, AlertsTab) provides the DocumentsTab blueprint. No new dependencies are needed — all required UI primitives (Button, Table, Badge, EmptyState, SectionHeader) already exist.

**Primary recommendation:** Follow existing table/tab patterns exactly. The only novel component is UploadZone (drag-and-drop area) and IntegrationsRow (card grid with logos). Neither requires external libraries for v1 (mock-only, no actual file handling).

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DOCS-01 | UploadZone renders drag-and-drop file upload area with dashed border, upload icon, helper text, hover state | Upload zone styling spec from CLAUDE.md design system; HTML drag events for visual feedback |
| DOCS-02 | IntegrationsRow renders 4 integration cards with neutral `variant="outline"` connect buttons | Button component supports `variant="outline"`; CLAUDE.md integration button rule; 2x2 grid layout from screenshot |
| DOCS-03 | DocumentsTable renders document list with name, type, size, upload date columns | Table component exists; AlertsTable/WorkersTable pattern for structure |
| DOCS-04 | Documents tab accepts `showMockData?: boolean` prop for mock data toggle | WorkersTab/AlertsTab provide exact pattern |
| DSN-02 | All integration connect buttons use neutral outline — no brand colors | Button `variant="outline"` is already neutral in base-nova theme |
| DSN-04 | Single-column upload zones constrained with `max-w-2xl` | Documents tab upload is full-width per screenshots; constraint applies to AI Studio (Phase 8). Documents UploadZone does NOT need max-w-2xl |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| react | 19.2.3 | UI framework | Installed |
| next | 16.1.6 | App framework | Installed |
| lucide-react | 0.577.0 | Icons (Upload, FileText, Cloud, RefreshCw, etc.) | Installed |
| tailwindcss | 4.2.1 | Styling | Installed |

### Supporting (Already Installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| @base-ui/react | 1.3.0 | shadcn base-nova primitives (Button, Table, Badge) | Installed |
| class-variance-authority | 0.7.1 | Variant styling | Installed |

### No New Dependencies Required
This phase requires zero new package installations. The UploadZone is a visual-only mock (no actual file processing in v1). Integration buttons are non-functional connectors (OAuth is v2). All UI primitives are already available.

## Architecture Patterns

### Component Structure
```
components/dashboard/documents/
  UploadZone.tsx        # Drag-and-drop file upload area (visual only, no file handling)
  IntegrationsRow.tsx   # 2x2 grid of integration connector cards
  DocumentsTable.tsx    # Document list table with empty state
  DocumentsTab.tsx      # Assembly component (showMockData prop)
```

### Pattern 1: Tab Assembly (from WorkersTab/AlertsTab)
**What:** Top-level tab component receives `showMockData` prop, passes data to children.
**When to use:** Every tab follows this pattern.
**Example:**
```typescript
// Source: components/dashboard/workers/WorkersTab.tsx (verified in codebase)
interface DocumentsTabProps {
  showMockData?: boolean
}

function DocumentsTab({ showMockData = false }: DocumentsTabProps) {
  const documents = showMockData ? MOCK_DOCUMENTS : []

  return (
    <div className="space-y-6">
      <UploadZone />
      <IntegrationsRow />
      <DocumentsTable documents={documents} />
    </div>
  )
}
```

### Pattern 2: Table with Empty State (from WorkersTable/AlertsTable)
**What:** Card wrapper with SectionHeader, conditional EmptyState or Table render.
**When to use:** DocumentsTable follows this exactly.
**Example:**
```typescript
// Source: components/dashboard/workers/WorkersTable.tsx (verified in codebase)
function DocumentsTable({ documents }: DocumentsTableProps) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5">
      <SectionHeader
        title={`${documents.length} Documents`}
        action={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-md"><RefreshCw className="h-4 w-4" /></Button>}
      />
      {documents.length === 0 ? (
        <EmptyState icon={FileText} title="No documents uploaded" description="..." />
      ) : (
        <Table>...</Table>
      )}
    </div>
  )
}
```

### Pattern 3: Upload Zone (new component, CLAUDE.md spec)
**What:** Dashed-border drop area with icon, title, and helper text. Visual hover feedback.
**When to use:** Documents tab (full width) and AI Studio (max-w-2xl constrained).
**Design spec from CLAUDE.md:**
```
border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl
bg-white dark:bg-[var(--card-bg)]
hover:border-blue-300 hover:bg-blue-50/30 dark:hover:border-blue-700
transition-colors duration-150 cursor-pointer
min-h-[160px] flex flex-col items-center justify-center gap-3
```

**Important distinction:** The Documents tab UploadZone is full-width (no max-w constraint). Only AI Studio's VideoUpload needs `max-w-2xl` per CLAUDE.md and screenshot observations. DSN-04 applies to "single-column upload zones" which is the AI Studio video walkthrough, not the Documents upload.

### Pattern 4: Integration Cards (new component)
**What:** 2x2 grid of integration connector cards, each with service name/description and a neutral outline connect button.
**Screenshot observation:** Documents tab shows a 2x2 grid layout (NOT a 4-column row), labeled "Import from Integrations".
**Critical rule from CLAUDE.md:** Integration connect buttons MUST use `variant="outline"` with neutral styling. NEVER blue, orange, or purple fills. The service logo provides brand recognition; the button stays calm.

```typescript
// Each integration card structure
<div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      {/* Service icon/logo */}
      <span className="text-base font-semibold text-gray-900 dark:text-white">Google Drive</span>
    </div>
    <Button variant="outline">Connect</Button>
  </div>
</div>
```

### Anti-Patterns to Avoid
- **Brand-colored integration buttons:** This is THE most important visual fix. Never `bg-blue-600` on Google Drive, `bg-orange-500` on Dropbox, or `bg-purple-600` on Microsoft 365.
- **Using shadcn `<Card>` component:** Always use raw `<div>` with the exact card class string from CLAUDE.md.
- **Full-width stretch on single-column upload zones:** Documents upload IS full-width (OK). AI Studio is constrained (Phase 8).
- **Using `<form>` for upload:** No `<form>` tags per CLAUDE.md. Use `onClick` to trigger file input.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Table structure | Custom div-based table | shadcn Table/TableHeader/TableBody/TableRow/TableHead/TableCell | Already used in AlertsTable and WorkersTable |
| Empty states | Inline icon + text | EmptyState shared component | CLAUDE.md mandate, consistency |
| Section headers | Custom heading divs | SectionHeader shared component | Already exists, used in all tables |
| Buttons | Custom styled buttons | shadcn Button with variant="outline" | Consistent theming, accessibility |
| File type badges | Custom styled spans | shadcn Badge variant="secondary" | Consistent with AlertsTable severity badges |

## Common Pitfalls

### Pitfall 1: Brand Colors on Integration Buttons
**What goes wrong:** Developer instinctively uses Google blue, Dropbox blue, Gusto orange, Microsoft purple on connect buttons.
**Why it happens:** Natural to associate service with brand color.
**How to avoid:** ALL integration buttons use `variant="outline"` only. No className overrides for color. The CLAUDE.md file calls this "THE single most important visual fix."
**Warning signs:** Any `bg-blue-600`, `bg-orange-500`, `bg-purple-600` on a connect button.

### Pitfall 2: Using shadcn Card Component
**What goes wrong:** Import `Card` from `@/components/ui/card` instead of using raw div with exact class string.
**Why it happens:** Seems natural to use the available primitive.
**How to avoid:** Always use raw `<div>` with `rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5`.
**Warning signs:** Any import of Card from ui/card.

### Pitfall 3: Confusing DSN-04 Scope
**What goes wrong:** Applying `max-w-2xl` to Documents tab UploadZone.
**Why it happens:** DSN-04 says "single-column upload zones constrained with max-w-2xl" — but Documents upload is NOT single-column in isolation. It's the full-width drop area per screenshots.
**How to avoid:** Documents UploadZone = full width within the card/section. AI Studio VideoUpload (Phase 8) = `max-w-2xl`.
**Warning signs:** UploadZone with max-w-2xl in the Documents tab.

### Pitfall 4: Using form Tag for Upload
**What goes wrong:** Wrapping upload zone in `<form>` with `encType="multipart/form-data"`.
**Why it happens:** Standard HTML file upload pattern.
**How to avoid:** Use a hidden `<input type="file">` triggered by onClick. No `<form>` tags per CLAUDE.md.

### Pitfall 5: Integration Logos as External Images
**What goes wrong:** Using `<img>` tags for Google Drive, Dropbox, etc. logos that may fail to load.
**Why it happens:** Natural to use service brand logos.
**How to avoid:** Use Lucide icons as stand-ins. STATE.md notes: "Integration connector SVG logos not yet sourced." Use appropriate Lucide icons (Cloud, HardDrive, etc.) as monochrome placeholders that work in both light and dark mode. This avoids dark-mode visibility issues with colored SVG logos.

## Code Examples

### Mock Data Shape for DocumentsTable
```typescript
interface DocumentItem {
  id: string
  name: string
  type: string        // 'PDF' | 'Word' | 'Excel' | 'Text'
  size: string        // Human-readable: '2.4 MB'
  uploadDate: string  // ISO date string: '2026-03-10'
}

const MOCK_DOCUMENTS: DocumentItem[] = [
  { id: 'd1', name: 'Employee Safety Manual', type: 'PDF', size: '2.4 MB', uploadDate: '2026-03-01' },
  { id: 'd2', name: 'Equipment Checklist', type: 'Word', size: '156 KB', uploadDate: '2026-03-05' },
  { id: 'd3', name: 'Shift Schedule Template', type: 'Excel', size: '89 KB', uploadDate: '2026-03-08' },
  { id: 'd4', name: 'Onboarding Guide', type: 'PDF', size: '1.8 MB', uploadDate: '2026-03-10' },
  { id: 'd5', name: 'Cleaning Procedures', type: 'PDF', size: '3.1 MB', uploadDate: '2026-03-12' },
  { id: 'd6', name: 'Emergency Contacts', type: 'Text', size: '12 KB', uploadDate: '2026-03-15' },
]
```

### Integration Data Shape
```typescript
interface IntegrationItem {
  id: string
  name: string          // 'Google Drive' | 'Dropbox' | 'Gusto' | 'Microsoft 365'
  description: string   // Brief helper text
  icon: LucideIcon      // Lucide placeholder icon
  connected: boolean    // Always false in v1
}
```

### UploadZone Drag Visual Feedback
```typescript
// Visual-only drag state (no actual file processing in v1)
const [isDragOver, setIsDragOver] = useState(false)

<div
  className={cn(
    'border-2 border-dashed rounded-xl bg-white dark:bg-[var(--card-bg)] min-h-[160px] flex flex-col items-center justify-center gap-3 transition-colors duration-150 cursor-pointer',
    isDragOver
      ? 'border-blue-400 bg-blue-50/30 dark:border-blue-600'
      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50/30 dark:hover:border-blue-700'
  )}
  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
  onDragLeave={() => setIsDragOver(false)}
  onDrop={(e) => { e.preventDefault(); setIsDragOver(false) }}
  onClick={() => { /* trigger hidden input */ }}
>
  <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" />
  <div className="text-center">
    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Drop files here or click to upload</p>
    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PDF, Word, Excel, or text files</p>
  </div>
</div>
```

### Page.tsx Integration
```typescript
// In app/dashboard/page.tsx, replace the Documents EmptyState placeholder:
{activeTab === 'documents' && <DocumentsTab showMockData={true} />}
```

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Colored integration buttons | Neutral outline buttons | Core visual fix per CLAUDE.md |
| Bare empty state (icon + text) | EmptyState component (icon container + title + description + action) | Better onboarding UX |
| Generic upload area | Styled dashed-border zone with drag feedback | Visual polish |

## Open Questions

1. **Integration logos**
   - What we know: STATE.md flags "Integration connector SVG logos not yet sourced"
   - What's unclear: Whether to use Lucide icons, inline SVGs, or external images
   - Recommendation: Use Lucide icons as monochrome placeholders (Cloud, HardDrive, Building2, Monitor). These are dark-mode safe and avoid external asset dependencies. Can be swapped for real logos later.

2. **File type column display**
   - What we know: Requirements say "type" column; documents have types like PDF, Word, Excel, Text
   - Recommendation: Use Badge component with neutral styling for file type, similar to severity badges in AlertsTable. Color-code subtly by type (e.g., red-ish for PDF, blue for Word, green for Excel).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DOCS-01 | UploadZone renders with dashed border, icon, helper text, hover state | manual-only | Visual inspection in browser | N/A |
| DOCS-02 | IntegrationsRow renders 4 cards with neutral outline buttons | manual-only | Visual inspection — verify no brand colors | N/A |
| DOCS-03 | DocumentsTable renders columns: name, type, size, upload date | manual-only | Visual inspection with showMockData=true | N/A |
| DOCS-04 | showMockData prop toggles mock data vs EmptyState | manual-only | Toggle prop in page.tsx, verify both states | N/A |
| DSN-02 | All connect buttons use variant="outline", no brand colors | manual-only | Visual inspection + code review for bg-blue/orange/purple | N/A |
| DSN-04 | Upload zone width constraints | manual-only | Documents = full width (OK); AI Studio = max-w-2xl (Phase 8) | N/A |

### Sampling Rate
- **Per task commit:** `npx next build` (type-check + build verification)
- **Per wave merge:** Visual inspection in browser (light + dark mode)
- **Phase gate:** Build succeeds + all 4 components render correctly in both themes

### Wave 0 Gaps
None -- no test framework exists in the project. All validation is build verification + visual inspection, consistent with Phases 4-6.

## Sources

### Primary (HIGH confidence)
- CLAUDE.md — Design system spec (upload zone classes, integration button rules, card anatomy, typography scale)
- Existing codebase — WorkersTable.tsx, WorkersTab.tsx, AlertsTable.tsx, AlertsTab.tsx (verified patterns)
- STATE.md — Blocker note about integration logos not sourced

### Secondary (MEDIUM confidence)
- Screenshot observations in CLAUDE.md memory — Documents tab layout (2x2 integration grid, full-width upload zone)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new dependencies, all primitives exist
- Architecture: HIGH — exact patterns verified from AlertsTable, WorkersTable, WorkersTab, AlertsTab
- Pitfalls: HIGH — CLAUDE.md is extremely explicit about integration button rules and card anatomy

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable — no external dependencies changing)
