import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { app } from "#/lib/app";

export interface AppMarkProps {
	readonly size?: "sm" | "md";
}

// The design system has no wordmark component; this is the one raw <img> in the app.
export function AppMark({ size = "md" }: AppMarkProps) {
	const edge = size === "sm" ? 20 : 26;

	return (
		<HStack gap={2} align="center">
			<img src={app.logo} alt="" width={edge} height={edge} />
			<Text weight="semibold" size={size === "sm" ? "base" : "lg"}>
				{app.name}
			</Text>
		</HStack>
	);
}
