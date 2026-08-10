import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { env } from "#/env";
import { createFolioClient, type FolioClient } from "./client";

const localised = z.object({ locale: z.string().optional() });

const identified = localised.extend({ slug: z.string() });

const filtered = z.object({
	severity: z.enum(["info", "warning", "error"]).optional(),
	project: z.string().optional(),
});

function folio(): FolioClient {
	return createFolioClient({ baseUrl: env.FOLIO_API_URL });
}

export const getSite = createServerFn({ method: "GET" })
	.validator(localised)
	.handler(({ data }) => folio().site(data.locale));

export const getProjects = createServerFn({ method: "GET" })
	.validator(localised)
	.handler(({ data }) => folio().projects(data.locale));

export const getProject = createServerFn({ method: "GET" })
	.validator(identified)
	.handler(({ data }) => folio().project(data.slug, data.locale));

export const getDiagnostics = createServerFn({ method: "GET" })
	.validator(filtered)
	.handler(({ data }) => folio().diagnostics(data));
