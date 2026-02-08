# Next Steps & Site Audit

Last updated: 2026-02-07 (comprehensive audit)

---

## Quick Wins (can tackle in a single session)

### 1. Version sync across pages
**Priority:** High — causes stale CSS/JS on about pages and project pages

Root pages are on `styles.css?v=1028` / `script.js?v=1019` but:
- `about-me.html` and `about-site.html` are stuck on `v=1026` / `v=1017`
- All 15 project pages use `v=24` / `v=78` (set by `project-template.html`)

**Fix:** Update `about-me.html`, `about-site.html`, and `works/project-template.html` to match index.html versions, then `npm run build`.

**Recommendation:** Consider making `build.js` auto-stamp versions, or use a single version constant.

### 2. `resetToDesktopLayout()` missing cleanup (featured cards resize bug)
**Priority:** High — user-reported, visually broken

Cards don't revert to accordion bars when resizing from tablet-bridge to desktop. The function clears card `height/border` but misses:
- `card.style.zIndex` (set by `setupCards()` at ~line 4387)
- `card.style.transform` (set to `'none'` in mobile, should be cleared)
- Carousel dot `.style.transform` (retains `scale()` values)
- Container `scrollSnapType` (not reset)

**Fix:** Add these to `resetToDesktopLayout()`. Also verify the desktop CSS base rules are strong enough to override once inline styles are cleared.

### 3. `initializeHeaderWave()` runs on all pages
**Priority:** Medium — wastes CPU on project/about pages

The guard at line 100 checks `window.innerWidth > 768` but never checks if `.home-header` exists before setting up the full wave animation. It does bail at line 102 if no header found, but still runs the function call on every page load.

**Fix:** Move the `.home-header` existence check before the width check, or guard by page type.

---

## Design Decisions Needed

### 4. Tablet project page layout (574-767px)
**Priority:** High — user identified this

**Problem:** Project pages at tablet-bridge width show the mobile black sticky header + frosted bottom CTA. This feels heavy for tablet screens where content should scroll like desktop.

**Desired behavior:**
- No black sticky header (that's a phone pattern)
- Sidebar toggle visible and accessible (floating button or minimal transparent bar)
- Content scrolls normally
- Inline "next project" link at content end (not pinned bottom bar)

**Key decision:** Where does the sidebar toggle go at this width? Options:
1. Floating pill button (like current mobile but transparent)
2. Minimal transparent header bar with just the toggle
3. Integrated into the content header area

### 5. Breakpoint architecture cleanup
**Priority:** Medium — technical debt, not user-facing yet

The CSS has **9 distinct breakpoint thresholds** when there should be 4. The JS uses **6 different width values** (573, 574, 599, 767, 768, 1024). Key issues:

- **768px vs 769px ambiguity:** Tablet query uses `min-width: 768px`, desktop uses `min-width: 769px`. At exactly 768px both match.
- **480px sub-breakpoint:** `@media (min-width: 480px) and (max-width: 767px)` exists but isn't documented. Only adjusts padding on `.featured-work` and `.home-header`.
- **375px sub-breakpoint:** Undocumented, adjusts sidebar width and toggle size for very small phones.
- **JS uses 599px:** Carousel resize handler uses `<= 599` for mobile but `setupCards` checks `<= 767`. Gap at 600-767px.

**Recommendation:** Consolidate to 4 clear thresholds. Define them as CSS custom properties and JS constants. Eliminate 480px/375px as named breakpoints (fold into mobile range with `clamp()`/fluid units).

---

## Bugs Found

### 6. `!important` cascade fragility in tablet-bridge CSS
**Priority:** Medium — works now but fragile

The tablet-bridge section (lines 3585-3905) uses **152+ `!important` declarations** to override mobile styles. This is because the mobile query (`max-width: 767px`) fires first, then tablet-bridge (`min-width: 574px and max-width: 767px`) overrides with `!important`. Any future mobile CSS changes require matching `!important` in tablet-bridge.

**Recommendation:** Long-term, restructure the mobile query to `max-width: 573px` so it doesn't overlap with tablet-bridge. This eliminates most `!important` needs. This is a significant refactor — not urgent but prevents cascading bugs.

### 7. Sidebar toggle position not fully reset across breakpoints
**Priority:** Low — no visible bug currently

The toggle base styles set `position: fixed; top: 1rem; right: 1rem; z-index: 201`. The tablet-bridge overrides visual properties (background, border, size) but not positioning. The tablet (768-1024px) hides it with `display: none !important`. If display logic changes, the stale `position: fixed` could cause the button to appear offscreen.

### 8. Inner page header resize flag is one-way
**Priority:** Low — edge case

`initializeInnerPageHeader()` uses a flag `innerHeaderInitialized` that's set to `true` once and never reset. If the user loads at desktop, resizes to mobile (header initializes), resizes back to desktop, then back to mobile again — the header won't re-initialize. In practice this is fine because the header HTML is already in the DOM and just needs CSS to show/hide it, but the wave SVG and title population only happen once.

---

## Enhancements to Consider

### 9. Film grain performance on mobile
**Priority:** Medium — GPU-heavy, user-noticed

`html::after` at `z-index: 10000` runs a full-viewport SVG turbulence animation. On mobile this is expensive. Also at z-index 10000, it overlays everything including potential modals/alerts.

**Options:**
- Disable on mobile entirely (`display: none` at `max-width: 767px`)
- Use a static grain texture image instead of animated SVG
- Reduce to a smaller viewport subset
- Lower z-index to below potential modal layers

### 10. Unused CSS variable `--spacing-content-padding`
**Priority:** Low — cleanup

Defined at line 31 as `2rem 3rem` but never used. All content padding is hardcoded per breakpoint. Either use the variable or remove it.

### 11. Content padding could use fluid units
**Priority:** Low — nice-to-have

Content padding jumps between fixed values at each breakpoint (1rem, 1.5rem, 2rem, 2.5rem). Could use `clamp()` for smoother transitions:
```css
padding: clamp(1rem, 2vw + 0.5rem, 2.5rem);
```

---

## Completed

### Tablet bridge breakpoint shift (600px -> 574px)
**Done:** CSS media query and JS `isAccordionActive()` updated from 600px to 574px.

### Home-header shadow boxing on resize
**Done:** Moved `box-shadow` from JS inline style to CSS mobile media query. Added cleanup to `resetToDesktopLayout()`.
