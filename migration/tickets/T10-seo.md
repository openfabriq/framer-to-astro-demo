# T10 [seo] Redirects, sitemap, robots, metadata
Status: open
Blocked by: T02, T03, T04, T05, T06, T07, T08, T09

Part of #1

URLs: all 11 sitemap URLs

Decisions: 7, 8, 10

## Scope
- Redirect `/coming-soon` to `/` and rows of `migration/redirects.csv` if present; `sitemap.xml` of the 11 pages (no `/404`); `robots.txt` allow all with sitemap; 404 page titled "Page Not Found - Conversion"; title pattern ("<Page> - Conversion", home "Conversion - Framer Website Template for Agencies", posts the title alone), Open Graph, Twitter, canonical, `max-image-preview:large`; no analytics script.

## Acceptance
- [ ] every page matches Framer on title, meta description, canonical, Open Graph
- [ ] sitemap and robots match; every link resolves
- [ ] `pnpm build` and `pnpm test` pass
