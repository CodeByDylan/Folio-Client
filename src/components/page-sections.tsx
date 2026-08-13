import { Divider } from "@astryxdesign/core/Divider";
import { Fragment, type ReactNode } from "react";
import type { Deliver } from "#/api/message";
import type { ProjectSummary } from "#/api/model";
import { indexed, type Provenance } from "#/api/provenance";
import {
	hasContent,
	type KnownSection,
	type PageSection,
	type SectionType,
} from "#/api/sections";
import { Contact } from "#/components/contact";
import { Hero } from "#/components/hero";
import { Projects } from "#/components/projects";
import { Prose } from "#/components/prose";
import { Questions } from "#/components/questions";
import { Skills } from "#/components/skills";
import { useDevWarnings } from "#/lib/dev-warnings";
import type { Translate } from "#/lib/strings";

export interface PageSectionsProps {
	readonly sections: ReadonlyArray<PageSection>;
	readonly projects: ReadonlyArray<ProjectSummary>;
	readonly provenance: Provenance;
	readonly t: Translate;
	readonly send: Deliver;
	readonly empty?: ReactNode;
}

/** What every section renderer may draw on, whether or not it needs all of it. */
interface SectionContext {
	readonly projects: ReadonlyArray<ProjectSummary>;
	readonly provenance: Provenance;
	readonly t: Translate;
	readonly send: Deliver;
}

type Renderers = {
	readonly [K in SectionType]: (
		section: Extract<KnownSection, { type: K }>,
		context: SectionContext,
	) => ReactNode;
};

/** One renderer per section type the contract knows; the compiler holds them level. */
const renderers: Renderers = {
	hero: (section, { provenance, t }) => (
		<Hero section={section} provenance={provenance} t={t} />
	),
	projects: (section, { projects, t }) => (
		<Projects section={section} projects={projects} t={t} />
	),
	contact: (section, { t, send }) => (
		<Contact section={section} t={t} send={send} />
	),
	qa: (section, { provenance, t }) => (
		<Questions section={section} provenance={provenance} t={t} />
	),
	skills: (section, { t }) => <Skills section={section} t={t} />,
	prose: (section, { provenance, t }) => (
		<Prose body={section.body ?? ""} provenance={provenance} t={t} />
	),
};

/** Renders a page's sections in declaration order, a divider between each pair. */
export function PageSections({
	sections,
	projects,
	provenance,
	t,
	send,
	empty,
}: PageSectionsProps) {
	useDevWarnings(
		sections
			.filter((section) => section.type === "unknown")
			.map(
				(section) =>
					`Section '${section.id}' has type '${section.declared}', which this client does not render.`,
			),
	);

	const rendered = indexed(sections, hasContent).map(
		({ item: section, index }) => ({
			id: section.id,
			node: render(section, {
				projects,
				provenance: provenance.section(index),
				t,
				send,
			}),
		}),
	);

	if (rendered.length === 0) {
		return empty ?? null;
	}

	return (
		<>
			{rendered.map((entry, index) => (
				<Fragment key={entry.id}>
					{index > 0 ? <Divider /> : null}
					{entry.node}
				</Fragment>
			))}
		</>
	);
}

function render(section: PageSection, context: SectionContext): ReactNode {
	if (section.type === "unknown") {
		return null;
	}

	// TypeScript cannot correlate the key with its own section type here.
	const renderer = renderers[section.type] as (
		section: KnownSection,
		context: SectionContext,
	) => ReactNode;

	return renderer(section, context);
}
