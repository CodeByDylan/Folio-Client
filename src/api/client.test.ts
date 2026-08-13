import { describe, expect, it, vi } from "vitest";
import { createFolioClient } from "./client";
import { FolioError } from "./errors";

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

const ok = (body: unknown) =>
	new Response(JSON.stringify(body), {
		status: 200,
		headers: { "content-type": "application/json" },
	});

const raw = (status: number, body: string) =>
	new Response(body, {
		status,
		headers: { "content-type": "application/json" },
	});

const failed = (status: number, body?: unknown) =>
	body === undefined
		? raw(status, "not json at all")
		: raw(status, JSON.stringify(body));

/** Records the URL each call was made against and answers with whatever is queued. */
function transport(...responses: ReadonlyArray<Response | Error>) {
	const calls: Array<string> = [];
	let next = 0;

	const fetch = vi.fn(async (input: RequestInfo | URL) => {
		calls.push(String(input));

		const answer = responses[Math.min(next++, responses.length - 1)];

		if (answer instanceof Error) {
			throw answer;
		}

		return answer as Response;
	});

	return { calls, fetch: fetch as unknown as typeof globalThis.fetch };
}

describe("addressing the api", () => {
	it("joins a base url that has no trailing slash", async () => {
		const { calls, fetch } = transport(ok(site));

		await createFolioClient({
			baseUrl: "https://folio.test/api",
			fetch,
		}).read("site", undefined);

		expect(calls[0]).toBe("https://folio.test/api/v1/site");
	});

	it("does not double the slash on a base url that has one", async () => {
		const { calls, fetch } = transport(ok(site));

		await createFolioClient({
			baseUrl: "https://folio.test/api/",
			fetch,
		}).read("site", undefined);

		expect(calls[0]).toBe("https://folio.test/api/v1/site");
	});

	it("omits a locale nobody asked for", async () => {
		const { calls, fetch } = transport(ok(site));

		await createFolioClient({ baseUrl: "https://folio.test", fetch }).read(
			"site",
			undefined,
		);

		expect(calls[0]).not.toContain("locale");
	});

	it("carries a locale that was asked for", async () => {
		const { calls, fetch } = transport(ok(site));

		await createFolioClient({ baseUrl: "https://folio.test", fetch }).read(
			"site",
			"nl",
		);

		expect(calls[0]).toBe("https://folio.test/v1/site?locale=nl");
	});

	it("encodes a slug that would otherwise change the path", async () => {
		const { calls, fetch } = transport(failed(404, {}));

		await expect(
			createFolioClient({ baseUrl: "https://folio.test", fetch }).read(
				"project",
				undefined,
				"a/b",
			),
		).rejects.toThrow();

		expect(calls[0]).toBe("https://folio.test/v1/projects/a%2Fb");
	});
});

describe("reading a response", () => {
	const client = (...responses: ReadonlyArray<Response | Error>) =>
		createFolioClient({
			baseUrl: "https://folio.test",
			fetch: transport(...responses).fetch,
		});

	it("returns the body the contract promised", async () => {
		await expect(
			client(ok(site)).read("site", undefined),
		).resolves.toMatchObject({ locale: "en" });
	});

	it("calls an unreachable api a transport failure", async () => {
		const error = await client(new TypeError("connection refused"))
			.read("site", undefined)
			.catch((thrown: unknown) => thrown);

		expect(error).toBeInstanceOf(FolioError);
		expect(error).toMatchObject({ failure: "transport", resource: "/v1/site" });
	});

	it("calls a body that breaks the contract a contract failure", async () => {
		const error = await client(ok({ locale: 7 }))
			.read("site", undefined)
			.catch((thrown: unknown) => thrown);

		expect(error).toMatchObject({ failure: "contract" });
	});

	// A 200 that is not JSON breaks the contract exactly as a 200 of the wrong shape does.
	it("calls a success that is not json a contract failure", async () => {
		const error = await client(raw(200, "<html>maintenance</html>"))
			.read("site", undefined)
			.catch((thrown: unknown) => thrown);

		expect(error).toBeInstanceOf(FolioError);
		expect(error).toMatchObject({ failure: "contract", status: 200 });
	});

	it("maps the statuses the api documents", async () => {
		await expect(
			client(failed(400, {})).read("site", undefined),
		).rejects.toMatchObject({ failure: "invalid" });
		await expect(
			client(failed(404, {})).read("site", undefined),
		).rejects.toMatchObject({ failure: "not-found" });
		await expect(
			client(failed(503, {})).read("site", undefined),
		).rejects.toMatchObject({ failure: "unavailable" });
	});

	it("calls an undocumented status unexpected", async () => {
		await expect(
			client(failed(500, {})).read("site", undefined),
		).rejects.toMatchObject({ failure: "unexpected", status: 500 });
	});

	it("prefers the problem detail the api sent", async () => {
		const error = await client(
			failed(404, { title: "Not Found", detail: "No page named 'about'." }),
		)
			.read("page", undefined, "about")
			.catch((thrown: unknown) => thrown);

		expect((error as FolioError).message).toBe("No page named 'about'.");
	});

	it("falls back to the problem title when there is no detail", async () => {
		const error = await client(failed(404, { title: "Not Found" }))
			.read("site", undefined)
			.catch((thrown: unknown) => thrown);

		expect((error as FolioError).message).toBe("Not Found");
	});

	it("describes the failure itself when the body is not a problem at all", async () => {
		const error = await client(failed(502))
			.read("site", undefined)
			.catch((thrown: unknown) => thrown);

		expect((error as FolioError).message).toBe("/v1/site answered 502.");
	});
});
