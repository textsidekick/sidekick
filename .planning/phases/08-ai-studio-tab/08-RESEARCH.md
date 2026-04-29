# Phase 8: AI Studio Tab - Research

**Researched:** 2026-03-18
**Domain:** React component composition, drag-and-drop upload zone, mock data patterns
**Confidence:** HIGH

## Summary

Phase 8 builds the AI Studio tab -- three new components (`VideoUpload`, `KnowledgeGaps`, `AIStudioTab`) following the exact same patterns established in Phases 4-7. This is the simplest tab in the dashboard: two sections (video upload + knowledge gaps), no tables with complex data, no integration cards. The primary technical concern is the `max-w-2xl` constraint on `VideoUpload` (DSN-04) and the custom amber button styling on `KnowledgeGaps`.

All patterns needed are already proven in the codebase. `UploadZone` (Documents tab) provides the drag-and-drop template. `EmptyState` handles the no-data state. `SectionHeader` handles section headings. The tab assembly follows the `DocumentsTab`/`AlertsTab` pattern exactly.

**Primary recommendation:** Copy `UploadZone` as the starting template for `VideoUpload`, modify file accept types to video, wrap in `max-w-2xl`, and add the purple icon container + tips section from the screenshot. Build `KnowledgeGaps` as a card with `SectionHeader` + amber CTA button + conditional mock data / `EmptyState`.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AIST-01 | VideoUpload renders a drag-and-drop video upload zone constrained to `max-w-2xl` (never full-width) | Reuse UploadZone pattern from Documents tab; wrap in `max-w-2xl` div; change accept to video types |
| AIST-02 | KnowledgeGaps section renders gap analysis area with "Analyze Gaps" CTA using amber styling | SectionHeader + Button with `className="bg-amber-500 hover:bg-amber-600 text-white"` |
| AIST-03 | AI Studio tab accepts `showMockData?: boolean` prop -- when true, knowledge gaps populates with mock data | Follow AlertsTab/DocumentsTab pattern: conditional data pass-through |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19 | Component framework | Project standard |
| Next.js | 16.1.6 | App framework | Project standard |
| Tailwind CSS | v4 | Styling | Project standard, `@theme inline` in globals.css |
| lucide-react | latest | Icons | Only icon library allowed (DSN-06) |

### Supporting (already installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @base-ui/react | latest | shadcn base-nova primitives | Button component |
| class-variance-authority | latest | Variant styles | Button variants |

### No New Dependencies
Phase 8 requires zero new npm installs. Everything needed is already in the project.

## Architecture Patterns

### Component Structure
```
components/dashboard/ai-studio/
  AIStudioTab.tsx      # Assembly component (like DocumentsTab)
  VideoUpload.tsx      # Drag-and-drop video zone with max-w-2xl
  KnowledgeGaps.tsx    # Gap analysis section with amber CTA
```

### Pattern 1: Tab Assembly (proven in 4 prior tabs)
**What:** Top-level tab component receives `showMockData` prop, conditionally passes data to children.
**When to use:** AIStudioTab assembly.
**Example (from DocumentsTab):**
```typescript
'use client'

interface AIStudioTabProps {
  showMockData?: boolean
}

function AIStudioTab({ showMockData = false }: AIStudioTabProps) {
  const gaps = showMockData ? MOCK_GAPS : []
  return (
    <div className="space-y-6">
      <VideoUpload />
      <KnowledgeGaps gaps={gaps} />
    </div>
  )
}
```

### Pattern 2: Upload Zone (proven in UploadZone.tsx)
**What:** Hidden file input + styled dashed-border div with drag events.
**When to use:** VideoUpload component.
**Key differences from UploadZone:**
- File accept: `.mp4,.mov` (video, not documents)
- Wrapped in `max-w-2xl` (CLAUDE.md non-negotiable)
- Purple icon container above the zone (per screenshot)
- Tips section below with bullet points
- Helper text: "Upload facility walkthrough video" + "MP4, MOV up to 100MB . 1-5 minutes recommended"

### Pattern 3: Section with Conditional Empty State (proven in AlertsTable, DocumentsTable)
**What:** Card wrapper with SectionHeader, renders data list when populated, EmptyState when empty.
**When to use:** KnowledgeGaps component.

### Pattern 4: Custom-Styled Button (proven in AlertsTab severity badges)
**What:** Override button styles with className for non-standard colors.
**When to use:** "Analyze Gaps" amber button.
**Example:**
```typescript
<Button
  className="bg-amber-500 hover:bg-amber-600 text-white border-transparent"
>
  Analyze Gaps
</Button>
```

