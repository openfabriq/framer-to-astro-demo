// Where the forms post: one setting. Until a form service and a mailing tool are chosen
// (decision 1), it is empty and the forms answer with their error state.
export const FORM_ENDPOINT: string = import.meta.env.PUBLIC_FORM_ENDPOINT ?? '';

export type FormField = {
	name: string;
	label?: string;
	type?: 'text' | 'email' | 'url' | 'textarea';
	placeholder?: string;
	required?: boolean;
	/** Share a row with the next field from 810px. */
	half?: boolean;
};

/** The fields of /contact, with the labels, types and required marks of the Framer form. */
export const contactFields: FormField[] = [
	{ name: 'first-name', label: 'First Name', placeholder: 'Peter', required: true, half: true },
	{ name: 'last-name', label: 'Last Name', placeholder: 'Parker', required: true, half: true },
	{ name: 'email', label: 'Email', type: 'email', placeholder: 'peter@parker.com' },
	{ name: 'website', label: 'Website', type: 'url', placeholder: 'www.parker.com' },
	{ name: 'services', label: 'What services are you interested in?', placeholder: 'Google Ads' },
	{
		name: 'business',
		label: 'Tell me about your business?',
		type: 'textarea',
		placeholder: 'What does your business sell or offer?',
	},
];

/** Message shown for a failed send; `endpoint` empty means no destination is set. */
export function failureMessage(endpoint: string, status?: number): string {
	if (!endpoint) return 'Sending is not available yet. Please try again later.';
	return status ? 'Something went wrong. Please try again.' : 'Could not reach the server. Please try again.';
}

/** Values to post: the fields without the honeypot, and the form's name. */
export function payload(form: string, data: FormData): Record<string, string> {
	const out: Record<string, string> = { form };
	data.forEach((v, k) => {
		if (k !== 'hp' && typeof v === 'string') out[k] = v;
	});
	return out;
}
