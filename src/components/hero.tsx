import { AspectRatio } from "@astryxdesign/core/AspectRatio";
import { Button } from "@astryxdesign/core/Button";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import type { Provenance } from "#/api/provenance";
import type { HeroSection } from "#/api/sections";
import { FallbackNotice } from "#/components/fallback-notice";
import { isInternal } from "#/lib/routing";
import type { Translate } from "#/lib/strings";

export interface HeroProps {
	readonly section: HeroSection;
	readonly provenance: Provenance;
	readonly t: Translate;
}

export function Hero({ section, provenance, t }: HeroProps) {
	const image = section.media[0];

	return (
		<VStack gap={8} hAlign="center" paddingBlock={6}>
			{image ? (
				<VStack width={180}>
					<AspectRatio ratio={ratioOf(image)} fit="contain">
						<img src={image.url} alt={image.alt ?? ""} />
					</AspectRatio>
				</VStack>
			) : null}

			<VStack gap={6} hAlign="center">
				<VStack gap={3} hAlign="center">
					<FallbackNotice provenance={provenance} at={["headline"]} t={t} />

					{section.headline ? (
						// The page owns the h1; the hero keeps only the display style.
						<Heading
							level={2}
							type="display-1"
							justify="center"
							textWrap="balance"
						>
							{section.headline}
						</Heading>
					) : null}

					{section.subheadline ? (
						<Text
							as="p"
							type="large"
							color="secondary"
							justify="center"
							textWrap="balance"
						>
							{section.subheadline}
						</Text>
					) : null}
				</VStack>

				{section.actions.length > 0 ? (
					<HStack gap={3} wrap="wrap" justify="center">
						{section.actions.map((action, position) => (
							<Button
								key={action.id}
								label={action.label ?? action.url}
								href={action.url}
								variant={position === 0 ? "primary" : "secondary"}
								size="lg"
								{...external(action.url)}
								endContent={
									position === 0 ? (
										<Icon icon={ArrowRightIcon} size="sm" color="inherit" />
									) : undefined
								}
							/>
						))}
					</HStack>
				) : null}
			</VStack>
		</VStack>
	);
}

/** A measured image reserves its own space; an unmeasured one falls back to a square. */
function ratioOf(image: HeroSection["media"][number]): number {
	return image.width && image.height
		? Number(image.width) / Number(image.height)
		: 1;
}

/** A link that leaves this site opens away from it. */
function external(url: string) {
	return isInternal(url)
		? {}
		: { target: "_blank", rel: "noopener noreferrer" };
}
