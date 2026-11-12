// `pnpm parity`: compares the Framer pages and the Astro pages listed in migration/parity/T*.json.
//   per page: title, description, canonical, h1, links (from the HTML);
//   per breakpoint (1200, 810, 390 px): rendered text and page height (from a browser: agent-browser).
// Screenshots of both sites go to parity-report/. The Astro pages are read from `dist/` (run `pnpm build` first).
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { diffLists, heightGap, linksOf, parseHead, textLines, withoutOrigin } from './parity-lib.mjs';

const OLD = (process.env.LEGACY_SITE_URL ?? 'https://conversion.framer.media').replace(/\/$/, '');
const PORT = 4322;
const NEW = `http://localhost:${PORT}`;
const SITE = (process.env.SITE_URL ?? OLD).replace(/\/$/, '');
const origins = [OLD, NEW, SITE];
const WIDTHS = [1200, 810, 390];
const REPORT = 'parity-report';

process.env.AGENT_BROWSER_SOCKET_DIR ??= join(process.env.TMPDIR ?? tmpdir(), 'agent-browser');

const files = existsSync('migration/parity')
	? readdirSync('migration/parity').filter((f) => /^T\d+.*\.json$/.test(f))
	: [];
const pages = files.flatMap((f) =>
	JSON.parse(readFileSync(join('migration/parity', f), 'utf8')).pages.map((p) => ({ ...p, ticket: f })),
);
if (pages.length === 0) {
	console.log('parity: no page listed in migration/parity/, nothing to compare.');
	process.exit(0);
}
if (!existsSync('dist')) {
	console.error('parity: dist/ is missing, run `pnpm build` first.');
	process.exit(1);
}

const browser = (...args) => {
	const out = execFileSync('agent-browser', ['--json', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
	return JSON.parse(out).data;
};
const PROBE = `JSON.stringify({ height: document.documentElement.scrollHeight, text: document.body.innerText })`;
const slug = (path) => (path === '/' ? 'home' : path.replace(/^\//, '').replace(/\W+/g, '-'));

const preview = spawn('node_modules/.bin/astro', ['preview', '--port', String(PORT)], { stdio: 'ignore', detached: true });
const stop = () => {
	try {
		process.kill(-preview.pid);
	} catch {}
	try {
		browser('close');
	} catch {}
};
process.on('exit', stop);
for (let i = 0; ; i++) {
	try {
		if ((await fetch(NEW)).ok) break;
	} catch {}
	if (i > 60) {
		console.error('parity: `astro preview` does not answer.');
		process.exit(1);
	}
	await new Promise((r) => setTimeout(r, 500));
}

mkdirSync(REPORT, { recursive: true });
const failures = [];
const report = [];
const check = (page, what, ok, detail = '') => {
	report.push({ path: page.path, check: what, ok, detail });
	console.log(`${ok ? 'ok  ' : 'FAIL'} ${page.path} ${what}${detail ? `: ${detail}` : ''}`);
	if (!ok) failures.push(`${page.path} ${what}`);
};
const show = (list) => list.map((x) => JSON.stringify(x)).join(', ');

// The preview server closes idle connections while the browser works: retry once on a stale one.
const getText = async (url) => {
	try {
		return await (await fetch(url)).text();
	} catch {
		return await (await fetch(url)).text();
	}
};

for (const page of pages) {
	const [oldHtml, newHtml] = await Promise.all(
		[OLD, NEW].map((o) => getText(o + page.path)),
	);
	const oldHead = parseHead(oldHtml);
	const newHead = parseHead(newHtml);
	for (const key of ['title', 'description']) {
		check(page, key, oldHead[key] === newHead[key], oldHead[key] === newHead[key] ? '' : `old ${show([oldHead[key]])}, new ${show([newHead[key]])}`);
	}
	const canon = [oldHead.canonical, newHead.canonical].map((c) => withoutOrigin(c, origins));
	check(page, 'canonical', canon[0] === canon[1], `old ${canon[0]}, new ${canon[1]}`);
	check(page, 'h1', show(oldHead.h1) === show(newHead.h1), show(oldHead.h1) === show(newHead.h1) ? '' : `old ${show(oldHead.h1)}, new ${show(newHead.h1)}`);

	const ignoreLinks = page.ignoreLinks ?? [];
	const oldLinks = linksOf(oldHtml, OLD + page.path, origins).filter((l) => !ignoreLinks.includes(l));
	const newLinks = linksOf(newHtml, NEW + page.path, origins).filter((l) => !ignoreLinks.includes(l));
	const links = diffLists(oldLinks, newLinks);
	check(page, 'links', links.missing.length === 0 && links.extra.length === 0, `missing ${show(links.missing)}; extra ${show(links.extra)}`);

	// Links to pages of a later ticket cannot resolve yet: they are listed, not failed.
	const unresolved = newLinks
		.filter((l) => l.startsWith('/'))
		.map((l) => l.split('#')[0] || '/')
		.filter((p) => !existsSync(join('dist', p === '/' ? 'index.html' : `${p}.html`)));
	const pending = [...new Set(unresolved)];
	console.log(`${pending.length ? 'warn' : 'ok  '} ${page.path} links resolve${pending.length ? `: no page yet for ${pending.join(', ')}` : ''}`);
	report.push({ path: page.path, check: 'links resolve', ok: pending.length === 0, detail: pending.join(', ') });

	for (const width of WIDTHS) {
		const seen = {};
		for (const [name, origin] of [['old', OLD], ['new', NEW]]) {
			browser('set', 'viewport', String(width), '900');
			browser('open', origin + page.path);
			browser('wait', '1200');
			seen[name] = JSON.parse(browser('eval', PROBE).result);
			browser('screenshot', '--full', join(REPORT, `${slug(page.path)}-${name}-${width}.png`));
		}
		// The closed hamburger menu of the old site is still in its rendered text below 1200px.
		const ignore = [...(page.ignoreText ?? []), ...(width < 1200 ? (page.ignoreTextBelow1200 ?? []) : [])];
		const text = diffLists(textLines(seen.old.text, ignore), textLines(seen.new.text, ignore));
		check(page, `text @${width}`, text.missing.length === 0 && text.extra.length === 0, `missing ${show(text.missing)}; extra ${show(text.extra)}`);
		const tolerance = page.heightTolerance ?? 0.05; // `heightReason` says why a page needs more
		const gap = heightGap(seen.old.height, seen.new.height);
		check(page, `height @${width}`, gap <= tolerance, `old ${seen.old.height}px, new ${seen.new.height}px, gap ${(gap * 100).toFixed(1)} % (tolerance ${(tolerance * 100).toFixed(0)} %)`);
	}
}

writeFileSync(join(REPORT, 'report.json'), JSON.stringify(report, null, 2));
stop();
if (failures.length) {
	console.error(`\nparity: ${failures.length} check(s) failed.`);
	process.exit(1);
}
console.log('\nparity: all checks passed.');
process.exit(0);
