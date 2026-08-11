import type { z } from "zod";
import type {
	zGetDiagnosticsResponse,
	zGetProjectResponse,
	zGetSiteResponse,
	zListProjectsResponse,
} from "./generated/zod.gen";

export type Site = z.infer<typeof zGetSiteResponse>;
export type SitePage = Site["pages"][number];
export type ProjectIndex = z.infer<typeof zListProjectsResponse>;
export type Project = z.infer<typeof zGetProjectResponse>;
export type Report = z.infer<typeof zGetDiagnosticsResponse>;

export type ProjectSummary = ProjectIndex["projects"][number];

export type Severity = NonNullable<Report["diagnostics"][number]["severity"]>;

export type ProvenanceEntries = Project["provenance"];
