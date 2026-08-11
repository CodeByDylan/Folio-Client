import { Grid } from "@astryxdesign/core/Grid";
import type { ProjectSummary } from "#/api";
import { ProjectCard } from "#/components/project-card";
import { projectPath } from "#/lib/routing";

export interface ProjectGridProps {
	readonly projects: ReadonlyArray<ProjectSummary>;
}

export function ProjectGrid({ projects }: ProjectGridProps) {
	return (
		<Grid columns={{ minWidth: 300, max: 2 }} gap={4}>
			{projects.map((project) => (
				<ProjectCard
					key={project.slug}
					project={project}
					href={projectPath(project.slug)}
				/>
			))}
		</Grid>
	);
}
