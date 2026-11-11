// Pure helpers of `pnpm parity`: no network, no browser, tested in parity-lib.test.ts.

const decode = (s) =>
	s
		.replace(/&quot;/g, '"')
		.replace(/&#39;|&apos;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&');

const squash = (s) => s.replace(/\s+/g, ' ').trim();

/** Title, description, canonical and the distinct h1 texts of an HTML page. */
export function parseHead(html) {
	const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1];
	const description = /<meta[^>]*name="description"[^>]*content="([^"]*)"/i.exec(html)?.[1];
	const canonical = /<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i.exec(html)?.[1];
	const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
		squash(decode(m[1].replace(/<[^>]+>/g, ''))),
	);
	return {
		title: title === undefined ? undefined : squash(decode(title)),
		description: description === undefined ? undefined : squash(decode(description)),
		canonical,
		// Framer prints each heading once per breakpoint.
		h1: [...new Set(h1s)],
	};
}

/** Replaces the site's origin by `<site>` so two addresses of one page compare equal. */
export function withoutOrigin(url, origins) {
	if (!url) return url;
	for (const o of origins) if (url.startsWith(o)) return '<site>' + url.slice(o.length);
	return url;
}

/** An href as a path (`/about`, `/#faq`) when it stays on the site, else the absolute URL. */
export function normalizeLink(href, pageUrl, origins) {
	const url = new URL(href, pageUrl);
	if (origins.includes(url.origin)) {
		const path = url.pathname.length > 1 ? url.pathname.replace(/\/$/, '') : url.pathname;
		return path + url.search + url.hash;
	}
	return url.href;
}

/** Hrefs of every anchor of an HTML page, normalised, without duplicates. */
export function linksOf(html, pageUrl, origins) {
	const hrefs = [...html.matchAll(/<a\b[^>]*\shref="([^"]*)"/gi)].map((m) => decode(m[1]));
	const links = hrefs
		.filter((h) => !/^(mailto:|tel:|javascript:)/.test(h))
		.map((h) => normalizeLink(h, pageUrl, origins));
	return [...new Set(links)].sort();
}

/**
 * Distinct lines of rendered text, whitespace squashed, empty lines and `ignore` entries removed.
 * Framer renders a navigation or a footer once per breakpoint, so a line seen twice counts once.
 */
export function textLines(innerText, ignore = []) {
	const lines = innerText
		.split('\n')
		.map(squash)
		.filter((l) => l && !ignore.includes(l));
	return [...new Set(lines)];
}

/** What `old` has that `next` lacks, and the reverse, as multisets keeping order. */
export function diffLists(old, next) {
	const count = (list) => list.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map());
	const take = (from, other) => {
		const left = count(other);
		return from.filter((x) => {
			const n = left.get(x) ?? 0;
			if (n > 0) left.set(x, n - 1);
			return n === 0;
		});
	};
	return { missing: take(old, next), extra: take(next, old) };
}

/** Relative difference of two heights, `0.05` for 5 %. */
export const heightGap = (old, next) => Math.abs(next - old) / old;
