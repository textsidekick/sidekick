# Feature Landscape

**Domain:** Manager dashboard for frontline/deskless worker teams (restaurant, warehouse, retail)
**Product:** Sidekick — AI-powered SMS assistant. Dashboard is the manager control plane.
**Researched:** 2026-03-13
**Confidence:** HIGH for table stakes (established across all major platforms), MEDIUM for differentiators (AI-specific features are newer category)

---

## Research Method

External search tools were unavailable. This analysis draws on training knowledge of the frontline worker management software market (Beekeeper, Deputy, Homebase, 7shifts, Connecteam, WorkJam, HotSchedules/Fourth, Sling, Wisp, Crew, Guild) through August 2025. This is a mature, well-documented market. Confidence in table stakes features is HIGH — these appear consistently across all platforms and are frequently cited in user research published by vendors.

---

## Who the Manager Actually Is

This is the single most important framing. A frontline manager at a restaurant, warehouse, or retail location is not an analyst. They are:

- On the floor most of the day, not at a desk
- Opening the dashboard once per shift, maybe twice
- Under time pressure — if it takes more than 10 seconds to understand, they move on
- Managing 10-50 workers who don't have work email, may not speak English as first language, and are accessed via SMS
- Judged on: team showing up, safety incidents staying low, and new people getting up to speed fast

The dashboard competes with a text message. If a manager can get the same answer by texting their floor lead, the dashboard loses.

---

## Table Stakes

Features managers expect. Missing = dashboard feels incomplete or untrustworthy.

### Analytics Tab

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Total questions asked (KPI card) | Managers need to know if their team is using the tool — adoption is the first question every manager asks after deploying any new tool | Low | Single number + trend direction |
| Active users count / percentage | Distinct from questions asked — shows breadth of adoption, not just depth | Low | "8 of 12 workers active this week" format is most intuitive |
| Time-range selector (7d / 30d / 90d) | Managers need to know if adoption is trending up or down, not just where it stands today | Low | 3-option segmented control is standard; daily granularity for 7d, weekly for 30d+ |
| Questions over time chart | The trend is more actionable than a single number — a dip signals a problem | Medium | Bar chart preferred over line for discrete time periods; area chart if you want to show cumulative |
| Recent questions feed | Managers want to know what their team is asking — it surfaces training gaps and worker anxiety in real time | Low | Last 10-20 questions, worker name/number, timestamp, question text |
| Activity feed / audit log | "What happened while I was off the floor" — shift changes, new workers, uploaded docs, resolved alerts | Low | Reverse-chronological, mix of event types |

**Why analytics is expected but not the #1 tab:** Managers open dashboards to act, not to analyze. Analytics is validating, not urgent. The Alerts tab is what wakes a manager up at night — analytics is what they review when things are going well.

### Alerts Tab

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Alert count KPI (open alerts) | The number of unresolved safety issues is the first thing a manager needs to see | Low | If this number is non-zero, it demands attention before anything else |
| Alert severity classification | Not all issues are equal — a temperature violation and a slip-and-fall report require different urgency | Low | 3-tier max: Critical / Warning / Info. More than 3 tiers creates decision paralysis |
| Timestamp on each alert | Managers need to know if an issue is from 5 minutes ago or 5 days ago | Low | Relative time ("2 hours ago") plus absolute on hover |
| Worker name / location on each alert | Without attribution, a manager can't follow up | Low | If Sidekick is SMS-based, this is the phone number / worker ID |
| Alert status management (open / resolved) | Without a way to mark alerts resolved, the list grows infinitely and becomes noise | Low | One-click resolve with optional note |
| Filtered view by status (open / resolved / all) | Managers need to see historical context as well as active issues | Low | Segmented control above the table |
| Alert description / message content | The full text of what the worker reported — without this the manager has to go find the SMS thread | Low | Expandable row or full text in the table |

**Why alerts is the highest-value tab:** Safety incidents in frontline environments carry legal and operational weight that nothing else does. A missed alert can become an OSHA violation. Managers expect this to be front and center. Per PROJECT.md, this is correctly identified as the highest priority tab.

