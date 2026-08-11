import { Heading } from "@astryxdesign/core/Heading";
import { Pagination } from "@astryxdesign/core/Pagination";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { z } from "zod";
import { PageError } from "#/components/page-boundaries";
import { ProjectGrid } from "#/components/project-grid";
import { NoProjects } from "#/components/states";
import { translator } from "#/lib/strings";

const layout = getRouteApi("/_shell");
const pageSize = 4;

export const Route = createFileRoute("/_shell/projects/")({
	validateSearch: z.object({
		page: z.coerce.number().int().min(1).optional().catch(undefined),
	}),
	errorComponent: ({ reset }) => <PageError reset={reset} />,
	component: Projects,
});

function Projects() {
	const { site, projects } = layout.useLoaderData();
	const { page } = Route.useSearch();
	const navigate = Route.useNavigate();
	const t = translator(site.strings);

	const pages = Math.max(1, Math.ceil(projects.length / pageSize));
	const current = Math.min(page ?? 1, pages);
	const start = (current - 1) * pageSize;

	return (
		<VStack gap={6} maxWidth={980}>
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
					<ProjectGrid projects={projects.slice(start, start + pageSize)} />
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
		</VStack>
	);
}
