import { Divider } from "@astryxdesign/core/Divider";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import type { Site } from "#/api/model";
import { AppMark } from "#/components/app-mark";
import { PageColumn } from "#/components/page-column";
import type { Navigation } from "#/lib/navigation";
import type { Translate } from "#/lib/strings";

export interface SiteFooterProps {
	readonly site: Site;
	readonly navigation: Navigation;
	readonly t: Translate;
}

export function SiteFooter({ site, navigation, t }: SiteFooterProps) {
	return (
		<VStack as="footer" width="100%" paddingBlock={8}>
			<PageColumn>
				<Divider />

				<HStack gap={8} justify="between" wrap="wrap" align="start">
					<VStack gap={2} maxWidth={320}>
						<AppMark />
						{site.tagline ? (
							<Text type="supporting" color="secondary">
								{site.tagline}
							</Text>
						) : null}
					</VStack>

					<HStack gap={10} wrap="wrap" align="start">
						<Column title={t("footer_pages")}>
							{navigation.pages.map((page) => (
								<FooterLink
									key={page.slug}
									href={page.href}
									label={page.label}
								/>
							))}
						</Column>

						{site.links.length > 0 ? (
							<Column title={t("footer_elsewhere")}>
								{site.links.map((link) => (
									<FooterLink
										key={link.url}
										href={link.url}
										label={link.label ?? link.type}
										isExternal
									/>
								))}
							</Column>
						) : null}
					</HStack>
				</HStack>

				<HStack gap={4} justify="between" wrap="wrap" align="center">
					<Text type="supporting" color="secondary">
						{`© ${new Date().getFullYear()} ${site.title ?? ""}`.trim()}
					</Text>

					{navigation.utility.length > 0 ? (
						<HStack gap={4} wrap="wrap">
							{navigation.utility.map((page) => (
								<FooterLink
									key={page.slug}
									href={page.href}
									label={page.label}
								/>
							))}
						</HStack>
					) : null}
				</HStack>
			</PageColumn>
		</VStack>
	);
}

function Column({
	title,
	children,
}: {
	readonly title: string;
	readonly children: React.ReactNode;
}) {
	return (
		<VStack gap={2}>
			<Text type="supporting" color="secondary" weight="medium">
				{title}
			</Text>
			{children}
		</VStack>
	);
}

function FooterLink({
	href,
	label,
	isExternal = false,
}: {
	readonly href: string;
	readonly label: string;
	readonly isExternal?: boolean;
}) {
	return (
		<Link
			href={href}
			isStandalone
			type="supporting"
			color="secondary"
			isExternalLink={isExternal}
		>
			{label}
		</Link>
	);
}
