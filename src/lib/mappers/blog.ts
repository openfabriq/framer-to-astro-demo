// One row of migration/framer-cms/blog.csv into a `blog` entry (src/content/blog/<slug>.md).
// Category and author are plain names on the published pages: no id, so ids.json holds nothing for them.

const decode = (s: string) =>
	s.replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

const inline = (html: string) =>
	decode(
		html
			.replace(/<(strong|b)>(.*?)<\/\1>/gs, '**$2**')
			.replace(/<(em|i)>(.*?)<\/\1>/gs, '*$2*')
			.replace(/<a [^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gs, '[$2]($1)')
			.replace(/<br\s*\/?>/g, '  \n')
			.replace(/<[^>]+>/g, ''),
	).trim();

/** Framer's rich text HTML (h2, h3, p, strong, em, ul, ol, a) as Markdown. */
export function htmlToMarkdown(html: string): string {
	const blocks: string[] = [];
	const re = /<(h[1-6]|p|ul|ol|blockquote)\b[^>]*>(.*?)<\/\1>/gs;
	for (const [, tag, inner] of html.matchAll(re)) {
		if (tag === 'p') blocks.push(inline(inner));
		else if (tag === 'blockquote') blocks.push(`> ${inline(inner)}`);
		else if (tag === 'ul' || tag === 'ol') {
			const items = Array.from(inner.matchAll(/<li\b[^>]*>(.*?)<\/li>/gs), (m) => inline(m[1]));
			blocks.push(items.map((t, i) => (tag === 'ul' ? `- ${t}` : `${i + 1}. ${t}`)).join('\n'));
		} else blocks.push(`${'#'.repeat(Number(tag[1]))} ${inline(inner)}`);
	}
	return blocks.filter(Boolean).join('\n\n');
}

const dropUndefined = <T extends object>(o: T) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as { [K in keyof T]: Exclude<T[K], undefined> };
const local = (url: string) => `./files${new URL(url).pathname}`;

export function mapRow(row: Record<string, string>) {
	const files = [row['Image'], row['Author image']].filter(Boolean);
	return {
		slug: row['Slug'],
		data: dropUndefined({
			title: row['Title'],
			description: row['Description'],
			category: row['Category'],
			author: row['Author'],
			authorImage: row['Author image'] ? local(row['Author image']) : undefined,
			authorImageAlt: row['Author image:alt'] || undefined,
			readTime: row['Read time'],
			image: row['Image'] ? local(row['Image']) : undefined,
			imageAlt: row['Image:alt'] || undefined,
			intro: htmlToMarkdown(row['Intro']),
		}),
		body: htmlToMarkdown(row['Body']),
		files,
	};
}
