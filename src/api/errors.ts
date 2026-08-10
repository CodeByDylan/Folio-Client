import type { ProblemDetails } from "./generated";

export type FolioFailure =
	| "invalid"
	| "unauthorized"
	| "not-found"
	| "unavailable"
	| "unexpected"
	| "transport"
	| "contract";

const failuresByStatus: Readonly<Record<number, FolioFailure>> = {
	400: "invalid",
	401: "unauthorized",
	404: "not-found",
	503: "unavailable",
};

export interface FolioErrorContext {
	readonly resource: string;
	readonly status?: number;
	readonly problem?: ProblemDetails;
	readonly cause?: unknown;
}

export class FolioError extends Error {
	readonly failure: FolioFailure;
	readonly resource: string;
	readonly status: number | undefined;
	readonly problem: ProblemDetails | undefined;

	constructor(
		failure: FolioFailure,
		message: string,
		context: FolioErrorContext,
	) {
		super(message, { cause: context.cause });

		this.name = "FolioError";
		this.failure = failure;
		this.resource = context.resource;
		this.status = context.status;
		this.problem = context.problem;
	}
}

export function failureForStatus(status: number): FolioFailure {
	return failuresByStatus[status] ?? "unexpected";
}

export function isFolioError(error: unknown): error is FolioError {
	return error instanceof FolioError;
}

export function hasFailure(
	error: unknown,
	failure: FolioFailure,
): error is FolioError {
	return isFolioError(error) && error.failure === failure;
}
