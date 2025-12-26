CONTEXT
Part A is complete:
- Universal header/footer partials in ./docs/partials/
- Pages use <!-- SLPARTIAL:header --> and <!-- SLPARTIAL:footer -->
- Build script outputs ./docs/dist with injected partials + active nav state
- Build script also copies assets into dist (css/js/media/fonts/images)
Site root is ./docs with:
- CSS: ./docs/css/styles.css
- JS: ./docs/js/main.js

NOW GOAL (PART B)
Create real subpages for:
1) Services (multiple pages derived from detail_services.html)
2) Blog posts (multiple pages derived from detail_post.html)
Then update nav dropdowns and internal links to point to real pages.

HARD CONSTRAINTS
- Do NOT reintroduce webflow.js or IX2.
- Preserve placeholder partial injection pattern (no duplicated headers/footers in pages).
- Do NOT add external dependencies.
- Keep main.js behavior working (nav/dropdown/accordion/tabs/forms).
- Operate within ./docs and update build output behavior to include nested folders.
- IMPORTANT: Nested pages must load CSS/JS/media correctly. Either:
  A) convert all asset URLs in HTML to root-relative (/css/styles.css, /js/main.js, /media/...) OR
  B) rewrite asset paths for nested pages (../css/styles.css etc.)
  Choose ONE approach and apply consistently.

PHASE B1 — Create Services subpages
1) Create folder: ./docs/services/
2) Using ./docs/detail_services.html as the base template, create:
   - ./docs/services/tax-planning.html
   - ./docs/services/bookkeeping.html
   - ./docs/services/payroll.html
   - ./docs/services/business-tax-prep.html
   - ./docs/services/individual-tax-prep.html

3) For each service page:
   - Keep placeholders: <!-- SLPARTIAL:header --> and <!-- SLPARTIAL:footer -->
   - Set <body data-page="service_detail" data-service="tax-planning"> (etc.)
   - Update <title> AND the first visible hero <h1> to match the service name
   - Replace obvious lorem/placeholder blocks with short, coherent placeholder content
   - Keep existing SLsect-* ids; if missing, add:
     id="SLsect-service_detail_hero" around the hero block

PHASE B2 — Create Blog post subpages
4) Create folder: ./docs/blog/
5) Using ./docs/detail_post.html as the base template, create:
   - ./docs/blog/effective-tax-management.html
   - ./docs/blog/year-end-tax-checklist.html
   - ./docs/blog/bookkeeping-mistakes.html
   - ./docs/blog/payroll-compliance-basics.html
   - ./docs/blog/choosing-accounting-software.html

6) For each blog post page:
   - Keep placeholders for header/footer
   - Set <body data-page="blog_post" data-post="effective-tax-management"> (etc.)
   - Update <title> AND the post hero <h1>
   - Update visible category/date/author placeholders with simple values
   - Replace placeholder paragraphs with ~2–4 short sections of realistic placeholder copy
   - Keep existing SLsect-* ids; if missing, add:
     id="SLsect-blog_post_hero" around the post hero
     id="SLsect-blog_post_body" around the main article body

PHASE B3 — Add registries (future dynamism)
7) Create ./docs/data/services.json with the 5 services and hrefs
8) Create ./docs/data/posts.json with the 5 posts and hrefs

PHASE B4 — Wire navigation + internal links
9) Update ./docs/partials/header.html:
   - Services dropdown should include:
     Services overview -> services.html
     Tax Planning -> services/tax-planning.html
     Bookkeeping -> services/bookkeeping.html
     Payroll -> services/payroll.html
     Business Tax Prep -> services/business-tax-prep.html
     Individual Tax Prep -> services/individual-tax-prep.html
   - Blog link stays blog.html (no dropdown)

10) Update services.html:
   - Remove any .w-dyn-* CMS remnants and “No items found.”
   - Replace with 5 static service cards linking to ./docs/services/*.html

11) Update blog.html:
   - Remove any .w-dyn-* CMS remnants and “No items found.”
   - Replace with 5 static post cards linking to ./docs/blog/*.html

12) Update index.html (if it has teasers):
   - Services teaser links -> point to ./docs/services/*.html
   - Blog teaser links -> point to ./docs/blog/*.html

PHASE B5 — Build script updates for nested folders
13) Update ./scripts/build.js so it processes HTML recursively:
   - include all .html under ./docs (including ./docs/blog and ./docs/services)
   - exclude ./docs/partials and ./docs/dist
   - preserve folder structure into ./docs/dist
14) IMPORTANT: Preserve the existing asset-copy step into dist and ensure it still runs.

15) Active nav mapping:
   - data-page="service_detail" => activate data-nav="services"
   - data-page="blog_post" => activate data-nav="blog"
   Also ensure:
   - data-page="services" => services active
   - data-page="blog" => blog active

DELIVERABLES
- ./docs/services/*.html (5 pages)
- ./docs/blog/*.html (5 pages)
- ./docs/data/services.json
- ./docs/data/posts.json
- Updated ./docs/partials/header.html (services dropdown links)
- Updated services.html/blog.html/index.html links and static card lists
- Updated ./scripts/build.js to build nested pages into dist + preserve asset copying
- Confirm npm run build works and dist output works without broken links