import { Icon } from "@astryxdesign/core/Icon";
import {
	SegmentedControl,
	SegmentedControlItem,
} from "@astryxdesign/core/SegmentedControl";
import {
	ComputerDesktopIcon,
	MoonIcon,
	SunIcon,
} from "@heroicons/react/24/outline";
import type { Translate } from "#/lib/strings";
import { type ThemeMode, themeModes } from "#/lib/theme";
import { useThemeMode } from "#/lib/theme-mode";

const icons: Readonly<Record<ThemeMode, typeof SunIcon>> = {
	system: ComputerDesktopIcon,
	light: SunIcon,
	dark: MoonIcon,
};

const labels = {
	system: "theme_system",
	light: "theme_light",
	dark: "theme_dark",
} as const;

export interface ModeSelectorProps {
	readonly t: Translate;
}

export function ModeSelector({ t }: ModeSelectorProps) {
	const { mode, setMode } = useThemeMode();

	return (
		<SegmentedControl
			label={t("appearance")}
			size="sm"
			value={mode}
			onChange={(value) => setMode(value as ThemeMode)}
		>
			{themeModes.map((each) => (
				<SegmentedControlItem
					key={each}
					value={each}
					label={t(labels[each])}
					isLabelHidden
					icon={<Icon icon={icons[each]} size="xsm" />}
				/>
			))}
		</SegmentedControl>
	);
}
