/** `/about` → `/<base>/about` (the site may live under a path, e.g. GitHub Pages). `/` → `/<base>/`. */
export function withBase(path: string, base: string = import.meta.env.BASE_URL): string {
	const root = base.replace(/\/+$/, '');
	return root + (path.startsWith('/') ? path : `/${path}`);
}

/** The absolute address of a path of the site: `site` plus the base plus the path. */
export function absoluteUrl(path: string, site: URL | string, base?: string): string {
	return new URL(withBase(path, base), site).href;
}
