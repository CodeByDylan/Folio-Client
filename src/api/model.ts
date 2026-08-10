import type { z } from "zod";
import type {
	zGetDiagnosticsResponse,
	zGetProjectResponse,
	zGetSiteResponse,
	zListProjectsResponse,
} from "./generated/zod.gen";

export type Site = z.infer<typeof zGetSiteResponse>;
export type ProjectIndex = z.infer<typeof zListProjectsResponse>;
export type Project = z.infer<typeof zGetProjectResponse>;
export type Report = z.infer<typeof zGetDiagnosticsResponse>;

export type SiteLink = Site["links"][number];
export type SitePage = Site["sections"][number];

export type ProjectSummary = ProjectIndex["projects"][number];
export type Section = Project["sections"][number];
export type Tag = Project["tags"][number];
export type Link = Project["links"][number];
export type Relation = Project["relations"][number];
export type Media = Project["media"][number];
export type Metadata = Project["metadata"];
export type Release = Metadata["releases"][number];
export type Language = Metadata["languages"][number];

export type Diagnostic = Report["diagnostics"][number];
export type Severity = NonNullable<Diagnostic["severity"]>;

export type ProvenanceEntries = Project["provenance"];
export type Locale = Site["locale"];
