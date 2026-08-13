import type { z } from "zod";
import type {
	zGetProjectResponse,
	zGetSiteResponse,
	zListProjectsResponse,
} from "./generated/zod.gen";

export type Site = z.infer<typeof zGetSiteResponse>;
export type SitePage = Site["pages"][number];
export type ProjectIndex = z.infer<typeof zListProjectsResponse>;
export type Project = z.infer<typeof zGetProjectResponse>;

export type ProjectSummary = ProjectIndex["projects"][number];

export type ProjectStatus = NonNullable<Project["status"]>;

export type ProvenanceEntries = Project["provenance"];
