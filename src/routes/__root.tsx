import { LinkProvider } from "@astryxdesign/core/Link";
import { pastelTheme } from "@dylandebeer/theme-pastel/built";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { getDocument } from "#/api/server";
import { bareBoundaries } from "#/components/page-boundaries";
import { RouterLink } from "#/components/router-link";
import { app } from "#/lib/app";
import { ThemeModeProvider } from "#/lib/theme-mode";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

const fonts =
	"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap";

export const Route = createRootRouteWithContext<MyRouterContext>()({
	loader: () => getDocument(),
	component: () => (
		<LinkProvider component={RouterLink}>
			<Outlet />
		</LinkProvider>
	),
	...bareBoundaries,
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: app().name },
		],
		links: [
			{ rel: "icon", href: app().logo, type: "image/svg+xml" },
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{ rel: "stylesheet", href: fonts },
			{ rel: "stylesheet", href: appCss },
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const { mode, locale } = Route.useLoaderData();

	return (
		<html
			lang={locale}
			className="min-h-full"
			data-astryx-theme={pastelTheme.name}
		>
			<head>
				<HeadContent />
			</head>
			<body className="min-h-full bg-body text-primary">
				<ThemeModeProvider initial={mode}>{children}</ThemeModeProvider>
				<TanStackDevtools
					config={{ position: "bottom-right" }}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
