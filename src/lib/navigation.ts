import type { ProjectSummary, Site, SitePage } from "#/api/model";
import { projectName } from "#/lib/project";
import {
	normalisePath,
	pagePath,
	projectPath,
	projectsPath,
} from "#/lib/routing";

export interface NavigationLink {
	readonly href: string;
	readonly isCurrent: boolean;
}

export interface NavigationPage extends NavigationLink {
	readonly slug: string;
	readonly label: string;
	readonly isHome: boolean;
}

export interface NavigationProject extends NavigationLink {
	readonly slug: string;
	readonly label: string;
	readonly stars: number;
}

/** Where a visitor can go from here, and which of those places they are already in. */
export interface Navigation {
	readonly pages: ReadonlyArray<NavigationPage>;
	readonly utility: ReadonlyArray<NavigationPage>;
	readonly featured: ReadonlyArray<NavigationProject>;
	readonly allProjects: NavigationLink;
}

export function navigation(
	site: Site,
	index: ReadonlyArray<ProjectSummary>,
	path: string,
): Navigation {
	const here = normalisePath(path);

	const toPage = (page: SitePage): NavigationPage => ({
		slug: page.slug,
		// `||` on purpose: a blank label means "nothing here", never a value.
		label: page.navLabel || page.slug,
		isHome: page.home,
		href: pagePath(page),
		isCurrent: here === pagePath(page),
	});

	return {
		pages: site.pages.filter((page) => page.nav).map(toPage),
		// A page kept out of the navigation still needs one way in.
		utility: site.pages.filter((page) => !page.nav).map(toPage),
		featured: index
			.filter((project) => project.featured)
			.map((project) => ({
				slug: project.slug,
				label: projectName(project),
				stars: Number(project.metadata.stars),
				href: projectPath(project.slug),
				isCurrent: here === projectPath(project.slug),
			})),
		allProjects: {
			href: projectsPath,
			// A Project's own page is still inside the projects section.
			isCurrent: here === projectsPath || here.startsWith(`${projectsPath}/`),
		},
	};
}
