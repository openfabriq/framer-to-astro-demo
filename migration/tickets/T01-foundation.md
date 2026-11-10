# T01 [foundation] Astro skeleton, layout, menus, import and parity scripts
Status: open
Blocked by: none

Part of #1

URLs: `/`, `/legal`

Decisions: 2, 3, 7, 9

## Scope
- Astro project: base layout, nav (Pages dropdown, hamburger menu script, Book a call), CTA band, footer (newsletter form markup left to T03), fonts, colours, `SITE_URL` setting, `.gitignore` (`framer-export/`, `node_modules`, `dist`).
- `pnpm import` (no-op when `migration/framer-cms/` is absent), `pnpm parity` (compares Framer and Astro pages at 1200, 810 and 390 px, title, description, canonical, h1, links), `scripts/fetch-images.mjs`.
- Out: page content.

## Acceptance
- [ ] `pnpm build` and `pnpm test` pass
- [ ] `/legal` builds with shared layout; `pnpm parity` passes for it at each breakpoint
- [ ] title, meta description, canonical and h1 match
- [ ] every link resolves; menu opens on phone and tablet
