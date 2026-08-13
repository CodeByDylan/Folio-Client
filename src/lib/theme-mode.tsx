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
import { setThemeMode } from "#/api/server";
import type { ThemeMode } from "#/lib/theme";

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
	const [seen, setSeen] = useState<ThemeMode>(initial);

	// The loader re-reads the cookie on invalidation; a changed cookie wins over local state.
	if (seen !== initial) {
		setSeen(initial);
		setModeState(initial);
	}

	const setMode = useCallback((next: ThemeMode) => {
		setModeState(next);
		// Persistence is best-effort; the optimistic mode stands either way.
		void setThemeMode({ data: { mode: next } }).catch(() => {});
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
