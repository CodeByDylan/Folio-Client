import { VStack } from "@astryxdesign/core/VStack";
import type { ComponentProps, ReactNode } from "react";

type Gap = ComponentProps<typeof VStack>["gap"];

export interface PageColumnProps {
	readonly gap?: Gap;
	readonly maxWidth?: number;
	readonly children: ReactNode;
}

/** The centred column every page's content sits in. */
export function PageColumn({
	gap = 6,
	maxWidth = 980,
	children,
}: PageColumnProps) {
	return (
		<VStack width="100%" hAlign="center">
			<VStack width="100%" maxWidth={maxWidth} gap={gap}>
				{children}
			</VStack>
		</VStack>
	);
}
