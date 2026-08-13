import { Markdown } from "@astryxdesign/core/Markdown";
import { VStack } from "@astryxdesign/core/VStack";
import type { Provenance } from "#/api/provenance";
import { FallbackNotice } from "#/components/fallback-notice";
import type { Translate } from "#/lib/strings";

export interface ProseProps {
	readonly body: string;
	readonly provenance: Provenance;
	readonly t: Translate;
}

/** Written copy, with a notice when it fell back to another locale. */
export function Prose({ body, provenance, t }: ProseProps) {
	return (
		<VStack gap={2}>
			<FallbackNotice provenance={provenance} at={["body"]} t={t} />
			{/* The page owns its h1, so a body's '#' renders as an h2. */}
			<Markdown headingLevelStart={2}>{body}</Markdown>
		</VStack>
	);
}
