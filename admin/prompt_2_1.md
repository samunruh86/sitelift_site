CONTEXT
Prompt 2.0 already added:
- initRevealAnimations() in ./docs/base/js/main.js using IntersectionObserver
- Accordion keyboard support (Enter/Space/Esc)
- CSS block in ./docs/base/css/styles.css for .reveal-ready/.reveal-in, accordion height transition, dropdown list transition, and reduced-motion overrides

RESULT
Better than before, but still not as polished as the original Webflow template.
We want to improve perceived quality without restoring Webflow IX2 or webflow.js.

HARD CONSTRAINTS
- Do NOT reintroduce webflow.js, IX2, data-w-id logic, or jQuery.
- Do NOT refactor existing behavior modules (initNavs/initDropdowns/initAccordions/initForms/initTabs).
- Keep the system progressive-enhancement: no content hidden if JS fails.
- Only edit:
  - ./docs/base/js/main.js
  - ./docs/base/css/styles.css

GOAL
Match the “Webflow template feel” by upgrading:
1) reveal target selection (more accurate, less blunt)
2) stagger behavior (consistent, grouped)
3) accordion micro-interactions (content fade + icon feel + better height handling)
4) animation timing/easing (soft, consistent)

TASK A — Reveal system upgrade (core)
1) Keep existing .reveal-ready/.reveal-in classes, but introduce CSS variables:
   --reveal-duration (default 650ms)
   --reveal-ease (default cubic-bezier(0.16, 1, 0.3, 1))
   --reveal-distance (default 14px)
   Use them in the reveal transitions (replace hard-coded 420ms and 12px).

2) Add two optional reveal variants:
   - .reveal-soft (slightly shorter distance, e.g. 10px)
   - .reveal-card (adds subtle scale: 0.985 -> 1)

3) Improve JS target selection:
   Current logic: SLsect + up to 6 direct children.
   Change to:
   - Always observe each SLsect-* wrapper.
   - Within each SLsect section, discover "reveal candidates" using a breadth-first search:
     - Prefer elements matching these selectors (in this order):
       .line-left---content,
       .card-shape-bg,
       .w-layout-grid,
       .inner-container,
       .image-wrapper,
       .buttons-row,
       .text-center,
       .mg-top-*, (any class starting with "mg-top-")
       .grid-*, (any class starting with "grid-")
     - If fewer than 8 candidates found, include additional “leaf blocks”:
       - elements that contain text/images/buttons but are not huge wrappers (skip .page-wrapper, .section, .container-default, .w-container)
   - Cap per section: max 10 animated nodes (prevents over-animation).

4) Implement true stagger:
   - For candidates inside a section, apply transition delays in 60ms steps (0..420ms).
   - Ensure delay only applies once, then remove delay inline after reveal so it doesn’t affect reflows.
   - Add an option to stagger only when multiple candidates exist; single items should have no delay.

5) Observer tuning:
   - rootMargin: "0px 0px -12% 0px"
   - threshold: 0.12
   - Use requestAnimationFrame to add .reveal-in for smoother class application.

6) Reduced motion:
   - If prefers-reduced-motion: do not apply reveal-ready at all; reveal everything instantly.

TASK B — Accordion polish (match Webflow feel)
1) Keep height animation, but add a content fade:
   - In CSS:
     .accordion-bottom { overflow:hidden; }
     .accordion-bottom > * { opacity: 0; transform: translateY(4px); transition: opacity 220ms ease, transform 220ms ease; }
     .accordion-item.is-open .accordion-bottom > * { opacity: 1; transform:none; }
   - Ensure reduced motion disables these transforms.

2) Fix height “snap” edge cases:
   - In JS: after opening an accordion, run a follow-up height recalculation:
     - set height to scrollHeight
     - then after 50–100ms (setTimeout) set it again to scrollHeight
     - also recalc on image load inside an open panel (listen once per image)
   This reduces cases where scrollHeight changes during transition.

3) Icon feel:
   - Keep vertical line rotation but soften:
     - increase to 280–320ms
     - use ease-out
     - optional: scale the vertical line down slightly when open (or rotate + fade) to mimic “plus to minus”.

TASK C — Dropdown animation quality
1) Keep your dropdown behavior JS intact.
2) Update CSS transition to feel less abrupt:
   - duration: 220ms
   - ease: cubic-bezier(0.16, 1, 0.3, 1)
3) Prevent “invisible but clickable” or “clickable but invisible” mismatch:
   - Ensure pointer-events toggles only when opacity is effectively visible (use w--open class).

DELIVERABLES
- Update main.js:
  - Only expand initRevealAnimations() and small accordion open recalculation helpers.
  - Do not touch nav/dropdown core behavior.
- Update styles.css:
  - Replace hard-coded reveal durations with CSS variables.
  - Add reveal variants + accordion content fade + improved dropdown easing.
- Add a short comment block noting the tuning knobs (duration/ease/distance, max nodes, stagger step).

ACCEPTANCE TESTS
- Scroll reveal feels like Webflow: smooth, slightly slower, and staggered.
- Cards and hero blocks feel individually animated (not just whole sections).
- Accordion open/close feels smooth (height + subtle content fade + icon).
- No content hidden if JS is disabled.
- Reduced-motion works (animations off).