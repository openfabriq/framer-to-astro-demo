import { expect, test } from 'vitest';
import { imagePath } from './fetch-images.mjs';

test('drops the query string and keeps the file name', () => {
	expect(imagePath('https://framerusercontent.com/images/a.png?scale-down-to=512', 'out')).toBe('out/a.png');
});

test('refuses anything that is not on Framer’s CDN', () => {
	expect(() => imagePath('https://example.com/a.png')).toThrow();
});
