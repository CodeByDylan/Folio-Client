import { Button } from "@astryxdesign/core/Button";
import { Divider } from "@astryxdesign/core/Divider";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react";
import { createProvenance, indexed } from "#/api/provenance";
import { getProject } from "#/api/server";
import { FallbackNotice } from "#/components/fallback-notice";
import { shellBoundaries } from "#/components/page-boundaries";
import { PageColumn } from "#/components/page-column";
import { ProjectDetails } from "#/components/project-details";
import { Prose } from "#/components/prose";
import { NoSections, ProjectSkeleton } from "#/components/states";
import { TagRow } from "#/components/tag-row";
import { requested } from "#/lib/loaders";
import { projectDescription, projectName } from "#/lib/project";
import { projectsPath } from "#/lib/routing";
import { useShell } from "#/lib/shell";
import { statusVariant } from "#/lib/tags";

export const Route = createFileRoute("/_shell/projects/$slug")({
	loader: ({ params }) =>
		requested(getProject({ data: { slug: params.slug } })),
	...shellBoundaries,
	pendingComponent: ProjectSkeleton,
	component: ProjectPage,
});

function ProjectPage() {
	const { t } = useShell();
	const project = Route.useLoaderData();
	const provenance = createProvenance(project.provenance);

	const written = indexed(project.sections, (section) => Boolean(section.body));

	return (
		<PageColumn maxWidth={880}>
			<HStack>
				<Button
					label={t("all_projects")}
					href={projectsPath}
					variant="ghost"
					size="sm"
					icon={<Icon icon={ArrowLeftIcon} size="xsm" color="inherit" />}
				/>
			</HStack>

			<VStack gap={4}>
				<HStack justify="between" align="center" gap={4} wrap="wrap">
					<HStack gap={2} align="center" wrap="wrap">
						<Heading level={1} type="display-3">
							{projectName(project)}
						</Heading>
						<FallbackNotice provenance={provenance} at={["name"]} t={t} />
					</HStack>
					{project.status ? (
						<HStack gap={2} align="center">
							<StatusDot
								variant={statusVariant(project.status)}
								label={t.status(project.status)}
							/>
							<Text type="supporting" color="secondary">
								{t.status(project.status)}
							</Text>
						</HStack>
					) : null}
				</HStack>

				<Text as="p" type="large" color="secondary">
					{projectDescription(project)}
				</Text>

				<TagRow tags={project.tags} />
			</VStack>

			<ProjectDetails project={project} t={t} />

			{written.length > 0 ? (
				written.map(({ item: section, index }) => (
					<Fragment key={section.id}>
						<Divider label={section.title ?? undefined} />
						<Prose
							body={section.body ?? ""}
							provenance={provenance.section(index)}
							t={t}
						/>
					</Fragment>
				))
			) : (
				<NoSections t={t} />
			)}
		</PageColumn>
	);
}
