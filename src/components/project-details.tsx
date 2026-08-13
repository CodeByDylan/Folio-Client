import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { Link } from "@astryxdesign/core/Link";
import {
	MetadataList,
	MetadataListItem,
} from "@astryxdesign/core/MetadataList";
import { Timestamp } from "@astryxdesign/core/Timestamp";
import { VStack } from "@astryxdesign/core/VStack";
import {
	ArrowPathIcon,
	CalendarIcon,
	CodeBracketIcon,
	ScaleIcon,
	StarIcon,
	TagIcon,
} from "@heroicons/react/24/outline";
import type { Project } from "#/api/model";
import { projectPath } from "#/lib/routing";
import type { Translate } from "#/lib/strings";

export interface ProjectDetailsProps {
	readonly project: Project;
	readonly t: Translate;
}

/** What a Project's repository says about it, and where else it points. */
export function ProjectDetails({ project, t }: ProjectDetailsProps) {
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
					<HStack gap={3} align="center" wrap="wrap">
						{project.links.map((link) => (
							<Button
								key={link.url}
								label={t.link(link)}
								href={link.url}
								variant="secondary"
								target="_blank"
								rel="noopener noreferrer"
							/>
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
