import type { SitePage } from "#/api";

export function projectPath(slug: string): string {
	return `/projects/${slug}`;
}

/** The home page is served at the root; every other page hangs off its slug. */
export function pagePath(page: Pick<SitePage, "slug" | "home">): string {
	return page.home ? "/" : `/${page.slug}`;
}

/** Names each declared page that a file route would shadow. */
export function shadowedPages(
	pages: ReadonlyArray<SitePage>,
	routePaths: ReadonlyArray<string>,
): ReadonlyArray<string> {
	// Route paths carry a trailing slash (`/projects/`); page paths never do.
	const owned = new Set(
		routePaths
			.filter((path) => !path.includes("$"))
			.map((path) => (path === "/" ? path : path.replace(/\/+$/, ""))),
	);

	return pages
		.filter((page) => !page.home && owned.has(pagePath(page)))
		.map((page) => page.slug);
}
