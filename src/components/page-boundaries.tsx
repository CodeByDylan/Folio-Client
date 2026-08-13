import type { ErrorComponentProps } from "@tanstack/react-router";
import { BarePage } from "#/components/bare-page";
import { Failure, NotFound, PageSkeleton } from "#/components/states";
import { useShell } from "#/lib/shell";
import { fallbackTranslator } from "#/lib/strings";

/** The error boundary shared by every page inside the shell. */
export function PageError({ reset }: ErrorComponentProps) {
	const { t } = useShell();

	return <Failure t={t} onRetry={reset} />;
}

/** The not-found boundary shared by every page inside the shell. */
export function PageMissing() {
	const { t } = useShell();

	return <NotFound t={t} />;
}

/** Every state a content route inside the shell can be in, declared once. */
export const shellBoundaries = {
	pendingComponent: PageSkeleton,
	errorComponent: PageError,
	notFoundComponent: PageMissing,
};

/** The same, for the routes above the shell, where no site strings exist yet. */
export const bareBoundaries = {
	errorComponent: ({ reset }: ErrorComponentProps) => (
		<BarePage>
			<Failure t={fallbackTranslator} onRetry={reset} />
		</BarePage>
	),
	notFoundComponent: () => (
		<BarePage>
			<NotFound t={fallbackTranslator} />
		</BarePage>
	),
};
