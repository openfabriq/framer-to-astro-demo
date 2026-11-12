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

export function allRedirects(csv: string | undefined): Record<string, string> {
	return { ...(csv ? redirectsFromCsv(csv) : {}), ...baseRedirects };
}
