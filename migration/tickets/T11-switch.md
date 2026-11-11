# T11 [switch] Go live
Status: open
Blocked by: T01, T02, T03, T04, T05, T06, T07, T08, T09, T10

Part of #1

No agent builds this: a person does it.

## Checklist
- [ ] Choose the host and the final domain; set `SITE_URL`
- [ ] Create the form service and mailing accounts and wire T03's forms
- [ ] Optional: copy Framer's redirects into `migration/redirects.csv`
- [ ] Freeze the Framer site; compare the sitemaps one last time
- [ ] Point the domain to the new host
- [ ] Put `/coming-soon` → `/` live as a 301 at the host
- [ ] Check the live site and submit the sitemap to search engines
- [ ] Cancel the Framer plan
