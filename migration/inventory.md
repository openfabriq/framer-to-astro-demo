# Inventory of https://conversion.framer.media

Surveyed 2026-11-10 from the published site alone. Everything below was read from `/sitemap.xml`, `/robots.txt` and the HTML of each page, unless marked *inferred* or *unknown*.

## Summary

- Site: `https://conversion.framer.media` (a public Framer template, "Conversion", an agency site with a CMS blog). Framer site id in script URLs: `53sEejzfSc33R5CCOjKj1y`.
- CMS export: **none**. `migration/framer-cms/` does not exist, and the issue says there is no export. Every collection was read from the published pages, so fields Framer hides from the page (drafts, unpublished items, slugs of unlisted items, ids) are **unknown**.
- Pages: 12 URLs in the sitemap: 7 static pages and `/blog`, plus 4 CMS pages. `/404` is listed in the sitemap but answers HTTP 404 (it is Framer's 404 page).
- Collections: 1 seen, **Blog** (4 published items, read from `/blog`). The CSV is a missing export.
- Locales: 1 (no `hreflang` link on any page; `/fr` and other locale folders answer 404).
- Breakpoints (from `__framer__breakpoints`): desktop `min-width: 1200px`, tablet `810px–1199.98px`, phone `max-width: 809.98px`. Framer renders one copy of each text per breakpoint (headings appear three times in the HTML), so a parser must not count them as three headings.
- Files that did not download: none to report, since `files` has nothing to download without an export. Images are on `framerusercontent.com` and need their own download (see Questions).

## URL inventory

Static pages (7):

| URL | Notes |
|---|---|
| `/` | Home, sections `#about-us`, `#clients`, `#results`, `#services`, `#comparison`, `#process`, `#faq` |
| `/about` | |
| `/services` | |
| `/contact` | |
| `/coming-soon` | |
| `/legal` | Placeholder privacy policy text |
| `/blog` | Blog index (lists the CMS items; static page in Framer) |

Not-found: `/404` (in the sitemap, HTTP 404). Any unknown URL answers 404 with the title "Page Not Found - Conversion".

CMS pages:

| Pattern | Count | URLs |
|---|---|---|
| `/blog/<slug>` | 4 | `increase-leads`, `high-converting-pages`, `top-marketing-trends`, `why-you-need-a-blog` |

Links are relative in the HTML (`./about`, `../blog`). `/robots.txt` allows everything and points to the sitemap.

## Page templates

| Template | Pages | Representative URLs |
|---|---|---|
| Plain text page: nav, title, text, CTA band, footer | 1 | `/legal` |
| Coming soon: nav, centered heading, one email form, footer | 1 | `/coming-soon` |
| Contact: nav, heading, multi-field form, footer | 1 | `/contact` |
| Marketing page: heading, logo strip, blocks, CTA band, footer (About: two "note" sections of 3 cards; Services: three service blocks with bullet lists and a price line) | 2 | `/about`, `/services` |
| Blog index: heading and a list of cards (category, title, link) | 1 | `/blog` |
| Blog post (CMS template): category badge, h1, author, read time, intro, "In this post" sidebar, rich text body, CTA | 4 | `/blog/why-you-need-a-blog`, `/blog/increase-leads` |
| Home: long landing page with many sections | 1 | `/` |

Shared on every page: navigation (About, Blog, Services, Process, Pages dropdown with About Us, Coming Soon, Legal, 404; "Book a call" button to cal.com; a mobile hamburger menu), CTA band "Ready to scale your brand to new heights?", footer (logo, newsletter form, sitemap links, FAQ, Contact, "Made in Framer", "Created by Hamza Ehsan", X and LinkedIn links).

Home sections, in order (read from the text): hero "Ready to scale your brand with paid ads?" with "115+ happy clients" and avatars; "Our Clients" logos (6) and testimonials slider (4 quotes); "Results speak for themselves." (3 case cards: Nostalgie, Classicé, Yogamy); "How can we help you?" (Meta, Google, TikTok Ads); comparison "But, why would you want to work with us?" (vs Other Agencies); 3-step process (Funnel Audit, Campaign Setup, Maximize Profit); FAQ (6 questions); "Meet the incredible team."; CTA band. Whether the nav and footer are Framer components shared by all pages is *inferred* from identical markup.

## Collections

### Blog (no CSV: missing export)

Name inferred from the URL `/blog/<slug>`. Columns read from the post page and the index card; types are *inferred*:

| Field | Holds | Seen on |
|---|---|---|
| slug | `increase-leads`, ... | URL |
| title | page h1, also `<title>` | post, card |
| category | "Digital Marketing", "Websites", "Trends"; the fourth post's category was not shown on the card (unknown) | badge on post and card; probably an option or a reference to a Categories collection (unknown, would need `ids.json`) |
| author | "Hamza Ehsan" on the post read | probably a reference or plain text (unknown) |
| reading time | "11 min read" | text, may be computed (unknown) |
| meta description / social image | per-post `description`, `og:image` (png on framerusercontent.com) | `<head>` |
| cover image | probably the og:image (inferred) | |
| body | rich text: h2, h3, paragraphs; an "In this post" sidebar built from the headings | post |

- Publication date: no `<time>` element or date text found: unknown whether the field exists.
- Gallery fields: none seen.
- Ids needing `ids.json`: none can be established without the CSV; category and author are candidates.
- Whether the Blog is the only collection (a Categories or Authors collection may exist behind it): unknown.

## Interactions and effects

All read from markup and the Framer runtime hooks; nothing was watched in a browser, so exact timings and easing are **unknown**.

- Appear animations: the home page has 15 `data-framer-appear-id` elements (entrance on load or scroll). Other pages have the same runtime scripts.
- Mobile navigation: hamburger icon with "Mobile Closed" and "Mobile Expanded" variants (menu opens and closes).
- Pages dropdown in the nav (hover or tap) listing About Us, Coming Soon, Legal, 404.
- Blog post: a "Scroll Effect Activate" layer and a sticky sidebar "In This Post" (table of contents; links to the headings is *inferred*).
- Home: FAQ with 6 questions (accordion, *inferred* from "Question 1..6" layers with open and close variants); testimonials slider (4 quotes); logo strip of 6 logos (a scrolling ticker is *inferred*); decorative layers "Conic", "Glow", "Blur, Rotate" (gradient glows, probably animated).
- Video: 4 layers named "Video" on the home page (what they play: unknown).
- Hash links `./#process`, `./#faq`, `./#results`, `./#services`, `./#comparison`, `./#about-us`, `./#clients` scroll to sections.
- Page transitions: none found.
- Code components and overrides: not readable from the published site. Candidate code components: the form fields, testimonial slider, ticker. Unknown.

## Forms

| Form | Where | Fields | Destination |
|---|---|---|---|
| Newsletter "Get Notified" | footer of every page (2 copies per page: one per breakpoint) | `email` (type email, no required attribute) | `method="POST"`, no action: handled by Framer; destination unknown |
| Contact | `/contact` | First Name (required), Last Name (required), Email, Website (url), "What services are you interested in?" (text, placeholder "Google Ads"), "Tell me about your business?" (text area, *inferred*) | Framer form handling; where messages go is unknown |
| Coming soon sign-up | `/coming-soon` | Email, button "Sign Up"; three hidden honeypot inputs (`website`, `company`, `message`) | Framer; unknown |

Success and error messages were not read (a form must not be submitted).

## Custom code and embeds

- `https://events.framer.com/script?v=2` (Framer's own analytics, `data-fid=83e60b8d…`, async). No Google Analytics, GTM, chat or cookie consent script found in the head or body.
- `script_main.*.mjs` from `framerusercontent.com/sites/<id>/`: Framer's runtime, not to be kept.
- Inline scripts: appear-animation and breakpoint data (Framer's), nothing custom seen.
- No iframes. Links to cal.com (the "Book a call" button, a link not an embed).
- Fonts: preconnect to `fonts.gstatic.com`; font families unknown (read the CSS in a later ticket).

## Redirects

Unknown: Framer redirects have no export. A maintainer should copy them from site settings into `migration/redirects.csv` (`from,to`). `/404` is the only odd URL.

## SEO

- Title pattern: `<Page> - Conversion` for static pages ("About - Conversion", "Legal Page - Conversion"); home is "Conversion - Framer Website Template for Agencies"; blog posts use the post title alone, with no suffix.
- Meta description: set on every page (per page; post descriptions are the post excerpts).
- Canonical: `<link rel="canonical">` to the page's own absolute URL, no trailing slash except home.
- Open Graph: `og:type=website` (also on posts), `og:title`, `og:description`, `og:image`, `og:url`; Twitter `summary_large_image` with title, description, image. Image: one shared jpg on all static pages (`BxzYf4O0….jpg`), a png per blog post.
- `robots` meta: `max-image-preview:large` on all pages; no noindex found. The 404 page has no noindex.
- hreflang: none. Structured data (JSON-LD): none found.
- Sitemap: Framer-generated, no `lastmod`.

## Questions to decide

Settled in `migration/decisions.md` (1 to 5 as recorded in `migration/decisions/`, 6 to 10 by the plan). Still open for a person: the final domain and host, at the end of that file.
