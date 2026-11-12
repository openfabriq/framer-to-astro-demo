// Reads the Blog from the published pages (decision 6: there is no CMS export) and writes
// migration/framer-cms/blog.csv in the shape of a CMS Export, so the importer treats it as one.
//   node scripts/read-blog.mjs            (needs the network; run by hand, never by the build)
// Not readable on the pages: draft state, publication date, ids. Category and author are plain names.
import { mkdirSync, writeFileSync } from 'node:fs';

const SITE = process.env.LEGACY_SITE_URL ?? 'https://conversion.framer.media';
const SLUGS = ['why-you-need-a-blog', 'increase-leads', 'high-converting-pages', 'top-marketing-trends'];
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const meta = (h, re) => decode(h.match(re)?.[1] ?? '');
const clean = (html) => html.replace(/<!--.*?-->/gs, '').replace(/<(\w+)\s[^>]*>/g, '<$1>').trim();
const text = (html) => decode(html.replace(/<[^>]+>/g, '')).trim();
const cell = (v) => `"${String(v).replace(/"/g, '""')}"`;

const header = ['Slug', 'Title', 'Description', 'Category', 'Author', 'Author image', 'Author image:alt', 'Read time', 'Image', 'Image:alt', 'Intro', 'Body'];
const rows = [header];
for (const slug of SLUGS) {
	const res = await fetch(`${SITE}/blog/${slug}`);
	if (!res.ok) throw new Error(`${slug}: HTTP ${res.status}`);
	const html = await res.text();
	const post = html.slice(html.indexOf('data-framer-name="Post"'));
	const title = text(post.match(/<h1[^>]*>(.*?)<\/h1>/s)[1]);
	const category = text(post.match(/Elements\/Badge.*?<p[^>]*>(.*?)<\/p>/s)[1]);
	const author = text(post.match(/Written by<\/p>.*?<p[^>]*>([^<]*)<\/p>/s)[1]);
	const authorImage = post.match(/Written by<\/p>.*?<img[^>]*src="([^"]+)"/s)[1];
	const readTime = text(post.match(/<p[^>]*>(\d+ min read)<\/p>/)[1]);
	const cover = meta(html, /property="og:image" content="([^"]*)"/);
	const afterCover = post.slice(post.indexOf(cover));
	const intro = clean(afterCover.match(/<div[^>]*>(<p.*?)<\/div>/s)[1]);
	const afterStyle = post.slice(post.indexOf('</style>', post.indexOf('In this post:')) + 8);
	const body = clean(afterStyle.match(/<div[^>]*>(<h2.*?)<\/div>/s)[1]);
	rows.push([slug, title, meta(html, /<meta name="description" content="([^"]*)"/), category, author, authorImage, '', readTime, cover, '', intro, body]);
}
mkdirSync('migration/framer-cms', { recursive: true });
writeFileSync('migration/framer-cms/blog.csv', rows.map((r) => r.map(cell).join(',')).join('\n') + '\n');
console.log(`wrote ${rows.length - 1} posts`);