### Documents Tab

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| File upload (drag-and-drop) | Documents are how the AI learns — uploading is the primary action on this tab | Medium | Standard drag-and-drop pattern; support PDF, DOCX, TXT at minimum |
| Uploaded documents list | Managers need to know what's already in the AI knowledge base | Low | Name, type, upload date, uploader, size |
| Delete / remove document | Knowledge bases go stale; managers need to be able to remove outdated SOPs | Low | Confirmation dialog required — destructive action |
| Integration connectors (Google Drive, Dropbox) | Most frontline managers already have SOPs in Google Drive or Dropbox — asking them to re-upload is friction | Medium | OAuth flow; list files, select, pull into Sidekick |

**Why integrations are table stakes:** In the frontline segment, documents live in Google Drive shared by the franchise/brand owner, or in Dropbox. A manager who has to download then re-upload docs will abandon the feature. The integrations reduce this to one click.

### Workers Tab

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Worker roster / list | Managers need to see who is registered on Sidekick | Low | Name, join date, phone number (masked), status |
| JOIN code display | Frontline onboarding is always code-based — workers text a code to join; manager needs to see/share this code | Low | Big, copyable, visually prominent |
| QR code for JOIN code | QR codes on break room posters are the dominant onboarding pattern in restaurant/retail | Low | Generate, display in modal, download for printing |
| Worker verification status | Managers need to know who has completed onboarding vs who just joined | Low | Verified badge; unverified = onboarding incomplete |
| Worker count KPI | "How many people are on Sidekick" at a glance | Low | Absolute number; percentage of team if total headcount is known |

---

## Differentiators

Features that make this dashboard meaningfully better than generic alternatives. Not expected by managers arriving for the first time, but highly valued once discovered.

### Analytics Tab — Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Per-worker question breakdown | "Who's not using it" is a coaching signal — a manager who sees one worker has asked 0 questions in 2 weeks has an actionable conversation to have | Medium | Table below the chart: worker name, questions asked, last active |
| Most-asked question categories | Aggregate themes from questions (scheduling, safety, policy, etc.) reveal where the team lacks confidence — this is something no traditional HR tool surfaces | High | Requires AI categorization on the backend; in MVP can be manual tags |
| Usage by shift / time of day | Frontline usage clusters around start of shift and break times — knowing when workers engage helps managers time push notifications | High | Heatmap or bar-by-hour chart; likely post-MVP |
| Comparison to previous period | "Up 23% from last month" is more useful than an absolute number for driving action | Low | Delta badge on every KPI card; very low implementation cost for high perceived value |

### Alerts Tab — Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Resolution time tracking | Average time from alert open to resolved — surfaces whether safety issues are being acted on quickly or sitting | Medium | Requires timestamps on open + resolved; shown as "Avg. 4h response" in the KPI row |
| Alert trend (are we improving?) | A manager who sees alerts decreasing knows their interventions are working | Low | Spark line or trend badge on the alert count KPI |
| Alert detail with AI suggested response | "Based on similar past incidents, here's what to check" — turns reactive into proactive | High | AI-generated; clearly post-MVP |
| Bulk resolve | For multi-location managers reviewing many low-severity alerts at once | Medium | Checkbox + bulk action; only valuable at 20+ alerts/week volume |

### Documents Tab — Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Document-to-question mapping | "Your workers asked 14 questions that this new SOP would have answered" — shows ROI of uploading | High | Requires AI matching; high-value but post-MVP |
| Document coverage score | Percentage of question categories that have supporting documents — creates urgency to upload | High | Requires AI analysis |
| Version management (replace document) | SOPs get updated; managers need to update without re-uploading and losing history | Medium | Replace existing doc, retain old version, notify connected workers |
| Preview before upload | Confirm the right file was selected before adding to the AI knowledge base | Low | PDF/image preview in upload zone; low complexity, high confidence boost |

### AI Studio Tab — Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Knowledge gap analysis | "Here are 5 topics your workers asked about that no document covers" — proactive rather than reactive | High | Core AI capability; this is Sidekick's actual product differentiator |
| Video walkthrough upload | Operations managers often demo tasks on video — allowing video as a training input is meaningfully more capable than PDF-only | Medium | Upload zone already specced; transcription/analysis on backend |
| Suggested document topics | Based on gaps, AI recommends what to write — not just what's missing but what to create | High | LLM-generated; high complexity but creates clear action for the manager |
| AI confidence score per topic | "The AI is 60% confident it can answer scheduling questions correctly" — shows where to add more docs | Medium | Requires backend inference scoring; very differentiated |

