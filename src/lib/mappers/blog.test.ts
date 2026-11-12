import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseCsv } from '../csv.ts';
import { htmlToMarkdown, mapRow } from './blog.ts';

const [row] = parseCsv(readFileSync('migration/samples/blog.csv', 'utf8'));

describe('htmlToMarkdown', () => {
	it('maps headings, paragraphs and emphasis', () => {
		expect(htmlToMarkdown('<h2>A</h2><p>x <strong>b</strong> &amp; y</p><h3>C</h3><p>z</p>')).toBe('## A\n\nx **b** & y\n\n### C\n\nz');
	});
	it('maps lists and links', () => {
		expect(htmlToMarkdown('<ul><li>a</li><li><a href="/x">b</a></li></ul><ol><li>c</li></ol>')).toBe('- a\n- [b](/x)\n\n1. c');
	});
	it('drops empty blocks', () => {
		expect(htmlToMarkdown('<p></p><p>a</p>')).toBe('a');
	});
});

describe('mapRow', () => {
	const entry = mapRow(row);
	it('keeps the slug and the text fields', () => {
		expect(entry.slug).toBe('high-converting-pages');
		expect(entry.data).not.toHaveProperty("imageAlt");
		expect(entry.data.category).toBe('Websites');
		expect(entry.data.author).toBe('Hamza Ehsan');
		expect(entry.data.readTime).toBe('7 min read');
	});
	it('points images to local files and lists them for the import', () => {
		expect(entry.data.image).toMatch(/^\.\/files\/images\/.+\.png$/);
		expect(entry.files).toHaveLength(2);
	});
	it('writes Markdown with no HTML or Framer class', () => {
		expect(entry.body).toMatch(/^## /);
		expect(entry.body).toContain('**');
		expect(entry.body).not.toMatch(/<|framer-/);
		expect(entry.data.intro).not.toMatch(/</);
	});
});
