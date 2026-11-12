// @ts-check
import { existsSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import { allRedirects } from './src/lib/redirects.ts';

// The one place the site's address is set: canonical, Open Graph and sitemap read it.
const site = (process.env.SITE_URL ?? 'https://conversion.framer.media').replace(/\/$/, '');
// The base path comes from SITE_URL's path (https://org.github.io/repo → /repo); a bare domain has none.
const base = new URL(site).pathname.replace(/\/$/, '') || '/';

// Decision 8: /coming-soon and the rows of migration/redirects.csv (if a maintainer adds one).
const csv = existsSync('migration/redirects.csv') ? readFileSync('migration/redirects.csv', 'utf8') : undefined;

// https://astro.build/config
export default defineConfig({
	site,
	base,
	trailingSlash: 'never',
	build: { format: 'file' },
	redirects: allRedirects(csv, base),
});
