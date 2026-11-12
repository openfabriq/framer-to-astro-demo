import { describe, expect, it } from 'vitest';
import { absoluteUrl, withBase } from './url';

describe('withBase', () => {
	it('prefixes the base', () => {
		expect(withBase('/about', '/demo/')).toBe('/demo/about');
		expect(withBase('/', '/demo')).toBe('/demo/');
		expect(withBase('/#faq', '/demo/')).toBe('/demo/#faq');
	});
	it('leaves paths alone without a base', () => {
		expect(withBase('/about', '/')).toBe('/about');
		expect(withBase('/', '/')).toBe('/');
	});
});

describe('absoluteUrl', () => {
	it('keeps the base in canonicals and sitemap', () => {
		expect(absoluteUrl('/about', 'https://x.github.io/demo', '/demo/')).toBe('https://x.github.io/demo/about');
		expect(absoluteUrl('/', 'https://x.github.io/demo', '/demo/')).toBe('https://x.github.io/demo/');
		expect(absoluteUrl('/about', 'https://example.com', '/')).toBe('https://example.com/about');
	});
});
