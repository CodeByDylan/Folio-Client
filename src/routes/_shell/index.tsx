import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPage } from "#/api/server";
import { PageBody } from "#/components/page-body";
import { shellBoundaries } from "#/components/page-boundaries";
import { requested } from "#/lib/loaders";

export const Route = createFileRoute("/_shell/")({
	loader: async ({ parentMatchPromise }) => {
		const parent = await parentMatchPromise;
		const home = parent.loaderData?.site.pages.find((page) => page.home);

		if (home === undefined) {
			throw notFound();
		}

		return requested(getPage({ data: { slug: home.slug } }));
	},
	...shellBoundaries,
	component: Home,
});

function Home() {
	return <PageBody page={Route.useLoaderData()} />;
}
