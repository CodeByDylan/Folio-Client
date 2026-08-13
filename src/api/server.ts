import { createServerFn } from "@tanstack/react-start";
import {
	deleteCookie,
	getCookie,
	getRequestHeader,
	setCookie,
} from "@tanstack/react-start/server";
import { z } from "zod";
import { env } from "#/env";
import { type ThemeMode, themeModes } from "#/lib/theme";
import { createFolio, type Folio } from "./folio";
import { type LocaleStore, negotiate } from "./locale";

export const localeCookie = "folio.locale";
export const themeCookie = "folio.theme-mode";

const remembered = {
	path: "/",
	sameSite: "lax",
	maxAge: 60 * 60 * 24 * 365,
} as const;

/** Reads the request the handler is already inside, so one Folio serves every call. */
const requestLocales: LocaleStore = {
	stored: () => getCookie(localeCookie),
	accepted: () => getRequestHeader("accept-language"),
	forget: () => {
		deleteCookie(localeCookie, { path: remembered.path });
	},
};

let instance: Folio | undefined;

function folio(): Folio {
	instance ??= createFolio({
		baseUrl: env().FOLIO_API_URL,
		locales: requestLocales,
	});

	return instance;
}

// One server function per resource, because each is its own RPC the client can call.
export const getSite = createServerFn({ method: "GET" }).handler(() =>
	folio().read("site"),
);

export const getPage = createServerFn({ method: "GET" })
	.validator(z.object({ slug: z.string() }))
	.handler(({ data }) => folio().read("page", data.slug));

export const getProjects = createServerFn({ method: "GET" }).handler(() =>
	folio().read("projects"),
);

export const getProject = createServerFn({ method: "GET" })
	.validator(z.object({ slug: z.string() }))
	.handler(({ data }) => folio().read("project", data.slug));

export const setLocale = createServerFn({ method: "POST" })
	.validator(z.object({ locale: z.string() }))
	.handler(({ data }) => {
		setCookie(localeCookie, data.locale, remembered);
	});

const mode = z.enum(themeModes);

/** What the document needs before any page: the visitor's theme and language. */
export const getDocument = createServerFn({ method: "GET" }).handler(() => {
	const stored = mode.safeParse(getCookie(themeCookie));

	return {
		mode: stored.success ? stored.data : ("system" as ThemeMode),
		// The Site later confirms the true locale; this is the same request signal it uses.
		locale:
			requestLocales.stored() ?? negotiate(requestLocales.accepted()) ?? "en",
	};
});

export const setThemeMode = createServerFn({ method: "POST" })
	.validator(z.object({ mode }))
	.handler(({ data }) => {
		setCookie(themeCookie, data.mode, remembered);
	});
