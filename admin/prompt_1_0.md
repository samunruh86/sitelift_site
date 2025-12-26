CONTEXT
We have a static Webflow export. The current source files (examples) include:
- HTML: ./docs/index.html ./docs/about.html ./docs/contact.html ./docs/services.html ./docs/detail_services.html ./docs/blog.html ./docs/detail_post.html
- CSS: ./docs/css/normalize.css ./docs/css/webflow.css ./docs/css/accountant-v1.webflow.css
- JS:  ./docs/js/webflow.js
We want a cleaned “base accountant template” folder that is NOT dependent on Webflow runtime going forward.

IMPORTANT REALITY (DO NOT IGNORE)
These HTML pages contain Webflow Interactions (IX2) patterns: data-w-id attributes and inline/embedded styles that set opacity:0 and transforms for entrance animations. If webflow.js is removed, content will stay hidden unless we normalize those styles. (You MUST handle this.)

TARGET OUTPUT (in ./docs/base)
1) Keep ONLY these pages (flat):
   - index.html
   - about.html
   - services.html
   - detail_services.html
   - blog.html
   - detail_post.html
   - contact.html

2) Create ONE CSS file:
   - ./docs/base/css/styles.css
   Requirements:
   - Contains ONLY the CSS required for the 7 kept pages.
   - May include minimal “utility” CSS needed for the JS toggles you implement (e.g., .is-open, .is-active).
   - Remove ecommerce styles, admin/template guide styles, and any Webflow-only unused selectors.
   - Keep necessary @font-face used by the pages (fonts live in /fonts).

3) Create ONE JS file:
   - ./docs/base/js/main.js
   Requirements:
   - Remove dependency on ./docs/js/webflow.js. Final HTML must NOT reference webflow.js.
   - Re-implement ONLY the behaviors actually present/needed in these pages:
     A) Mobile nav toggle (hamburger opens/closes the nav menu)
     B) Dropdown open/close for the “Services” menu
     C) Accordion open/close (elements currently have accordion-bottom height:0px)
     D) Form success/error UI behavior: submit should not break page; keep markup intact
   - If any behavior is too costly to replicate, remove that behavior AND simplify HTML so it no longer requires it.

4) Assets
   - Copy only referenced assets into:
     ./docs/base/images
     ./docs/base/fonts
   - Preserve srcset variants that are referenced (do not delete images used in srcset).
   - Remove template/vendor promo assets (e.g., “More Webflow Templates”/badge related).

HARD CONSTRAINTS
- The original ./docs directory is READ-ONLY; do not modify it. Produce output only in ./docs/base.
- Do NOT keep any links to /unused/ paths or template demo URLs.
  Rewrite nav/footer links so they only point to the 7 kept pages (or remove the link if it’s not relevant).
- Remove ALL Webflow IX2 “hidden until JS runs” behavior:
  1) Remove all data-w-id attributes.
  2) Remove any <style> blocks that target html.w-mod-js:not(.w-mod-ix) [data-w-id=...].
  3) Normalize inline styles on content nodes that set opacity:0 and transform translate3d(...) for entrance effects.
  After cleanup, the page must render fully visible even with JS disabled.

- Remove Webflow CMS placeholders:
  Detect and remove/replace any of these patterns:
  - .w-dyn-list / .w-dyn-items / .w-dyn-item
  - .w-dyn-empty (“No items found.”)
  Replace each CMS collection with static markup:
  - Services teaser grid: create 3 static service cards with placeholder copy (or reuse visible copy elsewhere on the page if available).
  - Blog teaser grid: create 3 static post cards with placeholder copy.
  The goal is: no “No items found.” blocks remain.

WORKFLOW (DO THIS IN PHASES)
PHASE 0 — Setup
- Create ./docs/base with subfolders: css/, js/, images/, fonts/
- Copy the 7 HTML pages into base and update their asset paths accordingly.

PHASE 1 — Inventory report (MANDATORY)
- Parse the 7 HTML pages and produce ./docs/base/cleanup-report.md containing:
  - List of components present (nav, dropdown, accordion, forms, etc.)
  - Count of data-w-id attributes found + list of <style> blocks for IX2
  - Count/list of /unused/ links
  - List of images referenced (including srcset variants)
  - List of fonts referenced
  - Before/after size totals (CSS, JS, images, fonts)

PHASE 2 — HTML cleanup
For each HTML page in base:
- Remove Webflow generator/meta tags that are not needed.
- Remove webfont loader / google fonts script tags if fonts are already local and referenced via @font-face; otherwise keep temporarily but call it out in the report.
- Remove the webflow badge-hiding snippet (and any badge remnants).
- Rewrite nav links to use kept pages.
- Remove IX2 styles + data-w-id + inline hidden styles as described above.
- Remove CMS placeholders and replace with static cards (3 items each).
- Keep semantic structure; minimal changes beyond the above.

PHASE 3 — CSS build
- Start from ./docs/css/normalize.css, ./docs/css/webflow.css, ./docs/css/accountant-v1.webflow.css
- Generate a single CSS file styles.css by:
  - Extracting only selectors that are actually used by the 7 HTML pages after cleanup.
  - Keep required base element styles (html/body/typography) even if selector matching is imperfect.
  - Delete Webflow ecommerce styles (w-commerce-*) unless referenced by the kept pages.
  - Delete template admin/styles-guide styles not referenced.
  - Keep font-face declarations that are used.
  - Minify the output.
- Update all 7 HTML pages to reference ONLY css/styles.css.

PHASE 4 — JS build
- Implement main.js (vanilla JS) with:
  - Nav toggle:
    - Clicking .w-nav-button toggles menu visibility
    - Use aria-expanded and aria-controls
    - Close on Escape
    - Close when clicking a nav link on mobile
  - Dropdown:
    - Clicking the dropdown toggle opens/closes its menu
    - Close when clicking outside
    - Close on Escape
  - Accordion:
    - Toggle height from 0 to content scrollHeight
    - Only one open at a time (unless multiple-open is already intended; choose single-open as default)
  - Forms:
    - Do not break submission; if form action is empty/get, keep default.
    - If Webflow AJAX behavior is removed, ensure the page still works without throwing errors.
- Remove any reference to webflow.js from HTML, and ensure no errors in console.

PHASE 5 — Validation
Create ./scripts/validate-base.js and include a npm script to run it.
Validation must:
- Verify each HTML references exactly:
  - one CSS file: css/styles.css
  - one JS file: js/main.js
- Verify no /unused/ links remain.
- Verify no data-w-id attributes remain.
- Verify no html.w-mod-js/not(.w-mod-ix) style blocks remain.
- Print size totals and reduction percentages.

ACCEPTANCE TESTS
- All 7 pages load with no console errors.
- All content visible immediately with JS disabled.
- Nav works on desktop + mobile (hamburger open/close).
- Dropdown works.
- Accordions open/close smoothly.
- Forms do not throw errors; success/error blocks remain in DOM and styling intact.
- Visual layout should match original closely (allow animation removal).

NOW IMPLEMENT
Start by scanning ./docs (do not modify) and writing PHASE 1 inventory report first. Then proceed through phases sequentially.