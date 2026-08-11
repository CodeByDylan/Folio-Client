import { Divider } from "@astryxdesign/core/Divider";
import { Markdown } from "@astryxdesign/core/Markdown";
import { VStack } from "@astryxdesign/core/VStack";
import { Fragment, type ReactNode } from "react";
import type { PageSection, Provenance } from "#/api";
import { FallbackNotice } from "#/components/fallback-notice";
import { Hero } from "#/components/hero";
import { useDevWarnings } from "#/lib/dev-warnings";
import type { Translate } from "#/lib/strings";

export interface PageSectionsProps {
	readonly sections: ReadonlyArray<PageSection>;
	readonly provenance: Provenance;
	readonly t: Translate;
	readonly empty?: ReactNode;
}

/** Renders a page's sections in declaration order, a divider between each pair. */
export function PageSections({
	sections,
	provenance,
	t,
	empty,
}: PageSectionsProps) {
	useDevWarnings(
		sections
			.filter((section) => section.type === "unknown")
			.map(
				(section) =>
					`Section '${section.id}' has type '${section.declared}', which this client does not render.`,
			),
	);

	const rendered = sections
		.map((section, index) => ({
			id: section.id,
			node: render(section, index, provenance, t),
		}))
		.filter((entry) => entry.node !== null);

	if (rendered.length === 0) {
		return empty ?? null;
	}

	return (
		<>
			{rendered.map((entry, index) => (
				<Fragment key={entry.id}>
					{index > 0 ? <Divider /> : null}
					{entry.node}
				</Fragment>
			))}
		</>
	);
}

function render(
	section: PageSection,
	index: number,
	provenance: Provenance,
	t: Translate,
): ReactNode {
	switch (section.type) {
		case "hero":
			return (
				<Hero section={section} index={index} provenance={provenance} t={t} />
			);
		case "prose":
			return section.body ? (
				<VStack gap={2}>
					<FallbackNotice
						provenance={provenance}
						at={["sections", index, "body"]}
						t={t}
					/>
					<Markdown headingLevelStart={2}>{section.body}</Markdown>
				</VStack>
			) : null;
		default:
			return null;
	}
}
