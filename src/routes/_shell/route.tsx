import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import {
	createFileRoute,
	Outlet,
	useLocation,
	useRouter,
} from "@tanstack/react-router";
import { getProjects, getSite } from "#/api/server";
import { BarePage } from "#/components/bare-page";
import { SiteShell } from "#/components/shell/site-shell";
import { Failure, NotFound, PageSkeleton } from "#/components/states";
import { useDevWarnings } from "#/lib/dev-warnings";
import { shadowedPages } from "#/lib/routing";
import { astryxOverrides, fallbackTranslator, translator } from "#/lib/strings";

export const Route = createFileRoute("/_shell")({
	loader: async () => {
		const [site, index] = await Promise.all([getSite(), getProjects()]);

		return {
			site: site.value,
			projects: index.value.projects,
			localeRejected: site.localeRejected,
		};
	},
	pendingComponent: PageSkeleton,
	errorComponent: ({ reset }) => (
		<BarePage>
			<Failure t={fallbackTranslator} onRetry={reset} />
		</BarePage>
	),
	notFoundComponent: () => (
		<BarePage>
			<NotFound
				t={fallbackTranslator}
				onHome={() => {
					window.location.href = "/";
				}}
			/>
		</BarePage>
	),
	component: ShellLayout,
});

function ShellLayout() {
	const { site, projects, localeRejected } = Route.useLoaderData();
	const { pathname } = useLocation();
	const router = useRouter();

	useDevWarnings(
		shadowedPages(site.pages, Object.keys(router.routesByPath)).map(
			(slug) =>
				`Page '${slug}' is unreachable: a file route already owns /${slug}.`,
		),
	);

	return (
		<InternationalizationProvider
			locale={site.locale}
			overrides={astryxOverrides(site.strings, site.locale)}
		>
			<SiteShell
				site={site}
				featured={projects.filter((project) => project.featured)}
				path={pathname}
				localeRejected={localeRejected}
				t={translator(site.strings)}
			>
				<Outlet />
			</SiteShell>
		</InternationalizationProvider>
	);
}
