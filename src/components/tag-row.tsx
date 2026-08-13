import { HStack } from "@astryxdesign/core/HStack";
import { Token } from "@astryxdesign/core/Token";
import { type Tag, tagColour } from "#/lib/tags";

export interface TagRowProps {
	readonly tags: ReadonlyArray<Tag>;
	readonly limit?: number;
}

/** A Project's tags, or nothing at all when it has none. */
export function TagRow({ tags, limit }: TagRowProps) {
	const shown = limit === undefined ? tags : tags.slice(0, limit);

	if (shown.length === 0) {
		return null;
	}

	return (
		<HStack gap={1.5} wrap="wrap">
			{shown.map((tag) => (
				<Token
					key={tag.id}
					size="sm"
					color={tagColour(tag)}
					label={tag.label ?? tag.id}
				/>
			))}
		</HStack>
	);
}
