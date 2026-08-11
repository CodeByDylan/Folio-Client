import { Link } from "@astryxdesign/core/Link";
import { VStack } from "@astryxdesign/core/VStack";
import type { ReactNode } from "react";
import { AppMark } from "#/components/app-mark";

export interface BarePageProps {
	readonly children: ReactNode;
}

/** A page rendered without the shell, for failures that prevent the site loading. */
export function BarePage({ children }: BarePageProps) {
	return (
		<VStack
			justify="center"
			align="center"
			gap={6}
			minHeight="90dvh"
			padding={6}
		>
			<Link href="/" isStandalone hasUnderline={false}>
				<AppMark />
			</Link>
			{children}
		</VStack>
	);
}
