import { expect, test } from 'vitest';
import { allRedirects, redirectsFromCsv } from './redirects.ts';

test('rows become redirects, header and bad rows are skipped', () => {
	expect(redirectsFromCsv('from,to\n"/old","/new"\n/a,/b\nnope')).toEqual({ '/old': '/new', '/a': '/b' });
});

test('/coming-soon always goes to / and no file is fine', () => {
	expect(allRedirects(undefined)).toEqual({ '/coming-soon': '/' });
	expect(allRedirects('/coming-soon,/x')['/coming-soon']).toBe('/');
});

test('puts the base before a site path target, not before an absolute URL', () => {
	expect(allRedirects('/a,https://x.test/b', '/demo/')).toEqual({ '/a': 'https://x.test/b', '/coming-soon': '/demo/' });
});
