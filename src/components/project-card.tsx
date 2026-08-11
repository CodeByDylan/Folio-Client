import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { Text } from "@astryxdesign/core/Text";
import { Timestamp } from "@astryxdesign/core/Timestamp";
import { Token } from "@astryxdesign/core/Token";
import { VStack } from "@astryxdesign/core/VStack";
import {
	ArrowPathIcon,
	ScaleIcon,
	StarIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, ReactNode, SVGProps } from "react";
import type { ProjectSummary } from "#/api";
import { tagColour } from "#/lib/tags";

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
	readonly href: string;
}

export function ProjectCard({ project, href }: ProjectCardProps) {
	const { metadata } = project;
	const name = project.name ?? project.slug;

	return (
		<ClickableCard
			label={name}
			href={href}
			padding={5}
			elevation="low"
			height="100%"
		>
			<VStack gap={3} height="100%">
				<VStack gap={1.5}>
					<Heading level={3}>{name}</Heading>
					<Text as="p" color="secondary" maxLines={3}>
						{project.tagline ?? metadata.description ?? project.repo}
					</Text>
				</VStack>

				{project.tags.length > 0 ? (
					<HStack gap={1.5} wrap="wrap">
						{project.tags.slice(0, 4).map((tag) => (
							<Token
								key={tag.id}
								size="sm"
								color={tagColour(tag)}
								label={tag.label ?? tag.id}
							/>
						))}
					</HStack>
				) : null}

				<HStack gap={4} align="center" wrap="wrap">
					<Stat icon={StarIcon}>{metadata.stars}</Stat>
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

export function ProjectCardSkeleton({
	index = 0,
}: {
	readonly index?: number;
}) {
	return (
		<VStack gap={3} padding={5}>
			<Skeleton height={22} width="55%" index={index} />
			<Skeleton height={16} width="100%" index={index} />
			<Skeleton height={16} width="80%" index={index} />
			<HStack gap={1.5}>
				<Skeleton height={20} width={64} radius="rounded" index={index} />
				<Skeleton height={20} width={52} radius="rounded" index={index} />
			</HStack>
			<Skeleton height={14} width="45%" index={index} />
		</VStack>
	);
}
