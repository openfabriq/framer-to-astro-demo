// Downloads the images a page uses from Framer's CDN into src/assets/images/ (decision 9):
//   node scripts/fetch-images.mjs <url>...
// The query string is dropped (`…/a.png?scale-down-to=512` is saved as `a.png`); import the file from
// `src/assets/images/` through astro:assets, never link to framerusercontent.com.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const IMAGES_DIR = 'src/assets/images';
const HOST = 'framerusercontent.com';

/** Where the image of `url` is saved; throws for a URL that is not on Framer's CDN. */
export function imagePath(url, dir = IMAGES_DIR) {
	const u = new URL(url);
	if (u.hostname !== HOST) throw new Error(`${url}: not an image of ${HOST}`);
	const name = basename(u.pathname);
	if (!name) throw new Error(`${url}: no file name`);
	return join(dir, name);
}

async function main(urls) {
	if (urls.length === 0) {
		console.error('usage: node scripts/fetch-images.mjs <url>...');
		process.exit(2);
	}
	mkdirSync(IMAGES_DIR, { recursive: true });
	let failed = 0;
	for (const url of urls) {
		try {
			const path = imagePath(url);
			if (existsSync(path)) {
				console.log(`have ${path}`);
				continue;
			}
			const res = await fetch(url.split('?')[0]);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			writeFileSync(path, Buffer.from(await res.arrayBuffer()));
			console.log(`saved ${path}`);
		} catch (e) {
			failed++;
			console.error(`FAIL ${url}: ${e.message}`);
		}
	}
	process.exit(failed ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main(process.argv.slice(2));
