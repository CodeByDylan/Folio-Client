import type { Site } from "#/api";
import { defaultStrings } from "#/lib/defaults";

export type Strings = Site["strings"];

const astryxPrefix = "@astryx.";

export function translator(strings: Strings) {
	return (key: string) => strings[key] ?? defaultStrings[key] ?? key;
}

export type Translate = ReturnType<typeof translator>;

export const fallbackTranslator: Translate = (key) =>
	defaultStrings[key] ?? key;

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
