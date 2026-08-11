import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Grid } from "@astryxdesign/core/Grid";
import { Icon } from "@astryxdesign/core/Icon";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { VStack } from "@astryxdesign/core/VStack";
import {
	ExclamationTriangleIcon,
	FolderOpenIcon,
	MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { ProjectCardSkeleton } from "#/components/project-card";
import type { Translate } from "#/lib/strings";

export function PageSkeleton() {
	return (
		<VStack gap={6}>
			<VStack gap={3}>
				<Skeleton height={40} width="45%" />
				<Skeleton height={20} width="70%" />
			</VStack>
			<Grid columns={{ minWidth: 300, max: 2 }} gap={4}>
				{[0, 1, 2, 3].map((index) => (
					<ProjectCardSkeleton key={index} index={index} />
				))}
			</Grid>
		</VStack>
	);
}

export function ProjectSkeleton() {
	return (
		<VStack gap={5}>
			<Skeleton height={44} width="50%" />
			<Skeleton height={20} width="75%" />
			<Skeleton height={140} width="100%" />
			<Skeleton height={16} width="95%" index={1} />
			<Skeleton height={16} width="90%" index={2} />
			<Skeleton height={16} width="60%" index={3} />
		</VStack>
	);
}

export function NoProjects({ t }: { readonly t: Translate }) {
	return (
		<EmptyState
			title={t("no_projects_title")}
			description={t("no_projects_body")}
			icon={<Icon icon={FolderOpenIcon} size="lg" color="secondary" />}
		/>
	);
}

export function NoSections({ t }: { readonly t: Translate }) {
	return (
		<EmptyState
			isCompact
			title={t("no_sections_title")}
			description={t("no_sections_body")}
			icon={<Icon icon={MagnifyingGlassIcon} size="lg" color="secondary" />}
		/>
	);
}

export function NoContent({ t }: { readonly t: Translate }) {
	return (
		<EmptyState
			isCompact
			title={t("no_content_title")}
			description={t("no_content_body")}
			icon={<Icon icon={MagnifyingGlassIcon} size="lg" color="secondary" />}
		/>
	);
}

export function Failure({
	t,
	onRetry,
}: {
	readonly t: Translate;
	readonly onRetry?: () => void;
}) {
	return (
		<EmptyState
			headingLevel={2}
			title={t("error_title")}
			description={t("error_body")}
			icon={<Icon icon={ExclamationTriangleIcon} size="lg" color="error" />}
			actions={
				onRetry ? (
					<Button label={t("retry")} variant="primary" onClick={onRetry} />
				) : undefined
			}
		/>
	);
}

export function NotFound({
	t,
	onHome,
}: {
	readonly t: Translate;
	readonly onHome: () => void;
}) {
	return (
		<EmptyState
			headingLevel={2}
			title={t("not_found_title")}
			description={t("not_found_body")}
			icon={<Icon icon={MagnifyingGlassIcon} size="lg" color="secondary" />}
			actions={
				<Button label={t("go_home")} variant="primary" onClick={onHome} />
			}
		/>
	);
}
