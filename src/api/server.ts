import { createServerFn } from "@tanstack/react-start";
import {
	deleteCookie,
	getCookie,
	getRequestHeader,
	setCookie,
} from "@tanstack/react-start/server";
import { z } from "zod";
import { env } from "#/env";
import { createFolioClient, type FolioClient } from "./client";
import { hasFailure } from "./errors";
import type { Project, ProjectIndex, Site } from "./model";
import type { Page } from "./sections";

export const localeCookie = "folio.locale";
export const themeCookie = "folio.theme-mode";

const themeModes = ["system", "light", "dark"] as const;

export type ThemeMode = (typeof themeModes)[number];

function folio(): FolioClient {
	return createFolioClient({ baseUrl: env.FOLIO_API_URL });
}

function negotiated(): string | undefined {
	const header = getRequestHeader("accept-language");
	const first = header?.split(",")[0]?.split(";")[0]?.trim();

	return first !== undefined &&
		/^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(first)
		? first
		: undefined;
}

export interface Resolved<T> {
	readonly value: T;
	readonly localeRejected: boolean;
}

/** Reads the cookie, then the browser, then lets the API serve its default. */
async function resolve<T>(
	call: (locale?: string) => Promise<T>,
): Promise<Resolved<T>> {
	const chosen = getCookie(localeCookie);
	const candidate = chosen ?? negotiated();

	if (candidate !== undefined) {
		try {
			return { value: await call(candidate), localeRejected: false };
		} catch (error) {
			if (!hasFailure(error, "invalid")) {
				throw error;
			}

			// A negotiated miss is ordinary; only a stored choice is worth reporting.
			if (chosen !== undefined) {
				deleteCookie(localeCookie, { path: "/" });

				return { value: await call(), localeRejected: true };
			}
		}
	}

	return { value: await call(), localeRejected: false };
}

export const getSite = createServerFn({ method: "GET" }).handler(
	(): Promise<Resolved<Site>> => resolve((locale) => folio().site(locale)),
);

export const getPage = createServerFn({ method: "GET" })
	.validator(z.object({ slug: z.string() }))
	.handler(
		({ data }): Promise<Resolved<Page>> =>
			resolve((locale) => folio().page(data.slug, locale)),
	);

export const getProjects = createServerFn({ method: "GET" }).handler(
	(): Promise<Resolved<ProjectIndex>> =>
		resolve((locale) => folio().projects(locale)),
);

export const getProject = createServerFn({ method: "GET" })
	.validator(z.object({ slug: z.string() }))
	.handler(
		({ data }): Promise<Resolved<Project>> =>
			resolve((locale) => folio().project(data.slug, locale)),
	);

export const setLocale = createServerFn({ method: "POST" })
	.validator(z.object({ locale: z.string() }))
	.handler(({ data }) => {
		setCookie(localeCookie, data.locale, {
			path: "/",
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 365,
		});
	});

export const getThemeMode = createServerFn({ method: "GET" }).handler(
	(): ThemeMode => {
		const stored = getCookie(themeCookie);

		return themeModes.includes(stored as ThemeMode)
			? (stored as ThemeMode)
			: "system";
	},
);

export const setThemeMode = createServerFn({ method: "POST" })
	.validator(z.object({ mode: z.enum(themeModes) }))
	.handler(({ data }) => {
		setCookie(themeCookie, data.mode, {
			path: "/",
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 365,
		});
	});
