import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { Text } from "@astryxdesign/core/Text";
import { VisuallyHidden } from "@astryxdesign/core/VisuallyHidden";
import { VStack } from "@astryxdesign/core/VStack";
import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import type { SkillLevel, SkillsSection } from "#/api/sections";
import type { Translate } from "#/lib/strings";

/** Rating out of this many; the wire states a level, never a star count. */
const total = 3;

const filled: Readonly<Record<SkillLevel, number>> = {
	familiar: 1,
	proficient: 2,
	expert: 3,
};

export interface SkillsProps {
	readonly section: SkillsSection;
	readonly t: Translate;
}

export function Skills({ section, t }: SkillsProps) {
	return (
		<VStack gap={6}>
			<VStack gap={2}>
				<Heading level={2} type="display-3">
					{t("skills_title")}
				</Heading>
				<Legend t={t} />
			</VStack>

			<Grid columns={{ minWidth: 240, repeat: "fit" }} gap={6}>
				{section.categories.map((category) => (
					<VStack key={category.id} gap={3}>
						<Text type="supporting" color="secondary" weight="medium">
							{category.label ?? category.id}
						</Text>

						<VStack gap={2}>
							{category.skills.map((skill) => (
								<HStack key={skill.id} justify="between" align="center" gap={3}>
									<Text type="body">{skill.label ?? skill.id}</Text>
									<Rating level={skill.level} t={t} />
								</HStack>
							))}
						</VStack>
					</VStack>
				))}
			</Grid>
		</VStack>
	);
}

/** Sighted readers get the key once; screen readers get the word on every skill. */
function Legend({ t }: { readonly t: Translate }) {
	return (
		<HStack gap={3} wrap="wrap" align="center">
			{(Object.keys(filled) as ReadonlyArray<SkillLevel>).map((level) => (
				<HStack key={level} gap={1.5} align="center">
					<Stars count={filled[level]} />
					<Text type="supporting" color="secondary">
						{t.skill(level)}
					</Text>
				</HStack>
			))}
		</HStack>
	);
}

function Rating({
	level,
	t,
}: {
	readonly level: SkillLevel;
	readonly t: Translate;
}) {
	return (
		<HStack gap={0.5} align="center">
			<Stars count={filled[level]} />
			<VisuallyHidden>{t.skill(level)}</VisuallyHidden>
		</HStack>
	);
}

function Stars({ count }: { readonly count: number }) {
	return (
		<HStack gap={0.5} align="center" aria-hidden="true">
			{Array.from({ length: total }, (_, position) => (
				<Icon
					key={position}
					icon={position < count ? StarSolid : StarIcon}
					size="xsm"
					color={position < count ? "warning" : "secondary"}
				/>
			))}
		</HStack>
	);
}
