/** Decision 8: `/coming-soon` goes to `/`, then the rows (`from,to`, header optional) of migration/redirects.csv. */
export const baseRedirects: Record<string, string> = { '/coming-soon': '/' };

export function redirectsFromCsv(text: string): Record<string, string> {
	const out: Record<string, string> = {};
	for (const line of text.split(/\r?\n/)) {
		const [from, to] = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
		if (!from?.startsWith('/') || !to) continue;
		out[from] = to;
	}
	return out;
}

/** Astro prefixes the `from` with the base but not the `to`: a site path as target gets the base here. */
export function allRedirects(csv: string | undefined, base = '/'): Record<string, string> {
	const root = base.replace(/\/+$/, '');
	const all = { ...(csv ? redirectsFromCsv(csv) : {}), ...baseRedirects };
	return Object.fromEntries(Object.entries(all).map(([from, to]) => [from, to.startsWith('/') ? root + to : to]));
}
