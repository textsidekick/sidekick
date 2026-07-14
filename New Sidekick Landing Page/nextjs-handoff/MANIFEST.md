# Sidekick landing redesign — Next.js handoff (wired to textsidekick/sidekick@main)

Suggested branch: `feat/landing-redesign`

```bash
cd /data/.openclaw/workspace/sidekick
git checkout -b feat/landing-redesign
# unzip / copy the contents of this folder over the repo root, preserving paths
git add src/app/page.tsx src/components/landing public/landing
git commit -m "Landing page redesign: video hero, animated feature demos, KB section"
git push -u origin feat/landing-redesign
```

## Changed files

REPLACED:
- src/app/page.tsx — new landing page assembly (metadata export included; the old
  page's component imports are fully replaced)

ADDED — src/components/landing/ (COLLIDES with the existing landing components:
Nav.tsx, Hero.tsx, HowItWorks.tsx, Footer.tsx are overwritten; Brand.tsx, CTA.tsx,
Comparison.tsx, Contact.tsx, FAQ.tsx, KnowledgeLayer.tsx, Logos.tsx, PhoneFrame.tsx,
SidekickChat.tsx, icons.tsx become UNUSED by page.tsx but are left in place —
delete them in the same PR if nothing else imports them):
- links.ts, fonts.ts, landing.css, VideoLoop.tsx
- Nav.tsx, Hero.tsx, PhoneDemo.jsx, HowItWorks.tsx, OrbitSection.jsx,
  KnowledgeSection.tsx, VideoSliver.tsx, Spotlights.tsx, Faq.tsx,
  ContactSection.tsx, ContactForm.tsx, Footer.tsx
- demos/ThreadDemo.jsx, demos/TrainingDemo.jsx, demos/AssetDemo.jsx,
  demos/KnowledgeBaseDemo.jsx, demos/ReportsDemo.jsx, demos/ProcessOrbit.jsx

ADDED — public/landing/:
- hero.mp4, how-text.mp4, how-reach.mp4, how-knowledge.mp4,
  sliver-text.mp4, sliver-knowledge.mp4, sidekick-logo.png, yc-logo.png

NOT TOUCHED: everything else — src/app/api/**, src/lib/**, dashboard, auth,
middleware, layout.tsx, (landing)/privacy|terms|about|contact routes.

## Existing routes/links — kept working

- Book a demo → https://calendly.com/justin-textsidekick (new tab; same as main)
- Blog → https://textsidekick.substack.com/ (new tab; same as main)
- Login → /login
- Privacy Policy → /privacy · Terms → /terms
- /contact still redirects to /#contact (unchanged route, id preserved)

## Contact form wiring — uses the EXISTING backend

- ContactForm.tsx POSTs JSON to the repo's existing **POST /api/contact**
  with its exact contract: `{ name, email, company, size, message }`
  (name/email/company/message required — enforced client-side too).
- No new API routes. No backend changes.
- Env vars: the ones the existing route already uses — `RESEND_API_KEY`,
  `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` (dev fallback logs to console).
- States: submitting ("Sending…") → success (confirmation card) / error (inline banner).

## Needs manual wiring / decisions

1. Old landing components left unused (list above) — remove in the PR or keep.
2. Fonts: page loads Instrument Serif + Plus Jakarta Sans + Quicksand via its own
   fonts.ts (scoped CSS variables); layout.tsx untouched. Fine to keep both.
3. Desktop-first: responsive/mobile pass not yet done (old page had a mobile
   media query in Nav; new page needs one if mobile matters now).
4. tsconfig: demos are plain .jsx — Next's default `allowJs: true` covers this;
   verify your tsconfig hasn't disabled it.
