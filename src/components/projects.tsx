import { Divider } from "@astryxdesign/core/Divider";
import { VStack } from "@astryxdesign/core/VStack";
import type { ProjectSummary } from "#/api/model";
import type { ProjectsSection } from "#/api/sections";
import { ProjectGrid } from "#/components/project-grid";
import { NoProjects } from "#/components/states";
import type { Translate } from "#/lib/strings";

export interface ProjectsProps {
	readonly section: ProjectsSection;
	readonly projects: ReadonlyArray<ProjectSummary>;
	readonly t: Translate;
}

/** The index is already loaded for the shell, so the section states a selection and joins here. */
export function Projects({ section, projects, t }: ProjectsProps) {
	// An absent limit arrives as either null or undefined, and both mean every project.
	const limit = section.limit ?? undefined;

	const selected = projects
		.filter((project) => !section.featured || project.featured)
		.slice(0, limit === undefined ? undefined : Number(limit));

	return (
		<VStack gap={5}>
			<Divider label={section.heading ?? undefined} />
			{selected.length > 0 ? (
				<ProjectGrid projects={selected} />
			) : (
				<NoProjects t={t} />
			)}
		</VStack>
	);
}
