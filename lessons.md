# FrictionLens - Lessons Learned

Track mistakes, surprises, and insights to avoid repeating them.

## Format

Each entry follows:

### [DATE] [PHASE] [CATEGORY]
**Context:** What was being done
**Problem:** What went wrong or was unexpected
**Root Cause:** Why it happened
**Resolution:** How it was fixed
**Lesson:** What to do differently next time

## Categories
- `ARCH` — Architecture decisions
- `BUG` — Bugs encountered
- `PERF` — Performance issues
- `AI` — AI/Gemini pipeline issues
- `AUTH` — Authentication problems
- `DB` — Database/Supabase issues
- `UI` — Frontend/styling issues
- `DX` — Developer experience
- `DEPLOY` — Deployment/hosting issues

---

## Entries

### [2026-03-18] [Phase 1] ARCH
**Context:** Route group `(dashboard)` conflicted with root `page.tsx` and landing page needs
**Problem:** Using `(dashboard)` route group meant dashboard served at `/`, conflicting with the landing page. Also caused 404s when redirecting to `/dashboard`.
**Root Cause:** Route groups don't create URL segments. Having both `app/page.tsx` and `app/(dashboard)/page.tsx` caused the boilerplate to win.
**Resolution:** Moved dashboard to explicit `app/dashboard/` directory. Landing page at `app/page.tsx`. All routes now explicit: `/dashboard`, `/dashboard/settings`, `/dashboard/analysis/[id]`.
**Lesson:** For apps with both public pages and an authenticated dashboard, use explicit route paths (`/dashboard/*`) not route groups. Route groups are only useful when you don't need a landing page at `/`.

(Entries added as work progresses, newest first)
