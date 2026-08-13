import { describe, expect, it, vi } from "vitest";
import { createFolio } from "./folio";
import type { LocaleStore } from "./locale";
import { negotiate } from "./locale";

const site = {
	requestedLocale: "en",
	locale: "en",
	url: "https://folio.test",
	defaultLocale: "en",
	locales: ["en"],
	links: [],
	pages: [],
	strings: {},
	provenance: {},
};

/** Answers every locale but the ones it was told to refuse. */
function api(...refused: ReadonlyArray<string>) {
	const locales: Array<string | null> = [];

	const fetch = vi.fn(async (input: RequestInfo | URL) => {
		const asked = new URL(String(input)).searchParams.get("locale");

		locales.push(asked);

		if (asked !== null && refused.includes(asked)) {
			return new Response(JSON.stringify({ title: "Bad Request" }), {
				status: 400,
			});
		}

		return new Response(JSON.stringify(site), { status: 200 });
	});

	return { locales, fetch: fetch as unknown as typeof globalThis.fetch };
}

function store(stored?: string, accepted?: string) {
	let current = stored;
	const forget = vi.fn(() => {
		current = undefined;
	});

	const locales: LocaleStore = {
		stored: () => current,
		accepted: () => accepted,
		forget,
	};

	return { locales, forget };
}

describe("negotiating a locale from the browser", () => {
	it("takes the first tag the visitor named", () => {
		expect(negotiate("nl-NL,nl;q=0.9,en;q=0.8")).toBe("nl-NL");
	});

	it("drops the quality it was weighted with", () => {
		expect(negotiate("de;q=0.7")).toBe("de");
	});

	it("refuses anything that is not a language tag", () => {
		expect(negotiate("*")).toBeUndefined();
		expect(negotiate("not a locale")).toBeUndefined();
	});

	it("has nothing to say without a header", () => {
		expect(negotiate(undefined)).toBeUndefined();
	});
});

describe("resolving the locale a visitor is owed", () => {
	const folio = (locales: LocaleStore, fetch: typeof globalThis.fetch) =>
		createFolio({ baseUrl: "https://folio.test", locales, fetch });

	it("lets the api choose when nothing is stored or offered", async () => {
		const { locales, fetch } = api();
		const jar = store();

		const resolved = await folio(jar.locales, fetch).read("site");

		expect(locales).toEqual([null]);
		expect(resolved.localeRejected).toBe(false);
	});

	it("asks for the stored choice first", async () => {
		const { locales, fetch } = api();
		const jar = store("nl", "de");

		await folio(jar.locales, fetch).read("site");

		expect(locales).toEqual(["nl"]);
	});

	it("falls back to what the browser offered", async () => {
		const { locales, fetch } = api();
		const jar = store(undefined, "de-AT,de;q=0.9");

		await folio(jar.locales, fetch).read("site");

		expect(locales).toEqual(["de-AT"]);
	});

	it("forgets a stored choice the api rejects and says so", async () => {
		const { locales, fetch } = api("nl");
		const jar = store("nl");

		const resolved = await folio(jar.locales, fetch).read("site");

		expect(locales).toEqual(["nl", null]);
		expect(jar.forget).toHaveBeenCalledOnce();
		expect(resolved.localeRejected).toBe(true);
	});

	// A negotiated miss is ordinary, so nothing is stored to forget and nobody is told.
	it("retries a rejected browser locale quietly", async () => {
		const { locales, fetch } = api("de");
		const jar = store(undefined, "de");

		const resolved = await folio(jar.locales, fetch).read("site");

		expect(locales).toEqual(["de", null]);
		expect(jar.forget).not.toHaveBeenCalled();
		expect(resolved.localeRejected).toBe(false);
	});

	// A 400 with a locale might be a bad slug; only a retry that succeeds blames the locale.
	it("keeps the stored choice when the request fails without it too", async () => {
		const fetch = vi.fn(
			async () =>
				new Response(JSON.stringify({ title: "Bad Request" }), { status: 400 }),
		) as unknown as typeof globalThis.fetch;
		const jar = store("nl");

		await expect(folio(jar.locales, fetch).read("site")).rejects.toMatchObject({
			failure: "invalid",
		});
		expect(jar.forget).not.toHaveBeenCalled();
	});

	it("does not retry a failure that has nothing to do with the locale", async () => {
		const fetch = vi.fn(
			async () => new Response("{}", { status: 503 }),
		) as unknown as typeof globalThis.fetch;
		const jar = store("nl");

		await expect(folio(jar.locales, fetch).read("site")).rejects.toMatchObject({
			failure: "unavailable",
		});
		expect(jar.forget).not.toHaveBeenCalled();
	});
});
