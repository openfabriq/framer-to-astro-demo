// @ts-check
import { defineConfig } from 'astro/config';

// The one place the site's address is set: canonical, Open Graph and sitemap read it.
const site = (process.env.SITE_URL ?? 'https://conversion.framer.media').replace(/\/$/, '');

// https://astro.build/config
export default defineConfig({
	site,
	trailingSlash: 'never',
	build: { format: 'file' },
});
