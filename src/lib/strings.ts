import type { ProjectStatus, Site } from "#/api/model";
import type { SkillLevel } from "#/api/sections";
import { defaultStrings, type StringKey } from "#/lib/defaults";

export type Strings = Site["strings"];

const astryxPrefix = "@astryx.";

/** A link the API names by type, which the strings may carry a label for. */
export interface LabelledLink {
	readonly type: string;
	readonly label?: string | null;
	readonly url: string;
}

/**
 * Reads the site's copy. Keys the client knows are closed; the two families the
 * wire leaves open fall back to something readable rather than to a key name.
 */
export interface Translate {
	(key: StringKey): string;
	status(status: ProjectStatus): string;
	skill(level: SkillLevel): string;
	locale(code: string): string;
	link(link: LabelledLink): string;
}

/** One lookup chain — the site's strings, then the built-in defaults. */
export function translator(strings: Strings): Translate {
	// `||` on purpose: a translation left blank means "nothing here", never a value.
	const raw = (key: string): string | undefined =>
		strings[key] || defaultStrings[key as StringKey];

	return Object.assign((key: StringKey) => raw(key) || key, {
		status: (status: ProjectStatus) => raw(`status_${status}`) || status,
		skill: (level: SkillLevel) => raw(`skill_${level}`) || level,
		locale: (code: string) => raw(`locale_${code}`) || code,
		link: (link: LabelledLink) =>
			link.label || raw(`link_${link.type}`) || link.url,
	});
}

/** The shell never loaded, so only the built-in defaults are available. */
export const fallbackTranslator: Translate = translator({});

export function astryxOverrides(
	strings: Strings,
	locale: string,
): Record<string, Record<string, string>> {
	const messages: Record<string, string> = {};

	for (const [key, value] of Object.entries(strings)) {
		if (key.startsWith(astryxPrefix)) {
			messages[key] = value;
		}
	}

	return Object.keys(messages).length > 0 ? { [locale]: messages } : {};
}
