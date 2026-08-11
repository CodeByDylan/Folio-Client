import { Heading } from "@astryxdesign/core/Heading";
import { VStack } from "@astryxdesign/core/VStack";
import {
	createFileRoute,
	getRouteApi,
	notFound,
	redirect,
} from "@tanstack/react-router";
import { createProvenance, hasFailure, type Page } from "#/api";
import { getPage } from "#/api/server";
import { PageError, PageMissing } from "#/components/page-boundaries";
import { PageSections } from "#/components/page-sections";
import { NoContent, PageSkeleton } from "#/components/states";
import { translator } from "#/lib/strings";

const layout = getRouteApi("/_shell");

export const Route = createFileRoute("/_shell/$")({
	loader: async ({ params }) => {
		const slug = params._splat ?? "";

		// A page slug is one segment; anything deeper names no page Folio can serve.
		if (slug === "" || slug.includes("/")) {
			throw notFound();
		}

		let page: Page;

		try {
			page = (await getPage({ data: { slug } })).value;
		} catch (error) {
			if (hasFailure(error, "not-found") || hasFailure(error, "invalid")) {
				throw notFound();
			}

			throw error;
		}

		// The home page is canonically `/`, so its slug must not serve a second copy.
		if (page.home) {
			throw redirect({ to: "/" });
		}

		return page;
	},
	pendingComponent: PageSkeleton,
	errorComponent: ({ reset }) => <PageError reset={reset} />,
	notFoundComponent: () => <PageMissing />,
	component: ContentPage,
});

function ContentPage() {
	const { site } = layout.useLoaderData();
	const page = Route.useLoaderData();
	const t = translator(site.strings);

	return (
		<VStack gap={8} maxWidth={980}>
			{page.navLabel ? (
				<Heading level={1} type="display-2">
					{page.navLabel}
				</Heading>
			) : null}

			<PageSections
				sections={page.sections}
				provenance={createProvenance(page.provenance)}
				t={t}
				empty={<NoContent t={t} />}
			/>
		</VStack>
	);
}
