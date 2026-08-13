import { Token } from "@astryxdesign/core/Token";
import type { PointerSegment, Provenance } from "#/api/provenance";
import type { Translate } from "#/lib/strings";

export interface FallbackNoticeProps {
	readonly provenance: Provenance;
	readonly at: ReadonlyArray<PointerSegment>;
	readonly t: Translate;
}

export function FallbackNotice({ provenance, at, t }: FallbackNoticeProps) {
	if (!provenance.isFallback(...at)) {
		return null;
	}

	return <Token size="sm" color="gray" label={t("translation_missing")} />;
}
