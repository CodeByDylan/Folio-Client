import { z } from "zod";
import { configuration } from "#/lib/configuration";

const branding = z.object({
	VITE_APP_NAME: z.string().min(1).default("Folio"),
	VITE_APP_LOGO: z.string().min(1).default("/images/logo.svg"),
});

const read = configuration("branding", branding, () => import.meta.env);

export function app(): { readonly name: string; readonly logo: string } {
	const parsed = read();

	return { name: parsed.VITE_APP_NAME, logo: parsed.VITE_APP_LOGO };
}
