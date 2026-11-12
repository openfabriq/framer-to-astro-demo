# T02 [content-type] Blog collection and its 4 posts
Status: done
Blocked by: T01

Part of #1

URLs: `/blog/why-you-need-a-blog`, `/blog/increase-leads`, `/blog/high-converting-pages`, `/blog/top-marketing-trends`

Decisions: 5, 6, 9

## Scope
- Content collection `blog` (Markdown + frontmatter: title, description, category, author, read time, cover/og image), read from the published pages; fields not readable are noted in the ticket's pull request.
- Mapper from post HTML to Markdown with unit tests; import script; images downloaded.
- Out: templates (T08).

## Acceptance
- [ ] 4 posts are in the collection, bodies match the published text
- [ ] mapper tested, `pnpm import` and `pnpm test` pass
- [ ] images are local
- [ ] category and author ids: none exist without an export; the choice is noted
