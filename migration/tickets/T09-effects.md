# T09 [feature] Appear animations and logo ticker
Status: open
Blocked by: T05, T06, T07, T08

Part of #1

URLs: `/`, `/about`, `/blog`

Decisions: 3

## Scope
- Appear-on-scroll effects (15 on home), logo ticker, decorative glow animation, in CSS first, with `prefers-reduced-motion`. Timings were not read: observe the Framer page in a browser.

## Acceptance
- [ ] effects work at each breakpoint and are off under reduced motion
- [ ] `pnpm parity` still passes for its URLs
- [ ] no layout shift or text hidden without JavaScript
