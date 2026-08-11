import { Divider } from "@astryxdesign/core/Divider";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { createFileRoute, getRouteApi, notFound } from "@tanstack/react-router";
import { createProvenance } from "#/api";
import { getPage } from "#/api/server";
import { PageError } from "#/components/page-boundaries";
import { PageSections } from "#/components/page-sections";
import { ProjectGrid } from "#/components/project-grid";
import { NoProjects } from "#/components/states";
import { translator } from "#/lib/strings";

const layout = getRouteApi("/_shell");

export const Route = createFileRoute("/_shell/")({
	loader: async ({ parentMatchPromise }) => {
		const parent = await parentMatchPromise;
		const home = parent.loaderData?.site.pages.find((page) => page.home);

		if (home === undefined) {
			throw notFound();
		}

		return (await getPage({ data: { slug: home.slug } })).value;
	},
	errorComponent: ({ reset }) => <PageError reset={reset} />,
	component: Home,
});

function Home() {
	const { site, projects } = layout.useLoaderData();
	const page = Route.useLoaderData();
	const t = translator(site.strings);

	const featured = projects.filter((project) => project.featured);

	return (
		<VStack gap={8} maxWidth={980}>
			<VStack gap={4}>
				<Heading level={1} type="display-2">
					{site.title}
				</Heading>
				<Text as="p" type="large" color="secondary">
					{site.tagline}
				</Text>
			</VStack>

			<PageSections
				sections={page.sections}
				provenance={createProvenance(page.provenance)}
				t={t}
			/>

			<VStack gap={5}>
				<Divider label={t("featured_work")} />
				{featured.length > 0 ? (
					<ProjectGrid projects={featured} />
				) : (
					<NoProjects t={t} />
				)}
			</VStack>
		</VStack>
	);
}
