import { AppShell } from "@astryxdesign/core/AppShell";
import { Banner } from "@astryxdesign/core/Banner";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import {
	SideNav,
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
import type { Site } from "#/api/model";
import { AppMark } from "#/components/app-mark";
import { LocaleSelector } from "#/components/locale-selector";
import { ModeSelector } from "#/components/mode-selector";
import { SiteFooter } from "#/components/shell/site-footer";
import { Viewport } from "#/components/viewport";
import type { Navigation } from "#/lib/navigation";
import type { Translate } from "#/lib/strings";

export interface SiteShellProps {
	readonly site: Site;
	readonly navigation: Navigation;
	readonly localeRejected: boolean;
	readonly t: Translate;
	readonly children: ReactNode;
}

export function SiteShell({
	site,
	navigation,
	localeRejected,
	t,
	children,
}: SiteShellProps) {
	const controls = (
		<HStack gap={2} align="center">
			<LocaleSelector t={t} locales={site.locales} active={site.locale} />
			<ModeSelector t={t} />
		</HStack>
	);

	const topNav = (
		<TopNav
			heading={<AppMark />}
			startContent={navigation.pages.map((page) => (
				<TopNavItem
					key={page.slug}
					href={page.href}
					label={page.label}
					icon={
						<Icon icon={page.isHome ? HomeIcon : DocumentTextIcon} size="sm" />
					}
					isSelected={page.isCurrent}
				/>
			))}
			endContent={<Viewport when="wide">{controls}</Viewport>}
		/>
	);

	const sideNav = (
		<SideNav
			collapsible
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
				href={navigation.allProjects.href}
				icon={RectangleStackIcon}
				selectedIcon={StackSolid}
				isSelected={navigation.allProjects.isCurrent}
			/>

			<SideNavSection title={t("featured")}>
				{navigation.featured.length > 0 ? (
					navigation.featured.map((project) => (
						<SideNavItem
							key={project.slug}
							label={project.label}
							href={project.href}
							icon={StarIcon}
							selectedIcon={StarSolid}
							isSelected={project.isCurrent}
							endContent={
								project.stars > 0 ? (
									<Text type="supporting" color="secondary">
										{project.stars}
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
			<SiteFooter site={site} navigation={navigation} t={t} />
		</AppShell>
	);
}