### Workers Tab — Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Per-worker engagement summary | Click a worker row to see their question history, join date, last active, onboarding completion — turns roster into a coaching tool | Medium | Drill-down view or side panel |
| Bulk invite via CSV | For managers onboarding a large team at once (warehouse opening, new location) | Medium | CSV upload: phone numbers → send JOIN codes via Sidekick SMS |
| Language preference indicator | Sidekick is SMS-based; knowing a worker's preferred language helps managers customize their approach | Low | Tag on worker row; data comes from AI conversation history |
| Onboarding completion percentage | Team-level view: "7 of 12 workers have completed onboarding" drives the manager to chase the remaining 5 | Low | Progress bar or fraction; very low complexity for clear value |

---

## Anti-Features

Features that would add complexity without value for this specific user type. Explicitly do not build these.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Real-time data / live updates / WebSockets | Frontline managers open the dashboard once per shift — they do not need live data; real-time creates complexity, battery/bandwidth overhead, and gives the impression something is always on fire | Refresh on tab load + manual refresh button |
| Complex filter/facet system on tables | The tables in this dashboard will have 10-50 rows at most for SMB customers; complex filters are over-engineering for the data volume | Simple segmented control (2-3 options) + single search field |
| Calendar / scheduling features | This is not a scheduling tool; adding scheduling pulls focus from the AI assistant value proposition and competes with tools managers already have (Homebase, 7shifts) | Deep link to existing scheduling tool if needed |
| Payroll or hours tracking | Same as above — out of scope for this product; Gusto integration is for document import, not payroll processing | Surface the integration as document source only |
| Push notification configuration | Complex notification settings (triggers, thresholds, channels) are an enterprise feature; SMB managers do not want to configure; they want sensible defaults | Default to "email on new critical alert" — no configuration UI needed for v1 |
| Role-based permissions within dashboard | SMB = one manager per location; multi-role access management is enterprise complexity that this segment does not need | Single manager account per location for v1 |
| Custom report builder / data export | Frontline managers do not build reports; their GMs might, but that's a different user; export creates support burden | Pre-built summary cards cover 95% of manager needs |
| Chat / messaging interface within dashboard | The product is SMS; adding a dashboard chat layer creates a second communication channel the manager has to monitor | Keep communication in SMS; dashboard is read-only insights |
| Gamification / leaderboards | Frontline workers respond to direct manager feedback, not abstract points systems; leaderboards create resentment in shift-based environments | Usage stats visible to manager only, not ranked comparisons |
| Onboarding wizard / multi-step setup flow | Managers are opening this at 7am; if setup takes more than 2 steps, they call support | First-run experience = empty states with clear single-action CTAs (exactly what the spec already calls for) |

---

## Feature Dependencies

```
Workers tab (JOIN code) → Analytics (active users count only meaningful with workers registered)
Documents tab (upload) → AI Studio (knowledge gaps only surface after docs are in the system)
Documents tab (integrations) → Documents table (connected docs appear alongside manual uploads)
Analytics (questions feed) → AI Studio (questions with no good answer = a knowledge gap)
Alerts (alert count) → Analytics (high alert volume correlates with low-quality AI responses)
```

**Critical ordering implication:** A manager's first session is always Workers → Documents → wait → Analytics/Alerts. The dashboard should guide this path through empty states: Workers tab empty state says "No workers yet — share your JOIN code." Documents tab empty state says "No documents — the AI needs these to answer questions." Analytics and Alerts empty states say "Nothing to show yet — invite your team first."

---

## MVP Recommendation

### Build for Day 1 (table stakes only)

1. **Workers tab** — JOIN code + QR code + roster table with verified badge. This is the prerequisite for everything else. Without workers, no questions are asked, no alerts fire.
2. **Alerts tab** — Alert count KPI + severity + status filter + resolve action. This is what managers check every single morning. Ship this first, and the manager has a reason to open the dashboard daily.
3. **Analytics tab** — 4 KPI cards (questions, active users, response rate, messages sent) + questions-over-time chart + recent questions feed. Simple, no per-worker breakdown yet.
4. **Documents tab** — Upload zone + documents list + 4 integration connectors. No version management, no coverage scores.
5. **AI Studio tab** — Video upload zone + knowledge gap display. The Analyze Gaps button is the CTA; the AI does the heavy lifting.

