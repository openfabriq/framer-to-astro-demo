# Decisions

The maintainer's answers to the questions of `migration/inventory.md`, one per decision issue. For this test, each follows the planner's recommendation.

## 1. Forms (#3)

Newsletter in a mailing tool and contact through a form service; the services are chosen later, so until then both forms are rendered and not wired to any destination. Drop `/coming-soon`, redirected to `/` (SEO ticket).

## 2. Design (#4)

Option 2: faithful but simplified. Same layout, colours, fonts and copy; gradient glows approximated or dropped, spacing normalised. A looser parity tolerance on the home page.

## 3. Effects (#5)

Option 1: keep them all, CSS and plain JavaScript first: the FAQ as `<details>`, the ticker and appear effects in CSS, the menu and slider as small scripts. Respect `prefers-reduced-motion`. Videos are decided per ticket.

## 4. Languages (#6)

Option 1: a single language, the site's current one, no i18n routing.

## 5. Editing (#7)

Option 1: an Astro content collection with Markdown in git.
