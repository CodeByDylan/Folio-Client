import { Theme } from "@astryxdesign/core/theme";
import { pastelTheme } from "@dylandebeer/theme-pastel/built";
import {
	createContext,
	type ReactNode,
	use,
	useCallback,
	useMemo,
	useState,
} from "react";
import { setThemeMode, type ThemeMode } from "#/api/server";

export type { ThemeMode };

interface ThemeModeContextValue {
	readonly mode: ThemeMode;
	readonly setMode: (mode: ThemeMode) => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue>({
	mode: "system",
	setMode: () => undefined,
});

export function useThemeMode(): ThemeModeContextValue {
	return use(ThemeModeContext);
}

export interface ThemeModeProviderProps {
	readonly initial: ThemeMode;
	readonly children: ReactNode;
}

export function ThemeModeProvider({
	initial,
	children,
}: ThemeModeProviderProps) {
	const [mode, setModeState] = useState<ThemeMode>(initial);

	const setMode = useCallback((next: ThemeMode) => {
		setModeState(next);
		void setThemeMode({ data: { mode: next } });
	}, []);

	const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);

	return (
		<ThemeModeContext value={value}>
			<Theme theme={pastelTheme} mode={mode}>
				{children}
			</Theme>
		</ThemeModeContext>
	);
}
