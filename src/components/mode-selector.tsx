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
import { type ThemeMode, useThemeMode } from "#/lib/theme-mode";

export interface ModeSelectorProps {
	readonly label: string;
	readonly options: Readonly<Record<ThemeMode, string>>;
}

export function ModeSelector({ label, options }: ModeSelectorProps) {
	const { mode, setMode } = useThemeMode();

	return (
		<SegmentedControl
			label={label}
			size="sm"
			value={mode}
			onChange={(value) => setMode(value as ThemeMode)}
		>
			<SegmentedControlItem
				value="system"
				label={options.system}
				isLabelHidden
				icon={<Icon icon={ComputerDesktopIcon} size="xsm" />}
			/>
			<SegmentedControlItem
				value="light"
				label={options.light}
				isLabelHidden
				icon={<Icon icon={SunIcon} size="xsm" />}
			/>
			<SegmentedControlItem
				value="dark"
				label={options.dark}
				isLabelHidden
				icon={<Icon icon={MoonIcon} size="xsm" />}
			/>
		</SegmentedControl>
	);
}
