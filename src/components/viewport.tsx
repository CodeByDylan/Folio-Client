import { useAppShellMobile } from "@astryxdesign/core/AppShell";
import type { ReactNode } from "react";

export interface ViewportProps {
	readonly when: "wide" | "narrow";
	readonly children: ReactNode;
}

export function Viewport({ when, children }: ViewportProps): ReactNode {
	const { isMobile } = useAppShellMobile();

	return isMobile === (when === "narrow") ? children : null;
}
