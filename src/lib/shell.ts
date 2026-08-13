import { getRouteApi } from "@tanstack/react-router";
import { translator } from "#/lib/strings";

const shellRoute = getRouteApi("/_shell");

/** The shell's data and its translator, so no page has to derive one for itself. */
export function useShell() {
	const { site, projects, localeRejected } = shellRoute.useLoaderData();

	return { site, projects, localeRejected, t: translator(site.strings) };
}
