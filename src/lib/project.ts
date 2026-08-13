interface Named {
	readonly name?: string | null;
	readonly slug: string;
}

interface Described extends Named {
	readonly tagline?: string | null;
	readonly repo: string;
	readonly metadata: { readonly description?: string | null };
}

// `||` throughout: a field left blank means "nothing here", never a value.

/** What a Project is called, wherever it appears. */
export function projectName(project: Named): string {
	return project.name || project.slug;
}

/** The one line a Project leads with. It always has a repository, so there is always one. */
export function projectDescription(project: Described): string {
	return project.tagline || project.metadata.description || project.repo;
}

/** A star count is only worth the space once there is one. */
export function hasStars(metadata: {
	readonly stars: string | number;
}): boolean {
	return Number(metadata.stars) > 0;
}
