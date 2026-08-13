import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { getPage } from "#/api/server";
import { PageBody } from "#/components/page-body";
import { shellBoundaries } from "#/components/page-boundaries";
import { requested } from "#/lib/loaders";

export const Route = createFileRoute("/_shell/$")({
	loader: async ({ params }) => {
		const slug = params._splat ?? "";

		// A page slug is one segment; anything deeper names no page Folio can serve.
		if (slug === "" || slug.includes("/")) {
			throw notFound();
		}

		const page = await requested(getPage({ data: { slug } }));

		// The home page is canonically `/`, so its slug must not serve a second copy.
		if (page.home) {
			throw redirect({ to: "/" });
		}

		return page;
	},
	...shellBoundaries,
	component: ContentPage,
});

function ContentPage() {
	return <PageBody page={Route.useLoaderData()} />;
}
