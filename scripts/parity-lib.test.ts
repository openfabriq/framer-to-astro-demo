import { expect, test } from 'vitest';
import { diffLists, heightGap, linksOf, parseHead, textLines, withoutOrigin } from './parity-lib.mjs';

const origins = ['https://old.test', 'http://localhost:4322'];

test('parseHead reads the head and the distinct h1', () => {
	const html = `<title>A &amp; B</title><meta name="description" content="d"><link rel="canonical" href="https://old.test/x">
		<h1>Hello <span>you</span></h1><h1>Hello you</h1><h1>Other</h1>`;
	expect(parseHead(html)).toEqual({ title: 'A & B', description: 'd', canonical: 'https://old.test/x', h1: ['Hello you', 'Other'] });
});

test('withoutOrigin compares one page on two addresses', () => {
	expect(withoutOrigin('https://old.test/x', origins)).toBe('<site>/x');
});

test('linksOf resolves relative links, drops duplicates and mailto', () => {
	const html = '<a href="./about">a</a><a href="../about">b</a><a href="./#faq">c</a><a href="https://cal.com">d</a><a href="mailto:x@y.z">e</a>';
	expect(linksOf(html, 'https://old.test/legal', origins)).toEqual(['/#faq', '/about', 'https://cal.com/']);
});

test('textLines squashes whitespace, drops empties, ignored lines and repeats', () => {
	expect(textLines('A  b\n\nMade in Framer\nA b\nC', ['Made in Framer'])).toEqual(['A b', 'C']);
});

test('diffLists counts repeats', () => {
	expect(diffLists(['a', 'a', 'b'], ['a', 'c'])).toEqual({ missing: ['a', 'b'], extra: ['c'] });
});

test('heightGap is relative to the old height', () => {
	expect(heightGap(2000, 2100)).toBeCloseTo(0.05);
});
