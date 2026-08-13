import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { app } from "#/lib/app";

// The design system has no wordmark component; this is the one raw <img> in the app.
export function AppMark() {
	const { name, logo } = app();

	return (
		<HStack gap={2} align="center">
			<img src={logo} alt="" width={26} height={26} />
			<Text weight="semibold" size="lg">
				{name}
			</Text>
		</HStack>
	);
}
