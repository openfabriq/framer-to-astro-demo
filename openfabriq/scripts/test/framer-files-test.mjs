// Runs framer-files.sh on CSV files like those of Framer's CMS Export plugin, against a fake CDN on this machine.
// node --test 'openfabriq/scripts/test/*-test.mjs'
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";

const script = join(import.meta.dirname, "..", "framer-files.sh");

/** A fake CDN that serves every image and file under /cdn/, except missing.pdf. */
async function fakeCdn() {
	const asked = [];
	const server = createServer((request, response) => {
		asked.push(request.url);
		const found =
			request.url?.startsWith("/cdn/") && !request.url.includes("missing");
		response.statusCode = found ? 200 : 404;
		response.end(found ? "file bytes" : "");
	});
	await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
	const port = server.address().port;
	return {
		base: `http://127.0.0.1:${port}/cdn`,
		env: { FRAMER_CDN: `http://127\\.0\\.0\\.1:${port}/` },
		asked,
		server,
	};
}

const run = (dir, env) =>
	promisify(execFile)(script, {
		cwd: dir,
		env: { PATH: process.env.PATH, ...env },
	});

test("downloads each file the exported CMS points to once, without its query", async () => {
	const cdn = await fakeCdn();
	const dir = mkdtempSync(join(tmpdir(), "framer-files-"));
	const cms = join(dir, "migration/framer-cms");
	mkdirSync(cms, { recursive: true });
	// As the plugin writes it: every cell quoted, the quotes of rich text doubled.
	writeFileSync(
		join(cms, "blog.csv"),
		[
			'"Slug","Title","Cover","Cover:alt","Body","Brochure"',
			`"hello","Hello","${cdn.base}/images/cover.png?scale-down-to=512","A cover","<p>Hi</p><img src=""${cdn.base}/images/inline.jpg"" alt="""">","${cdn.base}/assets/missing.pdf"`,
			`"again","Again","${cdn.base}/images/cover.png","","<p>No image</p>",""`,
		].join("\n"),
	);
	writeFileSync(
		join(cms, "blog.galleries.json"),
		JSON.stringify({ hello: [{ url: `${cdn.base}/images/gallery-1.webp` }] }),
	);
	let output;
	try {
		output = await run(dir, cdn.env);
	} finally {
		cdn.server.close();
	}
	const out = join(dir, "framer-export");

	assert.equal(
		readFileSync(join(out, "assets/cdn/images/cover.png"), "utf8"),
		"file bytes",
	);
	assert.ok(existsSync(join(out, "assets/cdn/images/inline.jpg")));
	assert.ok(existsSync(join(out, "assets/cdn/images/gallery-1.webp")));
	assert.equal(
		readFileSync(join(out, "assets-missing.txt"), "utf8"),
		`${cdn.base}/assets/missing.pdf\n`,
	);
	assert.deepEqual(cdn.asked.sort(), [
		"/cdn/assets/missing.pdf",
		"/cdn/images/cover.png",
		"/cdn/images/gallery-1.webp",
		"/cdn/images/inline.jpg",
	]);
	assert.match(output.stdout, /Downloaded 4 files .* 1 files missing/);
});

test("never writes outside framer-export/assets/", async () => {
	const dir = mkdtempSync(join(tmpdir(), "framer-files-"));
	mkdirSync(join(dir, "migration/framer-cms"), { recursive: true });
	writeFileSync(
		join(dir, "migration/framer-cms/team.csv"),
		'"Slug","Photo"\n"bob","https://framerusercontent.com/../../escape.png"',
	);
	const output = await run(dir, {
		FRAMER_CDN: "https://framerusercontent\\.com/",
	});
	assert.match(output.stdout, /Downloaded 0 files/);
});

test("stops when the CMS was not exported", async () => {
	const dir = mkdtempSync(join(tmpdir(), "framer-files-"));
	await assert.rejects(run(dir, {}), /migration\/framer-cms\/ is missing/);
});
