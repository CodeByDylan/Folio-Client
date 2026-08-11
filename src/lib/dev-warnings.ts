import { useEffect } from "react";

/** Logs single-line warnings in development only, once per distinct set. */
export function useDevWarnings(messages: ReadonlyArray<string>): void {
	// Joined so re-rendering with the same warnings does not log them again.
	const joined = messages.join("\n");

	useEffect(() => {
		if (import.meta.env.DEV && joined !== "") {
			for (const message of joined.split("\n")) {
				console.warn(message);
			}
		}
	}, [joined]);
}
