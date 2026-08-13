import type { ProvenanceEntry } from "./generated";
import type { ProvenanceEntries } from "./model";

export type PointerSegment = string | number;

function encode(segment: PointerSegment): string {
	return String(segment).replaceAll("~", "~0").replaceAll("/", "~1");
}

export function pointer(...segments: ReadonlyArray<PointerSegment>): string {
	return segments.map((segment) => `/${encode(segment)}`).join("");
}

/** Says where a value came from, addressed relative to whatever it was scoped to. */
export interface Provenance {
	isFallback(...segments: ReadonlyArray<PointerSegment>): boolean;
	section(index: number): Provenance;
}

/** Pointers address the wire array, so each position is captured before anything is dropped. */
export function indexed<T>(
	items: ReadonlyArray<T>,
	keep: (item: T) => boolean,
): ReadonlyArray<{ readonly item: T; readonly index: number }> {
	return items
		.map((item, index) => ({ item, index }))
		.filter((entry) => keep(entry.item));
}

export function createProvenance(entries: ProvenanceEntries): Provenance {
	const at = (path: string): ProvenanceEntry | undefined => entries[path];

	const scope = (prefix: ReadonlyArray<PointerSegment>): Provenance => ({
		isFallback: (...segments) =>
			at(pointer(...prefix, ...segments))?.fallback === true,
		section: (index) => scope([...prefix, "sections", index]),
	});

	return scope([]);
}
