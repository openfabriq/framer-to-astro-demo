import { expect, test } from 'vitest';
import { parseCsv } from './csv';

test('reads quoted cells, doubled quotes and newlines inside a cell', () => {
	const csv = '"Slug","Title","Body"\n"a","Say ""hi""","line 1\nline 2"\n"b","","x, y"\n';
	expect(parseCsv(csv)).toEqual([
		{ Slug: 'a', Title: 'Say "hi"', Body: 'line 1\nline 2' },
		{ Slug: 'b', Title: '', Body: 'x, y' },
	]);
});

test('an empty file has no rows', () => {
	expect(parseCsv('')).toEqual([]);
});
