import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

// The pages of the site, without /404 and without redirects (/coming-soon, decision 8).
const pages = ['/', '/about', '/services', '/legal', '/contact', '/blog'];

export const GET: APIRoute = async ({ site }) => {
	const posts = (await getCollection('blog')).map((p) => `/blog/${p.id}`).sort();
	const urls = [...pages, ...posts].map((p) => `<url><loc>${new URL(p, site).href}</loc></url>`);
	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
	return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
