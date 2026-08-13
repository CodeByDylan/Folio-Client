import { Grid } from "@astryxdesign/core/Grid";
import type { ProjectSummary } from "#/api/model";
import { ProjectCard } from "#/components/project-card";

const projectColumns = { minWidth: 300, max: 2 } as const;

export interface ProjectGridProps {
	readonly projects: ReadonlyArray<ProjectSummary>;
}

export function ProjectGrid({ projects }: ProjectGridProps) {
	return (
		<Grid columns={projectColumns} gap={4}>
			{projects.map((project) => (
				<ProjectCard key={project.slug} project={project} />
			))}
		</Grid>
	);
}
