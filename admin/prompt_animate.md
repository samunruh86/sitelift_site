CONTEXT
We have a cleaned static site output in:
- HTML: ./docs/base/*.html (7 pages)
- CSS:  ./docs/base/css/styles.css
- JS:   ./docs/base/js/main.js (current code is modular with initNavs/initDropdowns/initAccordions/initForms/initTabs)

PROBLEM
We removed Webflow IX2 and now the site has no scroll reveal / pop-in animations, and accordion opening feels less polished.
We want to restore the “nice” feel WITHOUT reintroducing webflow.js, jQuery, or Webflow IX2.

HARD CONSTRAINTS
- Do NOT add external libraries.
- Do NOT add inline <script> tags to HTML.
- Keep single CSS file and single JS file:
  - Update ONLY ./docs/base/css/styles.css
  - Update ONLY ./docs/base/js/main.js
- Respect prefers-reduced-motion.
- Do not hide content by default in CSS. Content must remain visible if JS fails.

TASK A — Add scroll reveal (generic, low-maintenance)
1) Implement a new function: initRevealAnimations() inside main.js.
2) Call initRevealAnimations() inside the existing DOMContentLoaded handler, AFTER initTabs().
3) Use IntersectionObserver to add reveal classes when elements enter viewport.

Target selection:
- Primary: all elements where id starts with "SLsect-" (these are section anchors).
- Secondary: within each SLsect section, animate up to 6 child blocks using a stagger:
  - Prefer direct descendants matching:
    .line-left---content,
    .title-left---content-right,
    .card-shape-bg,
    .image-wrapper,
    .w-layout-grid,
    .buttons-row,
    .inner-container
  - If none found, fallback to the first 6 direct element children.
- Apply stagger by setting element.style.transitionDelay = `${index*60}ms` for those secondary children only.

Implementation detail:
- On init, JS should add class "reveal-ready" to chosen targets and set dataset flag (e.g., data-reveal="1").
- When revealed, switch to class "reveal-in" (remove ready if you want).
- Use rootMargin like "0px 0px -10% 0px" and threshold ~0.15.

Reduced motion:
- If matchMedia('(prefers-reduced-motion: reduce)') is true, do not set reveal-ready; just ensure everything is visible and skip observers.

TASK B — Improve accordion polish (without rewriting logic)
Your current initAccordions already animates height by setting style.height and toggles .is-open. Keep that.
Add only:
- CSS transitions for accordion-bottom height.
- Icon micro-interaction via CSS when .accordion-item.is-open:
  - rotate the “vertical line” (e.g. .accordion-icon-line.vertical) or rotate an icon wrapper if present.
- Ensure overflow hidden on accordion-bottom.

Do NOT change the core accordion JS unless necessary, but if you do, only add small improvements:
- Add keyboard support: Enter/Space toggles when focus is on .accordion-top; Esc closes the currently open accordion item in that group.

TASK C — Optional dropdown animation polish
Keep initDropdowns logic. Add CSS so that when .w-dropdown-list toggles .w--open it animates in:
- opacity 0->1
- transform translateY(8px)->0
- pointer-events none->auto
Do not break click-outside and Esc behavior.

TASK D — CSS additions in styles.css
Append a small block (at end) with:
- Reveal classes:
  .reveal-ready { opacity:0; transform: translateY(12px); transition: opacity 420ms cubic-bezier(0.2,0.8,0.2,1), transform 420ms cubic-bezier(0.2,0.8,0.2,1); will-change: opacity, transform; }
  .reveal-in { opacity:1; transform:none; }
  .reveal-ready.reveal-x { transform: translateX(12px); }
- Accordion polish:
  .accordion-bottom { overflow:hidden; transition: height 320ms cubic-bezier(0.2,0.8,0.2,1); }
  .accordion-item .accordion-icon-line.vertical { transition: transform 240ms ease; transform-origin: center; }
  .accordion-item.is-open .accordion-icon-line.vertical { transform: rotate(90deg); }  (or scaleY(0) if that looks better)
- Dropdown list polish:
  .w-dropdown-list { opacity:0; transform: translateY(8px); transition: opacity 180ms ease, transform 180ms ease; pointer-events:none; }
  .w-dropdown-list.w--open { opacity:1; transform:none; pointer-events:auto; }

- Reduced motion:
  @media (prefers-reduced-motion: reduce) { disable transitions and transforms for reveal + accordion + dropdown; reveal should be immediate }

DELIVERABLES
- Update ./docs/base/js/main.js by adding initRevealAnimations and (optionally) small keyboard handling for accordion.
- Update ./docs/base/css/styles.css by adding the reveal + accordion + dropdown transition CSS.
- Do not change HTML.