import { AspectRatio } from "@astryxdesign/core/AspectRatio";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import type { HeroSection, Provenance } from "#/api";
import { FallbackNotice } from "#/components/fallback-notice";
import { RouterLink } from "#/components/router-link";
import type { Translate } from "#/lib/strings";

export interface HeroProps {
	readonly section: HeroSection;
	readonly index: number;
	readonly provenance: Provenance;
	readonly t: Translate;
}

export function Hero({ section, index, provenance, t }: HeroProps) {
	const image = section.media[0];

	return (
		<HStack gap={8} align="center" justify="between" wrap="wrap">
			<VStack gap={4} maxWidth={620}>
				<FallbackNotice
					provenance={provenance}
					at={["sections", index, "headline"]}
					t={t}
				/>

				{section.headline ? (
					<Heading level={1} type="display-2">
						{section.headline}
					</Heading>
				) : null}

				{section.subheadline ? (
					<Text as="p" type="large" color="secondary">
						{section.subheadline}
					</Text>
				) : null}

				{section.actions.length > 0 ? (
					<HStack gap={5} wrap="wrap">
						{section.actions.map((action) => (
							<Link
								key={action.id}
								as={RouterLink}
								href={action.url}
								isStandalone
								isExternalLink={!action.url.startsWith("/")}
							>
								{action.label ?? action.url}
							</Link>
						))}
					</HStack>
				) : null}
			</VStack>

			{image ? (
				<VStack width={280}>
					<AspectRatio ratio={ratioOf(image)} shape="ellipse" fit="cover">
						<img src={image.url} alt={image.alt ?? ""} />
					</AspectRatio>
				</VStack>
			) : null}
		</HStack>
	);
}

/** A measured image reserves its own space; an unmeasured one falls back to a square. */
function ratioOf(image: HeroSection["media"][number]): number {
	return image.width && image.height
		? Number(image.width) / Number(image.height)
		: 1;
}
