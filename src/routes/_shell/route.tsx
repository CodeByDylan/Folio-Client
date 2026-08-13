import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import {
	createFileRoute,
	Outlet,
	useLocation,
	useRouter,
} from "@tanstack/react-router";
import { getProjects, getSite } from "#/api/server";
import { bareBoundaries } from "#/components/page-boundaries";
import { SiteShell } from "#/components/shell/site-shell";
import { PageSkeleton } from "#/components/states";
import { useDevWarnings } from "#/lib/dev-warnings";
import { navigation } from "#/lib/navigation";
import { shadowedPages } from "#/lib/routing";
import { useShell } from "#/lib/shell";
import { astryxOverrides } from "#/lib/strings";

export const Route = createFileRoute("/_shell")({
	loader: async () => {
		const [site, index] = await Promise.all([getSite(), getProjects()]);

		return {
			site: site.value,
			projects: index.value.projects,
			localeRejected: site.localeRejected,
		};
	},
	...bareBoundaries,
	pendingComponent: PageSkeleton,
	component: ShellLayout,
});

function ShellLayout() {
	const { site, projects, localeRejected, t } = useShell();
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
				navigation={navigation(site, projects, pathname)}
				localeRejected={localeRejected}
				t={t}
			>
				<Outlet />
			</SiteShell>
		</InternationalizationProvider>
	);
}
