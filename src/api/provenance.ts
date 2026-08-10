import type { ProvenanceEntry } from "./generated";
import type { ProvenanceEntries } from "./model";

export type PointerSegment = string | number;

function encode(segment: PointerSegment): string {
	return String(segment).replaceAll("~", "~0").replaceAll("/", "~1");
}

export function pointer(...segments: ReadonlyArray<PointerSegment>): string {
	return segments.map((segment) => `/${encode(segment)}`).join("");
}

export interface Provenance {
	at(...segments: ReadonlyArray<PointerSegment>): ProvenanceEntry | undefined;
	isFallback(...segments: ReadonlyArray<PointerSegment>): boolean;
}

export function createProvenance(entries: ProvenanceEntries): Provenance {
	const at = (
		...segments: ReadonlyArray<PointerSegment>
	): ProvenanceEntry | undefined => entries[pointer(...segments)];

	return {
		at,
		isFallback: (...segments) => at(...segments) !== undefined,
	};
}
