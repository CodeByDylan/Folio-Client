import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { Text } from "@astryxdesign/core/Text";
import { Timestamp } from "@astryxdesign/core/Timestamp";
import { VStack } from "@astryxdesign/core/VStack";
import {
	ArrowPathIcon,
	ScaleIcon,
	StarIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, ReactNode, SVGProps } from "react";
import type { ProjectSummary } from "#/api/model";
import { TagRow } from "#/components/tag-row";
import { hasStars, projectDescription, projectName } from "#/lib/project";
import { projectPath } from "#/lib/routing";

function Stat({
	icon,
	children,
}: {
	readonly icon: ComponentType<SVGProps<SVGSVGElement>>;
	readonly children: ReactNode;
}) {
	return (
		<HStack gap={1} align="center">
			<Icon icon={icon} size="xsm" color="secondary" />
			<Text type="supporting" color="secondary">
				{children}
			</Text>
		</HStack>
	);
}

export interface ProjectCardProps {
	readonly project: ProjectSummary;
}

export function ProjectCard({ project }: ProjectCardProps) {
	const { metadata } = project;
	const name = projectName(project);

	return (
		<ClickableCard
			label={name}
			href={projectPath(project.slug)}
			padding={5}
			elevation="low"
			height="100%"
		>
			<VStack gap={3} height="100%">
				<VStack gap={1.5}>
					<Heading level={3}>{name}</Heading>
					<Text as="p" color="secondary" maxLines={3}>
						{projectDescription(project)}
					</Text>
				</VStack>

				<TagRow tags={project.tags} limit={4} />

				<HStack gap={4} align="center" wrap="wrap">
					{hasStars(metadata) ? (
						<Stat icon={StarIcon}>{metadata.stars}</Stat>
					) : null}
					{metadata.primaryLanguage ? (
						<Text type="supporting" color="secondary">
							{metadata.primaryLanguage}
						</Text>
					) : null}
					{metadata.license ? (
						<Stat icon={ScaleIcon}>{metadata.license}</Stat>
					) : null}
					<Stat icon={ArrowPathIcon}>
						<Timestamp
							value={metadata.pushedAt}
							format="relative_short"
							hasTooltip={false}
						/>
					</Stat>
				</HStack>
			</VStack>
		</ClickableCard>
	);
}
