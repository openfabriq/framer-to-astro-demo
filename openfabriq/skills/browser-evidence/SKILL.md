---
name: browser-evidence
description: How to compare an old Framer page and its new Astro page in a real browser with agent-browser, and how to show side by side screenshots as proof in a pull request. Use when you build or review a page of the migration.
---

# Browser evidence

A migrated page is proven in a browser, next to the page it replaces, not only by tests. Use the `agent-browser` command (installed on the engine's machine with Playwright's headless Chrome: `npm install -g agent-browser && npx playwright install chromium-headless-shell`). Run `agent-browser --help` once if you are unsure of a command: it is the reference.

The old page is always the published Framer page, `$LEGACY_SITE_URL/<path>`.

## Start the browser

Drive the browser through this skill's script, `openfabriq/skills/browser-evidence/scripts/browse.sh`, one call per check. It starts the app, waits until its address answers, runs your steps with `agent-browser batch`, then closes the browser and stops the app:

```sh
sh openfabriq/skills/browser-evidence/scripts/browse.sh "pnpm preview --port 4321" http://localhost:4321 "open http://localhost:4321/<path>" "snapshot -i" "screenshot --full evidence/<issue-number>/<name>.png"
```

Each step is one `agent-browser` command without its name: `open <url>`, `snapshot -i`, `set viewport 390 900`, `fill <ref> <text>`, `click <ref>`, `eval <js>`, `screenshot --full <path>`. Run `agent-browser --help` once if you are unsure of one. Your commands run in a sandbox that, on Linux (the engine in Docker included), stops the browser and the app when the command ends, and the next command cannot reach the app: never start them in one command to use them in the next. The script finds the headless Chrome in agent-browser's settings on the engine's machine and keeps its socket in the temporary folder. Never load settings with `.` or `source`: Claude Code asks for permission before such a command, nobody can answer during a run, and the command is refused.

If the browser does not start, on any system, stop the browser part there: say in your result that it could not run, with the error, and never present a criterion as checked.

## Compare a page

1. Build the new site once (`pnpm build`); the script serves it with `pnpm preview --port 4321`.
2. For each representative URL of the ticket, at desktop width (`agent-browser set viewport 1440 900`), then at phone width (`agent-browser set viewport 390 844`):
   - open the old page: `agent-browser open $LEGACY_SITE_URL/<path>`;
   - read it before judging: `agent-browser snapshot -i` lists its elements;
   - open the new page: `agent-browser open http://localhost:4321/<path>`, and read it the same way.
3. Compare what a visitor gets: the same blocks in the same order, the same text and images, the same menus and links, forms that behave the same. Click what the ticket says works (a menu, a form, a filter).
4. Say each difference you see, and each thing you could not check. Never assume.
5. The script closes the browser and stops the site at the end of each call.

## Screenshots as proof

- Take four screenshots per representative URL: old and new, desktop and phone, named `evidence/<issue-number>/<page>-<old|new>-<desktop|phone>.png`. Wait for fonts and images to load; close a cookie banner the same way on both sites. Framer's appear and scroll effects can start hidden: scroll through the old page to its end and back before the screenshot, or blocks may show empty.
- If you deliver code (`create_pull_request` or `push_to_pull_request`): commit the screenshots with your change. In the pull request description, show them side by side, linked by the commit that holds them, so the link never moves:

  | /blog/hello/ | Old | New |
  | --- | --- | --- |
  | Desktop | ![old](https://github.com/<owner>/<repo>/blob/<commit-sha>/evidence/<issue-number>/blog-post-old-desktop.png?raw=true) | ![new](https://github.com/<owner>/<repo>/blob/<commit-sha>/evidence/<issue-number>/blog-post-new-desktop.png?raw=true) |

  The repository is the `repository` of the factory; the commit is `git rev-parse HEAD` after your commit.
- If you review (no push): do not commit anything. Run the same comparison yourself, and say in your comment, URL by URL, whether the browser agrees with the screenshots. A screenshot that does not match what you see is a finding.

Never put a screenshot of a page that shows personal data (a members area, a form with answers, an admin page), a token or a secret.
