import { z } from "zod";

const branding = z.object({
	VITE_APP_NAME: z.string().min(1).default("Folio"),
	VITE_APP_LOGO: z.string().min(1).default("/images/logo.svg"),
});

const parsed = branding.parse(import.meta.env);

export const app = {
	name: parsed.VITE_APP_NAME,
	logo: parsed.VITE_APP_LOGO,
} as const;
