import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { Link } from "@astryxdesign/core/Link";
import { Markdown } from "@astryxdesign/core/Markdown";
import {
	MetadataList,
	MetadataListItem,
} from "@astryxdesign/core/MetadataList";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Text } from "@astryxdesign/core/Text";
import { Timestamp } from "@astryxdesign/core/Timestamp";
import { Token } from "@astryxdesign/core/Token";
import { VStack } from "@astryxdesign/core/VStack";
import {
	ArrowLeftIcon,
	ArrowPathIcon,
	CalendarIcon,
	CodeBracketIcon,
	ScaleIcon,
	StarIcon,
	TagIcon,
} from "@heroicons/react/24/outline";
import { createFileRoute, getRouteApi, notFound } from "@tanstack/react-router";
import { Fragment } from "react";
import { createProvenance, hasFailure, type Project } from "#/api";
import { getProject } from "#/api/server";
import { FallbackNotice } from "#/components/fallback-notice";
import { PageError, PageMissing } from "#/components/page-boundaries";
import { NoSections, ProjectSkeleton } from "#/components/states";
import { projectPath } from "#/lib/routing";
import { type Strings, type Translate, translator } from "#/lib/strings";
import { statusVariant, tagColour } from "#/lib/tags";

const layout = getRouteApi("/_shell");

export const Route = createFileRoute("/_shell/projects/$slug")({
	loader: async ({ params }) => {
		try {
			return (await getProject({ data: { slug: params.slug } })).value;
		} catch (error) {
			if (hasFailure(error, "not-found") || hasFailure(error, "invalid")) {
				throw notFound();
			}

			throw error;
		}
	},
	pendingComponent: ProjectSkeleton,
	errorComponent: ({ reset }) => <PageError reset={reset} />,
	notFoundComponent: () => <PageMissing />,
	component: ProjectPage,
});

function ProjectPage() {
	const { site } = layout.useLoaderData();
	const project = Route.useLoaderData();
	const t = translator(site.strings);
	const written = project.sections.filter((section) => section.body);
	const provenance = createProvenance(project.provenance);

	return (
		<VStack gap={6} maxWidth={880}>
			<Link
				href="/projects"
				isStandalone
				hasUnderline={false}
				type="supporting"
				color="secondary"
			>
				<HStack gap={1} align="center">
					<Icon icon={ArrowLeftIcon} size="xsm" />
					{t("all_projects")}
				</HStack>
			</Link>

			<VStack gap={4}>
				<HStack justify="between" align="center" gap={4} wrap="wrap">
					<HStack gap={2} align="center" wrap="wrap">
						<Heading level={1} type="display-3">
							{project.name ?? project.slug}
						</Heading>
						<FallbackNotice provenance={provenance} at={["name"]} t={t} />
					</HStack>
					{project.status ? (
						<HStack gap={2} align="center">
							<StatusDot
								variant={statusVariant(project.status)}
								label={t(`status_${project.status}`)}
							/>
							<Text type="supporting" color="secondary">
								{t(`status_${project.status}`)}
							</Text>
						</HStack>
					) : null}
				</HStack>

				{(project.tagline ?? project.metadata.description) ? (
					<Text as="p" type="large" color="secondary">
						{project.tagline ?? project.metadata.description}
					</Text>
				) : null}

				{project.tags.length > 0 ? (
					<HStack gap={1.5} wrap="wrap">
						{project.tags.map((tag) => (
							<Token
								key={tag.id}
								size="sm"
								color={tagColour(tag)}
								label={tag.label ?? tag.id}
							/>
						))}
					</HStack>
				) : null}
			</VStack>

			<Details project={project} t={t} strings={site.strings} />

			{written.length > 0 ? (
				written.map((section) => (
					<Fragment key={section.id}>
						<Divider label={section.title ?? undefined} />
						<FallbackNotice
							provenance={provenance}
							at={["sections", project.sections.indexOf(section), "body"]}
							t={t}
						/>
						<Markdown headingLevelStart={2}>{section.body ?? ""}</Markdown>
					</Fragment>
				))
			) : (
				<NoSections t={t} />
			)}
		</VStack>
	);
}

function Details({
	project,
	t,
	strings,
}: {
	readonly project: Project;
	readonly t: Translate;
	readonly strings: Strings;
}) {
	const { metadata } = project;
	const release = metadata.releases[0];

	return (
		<Card variant="muted" padding={5}>
			<VStack gap={4}>
				<MetadataList columns="multi" title={t("details")}>
					<MetadataListItem
						label={t("repository")}
						icon={<Icon icon={CodeBracketIcon} size="xsm" />}
					>
						<Link href={`https://github.com/${project.repo}`} isExternalLink>
							{project.repo}
						</Link>
					</MetadataListItem>
					<MetadataListItem
						label={t("stars")}
						icon={<Icon icon={StarIcon} size="xsm" />}
					>
						{metadata.stars}
					</MetadataListItem>
					<MetadataListItem label={t("forks")}>
						{metadata.forks}
					</MetadataListItem>
					{metadata.license ? (
						<MetadataListItem
							label={t("license")}
							icon={<Icon icon={ScaleIcon} size="xsm" />}
						>
							{metadata.license}
						</MetadataListItem>
					) : null}
					{project.started ? (
						<MetadataListItem
							label={t("started")}
							icon={<Icon icon={CalendarIcon} size="xsm" />}
						>
							{project.started}
						</MetadataListItem>
					) : null}
					<MetadataListItem
						label={t("last_push")}
						icon={<Icon icon={ArrowPathIcon} size="xsm" />}
					>
						<Timestamp value={metadata.pushedAt} format="date" />
					</MetadataListItem>
					{metadata.languages.length > 0 ? (
						<MetadataListItem label={t("languages")}>
							{metadata.languages
								.filter((language) => Number(language.percent) >= 1)
								.map((language) => `${language.language} ${language.percent}%`)
								.join(" · ")}
						</MetadataListItem>
					) : null}
					{release ? (
						<MetadataListItem
							label={t("latest_release")}
							icon={<Icon icon={TagIcon} size="xsm" />}
						>
							<Link href={release.url} isExternalLink>
								{release.tagName}
							</Link>
						</MetadataListItem>
					) : null}
				</MetadataList>

				{project.links.length > 0 || project.relations.length > 0 ? (
					<HStack gap={5} align="center" wrap="wrap">
						{project.links.map((link) => (
							<Link key={link.url} href={link.url} isExternalLink>
								{link.label ?? strings[`link_${link.type}`] ?? link.url}
							</Link>
						))}
						{project.relations.map((relation) => (
							<Link
								key={`${relation.type}:${relation.target}`}
								href={projectPath(relation.target)}
							>
								{relation.label ?? relation.target}
							</Link>
						))}
					</HStack>
				) : null}
			</VStack>
		</Card>
	);
}
