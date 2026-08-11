import { getRouteApi, useRouter } from "@tanstack/react-router";
import { Failure, NotFound } from "#/components/states";
import { translator } from "#/lib/strings";

const layout = getRouteApi("/_shell");

/** The error boundary shared by every page inside the shell. */
export function PageError({ reset }: { readonly reset: () => void }) {
	const { site } = layout.useLoaderData();

	return <Failure t={translator(site.strings)} onRetry={reset} />;
}

/** The not-found boundary shared by every page inside the shell. */
export function PageMissing() {
	const router = useRouter();
	const { site } = layout.useLoaderData();

	return (
		<NotFound
			t={translator(site.strings)}
			onHome={() => {
				void router.navigate({ to: "/" });
			}}
		/>
	);
}
