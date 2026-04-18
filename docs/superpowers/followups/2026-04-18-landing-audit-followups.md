# Landing Page Audit — Follow-ups

**Filed:** 2026-04-18
**Context:** Discovered during verification of the ambient blue aurora gradient commit (`f691a37`). Neither item was caused by that commit — both are pre-existing.

---

## 1. Hero typography fails WCAG AA on light background

**Severity:** Medium (accessibility)
**Scope:** `src/app/page.tsx` (hero section, lines ~87–101)

Measured contrast ratios against `#F2F2F7` page background (sampled from rendered pixels at 375×667 viewport):

| Element | Current color | Contrast | AA threshold | Status |
|---------|--------------|---------:|-------------:|:-------|
| "Stop reading" (hero-heading span 1) | `text-gray-400` (#9CA3AF) | 2.28:1 | 3.0 (large text) | **FAIL** |
| "app reviews." (hero-heading span 2) | `text-friction-blue` (#6B9FD4) | 2.50:1 | 3.0 (large text) | **FAIL** |
| Subtitle (hero-fade-2) | `text-gray-500` (#6B7280) | 4.33:1 | 4.5 (body text) | **FAIL** |

The aurora gradient commit reduced these by a further 0.11 / 0.12 / 0.36 points respectively, but the underlying failure is the color choice on the light theme, not the gradient.

**Suggested fixes (pick what preserves the editorial look you want):**

- Darken `text-gray-400` to `text-gray-500` on "Stop reading" → pushes contrast to ~4.3:1 (passes AA large).
- Strengthen `text-friction-blue` for "app reviews." by using a darker variant (e.g., `#3670B5`) or accept that decorative italic text is exempt from AA — this is the weakest case.
- Darken subtitle from `text-gray-500` to `text-gray-600` (#4B5563) → pushes to ~6.5:1.

**Why this wasn't caught earlier:** The text-contrast fixes from 2026-03-31 (obs 828–833) addressed contrast on the dark CTA section and navigation, not on the light hero. This is a residual.

---

## 2. `ERR_SSL_PROTOCOL_ERROR` on `/login` during page load

**Severity:** Low (console noise, no visible impact)
**Scope:** Unknown — needs investigation

Console output when loading landing page at `http://localhost:3001`:

```
[ERROR] Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR @ https://localhost:3001/login:0
[ERROR] Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR @ https://localhost:3001/login:0
```

Something is fetching `https://localhost:3001/login` (note **https**) during page load. Dev server only serves `http://`, hence the protocol error. The page still renders fine — likely a prefetch or resource hint that picked up the wrong scheme.

**Likely culprits to investigate:**

- Next.js `<Link prefetch>` — but Link should use relative URLs, not absolute `https://`.
- A hardcoded `https://` URL somewhere in the nav or login link.
- A meta tag, canonical URL, or OG image tag using absolute URL with wrong scheme when `NEXT_PUBLIC_APP_URL` isn't set correctly for dev.
- Middleware doing a redirect to `https://` in dev.

**How to reproduce:**
1. Start dev server on port 3001.
2. Open DevTools console.
3. Navigate to `http://localhost:3001/`.
4. Observe two SSL protocol errors for `https://localhost:3001/login`.

**Quick triage:** `grep -r "https://localhost" src/` and check `NEXT_PUBLIC_APP_URL` in `.env.local`.

---

## Decisions

- Neither item blocks the aurora gradient commit (`f691a37`).
- Both should be addressed before the next deployment if shipping to users.
- Item 1 likely needs a brief design conversation (contrast vs. aesthetic trade-off on the editorial hero).
- Item 2 is a simple debugging task, probably 15 minutes.
