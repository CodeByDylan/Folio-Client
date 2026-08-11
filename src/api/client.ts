import type { z } from "zod";
import { FolioError, failureForStatus } from "./errors";
import {
	zGetDiagnosticsResponse,
	zGetProjectResponse,
	zGetSiteResponse,
	zListProjectsResponse,
	zProblemDetails,
} from "./generated/zod.gen";
import type { Project, ProjectIndex, Report, Severity, Site } from "./model";
import { type Page, zPage } from "./sections";

export interface DiagnosticsQuery {
	readonly severity?: Severity;
	readonly project?: string;
}

export interface FolioClient {
	site(locale?: string): Promise<Site>;
	page(slug: string, locale?: string): Promise<Page>;
	projects(locale?: string): Promise<ProjectIndex>;
	project(slug: string, locale?: string): Promise<Project>;
	diagnostics(query?: DiagnosticsQuery): Promise<Report>;
}

export interface FolioClientOptions {
	readonly baseUrl: string;
	readonly fetch?: typeof globalThis.fetch;
}

type QueryParameters = Readonly<Record<string, string | undefined>>;

function address(
	baseUrl: string,
	resource: string,
	parameters: QueryParameters,
): URL {
	const base = new URL(baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
	const url = new URL(resource.replace(/^\/+/, ""), base);

	for (const [name, value] of Object.entries(parameters)) {
		if (value !== undefined) {
			url.searchParams.set(name, value);
		}
	}

	return url;
}

async function rejection(
	response: Response,
	resource: string,
): Promise<FolioError> {
	const body = await response.json().catch(() => undefined);
	const problem = zProblemDetails.safeParse(body);
	const detail = problem.success
		? (problem.data.detail ?? problem.data.title)
		: undefined;

	return new FolioError(
		failureForStatus(response.status),
		detail ?? `${resource} answered ${response.status}.`,
		{
			resource,
			status: response.status,
			problem: problem.success ? problem.data : undefined,
		},
	);
}

function conform<TSchema extends z.ZodType>(
	schema: TSchema,
	body: unknown,
	resource: string,
): z.infer<TSchema> {
	const result = schema.safeParse(body);

	if (!result.success) {
		throw new FolioError(
			"contract",
			`${resource} does not match the published contract.`,
			{ resource, cause: result.error },
		);
	}

	return result.data;
}

export function createFolioClient({
	baseUrl,
	fetch = globalThis.fetch,
}: FolioClientOptions): FolioClient {
	async function read<TSchema extends z.ZodType>(
		resource: string,
		schema: TSchema,
		parameters: QueryParameters = {},
	): Promise<z.infer<TSchema>> {
		let response: Response;

		try {
			response = await fetch(address(baseUrl, resource, parameters), {
				headers: { accept: "application/json" },
			});
		} catch (cause) {
			throw new FolioError("transport", `${resource} is unreachable.`, {
				resource,
				cause,
			});
		}

		if (!response.ok) {
			throw await rejection(response, resource);
		}

		return conform(schema, await response.json(), resource);
	}

	return {
		site: (locale) => read("/v1/site", zGetSiteResponse, { locale }),
		page: (slug, locale) =>
			read(`/v1/pages/${encodeURIComponent(slug)}`, zPage, { locale }),
		projects: (locale) =>
			read("/v1/projects", zListProjectsResponse, { locale }),
		project: (slug, locale) =>
			read(`/v1/projects/${encodeURIComponent(slug)}`, zGetProjectResponse, {
				locale,
			}),
		diagnostics: (query = {}) =>
			read("/v1/diagnostics", zGetDiagnosticsResponse, {
				severity: query.severity,
				project: query.project,
			}),
	};
}
