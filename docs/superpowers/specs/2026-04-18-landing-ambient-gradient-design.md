# Landing Page — Ambient Blue Aurora

**Date:** 2026-04-18
**Status:** Approved design, pending implementation plan
**Author:** Chetan Jonnalagadda (via brainstorming with Claude)

## Goal

Warm up the FrictionLens landing page with subtle ambient gradient blobs without sacrificing the minimal editorial aesthetic or the text contrast work already shipped. The page should feel less flat on first visit while keeping every piece of typography readable.

## Background & Constraints

The landing page went through a light-theme redesign on 2026-03-31. During that redesign two gradient experiments were rolled back:

- Aurora decorative blobs were removed from the landing page.
- Hero gradient text was replaced with solid colors because of readability issues with light font weights.

This spec brings ambient gradients back in a form that respects both decisions: no gradient text, no saturated blobs, no competition with type.

## Design

### What the user sees

Three soft circles of friction-blue glow, heavily blurred, sitting behind everything on the page as the user scrolls. Individually they are almost imperceptible. Together they give the page a gentle blue atmosphere instead of flat `#F2F2F7`. Glass cards (which were previously blurring flat grey) now have real ambient color to blur.

### Visual spec

- **Color:** friction-blue (`#4A90D9`) only. No additional hues.
- **Shape:** circular radial gradient, fading to transparent. No hard edges.
- **Starting opacity:** ~8% at center, tapering to 0.
- **Blur:** `filter: blur(96px)` (Tailwind `blur-3xl` or higher).
- **Animation:** none.
- **Interactivity:** none.

### Placement

Three fixed-position blobs inside a single `pointer-events-none` container that spans the viewport:

| Blob | Position | Size | Intent |
|------|----------|------|--------|
| 1 | Top-right, partially off-screen | ~600px | Glow behind the hero gutter, never behind the headline text column |
| 2 | Mid-left, behind the left gutter at the demo / features boundary | ~400px | Balance against blob 1, sits in empty space |
| 3 | Bottom-right, behind the pricing section | ~550px | Gives the lower third of the page depth, clips before the dark CTA |

Positioning constraints:

- Blob 1 must stay right of the 640px max-width hero text column. It provides a bloom in the gutter, not a wash behind the headline.
- Blob 2 must stay left of the main content container. It lives in the left gutter only.
- Blob 3 must end before the dark CTA section so the dark section does its own thing without blob bleed-through.
- Container must clip before the footer so the footer's solid light background stays clean.

### Layering

- Root `<div>` already has `relative overflow-hidden` — blob container mounts there.
- Blob container: `fixed inset-0 -z-10 overflow-hidden pointer-events-none`.
- Content sections already have `relative z-10`, so no changes required there.
- Dark CTA section is opaque and naturally occludes any blob underneath.

### What this design does NOT do

- No gradient text (previous failure mode).
- No gradient-filled buttons or cards.
- No mesh gradients.
- No animation, parallax, or scroll reactions.
- No new color palette — friction-blue only.
- No change to any text color, font weight, or typography.

## Why This Approach

- **Monochromatic blue** ties to brand without introducing hues that could clash with the amber/red accent semantics used elsewhere in the product.
- **Fixed positioning** gives a continuous atmospheric feel across the page without repeating blob work per section.
- **Static** keeps perf cost at zero — a fixed blurred element animating continuously has real cost on lower-end devices.
- **~8% opacity with deliberate off-column positioning** is the guardrail against repeating the contrast failure that caused the previous rollback.

## Contrast Risk & Mitigation

The hero section is where this goes wrong if we're not careful. Current contrast ratios on `#F2F2F7`:

- `text-gray-400` "Stop reading" headline: ~2.7:1 (passes AA large-text at 3:1 with little margin).
- `text-gray-500` subtitle: ~4.8:1 (passes AA body at 4.5:1 with little margin).
- `text-gray-500` stats and tags: same ~4.8:1, small font.

Any blue tint under these pushes all three toward fail. Mitigations built into this spec:

1. **Blob 1 positioning** places the bloom in the right gutter, past the hero text column boundary. The headline never sits over gradient pixels.
2. **Starting at 8%, not 10%.** Cheap safety margin.
3. **Browser verification is a required implementation step** — after implementation, sample page background under each hero text block with DevTools, confirm WCAG AA still passes. If it doesn't, drop opacity or reposition.
4. **Willing to land at 5% if visual feels off.** Opacity is a tunable at the end, not a load-bearing constant.

## Implementation Touch Points

### Files to edit

- `src/app/page.tsx` — replace the empty aurora container at lines 61-63 with three positioned blob divs.

### Files to read but probably not edit

- `src/app/globals.css` — confirm no existing `.aurora-blob` or similar class conflicts with new utility-only approach.
- `tailwind.config` (wherever it lives for Tailwind 4) — confirm `friction-blue` token is available for utility classes.

### Tech approach

Pure Tailwind utility classes, no new CSS files, no new dependencies. Expected structure:

```tsx
<div
  aria-hidden="true"
  className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
>
  <div className="absolute ..." /> {/* blob 1 */}
  <div className="absolute ..." /> {/* blob 2 */}
  <div className="absolute ..." /> {/* blob 3 */}
</div>
```

Each blob: a `rounded-full` div with a background radial gradient or solid friction-blue, `blur-3xl`, and opacity around 8%.

### Verification (required before calling this done)

1. `npm run build` passes.
2. `npm run lint` passes.
3. Start dev server, load landing page in a browser.
4. Visual check: blobs should be perceptible but not demand attention. If they demand attention, pull opacity down.
5. DevTools contrast check: sample background under hero headline, subtitle, and stats row. Confirm AA still passes (large text ≥ 3:1, body ≥ 4.5:1).
6. Scroll the full page: confirm blobs persist fixed, confirm dark CTA fully occludes blobs, confirm footer is clean.
7. Check mobile viewport (~375px wide): blobs must not cause horizontal scroll or sit directly behind mobile-narrow hero text.

### Rollback plan

Single-file change. `git revert` of the page.tsx commit restores the previous state instantly.

## Out of Scope

- Gradients on the dashboard, report pages, auth pages, or any non-landing route.
- Any change to typography, color tokens, or spacing.
- Gradient treatments on cards, buttons, or hero CTA.
- Mesh gradients, animated auras, or parallax effects.

## Success Criteria

- Landing page feels warmer than flat `#F2F2F7` on first visit.
- No text in the hero or anywhere else visibly loses contrast.
- WCAG AA passes on every text element that was passing before.
- Build, lint, and browser check all clean.
- Can be reverted with a single-commit rollback.
