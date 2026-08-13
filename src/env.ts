import "@tanstack/react-start/server-only";
import { z } from "zod";
import { configuration } from "#/lib/configuration";

const environment = z.object({
	FOLIO_API_URL: z.url(),
	// Optional so the site runs without a mail provider; the contact form reports it is unconfigured.
	RESEND_API_KEY: z.string().min(1).optional(),
	CONTACT_TO: z.email().optional(),
	CONTACT_FROM: z.email().optional(),
});

export type Environment = z.infer<typeof environment>;

/** The mail settings, named once here and read structurally by the delivery path. */
export type MailEnvironment = Pick<
	Environment,
	"RESEND_API_KEY" | "CONTACT_TO" | "CONTACT_FROM"
>;

export const env = configuration("environment", environment, () => process.env);
