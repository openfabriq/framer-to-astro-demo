// `pnpm run import`: migration/framer-cms/ into the site's content (src/content/<collection>/).
// No-op when migration/framer-cms/ is absent. Never calls the network; running it twice gives the same files.
// A collection's mapper is `src/lib/mappers/<collection>.ts`, which exports
//   mapRow(row, ctx): { slug: string; data: Record<string, unknown>; body?: string; files?: string[] }
// where `ctx` holds the ids (ids.json) and the gallery of the collection (<collection>.galleries.json).
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseCsv } from '../src/lib/csv.ts';

const CMS = 'migration/framer-cms';
const readJson = (path: string, fallback: unknown) => (existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : fallback);

if (!existsSync(CMS)) {
	console.log(`import: ${CMS}/ is absent, nothing to import.`);
	process.exit(0);
}

const ids = readJson(join(CMS, 'ids.json'), {});
for (const file of readdirSync(CMS).filter((f) => f.endsWith('.csv')).sort()) {
	const collection = file.replace(/\.csv$/, '');
	const mapperPath = join('src/lib/mappers', `${collection}.ts`);
	if (!existsSync(mapperPath)) {
		console.warn(`import: no mapper for ${collection}, skipped (expected ${mapperPath}).`);
		continue;
	}
	const { mapRow } = await import(pathToFileURL(mapperPath).href);
	const galleries = readJson(join(CMS, `${collection}.galleries.json`), {});
	let written = 0;
	for (const row of parseCsv(readFileSync(join(CMS, file), 'utf8'))) {
		if (row[':draft'] === 'true') continue; // a draft is never published
		const { slug, data, body = '', files = [] } = mapRow(row, { ids, galleries });
		const path = join('src/content', collection, `${slug}.md`);
		mkdirSync(dirname(path), { recursive: true });
		// JSON is valid YAML: values keep their types and nothing needs escaping.
		const front = Object.entries(data).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n');
		writeFileSync(path, `---\n${front}\n---\n\n${body.trim()}\n`);
		for (const url of files) {
			const rel = new URL(url).pathname.replace(/^\//, '');
			const from = join('framer-export/assets', rel);
			if (existsSync(from)) cpSync(from, join('src/content', collection, 'files', rel));
			else console.warn(`import: ${from} is missing (see framer-export/assets-missing.txt).`);
		}
		written++;
	}
	console.log(`import: ${collection}: ${written} entries.`);
}
