# Decisions

Decisions 1 to 5 were taken by a maintainer (`migration/decisions/`); 6 to 10 are the plan's choices, which a maintainer can overturn by editing this file.

## 1. Forms
- Facts: three forms (newsletter in every footer, contact, coming-soon) post to Framer; their destination is unknown and nothing was submitted.
- **Choice (recorded, #3)**: newsletter in a mailing tool and contact through a form service, both chosen later; until then the forms are rendered and wired to nothing. `/coming-soon` is dropped and redirected to `/`.
- Build: one shared form component (T03); T10 adds the redirect.

## 2. Design
- **Choice (recorded, #4)**: faithful but simplified: same layout, colours, fonts and copy; gradient glows approximated or dropped; looser parity tolerance on the home page.
- Build: parity runs at 1200, 810 and 390 px; home tickets state the tolerance they use.

## 3. Effects
- **Choice (recorded, #5)**: keep all, CSS and plain JavaScript first: FAQ as `<details>`, ticker and appear effects in CSS, menu and slider as small scripts, `prefers-reduced-motion` respected. Videos decided per ticket.
- Build: menu in T01, slider in T04, FAQ in T05, appear effects and ticker in T09.

## 4. Languages
- **Choice (recorded, #6)**: a single language, no i18n routing.

## 5. Editing
- **Choice (recorded, #7)**: an Astro content collection, Markdown in git.
- Build: T02 turns the 4 posts into `.md` files.

## 6. CMS export
- Facts: no export; the Blog has 4 published items read from `/blog`; drafts, dates and ids are unknown.
- Options: wait for an export, or build from the published pages.
- **Choice**: build from the published pages. Drafts are never published, so they do not matter; the 4 posts are all that visitors see. An export stays welcome but blocks nothing.
- Build: T02 reads the fields from the pages and notes any it cannot read.

## 7. Hosting, domain and template leftovers
- Facts: `conversion.framer.media` stops serving the new site when the Framer plan ends. Host and final domain are not given.
- **Choice**: static Astro output, which any free static host serves (Cloudflare Pages, Netlify, GitHub Pages). The site URL is one setting (`SITE_URL`, default the Framer address) used for canonical, Open Graph and sitemap. Remove "Made in Framer" and the framer.link referral; keep "Created by Hamza Ehsan" and the placeholder `/legal` text (copy unchanged, flagged for the owner).
- Build: T01 reads `SITE_URL`; T11 sets it for the final domain.

## 8. Redirects
- Facts: Framer's redirects have no export; no maintainer list exists.
- **Choice**: ship `/coming-soon` → `/` and any rows of `migration/redirects.csv` if a maintainer adds one later; nothing waits for it. Static Astro redirects are HTML meta refreshes; T11 asks the host for real 301s.
- Build: T10.

## 9. Images
- **Choice**: each ticket downloads the images its pages use from `framerusercontent.com` into `src/assets/`, through a script T01 provides (`scripts/fetch-images.mjs <url>...`, query stripped). The new site never links to Framer's CDN.

## 10. Analytics
- Facts: only Framer's own `events.framer.com` script; no other tracker, chat or consent banner.
- **Choice**: drop it, and add no replacement (lowest cost, no consent banner needed). A person can add a tool later.

## Still open
- The final domain and host (needed only at T11, a person's task).
- Where the contact and newsletter messages go (accounts for a form service and a mailing tool); until then the forms do nothing.
- Optional: `migration/redirects.csv` from Framer's site settings, and a CMS Export of the Blog.
