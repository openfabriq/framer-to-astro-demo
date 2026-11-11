---
name: astro-conventions
description: How the new Astro site is laid out and built in this repository. Use before writing or reviewing code of the site.
---

# Astro conventions

Every agent of the migration reads this skill. Keep it short and prescriptive.

- Stack: Astro, TypeScript strict, Vitest, pnpm. The site is static: the build never calls Framer.
- Layout:
  - `src/content.config.ts`: one collection per Framer CMS collection, with a Zod schema;
  - `src/content/<collection>/`: the imported entries, committed;
  - `src/lib/mappers/<collection>.ts`: one mapper per collection, a pure function from a CSV row of `migration/framer-cms/` to an entry (ids resolved through `migration/framer-cms/ids.json`, the gallery from `<collection>.galleries.json`, rich text cleaned of Framer's classes and inline styles), tested in `<collection>.test.ts` on samples saved in `migration/samples/`;
  - `scripts/import.ts`, run by `pnpm run import`: reads `migration/framer-cms/`, skips drafts, runs every mapper, writes the entries and copies the files they use from `framer-export/assets/`; it never calls the network, and running it twice gives the same files;
  - `framer-export/` and `parity-report/` are in `.gitignore`;
  - `src/layouts/`, `src/components/`, `src/pages/`: one component per block several pages repeat, built once.
- URLs: the new site keeps every old URL, or the `seo` ticket redirects it. Never change a URL silently.
- No Framer runtime: no React taken from the published page, no `framer-` class or `data-framer-*` attribute kept for its behavior, no code component copied. An effect becomes CSS (`:hover`, `<details>`, transitions, `@keyframes`, scroll-driven animations, view transitions) when it can.
- No JavaScript in the browser by default. A component that needs it is an island (`client:visible`, or `client:idle`), for a reason written in the pull request.
- Breakpoints: the same widths as the Framer site, read in `migration/inventory.md`, as CSS media queries.
- Images go through `astro:assets` (`<Image />`), stored with the content, with their alternative text from the export. No URL of Framer's CDN in the new site.
- Until the switch, editors write in Framer and `migration:sync` brings the content back: an entry is never edited by hand. After the switch, editing in the browser (Keystatic) only if `migration/decisions.md` says so; otherwise the content stays Markdown in the repository.
- Forms post where `migration/decisions.md` says; never to Framer.
- `scripts/parity.mjs`, run by `pnpm parity` once `pnpm build` has run, compares the Framer page on `$LEGACY_SITE_URL` with the same path of the built site, served from `dist/`, for each page of `migration/parity/*.json`:
  - in the HTML: the title, the meta description, the canonical, the Open Graph tags, the `h1`, and the links as a set;
  - in a browser (agent-browser), at each breakpoint of `migration/inventory.md`: the visible text and the page height;
  - it writes the screenshots of both sites at each width in `parity-report/`, and lists the links whose page does not exist yet, which a later ticket builds;
  - it fails on any difference that the page's entry does not list, and on a height that differs more than 5 %.
- `migration/parity/T<nn>.json`, one file per ticket, lists its pages: `{ "pages": [{ "path": "/about", "ignoreLinks": [], "ignoreText": [], "heightTolerance": 0.05, "why": "" }] }`. An exception or a tolerance above 0.05 says why in `why`, and the ticket that removes its cause removes it; never one only to make parity pass. A ticket writes its own file and never touches another's, so two pull requests never conflict on it.
- Commits: imperative subject line that references the ticket.
