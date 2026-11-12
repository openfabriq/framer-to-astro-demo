// `pnpm parity`: compares the Framer pages and the Astro pages listed in migration/parity/T*.json.
//   per page: title, description, canonical, h1, links (from the HTML);
//   per breakpoint (1200, 810, 390 px): rendered text and page height (from a browser: agent-browser).
// Screenshots of both sites go to parity-report/. The Astro pages are read from `dist/` (run `pnpm build` first).
// Which pages: `pnpm parity T05` or `pnpm parity /about` names them, `pnpm parity --all` takes every
// page; with nothing named, the pages of the parity files this branch changes (its ticket's), else all.
// The old site does not change during the migration: its measures are kept a day in parity-report/old/,
// in this copy of the repository, so a second run of parity in the same run is quick (`--fresh` measures again).
import { spawn, execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { diffLists, heightGap, linksOf, parityFiles, parseHead, pickPages, textLines, withoutOrigin } from './parity-lib.mjs';

const OLD = (process.env.LEGACY_SITE_URL ?? 'https://conversion.framer.media').replace(/\/$/, '');
const PORT = 4322;
const SITE = (process.env.SITE_URL ?? OLD).replace(/\/$/, '');
// The built site lives under SITE_URL's path (GitHub Pages: /repo); the old site and the page paths do not.
const BASE = new URL(SITE).pathname.replace(/\/$/, '');
const NEW = `http://localhost:${PORT}${BASE}`;
const origins = [OLD, NEW, SITE, `http://localhost:${PORT}`, new URL(SITE).origin];
const unbase = (l) => (BASE && (l === BASE || l.startsWith(`${BASE}/`) || l.startsWith(`${BASE}#`)) ? l.slice(BASE.length).replace(/^(?!\/)/, '/') : l);
const WIDTHS = [1200, 810, 390];
const REPORT = 'parity-report';

process.env.AGENT_BROWSER_SOCKET_DIR ??= join(process.env.TMPDIR ?? tmpdir(), 'agent-browser');

const args = process.argv.slice(2);
const files = existsSync('migration/parity')
	? readdirSync('migration/parity').filter((f) => /^T\d+.*\.json$/.test(f))
	: [];
// The parity files the branch changes against the default branch, committed or not.
const git = (...a) => execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
let changed = [];
try {
	let base = 'origin/main';
	try {
		base = git('symbolic-ref', '-q', '--short', 'refs/remotes/origin/HEAD');
	} catch {}
	const since = git('merge-base', 'HEAD', base);
	changed = [git('diff', '--name-only', since, '--', 'migration/parity'), git('ls-files', '--others', '--exclude-standard', '--', 'migration/parity')]
		.join('\n')
		.split('\n')
		.filter(Boolean)
		.map((f) => f.split('/').pop());
} catch {}
const chosen = parityFiles(files, changed, args);
const pages = pickPages(
	chosen.flatMap((f) => JSON.parse(readFileSync(join('migration/parity', f), 'utf8')).pages.map((p) => ({ ...p, ticket: f }))),
	args,
);
console.log(`parity: ${pages.length} page(s) of ${chosen.join(', ') || 'no file'}${chosen.length < files.length ? ' (`pnpm parity --all` for every page)' : ''}`);
if (pages.length === 0) {
	console.log('parity: no page listed in migration/parity/, nothing to compare.');
	process.exit(0);
}
if (!existsSync('dist')) {
	console.error('parity: dist/ is missing, run `pnpm build` first.');
	process.exit(1);
}

const browser = (...a) => {
	const out = execFileSync('agent-browser', ['--json', ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
	const r = JSON.parse(out);
	return r.result ?? r.data;
};
// One page at one width in one call: one agent-browser process instead of five.
const measure = (url, width, shot) => {
	const steps = [
		['set', 'viewport', String(width), '900'],
		['open', url],
		['wait', '--load', 'load'],
		['wait', '400'],
		['eval', PROBE],
		['screenshot', '--full', resolve(shot)],
	];
	const out = execFileSync('agent-browser', ['--json', 'batch', '--bail'], {
		input: JSON.stringify(steps),
		encoding: 'utf8',
		stdio: ['pipe', 'pipe', 'ignore'],
		maxBuffer: 64 * 1024 * 1024,
	});
	const results = JSON.parse(out);
	const failed = results.find((r) => !r.success);
	if (failed) throw new Error(`agent-browser ${failed.command.join(' ')}: ${failed.error}`);
	const value = results[4].result?.result ?? results[4].result;
	return JSON.parse(typeof value === 'string' ? value : JSON.stringify(value));
};
const OLD_CACHE = join(REPORT, 'old');
const DAY = 24 * 3600 * 1000;
// The old site's measure, kept a day: it does not change during the migration.
const measureOld = (path, width, shot) => {
	const kept = join(OLD_CACHE, `${slug(path)}-${width}`);
	if (!args.includes('--fresh') && existsSync(`${kept}.json`) && existsSync(`${kept}.png`) && Date.now() - statSync(`${kept}.json`).mtimeMs < DAY) {
		copyFileSync(`${kept}.png`, shot);
		return JSON.parse(readFileSync(`${kept}.json`, 'utf8'));
	}
	const seen = measure(OLD + path, width, shot);
	mkdirSync(OLD_CACHE, { recursive: true });
	writeFileSync(`${kept}.json`, JSON.stringify(seen));
	copyFileSync(shot, `${kept}.png`);
	return seen;
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

// A connection kept alive from the previous page may have been closed by the other side: try again.
const get = async (url, tries = 3) => {
	for (let i = 1; ; i++) {
		try {
			return await (await fetch(url)).text();
		} catch (err) {
			if (i >= tries) throw err;
		}
	}
};

for (const page of pages) {
	const [oldHtml, newHtml] = await Promise.all([OLD, NEW].map((o) => get(o + page.path)));
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
	const newLinks = linksOf(newHtml, NEW + page.path, origins).map(unbase).filter((l) => !ignoreLinks.includes(l));
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
		const shot = (name) => join(REPORT, `${slug(page.path)}-${name}-${width}.png`);
		seen.old = measureOld(page.path, width, shot('old'));
		seen.new = measure(NEW + page.path, width, shot('new'));
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
