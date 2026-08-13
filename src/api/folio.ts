import { createFolioClient } from "./client";
import { hasFailure } from "./errors";
import { type LocaleStore, negotiate } from "./locale";
import type { ResourceArgs, ResourceName, ResourceOf } from "./resources";

export interface Resolved<T> {
	readonly value: T;
	readonly localeRejected: boolean;
}

export interface Folio {
	read<TName extends ResourceName>(
		name: TName,
		...args: ResourceArgs<TName>
	): Promise<Resolved<ResourceOf<TName>>>;
}

export interface FolioOptions {
	readonly baseUrl: string;
	readonly locales: LocaleStore;
	readonly fetch?: typeof globalThis.fetch;
}

/** Every read of the portfolio, in the locale the visitor is owed. */
export function createFolio({ baseUrl, locales, fetch }: FolioOptions): Folio {
	const client = createFolioClient({ baseUrl, fetch });

	/** Reads the stored choice, then the browser, then lets the API serve its default. */
	async function resolve<T>(
		call: (locale?: string) => Promise<T>,
	): Promise<Resolved<T>> {
		const chosen = locales.stored();
		const candidate = chosen ?? negotiate(locales.accepted());

		if (candidate !== undefined) {
			try {
				return { value: await call(candidate), localeRejected: false };
			} catch (error) {
				if (!hasFailure(error, "invalid")) {
					throw error;
				}

				let value: T;

				// A 400 can mean anything; only a retry that succeeds proves the locale was it.
				try {
					value = await call();
				} catch {
					throw error;
				}

				// A negotiated miss is ordinary; only a stored choice is worth reporting.
				if (chosen !== undefined) {
					locales.forget();

					return { value, localeRejected: true };
				}

				return { value, localeRejected: false };
			}
		}

		return { value: await call(), localeRejected: false };
	}

	return {
		read: (name, ...args) =>
			resolve((locale) => client.read(name, locale, ...args)),
	};
}