### Defer (post-MVP)

- Per-worker question breakdown (Analytics): Medium complexity, needs backend per-user event tracking
- Document coverage scores (Documents): High complexity, requires AI analysis pass
- AI-suggested response on alerts (Alerts): High complexity, requires incident pattern matching
- Bulk CSV invite (Workers): Medium complexity, only valuable at 20+ worker onboarding
- Document-to-question mapping (AI Studio): High complexity, core research feature

### The single strongest differentiator to ship in MVP

**Knowledge gap analysis in AI Studio.** This is what no competitor offers for the frontline segment at this price point. A manager uploads their restaurant SOP PDF, clicks "Analyze Gaps," and sees: "Your workers asked 8 questions about allergy procedures that no document covers." That is immediately actionable and directly tied to safety — the two things a frontline manager cares most about. Every other feature in the dashboard is infrastructure; this is the insight.

---

## Competitive Context

These platforms define what "table stakes" looks like in this segment:

- **Beekeeper** — Frontline communication + operational workflows. Dashboard shows message open rates, task completion, shift notes. Strong on communication metrics, weaker on AI/knowledge base.
- **Deputy** — Scheduling-first. Dashboard is heavily schedule + labor cost focused. Not the right comparison for Sidekick.
- **Homebase / 7shifts** — Restaurant-specific scheduling + team communication. Workers tab and shift-based analytics are comparable, but no AI knowledge base.
- **Connecteam** — Operations platform with document management, training modules, chat. Closest structural analog. Documents + workers + analytics pattern matches Sidekick's 5-tab structure, but without AI-first positioning.
- **WorkJam** — Enterprise-tier frontline platform. Too complex for SMB; good reference for what advanced features eventually look like.

**Sidekick's position:** None of these platforms have SMS-native AI with a document-grounded knowledge base. The AI Studio tab + Knowledge Gaps feature is genuinely novel for the SMB frontline segment. The table stakes features (Analytics, Alerts, Documents, Workers) are established patterns — the risk is underdoing them (Sidekick feeling like a toy) not overdoing them (feature bloat). The differentiator is the AI layer.

---

## Mapping to the 5 Defined Tabs

| Tab | Table Stakes Shipped | Key Differentiator | Anti-Feature Avoided |
|-----|---------------------|-------------------|---------------------|
| Analytics | KPI cards + chart + questions feed | Per-worker breakdown (post-MVP) | Real-time updates, custom report builder |
| Alerts | Alert list + severity + status filter + resolve | Resolution time KPI | Complex filter UI, push notification config |
| Documents | Upload zone + doc list + 4 integrations | Preview before upload | Version management (post-MVP), coverage scores |
| AI Studio | Video upload + knowledge gap analysis | Analyze Gaps CTA + suggested topics | Multi-step setup wizard |
| Workers | JOIN code + QR modal + roster + verified badge | Onboarding % completion | Role-based permissions, gamification |

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Table stakes features | HIGH | Consistent across all major platforms; well-documented in vendor case studies and product teardowns through Aug 2025 |
| Anti-features list | HIGH | Grounded in user behavior patterns for this persona; well-documented failure modes in team management tools |
| Differentiators | MEDIUM | AI-specific features (knowledge gaps, coverage scores) are newer; competitive claims may have shifted post Aug 2025 |
| Competitive positioning | MEDIUM | Based on platform knowledge through Aug 2025; specific feature additions by competitors may have occurred since |
| Feature complexity estimates | HIGH | Based on standard web app implementation patterns; not speculative |

---

## Sources

- Training knowledge: Beekeeper, Deputy, Homebase, 7shifts, Connecteam, WorkJam product analyses (through August 2025)
- Project context: `/Users/arnavsinghal/DashboardSidekick/sidekick-dashboard/CLAUDE.md`
- Project context: `/Users/arnavsinghal/DashboardSidekick/sidekick-dashboard/.planning/PROJECT.md`
- Note: External search tools (WebSearch, WebFetch, Bash) were unavailable during this research session. All findings are from training data. Key claims about table stakes should be considered HIGH confidence given market maturity; AI-specific differentiator claims should be validated against current competitor feature sets before making competitive claims.
