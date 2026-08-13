import type { SitePage } from "#/api/model";

/** Where the Project index lives. Every other Project path hangs off it. */
export const projectsPath = "/projects";

export function projectPath(slug: string): string {
	return `${projectsPath}/${slug}`;
}

/** The home page is served at the root; every other page hangs off its slug. */
export function pagePath(page: Pick<SitePage, "slug" | "home">): string {
	return page.home ? "/" : `/${page.slug}`;
}

/** Route paths carry a trailing slash; page paths never do. */
export function normalisePath(path: string): string {
	return path === "/" ? path : path.replace(/\/+$/, "");
}

/** A URL this site serves, as opposed to one that leaves it. */
export function isInternal(url: string | undefined): url is string {
	return url?.startsWith("/") === true;
}

/** Names each declared page that a file route would shadow. */
export function shadowedPages(
	pages: ReadonlyArray<SitePage>,
	routePaths: ReadonlyArray<string>,
): ReadonlyArray<string> {
	const owned = new Set(
		routePaths.filter((path) => !path.includes("$")).map(normalisePath),
	);

	return pages
		.filter((page) => !page.home && owned.has(pagePath(page)))
		.map((page) => page.slug);
}
