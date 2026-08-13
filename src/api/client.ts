import type { z } from "zod";
import { FolioError, failureForStatus } from "./errors";
import { zProblemDetails } from "./generated/zod.gen";
import {
	type ResourceArgs,
	type ResourceName,
	type ResourceOf,
	resources,
} from "./resources";

export interface FolioClient {
	read<TName extends ResourceName>(
		name: TName,
		locale: string | undefined,
		...args: ResourceArgs<TName>
	): Promise<ResourceOf<TName>>;
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
	return {
		async read<TName extends ResourceName>(
			name: TName,
			locale: string | undefined,
			...args: ResourceArgs<TName>
		): Promise<ResourceOf<TName>> {
			const entry = resources[name];
			// The table pairs each path with its own arity; the union loses that pairing.
			const resource = (entry.path as (...rest: typeof args) => string)(
				...args,
			);

			let response: Response;

			try {
				response = await fetch(address(baseUrl, resource, { locale }), {
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

			let body: unknown;

			try {
				body = await response.json();
			} catch (cause) {
				throw new FolioError(
					"contract",
					`${resource} did not answer with JSON.`,
					{ resource, status: response.status, cause },
				);
			}

			// Same pairing the union loses: this entry's schema yields this name's type.
			return conform(entry.schema, body, resource) as ResourceOf<TName>;
		},
	};
}
