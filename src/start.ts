import { createMiddleware, createStart } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

// Documents and server functions both vary by the reader's locale and theme cookies,
// so neither may be held in a shared cache. Hashed assets are served outside this path.
const uncachedResponse = createMiddleware({ type: "request" }).server(
	({ next }) => {
		setResponseHeader("cache-control", "private, no-store");

		return next();
	},
);

export const startInstance = createStart(() => ({
	requestMiddleware: [uncachedResponse],
}));