### AI Studio Page Layout (from screenshot observations in MEMORY.md)
The AI Studio tab has a distinctive page heading not seen in other tabs:
- **Page heading:** "Create Content" with sparkle icon + subtitle
- **Video Walkthrough section:** purple icon container (48x48, rounded-xl) + title + subtitle + max-w-2xl upload zone + tips
- **Knowledge Gaps section:** amber icon container + title + subtitle + "Analyze Gaps" button + gap list or empty state

### Anti-Patterns to Avoid
- **Full-width VideoUpload:** The upload zone MUST be inside `max-w-2xl`. This is the single most important constraint in this phase.
- **Using `shadow-[var(--card-shadow)]`:** Must use `[box-shadow:var(--card-shadow)]` (Tailwind v4 arbitrary CSS property syntax).
- **Brand-colored icon containers using bg-primary:** Use specific color classes like `bg-purple-100 dark:bg-purple-900/30` for the video icon and `bg-amber-100 dark:bg-amber-900/30` for the gaps icon.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Empty states | Custom icon + text | `EmptyState` component | DSN-03 compliance, consistent pattern |
| Section headings | Custom heading divs | `SectionHeader` component | Already built, consistent spacing |
| Drag-and-drop zone | Custom from scratch | Clone `UploadZone` pattern | Proven drag events, accessible hidden input, consistent styling |
| Card wrappers | Inline class strings | Copy exact card anatomy from CLAUDE.md | `rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5` |

## Common Pitfalls

### Pitfall 1: VideoUpload Goes Full-Width
**What goes wrong:** Upload zone stretches across full container on wide monitors.
**Why it happens:** Forgetting the `max-w-2xl` wrapper.
**How to avoid:** The upload zone div or its parent MUST have `max-w-2xl` class.
**Warning signs:** Zone is wider than ~672px on desktop.

### Pitfall 2: Amber Button Loses Styling Due to CVA Defaults
**What goes wrong:** The `bg-amber-500` className gets overridden by the default button variant's `bg-primary`.
**Why it happens:** CVA's `variant="default"` applies `bg-primary` which has equal specificity.
**How to avoid:** Either pass no variant (and override fully) or use `className` that overrides. The safest approach: don't set `variant` at all, or explicitly set the border to transparent since the base CVA includes `border border-transparent`.
**Warning signs:** Button appears blue instead of amber.

### Pitfall 3: Missing Page Heading
**What goes wrong:** AI Studio tab looks different from screenshot because it has a distinctive "Create Content" page heading with sparkle icon.
**Why it happens:** Other tabs don't have this heading pattern; easy to miss.
**How to avoid:** Include the "Create Content" heading + subtitle as the first element in AIStudioTab, before the sections.

### Pitfall 4: Dark Mode Icon Container Colors
**What goes wrong:** Purple/amber icon containers look washed out or invisible in dark mode.
**Why it happens:** Using only light-mode color classes.
**How to avoid:** Use paired classes: `bg-purple-100 dark:bg-purple-900/30` for containers, `text-purple-600 dark:text-purple-400` for icons.

## Code Examples

### VideoUpload Component Skeleton
```typescript
'use client'

import { useRef, useState } from 'react'
import { Video, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoUploadProps {}

function VideoUpload({}: VideoUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5">
      {/* Icon container + heading */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
          <Video className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Video Walkthrough
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Upload a video walkthrough of your facility to train the AI
          </p>
        </div>
      </div>

      {/* Upload zone - MUST be max-w-2xl */}
      <div className="max-w-2xl">
        <input type="file" ref={fileInputRef} accept=".mp4,.mov" className="hidden" />
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
          onClick={() => fileInputRef.current?.click()}
        >
          {/* Upload icon + helper text */}
        </div>
      </div>

      {/* Tips section */}
      <div className="mt-4 max-w-2xl">
        {/* Lightbulb + tips bullets */}
      </div>
    </div>
  )
}

export { VideoUpload }
export type { VideoUploadProps }
```

