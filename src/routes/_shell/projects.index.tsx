import { Heading } from "@astryxdesign/core/Heading";
import { Pagination } from "@astryxdesign/core/Pagination";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { shellBoundaries } from "#/components/page-boundaries";
import { PageColumn } from "#/components/page-column";
import { ProjectGrid } from "#/components/project-grid";
import { NoProjects } from "#/components/states";
import { paginate } from "#/lib/pagination";
import { useShell } from "#/lib/shell";

const pageSize = 4;

export const Route = createFileRoute("/_shell/projects/")({
	validateSearch: z.object({
		page: z.coerce.number().int().min(1).optional().catch(undefined),
	}),
	...shellBoundaries,
	component: Projects,
});

function Projects() {
	const { projects, t } = useShell();
	const { page } = Route.useSearch();
	const navigate = Route.useNavigate();

	const { current, pages, start, end } = paginate(
		projects.length,
		pageSize,
		page,
	);

	return (
		<PageColumn>
			<VStack gap={2}>
				<Heading level={1} type="display-3">
					{t("all_projects")}
				</Heading>
				<Text as="p" color="secondary">
					{projects.length} · {t("projects")}
				</Text>
			</VStack>

			{projects.length > 0 ? (
				<>
					<ProjectGrid projects={projects.slice(start, end)} />
					{pages > 1 ? (
						<Pagination
							page={current}
							onChange={(next) => {
								void navigate({ search: { page: next } });
							}}
							totalItems={projects.length}
							pageSize={pageSize}
							variant="pages"
						/>
					) : null}
				</>
			) : (
				<NoProjects t={t} />
			)}
		</PageColumn>
	);
}
