import { Collapsible, CollapsibleGroup } from "@astryxdesign/core/Collapsible";
import { Heading } from "@astryxdesign/core/Heading";
import { Markdown } from "@astryxdesign/core/Markdown";
import { VStack } from "@astryxdesign/core/VStack";
import { useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { indexed, type Provenance } from "#/api/provenance";
import type { QaSection } from "#/api/sections";
import { FallbackNotice } from "#/components/fallback-notice";
import type { Translate } from "#/lib/strings";

export interface QuestionsProps {
	readonly section: QaSection;
	readonly provenance: Provenance;
	readonly t: Translate;
}

export function Questions({ section, provenance, t }: QuestionsProps) {
	const answered = indexed(section.questions, (question) =>
		Boolean(question.answer),
	);
	const [open, setOpen] = useState<ReadonlyArray<string>>([]);
	const { hash } = useLocation();

	// A link to `#an-answer` has to open the row it names, or it scrolls to a closed one.
	useEffect(() => {
		const anchored = hash.replace(/^#/, "");

		if (anchored !== "") {
			setOpen((current) =>
				current.includes(anchored) ? current : [...current, anchored],
			);
		}
	}, [hash]);

	return (
		<VStack gap={4}>
			<Heading level={2} type="display-3">
				{t("questions_title")}
			</Heading>

			{/* An item inside a group defers to the group, so the open set is held here. */}
			<CollapsibleGroup
				type="multiple"
				hasDividers
				density="spacious"
				value={[...open]}
				onChange={(next) => setOpen(Array.isArray(next) ? next : [next])}
			>
				{answered.map(({ item: question, index }) => (
					<Collapsible
						key={question.id}
						value={question.id}
						trigger={question.question || question.id}
					>
						<VStack gap={2} id={question.id}>
							<FallbackNotice
								provenance={provenance}
								at={["questions", index, "answer"]}
								t={t}
							/>
							{/* Answers sit beneath the section's h2, so a '#' renders as an h3. */}
							<Markdown headingLevelStart={3}>{question.answer ?? ""}</Markdown>
						</VStack>
					</Collapsible>
				))}
			</CollapsibleGroup>
		</VStack>
	);
}
