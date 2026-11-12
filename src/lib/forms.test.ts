import { describe, expect, it } from 'vitest';
import { contactFields, failureMessage, payload } from './forms';

describe('contact fields', () => {
	it('requires the first and last name only, as on Framer', () => {
		expect(contactFields.filter((f) => f.required).map((f) => f.name)).toEqual(['first-name', 'last-name']);
	});
});

describe('failureMessage', () => {
	it('says sending is unavailable without a destination', () => {
		expect(failureMessage('')).toMatch(/not available/);
	});
	it('tells a network failure from a refusal', () => {
		expect(failureMessage('https://x.test')).toMatch(/Could not reach/);
		expect(failureMessage('https://x.test', 500)).toMatch(/went wrong/);
	});
});

describe('payload', () => {
	it('names the form and leaves the honeypot out', () => {
		const data = new FormData();
		data.set('email', 'a@b.co');
		data.set('hp', 'bot');
		expect(payload('newsletter', data)).toEqual({ form: 'newsletter', email: 'a@b.co' });
	});
});
