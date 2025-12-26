CONTEXT
Static site lives in ./docs with:
- Pages: index.html, about.html, services.html, detail_services.html, blog.html, detail_post.html, contact.html
- CSS: ./docs/css/styles.css
- JS: ./docs/js/main.js

We want the header/nav and footer to be universal and easy to make dynamic later.
We will do BUILD-TIME partial injection (not runtime fetch).

IMPORTANT OBSERVATIONS
1) contact.html shows the “clean” global header structure: header-wrapper.w-nav sits directly under .page-wrapper (not inside a hero section). Use THAT structure as the canonical header partial.
2) The current Services dropdown and footer “Pages / Template pages” columns include many template/demo links. We must remove those and keep only real site links.
3) Keep all existing classes used by main.js: .w-nav, .w-dropdown, .accordion-item, .w-tabs, .w-form.

GOAL
Create:
- ./docs/partials/header.html
- ./docs/partials/footer.html
Replace page-specific headers/footers with placeholders:
- <!-- SLPARTIAL:header -->
- <!-- SLPARTIAL:footer -->
Then build output to ./docs/dist with injected partials.

PHASE A1 — Create partials
1) Extract header markup into ./docs/partials/header.html using contact.html as canonical source.
2) Clean the header:
   - Top nav links must be ONLY:
     Home -> index.html
     About -> about.html
     Services -> services.html
     Blog -> blog.html
     Contact -> contact.html
   - Keep the existing CTA button “Schedule a Call” -> contact.html
   - Keep Services dropdown, but for now dropdown list should contain ONLY:
     Services overview -> services.html
     (Service subpages will be added in Part B; do NOT add them yet.)
   - Remove ALL template/demo entries and sections in dropdown:
     “Pages”, “Template pages”, “Home V1/V2/V3”, “Blog V1/V2/V3”, “Pricing”, “Careers”, “More Webflow Templates”, etc.

3) Extract footer markup into ./docs/partials/footer.html using contact.html as canonical source.
4) Clean the footer:
   - Keep the CTA footer card and social icons.
   - Replace footer “Pages” lists with ONLY:
     Home/About/Services/Blog/Contact
   - Remove “Template pages” column entirely.

PHASE A2 — Placeholders + page identity
5) In each HTML page in ./docs, replace the page header block with:
   <!-- SLPARTIAL:header -->
   Replace the page footer block with:
   <!-- SLPARTIAL:footer -->

6) Add body identifier for active nav:
   Add to <body>:
   - index.html => data-page="home"
   - about.html => data-page="about"
   - services.html => data-page="services"
   - detail_services.html => data-page="service_detail"
   - blog.html => data-page="blog"
   - detail_post.html => data-page="blog_post"
   - contact.html => data-page="contact"

7) In header partial, add data-nav attributes to top links:
   - Home link: data-nav="home"
   - About: data-nav="about"
   - Services: data-nav="services"
   - Blog: data-nav="blog"
   - Contact: data-nav="contact"

PHASE A3 — Build script
8) Create ./scripts/build.js (Node) that:
   - reads ./docs/partials/header.html and footer.html
   - iterates all ./docs/*.html (exclude ./docs/partials and ./docs/dist)
   - injects header/footer at placeholders
   - sets active nav state based on body[data-page]:
     - find header link [data-nav="..."] matching the page
     - add aria-current="page" and class "is-active"

9) Add minimal CSS to ./docs/css/styles.css if needed:
   - .is-active styling should be subtle (e.g., underline, opacity, or font-weight).
   - Do not change layout.

PHASE A4 — Output
10) Write built pages to ./docs/dist/<same filename>.
11) Update package.json scripts:
   - "build": "node scripts/build.js"

DELIVERABLES
- ./docs/partials/header.html
- ./docs/partials/footer.html
- Updated ./docs/*.html using placeholders + body[data-page]
- ./scripts/build.js
- package.json updated
- ./docs/partials/README.md explaining how to edit partials + run npm run build

CONSTRAINTS
- Do not introduce external dependencies.
- Do not change main.js unless absolutely required.
- Keep existing classes so main.js behavior continues to work.