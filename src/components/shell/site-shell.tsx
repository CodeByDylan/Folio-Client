import { AppShell } from "@astryxdesign/core/AppShell";
import { Banner } from "@astryxdesign/core/Banner";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import {
	SideNav,
	SideNavHeading,
	SideNavItem,
	SideNavSection,
} from "@astryxdesign/core/SideNav";
import { Text } from "@astryxdesign/core/Text";
import { TopNav, TopNavItem } from "@astryxdesign/core/TopNav";
import { VStack } from "@astryxdesign/core/VStack";
import {
	DocumentTextIcon,
	HomeIcon,
	RectangleStackIcon,
	SparklesIcon,
	StarIcon,
} from "@heroicons/react/24/outline";
import {
	RectangleStackIcon as StackSolid,
	StarIcon as StarSolid,
} from "@heroicons/react/24/solid";
import type { ReactNode } from "react";
import type { ProjectSummary, Site } from "#/api";
import { AppMark } from "#/components/app-mark";
import { LocaleSelector } from "#/components/locale-selector";
import { ModeSelector } from "#/components/mode-selector";
import { Viewport } from "#/components/viewport";
import { app } from "#/lib/app";
import { pagePath, projectPath } from "#/lib/routing";
import type { Translate } from "#/lib/strings";

export interface SiteShellProps {
	readonly site: Site;
	readonly featured: ReadonlyArray<ProjectSummary>;
	readonly localeRejected: boolean;
	readonly path: string;
	readonly t: Translate;
	readonly children: ReactNode;
}

export function SiteShell({
	site,
	featured,
	path,
	localeRejected,
	t,
	children,
}: SiteShellProps) {
	const basePath = path;
	const home = "/";
	const projects = "/projects";

	const controls = (
		<HStack gap={2} align="center">
			<LocaleSelector
				label={t("language")}
				strings={site.strings}
				locales={site.locales}
				active={site.locale}
			/>
			<ModeSelector
				label={t("appearance")}
				options={{
					system: t("theme_system"),
					light: t("theme_light"),
					dark: t("theme_dark"),
				}}
			/>
		</HStack>
	);

	const topNav = (
		<TopNav
			heading={<AppMark />}
			startContent={site.pages
				.filter((page) => page.nav)
				.map((page) => (
					<TopNavItem
						key={page.slug}
						href={pagePath(page)}
						label={page.navLabel ?? page.slug}
						icon={
							<Icon icon={page.home ? HomeIcon : DocumentTextIcon} size="sm" />
						}
						isSelected={basePath === pagePath(page)}
					/>
				))}
			endContent={<Viewport when="wide">{controls}</Viewport>}
		/>
	);

	const sideNav = (
		<SideNav
			collapsible
			header={
				<SideNavHeading
					heading={site.title ?? app.name}
					subheading={site.tagline ?? undefined}
					headingHref={home}
				/>
			}
			footer={
				<Viewport when="narrow">
					<VStack gap={2} padding={2}>
						{controls}
					</VStack>
				</Viewport>
			}
		>
			<SideNavItem
				label={t("all_projects")}
				href={projects}
				icon={RectangleStackIcon}
				selectedIcon={StackSolid}
				isSelected={basePath === "/projects"}
			/>

			<SideNavSection title={t("featured")}>
				{featured.length > 0 ? (
					featured.map((project) => (
						<SideNavItem
							key={project.slug}
							label={project.name ?? project.slug}
							href={projectPath(project.slug)}
							icon={StarIcon}
							selectedIcon={StarSolid}
							isSelected={basePath === projectPath(project.slug)}
							endContent={
								Number(project.metadata.stars) > 0 ? (
									<Text type="supporting" color="secondary">
										{project.metadata.stars}
									</Text>
								) : undefined
							}
						/>
					))
				) : (
					<SideNavItem
						label={t("no_projects_title")}
						icon={SparklesIcon}
						isDisabled
					/>
				)}
			</SideNavSection>
		</SideNav>
	);

	return (
		<AppShell
			variant="elevated"
			height="fill"
			contentPadding={6}
			banner={
				localeRejected ? (
					<Banner
						status="warning"
						container="section"
						title={t("locale_unavailable")}
						isDismissable
					/>
				) : undefined
			}
			topNav={topNav}
			sideNav={sideNav}
		>
			{children}
		</AppShell>
	);
}
