import type { z } from "zod";
import {
	zGetProjectResponse,
	zGetSiteResponse,
	zListProjectsResponse,
} from "./generated/zod.gen";
import { zPage } from "./sections";

/** Every resource Folio serves. Adding one starts and mostly ends here. */
export const resources = {
	site: {
		path: () => "/v1/site",
		schema: zGetSiteResponse,
	},
	page: {
		path: (slug: string) => `/v1/pages/${encodeURIComponent(slug)}`,
		schema: zPage,
	},
	projects: {
		path: () => "/v1/projects",
		schema: zListProjectsResponse,
	},
	project: {
		path: (slug: string) => `/v1/projects/${encodeURIComponent(slug)}`,
		schema: zGetProjectResponse,
	},
} as const;

export type ResourceName = keyof typeof resources;

/** What naming this resource requires — nothing, or the slug of the one wanted. */
export type ResourceArgs<TName extends ResourceName> = Parameters<
	(typeof resources)[TName]["path"]
>;

export type ResourceOf<TName extends ResourceName> = z.infer<
	(typeof resources)[TName]["schema"]
>;