### KnowledgeGaps with Amber Button
```typescript
'use client'

import { Lightbulb, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

interface KnowledgeGap {
  id: string
  question: string
  frequency: number
  category: string
}

interface KnowledgeGapsProps {
  gaps: KnowledgeGap[]
}

function KnowledgeGaps({ gaps }: KnowledgeGapsProps) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5">
      {/* Icon + heading + Analyze Gaps button */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
            <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Generate from Knowledge Gaps
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Create policies based on unanswered worker questions
            </p>
          </div>
        </div>
        <Button className="bg-amber-500 hover:bg-amber-600 text-white border-transparent">
          Analyze Gaps
        </Button>
      </div>

      {/* Gap list or empty state */}
      {gaps.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No knowledge gaps detected yet"
          description="..."
        />
      ) : (
        /* Render gap items */
      )}
    </div>
  )
}
```

### Mock Data Shape
```typescript
const MOCK_GAPS: KnowledgeGap[] = [
  { id: '1', question: 'What is the proper procedure for chemical spills?', frequency: 12, category: 'Safety' },
  { id: '2', question: 'Where are the emergency exits on the second floor?', frequency: 8, category: 'Safety' },
  { id: '3', question: 'What are the overtime policies for weekend shifts?', frequency: 6, category: 'HR' },
  { id: '4', question: 'How do I report a broken piece of equipment?', frequency: 5, category: 'Equipment' },
]
```

### Dashboard Page Wiring
```typescript
// In app/dashboard/page.tsx, replace the EmptyState placeholder:
import { AIStudioTab } from '@/components/dashboard/ai-studio/AIStudioTab'

// Replace:
{activeTab === 'ai-studio' && <EmptyState ... />}
// With:
{activeTab === 'ai-studio' && <AIStudioTab showMockData={true} />}
```

## State of the Art

No technology changes relevant to this phase. All patterns are established in the existing codebase from Phases 4-7.

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `shadow-[var(...)]` | `[box-shadow:var(...)]` | Phase 1 discovery | Tailwind v4 requires explicit CSS property syntax for multi-value shadows |

## Open Questions

1. **Exact "Create Content" heading placement**
   - What we know: Screenshot shows "Create Content" with sparkle icon as a page-level heading above both sections
   - What's unclear: Whether this heading should be inside AIStudioTab or handled differently from other tabs
   - Recommendation: Include it as the first element inside AIStudioTab -- this is consistent with how other tabs own their full layout

2. **Icon choice for Knowledge Gaps section**
   - What we know: Screenshot mentions "lightbulb" for empty state; section icon appears to be a lightning/zap icon in amber
   - What's unclear: Exact Lucide icon names intended
   - Recommendation: Use `Zap` for the section header icon container, `Lightbulb` for the empty state icon (matches screenshot description in MEMORY.md)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual visual verification (no automated test framework configured) |
| Config file | none |
| Quick run command | `npx next build` (compile check) |
| Full suite command | `npx next build` + manual visual review in browser |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AIST-01 | VideoUpload renders with max-w-2xl constraint | manual | `npx next build` (compile only) | N/A |
| AIST-02 | KnowledgeGaps renders with amber Analyze Gaps button | manual | `npx next build` (compile only) | N/A |
| AIST-03 | showMockData toggles between mock data and EmptyState | manual | `npx next build` (compile only) | N/A |

### Sampling Rate
- **Per task commit:** `npx next build` (ensures no TypeScript/compilation errors)
- **Per wave merge:** Visual review in browser (both light and dark mode)
- **Phase gate:** Full build + visual review of AI Studio tab in both modes

### Wave 0 Gaps
None -- no automated test infrastructure exists in this project; validation is compile check + manual visual review, consistent with all prior phases.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `components/dashboard/documents/UploadZone.tsx` -- proven drag-and-drop pattern
- Existing codebase: `components/dashboard/documents/DocumentsTab.tsx` -- tab assembly pattern
- Existing codebase: `components/dashboard/alerts/AlertsTab.tsx` -- showMockData conditional pattern
- Existing codebase: `components/dashboard/shared/EmptyState.tsx` -- empty state component API
- Existing codebase: `components/dashboard/shared/SectionHeader.tsx` -- section header API
- CLAUDE.md -- all design system rules, card anatomy, upload zone styling, button rules
- MEMORY.md -- screenshot observations for AI Studio tab layout

### Secondary (MEDIUM confidence)
- None needed -- all patterns are established in codebase

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero new dependencies, everything already installed
- Architecture: HIGH -- all three components follow patterns proven in 4+ prior tabs
- Pitfalls: HIGH -- known pitfalls are documented from prior phase experience (shadow syntax, max-w-2xl, dark mode)

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable -- no external dependencies to change)
