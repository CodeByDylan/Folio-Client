/** The locale a visitor asked for, and the means to forget a stored choice. */
export interface LocaleStore {
	stored(): string | undefined;
	accepted(): string | undefined;
	forget(): void;
}

const tag = /^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;

/** Reads the first well-formed tag from an accept-language header. */
export function negotiate(header: string | undefined): string | undefined {
	const first = header?.split(",")[0]?.split(";")[0]?.trim();

	return first !== undefined && tag.test(first) ? first : undefined;
}
